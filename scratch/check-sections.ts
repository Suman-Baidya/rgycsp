import { db } from "./src/lib/prisma";

async function checkSections() {
  const sections = await db.landingSection.findMany();
  console.log("Current Sections in DB:");
  console.table(sections.map(s => ({ type: s.type, isActive: s.isActive, title: s.title })));
}

checkSections();
