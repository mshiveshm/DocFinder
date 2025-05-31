

// import dotenv from 'dotenv';
// dotenv.config(); // Load .env file variables AT THE VERY TOP

// import express from "express";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";
// import { type ViteDevServer } from "vite";

// const PORT = process.env.PORT || 5000;
// const NODE_ENV = process.env.NODE_ENV || "development";

// (async () => {
//   const app = express();
//   app.set("env", NODE_ENV);

//   // --- Core Middleware ---
//   // Trust proxy headers (useful if behind Nginx, Heroku, etc.)
//   app.set('trust proxy', 1);
//   // Middleware for parsing JSON request bodies - INCREASE LIMIT HERE
//   app.use(express.json({ limit: '50mb' })); // Increased from 10mb
//   // Middleware for parsing URL-encoded request bodies - INCREASE LIMIT HERE
//   app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased from 10mb

//   log(`Starting server in ${NODE_ENV} mode...`, "Server");

//   // Register API routes, session, passport, etc.
//   const server = await registerRoutes(app);

//   let vite: ViteDevServer | undefined;
//   if (NODE_ENV === "development") {
//     vite = await setupVite(app);
//   } else {
//     // Production: Serve static files after API routes are defined
//     serveStatic(app);
//   }

//   // --- Error Handling Middleware (Basic Example) ---
//   // Should be defined AFTER all other routes and middleware
//   app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     log(`Unhandled error: ${err.message || err}`, 'Error', 'error');
//     console.error(err.stack); // Log stack trace for debugging
//     res.status(err.status || 500).json({
//       message: err.message || 'Internal Server Error',
//       // Optionally include stack trace in development
//       stack: NODE_ENV === 'development' ? err.stack : undefined,
//     });
//   });

//   // Start the HTTP server
//   server.listen(PORT, () => {
//     log(`Server listening on http://localhost:${PORT}`, "Server");
//   });

//   // Graceful shutdown handling (optional but recommended)
//   const signals = ['SIGINT', 'SIGTERM'];
//   signals.forEach(signal => {
//     process.on(signal, async () => {
//       log(`Received ${signal}, shutting down gracefully...`, 'Server');
//       server.close(async (err) => {
//         if (err) {
//           log(`Error during server close: ${err}`, 'Server', 'error');
//           process.exit(1);
//         }
//         // Close database connections, etc.
//         // await storage.closeDbConnection(); // Assuming a function exists in storage.ts
//         log('Server closed.', 'Server');
//         process.exit(0);
//       });

//       // Force shutdown after timeout
//       setTimeout(() => {
//         log('Graceful shutdown timeout, forcing exit.', 'Server', 'warn');
//         process.exit(1);
//       }, 10000); // 10 seconds timeout
//     });
//   });

// })();



import dotenv from 'dotenv';
dotenv.config(); // Load .env file variables AT THE VERY TOP

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { type Server as HttpServer } from "node:http"; // Renamed to avoid conflict if Server is used elsewhere
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { type ViteDevServer } from "vite";

const PORT = process.env.PORT || 5000; // Vercel provides the PORT environment variable
const NODE_ENV = process.env.NODE_ENV || "development";

// Create the Express app instance at the module scope
const app: Express = express();

// Asynchronous function to set up the app
async function initializeApp(currentApp: Express): Promise<HttpServer> {
  currentApp.set("env", NODE_ENV); // Explicitly set environment

  // --- Core Middleware ---
  currentApp.set('trust proxy', 1); // Important for running behind a proxy like Vercel
  currentApp.use(express.json({ limit: '50mb' }));
  currentApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

  log(`Initializing server in ${NODE_ENV} mode...`, "Server:Init");

  // Register API routes, session, passport, etc.
  // This function modifies `currentApp` by adding routes and middleware.
  // It also returns an HttpServer instance, which we'll use for local listening.
  const httpServerInstance = await registerRoutes(currentApp);

  let viteDevServer: ViteDevServer | undefined;
  if (NODE_ENV === "development") {
    // setupVite adds Vite's dev middleware to currentApp
    viteDevServer = await setupVite(currentApp);
  } else {
    // Production: Serve static files.
    // Vercel's vercel.json handles static serving at the edge primarily.
    // This serveStatic call is more for local `npm start` or other platforms.
    // It should be called after API routes are defined by registerRoutes.
    serveStatic(currentApp);
  }

  // --- Error Handling Middleware ---
  // Must be defined AFTER all other routes and middleware
  currentApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
    log(`Unhandled error: ${err.message || err} for ${req.method} ${req.path}`, 'Server:Error', 'error');
    console.error(err.stack); // Log stack trace for debugging
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      stack: NODE_ENV === 'development' ? err.stack : undefined,
    });
  });

  log('App initialization complete.', 'Server:Init');
  return httpServerInstance; // Return the server instance for local use
}

// Initialize the app and handle local server startup
let localHttpServer: HttpServer;

initializeApp(app)
  .then(serverInstanceFromInit => {
    localHttpServer = serverInstanceFromInit; // Store for local server start & shutdown

    // Start listening only if NOT on Vercel (Vercel handles invocation differently)
    if (!process.env.VERCEL) {
      localHttpServer.listen(PORT, () => {
        log(`Local server listening on http://localhost:${PORT}`, "Server:Local");
      });

      // Graceful shutdown handling for the local server
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach(signal => {
        process.on(signal, async () => {
          log(`Received ${signal}, shutting down local server gracefully...`, 'Server:Local');
          localHttpServer.close(async (err) => {
            if (err) {
              log(`Error during local server close: ${err.message}`, 'Server:Local', 'error');
              process.exit(1);
            }
            // Example: await storage.closeDbConnection();
            log('Local server closed.', 'Server:Local');
            process.exit(0);
          });

          // Force shutdown after timeout if graceful shutdown hangs
          setTimeout(() => {
            log('Local graceful shutdown timeout, forcing exit.', 'Server:Local', 'warn');
            process.exit(1);
          }, 10000); // 10 seconds timeout
        });
      });
    }
  })
  .catch(error => {
    log(`FATAL: Failed to initialize app: ${error.message}`, 'Server:Fatal', 'error');
    console.error(error); // Log the full error
    process.exit(1); // Exit if app initialization fails
  });

// Export the configured Express app for Vercel
export default app;