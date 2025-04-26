"use client";

import { fetchAllLibrariesAction } from "@/utils/actions/libraryActions";
import LibraryMinature from "./LibraryMinature";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../global/LoadingSpinner";

const LibraryList = () => {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["libraryBrowser"],
    queryFn: async () => {
      return fetchAllLibrariesAction();
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (isError) return <div>{error.message}</div>;

  if (!data) return <div>Did not find any matching libraries.</div>;

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {data.map((lib) => {
        return <LibraryMinature key={lib.id} library={lib} />;
      })}
    </div>
  );
};
export default LibraryList;
