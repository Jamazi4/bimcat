"use client";

import { DownloadIcon, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { generateIfcFile } from "@/utils/ifc/ifcFileBuilder";
import { useParams } from "next/navigation";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import { useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { downloadFile } from "@/utils/utilFunctions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  requestLiveGeometry,
  resetDownloadState,
} from "@/lib/downloadIfcSlice";

export type IfcFileInfo = {
  name: string;
  author: string;
};

const DownloadIfcButton = () => {
  const params = useParams<
    { id: string } | { libraryId: string; componentId: string }
  >();
  const id = "id" in params ? params.id : params.componentId;
  //TODO: handle id more gracefully depending on pathname or pass it

  const [pending, setPending] = useState(false);
  const downloadIfcState = useAppSelector((s) => s.downloadIfcSlice);
  const dispatch = useAppDispatch();

  const handleDownload = useCallback(async () => {
    setPending(true);
    if (downloadIfcState.parametersActive === true) {
      dispatch(requestLiveGeometry({ request: true }));
      console.log("i returned");
      return;
    }

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
  }, [dispatch, downloadIfcState.parametersActive, id]);

  useEffect(() => {
    const requestStatus = downloadIfcState.requestCompleted;
    if (!Object.values(requestStatus).every((s) => s === true)) {
      return;
    }
    const download = async () => {
      const geometry = downloadIfcState.modelState.geometry;
      const info = downloadIfcState.modelState.info;
      const psets = downloadIfcState.modelState.psets;
      const blob = await generateIfcFile(geometry, info, psets);
      downloadFile(blob, info.name, "ifc");
    };
    download();
    dispatch(resetDownloadState());
    setPending(false);
  }, [
    dispatch,
    downloadIfcState.modelState.geometry,
    downloadIfcState.modelState.info,
    downloadIfcState.modelState.psets,
    downloadIfcState.requestCompleted,
  ]);

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
