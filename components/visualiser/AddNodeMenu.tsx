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
const AddNodeMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Add node</DropdownMenuLabel>
        {nodeDefinitions.map((node) => {
          return <DropdownMenuItem key={node.id}>{node.type}</DropdownMenuItem>;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddNodeMenu;
