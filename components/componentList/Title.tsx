import { selectedRow } from "@/utils/types";
import DownloadIfcButton from "../editor/DownloadIfcButton";
import { Separator } from "../ui/separator";
import AddComponentToLibraryButton from "./AddComponentToLibraryButton";

const Title = ({ componentData }: { componentData: selectedRow }) => {
  const id = Object.keys(componentData)[0];
  const { name, isPublic } = componentData[id];
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <h1 className="font-bold text-xl text-primary">{name}</h1>
        <div className="space-x-4">
          <DownloadIfcButton />
          <AddComponentToLibraryButton
            components={[componentData]}
            disabled={false}
            anyComponentPrivate={!isPublic}
          />
        </div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};
export default Title;
