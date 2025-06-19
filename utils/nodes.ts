type NodeInputType = {
  type: "slot" | "number" | "boolean";
  name: string;
  id: number;
  value?: string;
};

interface InodeDefinition {
  id: number;
  type: string;
  inputs: NodeInputType[];
  outputs: string[];
}

export const nodeDefinitions: InodeDefinition[] = [
  {
    id: 1,
    type: "output",
    inputs: [{ type: "slot", id: 0, name: "mesh" }],
    outputs: [],
  },
  {
    id: 2,
    type: "number",
    inputs: [{ type: "number", id: 0, value: "0", name: "number" }],
    outputs: ["float"],
  },
  {
    id: 3,
    type: "pointByXYZ",
    inputs: [
      {
        type: "slot",
        name: "point X",
        id: 0,
      },
      {
        type: "slot",
        name: "point Y",
        id: 1,
      },
      { type: "slot", name: "Point Z", id: 2 },
    ],
    outputs: ["mesh(point)"],
  },
  {
    id: 4,
    type: "edgeByPoints",
    inputs: [
      {
        type: "slot",
        name: "Point start",
        id: 0,
      },
      { type: "slot", name: "Point end", id: 12 },
    ],
    outputs: ["mesh(edge)"],
  },

  {
    id: 5,
    type: "test multi number",
    inputs: [
      { type: "number", id: 0, value: "0", name: "num1" },
      { type: "number", id: 1, value: "2", name: "num2" },
    ],
    outputs: [],
  },
];
