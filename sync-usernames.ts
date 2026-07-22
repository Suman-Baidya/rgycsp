"use server";
import { db } from "./src/lib/prisma";

export async function syncUsernames() {
  console.log("Starting migration: Syncing Student Usernames with Enrollment Numbers...");
  
  const profiles = await db.studentProfile.findMany({
    include: { user: true }
  });

  let updatedCount = 0;

  for (const profile of profiles) {
    if (profile.userId && profile.enrollmentNo && profile.user && profile.user.username !== profile.enrollmentNo) {
      console.log(`Updating user ${profile.user.id}: Changing username from ${profile.user.username} to ${profile.enrollmentNo}`);
      await db.user.update({
        where: { id: profile.user.id },
        data: { username: profile.enrollmentNo }
      });
      updatedCount++;
    }
  }

  console.log(`Migration complete. Successfully synced ${updatedCount} student usernames.`);
}
