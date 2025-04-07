import { Skeleton } from "../ui/skeleton";

const LibrariesFallback = () => {
  const skeletons = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {skeletons.map((skeleton) => {
        return <Skeleton className="h-48" key={skeleton} />;
      })}
    </div>
  );
};
export default LibrariesFallback;
