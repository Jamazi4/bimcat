import Renderer from "@/components/editor/Renderer";
import Title from "@/components/editor/Title";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import PsetsList from "@/components/editor/PsetsList";
import ComponentContentBreadcrums from "./ComponentContentBreacrumbs";
import { selectedRow } from "@/utils/types";

const ComponentContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const component = await fetchSingleComponentAction(id);

  if (!component) return <p>Could not fetch component</p>;

  const componentData: selectedRow = {
    [component.id]: {
      name: component.name,
      isPublic: component.public,
      editable: component.editable,
    },
  };

  if (!component.geometry) return <p>Could not fetch geometry</p>;
  return (
    <div>
      <ComponentContentBreadcrums name={component.name} />
      <Title componentData={componentData} />
      <div
        className="justify-center grid grid-cols-1 lg:grid-cols-6
   gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto"
      >
        <div className="lg:col-span-4">
          {component ? (
            <Renderer geometry={component.geometry} />
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <PsetsList
            psets={component.psets ?? []}
            editable={component.editable}
          />
        </div>
      </div>
    </div>
  );
};
export default ComponentContent;
