import { db } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const hashedPassword = await hash('Suman2002', 12);
  const result = await db.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { passwordHash: hashedPassword }
  });
  console.log('Updated super admins:', result.count);
}

main().catch(console.error);
