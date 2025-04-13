import { selectedRow } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";

interface ComponentBrowserState {
  selectedComponents: selectedRow[];
}

const initialState: ComponentBrowserState = {
  selectedComponents: [],
};

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateBrowserSelection: (state, action) => {
      state.selectedComponents = action.payload;
    },
    clearBrowserSelection: (state) => {
      state.selectedComponents = [];
    },
  },
});

export const { updateBrowserSelection, clearBrowserSelection } =
  componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
