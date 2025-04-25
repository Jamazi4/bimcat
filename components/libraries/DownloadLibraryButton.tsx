"use client";

import { DownloadIcon, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { downloadFile, generateIfcFile } from "@/utils/ifc/ifcFileBuilder";
import { useParams } from "next/navigation";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  fetchLibraryComponents,
  fetchLibraryDownloadAction,
} from "@/utils/actions/libraryActions";
import JSZip from "jszip";

export type IfcFileInfo = {
  name: string;
  author: string;
};

const DownloadLibraryButton = () => {
  const params = useParams<{ libraryId: string }>();
  const { libraryId } = params;
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    const libraryComponents = await fetchLibraryDownloadAction(libraryId);
    if (!libraryComponents) return setPending(false);
    const { libraryName, validatedComponents } = libraryComponents;

    const ifcFiles = await Promise.all(
      validatedComponents.map(async (component) => {
        const info: IfcFileInfo = {
          name: component.name,
          author: component.author,
        };
        const blob = await generateIfcFile(
          component.geometry,
          info,
          component.psets
        );
        return { name: component.name, blob };
      })
    );

    const zip = new JSZip();
    ifcFiles.forEach(({ name, blob }) => {
      zip.file(`${name}.ifc`, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });

    downloadFile(zipBlob, libraryName, "zip");

    setPending(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer"
            onClick={handleDownload}
          >
            {pending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <DownloadIcon />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Download zip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default DownloadLibraryButton;
