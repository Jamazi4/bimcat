import type { Pset as psetType } from "@/utils/schemas";
import PsetRow from "./PsetRow";
import EditPsetButton from "./EditPsetButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RemovePsetButton from "./RemovePsetButton";

const PsetAccordion = ({
  psets,
  edit,
}: {
  psets: psetType[];
  edit: boolean;
}) => {
  return (
    <Accordion type="multiple" className="w-full flex-1">
      {psets.map((pset, index) => {
        return (
          <AccordionItem value={pset.title} key={index}>
            <AccordionTrigger className="text-primary">
              {pset.title}
            </AccordionTrigger>
            <AccordionContent className="rounded flex flex-col ">
              {pset.content.length > 0 ? (
                <Attributes pset={pset} />
              ) : (
                <p className="text-secondary-foreground text-center">
                  No attributes
                </p>
              )}
              {edit && (
                <div className="ml-auto space-x-4">
                  <EditPsetButton content={pset.content} title={pset.title} />
                  <RemovePsetButton title={pset.title} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
export default PsetAccordion;

const Attributes = ({ pset }: { pset: psetType }) => {
  return pset.content.map((entry, index) => {
    const [[name, value]] = Object.entries(entry);
    return (
      <PsetRow
        key={`${pset.title}${index}${name}`}
        name={name}
        value={value.toString()}
      />
    );
  });
};
