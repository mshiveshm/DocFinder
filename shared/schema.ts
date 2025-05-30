import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
});

export const documentTypes = [
  "aadhaar",
  "pan",
  "passport",
  "driving_license",
  "voter_id",
  "other",
] as const;

export const lostDocuments = pgTable("lost_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(),
  nameOnDocument: text("name_on_document").notNull(),
  dateLost: timestamp("date_lost").notNull(),
  locationLost: text("location_lost").notNull(),
  description: text("description"),
  hasImage: boolean("has_image").default(false),
  imageUrl: text("image_url"),
  aiAnalysis: json("ai_analysis"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foundDocuments = pgTable("found_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(),
  dateFound: timestamp("date_found").notNull(),
  locationFound: text("location_found").notNull(),
  description: text("description"),
  hasImage: boolean("has_image").default(false),
  imageUrl: text("image_url"),
  aiAnalysis: json("ai_analysis"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentMatches = pgTable("document_matches", {
  id: serial("id").primaryKey(),
  lostDocumentId: integer("lost_document_id").notNull(),
  foundDocumentId: integer("found_document_id").notNull(),
  matchConfidence: integer("match_confidence").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  type: text("type").notNull(),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  // username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

export const insertLostDocumentSchema = createInsertSchema(lostDocuments).pick({
  userId: true,
  documentType: true,
  nameOnDocument: true,
  dateLost: true,
  locationLost: true,
  description: true,
  hasImage: true,
  imageUrl: true,
  aiAnalysis: true,
});

export const insertFoundDocumentSchema = createInsertSchema(foundDocuments).pick({
  userId: true,
  documentType: true,
  dateFound: true,
  locationFound: true,
  description: true,
  hasImage: true,
  imageUrl: true,
  aiAnalysis: true,
});

export const insertMatchSchema = createInsertSchema(documentMatches).pick({
  lostDocumentId: true,
  foundDocumentId: true,
  matchConfidence: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  message: true,
  type: true,
  relatedId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLostDocument = z.infer<typeof insertLostDocumentSchema>;
export type LostDocument = typeof lostDocuments.$inferSelect;

export type InsertFoundDocument = z.infer<typeof insertFoundDocumentSchema>;
export type FoundDocument = typeof foundDocuments.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof documentMatches.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"), // Changed from username
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
