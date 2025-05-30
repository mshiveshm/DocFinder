// import express, { type Express } from "express";
// import fs from "fs";
// import path from "path";
// import { createServer as createViteServer, createLogger } from "vite";
// import { type Server } from "http";
// import viteConfig from "../vite.config";
// import { nanoid } from "nanoid";

// const viteLogger = createLogger();

// export function log(message: string, source = "express") {
//   const formattedTime = new Date().toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });

//   console.log(`${formattedTime} [${source}] ${message}`);
// }

// export async function setupVite(app: Express, server: Server) {
//   const serverOptions = {
//     middlewareMode: true,
//     hmr: { server },
//     allowedHosts: true,
//   };

//   const vite = await createViteServer({
//     ...viteConfig,
//     configFile: false,
//     customLogger: {
//       ...viteLogger,
//       error: (msg, options) => {
//         viteLogger.error(msg, options);
//         process.exit(1);
//       },
//     },
//     server: serverOptions,
//     appType: "custom",
//   });

//   app.use(vite.middlewares);
//   app.use("*", async (req, res, next) => {
//     const url = req.originalUrl;

//     try {
//       const clientTemplate = path.resolve(
//         import.meta.dirname,
//         "..",
//         "client",
//         "index.html",
//       );

//       // always reload the index.html file from disk incase it changes
//       let template = await fs.promises.readFile(clientTemplate, "utf-8");
//       template = template.replace(
//         `src="/src/main.tsx"`,
//         `src="/src/main.tsx?v=${nanoid()}"`,
//       );
//       const page = await vite.transformIndexHtml(url, template);
//       res.status(200).set({ "Content-Type": "text/html" }).end(page);
//     } catch (e) {
//       vite.ssrFixStacktrace(e as Error);
//       next(e);
//     }
//   });
// }

// // ...existing code...

// export function serveStatic(app: Express) {
//   // Change this line:
//   // const distPath = path.resolve(import.meta.dirname, "public");
//   // To this: (Go up one level from 'server' to the project root, then into 'dist')
//   const distPath = path.resolve(import.meta.dirname, "..", "dist");

//   if (!fs.existsSync(distPath)) {
//     throw new Error(
//       `Could not find the build directory: ${distPath}, make sure to build the client first`,
//     );
//   }

//   app.use(express.static(distPath));

//   // fall through to index.html if the file doesn't exist
//   app.use("*", (_req, res) => {
//     // Ensure this also points to the correct dist directory
//     res.sendFile(path.resolve(distPath, "index.html"));
//   });
// }


import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite"; // Added ViteDevServer type
// Removed unused imports: Server from http, viteConfig, nanoid
// Removed unused variable: viteLogger

// CORRECTED log function (accepts 3 arguments)
export function log(msg: string, scope = "Vite", type: 'info' | 'error' | 'warn' = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const formattedScope = scope.padEnd(8); // Adjust padding as needed
  const colorMap = {
    info: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warn: '\x1b[33m', // Yellow
    reset: '\x1b[0m'  // Reset color
  };
  // Use console.error for errors, console.warn for warnings, console.log otherwise
  const logMethod = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log;
  logMethod(`${timestamp} [${formattedScope}] ${colorMap[type]}${msg}${colorMap.reset}`);
}


// Simplified setupVite for SPA development (matches previous index.ts structure)
export async function setupVite(app: Express): Promise<ViteDevServer> { // Return ViteDevServer
  log("Setting up Vite dev server...");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa", // Use 'spa' for standard client-side routing apps
    logLevel: "warn", // Reduce Vite's own logging noise
    // Removed custom logger, hmr, serverOptions, configFile, etc. for simplicity
    // Assuming vite.config.ts is used automatically
  });
  // use vite's connect instance as middleware
  app.use(vite.middlewares);
  log("Vite dev server middleware attached.");
  return vite; // Return the vite instance
}


// CORRECTED serveStatic function (points to dist/public)
export function serveStatic(app: Express) {
  log("Configuring static file serving for production...");
  // Point to the 'public' subfolder within 'dist' where Vite builds the client
  // Assumes your build output is in 'dist/public'
  const distPublicPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  log(`Serving static files from: ${distPublicPath}`);

  if (!fs.existsSync(distPublicPath)) {
    const errorMsg = `Build directory not found: ${distPublicPath}. Make sure to run 'npm run build' first.`;
    log(errorMsg, 'Static', 'error');
    throw new Error(errorMsg);
  }

  // Serve static files (like CSS, JS, images) from the 'dist/public' directory
  // maxAge sets Cache-Control header (e.g., 1 year) for better performance
  app.use(express.static(distPublicPath, { maxAge: '1y', immutable: true }));

  // Fallback for client-side routing: serve index.html for any unknown GET path
  app.get("*", (req, res, next) => {
    // Avoid serving index.html for API routes or specific file requests
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
       return next(); // Pass to 404 handler or other middleware
    }
    // Ensure this points to the index.html within the correct dist/public directory
    const indexPath = path.resolve(distPublicPath, "index.html");
    res.sendFile(indexPath, (err) => {
       if (err) {
          log(`Error sending index.html: ${err}`, 'Static', 'error');
          // Avoid sending another response if headers might have been sent
          if (!res.headersSent) {
            res.status(500).send("Error serving application.");
          }
       }
    });
  });
  log("Static file serving and SPA fallback configured.");
}