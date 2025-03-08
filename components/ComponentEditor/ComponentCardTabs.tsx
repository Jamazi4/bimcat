import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NumInput from "../NumInput";
import PsetsList from "./PsetsList";

import { psets } from "@/utils/example";

function ComponentCardTabs() {
  return (
    <Tabs defaultValue="configure" className=" w-auto">
      <TabsList className="grid w-auto grid-cols-2 rounded-sm">
        <TabsTrigger value="configure" className="rounded-sm">
          Configure
        </TabsTrigger>
        <TabsTrigger value="psets" className="rounded-sm">
          Psets
        </TabsTrigger>
      </TabsList>
      <TabsContent value="configure">
        {/* Configuration */}
        <div className="mt-4">
          <NumInput title="Width" defaultValue={25} />
          <NumInput title="Height" defaultValue={25} />
        </div>
      </TabsContent>
      <TabsContent value="psets">
        {/* Psets */}
        <PsetsList psets={psets} />
      </TabsContent>
    </Tabs>
  );
}

export default ComponentCardTabs;
