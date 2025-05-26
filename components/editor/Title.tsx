import { SelectedRow } from "@/utils/types";
import DownloadIfcButton from "./DownloadIfcButton";
import { Separator } from "../ui/separator";
import AddComponentToLibraryButton from "../componentList/AddComponentToLibraryButton";
import RenameButtonTitleBar, {
  RenameButtonProps,
} from "../global/RenameButtonTitleBar";
import { renameComponentAction } from "@/utils/actions/componentActions";
import { Box } from "lucide-react";

const Title = ({ componentData }: { componentData: SelectedRow }) => {
  const id = Object.keys(componentData)[0];
  const { name, isPublic, editable } = componentData[id];
  const renameButtonProps: RenameButtonProps = {
    action: renameComponentAction,
    curName: name,
    isComponent: true,
  };
  const shortLength = 60;
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Box className="mr-2" />
          <h1 className="font-bold text-xl text-primary whitespace-nowrap">
            {name.length > shortLength
              ? `${name.slice(0, shortLength)}...`
              : name}
          </h1>
          <div>
            {editable && <RenameButtonTitleBar {...renameButtonProps} />}
          </div>
        </div>
        <div className="space-x-4">
          <DownloadIfcButton />
          {editable && (
            <>
              <AddComponentToLibraryButton
                components={[componentData]}
                disabled={false}
                anyComponentPrivate={!isPublic}
              />
              {/* <ComponentPrivateToggle */}
              {/*   components={[componentData]} */}
              {/*   disabled={false} */}
              {/*   icon={icon} */}
              {/* /> */}
            </>
          )}
        </div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};
export default Title;
