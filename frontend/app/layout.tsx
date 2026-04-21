import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from '@/contexts/AuthContext'
import StoreProvider from "./StoreProvider";


const inter = Inter({
  subsets: ["latin"], // Specify the character subsets you need
  display: "swap", // Optimizes font loading
});

export const metadata: Metadata = {
  title: "SparrowDNS - DNS Management Platform",
  description: "API-first DNS management for developers and enterprises",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
     
     <StoreProvider>
       <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
     </StoreProvider>
    </html>
  );
}
