import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LibrariesSearchParamsType } from "../types";

export function useLibrariesParams(): LibrariesSearchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchName = searchParams.get("searchName") || "";
    const searchAuthor = searchParams.get("searchAuthor") || "";
    const searchComponents = searchParams.get("searchComponents") || "";
    const searchDescription = searchParams.get("searchDescription") || "";
    const myLibraries = searchParams.get("myLibraries") === "true";
    const favorites = searchParams.get("favorites") === "true";

    return {
      searchName,
      searchAuthor,
      searchDescription,
      searchComponents,
      myLibraries,
      favorites,
    };
  }, [searchParams]);
}
