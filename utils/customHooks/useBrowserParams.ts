import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { searchParamsType } from "../types";

export function useBrowserParams(): searchParamsType {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const searchString = searchParams.get("search") || "";
    const myComponents = searchParams.get("myComponents") === "true";

    return { searchString, myComponents };
  }, [searchParams]);
}
