import Title from "@/components/editor/Title";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import ComponentContentBreadcrums from "./ComponentContentBreacrumbs";
import { SelectedRow } from "@/utils/types";
import ComponentContentWrapper from "../global/ComponentContentWrapper";

const ComponentContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const component = await fetchSingleComponentAction(id);

  if (!component) return <p>Could not fetch component</p>;

  const componentData: SelectedRow = {
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
      <ComponentContentWrapper
        componentGeometry={component.geometry}
        componentEditable={component.editable}
        componentPsets={component.psets}
      />
    </div>
  );
};
export default ComponentContent;
