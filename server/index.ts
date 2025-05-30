// import "dotenv/config"; 
// import express, { type Request, Response, NextFunction } from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";



// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//   const start = Date.now();
//   const path = req.path;
//   let capturedJsonResponse: Record<string, any> | undefined = undefined;

//   const originalResJson = res.json;
//   res.json = function (bodyJson, ...args) {
//     capturedJsonResponse = bodyJson;
//     return originalResJson.apply(res, [bodyJson, ...args]);
//   };

//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     if (path.startsWith("/api")) {
//       let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
//       if (capturedJsonResponse) {
//         logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
//       }

//       if (logLine.length > 80) {
//         logLine = logLine.slice(0, 79) + "…";
//       }

//       log(logLine);
//     }
//   });

//   next();
// });

// (async () => {
//   const server = await registerRoutes(app);

//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     res.status(status).json({ message });
//     throw err;
//   });

//   // importantly only setup vite in development and after
//   // setting up all the other routes so the catch-all route
//   // doesn't interfere with the other routes
//   if (app.get("env") === "development") {
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   // ALWAYS serve the app on port 5000
//   // this serves both the API and the client.
//   // It is the only port that is not firewalled.
//   const port = 5000;
//   server.listen({
//     port,
//     host: "0.0.0.0",
//     reusePort: true,
//   }, () => {
//     log(`serving on port ${port}`);
//   });
// })();

import dotenv from 'dotenv';
dotenv.config(); // Load .env file variables AT THE VERY TOP

import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { type ViteDevServer } from "vite";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

(async () => {
  const app = express();
  app.set("env", NODE_ENV);

  // --- Core Middleware ---
  // Trust proxy headers (useful if behind Nginx, Heroku, etc.)
  app.set('trust proxy', 1);
  // Middleware for parsing JSON request bodies - INCREASE LIMIT HERE
  app.use(express.json({ limit: '50mb' })); // Increased from 10mb
  // Middleware for parsing URL-encoded request bodies - INCREASE LIMIT HERE
  app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased from 10mb

  log(`Starting server in ${NODE_ENV} mode...`, "Server");

  // Register API routes, session, passport, etc.
  const server = await registerRoutes(app);

  let vite: ViteDevServer | undefined;
  if (NODE_ENV === "development") {
    vite = await setupVite(app);
  } else {
    // Production: Serve static files after API routes are defined
    serveStatic(app);
  }

  // --- Error Handling Middleware (Basic Example) ---
  // Should be defined AFTER all other routes and middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    log(`Unhandled error: ${err.message || err}`, 'Error', 'error');
    console.error(err.stack); // Log stack trace for debugging
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      // Optionally include stack trace in development
      stack: NODE_ENV === 'development' ? err.stack : undefined,
    });
  });

  // Start the HTTP server
  server.listen(PORT, () => {
    log(`Server listening on http://localhost:${PORT}`, "Server");
  });

  // Graceful shutdown handling (optional but recommended)
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      log(`Received ${signal}, shutting down gracefully...`, 'Server');
      server.close(async (err) => {
        if (err) {
          log(`Error during server close: ${err}`, 'Server', 'error');
          process.exit(1);
        }
        // Close database connections, etc.
        // await storage.closeDbConnection(); // Assuming a function exists in storage.ts
        log('Server closed.', 'Server');
        process.exit(0);
      });

      // Force shutdown after timeout
      setTimeout(() => {
        log('Graceful shutdown timeout, forcing exit.', 'Server', 'warn');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    });
  });

})();