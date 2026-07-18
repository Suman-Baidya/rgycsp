import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | RGYCSP",
    default: "RGYCSP - Empowering Education and Technology",
  },
  description: "RGYCSP (ABCD Edu Hub) provides top-tier educational management and skill development centers across the globe.",
  keywords: ["education", "management", "RGYCSP", "learning", "dashboard", "hub"],
  openGraph: {
    title: "RGYCSP - Education Hub",
    description: "Empowering Education and Technology across modern learning centers.",
    type: "website",
    locale: "en_US",
    siteName: "RGYCSP",
  },
  icons: {
    icon: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp"
  }
};

import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserHeartbeat } from "@/components/providers/UserHeartbeat";
import { auth } from "@/auth";
import { OfflineIndicator } from "@/components/OfflineIndicator";
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
