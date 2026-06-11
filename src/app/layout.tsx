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
  title: "RGYCSP",
  description: "RGYCSP - Empowering Education and Technology",
  icons: {
    icon: "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp"
  }
};

import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UserHeartbeat } from "@/components/providers/UserHeartbeat";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <SessionProvider>
          <UserHeartbeat />
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
