import { type User, type InsertUser, type Location, type InsertLocation, type Media, type InsertMedia, type Setting, type InsertSetting, type Category, type InsertCategory, users, locations, media, settings, categories } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<boolean>;
  
  // Location methods
  getAllLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: string): Promise<boolean>;
  
  // Media methods
  getAllMedia(): Promise<Media[]>;
  getMedia(id: string): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: string, updates: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
  
  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private locations: Map<string, Location>;
  private media: Map<string, Media>;
  private settings: Map<string, Setting>;
  private categories: Map<string, Category>;

  constructor() {
    this.users = new Map();
    this.locations = new Map();
    this.media = new Map();
    this.settings = new Map();
    this.categories = new Map();
    this.seedDefaultAdmin();
    this.seedDefaultCategories();
    this.seedMockLocations();
  }

  // Seed default admin account
  private async seedDefaultAdmin() {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await this.createUser({ username: "admin", password: hashedPassword });
      console.log("✓ Default admin account created (username: admin, password: admin123)");
    }
  }

  // Seed default categories
  private seedDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      {
        name: "Muffler Men",
        slug: "muffler-men",
        description: "Giant fiberglass figures that once adorned muffler shops and gas stations",
        icon: "🗿",
        color: "#ef4444",
        displayOrder: 1,
      },
      {
        name: "World's Largest",
        slug: "worlds-largest",
        description: "Colossal monuments to American roadside excess",
        icon: "🎪",
        color: "#3b82f6",
        displayOrder: 2,
      },
      {
        name: "Unique Finds",
        slug: "unique-finds",
        description: "Peculiar treasures and oddities that defy categorization",
        icon: "✨",
        color: "#8b5cf6",
        displayOrder: 3,
      },
    ];

    defaultCategories.forEach((cat) => {
      const id = randomUUID();
      const now = new Date().toISOString();
      this.categories.set(id, { ...cat, id, createdAt: now, updatedAt: now });
    });
  }

  // Seed mock locations
  private seedMockLocations() {
    const mockLocations: InsertLocation[] = [
      {
        name: "Giant Muffler Man - Wilmington",
        latitude: 41.3083,
        longitude: -88.1467,
        category: "muffler-men",
        state: "Illinois",
        city: "Wilmington",
        zipCode: "60481",
        photoUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
        photoId: "fb_001",
        taggedDate: "2024-06-15",
        customFields: JSON.stringify({ material: "fiberglass", height: "28 feet" }),
      },
      {
        name: "World's Largest Ball of Twine",
        latitude: 39.2026,
        longitude: -98.4842,
        category: "worlds-largest",
        state: "Kansas",
        city: "Cawker City",
        zipCode: "67430",
        photoUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
        photoId: "fb_002",
        taggedDate: "2024-07-20",
        customFields: JSON.stringify({ weight: "17,400 pounds", creator: "Frank Stoeber" }),
      },
      {
        name: "Cowboy Muffler Man",
        latitude: 32.7767,
        longitude: -96.7970,
        category: "muffler-men",
        state: "Texas",
        city: "Dallas",
        zipCode: "75201",
        photoUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        photoId: "fb_003",
        taggedDate: "2024-08-10",
        customFields: JSON.stringify({ style: "western", accessories: "hat and boots" }),
      },
      {
        name: "World's Largest Thermometer",
        latitude: 35.5944,
        longitude: -116.0733,
        category: "worlds-largest",
        state: "California",
        city: "Baker",
        zipCode: "92309",
        photoUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        photoId: "fb_004",
        taggedDate: "2024-05-12",
        customFields: JSON.stringify({ height: "134 feet", location: "Baker" }),
      },
      {
        name: "Paul Bunyan Muffler Man",
        latitude: 44.8521,
        longitude: -93.2421,
        category: "muffler-men",
        state: "Minnesota",
        city: "St. Paul",
        zipCode: "55101",
        photoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        photoId: "fb_005",
        taggedDate: "2024-09-03",
        customFields: JSON.stringify({ companion: "Babe the Blue Ox", era: "1950s" }),
      },
      {
        name: "World's Largest Rocking Chair",
        latitude: 38.8183,
        longitude: -90.6906,
        category: "worlds-largest",
        state: "Missouri",
        city: "Fanning",
        zipCode: "63640",
        photoUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
        photoId: "fb_006",
        taggedDate: "2024-04-25",
        customFields: JSON.stringify({ height: "42 feet", material: "steel" }),
      },
      {
        name: "Uniroyal Gal Muffler Woman",
        latitude: 33.4484,
        longitude: -112.0740,
        category: "muffler-men",
        state: "Arizona",
        city: "Phoenix",
        zipCode: "85003",
        photoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        photoId: "fb_007",
        taggedDate: "2024-03-18",
        customFields: JSON.stringify({ gender: "female", brand: "Uniroyal" }),
      },
      {
        name: "World's Largest Catsup Bottle",
        latitude: 38.6270,
        longitude: -90.1994,
        category: "worlds-largest",
        state: "Illinois",
        city: "Collinsville",
        zipCode: "62234",
        photoUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
        photoId: "fb_008",
        taggedDate: "2024-10-05",
        customFields: JSON.stringify({ brand: "Brooks", height: "170 feet" }),
      },
      {
        name: "Gemini Giant Muffler Man",
        latitude: 41.1520,
        longitude: -88.1792,
        category: "muffler-men",
        state: "Illinois",
        city: "Wilmington",
        zipCode: "60481",
        photoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        photoId: "fb_009",
        taggedDate: "2024-02-14",
        customFields: JSON.stringify({ theme: "space", holding: "rocket" }),
      },
      {
        name: "World's Largest Mailbox",
        latitude: 41.2565,
        longitude: -95.9345,
        category: "worlds-largest",
        state: "Nebraska",
        city: "Casey",
        zipCode: "50048",
        photoUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
        photoId: "fb_010",
        taggedDate: "2024-01-22",
        customFields: JSON.stringify({ functional: "yes", color: "blue" }),
      },
      {
        name: "World's Largest Peanut",
        latitude: 33.4754,
        longitude: -84.4491,
        category: "worlds-largest",
        state: "Georgia",
        city: "Ashburn",
        zipCode: "31714",
        photoUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
        photoId: "fb_011",
        taggedDate: "2023-12-08",
        customFields: JSON.stringify({ type: "monument", material: "concrete" }),
      },
      {
        name: "Chicken Boy Muffler Man",
        latitude: 34.0522,
        longitude: -118.2437,
        category: "muffler-men",
        state: "California",
        city: "Los Angeles",
        zipCode: "90012",
        photoUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
        photoId: "fb_012",
        taggedDate: "2023-11-17",
        customFields: JSON.stringify({ head: "chicken", restaurant: "former" }),
      },
      {
        name: "Cadillac Ranch",
        latitude: 35.1872,
        longitude: -101.9871,
        category: "unique-finds",
        state: "Texas",
        city: "Amarillo",
        zipCode: "79124",
        photoUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        photoId: "fb_013",
        taggedDate: "2023-10-22",
        customFields: JSON.stringify({ type: "art installation", cars: "10 Cadillacs" }),
      },
      {
        name: "Mystery Spot",
        latitude: 37.0169,
        longitude: -122.0255,
        category: "unique-finds",
        state: "California",
        photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        photoId: "fb_014",
        taggedDate: "2023-09-15",
        customFields: JSON.stringify({ type: "gravitational anomaly", opened: "1939" }),
      },
      {
        name: "Coral Castle",
        latitude: 25.5007,
        longitude: -80.4428,
        category: "unique-finds",
        state: "Florida",
        photoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        photoId: "fb_015",
        taggedDate: "2023-08-30",
        customFields: JSON.stringify({ material: "coral rock", weight: "1,100 tons" }),
      },
    ];

    mockLocations.forEach((loc) => {
      const id = randomUUID();
      this.locations.set(id, { ...loc, id });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    this.users.set(id, user);
    return true;
  }

  // Location methods
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (!location) return undefined;
    
    const updatedLocation = { ...location, ...updates };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Media methods
  async getAllMedia(): Promise<Media[]> {
    return Array.from(this.media.values()).sort((a, b) => {
      // Sort by uploadedAt descending (newest first)
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }

  async getMedia(id: string): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const mediaItem: Media = {
      ...insertMedia,
      id,
      uploadedAt: new Date().toISOString(),
    };
    this.media.set(id, mediaItem);
    return mediaItem;
  }

  async updateMedia(id: string, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const mediaItem = this.media.get(id);
    if (!mediaItem) return undefined;
    
    const updatedMedia = { ...mediaItem, ...updates };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.media.delete(id);
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const setting: Setting = {
      ...insertSetting,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(setting.key, setting);
    return setting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => 
      (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = {
      ...category,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }
}

// Database Storage Implementation
export class DbStorage implements IStorage {
  constructor() {
    this.seedDefaultAdmin();
    this.seedDefaultCategories();
    this.seedMockLocations();
  }

  // Seed default admin account
  private async seedDefaultAdmin() {
    const existingAdmin = await this.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await this.createUser({ username: "admin", password: hashedPassword });
      console.log("✓ Default admin account created (username: admin, password: admin123)");
    }
  }

  // Seed default categories
  private async seedDefaultCategories() {
    const existingCategories = await this.getAllCategories();
    if (existingCategories.length > 0) return;

    const defaultCategories: InsertCategory[] = [
      {
        name: "Muffler Men",
        slug: "muffler-men",
        description: "Giant fiberglass figures that once adorned muffler shops and gas stations",
        icon: "🗿",
        color: "#ef4444",
        displayOrder: 1,
      },
      {
        name: "World's Largest",
        slug: "worlds-largest",
        description: "Colossal monuments to American roadside excess",
        icon: "🎪",
        color: "#3b82f6",
        displayOrder: 2,
      },
      {
        name: "Unique Finds",
        slug: "unique-finds",
        description: "Peculiar treasures and oddities that defy categorization",
        icon: "✨",
        color: "#8b5cf6",
        displayOrder: 3,
      },
    ];

    for (const cat of defaultCategories) {
      await this.createCategory(cat);
    }
  }

  // Seed mock locations
  private async seedMockLocations() {
    const existingLocations = await this.getAllLocations();
    if (existingLocations.length > 0) return;

    const mockLocations: InsertLocation[] = [
      {
        name: "Giant Muffler Man - Wilmington",
        latitude: 41.3083,
        longitude: -88.1467,
        category: "muffler-men",
        state: "Illinois",
        city: "Wilmington",
        zipCode: "60481",
        photoUrl: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
        photoId: "fb_001",
        taggedDate: "2024-06-15",
        customFields: JSON.stringify({ material: "fiberglass", height: "28 feet" }),
      },
      {
        name: "World's Largest Ball of Twine",
        latitude: 39.2026,
        longitude: -98.4842,
        category: "worlds-largest",
        state: "Kansas",
        city: "Cawker City",
        zipCode: "67430",
        photoUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800",
        photoId: "fb_002",
        taggedDate: "2024-07-20",
        customFields: JSON.stringify({ weight: "17,400 pounds", creator: "Frank Stoeber" }),
      },
      {
        name: "Cowboy Muffler Man",
        latitude: 32.7767,
        longitude: -96.7970,
        category: "muffler-men",
        state: "Texas",
        city: "Dallas",
        zipCode: "75201",
        photoUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        photoId: "fb_003",
        taggedDate: "2024-08-10",
        customFields: JSON.stringify({ style: "western", accessories: "hat and boots" }),
      },
      {
        name: "World's Largest Thermometer",
        latitude: 35.5944,
        longitude: -116.0733,
        category: "worlds-largest",
        state: "California",
        city: "Baker",
        zipCode: "92309",
        photoUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        photoId: "fb_004",
        taggedDate: "2024-05-12",
        customFields: JSON.stringify({ height: "134 feet", location: "Baker" }),
      },
      {
        name: "Paul Bunyan Muffler Man",
        latitude: 44.8521,
        longitude: -93.2421,
        category: "muffler-men",
        state: "Minnesota",
        city: "St. Paul",
        zipCode: "55101",
        photoUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
        photoId: "fb_005",
        taggedDate: "2024-09-03",
        customFields: JSON.stringify({ companion: "Babe the Blue Ox", era: "1950s" }),
      },
      {
        name: "World's Largest Rocking Chair",
        latitude: 38.8183,
        longitude: -90.6906,
        category: "worlds-largest",
        state: "Missouri",
        city: "Fanning",
        zipCode: "63640",
        photoUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800",
        photoId: "fb_006",
        taggedDate: "2024-04-25",
        customFields: JSON.stringify({ height: "42 feet", material: "steel" }),
      },
      {
        name: "Uniroyal Gal Muffler Woman",
        latitude: 33.4484,
        longitude: -112.0740,
        category: "muffler-men",
        state: "Arizona",
        city: "Phoenix",
        zipCode: "85003",
        photoUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        photoId: "fb_007",
        taggedDate: "2024-03-18",
        customFields: JSON.stringify({ gender: "female", brand: "Uniroyal" }),
      },
      {
        name: "World's Largest Catsup Bottle",
        latitude: 38.6270,
        longitude: -90.1994,
        category: "worlds-largest",
        state: "Illinois",
        city: "Collinsville",
        zipCode: "62234",
        photoUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
        photoId: "fb_008",
        taggedDate: "2024-10-05",
        customFields: JSON.stringify({ brand: "Brooks", height: "170 feet" }),
      },
      {
        name: "Gemini Giant Muffler Man",
        latitude: 41.1520,
        longitude: -88.1792,
        category: "muffler-men",
        state: "Illinois",
        city: "Wilmington",
        zipCode: "60481",
        photoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
        photoId: "fb_009",
        taggedDate: "2024-02-14",
        customFields: JSON.stringify({ theme: "space", holding: "rocket" }),
      },
      {
        name: "World's Largest Mailbox",
        latitude: 41.2565,
        longitude: -95.9345,
        category: "worlds-largest",
        state: "Nebraska",
        city: "Casey",
        zipCode: "50048",
        photoUrl: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800",
        photoId: "fb_010",
        taggedDate: "2024-01-22",
        customFields: JSON.stringify({ functional: "yes", color: "blue" }),
      },
      {
        name: "World's Largest Peanut",
        latitude: 33.4754,
        longitude: -84.4491,
        category: "worlds-largest",
        state: "Georgia",
        city: "Ashburn",
        zipCode: "31714",
        photoUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800",
        photoId: "fb_011",
        taggedDate: "2023-12-08",
        customFields: JSON.stringify({ type: "monument", material: "concrete" }),
      },
      {
        name: "Chicken Boy Muffler Man",
        latitude: 34.0522,
        longitude: -118.2437,
        category: "muffler-men",
        state: "California",
        city: "Los Angeles",
        zipCode: "90012",
        photoUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
        photoId: "fb_012",
        taggedDate: "2023-11-17",
        customFields: JSON.stringify({ head: "chicken", restaurant: "former" }),
      },
      {
        name: "Cadillac Ranch",
        latitude: 35.1872,
        longitude: -101.9871,
        category: "unique-finds",
        state: "Texas",
        city: "Amarillo",
        zipCode: "79124",
        photoUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        photoId: "fb_013",
        taggedDate: "2023-10-22",
        customFields: JSON.stringify({ type: "art installation", cars: "10 Cadillacs" }),
      },
      {
        name: "Mystery Spot",
        latitude: 37.0169,
        longitude: -122.0255,
        category: "unique-finds",
        state: "California",
        photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        photoId: "fb_014",
        taggedDate: "2023-09-15",
        customFields: JSON.stringify({ type: "gravitational anomaly", opened: "1939" }),
      },
      {
        name: "Coral Castle",
        latitude: 25.5007,
        longitude: -80.4428,
        category: "unique-finds",
        state: "Florida",
        photoUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        photoId: "fb_015",
        taggedDate: "2023-08-30",
        customFields: JSON.stringify({ material: "coral rock", weight: "1,100 tons" }),
      },
    ];

    for (const loc of mockLocations) {
      await this.createLocation(loc);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id))
      .returning();
    return result.length > 0;
  }

  // Location methods
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    return result[0];
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const result = await db.insert(locations).values(insertLocation).returning();
    return result[0];
  }

  async updateLocation(id: string, updates: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await db.update(locations)
      .set(updates)
      .where(eq(locations.id, id))
      .returning();
    return result[0];
  }

  async deleteLocation(id: string): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id)).returning();
    return result.length > 0;
  }

  // Media methods
  async getAllMedia(): Promise<Media[]> {
    const result = await db.select().from(media);
    // Sort by uploadedAt descending (newest first)
    return result.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }

  async getMedia(id: string): Promise<Media | undefined> {
    const result = await db.select().from(media).where(eq(media.id, id)).limit(1);
    return result[0];
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const result = await db.insert(media).values(insertMedia).returning();
    return result[0];
  }

  async updateMedia(id: string, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const result = await db.update(media)
      .set(updates)
      .where(eq(media.id, id))
      .returning();
    return result[0];
  }

  async deleteMedia(id: string): Promise<boolean> {
    const result = await db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0];
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    // Use INSERT OR REPLACE to update if exists
    const result = await db.insert(settings)
      .values({
        ...insertSetting,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value: insertSetting.value,
          updatedBy: insertSetting.updatedBy,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning();
    return result[0];
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.displayOrder));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db.update(categories)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
