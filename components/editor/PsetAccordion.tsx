import type { Pset as psetType } from "@/utils/schemas";
import PsetRow from "./PsetRow";
import PsetDialog from "./PsetDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RemovePsetButton from "./RemovePsetButton";

const PsetAccordion = ({ psets }: { psets: psetType[] }) => {
  return (
    <Accordion type="multiple" className="w-full flex-1">
      {psets.map((pset, index) => {
        return (
          <AccordionItem value={pset.title} key={index}>
            <AccordionTrigger className="text-primary">
              {pset.title}
            </AccordionTrigger>
            <AccordionContent className=" rounded p-4 flex flex-col border-b bg-muted">
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
              <div className="ml-auto space-x-4">
                {/* Edit button */}
                <PsetDialog content={pset.content} title={pset.title} />
                {/* Delete Button */}
                <RemovePsetButton title={pset.title} />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
export default PsetAccordion;
