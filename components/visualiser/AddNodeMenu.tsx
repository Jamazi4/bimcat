import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { nodeDefinitions } from "@/utils/nodes";
import { nodeCategories } from "@/utils/nodeTypes";
const AddNodeMenu = ({ addNode }: { addNode: (nodeDefId: number) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" size="icon" variant="outline">
          <PlusIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {nodeCategories.map((cat, index) => {
          const curCatNodeDefs = nodeDefinitions.filter(
            (n) => n.category === cat,
          );
          return (
            <DropdownMenuSub key={index}>
              <DropdownMenuSubTrigger className="capitalize">
                {cat}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {curCatNodeDefs.map((n) => {
                    return (
                      <DropdownMenuItem
                        key={n.nodeDefId}
                        onClick={() => addNode(n.nodeDefId)}
                      >
                        {n.type.toUpperCase()}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddNodeMenu;
