import { db } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function upsertPassword() {
  const email = "suman.baidya.pro@gmail.com";
  const newPassword = "Suman2002";
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const user = await db.user.upsert({
      where: { email },
      update: { passwordHash: hashedPassword, role: 'SUPER_ADMIN' },
      create: {
        email,
        name: "Suman Baidya",
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
      }
    });
    
    console.log(`Password updated successfully for ${email}. User ID: ${user.id}`);
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

upsertPassword();
