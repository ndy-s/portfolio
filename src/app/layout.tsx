import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StarField } from "@/components/StarField";
import { BackgroundAudio } from "@/components/BackgroundAudio";
import { CosmicHelp } from "@/components/CosmicHelp";
import { PageLoader } from "@/components/PageLoader";
import { LoadingProvider } from "@/components/LoadingProvider";
import { CodexProvider } from "@/components/CodexProvider";
import { CosmicCodex } from "@/components/CosmicCodex";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hendy",
  description: "Hendy Saputra is a software engineer focused on scalable backend systems and AI-driven solutions, who cares as much about performance as polish.",
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
            <CodexProvider>
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
              <CosmicCodex />
            </CodexProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
