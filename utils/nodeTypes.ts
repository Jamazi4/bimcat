import * as THREE from "three";
import { z } from "zod";

export const GeomNodeSchemaFront = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export type GeomNodeFrontType = z.infer<typeof GeomNodeSchemaFront>;

export const GeomNodeSchemaBack = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  values: z.optional(z.record(z.union([z.boolean(), z.number(), z.string()]))),
});

export type GeomNodeBackType = z.infer<typeof GeomNodeSchemaBack>;

export const NodeEdgeSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  fromSlotId: z.number(),
  toNodeId: z.string(),
  toSlotId: z.number(),
});

export type NodeEdgeType = z.infer<typeof NodeEdgeSchema>;

export interface useNodesRuntimeProps {
  runtimeNodes: RuntimeNode[];
  edges: NodeEdgeType[];
  meshGroup: THREE.Group;
}

export type ASTNodeInput = {
  inputId: number;
  ast: ASTNode;
  fromOutputId: number;
  //used to allow for multiple outputs. only needs to be specified when
  //building AST by hand
};

export type ASTNode = {
  type: string;
  id: string;
  inputs: ASTNodeInput[];
  values: NodeValues;
};

export type TransformObject = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  rotation: THREE.Vector3;
};

export type EvalValue =
  | { type: "transform"; value: TransformObject }
  | { type: "boolean"; value: boolean }
  | { type: "number"; value: number }
  | { type: "vector"; value: THREE.Vector3 }
  | { type: "linestring"; value: THREE.Vector3[][] }
  | { type: "mesh"; value: THREE.BufferGeometry }
  | { type: "geometry"; value: THREE.Object3D }; // result of output node only

export type NodeEvalResult = { [outputSlotId: number]: EvalValue };

export type SlotValues =
  | "transform"
  | "boolean"
  | "number"
  | "vector"
  | "linestring"
  | "mesh"
  | "geometry";

export type NodeInputType = (
  | { type: "select"; value: number; options: string[] }
  | {
      type: "group";
      slotValueType: SlotValues;
      groupIndex: number;
    }
  | { type: "slot"; slotValueType: SlotValues }
  | {
      type: "combo";
      slotValueType: SlotValues;
      value: number | boolean | string;
    }
  | { type: "number" | "boolean" | "string"; isSlider?: boolean }
) & {
  defaultValue?: ASTNode;
  name: string;
  id: number;
  value?: number | boolean | string;
  //for group input value is boolean and it defines which input is active
  isList?: boolean;
  //for list inputs - each new list input will have id n + 100. connecting to
  //main list input will add to node.values 100: true; 101: false. connecting
  //to 101 will make 101: true; 102: false and so on...
};

export type NodeOutputType = {
  type: SlotValues;
  name: string;
  id: number;
  onInputSelectedId?: number;
  //used for conditional rendering if the group input selection state influences
  //the output type, value is the input id of tied input, this needs a value
  //field with boolean for initially active input
  onBooleanTrueId?: number;
  //same as onInputSelected but controlled by one boolean input
  onBooleanInverted?: boolean;
  //only if onBooleanTrue exists - invert condition for rendering
};

export const nodeCategories = [
  "general",
  "generator",
  "modifier",
  "variable",
  "math",
] as const;
export type nodeCategory = (typeof nodeCategories)[number];

export interface nodeDefinition {
  nodeDefId: number;
  category: nodeCategory;
  type: string;
  inputs: NodeInputType[];
  outputs: NodeOutputType[];
  function?: (
    node: ASTNode,
    evalFunction: (node: ASTNode) => NodeEvalResult,
  ) => NodeEvalResult;
}

export type NodeSlot = {
  nodeId: string;
  slotId: number;
  slotIO: "input" | "output";
  el: SVGSVGElement;
  relativeX: number;
  relativeY: number;
};

export type NodeValues = Record<string, string | number | boolean>;

export type RuntimeNode = {
  id: string;
  type: string;
  values: NodeValues;
};

export const fillColorClasses = {
  number: "fill-number-input",
  boolean: "fill-boolean-input",
  vector: "fill-vector-input",
  linestring: "fill-linestring-input",
  mesh: "fill-mesh-input",
  geometry: "fill-geometry-input",
  transform: "fill-transform-input",
};

export const backgroundColorClasses = {
  number: "bg-number-input",
  boolean: "bg-boolean-input",
  vector: "bg-vector-input",
  linestring: "bg-linestring-input",
  mesh: "bg-mesh-input",
  geometry: "bg-geometry-input",
  transform: "bg-transform-input",
};

export type inputWithSlotValueType = Extract<
  NodeInputType,
  { type: "group" | "slot" | "combo" }
>;
