import ComponentMinature from "@/components/ComponentMinature";
import { fetchAllComponents } from "@/utils/actions";

export default async function Home() {
  const components = await fetchAllComponents();
  if (!components) return <div>Couldn&apos;'t connect....</div>;
  return (
    <main className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {components?.map((component) => {
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
