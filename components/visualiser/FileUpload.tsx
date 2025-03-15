"use client";
import { MenubarItem } from "@/components/ui/menubar";
import { Input } from "../ui/input";

import { Dispatch, SetStateAction, useRef } from "react";

const FileUpload = ({
  setFile,
}: {
  setFile: Dispatch<SetStateAction<File | null>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: Event) => {
    event.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <>
      <MenubarItem onSelect={handleClick}>Load</MenubarItem>
      <Input
        className="hidden"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
};
export default FileUpload;
