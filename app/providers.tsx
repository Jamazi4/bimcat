"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "next-themes";
import { ToasterProps } from "sonner";
import { makeStore, AppStore } from "../lib/store";
import { useRef } from "react";
import { Provider } from "react-redux";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();

  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: async (_data, _variables, _context, mutation) => {
        if (mutation.meta?.invalidates) {
          await queryClient.invalidateQueries(mutation.meta.invalidates);
        }
      },
    }),
  });

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
        <Provider store={storeRef.current}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </>
  );
};
export default Providers;
