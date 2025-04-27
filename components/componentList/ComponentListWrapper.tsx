"use client";

import { columns } from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import LoadingSpinner from "../global/LoadingSpinner";
import { useAppDispatch } from "@/lib/hooks";
import { updateBrowserSearchParams } from "@/lib/features/browser/componentBrowserSlice";
import { useBrowserParams } from "@/utils/customHooks/useBrowserParams";
import { useQuery } from "@tanstack/react-query";
import { fetchAllComponentsAction } from "@/utils/actions/componentActions";
import { useEffect } from "react";

export default function ComponentListWrapper() {
  const dispatch = useAppDispatch();
  const params = useBrowserParams();

  useEffect(() => {
    dispatch(updateBrowserSearchParams(params));
  }, [params, dispatch]);

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["componentBrowser", params],
    queryFn: async () => {
      console.log(params);
      return fetchAllComponentsAction(params);
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="text-secondary-foreground text-center">
        {error.message}
      </div>
    );

  if (data && data.length === 0 && !isPending) {
    return (
      <div className="text-secondary-foreground text-center">
        No components found.
      </div>
    );
  }

  return <ComponentList columns={columns} data={data} />;
}
