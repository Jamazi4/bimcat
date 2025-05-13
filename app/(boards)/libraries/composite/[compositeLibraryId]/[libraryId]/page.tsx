"use client";

import LoadingSpinner from "@/components/global/LoadingSpinner";
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
import { useState } from "react";

const Page = () => {
  const [libraryName, setLibraryName] = useState<string>("");
  const [compositeName, setCompositeName] = useState<string>("");
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
      setLibraryName(result.libraryName);
      setCompositeName(result.compositeName);
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

  if (!data) return <div>no data</div>;
  const query = searchParamsToQuery(stateSearchParams);
  const linkURL = `/libraries?${query}`;
  return (
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
        <BreadcrumbPage>{libraryName}</BreadcrumbPage>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Page;
