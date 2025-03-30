import { ComponentList } from "@/components/componentList/ComponentList";
import {
  columns,
  ComponentRow,
} from "@/components/componentList/ComponentListColumns";
import { fetchAllComponents } from "@/utils/actions";
import { componentsArraySchema } from "@/utils/schemas";
import { validateWithZodSchema } from "@/utils/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";

async function getData(): Promise<ComponentRow[]> {
  const components = await fetchAllComponents();
  const validatedComponents = validateWithZodSchema(
    componentsArraySchema,
    components
  );

  const user = await currentUser();
  // const clerkId = user?.id; //TODO: verify via clerk id, not password
  const thisAuthor = `${user?.firstName} ${user?.lastName}`;

  return validatedComponents.map((component) => {
    return {
      id: component.id,
      name: component.name,
      createdAt: format(component.createdAt, "dd-MM-yy HH:mm"),
      updatedAt: format(component.updatedAt, "dd-MM-yy HH:mm"),
      author: component.author,
      editable: component.author === thisAuthor,
    };
  });
}

export default async function page() {
  const data = await getData();

  if (!data) return <div>Nothing to look at here...</div>;

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <ComponentList columns={columns} data={data} />
    </main>
  );
}
