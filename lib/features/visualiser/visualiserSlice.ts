import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type VisualiserState = {
  nodeNavigation: boolean;
};

const initialState: VisualiserState = {
  nodeNavigation: false,
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
  },
});

export const { switchNodeNavigation } = visualiserSlice.actions;
export default visualiserSlice.reducer;
