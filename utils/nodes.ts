import { outputNode } from "./nodeDefinitions/outputNode";
import { numberNode } from "./nodeDefinitions/numberNode";
import { linestringNode } from "./nodeDefinitions/linestringNode";
import { planeNode } from "./nodeDefinitions/planeNode";
import { circleNode } from "./nodeDefinitions/circleNode";
import { vectorNode } from "./nodeDefinitions/vectorNode";
import { extrudeNode } from "./nodeDefinitions/extrudeNode";
import { nodeDefinition } from "./nodeTypes";
import booleanNode from "./nodeDefinitions/booleanNode";

export const nodeDefinitions: nodeDefinition[] = [
  outputNode(1),
  numberNode(2),
  linestringNode(3),
  planeNode(4),
  circleNode(5),
  vectorNode(6),
  extrudeNode(7),
  booleanNode(8),
];
