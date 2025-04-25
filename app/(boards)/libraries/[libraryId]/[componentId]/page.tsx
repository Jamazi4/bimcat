import EditorFallback from "@/components/editor/EditorFallback";
import LibraryComponentContent from "@/components/libraries/LibraryComponentContent";
import { Suspense } from "react";

const page = ({
  params,
}: {
  params: Promise<{ libraryId: string; componentId: string }>;
}) => {
  return (
    <main className="w-full px-4 justify-center mx-auto">
      <Suspense key={1} fallback={<EditorFallback />}>
        <LibraryComponentContent params={params} />
      </Suspense>
    </main>
  );
};
export default page;
