import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/shared/SiteHeader";
import { ReactQueryProvider } from "@/providers"; 
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Bolsa FEUCN",
  description: "Bolsa de trabajo y servicios para estudiantes UCN",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-(--bg) text-(--ink)`}>
        <ReactQueryProvider>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            duration={3000}
          />
          <SiteHeader />
          <main> 
            {children}
          </main>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

