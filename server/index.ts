
// import dotenv from 'dotenv';
// dotenv.config();

// import express, { type Express, type Request, type Response, type NextFunction } from "express";
// import { type Server as HttpServer } from "node:http";
// import { registerRoutes } from "./routes";
// import { setupVite, serveStatic, log } from "./vite";


// const PORT = process.env.PORT || 5000;
// const NODE_ENV = process.env.NODE_ENV || "development";

// let initializedApp: Express | null = null;
// let initPromise: Promise<Express> | null = null;

// async function getInitializedApp(): Promise<Express> {
//   if (initializedApp) {
//     return initializedApp;
//   }
//   if (initPromise) {
//     return initPromise;
//   }

//   const app: Express = express();
//   log(`INITIALIZING APP (PID: ${process.pid}) - NODE_ENV: ${NODE_ENV}`, "Server:CoreInit");

//   app.set("env", NODE_ENV);
//   app.set('trust proxy', 1);
//   app.use(express.json({ limit: '50mb' }));
//   app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//   // `registerRoutes` modifies `app` and returns an HttpServer for local use
//   await registerRoutes(app);
//   log('Routes registered.', "Server:CoreInit");

//   if (NODE_ENV === "development" && !process.env.VERCEL) { // Vite only for local dev
//     await setupVite(app);
//   } else if (!process.env.VERCEL) { // Static serving only for local prod
//     serveStatic(app);
//   }
//   // Vercel's vercel.json handles static + SPA fallback at the edge

//   app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//     log(`Unhandled error: ${err.message || err} for ${req.method} ${req.path}`, 'Server:Error', 'error');
//     console.error(err.stack);
//     res.status(err.status || 500).json({
//       message: err.message || 'Internal Server Error',
//       stack: NODE_ENV === 'development' ? err.stack : undefined,
//     });
//   });

//   log('App initialization complete.', "Server:CoreInit");
//   initializedApp = app;
//   return app;
// }

// // For Vercel: export a function that ensures initialization and then calls the app
// export default async function handler(req: Request, res: Response) {
//   try {
//     const app = await getInitializedApp();
//     return app(req, res); // Call the Express app as a handler
//   } catch (error: any) {
//     log(`FATAL: Error during handler execution or app initialization: ${error.message}`, 'Server:HandlerFatal', 'error');
//     console.error(error);
//     res.status(500).json({ message: "Server initialization failed or runtime error." });
//   }
// }

// // --- Local Development Server ---
// if (!process.env.VERCEL) {
//   (async () => {
//     try {
//       // For local dev, we need the HttpServer instance returned by registerRoutes
//       // This is a bit tricky because getInitializedApp now returns the Express app.
//       // We might need to adjust registerRoutes or have a separate local init.
//       // For now, let's focus on the Vercel export.
//       // A simpler local setup for now:
//       const localApp = express();
//       localApp.set("env", NODE_ENV);
//       localApp.set('trust proxy', 1);
//       localApp.use(express.json({ limit: '50mb' }));
//       localApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
//       const localHttpServer = await registerRoutes(localApp); // registerRoutes returns HttpServer

//       if (NODE_ENV === "development") {
//         await setupVite(localApp);
//       } else {
//         serveStatic(localApp);
//       }
//       localApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
//         log(`Unhandled error (local): ${err.message}`, "Server:Error", "error");
//         res.status(err.status || 500).json({ message: err.message });
//       });


//       localHttpServer.listen(PORT, () => {
//         log(`Local server listening on http://localhost:${PORT}`, "Server:Local");
//       });

//       const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
//       signals.forEach(signal => {
//         process.on(signal, () => {
//           log(`Received ${signal}, shutting down local server...`, 'Server:Local');
//           localHttpServer.close(() => {
//             log('Local server closed.', 'Server:Local');
//             process.exit(0);
//           });
//           setTimeout(() => process.exit(1), 10000);
//         });
//       });

//     } catch (error: any) {
//       log(`FATAL: Failed to start local server: ${error.message}`, 'Server:LocalFatal', 'error');
//       process.exit(1);
//     }
//   })();
// }


import dotenv from 'dotenv';
dotenv.config();

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { type Server as HttpServer } from "node:http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite"; // Make sure vite helpers are imported

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

let appPromise: Promise<Express>;

// This function will configure the app instance
async function initializeApp(): Promise<{ app: Express, server: HttpServer }> {
  const app: Express = express();
  log(`Initializing app in ${NODE_ENV} mode...`, "Server:Init");

  app.set("env", NODE_ENV);
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // registerRoutes modifies the app and returns an HttpServer instance
  const httpServer = await registerRoutes(app);
  log('Routes registered.', "Server:Init");

  // Add final error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    log(`Unhandled error: ${err.message || err} for ${req.method} ${req.path}`, 'Server:Error', 'error');
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  log('App initialization complete.', "Server:Init");
  return { app, server: httpServer };
}

// --- Vercel Export ---
// We create a promise that resolves to the configured app for Vercel
appPromise = initializeApp().then(({ app }) => app);
export default appPromise;


// --- Local Development Server ---
// This block will only run when you are NOT on Vercel (e.g., `npm run dev`)
if (!process.env.VERCEL) {
  (async () => {
    try {
      const { server, app } = await initializeApp();

      // Add Vite dev server or static serving for local development
      if (NODE_ENV === "development") {
        await setupVite(app); // setupVite adds middleware to the app
      } else {
        serveStatic(app); // serveStatic adds middleware for production assets
      }

      server.listen(PORT, () => {
        log(`Local server listening on http://localhost:${PORT}`, "Server:Local");
      });

      // Graceful shutdown for local server
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
      signals.forEach(signal => {
        process.on(signal, () => {
          log(`Received ${signal}, shutting down local server...`, 'Server:Local');
          server.close(() => {
            log('Local server closed.', 'Server:Local');
            process.exit(0);
          });
          setTimeout(() => process.exit(1), 10000);
        });
      });

    } catch (error: any) {
      log(`FATAL: Failed to start local server: ${error.message}`, 'Server:LocalFatal', 'error');
      process.exit(1);
    }
  })();
}