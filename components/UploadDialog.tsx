"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";
import { createComponentAction } from "@/utils/actions";

import { useState } from "react";
import { getIfcData } from "@/utils/ifcjs";
import Form from "next/form";

import type { ComponentGeometry, Pset } from "@/utils/types";
import FormContainer from "./global/FormContainer";

function UploadDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [geometry, setGeometry] = useState<ComponentGeometry | null>(null);
  const [psets, setPsets] = useState<Pset[] | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (file) setFile(null);
    setFile(selectedFile);

    try {
      const result = await getIfcData(selectedFile);
      setGeometry(result.geometry);

      if (result.psets) {
        setPsets(result.psets);
      }

      console.log("geom setup");
    } catch (error) {
      console.error("Error processing IFC file:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" asChild>
          <FileUp className="p-2 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload IFC</DialogTitle>
          <DialogDescription>
            Choose an IFC file containing just one 3D object.
          </DialogDescription>
        </DialogHeader>
        <FormContainer action={createComponentAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                name="name"
                id="name"
                placeholder="component name"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input
                name="file"
                type="file"
                id="file"
                className="col-span-3"
                onChange={handleFile}
                required
              />
            </div>

            {geometry && (
              <input
                type="hidden"
                name="geometry"
                value={JSON.stringify(geometry)}
              />
            )}
            {psets && (
              <input type="hidden" name="psets" value={JSON.stringify(psets)} />
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!geometry}>
              Upload
            </Button>
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}
export default UploadDialog;
