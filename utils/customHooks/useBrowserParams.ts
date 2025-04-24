import { useSearchParams } from "next/navigation";

export const useBrowserParams = () => {
  const searchParams = useSearchParams();
  const searchString = searchParams.get("search") || "";
  const myComponents = searchParams.get("myComponents") === "true";
  const params = { searchString, myComponents };
  return params;
};
