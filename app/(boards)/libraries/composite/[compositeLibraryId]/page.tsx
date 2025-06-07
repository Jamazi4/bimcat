"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { fetchCompositeLibraryAction as fetchCompositeLibraryAction } from "@/utils/actions/libraryActions";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ExpandableTable } from "@/components/libraries/composite/CompositeLibraryTable";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import { useAppSelector } from "@/lib/hooks";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import Link from "next/link";
import CompositeLibraryTitle from "@/components/libraries/composite/CompositeLibraryTitle";
import LibraryDescription from "@/components/libraries/LibraryDescription";
import LibraryInfo from "@/components/libraries/LibraryInfo";
const Page = () => {
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["compositeLibrary", compositeLibraryId],
    queryFn: async () => {
      return fetchCompositeLibraryAction(compositeLibraryId);
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="text-secondary-foreground text-center">
        {error.message}
      </div>
    );

  if (!data) return <div>no data</div>;
  const { tableData, libraryInfo } = data;
  const libraryName = libraryInfo.name;

  console.log(libraryInfo);
  return (
    <main>
      <Breadcrumbs libraryName={libraryName} />
      <CompositeLibraryTitle libraryInfo={libraryInfo} />
      <LibraryInfo
        author={libraryInfo.author}
        updatedAt={libraryInfo.updatedAt}
        createdAt={libraryInfo.createdAt}
        isPublic={libraryInfo.isPublic}
      />
      <ExpandableTable data={tableData} />
      <LibraryDescription
        isEditable={libraryInfo.isEditable}
        libraryInfo={libraryInfo}
        libraryId={compositeLibraryId}
      />
    </main>
  );
};

export default Page;

const Breadcrumbs = ({ libraryName }: { libraryName: string }) => {
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );

  const query = searchParamsToQuery(stateSearchParams);

  const linkURL = `/libraries?${query}`;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link href={linkURL}>Libraries</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{libraryName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
