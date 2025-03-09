import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";

const roboto = Roboto({
  variable: "--font-Roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BimCAT",
  description: "Your BIM Catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${roboto.className} antialiased p-0 m-0`}>
          <Providers>
            <Navbar />
            <div className="max-w-[1120px] mx-auto px-4">{children}</div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
