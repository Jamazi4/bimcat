import { ASTNode } from "../nodeTypes";
import { createNodeId } from "../utilFunctions";

export const defaultNumber: ASTNode = {
  type: "number",
  id: createNodeId(),
  inputs: [],
  values: { "0": 0 },
};

export const defaultBoolean: ASTNode = {
  type: "boolean",
  id: createNodeId(),
  inputs: [],
  values: { "0": true },
};

export const defaultVector: ASTNode = {
  type: "vector",
  id: createNodeId(),
  inputs: [
    {
      inputId: 0,
      ast: defaultNumber,
      fromOutputId: 1,
    },
    {
      inputId: 1,
      ast: defaultNumber,
      fromOutputId: 1,
    },
    {
      inputId: 2,
      ast: defaultNumber,
      fromOutputId: 1,
    },
  ],
  values: {},
};
