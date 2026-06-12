import { db as prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Reading rgycsp_courses.json...');
  const filePath = path.join(process.cwd(), 'rgycsp_courses.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const courses = data.courses;

  if (!courses || !Array.isArray(courses)) {
    console.error('No courses array found in JSON.');
    return;
  }

  console.log(`Found ${courses.length} courses to seed.`);

  // Optional: Clear existing global courses first if you want a clean slate
  // await prisma.globalCourse.deleteMany({});
  // console.log('Cleared existing GlobalCourse entries.');

  let successCount = 0;
  for (const course of courses) {
    try {
      await prisma.globalCourse.create({
        data: {
          groupId: course.group,
          short: course.short,
          name: course.name,
          description: course.description,
          duration: course.duration,
          price: course.price,
          priceDisplay: course.price_display,
          rating: course.rating,
          demand: course.demand,
          popular: course.popular || false,
          banner: course.banner,
          syllabus: course.syllabus || {},
          isActive: true,
        },
      });
      successCount++;
    } catch (error) {
      console.error(`Failed to insert course: ${course.name}`, error);
    }
  }

  console.log(`Successfully seeded ${successCount} courses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
