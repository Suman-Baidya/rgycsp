import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findFirst({
    where: { workspaceId: null },
  });
  console.log("Current Global Settings:", JSON.stringify(settings, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
