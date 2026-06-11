import { db } from "../src/lib/prisma.js";
db.siteSettings.findFirst({ where: { workspaceId: null } })
  .then(s => console.log(s?.logoUrl))
  .catch(console.error)
  .finally(() => process.exit(0));
