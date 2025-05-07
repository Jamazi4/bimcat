import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LibrariesSearchParamsType } from "../types";

export function useLibrariesParams(): LibrariesSearchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchName = searchParams.get("searchName") || "";
    const searchAuthor = searchParams.get("searchAuthor") || "";
    const searchContent = searchParams.get("searchContent") || "";
    const searchDescription = searchParams.get("searchDescription") || "";
    const myLibraries = searchParams.get("myLibraries") === "true";
    const favorites = searchParams.get("favorites") === "true";
    const composite = searchParams.get("composite") === "true";

    return {
      searchName,
      searchAuthor,
      searchDescription,
      searchContent,
      myLibraries,
      favorites,
      composite,
    };
  }, [searchParams]);
}
