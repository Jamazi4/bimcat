"use client";

import type { Pset } from "@/utils/schemas";
import PsetRow from "./PsetRow";
import EditPsetButton from "./EditPsetButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RemovePsetButton from "./RemovePsetButton";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { setLiveStatePsets } from "@/lib/downloadIfcSlice";

const PsetAccordion = ({
  resolveDynPsets,
  psets,
  edit,
}: {
  resolveDynPsets?: () => Pset[];
  psets: Pset[];
  edit: boolean;
}) => {
  const dispatch = useAppDispatch();
  const parametersActive = useAppSelector(
    (s) => s.downloadIfcSlice.parametersActive,
  );
  const liveGeometryRequested = useAppSelector(
    (s) => s.downloadIfcSlice.liveGeometryRequested,
  );
  const [dynPsets, setDynPsets] = useState<Pset[]>([]);

  useEffect(() => {
    if (!resolveDynPsets) return;
    if (parametersActive) {
      setDynPsets(resolveDynPsets());
    } else {
      setDynPsets([]);
    }
  }, [parametersActive, resolveDynPsets]);

  let dynPsetsMerged: Pset[] = [];

  if (dynPsets.length > 0) {
    dynPsetsMerged = psets.map((pset) => {
      const curTitle = pset.title;
      const dynamicNames = pset.dynamic;

      if (dynamicNames && dynamicNames.length > 0) {
        const updatingContent = pset.content.map((entry) => {
          const key = Object.keys(entry)[0];

          if (dynamicNames.includes(key)) {
            const dynRecord = dynPsets
              .find((dp) => dp.title === curTitle)
              ?.content.find((c) => Object.keys(c)[0] === key);

            const dynVal = dynRecord ? dynRecord[key] : entry[key];

            return { [key]: dynVal };
          } else return entry;
        });

        return { ...pset, content: updatingContent };
      } else return pset;
    });
  }

  useEffect(() => {
    if (!liveGeometryRequested) return;
    dispatch(setLiveStatePsets({ psets: dynPsets }));
  }, [dispatch, dynPsets, liveGeometryRequested]);

  return (
    <Accordion type="multiple" className="w-full flex-1">
      {(parametersActive && dynPsets.length > 0 ? dynPsetsMerged : psets).map(
        (pset, index) => {
          return (
            <AccordionItem value={pset.title} key={`${pset.title}${index}`}>
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
                    <EditPsetButton
                      dynamic={pset.dynamic}
                      content={pset.content}
                      title={pset.title}
                    />
                    <RemovePsetButton title={pset.title} />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        },
      )}
    </Accordion>
  );
};
export default PsetAccordion;

const Attributes = ({ pset }: { pset: Pset }) => {
  return pset.content.map((entry, index) => {
    const [[name, value]] = Object.entries(entry);
    const isDynamic = pset.dynamic?.includes(name);
    return (
      <PsetRow
        isDynamic={isDynamic || false}
        key={`${pset.title}${index}${name}`}
        name={name}
        value={value.toString()}
      />
    );
  });
};
