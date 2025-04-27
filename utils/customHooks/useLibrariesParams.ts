import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LibrariesSearchParamsType } from "../types";

export function useLibrariesParams(): LibrariesSearchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchString = searchParams.get("search") || "";
    const myLibraries = searchParams.get("myLibraries") === "true";
    const favorites = searchParams.get("favorites") === "true";

    return { searchString, myLibraries, favorites };
  }, [searchParams]);
}
