import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Club — Content Dashboard",
  description: "AI Club content management and analytics platform",
};

const themeInitScript = `
(() => {
  const root = document.documentElement;
  const getStoredTheme = () => {
    try {
      return window.localStorage.getItem("theme");
    } catch {
      return null;
    }
  };
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const getTheme = () => {
    const stored = getStoredTheme();
    return stored === "light" || stored === "dark" ? stored : getSystemTheme();
  };
  const applyTheme = () => {
    const theme = getTheme();
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.dataset.theme = theme;
  };
  applyTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {/* PostsProvider lives in dashboard/layout.tsx — only mounted for dashboard routes */}
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
