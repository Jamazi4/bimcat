import type { Pset } from "@/utils/schemas";

import PsetAccordion from "./PsetAccordion";
import AddPsetButton from "./AddPsetButton";

function PsetsList({ psets }: { psets: Pset[] }) {
  return (
    <>
      <PsetAccordion psets={psets} />
      <AddPsetButton />
    </>
  );
}
export default PsetsList;
