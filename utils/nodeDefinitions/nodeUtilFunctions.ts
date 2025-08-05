import {
  ASTNode,
  ASTNodeInput,
  EvalValue,
  nodeDefinition,
  NodeEvalResult,
  NodeInputType,
  NodeValues,
} from "../nodeTypes";

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
