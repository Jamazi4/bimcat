import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import Link from "next/link";

const CompositeComponentBreadcrumbs = ({
  compositeName,
  libraryName,
  compositeLibraryId,
  libraryId,
  componentName,
}: {
  compositeName: string;
  libraryName: string;
  compositeLibraryId: string;
  libraryId: string;
  componentName: string;
}) => {
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );
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
        <BreadcrumbItem>
          <Link
            href={`/libraries/composite/${compositeLibraryId}/${libraryId}`}
          >
            {libraryName}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link href={linkURL}>{componentName}</Link>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CompositeComponentBreadcrumbs;
