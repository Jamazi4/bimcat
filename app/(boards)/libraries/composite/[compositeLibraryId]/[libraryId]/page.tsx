"use client";

import BrowserFallback from "@/components/componentList/BrowserFallback";
import { ComponentList } from "@/components/componentList/ComponentList";
import { columns } from "@/components/componentList/ComponentListColumns";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import LibraryDescription from "@/components/libraries/LibraryDescription";
import LibraryInfo from "@/components/libraries/LibraryInfo";
import LibraryTitle from "@/components/libraries/LibraryTitle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { fetchLibraryFromComposite } from "@/utils/actions/libraryActions";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";

const Page = () => {
  const { compositeLibraryId, libraryId } = useParams<{
    compositeLibraryId: string;
    libraryId: string;
  }>();

  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["compositeLibraryLibrary", compositeLibraryId, libraryId],
    queryFn: async () => {
      const result = await fetchLibraryFromComposite(
        libraryId,
        compositeLibraryId,
      );
      return result;
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="text-secondary-foreground text-center">
        {error.message}
      </div>
    );

  if (!data || !data.frontendComponents) return <div>no data</div>;
  const { frontendComponents, libraryInfo, compositeName } = data;

  const query = searchParamsToQuery(stateSearchParams);
  const linkURL = `/libraries?${query}`;
  return (
    <div>
      <Breadcrumb className="border-accent">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/">Home</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={linkURL}>Libraries</Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={`/libraries/composite/${compositeLibraryId}`}>
              {compositeName}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{libraryInfo.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <LibraryTitle libraryInfo={libraryInfo} />
      <Suspense fallback={<BrowserFallback />}>
        <ComponentList columns={columns} data={frontendComponents} />
      </Suspense>
      <LibraryInfo
        author={data.libraryInfo.author}
        isPublic={data.libraryInfo.isPublic}
        updatedAt={data.libraryInfo.updatedAt}
        createdAt={data.libraryInfo.createdAt}
      />
      <LibraryDescription
        isEditable={libraryInfo.isEditable}
        libraryId={libraryId}
        libraryInfo={libraryInfo}
      />
    </div>
  );
};

export default Page;
