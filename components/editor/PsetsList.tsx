import type { Pset } from "@/utils/schemas";

import PsetAccordion from "./PsetAccordion";
import AddPsetButton from "./AddPsetButton";

function PsetsList({ psets, editable }: { psets: Pset[]; editable: boolean }) {
  return (
    <>
      <PsetAccordion edit={editable} psets={psets} />

      {editable && <AddPsetButton />}
    </>
  );
}
export default PsetsList;
