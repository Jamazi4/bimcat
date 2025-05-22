"use client";
import { Button } from "@/components/ui/button";
import { ChevronsRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const GoToLibraryButton = ({ id }: { id: string }) => {
  const router = useRouter();
  let path = usePathname();
  if (path.includes("browse")) {
    path = path.replace("browse", "");
  }
  return (
    <Button
      size="icon"
      variant="ghost"
      className="cursor-pointer hover:bg-background"
      onClick={() => {
        router.push(`${path}/${id}`);
      }}
    >
      <ChevronsRight />
    </Button>
  );
};

export default GoToLibraryButton;
