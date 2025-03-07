"use client";

import { FileUp } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import * as WEBIFC from "web-ifc";
import { getFragmentLoader } from "@/utils/ifcjs";

const FileUpload = () => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const { loader, indexer } = await getFragmentLoader();

      const webIfc = new WEBIFC.IfcAPI();
      webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);

      await webIfc.Init();

      const model = await loader.load(buffer);

      // getPsets(model, indexer); // TODO: return psets

      //succesfully get the expressId of the only 3d obj

      //https://docs.thatopen.com/Tutorials/Components/Core/IfcRelationsIndexer follow this to get what you need
    }
  };

  return (
    <div>
      <Label htmlFor="ifc" className="cursor-pointer">
        <Button variant="ghost" size="icon" type="button" asChild>
          <FileUp className=" p-2" />
        </Button>
      </Label>
      <Input id="ifc" type="file" className="hidden" />
    </div>
  );
};

export default FileUpload;
