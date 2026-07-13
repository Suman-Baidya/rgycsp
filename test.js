const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ select: { id: true, title: true, duration: true } });
  console.log(courses.filter(c => c.title.includes('DDME') || c.duration !== '1'));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
