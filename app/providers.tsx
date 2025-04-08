"use client";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";
import { ToasterProps } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Toaster
        closeButton
        theme={resolvedTheme as ToasterProps["theme"]}
        toastOptions={{
          classNames: {
            closeButton:
              "!bg-background !text-destructive !border-muted-foreground",
            toast:
              "!bg-background !text-primary border-1 !border-muted-foreground",
          },
        }}
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
};
export default Providers;
