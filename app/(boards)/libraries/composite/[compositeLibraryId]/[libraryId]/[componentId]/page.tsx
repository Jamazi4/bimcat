import Title from "@/components/editor/Title";
import ComponentContentWrapper from "@/components/global/ComponentContentWrapper";
import CompositeComponentBreadcrumbs from "@/components/libraries/composite/CompositeComponentBreadcrumbs";
import LibraryInfo from "@/components/libraries/LibraryInfo";
import { fetchCompositeComponent } from "@/utils/actions/libraryActions";
import { SelectedRow } from "@/utils/types";

const Page = async ({
  params,
}: {
  params: Promise<{
    compositeLibraryId: string;
    libraryId: string;
    componentId: string;
  }>;
}) => {
  const resolvedParams = await params;
  const { compositeLibraryId, libraryId, componentId } = resolvedParams;

  const result = await fetchCompositeComponent(
    compositeLibraryId,
    libraryId,
    componentId,
  );

  if (!result) return <p>Could not fetch component</p>;

  const componentData: SelectedRow = {
    [result.component.id]: {
      name: result.component.name,
      isPublic: result.component.public,
      editable: result.component.editable,
    },
  };

  return (
    <div>
      <CompositeComponentBreadcrumbs
        compositeName={result.compositeName}
        compositeLibraryId={compositeLibraryId}
        libraryName={result.libraryName}
        libraryId={libraryId}
        componentName={result.component.name}
      />
      <Title componentData={componentData} />
      <LibraryInfo
        author={result.component.author}
        updatedAt={result.component.updatedAt.toISOString()}
        createdAt={result.component.createdAt.toISOString()}
        isPublic={result.component.public}
      />
      <ComponentContentWrapper
        isUsingNodes={!!result.component.nodes?.id}
        componentId={componentId}
        componentGeometry={result.component.geometry}
        componentEditable={result.component.editable}
        componentPsets={result.component.psets}
      />
    </div>
  );
};

export default Page;
