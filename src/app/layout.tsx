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

  const routingConfig = (globalSettings?.routingConfig as any) || DEFAULT_ROUTING_CONFIG;
  const siteName = globalSettings?.siteName || "ABCD";
  const desc = globalSettings?.brandDescription || `${siteName} provides top-tier educational management and skill development centers across the globe.`;

  return {
    title: {
      template: `%s | ${siteName}`,
      default: `${siteName} - Empowering Education and Technology`,
    },
    description: desc,
    keywords: ["education", "management", "ABCD", "learning", "dashboard", "hub"],
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
    manifest: routingConfig.enablePwa ? "/manifest.webmanifest" : undefined,
    appleWebApp: {
      capable: Boolean(routingConfig.enablePwa),
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
import { PwaManager } from "@/components/pwa/PwaManager";
import { DEFAULT_ROUTING_CONFIG } from "@/lib/routing-config";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, globalSettings] = await Promise.all([
    auth(),
    getCachedGlobalSettings().catch(() => null)
  ]);

  const routingConfig = (globalSettings?.routingConfig as any) || DEFAULT_ROUTING_CONFIG;
  const siteName = globalSettings?.siteName || "ABCD Edu Hub";

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <TopProgressBar />
        <VisitorTracker />
        <PwaManager
          enablePwa={Boolean(routingConfig.enablePwa)}
          enableInstallPrompt={Boolean(routingConfig.enablePwaInstallPrompt)}
          appName={siteName}
          logoUrl={globalSettings?.logoUrl || undefined}
        />
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
