import ComponentContent from "@/components/editor/ComponentContent";
import EditorFallback from "@/components/editor/EditorFallback";
import { Suspense } from "react";

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  return (
    <main className="w-full px-4 justify-center mx-auto">
      <Suspense key={1} fallback={<EditorFallback />}>
        <ComponentContent params={params} />
      </Suspense>
    </main>
  );
};
export default page;
