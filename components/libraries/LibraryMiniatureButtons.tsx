import { Eye, EyeClosed, Trash } from "lucide-react";
import LibraryMiniatureButton from "./LibraryMiniatureButton";
import {
  deleteLibraryAction,
  libraryTogglePrivateAction,
} from "@/utils/actions/libraryActions";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import PrivateIcon from "../global/PrivateIcon";

const LibraryMinatureButtons = ({
  publicFlag,
  libraryId,
  libraryName,
  isComposite,
}: {
  publicFlag: boolean;
  libraryId: string;
  libraryName: string;
  isComposite: boolean;
}) => {
  const userState = useSelector((state: RootState) => state.userSlice);
  const currentLibrary = userState.libraries.find(
    (library) => library.id === libraryId,
  );

  if (!currentLibrary) return <div>Library does not exist</div>;

  const privateContentInside = currentLibrary.content.filter(
    (content) => content.public === false,
  );
  const warningPrivateComponents =
    publicFlag === false && privateContentInside?.length > 0;

  const warningMessagePrivateComponents = `${libraryName} contains private components(${privateContentInside.length}), making this library public will automatically change all contained components to public`;

  const warningMessageLibraryShared = `This action will deactivate private share link for ${libraryName}.`;

  const warningMessages = [];

  if (warningPrivateComponents) {
    warningMessages.push(warningMessagePrivateComponents);
  }
  if (currentLibrary.isShared) {
    warningMessages.push(warningMessageLibraryShared);
  }

  const toggleAction = libraryTogglePrivateAction.bind(null, libraryId);
  const deleteAction = deleteLibraryAction.bind(null, libraryId, isComposite);

  const removeTitle = `Remove ${libraryName}`;
  const togglePrivateTitle = `Toggle private for ${libraryName}`;
  const removeMessage = `You are about to remove ${libraryName}, there is no undo.`;
  const togglePrivateMessage = `You are about to toggle 'private' for ${libraryName}.`;

  return (
    <div className="pt-0 mt-0">
      {!isComposite ? (
        <LibraryMiniatureButton
          warningMessages={warningMessages}
          libraryId={libraryId}
          title={togglePrivateTitle}
          message={togglePrivateMessage}
          action={toggleAction}
          icon={publicFlag ? <Eye /> : <EyeClosed />}
          destructive={false}
          tooltip={publicFlag ? "Make Private" : "Make Public"}
        />
      ) : (
        <PrivateIcon publicFlag={publicFlag} />
      )}
      <LibraryMiniatureButton
        libraryId={libraryId}
        title={removeTitle}
        message={removeMessage}
        action={deleteAction}
        icon={<Trash />}
        destructive={true}
        tooltip="Remove"
      />
    </div>
  );
};

export default LibraryMinatureButtons;
