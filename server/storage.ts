// import { 
//   users, type User, type InsertUser,
//   lostDocuments, type LostDocument, type InsertLostDocument,
//   foundDocuments, type FoundDocument, type InsertFoundDocument,
//   documentMatches, type Match, type InsertMatch,
//   notifications, type Notification, type InsertNotification
// } from "@shared/schema";
// import { db } from "./db";
// import { eq, and, like, desc, or } from "drizzle-orm";
// import session from "express-session";
// import connectPg from "connect-pg-simple";
// import createMemoryStore from "memorystore";
// import { pool } from "./db";

// const PostgresSessionStore = connectPg(session);
// const MemoryStore = createMemoryStore(session);

// export interface IStorage {
//   // Session store
//   sessionStore: session.Store;
//   // User operations
//   getUser(id: number): Promise<User | undefined>;
//   getUserByUsername(username: string): Promise<User | undefined>;
//   createUser(user: InsertUser): Promise<User>;
//   updateUser(id: number, userData: Partial<User>): Promise<User>;
//   updateUserPassword(id: number, password: string): Promise<void>;
  
//   // Lost document operations
//   createLostDocument(document: InsertLostDocument): Promise<LostDocument>;
//   getLostDocument(id: number): Promise<LostDocument | undefined>;
//   updateLostDocument(id: number, documentData: Partial<LostDocument>): Promise<LostDocument>;
//   getUserLostDocuments(userId: number): Promise<LostDocument[]>;
//   getLostDocuments(): Promise<LostDocument[]>;
//   searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]>;
  
//   // Found document operations
//   createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument>;
//   getFoundDocument(id: number): Promise<FoundDocument | undefined>;
//   updateFoundDocument(id: number, documentData: Partial<FoundDocument>): Promise<FoundDocument>;
//   getUserFoundDocuments(userId: number): Promise<FoundDocument[]>;
//   getFoundDocuments(): Promise<FoundDocument[]>;
//   searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]>;
  
//   // Match operations
//   createMatch(match: InsertMatch): Promise<Match>;
//   getMatch(id: number): Promise<Match | undefined>;
//   updateMatch(id: number, matchData: Partial<Match>): Promise<Match>;
//   getUserMatches(userId: number): Promise<Match[]>;
  
//   // Notification operations
//   createNotification(notification: InsertNotification): Promise<Notification>;
//   getNotification(id: number): Promise<Notification | undefined>;
//   updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification>;
//   getUserNotifications(userId: number): Promise<Notification[]>;
// }

// export class MemStorage implements IStorage {
//   private users: Map<number, User>;
//   private lostDocuments: Map<number, LostDocument>;
//   private foundDocuments: Map<number, FoundDocument>;
//   private matches: Map<number, Match>;
//   private notifications: Map<number, Notification>;
  
//   private userId: number = 1;
//   private lostDocumentId: number = 1;
//   private foundDocumentId: number = 1;
//   private matchId: number = 1;
//   private notificationId: number = 1;
  
//   sessionStore: session.Store;

//   constructor() {
//     this.users = new Map();
//     this.lostDocuments = new Map();
//     this.foundDocuments = new Map();
//     this.matches = new Map();
//     this.notifications = new Map();
//     this.sessionStore = new MemoryStore({
//       checkPeriod: 86400000 // One day cleanup
//     });
    
//     // Add some initial test data
//     this.createUser({
//       username: "user1",
//       password: "password1",
//       firstName: "John",
//       lastName: "Doe",
//       email: "john@example.com",
//     });
//   }

//   // USER OPERATIONS
  
//   async getUser(id: number): Promise<User | undefined> {
//     return this.users.get(id);
//   }

//   async getUserByUsername(username: string): Promise<User | undefined> {
//     console.log("Storage: looking up user with username:", username);
//     console.log("Storage: all users:", Array.from(this.users.values()).map(u => ({
//       id: u.id,
//       username: u.username,
//     })));
    
//     const user = Array.from(this.users.values()).find(
//       (user) => user.username === username
//     );
    
//     console.log("Storage: found user?", !!user);
//     if (user) {
//       console.log("Storage: found user details:", {
//         id: user.id,
//         username: user.username,
//       });
//     }
    
//     return user;
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     const id = this.userId++;
//     const createdAt = new Date();
//     const user: User = { 
//       ...insertUser, 
//       id,
//       firstName: insertUser.firstName || null,
//       lastName: insertUser.lastName || null
//     };
//     this.users.set(id, user);
//     return user;
//   }

//   async updateUser(id: number, userData: Partial<User>): Promise<User> {
//     const user = await this.getUser(id);
//     if (!user) {
//       throw new Error(`User with id ${id} not found`);
//     }
    
//     const updatedUser = { ...user, ...userData };
//     this.users.set(id, updatedUser);
//     return updatedUser;
//   }

//   async updateUserPassword(id: number, password: string): Promise<void> {
//     const user = await this.getUser(id);
//     if (!user) {
//       throw new Error(`User with id ${id} not found`);
//     }
    
//     this.users.set(id, { ...user, password });
//   }

//   // LOST DOCUMENT OPERATIONS
  
//   async createLostDocument(document: InsertLostDocument): Promise<LostDocument> {
//     const id = this.lostDocumentId++;
//     const createdAt = new Date();
//     const lostDocument: LostDocument = {
//       ...document,
//       id,
//       status: 'pending',
//       createdAt,
//       description: document.description || null,
//       hasImage: document.hasImage || false,
//       imageUrl: document.imageUrl || null,
//       aiAnalysis: document.aiAnalysis || null
//     };
//     this.lostDocuments.set(id, lostDocument);
//     return lostDocument;
//   }

//   async getLostDocument(id: number): Promise<LostDocument | undefined> {
//     return this.lostDocuments.get(id);
//   }

//   async updateLostDocument(id: number, documentData: Partial<LostDocument>): Promise<LostDocument> {
//     const document = await this.getLostDocument(id);
//     if (!document) {
//       throw new Error(`Lost document with id ${id} not found`);
//     }
    
//     const updatedDocument = { ...document, ...documentData };
//     this.lostDocuments.set(id, updatedDocument);
//     return updatedDocument;
//   }

//   async getUserLostDocuments(userId: number): Promise<LostDocument[]> {
//     return Array.from(this.lostDocuments.values()).filter(
//       (document) => document.userId === userId
//     );
//   }

//   async getLostDocuments(): Promise<LostDocument[]> {
//     return Array.from(this.lostDocuments.values());
//   }

//   async searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]> {
//     let results = Array.from(this.lostDocuments.values());
    
//     if (params.query) {
//       const query = params.query.toLowerCase();
//       results = results.filter(
//         (document) => 
//           document.description?.toLowerCase().includes(query) ||
//           document.nameOnDocument.toLowerCase().includes(query)
//       );
//     }
    
//     if (params.documentType) {
//       results = results.filter(
//         (document) => document.documentType === params.documentType
//       );
//     }
    
//     if (params.location) {
//       const location = params.location.toLowerCase();
//       results = results.filter(
//         (document) => document.locationLost.toLowerCase().includes(location)
//       );
//     }
    
//     return results;
//   }

//   // FOUND DOCUMENT OPERATIONS
  
//   async createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument> {
//     const id = this.foundDocumentId++;
//     const createdAt = new Date();
//     const foundDocument: FoundDocument = {
//       ...document,
//       id,
//       status: 'pending',
//       createdAt,
//       description: document.description || null,
//       hasImage: document.hasImage || false,
//       imageUrl: document.imageUrl || null,
//       aiAnalysis: document.aiAnalysis || null
//     };
//     this.foundDocuments.set(id, foundDocument);
//     return foundDocument;
//   }

//   async getFoundDocument(id: number): Promise<FoundDocument | undefined> {
//     return this.foundDocuments.get(id);
//   }

//   async updateFoundDocument(id: number, documentData: Partial<FoundDocument>): Promise<FoundDocument> {
//     const document = await this.getFoundDocument(id);
//     if (!document) {
//       throw new Error(`Found document with id ${id} not found`);
//     }
    
//     const updatedDocument = { ...document, ...documentData };
//     this.foundDocuments.set(id, updatedDocument);
//     return updatedDocument;
//   }

//   async getUserFoundDocuments(userId: number): Promise<FoundDocument[]> {
//     return Array.from(this.foundDocuments.values()).filter(
//       (document) => document.userId === userId
//     );
//   }

//   async getFoundDocuments(): Promise<FoundDocument[]> {
//     return Array.from(this.foundDocuments.values());
//   }

//   async searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]> {
//     let results = Array.from(this.foundDocuments.values());
    
//     if (params.query) {
//       const query = params.query.toLowerCase();
//       results = results.filter(
//         (document) => document.description?.toLowerCase().includes(query)
//       );
//     }
    
//     if (params.documentType) {
//       results = results.filter(
//         (document) => document.documentType === params.documentType
//       );
//     }
    
//     if (params.location) {
//       const location = params.location.toLowerCase();
//       results = results.filter(
//         (document) => document.locationFound.toLowerCase().includes(location)
//       );
//     }
    
//     return results;
//   }

//   // MATCH OPERATIONS
  
//   async createMatch(match: InsertMatch): Promise<Match> {
//     const id = this.matchId++;
//     const createdAt = new Date();
//     const newMatch: Match = {
//       ...match,
//       id,
//       status: 'pending',
//       createdAt,
//     };
//     this.matches.set(id, newMatch);
//     return newMatch;
//   }

//   async getMatch(id: number): Promise<Match | undefined> {
//     return this.matches.get(id);
//   }

//   async updateMatch(id: number, matchData: Partial<Match>): Promise<Match> {
//     const match = await this.getMatch(id);
//     if (!match) {
//       throw new Error(`Match with id ${id} not found`);
//     }
    
//     const updatedMatch = { ...match, ...matchData };
//     this.matches.set(id, updatedMatch);
//     return updatedMatch;
//   }

//   async getUserMatches(userId: number): Promise<Match[]> {
//     // Get all matches that involve user's lost or found documents
//     const userLostDocuments = await this.getUserLostDocuments(userId);
//     const userFoundDocuments = await this.getUserFoundDocuments(userId);
    
//     const lostDocumentIds = userLostDocuments.map(doc => doc.id);
//     const foundDocumentIds = userFoundDocuments.map(doc => doc.id);
    
//     return Array.from(this.matches.values()).filter(
//       match => 
//         lostDocumentIds.includes(match.lostDocumentId) ||
//         foundDocumentIds.includes(match.foundDocumentId)
//     );
//   }

//   // NOTIFICATION OPERATIONS
  
//   async createNotification(notification: InsertNotification): Promise<Notification> {
//     const id = this.notificationId++;
//     const createdAt = new Date();
//     const newNotification: Notification = {
//       ...notification,
//       id,
//       read: false,
//       relatedId: notification.relatedId || null,
//       createdAt,
//     };
//     this.notifications.set(id, newNotification);
//     return newNotification;
//   }

//   async getNotification(id: number): Promise<Notification | undefined> {
//     return this.notifications.get(id);
//   }

//   async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
//     const notification = await this.getNotification(id);
//     if (!notification) {
//       throw new Error(`Notification with id ${id} not found`);
//     }
    
//     const updatedNotification = { ...notification, ...notificationData };
//     this.notifications.set(id, updatedNotification);
//     return updatedNotification;
//   }

//   async getUserNotifications(userId: number): Promise<Notification[]> {
//     return Array.from(this.notifications.values())
//       .filter(notification => notification.userId === userId)
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
//   }
// }

// export class DatabaseStorage implements IStorage {
//   sessionStore: session.Store;
  
//   constructor() {
//     this.sessionStore = new PostgresSessionStore({ 
//       pool, 
//       createTableIfMissing: true 
//     });
    
//     // Create a test user if none exists
//     this.initializeTestUser();
//   }
  
//   private async initializeTestUser() {
//     try {
//       const existingUser = await this.getUserByUsername("user1");
//       if (!existingUser) {
//         console.log("Creating test user 'user1'");
//         await this.createUser({
//           username: "user1",
//           password: "password1", // In a real app, this would be hashed
//           firstName: "John",
//           lastName: "Doe",
//           email: "john@example.com",
//         });
//       }
//     } catch (error) {
//       console.error("Error creating test user:", error);
//     }
//   }
  
//   // USER OPERATIONS
  
//   async getUser(id: number): Promise<User | undefined> {
//     console.log("DatabaseStorage: Getting user with ID:", id);
//     const [user] = await db.select().from(users).where(eq(users.id, id));
//     return user;
//   }
  
//   async getUserByUsername(username: string): Promise<User | undefined> {
//     console.log("DatabaseStorage: Looking up user with username:", username);
//     const results = await db.select().from(users).where(eq(users.username, username));
//     const user = results.length > 0 ? results[0] : undefined;
    
//     console.log("DatabaseStorage: User found?", !!user);
//     if (user) {
//       console.log("DatabaseStorage: Found user details:", {
//         id: user.id,
//         username: user.username,
//       });
//     }
    
//     return user;
//   }
  
//   async createUser(insertUser: InsertUser): Promise<User> {
//     const [user] = await db.insert(users).values({
//       ...insertUser,
//       firstName: insertUser.firstName || null,
//       lastName: insertUser.lastName || null
//     }).returning();
//     return user;
//   }
  
//   async updateUser(id: number, userData: Partial<User>): Promise<User> {
//     const [updatedUser] = await db
//       .update(users)
//       .set(userData)
//       .where(eq(users.id, id))
//       .returning();
    
//     if (!updatedUser) {
//       throw new Error(`User with id ${id} not found`);
//     }
    
//     return updatedUser;
//   }
  
//   async updateUserPassword(id: number, password: string): Promise<void> {
//     await db
//       .update(users)
//       .set({ password })
//       .where(eq(users.id, id));
//   }
  
//   // LOST DOCUMENT OPERATIONS
  
//   async createLostDocument(document: InsertLostDocument): Promise<LostDocument> {
//     const [lostDocument] = await db
//       .insert(lostDocuments)
//       .values({
//         ...document,
//         status: 'pending',
//         description: document.description || null,
//         hasImage: document.hasImage || false,
//         imageUrl: document.imageUrl || null,
//       })
//       .returning();
    
//     return lostDocument;
//   }
  
//   async getLostDocument(id: number): Promise<LostDocument | undefined> {
//     const [document] = await db
//       .select()
//       .from(lostDocuments)
//       .where(eq(lostDocuments.id, id));
    
//     return document;
//   }
  
//   async updateLostDocument(id: number, documentData: Partial<LostDocument>): Promise<LostDocument> {
//     const [updatedDocument] = await db
//       .update(lostDocuments)
//       .set(documentData)
//       .where(eq(lostDocuments.id, id))
//       .returning();
    
//     if (!updatedDocument) {
//       throw new Error(`Lost document with id ${id} not found`);
//     }
    
//     return updatedDocument;
//   }
  
//   async getUserLostDocuments(userId: number): Promise<LostDocument[]> {
//     return db
//       .select()
//       .from(lostDocuments)
//       .where(eq(lostDocuments.userId, userId));
//   }
  
//   async getLostDocuments(): Promise<LostDocument[]> {
//     return db.select().from(lostDocuments);
//   }
  
//   async searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]> {
//     // With type checking issues, let's use a simple approach:
//     // Get all documents first and then filter in-memory
//     const allDocs = await db.select().from(lostDocuments);
    
//     // Now filter based on the parameters
//     return allDocs.filter(doc => {
//       // Match query parameter (search in name and description)
//       if (params.query) {
//         const queryLower = params.query.toLowerCase();
//         const nameMatch = doc.nameOnDocument.toLowerCase().includes(queryLower);
//         const descMatch = doc.description?.toLowerCase().includes(queryLower) || false;
        
//         if (!nameMatch && !descMatch) return false;
//       }
      
//       // Match document type
//       if (params.documentType && doc.documentType !== params.documentType) {
//         return false;
//       }
      
//       // Match location
//       if (params.location) {
//         const locationLower = params.location.toLowerCase();
//         if (!doc.locationLost.toLowerCase().includes(locationLower)) {
//           return false;
//         }
//       }
      
//       return true;
//     });
//   }
  
//   // FOUND DOCUMENT OPERATIONS
  
//   async createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument> {
//     const [foundDocument] = await db
//       .insert(foundDocuments)
//       .values({
//         ...document,
//         status: 'pending',
//         description: document.description || null,
//         hasImage: document.hasImage || false,
//         imageUrl: document.imageUrl || null,
//       })
//       .returning();
    
//     return foundDocument;
//   }
  
//   async getFoundDocument(id: number): Promise<FoundDocument | undefined> {
//     const [document] = await db
//       .select()
//       .from(foundDocuments)
//       .where(eq(foundDocuments.id, id));
    
//     return document;
//   }
  
//   async updateFoundDocument(id: number, documentData: Partial<FoundDocument>): Promise<FoundDocument> {
//     const [updatedDocument] = await db
//       .update(foundDocuments)
//       .set(documentData)
//       .where(eq(foundDocuments.id, id))
//       .returning();
    
//     if (!updatedDocument) {
//       throw new Error(`Found document with id ${id} not found`);
//     }
    
//     return updatedDocument;
//   }
  
//   async getUserFoundDocuments(userId: number): Promise<FoundDocument[]> {
//     return db
//       .select()
//       .from(foundDocuments)
//       .where(eq(foundDocuments.userId, userId));
//   }
  
//   async getFoundDocuments(): Promise<FoundDocument[]> {
//     return db.select().from(foundDocuments);
//   }
  
//   async searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]> {
//     // Using the same approach as searchLostDocuments to avoid type issues
//     const allDocs = await db.select().from(foundDocuments);
    
//     // Now filter based on the parameters
//     return allDocs.filter(doc => {
//       // Match query parameter (search in description)
//       if (params.query) {
//         const queryLower = params.query.toLowerCase();
//         const descMatch = doc.description?.toLowerCase().includes(queryLower) || false;
        
//         if (!descMatch) return false;
//       }
      
//       // Match document type
//       if (params.documentType && doc.documentType !== params.documentType) {
//         return false;
//       }
      
//       // Match location
//       if (params.location) {
//         const locationLower = params.location.toLowerCase();
//         if (!doc.locationFound.toLowerCase().includes(locationLower)) {
//           return false;
//         }
//       }
      
//       return true;
//     });
//   }
  
//   // MATCH OPERATIONS
  
//   async createMatch(match: InsertMatch): Promise<Match> {
//     const [newMatch] = await db
//       .insert(documentMatches)
//       .values({
//         ...match,
//         status: 'pending',
//       })
//       .returning();
    
//     return newMatch;
//   }
  
//   async getMatch(id: number): Promise<Match | undefined> {
//     const [match] = await db
//       .select()
//       .from(documentMatches)
//       .where(eq(documentMatches.id, id));
    
//     return match;
//   }
  
//   async updateMatch(id: number, matchData: Partial<Match>): Promise<Match> {
//     const [updatedMatch] = await db
//       .update(documentMatches)
//       .set(matchData)
//       .where(eq(documentMatches.id, id))
//       .returning();
    
//     if (!updatedMatch) {
//       throw new Error(`Match with id ${id} not found`);
//     }
    
//     return updatedMatch;
//   }
  
//   async getUserMatches(userId: number): Promise<Match[]> {
//     // Get all matches where the user's documents are involved
//     // This approach avoids using "in" operator which is causing issues
    
//     // First get all matches in the database
//     const allMatches = await db.select().from(documentMatches);
    
//     // Get the user's documents
//     const userLostDocs = await this.getUserLostDocuments(userId);
//     const userFoundDocs = await this.getUserFoundDocuments(userId);
    
//     const lostDocIds = userLostDocs.map(doc => doc.id);
//     const foundDocIds = userFoundDocs.map(doc => doc.id);
    
//     // Filter out only those matches that involve user's documents
//     const userMatches = allMatches.filter(match => 
//       lostDocIds.includes(match.lostDocumentId) || 
//       foundDocIds.includes(match.foundDocumentId)
//     );
    
//     return userMatches;
//   }
  
//   // NOTIFICATION OPERATIONS
  
//   async createNotification(notification: InsertNotification): Promise<Notification> {
//     const [newNotification] = await db
//       .insert(notifications)
//       .values({
//         ...notification,
//         read: false,
//         relatedId: notification.relatedId || null,
//       })
//       .returning();
    
//     return newNotification;
//   }
  
//   async getNotification(id: number): Promise<Notification | undefined> {
//     const [notification] = await db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.id, id));
    
//     return notification;
//   }
  
//   async updateNotification(id: number, notificationData: Partial<Notification>): Promise<Notification> {
//     const [updatedNotification] = await db
//       .update(notifications)
//       .set(notificationData)
//       .where(eq(notifications.id, id))
//       .returning();
    
//     if (!updatedNotification) {
//       throw new Error(`Notification with id ${id} not found`);
//     }
    
//     return updatedNotification;
//   }
  
//   async getUserNotifications(userId: number): Promise<Notification[]> {
//     return db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.userId, userId))
//       .orderBy(desc(notifications.createdAt));
//   }
// }

// export const storage = new DatabaseStorage();





// import dotenv from 'dotenv';
// dotenv.config(); // Load .env variables first

// import {
//   users, type User, type InsertUser,
//   lostDocuments, type LostDocument, type InsertLostDocument,
//   foundDocuments, type FoundDocument, type InsertFoundDocument,
//   // documentMatches, type Match, type InsertMatch, // Keep if match table is used, otherwise remove
//   notifications, type Notification, type InsertNotification
// } from "../shared/schema"; // Ensure path is correct
// import { db, pool } from "./db"; // Import db and pool from db.ts
// import { eq, and, like, desc, or, sql, count, isNull, ne } from "drizzle-orm";
// import session from "express-session";
// import connectPgSimple from "connect-pg-simple"; // Use connect-pg-simple
// // Removed bcrypt import as it was only used for the test user

// const PgSession = connectPgSimple(session);

// // Interface defining the storage operations required by the application
// export interface IStorage {
//   sessionStore: session.Store;

//   // User operations
//   getUserById(id: number): Promise<User | undefined>;
//   getUserByEmail(email: string): Promise<User | undefined>;
//   createUser(user: InsertUser): Promise<User>;
//   updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>; // Use InsertUser for partial updates

//   // Lost document operations
//   createLostDocument(document: InsertLostDocument): Promise<LostDocument>;
//   getLostDocumentById(id: number): Promise<LostDocument | undefined>;
//   updateLostDocument(id: number, documentData: Partial<InsertLostDocument>): Promise<LostDocument | undefined>;
//   getUserLostDocuments(userId: number): Promise<LostDocument[]>;
//   searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]>;
//   findPotentialMatchesForLost(lostDoc: LostDocument): Promise<FoundDocument[]>; // Returns potential found matches

//   // Found document operations
//   createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument>;
//   getFoundDocumentById(id: number): Promise<FoundDocument | undefined>;
//   updateFoundDocument(id: number, documentData: Partial<InsertFoundDocument>): Promise<FoundDocument | undefined>;
//   getUserFoundDocuments(userId: number): Promise<FoundDocument[]>;
//   searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]>;
//   findPotentialMatchesForFound(foundDoc: FoundDocument): Promise<LostDocument[]>; // Returns potential lost matches

//   // Notification operations
//   createNotification(notification: InsertNotification): Promise<Notification>;
//   getNotificationById(id: number): Promise<Notification | undefined>;
//   updateNotification(id: number, notificationData: Partial<InsertNotification>): Promise<Notification | undefined>;
//   getUserNotifications(userId: number): Promise<Notification[]>;

//   // Dashboard operations
//   getUserStats(userId: number): Promise<{ lostCount: number; foundCount: number; matchesCount: number }>;
//   getRecentUserActivity(userId: number, limit: number): Promise<Notification[]>; // Activity based on notifications
//   getPotentialMatchCount(userId: number): Promise<number>; // Count of unread match notifications
// }

// // Database-backed storage implementation using Drizzle ORM
// export class DatabaseStorage implements IStorage {
//   sessionStore: session.Store;

//   constructor() {
//     if (!pool) {
//       throw new Error("Database pool is not initialized. Check db.ts and DATABASE_URL.");
//     }
//     this.sessionStore = new PgSession({
//       pool,
//       createTableIfMissing: true,
//       tableName: 'user_sessions' // Optional: specify table name
//     });

//     // Removed call to this.initializeTestUser();
//   }

//   // Removed the initializeTestUser function definition

//   // --- USER OPERATIONS ---

//   async getUserById(id: number): Promise<User | undefined> {
//     // console.log("DatabaseStorage: Getting user with ID:", id);
//     const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
//     return results[0];
//   }

//   async getUserByEmail(email: string): Promise<User | undefined> {
//     // console.log("DatabaseStorage: Looking up user with email:", email);
//     const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     return results[0];
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     // Ensure password is provided (routes.ts should handle hashing)
//     if (!insertUser.password) {
//         throw new Error("Password is required to create a user.");
//     }
//     const [user] = await db.insert(users).values({
//       ...insertUser,
//       // Ensure defaults or nulls are handled by DB or schema if needed
//       firstName: insertUser.firstName || null,
//       lastName: insertUser.lastName || null
//     }).returning();
//     if (!user) {
//         // This case might indicate an issue with .returning() or the insert itself
//         throw new Error("User creation failed, no user returned after insert.");
//     }
//     return user;
//   }

//   async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
//     // Ensure password is not accidentally set to null/undefined if not provided
//     if (userData.password === undefined) {
//         delete userData.password;
//     }
//     // Ensure email is not accidentally set to null/undefined if not provided
//     if (userData.email === undefined) {
//         delete userData.email;
//     }

//     const [updatedUser] = await db
//       .update(users)
//       .set(userData)
//       .where(eq(users.id, id))
//       .returning();

//     // Drizzle returns undefined if no row was updated
//     // if (!updatedUser) {
//     //   throw new Error(`User with id ${id} not found for update`);
//     // }
//     return updatedUser;
//   }

//   // --- LOST DOCUMENT OPERATIONS ---

//   async createLostDocument(document: InsertLostDocument): Promise<LostDocument> {
//     const [lostDocument] = await db
//       .insert(lostDocuments)
//       .values({
//         ...document,
//         status: 'pending', // Default status
//         description: document.description || null,
//         hasImage: document.hasImage || false,
//         imageUrl: document.imageUrl || null,
//         aiAnalysis: document.aiAnalysis || null, // Handle potential null
//         dateLost: document.dateLost || null, // Handle potential null
//       })
//       .returning();
//     return lostDocument;
//   }

//   async getLostDocumentById(id: number): Promise<LostDocument | undefined> {
//     const [document] = await db
//       .select()
//       .from(lostDocuments)
//       .where(eq(lostDocuments.id, id))
//       .limit(1);
//     return document;
//   }

//   async updateLostDocument(id: number, documentData: Partial<InsertLostDocument>): Promise<LostDocument | undefined> {
//     const [updatedDocument] = await db
//       .update(lostDocuments)
//       .set(documentData)
//       .where(eq(lostDocuments.id, id))
//       .returning();
//     return updatedDocument;
//   }

//   async getUserLostDocuments(userId: number): Promise<LostDocument[]> {
//     return db
//       .select()
//       .from(lostDocuments)
//       .where(eq(lostDocuments.userId, userId))
//       .orderBy(desc(lostDocuments.createdAt)); // Order by most recent
//   }

//   async searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]> {
//     const conditions = [];
//     if (params.query) {
//       const queryLower = `%${params.query.toLowerCase()}%`;
//       conditions.push(
//         or(
//           like(sql`lower(${lostDocuments.nameOnDocument})`, queryLower),
//           like(sql`lower(${lostDocuments.description})`, queryLower)
//         )
//       );
//     }
//     if (params.documentType && params.documentType !== 'all') {
//       conditions.push(eq(lostDocuments.documentType, params.documentType));
//     }
//     if (params.location && params.location !== 'all') {
//       conditions.push(like(sql`lower(${lostDocuments.locationLost})`, `%${params.location.toLowerCase()}%`));
//     }

//     // Only return documents with 'pending' or 'matched' status? Or all? Assuming all for now.
//     // conditions.push(inArray(lostDocuments.status, ['pending', 'matched']));

//     return db.select().from(lostDocuments).where(and(...conditions)).orderBy(desc(lostDocuments.createdAt));
//   }

//   // Basic placeholder - needs more sophisticated matching logic (AI, keywords, location proximity etc.)
//   async findPotentialMatchesForLost(lostDoc: LostDocument): Promise<FoundDocument[]> {
//     console.log(`Finding potential matches for LOST document ID: ${lostDoc.id}, Type: ${lostDoc.documentType}`);
//     const conditions = [
//         // Match document type
//         eq(foundDocuments.documentType, lostDoc.documentType),
//         // Exclude documents already marked as 'returned' or similar terminal status
//         ne(foundDocuments.status, 'returned'),
//         // Exclude documents reported by the same user? Optional.
//         // ne(foundDocuments.userId, lostDoc.userId)
//     ];

//     // Add more sophisticated matching based on AI analysis, location, description keywords etc.
//     // Example: if (lostDoc.aiAnalysis?.keywords) { conditions.push(...) }
//     // Example: if (lostDoc.locationLost) { // Add location proximity check }

//     return db.select()
//              .from(foundDocuments)
//              .where(and(...conditions))
//              .orderBy(desc(foundDocuments.createdAt))
//              .limit(10); // Limit potential matches shown
//   }

//   // --- FOUND DOCUMENT OPERATIONS ---

//   async createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument> {
//     const [foundDocument] = await db
//       .insert(foundDocuments)
//       .values({
//         ...document,
//         status: 'pending',
//         description: document.description || null,
//         hasImage: document.hasImage || false,
//         imageUrl: document.imageUrl || null,
//         aiAnalysis: document.aiAnalysis || null,
//         dateFound: document.dateFound || null,
//       })
//       .returning();
//     return foundDocument;
//   }

//   async getFoundDocumentById(id: number): Promise<FoundDocument | undefined> {
//     const [document] = await db
//       .select()
//       .from(foundDocuments)
//       .where(eq(foundDocuments.id, id))
//       .limit(1);
//     return document;
//   }

//   async updateFoundDocument(id: number, documentData: Partial<InsertFoundDocument>): Promise<FoundDocument | undefined> {
//     const [updatedDocument] = await db
//       .update(foundDocuments)
//       .set(documentData)
//       .where(eq(foundDocuments.id, id))
//       .returning();
//     return updatedDocument;
//   }

//   async getUserFoundDocuments(userId: number): Promise<FoundDocument[]> {
//     return db
//       .select()
//       .from(foundDocuments)
//       .where(eq(foundDocuments.userId, userId))
//       .orderBy(desc(foundDocuments.createdAt));
//   }

//   async searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]> {
//     const conditions = [];
//     if (params.query) {
//       conditions.push(like(sql`lower(${foundDocuments.description})`, `%${params.query.toLowerCase()}%`));
//     }
//     if (params.documentType && params.documentType !== 'all') {
//       conditions.push(eq(foundDocuments.documentType, params.documentType));
//     }
//     if (params.location && params.location !== 'all') {
//       conditions.push(like(sql`lower(${foundDocuments.locationFound})`, `%${params.location.toLowerCase()}%`));
//     }
//     // conditions.push(inArray(foundDocuments.status, ['pending', 'matched'])); // Filter by status if needed

//     return db.select().from(foundDocuments).where(and(...conditions)).orderBy(desc(foundDocuments.createdAt));
//   }

//   // Basic placeholder - needs more sophisticated matching logic
//   async findPotentialMatchesForFound(foundDoc: FoundDocument): Promise<LostDocument[]> {
//      console.log(`Finding potential matches for FOUND document ID: ${foundDoc.id}, Type: ${foundDoc.documentType}`);
//      const conditions = [
//         eq(lostDocuments.documentType, foundDoc.documentType),
//         ne(lostDocuments.status, 'returned'), // Exclude already returned items
//         // ne(lostDocuments.userId, foundDoc.userId) // Optional: Exclude same user
//      ];

//      // Add more sophisticated matching here

//      return db.select()
//               .from(lostDocuments)
//               .where(and(...conditions))
//               .orderBy(desc(lostDocuments.createdAt))
//               .limit(10);
//   }

//   // --- NOTIFICATION OPERATIONS ---

//   async createNotification(notification: InsertNotification): Promise<Notification> {
//     const [newNotification] = await db
//       .insert(notifications)
//       .values({
//         ...notification,
//         read:  false, // Default to unread
//         relatedId: notification.relatedId || null,
//       })
//       .returning();
//     return newNotification;
//   }

//   async getNotificationById(id: number): Promise<Notification | undefined> {
//     const [notification] = await db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.id, id))
//       .limit(1);
//     return notification;
//   }

//   async updateNotification(id: number, notificationData: Partial<InsertNotification>): Promise<Notification | undefined> {
//     const [updatedNotification] = await db
//       .update(notifications)
//       .set(notificationData)
//       .where(eq(notifications.id, id))
//       .returning();
//     return updatedNotification;
//   }

//   async getUserNotifications(userId: number): Promise<Notification[]> {
//     return db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.userId, userId))
//       .orderBy(desc(notifications.createdAt)); // Order by most recent
//   }

//   // --- DASHBOARD OPERATIONS ---

//   async getUserStats(userId: number): Promise<{ lostCount: number; foundCount: number; matchesCount: number }> {
//     const lostCountResult = await db.select({ value: count() }).from(lostDocuments).where(eq(lostDocuments.userId, userId));
//     const foundCountResult = await db.select({ value: count() }).from(foundDocuments).where(eq(foundDocuments.userId, userId));

//     // Matches count could be based on unread match notifications or a dedicated matches table count
//     const matchesCountResult = await db.select({ value: count() })
//                                        .from(notifications)
//                                        .where(and(
//                                           eq(notifications.userId, userId),
//                                           or(
//                                             eq(notifications.type, 'match_found'),
//                                             eq(notifications.type, 'match_lost')
//                                           ),
//                                           // Optionally count only unread matches: eq(notifications.read, false)
//                                        ));

//     return {
//       lostCount: lostCountResult[0]?.value ?? 0,
//       foundCount: foundCountResult[0]?.value ?? 0,
//       matchesCount: matchesCountResult[0]?.value ?? 0,
//     };
//   }

//   // Using notifications as the source of recent activity
//   async getRecentUserActivity(userId: number, limit: number): Promise<Notification[]> {
//     return db
//       .select()
//       .from(notifications)
//       .where(eq(notifications.userId, userId))
//       .orderBy(desc(notifications.createdAt))
//       .limit(limit);
//   }

//   // Count unread notifications related to matches
//   async getPotentialMatchCount(userId: number): Promise<number> {
//      const result = await db.select({ value: count() })
//                             .from(notifications)
//                             .where(and(
//                                eq(notifications.userId, userId),
//                                eq(notifications.read, false), // Only unread
//                                or(
//                                  eq(notifications.type, 'match_found'),
//                                  eq(notifications.type, 'match_lost')
//                                )
//                             ));
//      return result[0]?.value ?? 0;
//   }

// }

// // Export a single instance of the DatabaseStorage
// export const storage = new DatabaseStorage();

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables first

import {
  users, type User, type InsertUser,
  lostDocuments, type LostDocument, type InsertLostDocument,
  foundDocuments, type FoundDocument, type InsertFoundDocument,
  // documentMatches, type Match, type InsertMatch, // Keep if match table is used, otherwise remove
  notifications, type Notification, type InsertNotification
} from "../shared/schema"; // Ensure path is correct
import { db, pool } from "./db"; // Import db and pool from db.ts
import { eq, and, like, desc, or, sql, count, isNull, ne } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple"; // Use connect-pg-simple

const PgSession = connectPgSimple(session);

// --- SESSION STORE ---
// Export the session store separately for session setup in routes.ts
export const sessionStore = new PgSession({
  pool,
  createTableIfMissing: true,
  tableName: 'user_sessions' // Optional: specify table name
});


// --- USER OPERATIONS ---

export async function getUserById(id: number): Promise<User | undefined> {
  // console.log("Storage: Getting user with ID:", id);
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return results[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  // console.log("Storage: Looking up user with email:", email);
  const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return results[0];
}

export async function createUser(insertUser: InsertUser): Promise<User> {
  // Ensure password is provided (routes.ts should handle hashing)
  if (!insertUser.password) {
      throw new Error("Password is required to create a user.");
  }
  const [user] = await db.insert(users).values({
    ...insertUser,
    // Ensure defaults or nulls are handled by DB or schema if needed
    firstName: insertUser.firstName || null,
    lastName: insertUser.lastName || null
  }).returning();
  if (!user) {
      // This case might indicate an issue with .returning() or the insert itself
      throw new Error("User creation failed, no user returned after insert.");
  }
  return user;
}

export async function updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
  // Ensure password is not accidentally set to null/undefined if not provided
  if (userData.password === undefined) {
      delete userData.password;
  }
  // Ensure email is not accidentally set to null/undefined if not provided
  if (userData.email === undefined) {
      delete userData.email;
  }

  const [updatedUser] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();

  return updatedUser;
}

// --- LOST DOCUMENT OPERATIONS ---

export async function createLostDocument(document: InsertLostDocument): Promise<LostDocument> {
  const [lostDocument] = await db
    .insert(lostDocuments)
    .values({
      ...document,
      status: 'pending', // Default status
      description: document.description || null,
      hasImage: document.hasImage || false,
      imageUrl: document.imageUrl || null,
      aiAnalysis: document.aiAnalysis || null, // Handle potential null
      dateLost: document.dateLost || null, // Handle potential null
    })
    .returning();
  return lostDocument;
}

export async function getLostDocumentById(id: number): Promise<LostDocument | undefined> {
  const [document] = await db
    .select()
    .from(lostDocuments)
    .where(eq(lostDocuments.id, id))
    .limit(1);
  return document;
}

export async function updateLostDocument(id: number, documentData: Partial<InsertLostDocument>): Promise<LostDocument | undefined> {
  const [updatedDocument] = await db
    .update(lostDocuments)
    .set(documentData)
    .where(eq(lostDocuments.id, id))
    .returning();
  return updatedDocument;
}

export async function getUserLostDocuments(userId: number): Promise<LostDocument[]> {
  return db
    .select()
    .from(lostDocuments)
    .where(eq(lostDocuments.userId, userId))
    .orderBy(desc(lostDocuments.createdAt)); // Order by most recent
}

export async function searchLostDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<LostDocument[]> {
  const conditions = [];
  if (params.query) {
    const queryLower = `%${params.query.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${lostDocuments.nameOnDocument})`, queryLower),
        like(sql`lower(${lostDocuments.description})`, queryLower)
      )
    );
  }
  if (params.documentType && params.documentType !== 'all') {
    conditions.push(eq(lostDocuments.documentType, params.documentType));
  }
  if (params.location && params.location !== 'all') {
    conditions.push(like(sql`lower(${lostDocuments.locationLost})`, `%${params.location.toLowerCase()}%`));
  }

  // Only return documents with 'pending' status
  conditions.push(eq(lostDocuments.status, 'pending'));

  return db.select().from(lostDocuments).where(and(...conditions)).orderBy(desc(lostDocuments.createdAt));
}

// Basic placeholder - needs more sophisticated matching logic (AI, keywords, location proximity etc.)
export async function findPotentialMatchesForLost(lostDoc: LostDocument): Promise<FoundDocument[]> {
  console.log(`Finding potential matches for LOST document ID: ${lostDoc.id}, Type: ${lostDoc.documentType}`);
  const conditions = [
      // Match document type
      eq(foundDocuments.documentType, lostDoc.documentType),
      // Exclude documents already marked as 'returned' or similar terminal status
      ne(foundDocuments.status, 'returned'),
      // Only match pending found documents
      eq(foundDocuments.status, 'pending'),
      // Exclude documents reported by the same user? Optional.
      // ne(foundDocuments.userId, lostDoc.userId)
  ];

  // Add more sophisticated matching based on AI analysis, location, description keywords etc.

  return db.select()
           .from(foundDocuments)
           .where(and(...conditions))
           .orderBy(desc(foundDocuments.createdAt))
           .limit(10); // Limit potential matches shown
}

// --- FOUND DOCUMENT OPERATIONS ---

export async function createFoundDocument(document: InsertFoundDocument): Promise<FoundDocument> {
  const [foundDocument] = await db
    .insert(foundDocuments)
    .values({
      ...document,
      status: 'pending',
      description: document.description || null,
      hasImage: document.hasImage || false,
      imageUrl: document.imageUrl || null,
      aiAnalysis: document.aiAnalysis || null,
      dateFound: document.dateFound || null,
    })
    .returning();
  return foundDocument;
}

export async function getFoundDocumentById(id: number): Promise<FoundDocument | undefined> {
  const [document] = await db
    .select()
    .from(foundDocuments)
    .where(eq(foundDocuments.id, id))
    .limit(1);
  return document;
}

export async function updateFoundDocument(id: number, documentData: Partial<InsertFoundDocument>): Promise<FoundDocument | undefined> {
  const [updatedDocument] = await db
    .update(foundDocuments)
    .set(documentData)
    .where(eq(foundDocuments.id, id))
    .returning();
  return updatedDocument;
}

export async function getUserFoundDocuments(userId: number): Promise<FoundDocument[]> {
  return db
    .select()
    .from(foundDocuments)
    .where(eq(foundDocuments.userId, userId))
    .orderBy(desc(foundDocuments.createdAt));
}

export async function searchFoundDocuments(params: { query?: string, documentType?: string, location?: string }): Promise<FoundDocument[]> {
  const conditions = [];
  if (params.query) {
    conditions.push(like(sql`lower(${foundDocuments.description})`, `%${params.query.toLowerCase()}%`));
  }
  if (params.documentType && params.documentType !== 'all') {
    conditions.push(eq(foundDocuments.documentType, params.documentType));
  }
  if (params.location && params.location !== 'all') {
    conditions.push(like(sql`lower(${foundDocuments.locationFound})`, `%${params.location.toLowerCase()}%`));
  }
  // Only return documents with 'pending' status
  conditions.push(eq(foundDocuments.status, 'pending'));

  return db.select().from(foundDocuments).where(and(...conditions)).orderBy(desc(foundDocuments.createdAt));
}

// Basic placeholder - needs more sophisticated matching logic
export async function findPotentialMatchesForFound(foundDoc: FoundDocument): Promise<LostDocument[]> {
   console.log(`Finding potential matches for FOUND document ID: ${foundDoc.id}, Type: ${foundDoc.documentType}`);
   const conditions = [
      eq(lostDocuments.documentType, foundDoc.documentType),
      ne(lostDocuments.status, 'returned'), // Exclude already returned items
      eq(lostDocuments.status, 'pending'), // Only match pending lost docs
      // ne(lostDocuments.userId, foundDoc.userId) // Optional: Exclude same user
   ];

   // Add more sophisticated matching here

   return db.select()
            .from(lostDocuments)
            .where(and(...conditions))
            .orderBy(desc(lostDocuments.createdAt))
            .limit(10);
}

// --- NOTIFICATION OPERATIONS ---

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const [newNotification] = await db
    .insert(notifications)
    .values({
      ...notification,
      read:  false, // Default to unread
      relatedId: notification.relatedId || null,
    })
    .returning();
  return newNotification;
}

export async function getNotificationById(id: number): Promise<Notification | undefined> {
  const [notification] = await db
    .select()
    .from(notifications)
    .where(eq(notifications.id, id))
    .limit(1);
  return notification;
}

export async function updateNotification(id: number, notificationData: Partial<InsertNotification>): Promise<Notification | undefined> {
  const [updatedNotification] = await db
    .update(notifications)
    .set(notificationData)
    .where(eq(notifications.id, id))
    .returning();
  return updatedNotification;
}

export async function getUserNotifications(userId: number): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt)); // Order by most recent
}

// --- DASHBOARD OPERATIONS ---

export async function getUserStats(userId: number): Promise<{ documentsLost: number; documentsFound: number; successfulMatches: number; pendingMatches: number; }> {
    const lostCountResult = await db.select({ value: count() }).from(lostDocuments).where(eq(lostDocuments.userId, userId));
    const foundCountResult = await db.select({ value: count() }).from(foundDocuments).where(eq(foundDocuments.userId, userId));

    // Placeholder for successful matches - requires tracking match status properly
    const successfulMatchesCount = 0; // TODO: Implement logic based on match status

    // Count pending matches based on unread notifications
    const pendingMatchesCount = await getPotentialMatchCount(userId);

    return {
      documentsLost: lostCountResult[0]?.value ?? 0,
      documentsFound: foundCountResult[0]?.value ?? 0,
      successfulMatches: successfulMatchesCount,
      pendingMatches: pendingMatchesCount,
    };
}

// Using notifications as the source of recent activity
export async function getRecentUserActivity(userId: number, limit: number): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

// Count unread notifications related to matches
export async function getPotentialMatchCount(userId: number): Promise<number> {
   const result = await db.select({ value: count() })
                          .from(notifications)
                          .where(and(
                             eq(notifications.userId, userId),
                             eq(notifications.read, false), // Only unread
                             or(
                               eq(notifications.type, 'match_found'),
                               eq(notifications.type, 'match_lost')
                             )
                          ));
   return result[0]?.value ?? 0;
}

// --- Utility Functions (if any) ---
// e.g., function to close the pool if needed during shutdown
export async function closeDbPool(): Promise<void> {
    await pool.end();
}