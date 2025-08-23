import { createNodeId } from "../utilFunctions";

export const defaultNumberContructor = (value: number) => {
  return {
    type: "number",
    id: createNodeId(true),
    inputs: [],
    values: { "0": value },
  };
};

export const defaultBooleanContructor = (value: boolean) => {
  return {
    type: "boolean",
    id: createNodeId(true),
    inputs: [],
    values: { "0": value },
  };
};

export const defaultVectorContructor = (x: number, y: number, z: number) => {
  return {
    type: "vector",
    id: createNodeId(true),
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
    id: createNodeId(true),
    inputs: [
      {
        inputId: 0,
        ast: defaultBooleanContructor(false),
        fromOutputId: 1,
      },
      {
        inputId: 1,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
        //Because vector has 3 inputs, we must assume that the value it outputs
        //is at the 4th slot which has index 3
      },
      {
        inputId: 2,
        ast: defaultVectorContructor(1, 1, 1),
        fromOutputId: 3,
      },
      {
        inputId: 3,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
      },
      {
        inputId: 4,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
      },
    ],
    values: {},
  };
};

export const defaultLinestringConstructor = () => {
  return {
    type: "linestring",
    id: createNodeId(),
    inputs: [
      {
        inputId: 0,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
      },

      {
        inputId: 0,
        ast: defaultVectorContructor(0, 0, 0),
        fromOutputId: 3,
      },
    ],
    values: {},
  };
};
