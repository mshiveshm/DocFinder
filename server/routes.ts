import express, { type Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import passport from "passport";
// import LocalStrategy from "passport-local";
import { Strategy as PassportLocalStrategy } from "passport-local"; // Correct named import
import bcrypt from "bcryptjs"; // Use bcryptjs for hashing
// Removed pg import as pool is managed in storage/db.ts
// Removed connectPgSimple import as store is created in storage.ts
import { createServer, type Server } from "node:http"; // Use node:http
import * as storage from "./storage"; // Import all storage functions into namespace
import { sessionStore } from "./storage"; // Import sessionStore specifically
import { log } from "./vite"; // Use the shared log function
import {
  insertLostDocumentSchema,
  insertFoundDocumentSchema,
  insertUserSchema,
  loginSchema, // Assuming loginSchema exists for validation
  type InsertUser, // Import InsertUser type
  type InsertLostDocument, // Import InsertLostDocument type
  type InsertFoundDocument, // Import InsertFoundDocument type
  type Notification // Import Notification type for update
} from "../shared/schema"; // Import schemas from shared location
import { analyzeDocumentText, analyzeDocumentImage } from "./services/gemini"; // Assuming Gemini services exist

// --- Helper Middleware ---
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  log('Authentication required, user not logged in.', 'Auth', 'warn');
  res.status(401).json({ message: "Not authenticated" });
}

// --- Main Route Registration ---
export async function registerRoutes(app: Express): Promise<Server> {

  // --- Session Configuration (Production Ready) ---
  // Pool and PgSession setup moved to storage.ts

  // Optional: Check DB connection on startup (can also be done in db.ts)
  try {
    // Use a storage function or direct pool query if pool is exported from db.ts
    // Example: await storage.checkDbConnection(); or await pool.query('SELECT NOW()');
    log('Database connection assumed successful (check db.ts/storage.ts).', 'DB');
  } catch (err: any) {
    log(`Database connection error: ${err.message}`, 'DB', 'error');
    // Consider exiting if DB is critical: process.exit(1);
  }

  app.use(
    session({
      store: sessionStore, // Use the imported sessionStore from storage.ts
      secret: process.env.SESSION_SECRET || "replace_this_with_a_strong_secret_in_env", // LOAD FROM ENV!
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
      },
    }),
  );

  // --- Passport Configuration ---
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new PassportLocalStrategy(
      { usernameField: "email" }, // Use email for login
      async (email, password, done) => {
        try {
          log(`Passport: Attempting login for email: ${email}`, 'Auth');
          // Use storage namespace
          const user = await storage.getUserByEmail(email); // Fetch user by email
          if (!user) {
            log(`Passport: User not found for email: ${email}`, 'Auth', 'warn');
            return done(null, false, { message: "Incorrect email or password." });
          }

          // Compare hashed password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            log(`Passport: Incorrect password for email: ${email}`, 'Auth', 'warn');
            return done(null, false, { message: "Incorrect email or password." });
          }

          log(`Passport: Authentication successful for email: ${email}`, 'Auth');
          // Exclude password from user object passed to done
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (err: any) {
          log(`Passport strategy error: ${err.message}`, 'Auth', 'error');
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id); // Store only user ID in session
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      // Use storage namespace
      const user = await storage.getUserById(id); // Fetch user by ID
      if (user) {
        // Exclude password from user object attached to req.user
        const { password: _, ...userWithoutPassword } = user;
        done(null, userWithoutPassword);
      } else {
        log(`Passport: User not found during deserialization (ID: ${id})`, 'Auth', 'warn');
        done(null, false); // User not found
      }
    } catch (err: any) {
      log(`Passport deserialize error: ${err.message}`, 'Auth', 'error');
      done(err);
    }
  });

  // --- Authentication Routes ---

  // Login
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    // Optional: Validate basic login structure if needed (e.g., email/password present)
    const validation = loginSchema.safeParse(req.body); // Use Zod schema if defined
    if (!validation.success) {
        log(`Login validation failed: ${JSON.stringify(validation.error.flatten())}`, 'Auth', 'error');
        return res.status(400).json({
            message: "Invalid login data",
            errors: process.env.NODE_ENV === 'development' ? validation.error.flatten().fieldErrors : undefined
        });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        log(`Login authentication error: ${err.message}`, "Auth", 'error');
        return res.status(500).json({ message: "Login failed due to a server error." });
      }
      if (!user) {
        log(`Login failed: ${info?.message || 'Invalid credentials'}`, "Auth", 'warn');
        return res.status(401).json({ message: info?.message || "Invalid credentials." });
      }
      req.logIn(user, (loginErr) => { // Establish session
        if (loginErr) {
          log(`Session establishment error after login: ${loginErr.message}`, "Auth", 'error');
          return res.status(500).json({ message: "Login failed during session creation." });
        }
        log(`User logged in successfully: ${user.email}`, "Auth");
        // Return user data (without password) from deserializeUser
        return res.status(200).json({ message: "Login successful", user });
      });
    })(req, res, next); // Invoke the middleware
  });

  // Signup / Register
  // IMPORTANT: Ensure ensureAuthenticated is NOT applied here
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    // Validate input using the shared Zod schema
    const validation = insertUserSchema.safeParse(req.body);
    if (!validation.success) {
      log(`Signup validation failed: ${JSON.stringify(validation.error.flatten())}`, "Auth", 'error');
      return res.status(400).json({
          message: "Invalid registration data",
          errors: process.env.NODE_ENV === 'development' ? validation.error.flatten().fieldErrors : undefined
      });
    }

    try {
      const { email, password, firstName, lastName } = validation.data;
      // Use storage namespace
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        log(`Signup attempt failed: Email already exists (${email})`, 'Auth', 'warn');
        return res.status(409).json({ message: "Email address is already registered." });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user with hashed password
      // Use storage namespace
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      log(`User created successfully: ${newUser.email}`, 'Auth');

      // Auto-login after signup
      const userForLogin = { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName };
      req.login(userForLogin, (err) => {
        if (err) {
          log(`Post-signup login failed: ${err.message}`, "Auth", 'error');
          // Return success but indicate login issue
          return res.status(201).json({ message: "Registration successful, but automatic login failed. Please log in manually.", user: userForLogin });
        }
        log(`User logged in automatically after signup: ${newUser.email}`, "Auth");
        return res.status(201).json({ message: "Registration successful", user: userForLogin });
      });
    } catch (error: any) {
      log(`Signup error: ${error.message}`, "Auth", 'error');
      return res.status(500).json({ message: "Registration failed due to a server error." });
    }
  });

  // Logout
  app.post("/api/auth/logout", ensureAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    const userEmail = (req.user as any)?.email || "Unknown user";
    req.logout((err) => {
      if (err) {
        log(`Logout function error: ${err.message}`, "Auth", 'error');
        // Continue to destroy session anyway
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
           log(`Session destroy error during logout: ${destroyErr.message}`, "Auth", 'error');
        }
        log(`User logged out: ${userEmail}`, "Auth");
        res.clearCookie("connect.sid"); // Use the default session cookie name
        return res.status(200).json({ message: "Logout successful" });
      });
    });
  });

  // Authentication status check
  app.get("/api/auth/status", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      // req.user comes from deserializeUser (no password)
      log(`Auth status check: User authenticated (${(req.user as any)?.email})`, 'Auth');
      return res.status(200).json({ user: req.user });
    } else {
      log(`Auth status check: User not authenticated`, 'Auth');
      return res.status(401).json({ user: null });
    }
  });

  // --- User Profile Routes ---

  // Update user profile (excluding password)
  app.put("/api/profile", ensureAuthenticated, async (req: Request, res: Response) => {
     try {
       const user = req.user as any;
       // TODO: Define a Zod schema for profile updates (e.g., profileUpdateSchema)
       // For now, basic validation
       const { firstName, lastName, email } = req.body;

       if (!firstName || !lastName || !email) {
          log(`Profile update validation failed: Missing fields`, 'API', 'error');
          return res.status(400).json({ message: "First name, last name, and email are required." });
       }

       // Check if email is being changed and if it already exists
       if (email !== user.email) {
         // Use storage namespace
         const existingUser = await storage.getUserByEmail(email);
         if (existingUser) {
           log(`Profile update failed: New email already exists (${email})`, 'API', 'warn');
           return res.status(409).json({ message: "Email address is already registered by another user." });
         }
       }

       // Use the imported InsertUser type directly
       const updateData: Partial<InsertUser> = {
          firstName,
          lastName,
          email,
       };

       // Use storage namespace
       const updatedUser = await storage.updateUser(user.id, updateData);
       if (!updatedUser) {
          log(`Profile update failed: User not found during update (ID: ${user.id})`, 'API', 'error');
          return res.status(404).json({ message: "User not found during update." });
       }

       const { password: _, ...userWithoutPassword } = updatedUser;

       // Update the session with the new user details
       req.login(userWithoutPassword, (err) => {
          if (err) {
             log(`Profile update session refresh error: ${err.message}`, 'Auth', 'warn');
          }
          log(`User profile updated successfully: ${userWithoutPassword.email}`, 'API');
          return res.status(200).json({ message: "Profile updated successfully", user: userWithoutPassword });
       });

     } catch (error: any) {
       log(`Profile update error: ${error.message}`, "API", 'error');
       return res.status(500).json({ message: "Error updating profile" });
     }
  });

  // Change password (requires current password)
  app.post("/api/profile/change-password", ensureAuthenticated, async (req: Request, res: Response) => {
     try {
       const user = req.user as any;
       const { currentPassword, newPassword } = req.body;

       // TODO: Add Zod validation for password complexity if needed
       if (!currentPassword || !newPassword) {
         log(`Change password validation failed: Missing fields`, 'API', 'error');
         return res.status(400).json({ message: "Current and new passwords are required." });
       }

       // Fetch full user data including password hash
       // Use storage namespace
       const userData = await storage.getUserById(user.id);
       if (!userData) {
         log(`Change password failed: User not found (ID: ${user.id})`, 'API', 'error');
         return res.status(404).json({ message: "User not found" });
       }

       // Verify current password
       const isMatch = await bcrypt.compare(currentPassword, userData.password);
       if (!isMatch) {
         log(`Change password failed: Incorrect current password for user ${user.email}`, 'API', 'warn');
         return res.status(400).json({ message: "Incorrect current password." });
       }

       // Hash the new password
       const saltRounds = 10;
       const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

       // Update the password in storage
       // Use storage namespace
       await storage.updateUser(user.id, { password: hashedNewPassword }); // Assuming updateUser handles password updates

       log(`Password changed successfully for user: ${user.email}`, 'API');
       return res.status(200).json({ message: "Password updated successfully" });

     } catch (error: any) {
       log(`Change password error: ${error.message}`, "API", 'error');
       return res.status(500).json({ message: "Error changing password" });
     }
  });


  // --- Document Routes ---

  // Report Lost Document
  app.post("/api/documents/lost", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      log(`Received /api/documents/lost request body: ${JSON.stringify(req.body)}`, 'API');

      // --- Placeholder for Image Handling ---
      // TODO: Implement proper image upload (e.g., multer to S3/Cloudinary)
      // For now, assume imageBase64 might be present in req.body if sent from client
      const hasImage = !!req.body.imageBase64;
      const imageUrl = null; // Will be set after successful upload

      // Validate input using Zod schema
      const validation = insertLostDocumentSchema.safeParse({
        ...req.body,
        userId: user.id,
        hasImage: hasImage, // Set based on presence of image data
        imageUrl: imageUrl, // Initially null
        dateLost: req.body.dateLost ? new Date(req.body.dateLost) : null,
        status: 'pending',
        imageBase64: undefined, // Ensure temporary field is not passed to DB insert
      });

      if (!validation.success) {
        log(`Validation failed for /api/documents/lost: ${JSON.stringify(validation.error.flatten())}`, 'API', 'error');
        return res.status(400).json({
            message: "Invalid request data",
            errors: process.env.NODE_ENV === 'development' ? validation.error.flatten().fieldErrors : undefined
        });
      }

      // 1. Create the document record (without final imageUrl yet)
      // Use storage namespace
      const lostDocument = await storage.createLostDocument(validation.data);
      log(`Created lost document record ID: ${lostDocument.id}`, 'API');

      let finalImageUrl = null;
      let aiAnalysisResult = null;

      // 2. Handle Image Upload & Storage (if image data exists)
      if (req.body.imageBase64 && req.body.imageBase64.startsWith('data:image')) {
        try {
          // --- TODO: Replace with actual upload logic ---
          // Example: const uploadResult = await uploadToCloudStorage(req.body.imageBase64, `lost-${lostDocument.id}`);
          // finalImageUrl = uploadResult.url;
          finalImageUrl = `/uploads/placeholder-lost-${lostDocument.id}.png`; // Placeholder
          log(`Simulated image upload for lost doc ${lostDocument.id}: ${finalImageUrl}`, 'Image');

          // Update the record with the actual image URL
          // Use storage namespace
          await storage.updateLostDocument(lostDocument.id, { imageUrl: finalImageUrl, hasImage: true }); // Ensure updateLostDocument exists
        } catch (imgError: any) {
          log(`Image upload/processing failed for lost doc ${lostDocument.id}: ${imgError.message}`, 'Image', 'error');
          // Continue without image, but log the error
        }
      }

      // 3. Perform AI Analysis (Text and/or Image)
      try {
        const description = validation.data.description;
        const imageBase64 = req.body.imageBase64;

        // Use imported function directly
        if (description && process.env.GEMINI_API_KEY) {
          log(`Analyzing text for lost doc ${lostDocument.id}`, 'AI');
          aiAnalysisResult = await analyzeDocumentText(description); // Changed from analyzeDocumentContent
        }
        // Analyze image if text wasn't analyzed or didn't yield results, and image exists
        // Use imported function directly
        if (!aiAnalysisResult && imageBase64 && process.env.GEMINI_API_KEY) {
           log(`Analyzing image for lost doc ${lostDocument.id}`, 'AI');
           aiAnalysisResult = await analyzeDocumentImage(imageBase64);
        }

        // Update document with AI results if any
        if (aiAnalysisResult) {
          log(`AI analysis completed for lost doc ${lostDocument.id}: ${JSON.stringify(aiAnalysisResult)}`, 'AI');
          // Use the imported InsertLostDocument type directly
          const updateData: Partial<InsertLostDocument> = {
            aiAnalysis: aiAnalysisResult // Assuming schema has aiAnalysis field (JSONB)
          };
          // Optionally update documentType or nameOnDocument based on AI confidence
          if (aiAnalysisResult.documentType && ['Other', 'Unknown', ''].includes(lostDocument.documentType)) {
            updateData.documentType = aiAnalysisResult.documentType;
          }
          if (aiAnalysisResult.nameOnDocument && !lostDocument.nameOnDocument) {
             updateData.nameOnDocument = aiAnalysisResult.nameOnDocument;
          }
          // Use storage namespace
          await storage.updateLostDocument(lostDocument.id, updateData);
        }
      } catch (aiError: any) {
        log(`AI analysis failed for lost doc ${lostDocument.id}: ${aiError.message}`, 'AI', 'warn');
        // Non-critical failure
      }

      // 4. Find Potential Matches & Notify
      // Use storage namespace
      const updatedLostDocForMatching = await storage.getLostDocumentById(lostDocument.id) || lostDocument; // Get latest data
      try {
        // Use storage namespace
        const potentialMatches = await storage.findPotentialMatchesForLost(updatedLostDocForMatching);
        log(`Found ${potentialMatches.length} potential matches for lost document ${updatedLostDocForMatching.id}`, "Matching");
        for (const match of potentialMatches) {
           // Use storage namespace
           await storage.createNotification({ // Notify finder
              userId: match.userId,
              message: `A potential match for the ${match.documentType} you found (ID: ${match.id}) has been reported lost.`,
              type: 'match_found', relatedId: match.id
           });
           // Use storage namespace
           await storage.createNotification({ // Notify loser (current user)
              userId: user.id,
              message: `We found a potential match (ID: ${match.id}) for your lost ${updatedLostDocForMatching.documentType} (ID: ${updatedLostDocForMatching.id}).`,
              type: 'match_lost', relatedId: updatedLostDocForMatching.id // Use lost doc ID here
           });
        }
      } catch (matchError: any) {
         log(`Error finding/notifying matches for lost doc ${lostDocument.id}: ${matchError.message}`, 'Matching', 'error');
      }

      // 5. Respond to Client
      // Use storage namespace
      const finalLostDocument = await storage.getLostDocumentById(lostDocument.id) || lostDocument; // Fetch final state
      return res.status(201).json({ message: "Lost document reported successfully", document: finalLostDocument });

    } catch (error: any) {
      log(`Report Lost error: ${error.message}`, "API", 'error');
      console.error(error); // Log full error stack trace
      return res.status(500).json({ message: "Error reporting lost document" });
    }
  });

  // Report Found Document
  app.post("/api/documents/found", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      log(`Received /api/documents/found request body: ${JSON.stringify(req.body)}`, 'API');

      // --- Placeholder for Image Handling ---
      const hasImage = !!req.body.imageBase64;
      const imageUrl = null; // Will be set after successful upload

      // Validate input using Zod schema
      const validation = insertFoundDocumentSchema.safeParse({
        ...req.body,
        userId: user.id,
        hasImage: hasImage,
        imageUrl: imageUrl,
        dateFound: req.body.dateFound ? new Date(req.body.dateFound) : null,
        status: 'pending',
        imageBase64: undefined, // Ensure temporary field is not passed to DB insert
      });

      if (!validation.success) {
        log(`Validation failed for /api/documents/found: ${JSON.stringify(validation.error.flatten())}`, 'API', 'error');
        return res.status(400).json({
            message: "Invalid request data",
            errors: process.env.NODE_ENV === 'development' ? validation.error.flatten().fieldErrors : undefined
        });
      }

      // 1. Create the document record
      // Use storage namespace
      const foundDocument = await storage.createFoundDocument(validation.data);
      log(`Created found document record ID: ${foundDocument.id}`, 'API');

      let finalImageUrl = null;
      let aiAnalysisResult = null;

      // 2. Handle Image Upload & Storage
      if (req.body.imageBase64 && req.body.imageBase64.startsWith('data:image')) {
        try {
          // --- TODO: Replace with actual upload logic ---
          finalImageUrl = `/uploads/placeholder-found-${foundDocument.id}.png`; // Placeholder
          log(`Simulated image upload for found doc ${foundDocument.id}: ${finalImageUrl}`, 'Image');
          // Use storage namespace
          await storage.updateFoundDocument(foundDocument.id, { imageUrl: finalImageUrl, hasImage: true }); // Ensure updateFoundDocument exists
        } catch (imgError: any) {
          log(`Image upload/processing failed for found doc ${foundDocument.id}: ${imgError.message}`, 'Image', 'error');
        }
      }

      // 3. Perform AI Analysis
      try {
        const description = validation.data.description;
        const imageBase64 = req.body.imageBase64;

        // Use imported function directly
        if (description && process.env.GEMINI_API_KEY) {
          log(`Analyzing text for found doc ${foundDocument.id}`, 'AI');
          aiAnalysisResult = await analyzeDocumentText(description); // Changed from analyzeDocumentContent
        }
        // Use imported function directly
        if (!aiAnalysisResult && imageBase64 && process.env.GEMINI_API_KEY) {
           log(`Analyzing image for found doc ${foundDocument.id}`, 'AI');
           aiAnalysisResult = await analyzeDocumentImage(imageBase64);
        }

        if (aiAnalysisResult) {
          log(`AI analysis completed for found doc ${foundDocument.id}: ${JSON.stringify(aiAnalysisResult)}`, 'AI');
          // Use the imported InsertFoundDocument type directly
          const updateData: Partial<InsertFoundDocument> = {
            aiAnalysis: aiAnalysisResult
          };
          if (aiAnalysisResult.documentType && ['Other', 'Unknown', ''].includes(foundDocument.documentType)) {
            updateData.documentType = aiAnalysisResult.documentType;
          }
          // Found documents don't typically have nameOnDocument in the schema, adjust if needed
          // Use storage namespace
          await storage.updateFoundDocument(foundDocument.id, updateData);
        }
      } catch (aiError: any) {
        log(`AI analysis failed for found doc ${foundDocument.id}: ${aiError.message}`, 'AI', 'warn');
      }

      // 4. Find Potential Matches & Notify
      // Use storage namespace
      const updatedFoundDocForMatching = await storage.getFoundDocumentById(foundDocument.id) || foundDocument; // Get latest data
      try {
        // Use storage namespace
        const potentialMatches = await storage.findPotentialMatchesForFound(updatedFoundDocForMatching);
        log(`Found ${potentialMatches.length} potential matches for found document ${updatedFoundDocForMatching.id}`, "Matching");
        for (const match of potentialMatches) {
           // Use storage namespace
           await storage.createNotification({ // Notify loser
              userId: match.userId,
              message: `A document matching the description of your lost ${match.documentType} (ID: ${match.id}) has been found (ID: ${updatedFoundDocForMatching.id}).`,
              type: 'match_lost', relatedId: match.id // Use lost doc ID here
           });
           // Use storage namespace
           await storage.createNotification({ // Notify finder (current user)
              userId: user.id,
              message: `We found a potential match (ID: ${match.id}) for the ${updatedFoundDocForMatching.documentType} you reported finding (ID: ${updatedFoundDocForMatching.id}).`,
              type: 'match_found', relatedId: updatedFoundDocForMatching.id
           });
        }
      } catch (matchError: any) {
         log(`Error finding/notifying matches for found doc ${foundDocument.id}: ${matchError.message}`, 'Matching', 'error');
      }

      // 5. Respond to Client
      // Use storage namespace
      const finalFoundDocument = await storage.getFoundDocumentById(foundDocument.id) || foundDocument; // Fetch final state
      return res.status(201).json({ message: "Found document reported successfully", document: finalFoundDocument });

    } catch (error: any) {
      log(`Report Found error: ${error.message}`, "API", 'error');
      console.error(error); // Log full error stack trace
      return res.status(500).json({ message: "Error reporting found document" });
    }
  });

  // Get user's lost documents
  app.get("/api/documents/lost", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      // Use storage namespace
      const documents = await storage.getUserLostDocuments(user.id); // Ensure this function exists
      return res.status(200).json({ documents }); // Wrap in object
    } catch (error: any) {
      log(`Get user lost documents error: ${error.message}`, "API", 'error');
      return res.status(500).json({ message: "Error retrieving lost documents" });
    }
  });

  // Get user's found documents
  app.get("/api/documents/found", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      // Use storage namespace
      const documents = await storage.getUserFoundDocuments(user.id); // Ensure this function exists
      return res.status(200).json({ documents }); // Wrap in object
    } catch (error: any) {
      log(`Get user found documents error: ${error.message}`, "API", 'error');
      return res.status(500).json({ message: "Error retrieving found documents" });
    }
  });

  // Search documents (Public)
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const { type, query, documentType, location } = req.query;

      if (type !== 'lost' && type !== 'found') {
        return res.status(400).json({ message: "Invalid search type. Use 'lost' or 'found'." });
      }

      const searchParams = {
          query: query as string | undefined,
          documentType: documentType === 'all' ? undefined : documentType as string | undefined,
          location: location === 'all' ? undefined : location as string | undefined,
      };

      let results = [];
      if (type === 'lost') {
        // Use storage namespace
        results = await storage.searchLostDocuments(searchParams);
      } else {
        // Use storage namespace
        results = await storage.searchFoundDocuments(searchParams);
      }

      return res.status(200).json({ results }); // Return wrapped in 'results' key
    } catch (error: any) {
      log(`Search error: ${error.message}`, "API", 'error');
      return res.status(500).json({ message: "Error searching documents" });
    }
  });

  // --- Notification Routes ---

  // Get user's notifications
  app.get("/api/notifications", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      // Use storage namespace
      const notificationsFromDb = await storage.getUserNotifications(user.id);
      const notifications = notificationsFromDb.map(n => ({
        ...n,
        isRead: n.read // Map 'read' to 'isRead'
      }));
      return res.status(200).json({ notifications }); // Wrap in object
    } catch (error: any) {
      log(`Get notifications error: ${error.message}`, "API", 'error');
      return res.status(500).json({ message: "Error retrieving notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id", ensureAuthenticated, async (req: Request, res: Response) => {
     try {
       const user = req.user as any;
       const notificationId = parseInt(req.params.id, 10);
       if (isNaN(notificationId)) {
         return res.status(400).json({ message: "Invalid notification ID" });
       }

       // Use storage namespace
       const notification = await storage.getNotificationById(notificationId); // Ensure this function exists
       if (!notification || notification.userId !== user.id) {
         return res.status(404).json({ message: "Notification not found or access denied" });
       }

       if (notification.read) {
          return res.status(200).json({ message: "Notification already marked as read", notification: { ...notification, isRead: true } });
       }

       // Use storage namespace
       // Use Partial<Notification> for the update data type
       const updatedNotification = await storage.updateNotification(notificationId, { read: true } as Partial<Notification>);
       if (!updatedNotification) {
          return res.status(404).json({ message: "Notification not found during update" });
       }
       const result = { ...updatedNotification, isRead: updatedNotification.read };
       return res.status(200).json({ message: "Notification marked as read", notification: result });
     } catch (error: any) {
       log(`Update notification error: ${error.message}`, "API", 'error');
       return res.status(500).json({ message: "Error updating notification" });
     }
  });

  // --- Dashboard Route ---
  app.get("/api/dashboard", ensureAuthenticated, async (req: Request, res: Response) => {
     try {
       const user = req.user as any;
       // Use storage namespace for all calls
       const [stats, activities, potentialMatchesCount] = await Promise.all([
         storage.getUserStats(user.id),
         storage.getRecentUserActivity(user.id, 10), // Limit activities
         storage.getPotentialMatchCount(user.id)
       ]);

       // Map activity icons (ensure consistency with storage function and frontend)
       const mappedActivities = activities.map(act => ({
          ...act,
          icon: act.type === 'reported_lost' ? 'FileUp' :
                act.type === 'reported_found' ? 'HandHelping' :
                act.type === 'match_found' ? 'CheckCircle2' : // Example for found match notification
                act.type === 'match_lost' ? 'CheckCircle2' : // Example for lost match notification
                'Bell' // Default
       }));

       // Adjust stats mapping based on the returned object from storage.getUserStats
       return res.status(200).json({
         stats: {
            documentsLost: stats.documentsLost,
            documentsFound: stats.documentsFound,
            successfulMatches: stats.successfulMatches,
            pendingMatches: stats.pendingMatches,
         },
         activities: mappedActivities,
         potentialMatches: potentialMatchesCount, // This might be redundant if included in stats
       });
     } catch (error: any) {
       log(`Dashboard error: ${error.message}`, "API", 'error');
       return res.status(500).json({ message: "Error fetching dashboard data" });
     }
  });

  // --- Server Setup ---
  const httpServer = createServer(app);
  return httpServer;
}