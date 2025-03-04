import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NumInput from "./NumInput";
import type { Pset, PsetContent } from "@/utils/types";
import { Button } from "./ui/button";
import { X, Plus } from "lucide-react";

function PsetsList({ psets }: { psets: Pset[] }) {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full flex-1">
        {psets.map((pset, index) => {
          return <Pset key={index} title={pset.title} content={pset.content} />;
        })}
      </Accordion>
      <Button className="w-full cursor-pointer mt-auto">
        <Plus />
      </Button>
    </div>
  );
}
export default PsetsList;

function Pset({ title, content }: { title: string; content: PsetContent[] }) {
  return (
    <div>
      <AccordionItem value={title}>
        <AccordionTrigger className="text-primary">{title}</AccordionTrigger>
        <AccordionContent className=" rounded p-4 flex flex-col">
          {content.map((entry, index) => {
            return (
              <NumInput
                key={`${title}${index}${entry.name}`}
                title={entry.name}
                defaultValue={Number(entry.value)}
              />
            );
          })}
          <Button
            variant="destructive"
            size="icon"
            className="place-items-end cursor-pointer ml-auto"
          >
            <X className=" " />
          </Button>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
