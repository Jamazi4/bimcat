"use client";

import { FaRegStar, FaStar } from "react-icons/fa6";
import { Button } from "../ui/button";
import { useState } from "react";
import { toggleLibraryFavoritesAction } from "@/utils/actions/libraryActions";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const LibraryFavoriteButton = ({
  libraryId,
  isGuest,
}: {
  libraryId: string;
  isGuest: boolean;
}) => {
  const [pending, setPending] = useState(false);
  const icon = isGuest ? <FaStar /> : <FaRegStar />;
  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setPending(true);
    const result = await toggleLibraryFavoritesAction(libraryId);

    if (result.message) {
      toast(result.message);
    } else {
      toast("Something went wrong");
    }
    setPending(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <LoaderCircle className="animate-spin w-10 h-10" /> : icon}
    </Button>
  );
};
export default LibraryFavoriteButton;
