type NodeInputType = {
  type: "slot" | "number" | "boolean";
  name: string;
  id: number;
  value?: string;
};

type NodeOutputType = {
  type: "mesh" | "point" | "number" | "boolean";
  name: string;
  id: number;
};

interface InodeDefinition {
  nodeTypeId: number;
  type: string;
  inputs: NodeInputType[];
  outputs: NodeOutputType[];
  function?: (
    data: Record<string, number | number[] | boolean>,
  ) => Record<string, number | number[] | boolean>;
}

export const nodeDefinitions: InodeDefinition[] = [
  {
    nodeTypeId: 1,
    type: "output",
    inputs: [{ type: "slot", id: 0, name: "mesh" }],
    outputs: [],
  },
  {
    nodeTypeId: 2,
    type: "number",
    inputs: [{ type: "number", id: 0, value: "0", name: "number" }],
    outputs: [{ type: "number", name: "number", id: 1 }],
  },
  {
    nodeTypeId: 3,
    type: "pointByXYZ",
    inputs: [
      { type: "slot", name: "number(X)", id: 0 },
      { type: "slot", name: "number(Y)", id: 1 },
      { type: "slot", name: "number(Z)", id: 2 },
    ],
    outputs: [{ type: "point", name: "point", id: 3 }],
  },
  {
    nodeTypeId: 4,
    type: "edgeByPoints",
    inputs: [
      { type: "slot", name: "Point start", id: 0 },
      { type: "slot", name: "Point end", id: 1 },
    ],
    outputs: [{ type: "mesh", name: "edge", id: 2 }],
  },
];
