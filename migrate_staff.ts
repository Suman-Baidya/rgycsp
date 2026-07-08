import { db } from './src/lib/prisma';

async function main() {
  try {
    const result = await db.workspaceRole.updateMany({
      where: {
        role: "STAFF"
      },
      data: {
        role: "MANAGER"
      }
    });

    console.log(`Migrated ${result.count} STAFF roles to MANAGER.`);
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    // optional disconnect
  }
}

main();
