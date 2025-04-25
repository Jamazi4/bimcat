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

export type IfcFileInfo = {
  name: string;
  author: string;
};

const DownloadIfcButton = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    const component = await fetchSingleComponentAction(id);
    if (!component) return setPending(false);
    const { geometry, psets } = component;
    const info: IfcFileInfo = {
      name: component.name,
      author: component.author,
    };
    const blob = await generateIfcFile(geometry, info, psets);
    downloadFile(blob, info.name, "ifc");
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
        <TooltipContent>Download IFC</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default DownloadIfcButton;
