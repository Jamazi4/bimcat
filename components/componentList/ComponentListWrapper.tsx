"use client";

import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import { cachedFetchAllComponents } from "@/utils/actions/componentActions";
import { useEffect, useState } from "react";
import LoadingSpinner from "../global/LoadingSpinner";
import { useSearchParams } from "next/navigation";

export type searchParamsType = {
  myComponents: boolean;
  searchString: string;
};

export default function ComponentListWrapper() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ComponentRow[]>();
  const [pending, setPending] = useState(false);
  const searchString = searchParams.get("search") || "";
  const myComponents = searchParams.get("myComponents") === "true";
  const params = { searchString, myComponents };

  useEffect(() => {
    const getData = async () => {
      setPending(true);
      const components = await cachedFetchAllComponents(params);

      const mapped = components.map((component) => {
        return {
          id: component.id,
          name: component.name,
          createdAt: component.createdAt,
          updatedAt: component.updatedAt,
          author: component.author,
          editable: component.editable,
          public: component.public,
        };
      });
      setData(mapped);
      setPending(false);
    };

    getData();
  }, [searchString, myComponents]);

  if (pending) return <LoadingSpinner />;

  if (!data && !pending)
    return (
      <div className="text-secondary-foreground text-center">Please wait.</div>
    );

  if (data && !data.length)
    return (
      <div className="text-secondary-foreground text-center">
        No components found.
      </div>
    );

  if (!data) return; //TODO: that's just wrong

  return <ComponentList columns={columns} data={data} />;
}
