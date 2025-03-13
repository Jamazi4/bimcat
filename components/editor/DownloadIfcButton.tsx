"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "../ui/button";
import { downloadIfcFile } from "@/utils/ifcjs";
import { useParams } from "next/navigation";
import { fetchSingleComponentAction } from "@/utils/actions";
import { fetchGeometryAction } from "@/utils/actions";
import { useState } from "react";
import { AiOutlineReload } from "react-icons/ai";

const DownloadIfcButton = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [pending, setPending] = useState(false);
  const handleDownload = async () => {
    setPending(true);
    const component = await fetchSingleComponentAction(id);
    const { geomId, psets } = component;
    const geometry = await fetchGeometryAction(geomId);
    await downloadIfcFile(geometry, psets);
    setPending(false);
  };

  return (
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
  );
};
export default DownloadIfcButton;
