"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import LibraryMinatureButtons from "./LibraryMiniatureButtons";
import { useRouter } from "next/navigation";

type frontendLibrary = {
  libId: string;
  libName: string;
  description: string;
  libAuthor: string;
  createdAt: Date;
  updatedAt: Date;
  numComponents: number;
  numGuests: number;
  editable: boolean;
  publicFlag: boolean;
};

const LibraryMinature = ({ library }: { library: frontendLibrary }) => {
  const router = useRouter();
  const {
    libId,
    libName,
    description,
    createdAt,
    updatedAt,
    libAuthor,
    numComponents,
    publicFlag,
    editable,
  } = library;
  const charLimit = 140;
  return (
    <Card
      className="cursor-pointer hover:border-primary h-48 gap-2 py-4 rounded-md transition-all bg-accent"
      onClick={() => {
        const isAnyDialogOpen = document.querySelector('[data-state="open"]');
        if (isAnyDialogOpen) return;
        router.push(`/libraries/${libId}`);
      }}
    >
      <CardHeader>
        <CardTitle className="h-12 flex justify-between text-lg pb-2 items-center">
          {libName}
          {editable ? (
            <LibraryMinatureButtons
              publicFlag={publicFlag}
              libraryId={libId}
              libraryName={libName}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Star />
            </Button>
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
          <p>{`Owner: ${libAuthor}`}</p>
          <p>{`Components: ${numComponents}`}</p>
        </div>
      </CardFooter>
    </Card>
  );
};
export default LibraryMinature;
