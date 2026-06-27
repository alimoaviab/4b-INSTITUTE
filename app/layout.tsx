import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { GraduationCap } from "lucide-react";

import Image from "next/image";

export const metadata: Metadata = {
  title: "Student Admission System",
  description: "Comprehensive student admission and testing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen m-0 bg-[#F8FAFC]">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <div className="bg-white text-slate-800 py-2 shadow-[0_2px_10px_rgb(0,0,0,0.04)] z-[100] relative w-full border-b border-slate-100 overflow-hidden shrink-0 flex items-center">
            <div className="flex w-max animate-marquee">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-8 shrink-0">
                  <Image src="/logo.png" alt="4B Logo" width={40} height={40} className="object-contain" priority={i < 4} />
                  <h1 className="text-lg md:text-xl font-extrabold tracking-[0.1em] uppercase text-[#334155] whitespace-nowrap">
                    INSTITUTE OF 4B INFORMATION TECHNOLOGY
                  </h1>
                </div>
              ))}
            </div>
          </div>
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
