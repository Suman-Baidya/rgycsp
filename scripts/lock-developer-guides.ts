import { db } from "../src/lib/prisma";

async function main() {
  const result = await db.userGuide.updateMany({
    where: {
      OR: [
        { createdByRole: "DEVELOPER" },
        { targetRole: "SUPER_ADMIN" }
      ]
    },
    data: {
      isLocked: true,
      version: "1.0.0",
    }
  });

  console.log(`Successfully locked ${result.count} official developer guides.`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
