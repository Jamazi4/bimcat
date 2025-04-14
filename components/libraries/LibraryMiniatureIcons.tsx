import { Eye, EyeClosed } from "lucide-react";
import { Button } from "../ui/button";
import LibraryRemoveButton from "./LibraryRemoveButton";

const LibraryMinatureIcons = ({
  publicFlag,
  libraryId,
  libraryName,
}: {
  publicFlag: boolean;
  libraryId: string;
  libraryName: string;
}) => {
  return (
    <div className="pt-0 mt-0">
      {publicFlag ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <EyeClosed />
        </Button>
      )}
      <LibraryRemoveButton libraryId={libraryId} libraryName={libraryName} />
    </div>
  );
};

export default LibraryMinatureIcons;
