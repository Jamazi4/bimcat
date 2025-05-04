import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BrowserSearchParamsType } from "../types";

export function useBrowserParams(): BrowserSearchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchName = searchParams.get("searchName") || "";
    const searchAuthor = searchParams.get("searchAuthor") || "";
    const searchPsetTitle = searchParams.get("searchPsetTitle") || "";
    const searchPsetContent = searchParams.get("searchPsetContent") || "";
    const myComponents = searchParams.get("myComponents") === "true";

    return {
      searchName,
      searchAuthor,
      searchPsetContent,
      searchPsetTitle,
      myComponents,
    };
  }, [searchParams]);
}
