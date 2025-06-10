import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import FileUpload from "./FileUpload";
import { Dispatch, SetStateAction } from "react";
import SaveComponent from "./SaveComponent";
import ClearFile from "./ClearFile";
import CreateComponent from "./CreateComponent";

const MenuBar = ({
  setFile,
  selected,
  file,
  nodeMode,
  setNodeMode,
}: {
  setFile: Dispatch<SetStateAction<File | null>>;
  selected: number | null;
  file: File | null;
  nodeMode: boolean;
  setNodeMode: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Menubar className="absolute m-4 z-10">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <FileUpload setFile={setFile} />
          <ClearFile setFile={setFile} disabled={file === null} />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Component</MenubarTrigger>
        <MenubarContent>
          <SaveComponent selected={selected} file={file} />
          <CreateComponent
            disabled={nodeMode || file !== null}
            setNodeMode={setNodeMode}
          />
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
export default MenuBar;
