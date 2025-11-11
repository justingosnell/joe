import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import helmet from "helmet";
import { storage, ensureStorageReady } from "./storage";
import { runMigrations, initializeDatabase } from "./db";
import { uploadFileToSupabase, getPublicUrl } from "./supabase-client";
import bcrypt from "bcrypt";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MemoryStore
const MemoryStore = createMemoryStore(session);

// XSS Protection: Sanitize user input to prevent XSS attacks
function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  // Remove potentially dangerous characters and escape HTML entities
  return input
    .replace(/[<>\"'&]/g, (char) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return entities[char] || char;
    })
    .trim();
}

// Extend session data type
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Configure multer for file uploads - using dynamic import
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let upload: any;
async function initMulter() {
  const multerModule = await import("multer");
  const multer = multerModule.default;
  
  // Use memory storage to store file in buffer instead of disk
  const storageConfig = multer.memoryStorage();

  upload = multer({
    storage: storageConfig,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
      }
    },
  });
}

// Helper function to compute file hash for deduplication from buffer
function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with IPv4 resolution
  console.log("\n🔌 Initializing database connection...");
  await initializeDatabase();
  console.log("✅ Database initialized\n");
  
  // Run migrations to ensure database schema is up to date
  await runMigrations();
  
  // Ensure storage is initialized before setting up routes
  await ensureStorageReady();
  
  // Initialize multer
  await initMulter();
  
  // Security: Add Helmet middleware to prevent XSS, clickjacking, and other attacks
  // This sets various HTTP headers for security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }));
  
  // Serve uploaded files statically

  // Session configuration
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "roadside-mapper-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true only if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      },
    })
  );

  // ============ Authentication Routes ============
  
  // Login with security features (account lockout, failed attempt tracking, XSS protection)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      let { username, password } = req.body;

      // Security: Validate and sanitize inputs
      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Valid username is required" });
      }
      
      if (!password || typeof password !== "string" || password.length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      // Sanitize username to prevent XSS attacks
      username = sanitizeInput(username);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        // Generic message to prevent username enumeration
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if account is locked (now requires 10 failed attempts instead of 5)
      if (user.isLocked === "true") {
        return res.status(403).json({
          message: "Account is locked due to too many failed login attempts. Please contact an administrator.",
        });
      }

      console.log(`🔐 Password comparison for user "${username}"`);
      console.log(`   Stored hash starts with: ${user.password?.substring(0, 15)}...`);
      console.log(`   Stored hash length: ${user.password?.length}`);
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log(`   Password match result: ${isValidPassword}`);
      if (!isValidPassword) {
        // Record failed login attempt (locks after 10 attempts)
        await storage.recordFailedLogin(user.id);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Reset failed login attempts on successful login
      await storage.resetFailedLogins(user.id);

      req.session.userId = user.id;
      
      // Save session before sending response to ensure it's persisted
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          mustChangePassword: user.mustChangePassword === "true",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check authentication status
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword === "true",
      },
    });
  });

  // Change password (users can only change their own password)
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Security: Validate passwords are required
      if (!currentPassword || typeof currentPassword !== "string" || currentPassword.length === 0) {
        return res.status(400).json({ message: "Current password is required" });
      }
      
      if (!newPassword || typeof newPassword !== "string" || newPassword.length === 0) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const success = await storage.updateUserPassword(user.id, newPassword);
      if (!success) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware to check if user is admin
  function requireAdmin(req: Request, res: Response, next: Function) {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // Will be checked in each endpoint after getting user details
    next();
  }

  // ============ User Management Routes (Admin Only) ============

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const users = await storage.getAllUsers();
      // Don't send password hashes
      const safeUsers = users.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        isLocked: u.isLocked === "true",
        failedLoginAttempts: parseInt(u.failedLoginAttempts || "0", 10),
        lastPasswordChange: u.lastPasswordChange,
        createdAt: u.createdAt,
        mustChangePassword: u.mustChangePassword === "true",
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      let { username, password, role } = req.body;

      // Security: Validate and sanitize username
      if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ message: "Valid username is required" });
      }
      
      if (!password || typeof password !== "string" || password.length === 0) {
        return res.status(400).json({ message: "Password is required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      if (role && !["admin", "manager"].includes(role)) {
        return res.status(400).json({ message: "Role must be either 'admin' or 'manager'" });
      }

      // Sanitize username to prevent XSS attacks
      username = sanitizeInput(username);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        role: (role as "admin" | "manager") || "manager",
      });

      // Mark new user to change password on first login
      await storage.setMustChangePassword(newUser.id);

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset user password (admin only)
  app.post("/api/admin/users/:userId/reset-password", requireAdmin, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent admin from resetting their own password via this endpoint
      if (userId === req.session.userId) {
        return res.status(400).json({
          message: "Use the change-password endpoint to reset your own password",
        });
      }

      const success = await storage.updateUserPassword(userId, newPassword);
      if (!success) {
        return res.status(500).json({ message: "Failed to reset password" });
      }

      // Mark user to change password on next login
      await storage.setMustChangePassword(userId);

      res.json({ message: "Password reset successfully. User must change it on next login." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lock user account (admin only)
  app.post("/api/admin/users/:userId/lock", requireAdmin, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { userId } = req.params;
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const success = await storage.lockUser(userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to lock user" });
      }

      res.json({ message: "User account locked successfully" });
    } catch (error) {
      console.error("Lock user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Unlock user account (admin only)
  app.post("/api/admin/users/:userId/unlock", requireAdmin, async (req: Request, res: Response) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const { userId } = req.params;
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const success = await storage.unlockUser(userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to unlock user" });
      }

      res.json({ message: "User account unlocked successfully" });
    } catch (error) {
      console.error("Unlock user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============ Media Library Routes (Admin Only) ============
  
  // Get all media
  app.get("/api/media", requireAuth, async (req: Request, res: Response) => {
    try {
      const media = await storage.getAllMedia();
      res.json(media);
    } catch (error) {
      console.error("Get media error:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Get single media item
  app.get("/api/media/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const mediaItem = await storage.getMedia(req.params.id);
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(mediaItem);
    } catch (error) {
      console.error("Get media error:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Serve image from database by ID (public endpoint)
  app.get("/api/image/:id", async (req: Request, res: Response) => {
    try {
      const mediaItem = await storage.getMedia(req.params.id);
      if (!mediaItem) {
        return res.status(404).json({ message: "Image not found" });
      }

      if (mediaItem.url) {
        return res.redirect(mediaItem.url);
      }

      if (mediaItem.data?.startsWith("data:")) {
        const parts = mediaItem.data.split(";base64,");
        if (parts.length === 2) {
          const mimeType = parts[0].replace("data:", "");
          const base64Data = parts[1];
          res.setHeader("Content-Type", mimeType);
          res.setHeader("Cache-Control", "public, max-age=31536000");
          res.send(Buffer.from(base64Data, "base64"));
          return;
        }
      }

      res.status(404).json({ message: "Image not found" });
    } catch (error) {
      console.error("Get image error:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  // Wrapper to handle multer errors
  const uploadMiddleware = (req: Request, res: Response, next: Function) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({ message: err.message || "File upload failed" });
      }
      next();
    });
  };

  // Upload image to media library
  app.post("/api/media", requireAuth, uploadMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("📤 Upload started:", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      const fileHash = computeFileHash(req.file.buffer);
      const storagePath = `media/${fileHash}-${Date.now()}-${req.file.originalname}`;
      
      console.log("🔑 Supabase config:", {
        url: process.env.SUPABASE_URL ? "✓" : "✗",
        key: process.env.SUPABASE_KEY ? "✓" : "✗",
        bucket: process.env.SUPABASE_BUCKET || "NOT SET",
      });

      try {
        console.log("📤 Uploading to Supabase...");
        await uploadFileToSupabase(
          process.env.SUPABASE_BUCKET!,
          storagePath,
          req.file.buffer,
          req.file.mimetype
        );
        console.log("✅ Supabase upload successful");
      } catch (uploadError) {
        console.error("❌ Failed to upload to Supabase:", {
          error: uploadError,
          message: uploadError instanceof Error ? uploadError.message : "Unknown",
          stack: uploadError instanceof Error ? uploadError.stack : undefined,
        });
        return res.status(500).json({
          message: "Failed to upload file to storage",
          error: uploadError instanceof Error ? uploadError.message : "Unknown error",
        });
      }

      const publicUrl = getPublicUrl(process.env.SUPABASE_BUCKET!, storagePath);

      console.log("💾 Creating media record in database...");
      const mediaItem = await storage.createMedia({
        filename: req.file.originalname,
        originalName: req.file.originalname,
        url: publicUrl,
        mimeType: req.file.mimetype,
        size: req.file.size.toString(),
        width: undefined,
        height: undefined,
        alt: "",
        caption: "",
        uploadedBy: req.session.userId,
      });

      console.log("✅ Media record created:", mediaItem.id);
      res.status(201).json(mediaItem);
    } catch (error) {
      console.error("❌ Upload error:", {
        error,
        message: error instanceof Error ? error.message : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMsg = error instanceof Error ? error.message : "Failed to upload file";
      res.status(500).json({ message: errorMsg });
    }
  });

  // Update media metadata
  app.put("/api/media/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { alt, caption } = req.body;
      const updates: Partial<any> = {};
      
      if (alt !== undefined) updates.alt = alt;
      if (caption !== undefined) updates.caption = caption;

      const mediaItem = await storage.updateMedia(req.params.id, updates);
      
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json(mediaItem);
    } catch (error) {
      console.error("Update media error:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  // Delete media
  app.delete("/api/media/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const mediaItem = await storage.getMedia(req.params.id);
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }

      // Delete from database (images now stored as base64 in DB, no disk files)
      const success = await storage.deleteMedia(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Delete media error:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Legacy upload endpoint (for backward compatibility)
  // Now stores images in database like the new /api/media endpoint
  app.post("/api/upload", requireAuth, uploadMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileHash = computeFileHash(req.file.buffer);
      const storagePath = `media/${fileHash}-${Date.now()}-${req.file.originalname}`;
      
      try {
        await uploadFileToSupabase(
          process.env.SUPABASE_BUCKET!,
          storagePath,
          req.file.buffer,
          req.file.mimetype
        );
      } catch (uploadError) {
        console.error("Failed to upload to Supabase:", uploadError);
        return res.status(500).json({
          message: "Failed to upload file to storage",
          error: uploadError instanceof Error ? uploadError.message : "Unknown error",
        });
      }

      const publicUrl = getPublicUrl(process.env.SUPABASE_BUCKET!, storagePath);

      const mediaItem = await storage.createMedia({
        filename: req.file.originalname,
        originalName: req.file.originalname,
        url: publicUrl,
        mimeType: req.file.mimetype,
        size: req.file.size.toString(),
        width: undefined,
        height: undefined,
        alt: "",
        caption: "",
        uploadedBy: req.session.userId,
      });

      res.json({ 
        url: mediaItem.url,
        filename: mediaItem.filename,
        originalName: mediaItem.originalName,
        size: mediaItem.size,
        id: mediaItem.id,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to upload file";
      res.status(500).json({ message: errorMsg });
    }
  });

  // ============ Admin Routes ============

  // Cleanup orphaned media files and duplicates (admin only)
  app.post("/api/admin/cleanup-media", requireAuth, async (req: Request, res: Response) => {
    try {
      const allMedia = await storage.getAllMedia();
      
      // Find duplicates by URL
      const urlMap = new Map<string, typeof allMedia>();
      const toDelete: string[] = [];
      
      for (const media of allMedia) {
        if (!urlMap.has(media.url)) {
          urlMap.set(media.url, media);
        } else {
          // This is a duplicate - mark it for deletion
          toDelete.push(media.id);
        }
      }
      
      // Delete all duplicates
      let deletedCount = 0;
      for (const mediaId of toDelete) {
        const success = await storage.deleteMedia(mediaId);
        if (success) deletedCount++;
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} duplicate media entries`);
      
      res.json({
        message: `Cleanup complete. Removed ${deletedCount} duplicate media entries.`,
        deletedCount,
        remainingCount: allMedia.length - deletedCount,
      });
    } catch (error) {
      console.error("❌ Cleanup error:", error);
      const errorMsg = error instanceof Error ? error.message : "Cleanup failed";
      res.status(500).json({ message: errorMsg });
    }
  });

  // Fix broken media URLs (admin only)
  app.post("/api/admin/fix-broken-urls", requireAuth, async (req: Request, res: Response) => {
    try {
      const allMedia = await storage.getAllMedia();
      
      // Find entries with undefined in URL
      const brokenMedia = allMedia.filter(m => m.url.includes("undefined"));
      console.log(`🔍 Found ${brokenMedia.length} entries with broken URLs`);
      
      if (brokenMedia.length === 0) {
        return res.json({
          message: "No broken URLs found",
          fixedCount: 0,
        });
      }
      
      // Fix each broken URL
      const supabaseUrl = process.env.SUPABASE_URL || "https://fpaxndekwubupxlubvxj.supabase.co";
      const bucket = process.env.SUPABASE_BUCKET || "imageStore";
      
      let fixedCount = 0;
      for (const item of brokenMedia) {
        // Extract the storage path from the broken URL
        // From: undefined/storage/v1/object/public/undefined/media/...
        // Extract: media/...
        const storagePathMatch = item.url.match(/media\/.*$/);
        if (!storagePathMatch) {
          console.log(`⚠️  Could not extract storage path from: ${item.url}`);
          continue;
        }
        
        const storagePath = storagePathMatch[0];
        const fixedUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
        
        try {
          const updated = await storage.updateMedia(item.id, { url: fixedUrl });
          if (updated) fixedCount++;
          console.log(`✓ Fixed: ${item.originalName}`);
        } catch (error) {
          console.error(`✗ Failed to fix ${item.id}:`, error);
        }
      }
      
      console.log(`✅ Fixed ${fixedCount} broken URLs!`);
      
      res.json({
        message: `Fixed ${fixedCount} broken URLs`,
        fixedCount,
        remainingCount: allMedia.length - fixedCount,
      });
    } catch (error) {
      console.error("❌ Fix error:", error);
      const errorMsg = error instanceof Error ? error.message : "Fix failed";
      res.status(500).json({ message: errorMsg });
    }
  });

  // Fix broken location photo URLs (admin only)
  app.post("/api/admin/fix-location-urls", requireAuth, async (req: Request, res: Response) => {
    try {
      const allLocations = await storage.getAllLocations();
      
      // Find entries with undefined in photoUrl
      const brokenLocations = allLocations.filter(l => l.photoUrl && l.photoUrl.includes("undefined"));
      console.log(`🔍 Found ${brokenLocations.length} locations with broken URLs`);
      
      if (brokenLocations.length === 0) {
        return res.json({
          message: "No broken location URLs found",
          fixedCount: 0,
        });
      }
      
      // Fix each broken URL
      const supabaseUrl = process.env.SUPABASE_URL || "https://fpaxndekwubupxlubvxj.supabase.co";
      const bucket = process.env.SUPABASE_BUCKET || "imageStore";
      
      let fixedCount = 0;
      for (const item of brokenLocations) {
        // Extract the storage path from the broken URL
        // From: undefined/storage/v1/object/public/undefined/media/...
        // Extract: media/...
        const storagePathMatch = item.photoUrl.match(/media\/.*$/);
        if (!storagePathMatch) {
          console.log(`⚠️  Could not extract storage path from: ${item.photoUrl}`);
          continue;
        }
        
        const storagePath = storagePathMatch[0];
        const fixedUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
        
        try {
          const updated = await storage.updateLocation(item.id, { photoUrl: fixedUrl });
          if (updated) fixedCount++;
          console.log(`✓ Fixed: ${item.name}`);
        } catch (error) {
          console.error(`✗ Failed to fix ${item.id}:`, error);
        }
      }
      
      console.log(`✅ Fixed ${fixedCount} location URLs!`);
      
      res.json({
        message: `Fixed ${fixedCount} location URLs`,
        fixedCount,
        remainingCount: allLocations.length - fixedCount,
      });
    } catch (error) {
      console.error("❌ Fix error:", error);
      const errorMsg = error instanceof Error ? error.message : "Fix failed";
      res.status(500).json({ message: errorMsg });
    }
  });

  // ============ Location Routes (Public) ============
  
  // Get all locations (public) with optional search
  app.get("/api/locations", async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.search as string | undefined;
      let locations = await storage.getAllLocations();
      
      // If search query is provided, filter locations
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        locations = locations.filter((location) => {
          // Search in name, category, state
          const nameMatch = location.name.toLowerCase().includes(query);
          const categoryMatch = location.category.toLowerCase().includes(query);
          const stateMatch = location.state.toLowerCase().includes(query);
          
          // Search in custom fields
          let customFieldsMatch = false;
          try {
            const customFields = JSON.parse(location.customFields || "{}");
            customFieldsMatch = Object.entries(customFields).some(([key, value]) => {
              const keyMatch = key.toLowerCase().includes(query);
              const valueMatch = String(value).toLowerCase().includes(query);
              return keyMatch || valueMatch;
            });
          } catch (e) {
            // Invalid JSON, skip custom fields search
          }
          
          return nameMatch || categoryMatch || stateMatch || customFieldsMatch;
        });
      }
      
      res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get single location (public)
  app.get("/api/locations/:id", async (req: Request, res: Response) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      console.error("Get location error:", error);
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // ============ Location Routes (Admin Only) ============
  
  // Create location
  app.post("/api/locations", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create location error:", error);
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  // Update location
  app.put("/api/locations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const updates = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(req.params.id, updates);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Update location error:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Delete location
  app.delete("/api/locations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteLocation(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      console.error("Delete location error:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Bulk upload locations from text file
  app.post("/api/locations/bulk-upload", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log("🔄 Bulk upload request received from user:", req.session.userId);
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        console.log("❌ Invalid content:", typeof content);
        return res.status(400).json({ message: "File content is required" });
      }
      
      const lines = content.split('\n').filter(line => line.trim());
      console.log(`📋 Processing ${lines.length} lines`);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Helper function to parse CSV line with quoted field support
      const parseCSVLine = (line: string): string[] => {
        const parts: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"';
              i++;
            } else {
              // Toggle quote mode
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());
        return parts;
      };

      // Helper function to validate coordinates
      const validateCoordinates = (lat: string | number, lon: string | number): boolean => {
        const latitude = parseFloat(String(lat));
        const longitude = parseFloat(String(lon));
        return !isNaN(latitude) && !isNaN(longitude) && 
               latitude >= -90 && latitude <= 90 && 
               longitude >= -180 && longitude <= 180;
      };

      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum].trim();
        if (!line) continue;

        try {
          // Parse CSV line with quoted field support
          // Format: City, State, Category, Visit Date, Name, [Latitude, Longitude, Photo URL, Description]
          const parts = parseCSVLine(line);
          
          if (parts.length < 5) {
            results.failed++;
            results.errors.push(`Line ${lineNum + 1}: Invalid format - expected minimum 5 fields, got ${parts.length}`);
            continue;
          }

          const [city, state, categoryRaw, visitDate, name] = parts;
          const latitude = parts[5] ? parseFloat(parts[5]) : 0;
          const longitude = parts[6] ? parseFloat(parts[6]) : 0;
          const photoUrl = parts[7] || '';
          const description = parts[8] || '';

          // Validate required fields
          if (!city || !state || !categoryRaw || !visitDate || !name) {
            results.failed++;
            results.errors.push(`Line ${lineNum + 1}: Missing required fields (City, State, Category, Date, Name)`);
            continue;
          }

          // Normalize category: convert to lowercase and replace spaces with hyphens
          const category = categoryRaw
            .toLowerCase()
            .replace(/\s+/g, '-')
            .trim();

          // Validate category
          const validCategories = ['muffler-men', 'worlds-largest', 'unique-finds'];
          if (!validCategories.includes(category)) {
            results.failed++;
            results.errors.push(`Line ${lineNum + 1}: Invalid category "${categoryRaw}" - must be one of: Muffler Men, World's Largest, Unique Finds`);
            continue;
          }

          // Parse and validate date from MM/DD/YYYY format
          let taggedDate = '';
          try {
            const dateParts = visitDate.split('/');
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
              const monthNum = parseInt(month);
              const dayNum = parseInt(day);
              const yearNum = parseInt(year);

              // Validate date values
              if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31 || yearNum < 1900 || yearNum > 2100) {
                throw new Error('Date values out of range');
              }

              // Convert to ISO format YYYY-MM-DD
              taggedDate = `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
              throw new Error('Unexpected format');
            }
          } catch (dateError) {
            results.failed++;
            results.errors.push(`Line ${lineNum + 1}: Invalid date format "${visitDate}" - expected MM/DD/YYYY`);
            continue;
          }

          // Validate coordinates if provided (not 0,0)
          if ((latitude !== 0 || longitude !== 0) && !validateCoordinates(latitude, longitude)) {
            results.failed++;
            results.errors.push(`Line ${lineNum + 1}: Invalid coordinates (${latitude}, ${longitude}) - Latitude must be -90 to 90, Longitude must be -180 to 180`);
            continue;
          }

          // Prepare metadata for migration tracking
          const customFields = JSON.stringify({
            _migrated_at: new Date().toISOString(),
            _migrated_by: req.session.userId,
            _source: 'bulk_upload',
          });

          // Create location with validated data
          const locationData = {
            name: name.substring(0, 255), // Limit name length
            city: city.substring(0, 100),
            state: state.substring(0, 10),
            category,
            taggedDate,
            latitude: latitude || 0,
            longitude: longitude || 0,
            photoUrl: photoUrl.substring(0, 500), // Allow longer URLs
            photoId: '', // Will be set separately if needed
            zipCode: '',
            description: description.substring(0, 1000), // Limit description length
            customFields,
          };

          await storage.createLocation(locationData);
          results.success++;
          console.log(`✅ Line ${lineNum + 1}: Created location "${name}"`);
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Line ${lineNum + 1}: ${errorMsg}`);
          console.warn(`⚠️ Line ${lineNum + 1} failed:`, errorMsg);
        }
      }

      console.log(`📊 Bulk upload complete: ${results.success} success, ${results.failed} failed`);
      res.json(results);
    } catch (error) {
      console.error("❌ Bulk upload error:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Bulk export locations
  app.get("/api/locations/bulk-export", requireAuth, async (req: Request, res: Response) => {
    try {
      const locations = await storage.getAllLocations();
      
      if (locations.length === 0) {
        return res.json({ message: "No locations to export" });
      }

      // Format: City, State, Category, Visit Date (MM/DD/YYYY), Name, Latitude, Longitude, Photo URL, Description
      const lines: string[] = [];
      
      for (const loc of locations) {
        // Convert ISO date (YYYY-MM-DD) to MM/DD/YYYY format
        let visitDate = '';
        try {
          if (loc.taggedDate) {
            const [year, month, day] = loc.taggedDate.split('-');
            visitDate = `${month}/${day}/${year}`;
          }
        } catch (e) {
          visitDate = loc.taggedDate || '';
        }

        // Escape and quote fields that might contain commas
        const escapeField = (field: string | null | undefined) => {
          if (!field) return '""';
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const line = [
          escapeField(loc.city),
          escapeField(loc.state),
          escapeField(loc.category),
          visitDate,
          escapeField(loc.name),
          loc.latitude || 0,
          loc.longitude || 0,
          escapeField(loc.photoUrl),
          escapeField(loc.description),
        ].join(', ');

        lines.push(line);
      }

      // Add header
      const header = 'City, State, Category, Visit Date (MM/DD/YYYY), Name, Latitude, Longitude, Photo URL, Description';
      const content = [header, ...lines].join('\n');

      // Send as file download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="locations-export.txt"');
      res.send(content);
    } catch (error) {
      console.error("Bulk export error:", error);
      res.status(500).json({ message: "Failed to export locations" });
    }
  });

  // ============ Settings Routes (Admin Only) ============
  
  // Get all settings (public - for logo display)
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const allSettings = await storage.getAllSettings();
      // Convert to key-value object for easier access
      const settingsObj = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(settingsObj);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Get single setting (public)
  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json({ key: setting.key, value: setting.value });
    } catch (error) {
      console.error("Get setting error:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  // Update setting (admin only)
  app.put("/api/settings/:key", requireAuth, async (req: Request, res: Response) => {
    try {
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }

      const setting = await storage.setSetting({
        key: req.params.key,
        value,
        updatedBy: req.session.userId,
      });

      res.json(setting);
    } catch (error) {
      console.error("Update setting error:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // ============ Category Routes ============
  
  // Get all categories (public)
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get single category (public)
  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Create category (admin only)
  app.post("/api/categories", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, slug, description, icon, color, displayOrder } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }

      // Check if slug already exists
      const existingCategory = await storage.getCategoryBySlug(slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }

      const category = await storage.createCategory({
        name,
        slug,
        description: description || "",
        icon: icon || "📍",
        color: color || "#f97316",
        displayOrder: displayOrder || 0,
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category (admin only)
  app.put("/api/categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, slug, description, icon, color, displayOrder } = req.body;
      const updates: Partial<any> = {};

      if (name !== undefined) updates.name = name;
      if (slug !== undefined) {
        // Check if slug is being changed and if new slug already exists
        const category = await storage.getCategory(req.params.id);
        if (category && category.slug !== slug) {
          const existingCategory = await storage.getCategoryBySlug(slug);
          if (existingCategory) {
            return res.status(400).json({ message: "Category with this slug already exists" });
          }
        }
        updates.slug = slug;
      }
      if (description !== undefined) updates.description = description;
      if (icon !== undefined) updates.icon = icon;
      if (color !== undefined) updates.color = color;
      if (displayOrder !== undefined) updates.displayOrder = displayOrder;

      const category = await storage.updateCategory(req.params.id, updates);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category (admin only)
  app.delete("/api/categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      // Check if any locations use this category
      const locations = await storage.getAllLocations();
      const category = await storage.getCategory(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const locationsUsingCategory = locations.filter(loc => loc.category === category.slug);
      if (locationsUsingCategory.length > 0) {
        return res.status(400).json({ 
          message: `Cannot delete category. ${locationsUsingCategory.length} location(s) are using this category.` 
        });
      }

      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
