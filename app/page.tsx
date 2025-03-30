import { ComponentList } from "@/components/componentList/ComponentList";
import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
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
      author: component.author || "JZIM",
    };
  });
}

export default async function Home() {
  const data = await getData();

  if (!data) return <div>Nothing to look at here...</div>;

  return (
    <main className="max-w-7xl px-4 justify-center mx-auto">
      <ComponentList columns={columns} data={data} />
    </main>
  );
}
