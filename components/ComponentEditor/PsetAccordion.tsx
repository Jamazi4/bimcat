import type { Pset, PsetContent } from "@/utils/types";
import PsetRow from "./PsetRow";
import PsetDialog from "./PsetDialog";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PsetAccordion = ({ psets }: { psets: Pset[] }) => {
  return (
    <Accordion type="multiple" className="w-full flex-1">
      {psets.map((pset, index) => {
        return <Pset key={index} title={pset.title} content={pset.content} />;
      })}
    </Accordion>
  );
};
export default PsetAccordion;

function Pset({ title, content }: { title: string; content: PsetContent[] }) {
  return (
    <div>
      <AccordionItem value={title}>
        <AccordionTrigger className="text-primary">{title}</AccordionTrigger>
        <AccordionContent className=" rounded p-4 flex flex-col border-b bg-muted">
          {content.map((entry, index) => {
            return (
              <PsetRow
                key={`${title}${index}${entry.name}`}
                name={entry.name}
                value={entry.value}
              />
            );
          })}
          <div className="ml-auto space-x-4">
            {/* Edit button */}
            <PsetDialog mode="edit" content={content} title={title} />
            {/* Delete Button */}
            <Button
              variant="destructive"
              size="icon"
              className="place-items-end cursor-pointer "
            >
              <X className=" " />
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
