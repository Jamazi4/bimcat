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
import { formatLibraryParams } from "@/utils/utilFunctions";
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
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.searchParams,
  );

  const query = formatLibraryParams(stateSearchParams);

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
            {/* //TODO: this breaks searchparams persistence */}
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
