import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface nodeValuesState {
  [id: string]: Record<number, string | number | boolean>;
}

interface contextMenuData {
  x: number;
  y: number;
  isOpen: boolean;
}

type VisualiserState = {
  nodeNavigation: boolean;
  nodeValues: nodeValuesState;
  contextMenuOpen: contextMenuData;
};

const initialState: VisualiserState = {
  nodeNavigation: false,
  nodeValues: {},
  contextMenuOpen: { x: 0, y: 0, isOpen: false },
};

const visualiserSlice = createSlice({
  name: "visualiserState",
  initialState,
  reducers: {
    switchNodeNavigation: (
      state,
      action: PayloadAction<{ nodeNavigation: boolean }>,
    ) => {
      state.nodeNavigation = action.payload.nodeNavigation;
    },
    setNodeOutputValues: (
      state,
      action: PayloadAction<{ nodeValues: nodeValuesState }>,
    ) => {
      const [id, values] = Object.entries(action.payload.nodeValues)[0];

      state.nodeValues[id] = {
        ...state.nodeValues[id],
        ...values,
      };
    },
    deleteNodeOutputValue: (
      state,
      action: PayloadAction<{ nodeIds: string[] }>,
    ) => {
      action.payload.nodeIds.forEach((id) => delete state.nodeValues[id]);
    },
    setContextMenuOpen: (
      state,
      action: PayloadAction<{ contextMenuOpen: contextMenuData }>,
    ) => {
      state.contextMenuOpen = action.payload.contextMenuOpen;
    },
  },
});

export const {
  switchNodeNavigation,
  setNodeOutputValues,
  deleteNodeOutputValue,
  setContextMenuOpen,
} = visualiserSlice.actions;
export default visualiserSlice.reducer;
