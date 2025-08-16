import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import FileUpload from "./FileUpload";
import { Dispatch, SetStateAction } from "react";
import SaveComponent from "./SaveComponent";
import ClearFile from "./ClearFile";
import CreateComponent from "./CreateComponent";
import { useRouter, useSearchParams } from "next/navigation";

const MenuBar = ({
  setFile,
  selected,
  file,
  nodeMode,
}: {
  setFile: Dispatch<SetStateAction<File | null>>;
  selected: number | null;
  file: File | null;
  nodeMode: boolean;
}) => {
  const searchParams = useSearchParams();
  const componentId = searchParams.get("component");
  const disableOpenInBrowser = componentId === null;
  const router = useRouter();
  const handleOpenInBrowser = () => {
    router.replace(`/components/${componentId}`);
  };
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
          <CreateComponent disabled={nodeMode || file !== null} />
          <MenubarItem
            onSelect={handleOpenInBrowser}
            disabled={disableOpenInBrowser}
          >
            Open in browser
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
export default MenuBar;
