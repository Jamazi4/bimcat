// "use client";

import Title from "@/components/editor/Title";
import ComponentContentWrapper from "@/components/global/ComponentContentWrapper";
import CompositeComponentBreadcrumbs from "@/components/libraries/composite/CompositeComponentBreadcrumbs";
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

  // const { compositeLibraryId, libraryId, componentId } = useParams<{
  //   compositeLibraryId: string;
  //   libraryId: string;
  //   componentId: string;
  // }>();
  //
  // const [libraryName, setLibraryName] = useState<string>("");
  // const [compositeName, setCompositeName] = useState<string>("");
  //
  // type responseType = {
  //   component: componentWithGeometrySchemaType;
  //   libraryName: string;
  //   compositeName: string;
  // };
  //
  // const { isPending, isError, data, error } = useQuery<responseType, Error>({
  //   queryKey: [
  //     "compositeComponent",
  //     componentId,
  //     compositeLibraryId,
  //     libraryId,
  //   ],
  //   queryFn: async () => {
  //     const result = await fetchCompositeComponent(
  //       compositeLibraryId,
  //       libraryId,
  //       componentId,
  //     );
  //
  //     setLibraryName(result.libraryName);
  //     setCompositeName(result.compositeName);
  //
  //     return result;
  //   },
  // });
  //
  // if (isPending) return <LoadingSpinner />;
  // if (isError) return <div>{error.message}</div>;
  // if (data === undefined) return <div>Library does not exist</div>;

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
      <ComponentContentWrapper
        componentGeometry={result.component.geometry}
        componentEditable={result.component.editable}
        componentPsets={result.component.psets}
      />
    </div>
  );
};

export default Page;
