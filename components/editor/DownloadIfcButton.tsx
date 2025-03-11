"use client";

import { DownloadIcon } from "lucide-react";
import { Button } from "../ui/button";
import { downloadIfcFile } from "@/utils/ifcjs";

const DownloadIfcButton = () => {
  const handleDownload = async () => {
    await downloadIfcFile();
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
