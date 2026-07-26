const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ws = await prisma.workspace.findUnique({ where: { subdomain: 'example' } });
  console.log("WORKSPACE:", ws);
}

main().finally(() => prisma.$disconnect());
