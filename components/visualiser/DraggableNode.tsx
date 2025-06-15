"use client";

import { nodeDefinitions } from "@/utils/nodes";
import { GeomNodeBackType } from "@/utils/schemas";
import { CircleDot } from "lucide-react";

interface GeometryNodeProps {
  node: GeomNodeBackType;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
}
const DraggableNode = ({ node, onMouseDown }: GeometryNodeProps) => {
  const nodeDef = nodeDefinitions.filter((def) => def.type === node.type)[0];
  return (
    <div
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      className="w-40 min-h-15 bg-accent absolute z-10 border-2 rounded-lg hover:border-primary transition-colors cursor-grab"
      onMouseDown={(e) => {
        e.preventDefault();
        if ((e.target as HTMLDivElement).closest(".connect-slot")) return;
        onMouseDown(node.id, e);
      }}
    >
      {/* title  */}
      <div className="flex justify-center bg-accent-foreground text-background rounded-tl-md rounded-tr-md font-bold">
        {node.type}
      </div>

      {/* inputs  */}
      <div className="grid grid-cols-2 items-center h-full my-auto py-2">
        <div>
          {nodeDef.inputs.map((input) => {
            return <InputSlot key={input} name={input} />;
          })}
        </div>
        <div>
          {nodeDef.outputs.map((output) => {
            return <OutputSlot key={output} name={output} />;
          })}
        </div>
      </div>

      {/* outputs */}
    </div>
  );
};

export default DraggableNode;

const InputSlot = ({ name }: { name: string }) => {
  return (
    <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot">
      <CircleDot size={16} className="bg-background rounded-full" />
      <p className="text-sm">{name}</p>
    </div>
  );
};

const OutputSlot = ({ name }: { name: string }) => {
  return (
    <div className="flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot">
      <p className="text-sm">{name}</p>
      <CircleDot size={16} className="bg-background rounded-full" />
    </div>
  );
};
