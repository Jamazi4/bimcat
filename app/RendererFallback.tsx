import { Skeleton } from "@/components/ui/skeleton";

const RendererFallback = () => {
  return (
    <main className="w-full px-4 justify-center mx-auto">
      <div>
        <div
          className="justify-center grid grid-cols-1 lg:grid-cols-6
gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto h-[600px]"
        >
          <div className="lg:col-span-4">
            <Skeleton className="w-full aspect-square h-2/3" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-2/3" />
          </div>
        </div>
        <div className="h-48">
          <Skeleton className="h-full" />
        </div>
      </div>
    </main>
  );
};
export default RendererFallback;
