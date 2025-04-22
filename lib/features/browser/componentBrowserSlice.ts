import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { searchParamsType } from "@/components/componentList/ComponentListWrapper";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentBrowserState {
  selectedComponents: ComponentRow[];
  searchParams: searchParamsType;
}

const initialState: ComponentBrowserState = {
  selectedComponents: [],
  searchParams: { search: "", myComponents: false },
};

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateSearchParams: (state, action: PayloadAction<searchParamsType>) => {
      state.searchParams = action.payload;
    },
    updateBrowserData: (state, action: PayloadAction<ComponentRow[]>) => {
      state.selectedComponents = action.payload;
    },
    clearBrowserSelection: (state) => {
      state.selectedComponents = [];
    },
  },
});

export const { updateBrowserData, clearBrowserSelection, updateSearchParams } =
  componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
