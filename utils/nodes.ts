import { outputNode } from "./nodeDefinitions/outputNode";
import { numberNode } from "./nodeDefinitions/numberNode";
import { linestringNode } from "./nodeDefinitions/linestringNode";
import { planeNode } from "./nodeDefinitions/planeNode";
import { circleNode } from "./nodeDefinitions/circleNode";
import { vectorNode } from "./nodeDefinitions/vectorNode";
import { extrudeNode } from "./nodeDefinitions/extrudeNode";
import { nodeDefinition } from "./nodeTypes";
import { transformNode } from "./nodeDefinitions/transformNode";
import { booleanNode } from "./nodeDefinitions/booleanNode";
import { groupNode } from "./nodeDefinitions/groupNode";

export const nodeDefinitions: nodeDefinition[] = [
  outputNode(1),
  numberNode(2),
  linestringNode(3),
  planeNode(4),
  circleNode(5),
  vectorNode(6),
  extrudeNode(7),
  booleanNode(8),
  transformNode(9),
  groupNode(10)
];
