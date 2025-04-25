import { SelectedRow } from "@/utils/types";
import DownloadIfcButton from "./DownloadIfcButton";
import { Separator } from "../ui/separator";
import AddComponentToLibraryButton from "../componentList/AddComponentToLibraryButton";
import RenameButtonTitleBar, {
  RenameButtonProps,
} from "../global/RenameButtonTitleBar";
import { renameComponentAction } from "@/utils/actions/componentActions";

const Title = ({ componentData }: { componentData: SelectedRow }) => {
  const id = Object.keys(componentData)[0];
  const { name, isPublic, editable } = componentData[id];
  const renameButtonProps: RenameButtonProps = {
    action: renameComponentAction,
    curName: name,
  };
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl text-primary whitespace-nowrap">
            {name}
          </h1>
          {editable && <RenameButtonTitleBar {...renameButtonProps} />}
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
