"use client";
import { Button } from "@/components/ui/button";
import { ChevronsRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const GoToLibraryButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const path = usePathname();
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => {
        router.push(`${path}/${id}`);
      }}
    >
      <ChevronsRight />
    </Button>
  );
};

export default GoToLibraryButton;
