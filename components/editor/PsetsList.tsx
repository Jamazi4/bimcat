import type { Pset } from "@/utils/schemas";

import PsetAccordion from "./PsetAccordion";
import AddPsetButton from "./AddPsetButton";

function PsetsList({ psets }: { psets: Pset[] }) {
  return (
    <>
      <PsetAccordion edit={true} psets={psets} />
      <AddPsetButton />
    </>
  );
}
export default PsetsList;
