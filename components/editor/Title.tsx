import { selectedRow } from "@/utils/types";
import DownloadIfcButton from "./DownloadIfcButton";
import { Separator } from "../ui/separator";
import AddComponentToLibraryButton from "../componentList/AddComponentToLibraryButton";
import RenameComponentButton from "./RenameComponentButton";

const Title = ({ componentData }: { componentData: selectedRow }) => {
  const id = Object.keys(componentData)[0];
  const { name, isPublic, editable } = componentData[id];
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl text-primary">{name}</h1>
          {editable && <RenameComponentButton />}
        </div>
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
