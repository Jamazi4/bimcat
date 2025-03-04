import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NumInput from "./NumInput";
import PsetsList from "./PsetsList";

import { psets } from "@/utils/example";

function ComponentCardTabs() {
  return (
    <Tabs defaultValue="configure" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="configure">Configure</TabsTrigger>
        <TabsTrigger value="psets">Psets</TabsTrigger>
      </TabsList>
      <TabsContent value="configure">
        <NumInput title="Width" defaultValue={25} />
        <NumInput title="Height" defaultValue={25} />
      </TabsContent>
      <TabsContent value="psets">
        <PsetsList psets={psets} />
      </TabsContent>
    </Tabs>
  );
}

export default ComponentCardTabs;
