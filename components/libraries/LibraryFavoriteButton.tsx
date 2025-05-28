"use client";

import { FaRegStar, FaStar } from "react-icons/fa6";
import { toggleLibraryFavoritesAction } from "@/utils/actions/libraryActions";
import { useAppSelector } from "@/lib/hooks";
import LibraryMiniatureButton from "./LibraryMiniatureButton";

const LibraryFavoriteButton = ({
  libraryId,
  isGuest,
  isComposite,
  libraryName,
  isPublic,
}: {
  isPublic: boolean;
  libraryId: string;
  isGuest: boolean;
  isComposite: boolean;
  libraryName: string;
}) => {
  const stateUser = useAppSelector((state) => state.userSlice);
  const toggleFavoriteTitle = isGuest
    ? `Add ${libraryName} to favorites`
    : `Remove ${libraryName} from favorites`;

  const containingComposites = stateUser.libraries.filter((lib) => {
    if (!lib.isComposite) return false;
    if (lib.content.some((content) => content.id === libraryId)) return true;
  });

  const warningMessagePrivateLibrary = `${libraryName} is a private library, removing it from favorites will make it inaccessible.`;
  const warningMessageLibraryInComposite = `${libraryName} is in ${containingComposites.length} composite ${containingComposites.length > 1 ? "libraries" : "library"} that you own. Continuing this action will remove it from your composite libraries.`;

  const warningMessages = [];

  if (isGuest && !isPublic) {
    warningMessages.push(warningMessagePrivateLibrary);
  }
  if (containingComposites.length > 0) {
    warningMessages.push(warningMessageLibraryInComposite);
  }
  const toggleFavoriteAction = toggleLibraryFavoritesAction.bind(
    null,
    libraryId,
    isComposite,
  );

  const toggleFavoriteMessage = `You are about to toggle favorite for ${libraryName}.`;

  return (
    <LibraryMiniatureButton
      warningMessages={warningMessages}
      libraryId={libraryId}
      title={toggleFavoriteTitle}
      message={toggleFavoriteMessage}
      action={toggleFavoriteAction}
      icon={isGuest ? <FaStar /> : <FaRegStar />}
      destructive={false}
      tooltip={isGuest ? "Remove From Faves" : "Add To Faves"}
    />
  );
};
export default LibraryFavoriteButton;
