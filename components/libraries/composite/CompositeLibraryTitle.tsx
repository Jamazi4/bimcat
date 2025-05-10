import { Separator } from "@/components/ui/separator";
import { LibraryInfo } from "@/utils/types";

const CompositeLibraryTitle = ({
  libraryInfo,
}: {
  libraryInfo: LibraryInfo;
}) => {
  const { name } = libraryInfo;
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl text-primary whitespace-nowrap">
            {name}
          </h1>
        </div>
        <div className="flex space-x-4"></div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};

export default CompositeLibraryTitle;
