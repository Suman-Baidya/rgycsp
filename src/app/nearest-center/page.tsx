import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import NearestCenterClient from "./NearestCenterClient";
import { Suspense } from "react";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";

export const metadata = {
  title: "Find Nearest Center | RGYCSP",
  description: "Find an authorized RGYCSP study center near you to begin your enrollment process.",
};

export default async function NearestCenterPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });

  if (!settings) {
    return <div>Site configuration missing. Please check the dashboard.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} user={session?.user} />
      
      <main className="flex-1 w-full pt-32 pb-24 px-4 sm:px-6">
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
          <NearestCenterClient />
        </Suspense>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
