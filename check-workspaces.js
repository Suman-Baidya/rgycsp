const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || 'postgres://neondb_owner:n0c7vPwZBSkf@ep-soft-dust-ao5wgp20-pooler.centralindia.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, subdomain: true, isActive: true }
  });
  console.log("Workspaces in DB:");
  console.log(JSON.stringify(workspaces, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
