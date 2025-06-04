"use client";

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
import { useAppSelector } from "@/lib/hooks";
import { searchParamsToQuery } from "@/utils/utilFunctions";
import Link from "next/link";
import { LibraryInfoType as LibraryInfoType } from "@/utils/types";
import CompositeLibraryTitle from "@/components/libraries/composite/CompositeLibraryTitle";
import LibraryDescription from "@/components/libraries/LibraryDescription";
import LibraryInfo from "@/components/libraries/LibraryInfo";
const Page = () => {
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["compositeLibrary", compositeLibraryId],
    queryFn: async () => {
      return fetchCompositeLibraryAction(compositeLibraryId);
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
  const libraryName = data.name;

  const mergedLibraryIds: string[] = [];
  const tableData = data.Libraries.map((entry) => {
    mergedLibraryIds.push(entry.id);
    return {
      id: entry.id,
      name: entry.name,
      author: `${entry.author.firstName} ${entry.author.secondName}`,
      updatedAt: entry.updatedAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      public: entry.public,
      components: entry.Components.map((component) => {
        return {
          id: component.id,
          name: component.name,
          author: `${entry.author.firstName} ${entry.author.secondName}`,
          updatedAt: component.updatedAt.toISOString(),
          createdAt: component.createdAt.toISOString(),
          editable: false,
          public: component.public,
        };
      }),
    };
  });

  const authorString = `${data.author.firstName} ${data.author.secondName}`;
  const libraryInfo: LibraryInfoType = {
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
    author: authorString,
    empty: data.Libraries.length === 0,
    name: data.name,
    desc: data.description,
    sharedId: data.sharedId || "",
    isEditable: data.editable,
    isPublic: data.public,
    isComposite: true,
    guests: data.guests.map((guest) => {
      return {
        name: `${guest.firstName} ${guest.secondName}`,
        id: guest.id,
        numMergedLibraries: guest.authoredLibraries.reduce((acc, cur) => {
          if (mergedLibraryIds.includes(cur.id)) return acc + 1;
          else return acc;
        }, 0),
      };
    }),
  };
  //TODO: I shouldn't have to do the above, it's already good on backend
  //TODO: also the fetchCompositeLibraryAction leaks user ids in guests
  return (
    <main>
      <Breadcrumbs libraryName={libraryName} />
      <CompositeLibraryTitle libraryInfo={libraryInfo} />
      <LibraryInfo
        author={authorString}
        updatedAt={libraryInfo.updatedAt}
        createdAt={libraryInfo.createdAt}
        isPublic={libraryInfo.isPublic}
      />
      <ExpandableTable data={tableData} />
      <LibraryDescription
        isEditable={libraryInfo.isEditable}
        libraryInfo={libraryInfo}
        libraryId={compositeLibraryId}
      />
    </main>
  );
};

export default Page;

const Breadcrumbs = ({ libraryName }: { libraryName: string }) => {
  const stateSearchParams = useAppSelector(
    (state) => state.libraryBrowser.librarySliceSearchParams,
  );

  const query = searchParamsToQuery(stateSearchParams);

  const linkURL = `/libraries?${query}`;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link href={linkURL}>Libraries</Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{libraryName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
