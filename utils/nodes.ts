interface InodeDefinition {
  type: string;
  inputs: string[];
  outputs: string[];
}
export const nodeDefinitions: InodeDefinition[] = [
  {
    type: "output",
    inputs: ["mesh"],
    outputs: [],
  },
  {
    type: "pointByXYZ",
    inputs: ["float(X)", "float(Y)", "float(Z)"],
    outputs: ["mesh(point)"],
  },
  {
    type: "edgeByPoints",
    inputs: ["point(start)", "point(end)"],
    outputs: ["mesh(edge)"],
  },
];
