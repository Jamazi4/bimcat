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

const LibraryBreadCrumbs = ({ libraryName }: { libraryName: string }) => {
  const searchParams = useAppSelector(
    (state) => state.libraryBrowser.searchParams
  );

  const query = new URLSearchParams({
    myLibraries: searchParams.myLibraries.toString(),
    search: searchParams.searchString,
    favorites: searchParams.favorites.toString(),
  });

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
