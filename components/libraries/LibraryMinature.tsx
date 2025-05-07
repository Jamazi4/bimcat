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
import LibraryFavoriteButton from "./LibraryFavoriteButton";
import { Book, SquareLibrary } from "lucide-react";
import { frontendLibrary } from "@/utils/types";
import PrivateIcon from "../global/PrivateIcon";

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

  return (
    <Card
      className={`cursor-pointer hover:border-primary h-48 gap-2 py-4 rounded-md transition-all bg-${editable ? "accent" : "background"}`}
      onClick={() => {
        const isAnyDialogOpen = document.querySelector('[data-state="open"]');
        if (isAnyDialogOpen) return;
        router.push(`/libraries/${id}`);
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
              <LibraryFavoriteButton
                isComposite={isComposite}
                libraryId={id}
                isGuest={library.isGuest}
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
