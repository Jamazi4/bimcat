import type { Pset as psetType } from "@/utils/schemas";
import PsetRow from "./PsetRow";
import PsetEditDialog from "./PsetEditDialog";
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
              {pset.content.map((entry, index) => {
                const [[name, value]] = Object.entries(entry);
                return (
                  <PsetRow
                    key={`${pset.title}${index}${name}`}
                    name={name}
                    value={value.toString()}
                  />
                );
              })}
              {edit && (
                <div className="ml-auto space-x-4">
                  {/* Edit button */}
                  <PsetEditDialog content={pset.content} title={pset.title} />
                  {/* Delete Button */}
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
