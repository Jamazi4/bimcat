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
      <Suspense fallback={<BrowserFallback />}>
        <ComponentList columns={columns} data={frontendComponents} />
        {libraryInfo.desc && (
          <div className="mt-12">
            <h1 className="font-semibold mb-4">Description:</h1>
            <p className="bg-accent text-muted-foreground rounded-md p-2 ">
              {libraryInfo.desc}
            </p>
          </div>
        )}
      </Suspense>
    </main>
  );
};
export default Page;
