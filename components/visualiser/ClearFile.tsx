import { Dispatch, SetStateAction } from "react";
import { MenubarItem } from "../ui/menubar";

const ClearFile = ({
  setFile,
  disabled,
}: {
  setFile: Dispatch<SetStateAction<File | null>>;
  disabled: boolean;
}) => {
  const handleClearFile = () => {
    setFile(null);
  };
  return (
    <>
      <MenubarItem onSelect={handleClearFile} disabled={disabled}>
        Clear
      </MenubarItem>
    </>
  );
};

export default ClearFile;
