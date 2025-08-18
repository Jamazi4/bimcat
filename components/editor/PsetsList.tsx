import type { Pset } from "@/utils/schemas";

import PsetAccordion from "./PsetAccordion";
import AddPsetButton from "./AddPsetButton";

function PsetsList({
  psets,
  editable,
  resolveDynPsets,
}: {
  psets: Pset[];
  editable: boolean;
  resolveDynPsets: () => Pset[];
}) {
  return (
    <div className="max-h-[calc(80vh-4rem)] overflow-y-auto scrollbar-thin">
      <div className="mr-2">
        <PsetAccordion
          resolveDynPsets={resolveDynPsets}
          edit={editable}
          psets={psets}
        />

        {editable && <AddPsetButton />}
      </div>
    </div>
  );
}
export default PsetsList;
