import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize MemoryStore
const MemoryStore = createMemoryStore(session);

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
  
  const storageConfig = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      cb(null, uploadsDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize multer
  await initMulter();
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });
  app.use("/uploads", express.static(uploadsDir));

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
  
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

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
        user: { id: user.id, username: user.username }
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
      user: { id: user.id, username: user.username }
    });
  });

  // Change password
  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
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

  // Upload image to media library
  app.post("/api/media", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
    try {
      console.log("📤 Media upload request received");
      console.log("File:", req.file);
      console.log("Session userId:", req.session.userId);
      
      if (!req.file) {
        console.log("❌ No file in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Get image dimensions if it's an image
      let width: string | undefined;
      let height: string | undefined;
      
      if (req.file.mimetype.startsWith('image/')) {
        try {
          const sizeOf = (await import('image-size')).default;
          const dimensions = sizeOf(req.file.path);
          width = dimensions.width?.toString();
          height = dimensions.height?.toString();
          console.log("📐 Image dimensions:", width, "x", height);
        } catch (e) {
          // If image-size fails, continue without dimensions
          console.warn("Could not get image dimensions:", e);
        }
      }

      // Save to media library
      const mediaItem = await storage.createMedia({
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size.toString(),
        width,
        height,
        alt: "",
        caption: "",
        uploadedBy: req.session.userId,
      });

      console.log("✅ Media item created:", mediaItem.id);
      res.status(201).json(mediaItem);
    } catch (error) {
      console.error("❌ Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
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

      // Delete file from disk
      const filePath = path.join(uploadsDir, mediaItem.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
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
  app.post("/api/upload", requireAuth, upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ 
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
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
      console.log("Bulk upload request received");
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        console.log("Invalid content:", typeof content);
        return res.status(400).json({ message: "File content is required" });
      }
      
      console.log(`Processing ${content.split('\n').length} lines`);

      const lines = content.split('\n').filter(line => line.trim());
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          // Parse CSV line: City, State, Category, Visit Date, Name
          const parts = line.split(',').map(part => part.trim());
          
          if (parts.length < 5) {
            results.failed++;
            results.errors.push(`Line ${i + 1}: Invalid format - expected 5 fields, got ${parts.length}`);
            continue;
          }

          const [city, state, categoryRaw, visitDate, name] = parts;

          // Normalize category: convert to lowercase and replace spaces with hyphens
          const category = categoryRaw
            .toLowerCase()
            .replace(/\s+/g, '-')
            .trim();

          // Validate category
          const validCategories = ['muffler-men', 'worlds-largest', 'unique-finds'];
          if (!validCategories.includes(category)) {
            results.failed++;
            results.errors.push(`Line ${i + 1}: Invalid category "${categoryRaw}" - must be one of: Muffler Men, World's Largest, Unique Finds`);
            continue;
          }

          // Parse date from MM/DD/YYYY format
          let taggedDate = '';
          try {
            const dateParts = visitDate.split('/');
            if (dateParts.length === 3) {
              const [month, day, year] = dateParts;
              // Convert to ISO format YYYY-MM-DD
              taggedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
              throw new Error('Invalid date format');
            }
          } catch (dateError) {
            results.failed++;
            results.errors.push(`Line ${i + 1}: Invalid date format "${visitDate}" - expected MM/DD/YYYY`);
            continue;
          }

          // Create location with default values for required fields
          const locationData = {
            name,
            city,
            state,
            category,
            taggedDate,
            latitude: 0, // Default - to be updated manually
            longitude: 0, // Default - to be updated manually
            photoUrl: '', // Default - to be updated manually
            photoId: '', // Default - to be updated manually
            zipCode: '',
            customFields: '{}',
          };

          await storage.createLocation(locationData);
          results.success++;
        } catch (error) {
          results.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Line ${i + 1}: ${errorMsg}`);
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
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
