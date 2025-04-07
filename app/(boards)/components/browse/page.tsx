import { ComponentList } from "@/components/componentList/ComponentList";
import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import Filters from "@/components/componentList/Filters";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { fetchAllComponents } from "@/utils/actions";
import { componentsArraySchema } from "@/utils/schemas";
import { validateWithZodSchema } from "@/utils/schemas";
import { Suspense } from "react";

export type searchParamsType = {
  myComponents: string;
  search: string;
};

async function getData(params: searchParamsType): Promise<ComponentRow[]> {
  const components = await fetchAllComponents(params);
  const validatedComponents = validateWithZodSchema(
    componentsArraySchema,
    components
  );

  return validatedComponents.map((component) => {
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

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ myComponents: string; search: string }>;
}) {
  const params = await searchParams;
  const data = await getData(params);

  if (!data) return <div>Nothing to look at here...</div>;

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <BreadCrumbs />
      <h1 className="text-2xl font-bold my-6">Component browser</h1>
      <Filters />
      <Suspense fallback={<div>Getting all the components...</div>}>
        <ComponentList columns={columns} data={data} />
      </Suspense>
    </main>
  );
}

const BreadCrumbs = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Browse</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
