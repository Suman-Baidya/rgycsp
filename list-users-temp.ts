import { db } from './src/lib/prisma';

async function listUsers() {
  const users = await db.user.findMany({
    where: { role: 'SUPER_ADMIN' }
  });
  console.log(users.map(u => u.email));
}

listUsers();
