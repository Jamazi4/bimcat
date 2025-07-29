"use client";

import { fetchLibraryComponents } from "@/utils/actions/libraryActions";
import { columns } from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import LibraryBreadCrumbs from "@/components/libraries/LibraryBreadCrumbs";
import LibraryTitle from "@/components/libraries/LibraryTitle";
import { Suspense } from "react";
import BrowserFallback from "@/components/componentList/BrowserFallback";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import LibraryDescription from "@/components/libraries/LibraryDescription";
import LibraryInfo from "@/components/libraries/LibraryInfo";

const Page = () => {
  const { libraryId } = useParams<{ libraryId: string }>();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["libraryComponents", libraryId],
    queryFn: async () => {
      return fetchLibraryComponents(libraryId);
    },
  });

  if (isPending) return <LoadingSpinner />;

  if (data === undefined) return <div>Library does not exist</div>;

  const { libraryInfo, frontendComponents } = data;

  if (isError) return <div>{error.message}</div>;

  if (!frontendComponents) return <div>No components found.</div>;

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <LibraryBreadCrumbs libraryName={libraryInfo.name} />
      <LibraryTitle libraryInfo={libraryInfo} />
      <LibraryInfo
        author={data.libraryInfo.author}
        createdAt={data.libraryInfo.createdAt}
        updatedAt={data.libraryInfo.updatedAt}
        isPublic={data.libraryInfo.isPublic}
      />
      <Suspense fallback={<BrowserFallback />}>
        <ComponentList
          columns={columns}
          data={frontendComponents}
          libraryEditable={libraryInfo.isEditable}
        />
      </Suspense>
      <LibraryDescription
        isEditable={data.libraryInfo.isEditable}
        libraryId={libraryId}
        libraryInfo={libraryInfo}
      />
    </main>
  );
};
export default Page;
