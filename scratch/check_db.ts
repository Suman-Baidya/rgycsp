
import { db } from "./src/lib/prisma";

async function check() {
  const ws = await db.workspace.findUnique({ where: { subdomain: "rgycspbira" } });
  if (!ws) {
    console.log("Workspace not found");
    return;
  }
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: ws.id },
    include: { sections: true }
  });
  console.log("Settings found:", !!settings);
  console.log("Sections count:", settings?.sections.length);
  console.log("Hero section:", settings?.sections.find(s => s.type === "hero"));
}

check();
