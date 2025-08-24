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
import { scalarMathNode } from "./nodeDefinitions/scalarMathNode";
import { sliderNode } from "./nodeDefinitions/sliderNode";
import { uiControlNode } from "./nodeDefinitions/uiControlNode";
import { getMeshAreaNode } from "./nodeDefinitions/getMeshAreaNode";
import { getLinestringLengthNode } from "./nodeDefinitions/getLinestringLengthNode";
import { getMeshVolumeNode } from "./nodeDefinitions/getMeshVolume";
import { psetNode } from "./nodeDefinitions/psetNode";
import { psetAttributeNode } from "./nodeDefinitions/psetAttributeNode";
import { triangulateNode } from "./nodeDefinitions/triangulateNode";
import { getNormalNode } from "./nodeDefinitions/getNormalNode";
import { getOriginNode } from "./nodeDefinitions/getOriginNode";
import { applyTransformNode } from "./nodeDefinitions/applyTransformNode";
import { vectorMathNode } from "./nodeDefinitions/vectorMathNode";

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
  groupNode(10),
  scalarMathNode(11),
  sliderNode(12),
  uiControlNode(13),
  getMeshAreaNode(14),
  getLinestringLengthNode(15),
  getMeshVolumeNode(16),
  psetNode(17),
  psetAttributeNode(18),
  triangulateNode(19),
  getNormalNode(20),
  getOriginNode(21),
  applyTransformNode(22),
  vectorMathNode(23),
];
