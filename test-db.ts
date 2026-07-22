import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.studentProfile.findMany({
    include: {
      user: true,
      workspace: true
    }
  });
  console.log(JSON.stringify(students, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
