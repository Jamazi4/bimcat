import ComponentMinature from "@/components/componentList/ComponentMinature";
import { fetchAllComponents } from "@/utils/actions";
import { Component, componentsArraySchema } from "@/utils/schemas";
import { validateWithZodSchema } from "@/utils/schemas";

export default async function Home() {
  const components = await fetchAllComponents();
  const validatedComponents = validateWithZodSchema(
    componentsArraySchema,
    components
  );
  if (!validatedComponents) return <div>Couldn&apos;t connect....</div>;
  return (
    <main className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {validatedComponents?.map((component: Component) => {
        const { id, name, createdAt } = component;
        return (
          <ComponentMinature
            key={component.id}
            name={name}
            id={id}
            created={createdAt}
          />
        );
      })}
    </main>
  );
}
