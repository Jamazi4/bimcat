import type { Pset } from "@/utils/types";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

import PsetAccordion from "./PsetAccordion";

function PsetsList({ psets }: { psets: Pset[] }) {
  return (
    <>
      <PsetAccordion psets={psets} />
      {/* Add button */}
      <Button className="w-full cursor-pointer mt-4">
        <Plus />
      </Button>
    </>
  );
}
export default PsetsList;
