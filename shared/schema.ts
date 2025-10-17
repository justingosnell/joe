import { sql } from "drizzle-orm";
import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const locations = sqliteTable("locations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  latitude: real("latitude").default(0),
  longitude: real("longitude").default(0),
  category: text("category").notNull(),
  state: text("state").notNull(),
  city: text("city").default(""),
  zipCode: text("zip_code").default(""),
  photoUrl: text("photo_url").notNull(),
  photoId: text("photo_id").notNull(),
  taggedDate: text("tagged_date").notNull(),
  description: text("description").default(""),
  customFields: text("custom_fields").default("{}"),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
}).extend({
  latitude: z.number().optional().default(0),
  longitude: z.number().optional().default(0),
  customFields: z.string().optional().default("{}"),
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Media Library Schema
export const media = sqliteTable("media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: text("size").notNull(), // Store as string to avoid integer overflow
  width: text("width"),
  height: text("height"),
  alt: text("alt").default(""),
  caption: text("caption").default(""),
  uploadedAt: text("uploaded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  uploadedBy: text("uploaded_by").references(() => users.id),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  uploadedAt: true,
});

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

// Settings Schema
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text("updated_by").references(() => users.id),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  updatedAt: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Categories Schema
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").default(""),
  icon: text("icon").default("📍"),
  color: text("color").default("#f97316"), // Default orange color
  displayOrder: real("display_order").default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
