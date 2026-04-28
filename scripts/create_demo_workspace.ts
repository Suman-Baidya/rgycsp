import { db as prisma } from '../src/lib/prisma';

async function main() {
  const subdomain = "rgycspbira";
  const email = "rgycspbira@gmail.com";
  const name = "RGYCSPBIRA Demo";

  console.log(`Creating demo workspace for ${subdomain}...`);

  // 1. Create or find User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Demo Admin",
        // Dummy password (password "password") if you need to log in manually via credentials.
        passwordHash: "$2a$10$X7YvQvX6wZgX.wJ.oX.u.O8z.Y.n/9.J/3.E.x.H.r.F.c.m.O.S", 
      }
    });
    console.log(`Created user: ${email}`);
  } else {
    console.log(`User already exists: ${email}`);
  }

  // 2. Create Workspace
  let workspace = await prisma.workspace.findUnique({ where: { subdomain } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        subdomain,
        name,
        isActive: true,
      }
    });
    console.log(`Created workspace: ${subdomain}`);
  } else {
    console.log(`Workspace already exists: ${subdomain}`);
  }

  // 3. Link User to Workspace as ADMIN
  const roleExists = await prisma.workspaceRole.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    }
  });

  if (!roleExists) {
    await prisma.workspaceRole.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN"
      }
    });
    console.log(`Assigned ADMIN role to ${email} for workspace ${subdomain}`);
  } else {
    console.log(`User already has a role in this workspace.`);
  }

  console.log("Done!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
