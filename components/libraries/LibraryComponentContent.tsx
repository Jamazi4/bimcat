import Renderer from "@/components/editor/Renderer";
import Title from "@/components/editor/Title";
import PsetsList from "@/components/editor/PsetsList";
import { SelectedRow } from "@/utils/types";
import { fetchSingleLibraryComponentAction } from "@/utils/actions/libraryActions";
import ComponentContentBreadcrums from "../editor/ComponentContentBreacrumbs";
import LibraryComponentContentBreadcrumbs from "./LibraryComponentContentBreadcrumbs";

const LibraryComponentContent = async ({
  params,
}: {
  params: Promise<{ libraryId: string; componentId: string }>;
}) => {
  const resolvedParams = await params;
  const { libraryId, componentId } = resolvedParams;

  const result = await fetchSingleLibraryComponentAction(
    libraryId,
    componentId
  );

  if (!result) return <p>Could not fetch component</p>;

  const { libraryName, component } = result;

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
      <LibraryComponentContentBreadcrumbs
        componentName={component.name}
        libraryName={libraryName}
      />
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
export default LibraryComponentContent;
