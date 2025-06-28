import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { nodeDefinitions } from "@/utils/nodes";
const AddNodeMenu = ({ addNode }: { addNode: (nodeDefId: number) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Add node</DropdownMenuLabel>
        {nodeDefinitions.map((node) => {
          return (
            <DropdownMenuItem
              key={node.nodeTypeId}
              onClick={() => addNode(node.nodeTypeId)}
            >
              {node.type}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddNodeMenu;
