"use client";

import Title from "@/components/editor/Title";
import ComponentContentWrapper from "@/components/global/ComponentContentWrapper";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/lib/hooks";
import { fetchCompositeComponent } from "@/utils/actions/libraryActions";
import { componentWithGeometrySchemaType } from "@/utils/schemas";
import { SelectedRow } from "@/utils/types";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const { compositeLibraryId, libraryId, componentId } = useParams<{
    compositeLibraryId: string;
    libraryId: string;
    componentId: string;
  }>();

  const [libraryName, setLibraryName] = useState<string>("");
  const [compositeName, setCompositeName] = useState<string>("");

  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );

  type responseType = {
    component: componentWithGeometrySchemaType;
    libraryName: string;
    compositeName: string;
  };

  const { isPending, isError, data, error } = useQuery<responseType, Error>({
    queryKey: [
      "compositeComponent",
      componentId,
      compositeLibraryId,
      libraryId,
    ],
    queryFn: async () => {
      const result = await fetchCompositeComponent(
        compositeLibraryId,
        libraryId,
        componentId,
      );

      setLibraryName(result.libraryName);
      setCompositeName(result.compositeName);

      return result;
    },
  });

  if (isPending) return <LoadingSpinner />;
  if (isError) return <div>{error.message}</div>;
  if (data === undefined) return <div>Library does not exist</div>;

  const componentData: SelectedRow = {
    [data.component.id]: {
      name: data.component.name,
      isPublic: data.component.public,
      editable: data.component.editable,
    },
  };

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
          <BreadcrumbItem>
            <Link
              href={`/libraries/composite/${compositeLibraryId}/${libraryId}`}
            >
              {libraryName}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={linkURL}>{data.component.name}</Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Title componentData={componentData} />
      <ComponentContentWrapper
        componentGeometry={data.component.geometry}
        componentEditable={data.component.editable}
        componentPsets={data.component.psets}
      />
    </div>
  );
};

export default Page;
