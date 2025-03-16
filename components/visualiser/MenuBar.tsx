import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import FileUpload from "./FileUpload";
import { Dispatch, SetStateAction } from "react";
import SaveComponent from "./SaveComponent";

const MenuBar = ({
  setFile,
  selected,
  file,
}: {
  setFile: Dispatch<SetStateAction<File | null>>;
  selected: number | null;
  file: File | null;
}) => {
  return (
    <Menubar className="absolute m-4 z-10">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <FileUpload setFile={setFile} />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Component</MenubarTrigger>
        <MenubarContent>
          <SaveComponent selected={selected} file={file} />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
export default MenuBar;
