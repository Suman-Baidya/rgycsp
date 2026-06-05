const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('12345', 10);
  const user = await prisma.user.update({
    where: { email: 'suman.baidya.pro@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Successfully updated password for:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
