"use client";

import MergeLibraryButton from "@/components/libraries/composite/MergeLibraryButton";
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
const Page = () => {
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["compositeLibrary", compositeLibraryId],
    queryFn: async () => {
      return fetchCompositeLibraryAction(compositeLibraryId);
    },
  });
  if (!data) return <div>no data</div>;

  if (isPending) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="text-secondary-foreground text-center">
        {error.message}
      </div>
    );

  const tableData = data.Libraries.map((entry) => {
    return {
      id: entry.id,
      name: entry.name,
      author: "test",
      updatedAt: entry.updatedAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      public: entry.public,
      components: entry.Components.map((component) => {
        return {
          id: component.id,
          name: component.name,
          author: "test",
          updatedAt: component.updatedAt.toISOString(),
          createdAt: component.createdAt.toISOString(),
          editable: false,
          public: false,
        };
      }),
    };
  });

  return (
    <main>
      <Breadcrumbs />
      <MergeLibraryButton />
      <ExpandableTable data={tableData} />
    </main>
  );
};

export default Page;

const Breadcrumbs = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Libraries</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
