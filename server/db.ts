

// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";
// import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );
// }

// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });


import dotenv from 'dotenv';
dotenv.config(); // Add this line

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema'; // Assuming schema import

// Check if DATABASE_URL is set *after* dotenv.config() has run
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database or check your .env file?",
  );
}

// Now it's safe to create the pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL config for production if not already here
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Export the Drizzle instance
export const db = drizzle(pool, { schema });

// You might also export the pool if needed elsewhere
// export { pool };
