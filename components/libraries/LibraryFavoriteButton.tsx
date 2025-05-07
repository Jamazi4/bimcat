"use client";

import { FaRegStar, FaStar } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState } from "react";
import { toggleLibraryFavoritesAction } from "@/utils/actions/libraryActions";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const LibraryFavoriteButton = ({
  libraryId,
  isGuest,
  isComposite,
}: {
  libraryId: string;
  isGuest: boolean;
  isComposite: boolean;
}) => {
  const [pending, setPending] = useState(false);
  const icon = isGuest ? <FaStar /> : <FaRegStar />;
  const dispatch = useAppDispatch();
  const toggleLibraryFavoritesMutation = useMutation({
    mutationFn: (libraryId: string) => {
      return toggleLibraryFavoritesAction(libraryId, isComposite);
    },
    meta: { invalidates: ["libraryBrowser"] },
  });

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setPending(true);
    toggleLibraryFavoritesMutation.mutate(libraryId, {
      onSuccess: (result) => {
        toast(result.message);
        dispatch(fetchUserLibraries());
      },
      onError: (error) => {
        toast(error.message);
      },
      onSettled: () => {
        setPending(false);
      },
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="animate-spin w-10 h-10" />
            ) : (
              icon
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isGuest ? "Remove From Faves" : "Add To Faves"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default LibraryFavoriteButton;
