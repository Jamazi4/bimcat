"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { usePathname } from "next/navigation";

const LibraryComponentContentBreadcrumbs = ({
  libraryName,
  componentName,
}: {
  libraryName: string;
  componentName: string;
}) => {
  const pathname = usePathname();
  const libraryId = pathname.split("/")[2];
  const searchParams = useAppSelector(
    (state) => state.libraryBrowser.searchParams
  );
  const query = new URLSearchParams({
    myLibraries: searchParams.myLibraries.toString(),
    favorites: searchParams.favorites.toString(),
    search: searchParams.searchString,
  });

  const linkURL = `/libraries?${query}`;

  return (
    <Breadcrumb>
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
          <BreadcrumbLink href={`/libraries/${libraryId}`}>
            {libraryName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{componentName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
export default LibraryComponentContentBreadcrumbs;
