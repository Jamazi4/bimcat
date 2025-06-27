import { Dispatch, SetStateAction } from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import AddNodeMenu from "./AddNodeMenu";
import { Button } from "../ui/button";
import { LoaderCircle, Save } from "lucide-react";

interface NodeMenuProps {
  nodeNavigation: boolean;
  setNodeNavigation: Dispatch<SetStateAction<boolean>>;
  addNode: (nodeDefId: number) => void;
  pendingSave: boolean;
  handleSaveProject: () => Promise<void>;
}

const NodeMenu = ({
  nodeNavigation,
  setNodeNavigation,
  addNode,
  pendingSave,
  handleSaveProject,
}: NodeMenuProps) => {
  return (
    <>
      <div className="flex w-40 space-x-2 fixed top-24 right-4 z-20">
        <Switch
          id="nodeNavigation"
          checked={nodeNavigation}
          onCheckedChange={() => setNodeNavigation((cur) => !cur)}
        />
        <Label htmlFor="nodeNavigation">
          {nodeNavigation ? "Node navigation" : "3D navigation"}
        </Label>
      </div>
      <div className="fixed top-36 left-4 z-20 space-x-2">
        <AddNodeMenu addNode={addNode} />
        <Button
          size="icon"
          variant="outline"
          disabled={pendingSave}
          onClick={() => {
            handleSaveProject();
          }}
        >
          {pendingSave ? <LoaderCircle className="animate-spin" /> : <Save />}
        </Button>
      </div>
    </>
  );
};

export default NodeMenu;
