import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET() {
  const students = await db.studentProfile.findMany({
    select: {
      fullName: true,
      enrollmentNo: true,
      registrationNo: true,
      registrationCardApproved: true,
      status: true
    },
    take: 10
  });
  return NextResponse.json(students);
}
