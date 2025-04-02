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
import { format } from "date-fns";

async function getData(): Promise<ComponentRow[]> {
  const components = await fetchAllComponents();
  const validatedComponents = validateWithZodSchema(
    componentsArraySchema,
    components
  );

  return validatedComponents.map((component) => {
    return {
      id: component.id,
      name: component.name,
      createdAt: format(component.createdAt, "dd-MM-yy HH:mm"),
      updatedAt: format(component.updatedAt, "dd-MM-yy HH:mm"),
      author: component.author,
      editable: component.editable,
      public: component.public,
    };
  });
}

export default async function page() {
  const data = await getData();

  if (!data) return <div>Nothing to look at here...</div>;

  return (
    <main className="w-full px-4 justify-center mx-auto">
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
      <h1 className="text-2xl font-bold my-6">Component browser</h1>
      <Filters />
      <ComponentList columns={columns} data={data} />
    </main>
  );
}
