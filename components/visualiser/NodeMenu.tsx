import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import AddNodeMenu from "./AddNodeMenu";
import { Button } from "../ui/button";
import { LoaderCircle, Save } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { switchNodeNavigation } from "@/lib/features/visualiser/visualiserSlice";

interface NodeMenuProps {
  addNode: (nodeDefId: number) => void;
  pendingSave: boolean;
  handleSaveProject: () => Promise<void>;
}

const NodeMenu = ({
  addNode,
  pendingSave,
  handleSaveProject,
}: NodeMenuProps) => {
  const dispatch = useAppDispatch();
  const nodeNavigation = useAppSelector(
    (state) => state.visualiserSlice.nodeNavigation,
  );

  const setNodeNavigation = (state: boolean) => {
    dispatch(switchNodeNavigation({ nodeNavigation: state }));
  };

  return (
    <>
      <div className="fixed flex w-40 space-x-2 top-24 right-4 z-20">
        <Switch
          id="nodeNavigation"
          checked={nodeNavigation}
          onCheckedChange={(checked) => setNodeNavigation(checked)}
          className="cursor-pointer pointer-events-auto"
        />
        <Label htmlFor="nodeNavigation">
          {nodeNavigation ? "Node navigation" : "3D navigation"}
        </Label>
      </div>
      <div className="fixed top-36 left-4 z-20 space-x-2 pointer-events-auto">
        <AddNodeMenu addNode={addNode} />
        <Button
          size="icon"
          variant="outline"
          disabled={pendingSave}
          onClick={() => {
            handleSaveProject();
          }}
          className="cursor-pointer"
        >
          {pendingSave ? <LoaderCircle className="animate-spin" /> : <Save />}
        </Button>
      </div>
    </>
  );
};

export default NodeMenu;
