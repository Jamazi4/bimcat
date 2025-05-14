"use client";

import { DownloadIcon, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  fetchCompositeLibraryDownloadAction,
  fetchLibraryDownloadAction,
} from "@/utils/actions/libraryActions";
import JSZip from "jszip";
import { downloadFile, generateIfcFilesLibrary } from "@/utils/utilFunctions";

export type IfcFileInfo = {
  name: string;
  author: string;
};

const DownloadLibraryButton = ({
  libraryEmpty,
  isComposite,
}: {
  libraryEmpty: boolean;
  isComposite: boolean;
}) => {
  const params = useParams();
  const pathname = usePathname();
  const isInComposite = pathname.split("/")[2] === "composite";
  const libraryId = Object.values(params)[isInComposite ? 1 : 0] as string;
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    const libraryComponents = await fetchLibraryDownloadAction(libraryId);
    if (!libraryComponents) return setPending(false);
    const { libraryName, validatedComponents } = libraryComponents;

    const ifcFiles = await generateIfcFilesLibrary(validatedComponents);

    const zip = new JSZip();
    ifcFiles.forEach(({ name, blob }) => {
      zip.file(`${name}.ifc`, blob);
    });
    const zipBlob = await zip.generateAsync({ type: "blob" });

    downloadFile(zipBlob, libraryName, "zip");

    setPending(false);
  };

  const handleCompositeDownload = async () => {
    setPending(true);
    const libraryComponents =
      await fetchCompositeLibraryDownloadAction(libraryId);

    if (!libraryComponents) return setPending(false);
    const { compositeLibraryName, validatedComponents } = libraryComponents;

    if (!validatedComponents) throw new Error("No components");

    const zip = new JSZip();
    for (const [libraryName, components] of Object.entries(
      validatedComponents,
    )) {
      const ifcFiles = await generateIfcFilesLibrary(components);

      const folder = zip.folder(libraryName);

      ifcFiles.forEach(({ name, blob }) => {
        folder?.file(`${name}.ifc`, blob);
      });
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadFile(zipBlob, compositeLibraryName, "zip");

    setPending(false);
  };
  const disabled = pending || libraryEmpty;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled}
            size="icon"
            variant="ghost"
            className="cursor-pointer"
            onClick={isComposite ? handleCompositeDownload : handleDownload}
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
