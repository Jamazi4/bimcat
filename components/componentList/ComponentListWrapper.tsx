import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import { fetchAllComponents } from "@/utils/actions";

export type searchParamsType = {
  myComponents: string;
  search: string;
};

async function getData(params: searchParamsType): Promise<ComponentRow[]> {
  "use client";
  const components = await fetchAllComponents(params);

  return components.map((component) => {
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
}

export default async function ComponentListWrapper({
  params,
}: {
  params: searchParamsType;
}) {
  const data = await getData(params);

  if (!data.length) return <div>No components found.</div>;

  return <ComponentList columns={columns} data={data} />;
}
