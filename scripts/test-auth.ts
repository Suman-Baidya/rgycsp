import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || 'RGY123456';
  const password = process.argv[3] || 'Password123';

  console.log(`Testing login for: ${username}`);
  
  const user = await prisma.user.findFirst({
    where: { 
      username: {
        equals: username,
        mode: 'insensitive'
      }
    },
    include: {
      studentProfile: {
        include: { workspace: true }
      }
    }
  });

  if (!user) {
    console.log("User not found in database.");
    return;
  }

  console.log(`User found! ID: ${user.id}`);
  console.log(`Role: ${user.role}`);
  console.log(`Has Student Profile: ${user.studentProfile.length > 0}`);

  if (!user.passwordHash) {
    console.log("User has no password hash.");
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  console.log(`Password Valid: ${isPasswordValid}`);
  
  if (isPasswordValid && user.studentProfile.length > 0) {
     console.log(`Would redirect to: /app/${user.studentProfile[0].workspace.subdomain}/student/dashboard`);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
