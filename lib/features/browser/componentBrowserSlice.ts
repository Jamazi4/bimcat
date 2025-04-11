import { createSlice } from "@reduxjs/toolkit";

export type selectedComponent = {
  id: string;
  name: string;
  editable: string;
};

export type selectedRows = Record<string, boolean>;

interface ComponentBrowserState {
  selectedComponents: selectedRows;
}

const initialState: ComponentBrowserState = {
  selectedComponents: {},
};

//TODO: selection persists when I select in
// component browser and go to libraries - route specific store maybe
const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateSelection: (state, action) => {
      state.selectedComponents = action.payload;
    },
    clearSelection: (state) => {
      state.selectedComponents = {};
    },
  },
});

export const { updateSelection, clearSelection } =
  componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
