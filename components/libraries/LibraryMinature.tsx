"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import LibraryMinatureButtons from "./LibraryMiniatureButtons";
import { useRouter } from "next/navigation";
import { Book, SquareLibrary } from "lucide-react";
import { frontendLibrary } from "@/utils/types";
import PrivateIcon from "../global/PrivateIcon";
import LibraryMiniatureButton from "./LibraryMiniatureButton";
import { toggleLibraryFavoritesAction } from "@/utils/actions/libraryActions";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { useAppSelector } from "@/lib/hooks";

const LibraryMinature = ({ library }: { library: frontendLibrary }) => {
  const router = useRouter();
  const {
    id,
    name,
    description,
    createdAt,
    updatedAt,
    author,
    numElements,
    publicFlag,
    editable,
    isComposite,
  } = library;
  const charLimit = 140;

  const stateUser = useAppSelector((state) => state.userSlice);
  const toggleFavoriteTitle = library.isGuest
    ? `Add ${name} to favorites`
    : `Remove ${name} from favorites`;

  const containingComposites = stateUser.libraries.filter((lib) => {
    if (!lib.isComposite) return false;
    if (lib.content.some((content) => content.id === id)) return true;
  });

  const warningMessagePrivateLibrary = `${name} is a private library, removing it from favorites will make it inaccessible.`;
  const warningMessageLibraryInComposite = `${name} is in ${containingComposites.length} composite ${containingComposites.length > 1 ? "libraries" : "library"} that you own. Continuing this action will remove it from your composite libraries.`;

  const warningMessages = [];

  if (library.isGuest && !library.publicFlag) {
    warningMessages.push(warningMessagePrivateLibrary);
  }
  if (containingComposites.length > 0) {
    warningMessages.push(warningMessageLibraryInComposite);
  }
  const toggleFavoriteAction = toggleLibraryFavoritesAction.bind(
    null,
    id,
    isComposite,
  );

  const toggleFavoriteMessage = `You are about to toggle favorite for ${name}.`;

  return (
    <Card
      className={`cursor-pointer hover:border-primary h-48 gap-2 py-4 rounded-md transition-all bg-${editable ? "accent" : "background"}`}
      onClick={() => {
        const isAnyDialogOpen = document.querySelector('[data-state="open"]');
        if (isAnyDialogOpen) return;
        if (isComposite) {
          router.push(`/libraries/composite/${id}`);
        } else {
          router.push(`/libraries/${id}`);
        }
      }}
    >
      <CardHeader>
        <CardTitle className="h-12 flex justify-between text-lg pb-2 items-center">
          <div className="flex">
            {isComposite ? (
              <SquareLibrary className="mr-2" />
            ) : (
              <Book className="mr-2" />
            )}
            {name}
          </div>

          {editable ? (
            <LibraryMinatureButtons
              isComposite={isComposite}
              publicFlag={publicFlag}
              libraryId={id}
              libraryName={name}
            />
          ) : (
            <div className="flex">
              <PrivateIcon publicFlag={publicFlag} />
              {/* <LibraryFavoriteButton */}
              {/*   isComposite={isComposite} */}
              {/*   libraryId={id} */}
              {/*   isGuest={library.isGuest} */}
              {/* /> */}
              <LibraryMiniatureButton
                warningMessages={warningMessages}
                libraryId={id}
                title={toggleFavoriteTitle}
                message={toggleFavoriteMessage}
                action={toggleFavoriteAction}
                icon={library.isGuest ? <FaStar /> : <FaRegStar />}
                destructive={false}
                tooltip={library.isGuest ? "Remove From Faves" : "Add To Faves"}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {description.length > charLimit
          ? `${description.substring(0, charLimit)}...`
          : description}
      </CardContent>
      <CardFooter className="text-sm text-secondary-foreground justify-between mt-auto">
        <div>
          <p>Created: {format(createdAt, "dd-MM-yy HH:mm")}</p>
          <p>Updated: {format(updatedAt, "dd-MM-yy HH:mm")}</p>
        </div>
        <div className="align-text-bottom ">
          <p
            className={`${editable ? "text-primary" : "text-secondary-foreground"}`}
          >{`Owner: ${author}`}</p>

          <p>{`${isComposite ? "Libraries" : "Components"}: ${numElements}`}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
export default LibraryMinature;
