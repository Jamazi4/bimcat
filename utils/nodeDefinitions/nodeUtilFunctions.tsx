import { JSX } from "react";
import * as THREE from "three";
import {
  ASTNode,
  ASTNodeInput,
  EvalValue,
  GeomNodeBackType,
  inputWithSlotValueType,
  nodeDefinition,
  NodeEvalResult,
  NodeInputType,
  NodeSlot,
  NodeValues,
  SlotValues,
} from "../nodeTypes";
import DraggableNodeInputSlot from "@/components/visualiser/DraggableNodeInputSlot";
import DraggableNodeSelectInput from "@/components/visualiser/DraggableNodeSelectInput";
import { ComponentGeometry } from "../types";

export const getComboValues = (
  node: ASTNode,
  evalFunction: (node: ASTNode) => NodeEvalResult,
  inputIds: number[],
) => {
  const inputs = node.inputs;
  const values = inputIds.map((id) => {
    const curInput = inputs.find((i) => i.inputId === id);
    if (!curInput) return node.values[id];
    else return evalFunction(curInput.ast)[curInput.fromOutputId].value;
  });
  return values;
};

export const getInputValues = (
  inputs: ASTNodeInput[],
  evalFunction: (node: ASTNode) => NodeEvalResult,
  inputIds: number[],
) => {
  const values = inputs
    .flatMap((i) => {
      if (inputIds.includes(i.inputId)) {
        return evalFunction(i.ast)[i.fromOutputId];
      }
      return [];
    })
    .filter(Boolean);

  return values;
};

export const getListInputValues = (
  nodeValues: NodeValues,
  inputs: ASTNodeInput[],
  evalFunction: (node: ASTNode) => NodeEvalResult,
) => {
  const values: EvalValue[] = [];
  Object.entries(nodeValues).forEach(([key, _]) => {
    const id = parseInt(key);
    if (id >= 100) {
      const data = getInputValues(inputs, evalFunction, [id])[0];
      values.push(data);
    }
  });
  return values;
};

export const getActiveInputIds = (
  nodeValues: NodeValues,
  groupInputIds: number[],
) => {
  return Object.entries(nodeValues)
    .filter(
      ([key, val]) => val === true && groupInputIds.includes(parseInt(key)),
    )
    .map(([key, _]) => parseInt(key));
};

export const getGroupInputIds = (
  toNodeDef: nodeDefinition,
  groupId: number,
) => {
  return toNodeDef?.inputs
    .filter((input) => input.type === "group" && input.groupIndex === groupId)
    .map((input) => input.id);
};

export const getActiveGroupInputType = (
  toNodeDef: nodeDefinition,
  activeInputIds: number[],
) => {
  return (
    toNodeDef?.inputs.find(
      (input) => input.id === activeInputIds[0],
    ) as Extract<NodeInputType, { type: "group" }>
  ).slotValueType;
};

export const extractListInputs = (
  nodeDef: nodeDefinition,
  node: GeomNodeBackType,
  getSlotRelativePosition: (
    nodeRef: React.RefObject<HTMLDivElement>,
    slotRef: React.RefObject<SVGSVGElement>,
  ) => {
    relativeX: number;
    relativeY: number;
  },
  nodeRef: React.RefObject<HTMLDivElement | null>,
  finishConnecting: (
    nodeId: string,
    slotId: number,
    clearConnectingToNode?: boolean,
  ) => void,
  registerNodeSlot: (slotData: NodeSlot) => void,
) => {
  const inputs = nodeDef.inputs;
  const listSlots: JSX.Element[] = [];
  let activeGroupIndex: number;
  {
    //this part is for figuring out what will be the type of list inputs if
    //parent list input is group
    activeGroupIndex = inputs.filter(
      (i) => i.value === true && i.type === "group",
    )[0]?.id;
    const curInputIds = inputs.map((input) => input.id);
    if (node.values) {
      Object.entries(node.values).forEach(([inputId, val]) => {
        const inputIdParsed = parseInt(inputId);
        if (
          val === true &&
          curInputIds.includes(inputIdParsed) &&
          nodeDef.inputs[inputIdParsed].type === "group"
        ) {
          activeGroupIndex = parseInt(inputId);
        }
      });
    }

    //proceed with generating list inputs
    if (node.values) {
      const listInput = nodeDef.inputs.find((i) => i.isList === true);
      let curInputType: SlotValues;
      let inputName: string;
      if (listInput && listInput.type === "group") {
        curInputType = (
          nodeDef.inputs[activeGroupIndex] as inputWithSlotValueType
        ).slotValueType;
        inputName = nodeDef.inputs[activeGroupIndex].name;
      } else if (listInput) {
        curInputType = (listInput as inputWithSlotValueType).slotValueType;
        inputName = listInput.name;
      }
      Object.entries(node.values).forEach(([vInputId, _]) => {
        const vInputIdParsed = parseInt(vInputId);
        if (vInputIdParsed >= 100) {
          const partialSlotData: Partial<NodeSlot> = {
            nodeId: node.id,
            slotId: vInputIdParsed,
            slotIO: "input",
          };
          listSlots.push(
            <DraggableNodeInputSlot
              nodeValues={node.values}
              optional={true}
              slotValueType={curInputType}
              getSlotRelativePosition={getSlotRelativePosition}
              nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
              finishConnecting={finishConnecting}
              partialSlotData={partialSlotData}
              registerNodeSlot={registerNodeSlot}
              key={vInputIdParsed}
              name={inputName}
            />,
          );
        }
      });
    }
  }
  return { listSlots, activeGroupIndex };
};

export const extractSelectInputs = (
  nodeDef: nodeDefinition,
  node: GeomNodeBackType,
  switchSelectInputValue: (
    nodeId: string,
    inputId: number,
    activeValueId: number,
  ) => void,
) => {
  const selectInputs: JSX.Element[] = [];

  nodeDef.inputs.forEach((i) => {
    if (i.type === "select") {
      const activeIndex = node.values?.[i.id] as string;
      selectInputs.push(
        <DraggableNodeSelectInput
          switchSelectInputValue={switchSelectInputValue}
          activeIndex={parseInt(activeIndex)}
          inputValues={i.options}
          nodeId={node.id}
          inputId={i.id}
        />,
      );
    }
  });
  return selectInputs;
};

export const extractGroupSlots = (nodeDef: nodeDefinition) => {
  const groupSlots = nodeDef.inputs.reduce(
    (acc, cur) => {
      if (cur.type == "group") {
        if (!acc[cur.groupIndex]) acc[cur.groupIndex] = [];
        acc[cur.groupIndex].push(cur);
      }
      return acc;
    },
    {} as Record<number, typeof nodeDef.inputs>,
  );
  return groupSlots;
};

export function smartRound(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return parseFloat(value.toPrecision(6)).toString();
}

export function convertGroupToDbGeom(
  meshGroup: THREE.Group<THREE.Object3DEventMap>,
) {
  //TODO: CCS-7
  const geometry: ComponentGeometry[] = meshGroup.children
    .filter((mesh): mesh is THREE.Group => mesh instanceof THREE.Group)
    .map((mesh) => {
      const surfaceGeom = mesh.getObjectByName("surface") as THREE.Mesh;
      const bufferGeom = surfaceGeom.geometry.clone();
      const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      bufferGeom.applyMatrix4(rotationMatrix);
      bufferGeom.computeVertexNormals();
      return {
        position: Array.from(bufferGeom.attributes.position.array),
        indices: Array.from(bufferGeom.index?.array || []),
      };
    });
  return geometry;
}
