"use client";

import { FileUp } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

import { getFragmentLoader, getModelData } from "@/utils/ifcjs";
import { FragmentMesh } from "@thatopen/fragments";

const FileUpload = () => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const { fragments, loader, indexer, exporter } =
        await getFragmentLoader();

      const webIfc = new WEBIFC.IfcAPI();
      webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);

      await webIfc.Init();

      const modelId = webIfc.OpenModel(buffer);
      const exported = await exporter.export(webIfc, modelId);

      // console.log(exported); // works json of all elements in file

      const serialized = JSON.stringify(exported);

      const model = await loader.load(buffer);
      const fragModel = fragments.load(buffer);
      // console.log(model.children);
      const firstElement = model.children[0] as FragmentMesh;
      const ids = firstElement.fragment.ids;
      const idsIterator = ids.values();
      const firstId = idsIterator.next(); //succesfullt get the expressId of the only 3d obj

      // ids.forEach(async (id) => {
      //   console.log("PROPERTY----");
      //   const prop = await model.getProperties(id); // works but only for attributes
      //   console.log(prop);
      // });

      // console.log(model);
      // const propIds = model.getAllPropertiesIDs();
      // const propIds2 = model.getLocalProperties();
      // propIds.map(async (id) => {
      //   const prop = await model.getProperties(id);
      //   console.log(prop);
      // });

      await indexer.process(model);
      if (firstId.value) {
        console.log("SUCCESS!!!!");

        const attributes = await model.getProperties(firstId.value); //attributes
        console.log(attributes);

        const psets = indexer.getEntityRelations(
          model,
          firstId.value,
          "IsDefinedBy"
        );
        console.log(psets);
        for (const expressID of psets) {
          // You can get the pset attributes like this
          const pset = await model.getProperties(expressID);
          console.log(pset); // pset
          // You can get the pset props like this or iterate over pset.HasProperties yourself
          await OBC.IfcPropertiesUtils.getPsetProps(
            model,
            expressID,
            async (propExpressID) => {
              const prop = await model.getProperties(propExpressID); //values
              console.log(prop);
            }
          );
        }
      }
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
