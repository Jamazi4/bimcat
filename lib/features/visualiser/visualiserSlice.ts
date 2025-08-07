import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface nodeValuesState {
  [id: string]: Record<number, string | number | boolean>;
}

type VisualiserState = {
  nodeNavigation: boolean;
  nodeValues: nodeValuesState;
};

const initialState: VisualiserState = {
  nodeNavigation: false,
  nodeValues: {},
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
  },
});

export const { switchNodeNavigation, setNodeOutputValues } =
  visualiserSlice.actions;
export default visualiserSlice.reducer;
