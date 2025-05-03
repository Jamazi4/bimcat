"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { formatLibraryParams } from "@/utils/utilFunctions";

const LibraryBreadCrumbs = ({ libraryName }: { libraryName: string }) => {
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.searchParams,
  );

  const query = formatLibraryParams(stateSearchParams);

  const linkURL = `/libraries?${query}`;

  return (
    <Breadcrumb className="border-accent">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={linkURL}>Libraries</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{libraryName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
export default LibraryBreadCrumbs;
