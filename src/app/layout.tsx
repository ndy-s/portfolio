import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StarField } from "@/components/StarField";
import { BackgroundAudio } from "@/components/BackgroundAudio";
import { CosmicHelp } from "@/components/CosmicHelp";
import { PageLoader } from "@/components/PageLoader";
import { LoadingProvider } from "@/components/LoadingProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hendy",
  description: "Hendy Saputra is a Software Engineer specializing in scalable backend systems, AI solutions, and engaging full-stack digital experiences. Let's build something extraordinary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <LoadingProvider>
            <PageLoader />
            <StarField />
            <div className="nebula-overlay nebula-1" />
            <div className="nebula-overlay nebula-2" />
            <div className="nebula-overlay nebula-3" />
            <div className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-6 py-12 md:py-24">
              {children}
            </div>
            <BackgroundAudio />
            <CosmicHelp />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
