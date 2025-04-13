import { createSlice } from "@reduxjs/toolkit";
import { selectedRows } from "../browser/componentBrowserSlice";

export type selectedComponent = {
  id: string;
  name: string;
  editable: string;
};

interface LibraryBrowserState {
  selectedComponents: selectedRows;
}

const initialState: LibraryBrowserState = {
  selectedComponents: {},
};

//TODO: selection persists when I select in
// component browser and go to libraries - route specific store maybe
const libraryBrowserSlice = createSlice({
  name: "libraryBrowser",
  initialState,
  reducers: {
    updateLibrarySelection: (state, action) => {
      state.selectedComponents = action.payload;
    },
    clearLibrarySelection: (state) => {
      state.selectedComponents = {};
    },
  },
});

export const { updateLibrarySelection, clearLibrarySelection } =
  libraryBrowserSlice.actions;
export default libraryBrowserSlice.reducer;
