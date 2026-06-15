import 'dotenv/config'; // Updated: 2026-04-29T09:26:00Z
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Required for compatibility with certain environments (e.g. Node vs Edge)
neonConfig.webSocketConstructor = ws;

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "development") {
  const maskedUrl = connectionString ? connectionString.split('@')[1]?.substring(0, 30) : "MISSING";
  console.log("PRISMA: Initializing with host segment:", maskedUrl);
}

let prismaArgs = {};
if (connectionString) {
  const adapter = new PrismaNeon({ connectionString });
  prismaArgs = { adapter };
} else {
  console.warn("PRISMA: DATABASE_URL is not set. Prisma will likely fail unless provided via config.");
}

if (globalThis.prisma && (!('franchiseApplication' in globalThis.prisma) || !('globalCourse' in globalThis.prisma))) {
  console.log("PRISMA: Schema changed, clearing globalThis.prisma cache");
  globalThis.prisma = undefined;
}

export const db =
  globalThis.prisma ||
  new PrismaClient({
    ...prismaArgs,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// Trigger Next.js recompile to load the updated Prisma Client (hostName field added)
// Last Updated: 2026-06-14T03:07:00Z
