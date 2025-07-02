import Title from "@/components/editor/Title";
import { SelectedRow } from "@/utils/types";
import { fetchSingleLibraryComponentAction } from "@/utils/actions/libraryActions";
import LibraryComponentContentBreadcrumbs from "./LibraryComponentContentBreadcrumbs";
import ComponentContentWrapper from "../global/ComponentContentWrapper";
import LibraryInfo from "./LibraryInfo";

const LibraryComponentContent = async ({
  params,
}: {
  params: Promise<{ libraryId: string; componentId: string }>;
}) => {
  const resolvedParams = await params;
  const { libraryId, componentId } = resolvedParams;

  const result = await fetchSingleLibraryComponentAction(
    libraryId,
    componentId,
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
      <LibraryInfo
        author={component.author}
        updatedAt={component.updatedAt.toISOString()}
        createdAt={component.createdAt.toISOString()}
        isPublic={component.public}
      />
      <ComponentContentWrapper
        componentId={componentId}
        componentGeometry={component.geometry}
        componentEditable={component.editable}
        componentPsets={component.psets}
      />
    </div>
  );
};
export default LibraryComponentContent;
