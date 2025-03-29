import { ComponentList } from "@/components/componentList/ComponentList";
import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import { fetchAllComponents } from "@/utils/actions";
import { componentsArraySchema } from "@/utils/schemas";
import { validateWithZodSchema } from "@/utils/schemas";
import { format } from "date-fns";
import Link from "next/link";

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
      author: "JZIM",
    };
  });
}

export default async function Home() {
  const data = await getData();

  if (!data) return <div>Nothing to look at here...</div>;

  return (
    // <main className="grid grid-cols-2 gap-4 md:grid-cols-3 mt-[92px] max-w-[1024px] mx-auto mb-4  w-auto px-4 justify-center flex-col">

    <main className="max-w-[1024px] justify-center mx-auto">
      <ComponentList columns={columns} data={data} />
    </main>
  );
}
