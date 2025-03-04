import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="max-w-3xl mx-auto justify-center">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
