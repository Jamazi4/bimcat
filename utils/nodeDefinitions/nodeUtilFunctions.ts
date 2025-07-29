import { ASTNode, ASTNodeInput, NodeEvalResult, NodeValues } from "../nodeTypes";

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

export const getActiveInputIds = (nodeValues: NodeValues, groupInputIds: number[]) => {

  return Object.entries(nodeValues)
    .filter(([key, val]) => val === true && groupInputIds.includes(parseInt(key)))
    .map(([key, _]) => parseInt(key));

}

