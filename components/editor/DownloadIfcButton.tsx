"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "../ui/button";
import { downloadIfcFile } from "@/utils/ifcjs";
import { useParams } from "next/navigation";
import { fetchSingleComponentAction } from "@/utils/actions";
import { fetchGeometryAction } from "@/utils/actions";

const DownloadIfcButton = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const handleDownload = async () => {
    const component = await fetchSingleComponentAction(id);
    const { geomId, psets } = component;
    const geometry = await fetchGeometryAction(geomId);
    await downloadIfcFile(geometry, psets);
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="cursor-pointer"
      onClick={handleDownload}
    >
      <DownloadIcon />
    </Button>
  );
};
export default DownloadIfcButton;
