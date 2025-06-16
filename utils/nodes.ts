interface InodeDefinition {
  id: number;
  type: string;
  inputs: string[];
  outputs: string[];
}
export const nodeDefinitions: InodeDefinition[] = [
  {
    id: 1,
    type: "output",
    inputs: ["mesh"],
    outputs: [],
  },
  {
    id: 2,
    type: "pointByXYZ",
    inputs: ["float(X)", "float(Y)", "float(Z)"],
    outputs: ["mesh(point)"],
  },
  {
    id: 3,
    type: "edgeByPoints",
    inputs: ["point(start)", "point(end)"],
    outputs: ["mesh(edge)"],
  },
];
