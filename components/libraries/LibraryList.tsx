"use client";

import { fetchAllLibrariesAction } from "@/utils/actions/libraryActions";
import LibraryMinature from "./LibraryMinature";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../global/LoadingSpinner";
import { useLibrariesParams } from "@/utils/customHooks/useLibrariesParams";
import { useAppDispatch } from "@/lib/hooks";
import { updateLibrarySearchParams } from "@/lib/features/libraries/libraryBrowserSlice";
import { useEffect } from "react";

const LibraryList = () => {
  const params = useLibrariesParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateLibrarySearchParams(params));
  }, [params, dispatch]);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["libraryBrowser", params],
    queryFn: async () => {
      return fetchAllLibrariesAction(params);
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (isError) return <div>{error.message}</div>;

  if (data && data.length === 0 && !isPending) {
    return (
      <div className="text-secondary-foreground text-center">
        No components found.
      </div>
    );
  }

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
