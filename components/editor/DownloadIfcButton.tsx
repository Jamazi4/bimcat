"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "../ui/button";
import { downloadIfcFile } from "@/utils/ifc/ifcFileBuilder";
import { useParams } from "next/navigation";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import { useState } from "react";
import { AiOutlineReload } from "react-icons/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const DownloadIfcButton = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [pending, setPending] = useState(false);

  const handleDownload = async () => {
    setPending(true);
    const component = await fetchSingleComponentAction(id);
    if (!component) return setPending(false);
    const { geometry, psets } = component;
    await downloadIfcFile(geometry, psets);
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
              <AiOutlineReload className="animate-spin" />
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
