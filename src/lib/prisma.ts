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

const rawConnectionString = process.env.DATABASE_URL;
// Upgrade sslmode=require to sslmode=verify-full if needed to prevent node-postgres / pg-connection-string security warning
const connectionString = rawConnectionString
  ? (rawConnectionString.includes('sslmode=require') && !rawConnectionString.includes('uselibpqcompat')
      ? rawConnectionString.replace('sslmode=require', 'sslmode=verify-full')
      : rawConnectionString)
  : undefined;

if (process.env.NODE_ENV === "development") {
  const maskedUrl = connectionString ? connectionString.split('@')[1]?.substring(0, 30) : "MISSING";
  console.log("PRISMA: Initializing with host segment:", maskedUrl);
}

function createPrismaClient(): PrismaClient {
  let prismaArgs: { adapter?: any } = {};
  if (connectionString) {
    const useNeonWebSocket = process.env.PRISMA_USE_NEON_WEBSOCKET === "true";
    if (useNeonWebSocket && connectionString.includes('neon.tech')) {
      const adapter = new PrismaNeon({ connectionString });
      prismaArgs = { adapter };
    } else {
      // Standard PostgreSQL connection pool (Robust TCP connection handling with automatic retry & reconnect)
      const pool = new pg.Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      pool.on('error', (err) => {
        console.warn('PRISMA: PG Pool idle client disconnected (auto-reconnecting):', err.message);
      });
      const adapter = new PrismaPg(pool);
      prismaArgs = { adapter };
    }
  } else {
    console.warn("PRISMA: DATABASE_URL is not set. Prisma will likely fail unless provided via config.");
  }

  return new PrismaClient({
    ...prismaArgs,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

async function checkDemoWritePermission(model?: string, action?: string, args?: any) {
  if (process.env.ENABLE_DEMO_RESTRICTIONS !== "true") return;
  // Always permit login tracking and NextAuth sessions
  if (model === "UserAccessLog" || model === "Session" || model === "Account") return;

  // Fast check via proxy request header (no recursive database or auth calls)
  try {
    const { headers } = await import("next/headers");
    const headerList = await headers();
    if (headerList.get("x-is-demo-user") === "true") {
      if (model === "User") {
        // Block all User deletions and creations by demo user
        if (action === "delete" || action === "deleteMany" || action === "create" || action === "createMany") {
          throw new Error("You Can't Edit as Demo Preview");
        }
        // If updating a user, only allow non-destructive telemetry (lastSeen, lastLoginAt, lastActive)
        if (action === "update" || action === "updateMany" || action === "upsert") {
          const dataKeys = Object.keys(args?.data || {});
          const allowedTelemetryKeys = ["lastSeen", "lastLoginAt", "lastActive", "presence"];
          const isOnlyTelemetry = dataKeys.length > 0 && dataKeys.every((k) => allowedTelemetryKeys.includes(k));
          if (!isOnlyTelemetry) {
            throw new Error("You Can't Edit as Demo Preview");
          }
        }
      } else {
        // Any write to any other model is strictly prohibited for demo user
        throw new Error("You Can't Edit as Demo Preview");
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("You Can't Edit as Demo Preview")) {
      throw err;
    }
  }
}

function applyDemoProtection(client: PrismaClient): PrismaClient {
  if (process.env.ENABLE_DEMO_RESTRICTIONS !== "true") {
    return client;
  }
  return (client as any).$extends({
    query: {
      $allModels: {
        async create({ model, args, query }: any) {
          await checkDemoWritePermission(model, "create", args);
          return query(args);
        },
        async update({ model, args, query }: any) {
          await checkDemoWritePermission(model, "update", args);
          return query(args);
        },
        async delete({ model, args, query }: any) {
          await checkDemoWritePermission(model, "delete", args);
          return query(args);
        },
        async upsert({ model, args, query }: any) {
          await checkDemoWritePermission(model, "upsert", args);
          return query(args);
        },
        async createMany({ model, args, query }: any) {
          await checkDemoWritePermission(model, "createMany", args);
          return query(args);
        },
        async updateMany({ model, args, query }: any) {
          await checkDemoWritePermission(model, "updateMany", args);
          return query(args);
        },
        async deleteMany({ model, args, query }: any) {
          await checkDemoWritePermission(model, "deleteMany", args);
          return query(args);
        },
      }
    }
  }) as PrismaClient;
}

const basePrisma = globalThis.prisma || createPrismaClient();

export const db = applyDemoProtection(basePrisma);

if (process.env.NODE_ENV !== "production") globalThis.prisma = basePrisma;

// Trigger Next.js recompile to load the updated Prisma Client (Product and ProductOrder added)
// Last Updated: 2026-06-26T14:05:00Z

// trigger reload for new schema models: ProductVariant, StoreConfig, ProductOrderItem
// Last Updated: 2026-07-04T09:28:01+05:30
// trigger reload for documentsPrinted field
// Last Updated: 2026-07-15
