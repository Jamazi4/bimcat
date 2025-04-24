"use client";

import { columns } from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import { useEffect } from "react";
import LoadingSpinner from "../global/LoadingSpinner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBrowserComponents } from "@/lib/features/browser/componentBrowserSlice";
import { useBrowserParams } from "@/utils/customHooks/useBrowserParams";

export type searchParamsType = {
  myComponents: boolean;
  searchString: string;
};

export default function ComponentListWrapper() {
  const params = useBrowserParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchBrowserComponents(params));
  }, [dispatch, params.searchString, params.myComponents]);

  const browserState = useAppSelector((state) => state.componentBrowser);

  if (browserState.loading) return <LoadingSpinner />;

  if (!browserState.fetchedComponents && !browserState.loading)
    return (
      <div className="text-secondary-foreground text-center">Please wait.</div>
    );

  if (browserState.fetchedComponents && !browserState.fetchedComponents.length)
    return (
      <div className="text-secondary-foreground text-center">
        No components found.
      </div>
    );

  if (!browserState.fetchedComponents) return; //TODO: that's just wrong

  return (
    <ComponentList columns={columns} data={browserState.fetchedComponents} />
  );
}
