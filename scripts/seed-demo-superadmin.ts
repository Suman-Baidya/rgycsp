import 'dotenv/config';
import { db } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = (process.env.DEMO_ADMIN_EMAIL || "demoadmin@abcd.com").toLowerCase().trim();
  const password = process.env.DEMO_ADMIN_PASSWORD || "ABCDPASS";
  const name = "Demo Super Admin";
  const username = "demoadmin";

  console.log(`Setting up Showcase Demo Super Admin for ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.upsert({
    where: { email },
    update: {
      name,
      username,
      role: "SUPER_ADMIN",
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      username,
      name,
      role: "SUPER_ADMIN",
      isActive: true,
      passwordHash,
    },
  });

  console.log("==========================================");
  console.log(" SHOWCASE DEMO SUPER ADMIN READY!");
  console.log("==========================================");
  console.log(` Name:     ${user.name}`);
  console.log(` Email:    ${user.email}`);
  console.log(` Username: ${user.username}`);
  console.log(` Password: ${password}`);
  console.log(` Role:     ${user.role}`);
  console.log(` Active:   ${user.isActive}`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Failed to seed demo super admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
