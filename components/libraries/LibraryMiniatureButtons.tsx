import { Eye, EyeClosed, Trash } from "lucide-react";
import LibraryMiniatureButton from "./LibraryMiniatureButton";
import {
  deleteLibraryAction,
  libraryTogglePrivateAction,
} from "@/utils/actions";

const LibraryMinatureButtons = ({
  publicFlag,
  libraryId,
  libraryName,
}: {
  publicFlag: boolean;
  libraryId: string;
  libraryName: string;
}) => {
  const removeTitle = `Remove ${libraryName}`;
  const togglePrivateTitle = `Toggle private for ${libraryName}`;
  const removeMessage = `You are about to remove ${libraryName}, there is no undo.`;
  const togglePrivateMessage = `You are about to toggle 'private' for ${libraryName}.`;

  return (
    <div className="pt-0 mt-0">
      <LibraryMiniatureButton
        libraryId={libraryId}
        title={togglePrivateTitle}
        message={togglePrivateMessage}
        action={libraryTogglePrivateAction}
        icon={publicFlag ? <Eye /> : <EyeClosed />}
        destructive={false}
        tooltip="Toggle Private"
      />

      <LibraryMiniatureButton
        libraryId={libraryId}
        title={removeTitle}
        message={removeMessage}
        action={deleteLibraryAction}
        icon={<Trash />}
        destructive={true}
        tooltip="Remove"
      />
    </div>
  );
};

export default LibraryMinatureButtons;
