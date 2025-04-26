import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { searchParamsType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentBrowserState {
  fetchedComponents: ComponentRow[];
  searchParams: searchParamsType;
  loading: boolean;
  error: string | null;
}

const initialState: ComponentBrowserState = {
  fetchedComponents: [],
  searchParams: { searchString: "", myComponents: false },
  loading: false,
  error: null,
};

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateSearchParams: (state, action: PayloadAction<searchParamsType>) => {
      state.searchParams = action.payload;
    },
    // updateBrowserData: (state, action: PayloadAction<ComponentRow[]>) => {
    //   state.fetchedComponents = action.payload;
    // },
  },
});

export const { updateSearchParams } = componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
