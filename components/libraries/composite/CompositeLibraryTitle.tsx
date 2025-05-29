import RenameButtonTitleBar from "@/components/global/RenameButtonTitleBar";
import { Separator } from "@/components/ui/separator";
import { LibraryInfoType } from "@/utils/types";
import DownloadLibraryButton from "../DownloadLibraryButton";
import { renameLibraryAction } from "@/utils/actions/libraryActions";
import MergeLibraryButton from "./MergeLibraryButton";
import { SquareLibrary } from "lucide-react";
import ShareLibraryButton from "../ShareLibraryButton";

const CompositeLibraryTitle = ({
  libraryInfo,
}: {
  libraryInfo: LibraryInfoType;
}) => {
  const { name, isEditable, sharedId, isPublic, empty } = libraryInfo;
  return (
    <div className="my-6">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="font-bold text-xl text-primary whitespace-nowrap">
            <div className="flex">
              <SquareLibrary className="mr-2" />
              {name}
            </div>
          </h1>
          {isEditable && (
            <div>
              <RenameButtonTitleBar
                action={renameLibraryAction}
                curName={name}
                isComposite={true}
                isComponent={false}
              />
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <DownloadLibraryButton libraryEmpty={empty} isComposite={true} />

          {!isPublic && isEditable && (
            <ShareLibraryButton sharedId={sharedId} isComposite={true} />
          )}
          <MergeLibraryButton />
        </div>
      </div>
      <Separator className="mt-2" />
    </div>
  );
};

export default CompositeLibraryTitle;
