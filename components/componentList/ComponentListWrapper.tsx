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
  const dispatch = useAppDispatch();

  const browserState = useAppSelector((state) => state.componentBrowser);
  const params = useBrowserParams();

  useEffect(() => {
    console.log("useEffect params: ", params);
    dispatch(fetchBrowserComponents(params));
  }, [dispatch, params]);

  if (browserState.loading) return <LoadingSpinner />;

  if (!browserState.fetchedComponents && !browserState.loading)
    return (
      <div className="text-secondary-foreground text-center">Please wait.</div>
    );

  if (
    browserState.fetchedComponents &&
    browserState.fetchedComponents.length === 0 &&
    !browserState.loading
  ) {
    return (
      <div className="text-secondary-foreground text-center">
        No components found.
      </div>
    );
  }

  if (!browserState.fetchedComponents) return; //TODO: that's just wrong

  return (
    <ComponentList columns={columns} data={browserState.fetchedComponents} />
  );
}
