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
  values: z.optional(z.array(z.string())),
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
  inputs: { inputId: number; ast: ASTNode }[];
  values: string[];
};

export type NodeEvalResult =
  | { type: "number"; value: number }
  | { type: "vector"; value: THREE.Vector3 }
  | { type: "linestring"; value: [THREE.Vector3, THREE.Vector3] }
  | { type: "mesh"; value: THREE.BufferGeometry }
  | { type: "geometry"; value: THREE.Object3D };

export type NodeInputType = {
  type: "slot" | "number" | "boolean";
  name: string;
  id: number;
  value?: string;
};

export type NodeOutputType = {
  type: "mesh" | "vector" | "number" | "boolean";
  name: string;
  id: number;
};

export interface nodeDefinition {
  nodeTypeId: number;
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
  slotType: "input" | "output";
  el: SVGSVGElement;
  relativeX: number;
  relativeY: number;
};

export type RuntimeNode = {
  id: string;
  type: string;
  values: string[];
};
