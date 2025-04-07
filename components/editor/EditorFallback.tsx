import { Skeleton } from "../ui/skeleton";

const EditorFallback = () => {
  return (
    <main className="w-full px-4 justify-center mx-auto">
      <div>
        <Skeleton className="h-5 w-1/4 mb-6" />
        <Skeleton className="w-1/6 h-12 mb-12" />
        <div
          className="justify-center grid grid-cols-1 lg:grid-cols-6
gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto"
        >
          <div className="lg:col-span-4">
            <Skeleton className="w-full aspect-square h-4/5" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-1/2" />
          </div>
        </div>
      </div>
    </main>
  );
};
export default EditorFallback;
