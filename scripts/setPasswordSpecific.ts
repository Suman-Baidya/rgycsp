import { db } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const hashedPassword = await hash('Suman2002', 12);
  const result = await db.user.update({
    where: { email: 'suman.baidya.pro@gmail.com' },
    data: { passwordHash: hashedPassword }
  });
  console.log('Successfully updated password for:', result.email);
}

main().catch((e) => console.error('Error updating password:', e.message));
