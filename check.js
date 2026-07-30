const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.workspace.findMany().then(w => console.log(w.map(x => x.subdomain))).finally(() => prisma.$disconnect());
