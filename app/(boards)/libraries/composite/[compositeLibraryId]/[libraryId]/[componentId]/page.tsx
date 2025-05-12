"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import Link from "next/link";

const Page = () => {
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );

  const pathData = useAppSelector(
    (state) => state.libraryBrowser.compositeNavigation,
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
          <Link href={`/libraries/composite/${pathData.composite.id}`}>
            {pathData.composite.name}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link
            href={`/libraries/composite/${pathData.composite.id}/${pathData.library.id}`}
          >
            {pathData.library.name}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link href={linkURL}>{pathData.component.name}</Link>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Page;
