import { fetchLibraryComponents } from "@/utils/actions/libraryActions";
import { columns } from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import LibraryBreadCrumbs from "@/components/libraries/LibraryBreadCrumbs";
import LibraryTitle from "@/components/libraries/LibraryTitle";
import { Suspense } from "react";
import BrowserFallback from "@/components/componentList/BrowserFallback";

const page = async ({ params }: { params: Promise<{ libraryId: string }> }) => {
  const { libraryId } = await params;
  const result = await fetchLibraryComponents(libraryId);

  if (result === undefined) return <div>Library does not exist</div>;

  const { libraryInfo, frontendComponents } = result;

  if (!libraryId) return <div>Library does not exist</div>;

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
export default page;
