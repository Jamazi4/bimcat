import { LibraryInfo } from "@/utils/types";
import { Separator } from "../ui/separator";
import RenameButtonTitleBar from "../global/RenameButtonTitleBar";
import DownloadLibraryButton from "./DownloadLibraryButton";
import ShareLibraryButton from "./ShareLibraryButton";
import ManageGuestsButton from "./ManageGuestsButton";
import { renameLibraryAction } from "@/utils/actions/libraryActions";

const LibraryTitle = ({ libraryInfo }: { libraryInfo: LibraryInfo }) => {
  const { name, isEditable, isPublic, empty, sharedId, guests } = libraryInfo;

  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl text-primary whitespace-nowrap">
            {name}
          </h1>
          {isEditable && (
            <RenameButtonTitleBar
              curName={name}
              isComposite={false}
              action={renameLibraryAction}
              isComponent={false}
            />
          )}
        </div>
        <div className="flex space-x-4">
          <DownloadLibraryButton libraryEmpty={empty} isComposite={false} />
          {!isPublic && isEditable && (
            <>
              <ShareLibraryButton sharedId={sharedId} />
              <ManageGuestsButton guests={guests} />
            </>
          )}
        </div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};
export default LibraryTitle;
