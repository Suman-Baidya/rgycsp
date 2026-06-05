import { db } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('12345', 10);
  const user = await db.user.update({
    where: { email: 'suman.baidya.pro@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Successfully updated password for:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit(0));
