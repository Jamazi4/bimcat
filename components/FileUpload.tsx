"use client";

import { FileUp } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { getFragmentLoader } from "@/utils/ifcjs";

const FileUpload = () => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const [fragments, loader] = await getFragmentLoader();
      console.log("got here");
      console.log(loader, fragments);
      const model = await loader.load(buffer);
      console.log("got here2");
      console.log(model);
    }
  };

  return (
    <div>
      <Label htmlFor="ifc" className="cursor-pointer">
        <Button variant="ghost" size="icon" type="button" asChild>
          <FileUp className=" p-2" />
        </Button>
      </Label>
      <Input
        id="ifc"
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
