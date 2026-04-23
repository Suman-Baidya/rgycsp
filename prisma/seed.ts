import { SystemRole, WorkspaceRoleType } from '@prisma/client';
import { db as prisma } from '../src/lib/prisma';

async function main() {
  console.log("Seeding database...");

  const devEmail = process.env.DEVELOPER_EMAIL || "sb.abcd321@gmail.com";

  // 1. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: {
      email: devEmail,
      name: "Super Admin",
      role: SystemRole.SUPER_ADMIN,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 2. Create Demo Workspace (Institute)
  const workspace = await prisma.workspace.upsert({
    where: { subdomain: "institute1" },
    update: {},
    create: {
      name: "ABCD High School",
      subdomain: "institute1",
      tokensBalance: 1000,
      isActive: true
    },
  });
  console.log(`✅ Workspace created: ${workspace.name} (app/institute1)`);

  // 3. Bind Role
  await prisma.workspaceRole.upsert({
    where: {
      userId_workspaceId: {
        userId: superAdmin.id,
        workspaceId: workspace.id,
      }
    },
    update: {},
    create: {
      userId: superAdmin.id,
      workspaceId: workspace.id,
      role: WorkspaceRoleType.ADMIN,
    }
  });

  console.log(`✅ User bound as Admin for Workspace for local testing.`);
  console.log("Seeding complete! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
