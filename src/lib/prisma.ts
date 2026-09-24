import 'dotenv/config'; // Updated: 2026-04-29T09:26:00Z
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
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

let prismaArgs: { adapter?: any } = {};
if (!globalThis.prisma && connectionString) {
  const isNeon = connectionString.includes('neon.tech');
  if (isNeon) {
    const adapter = new PrismaNeon({ connectionString });
    prismaArgs = { adapter };
  } else {
    // Standard PostgreSQL (Local Docker / Dokploy on VPS)
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaArgs = { adapter };
  }
} else if (!connectionString && !globalThis.prisma) {
  console.warn("PRISMA: DATABASE_URL is not set. Prisma will likely fail unless provided via config.");
}



export const db =
  globalThis.prisma ||
  new PrismaClient({
    ...prismaArgs,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// Trigger Next.js recompile to load the updated Prisma Client (Product and ProductOrder added)
// Last Updated: 2026-06-26T14:05:00Z

// trigger reload for new schema models: ProductVariant, StoreConfig, ProductOrderItem
// Last Updated: 2026-07-04T09:28:01+05:30
// trigger reload for documentsPrinted field
// Last Updated: 2026-07-15
