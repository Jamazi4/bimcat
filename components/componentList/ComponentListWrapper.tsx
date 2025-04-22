"use client";

import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import { fetchAllComponents } from "@/utils/actions";
import { useEffect, useState } from "react";
import LoadingSpinner from "../global/LoadingSpinner";
import { useSearchParams } from "next/navigation";

export type searchParamsType = {
  myComponents: boolean;
  search: string;
};

export default function ComponentListWrapper() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ComponentRow[]>();
  const [pending, setPending] = useState(false);
  const search = searchParams.get("search") || "";
  const myComponents = searchParams.get("myComponents") === "true";
  const params = { search, myComponents };

  useEffect(() => {
    const getData = async () => {
      setPending(true);
      const components = await fetchAllComponents(params);

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
  }, [search, myComponents]);

  if (pending) return <LoadingSpinner />;

  if (!data && !pending)
    return (
      <div className="text-secondary-foreground text-center">
        Something went wrong
      </div>
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
