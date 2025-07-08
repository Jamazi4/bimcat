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

export type ASTNode = {
  type: string;
  id: string;
  inputs: { inputId: number; ast: ASTNode; fromOutputId: number }[];
  values: NodeValues;
};

export type EvalValue =
  | { type: "boolean"; value: boolean }
  | { type: "number"; value: number }
  | { type: "vector"; value: THREE.Vector3 }
  | { type: "linestring"; value: THREE.Vector3[] } //consider switching to buffergeom
  | { type: "mesh"; value: THREE.BufferGeometry }
  | { type: "geometry"; value: THREE.Object3D }; // result of output node only

export type NodeEvalResult = { [outputSlotId: number]: EvalValue };

export type SlotValues =
  | "boolean"
  | "number"
  | "vector"
  | "linestring"
  | "mesh"
  | "geometry";

export type NodeInputType = (
  | { type: "slot"; slotValueType: SlotValues }
  | {
      type: "combo";
      slotValueType: SlotValues;
      value: number | boolean | string;
    }
  | { type: "number" | "boolean" | "string"; slotValueType?: undefined }
) & {
  defaultValue?: ASTNode;
  name: string;
  id: number;
  value?: number | boolean | string;
};

export type NodeOutputType = {
  type: SlotValues;
  name: string;
  id: number;
};

export const nodeCategories = [
  "general",
  "generator",
  "modifier",
  "variable",
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
};

export const backgroundColorClasses = {
  number: "bg-number-input",
  boolean: "bg-boolean-input",
  vector: "bg-vector-input",
  linestring: "bg-linestring-input",
  mesh: "bg-mesh-input",
  geometry: "bg-geometry-input",
};
