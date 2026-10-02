import { NextResponse } from "next/server";
import { processPendingAutoCertificateIssues } from "@/app/actions/student-documents";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const result = await processPendingAutoCertificateIssues();
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process auto certificate issues." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
