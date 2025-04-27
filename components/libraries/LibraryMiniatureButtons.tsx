import { Eye, EyeClosed, Trash } from "lucide-react";
import LibraryMiniatureButton from "./LibraryMiniatureButton";
import {
  deleteLibraryAction,
  libraryTogglePrivateAction,
} from "@/utils/actions/libraryActions";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const LibraryMinatureButtons = ({
  publicFlag,
  libraryId,
  libraryName,
}: {
  publicFlag: boolean;
  libraryId: string;
  libraryName: string;
}) => {
  const userState = useSelector((state: RootState) => state.userSlice);
  const currentLibrary = userState.libraries.find(
    (library) => library.id === libraryId
  );
  if (!currentLibrary) return <div>Library does not exist</div>;

  const privateComponentsInside = currentLibrary.components.filter(
    (component) => component.public === false
  );
  const warningPrivateComponents =
    publicFlag === false && privateComponentsInside?.length > 0;

  const warningMessagePrivateComponents = `${libraryName} contains private components(${privateComponentsInside.length}), making this library public will automatically change all contained components to public`;

  const warningMessageLibraryShared = `This action will deactivate private share link for ${libraryName}.`;

  const warningMessages = [];

  if (warningPrivateComponents) {
    warningMessages.push(warningMessagePrivateComponents);
  }
  if (currentLibrary.isShared) {
    warningMessages.push(warningMessageLibraryShared);
  }

  const removeTitle = `Remove ${libraryName}`;
  const togglePrivateTitle = `Toggle private for ${libraryName}`;
  const removeMessage = `You are about to remove ${libraryName}, there is no undo.`;
  const togglePrivateMessage = `You are about to toggle 'private' for ${libraryName}.`;

  return (
    <div className="pt-0 mt-0">
      <LibraryMiniatureButton
        warningMessages={warningMessages}
        libraryId={libraryId}
        title={togglePrivateTitle}
        message={togglePrivateMessage}
        action={libraryTogglePrivateAction}
        icon={publicFlag ? <Eye /> : <EyeClosed />}
        destructive={false}
        tooltip={publicFlag ? "Make Private" : "Make Public"}
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
