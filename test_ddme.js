const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    where: {
      title: {
        contains: 'DDME'
      }
    }
  });
  console.log(JSON.stringify(courses, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
