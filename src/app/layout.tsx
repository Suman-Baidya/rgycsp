import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { getCachedGlobalSettings } from "@/lib/settings";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let globalSettings = null;
  try {
    globalSettings = await getCachedGlobalSettings();
  } catch (error) {
    console.error("Error fetching global site settings for metadata:", error);
  }

  const siteName = globalSettings?.siteName || "RGYCSP";
  const desc = globalSettings?.brandDescription || "RGYCSP (ABCD Edu Hub) provides top-tier educational management and skill development centers across the globe.";

  return {
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} - Empowering Education and Technology`,
    },
    description: desc,
    keywords: ["education", "management", "RGYCSP", "learning", "dashboard", "hub"],
    openGraph: {
      title: `${siteName} - Education Hub`,
      description: desc,
      type: "website",
      locale: "en_US",
      siteName: siteName,
    },
    icons: {
      icon: globalSettings?.faviconUrl || globalSettings?.logoUrl || "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
      apple: globalSettings?.faviconUrl || globalSettings?.logoUrl || "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserHeartbeat } from "@/components/providers/UserHeartbeat";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";
import { auth } from "@/auth";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { TopProgressBar } from "@/components/layout/TopProgressBar";
import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <TopProgressBar />
        <VisitorTracker />
        <SessionProvider session={session}>
          <UserHeartbeat />
          <OfflineIndicator />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
