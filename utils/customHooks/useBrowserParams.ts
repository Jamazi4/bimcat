import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BrowserSearchParamsType } from "../types";

export function useBrowserParams(): BrowserSearchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchString = searchParams.get("search") || "";
    const myComponents = searchParams.get("myComponents") === "true";

    return { searchString, myComponents };
  }, [searchParams]);
}
