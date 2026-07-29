import { db } from "./src/lib/prisma";
async function run() {
  try {
    const student = await db.studentProfile.findFirst({
      where: { enrollmentNo: { contains: "000006" } }
    });
    console.log("Found student:", student);
  } catch(e) {
    console.error(e);
  }
}
run();
