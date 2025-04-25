import { SelectedRow } from "@/utils/types";
import { createSlice } from "@reduxjs/toolkit";

export type selectedComponent = {
  id: string;
  name: string;
  editable: string;
};

interface LibraryBrowserState {
  selectedComponents: SelectedRow;
}

const initialState: LibraryBrowserState = {
  selectedComponents: {},
};

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
