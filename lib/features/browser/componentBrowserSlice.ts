import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { searchParamsType } from "@/components/componentList/ComponentListWrapper";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentBrowserState {
  selectedComponents: ComponentRow[];
  searchParams: searchParamsType;
}

const initialState: ComponentBrowserState = {
  selectedComponents: [],
  searchParams: { searchString: "", myComponents: false },
};

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateSearchString: (state, aciton: PayloadAction<string>) => {
      state.searchParams.searchString = aciton.payload;
    },
    updateMyComponents: (state, aciton: PayloadAction<boolean>) => {
      state.searchParams.myComponents = aciton.payload;
    },
    updateBrowserData: (state, action: PayloadAction<ComponentRow[]>) => {
      state.selectedComponents = action.payload;
    },
    clearBrowserSelection: (state) => {
      state.selectedComponents = [];
    },
  },
});

export const {
  updateBrowserData,
  clearBrowserSelection,
  updateMyComponents,
  updateSearchString,
} = componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
