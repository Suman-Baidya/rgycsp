const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const initialGroups = [
    { value: "all", label: "All Categories" },
    { value: "diploma", label: "Diploma Courses" },
    { value: "office", label: "Office & Computer" },
    { value: "kids", label: "Kids Computer" },
    { value: "ai", label: "AI Courses" },
    { value: "programming", label: "Programming & Web" },
    { value: "design", label: "Designing Courses" },
    { value: "degree", label: "Degree Courses" },
    { value: "special", label: "Special Courses" },
  ];

  for (const group of initialGroups) {
    await prisma.globalCourseGroup.upsert({
      where: { value: group.value },
      update: {},
      create: {
        value: group.value,
        label: group.label,
        isActive: true
      }
    });
  }
  console.log("Done seeding groups.");
}
main();
