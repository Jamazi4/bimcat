import { ASTNode } from "../nodeTypes";
import { createNodeId } from "../utilFunctions";

export const defaultNumber: ASTNode = {
  type: "number",
  id: createNodeId(),
  inputs: [],
  values: { "0": 0 },
};

export const defaultNumberContructor = (value: number) => {
  return {
    type: "number",
    id: createNodeId(),
    inputs: [],
    values: { "0": value },
  };
};

export const defaultNumberOne: ASTNode = {
  type: "number",
  id: createNodeId(),
  inputs: [],
  values: { "0": 1 },
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

export const defaultVectorContructor = (x: number, y: number, z: number) => {
  return {
    type: "vector",
    id: createNodeId(),
    inputs: [
      {
        inputId: 0,
        ast: defaultNumberContructor(x),
        fromOutputId: 1,
      },
      {
        inputId: 1,
        ast: defaultNumberContructor(y),
        fromOutputId: 1,
      },
      {
        inputId: 2,
        ast: defaultNumberContructor(z),
        fromOutputId: 1,
      },
    ],
    values: {},
  };
};

export const defaultTransformContructor = () => {
  return {
    type: "transform",
    id: createNodeId(),
    inputs: [
      {
        inputId: 0,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
        //Because vector has 3 inputs, we must assume that the value it outputs
        //is at the 4th slot which has index 3
      },
      {
        inputId: 1,
        ast: defaultVectorContructor(1, 1, 1),
        fromOutputId: 3,
      },
      {
        inputId: 2,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
      },
    ],
    values: {},
  };
};

export const defaultIdentityVector: ASTNode = {
  type: "vector",
  id: createNodeId(),
  inputs: [
    {
      inputId: 0,
      ast: defaultNumberOne,
      fromOutputId: 1,
    },
    {
      inputId: 1,
      ast: defaultNumberOne,
      fromOutputId: 1,
    },
    {
      inputId: 2,
      ast: defaultNumberOne,
      fromOutputId: 1,
    },
  ],
  values: {},
};
export const defaultTransform: ASTNode = {
  type: "transform",
  id: createNodeId(),
  inputs: [
    {
      inputId: 0,
      ast: defaultVector,
      fromOutputId: 1,
    },
    {
      inputId: 1,
      ast: defaultIdentityVector,
      fromOutputId: 1,
    },
    {
      inputId: 2,
      ast: defaultVector,
      fromOutputId: 1,
    },
  ],
  values: {},
};
