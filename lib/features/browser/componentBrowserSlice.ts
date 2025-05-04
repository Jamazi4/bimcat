import { BrowserSearchParamsType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentBrowserState {
  searchParams: BrowserSearchParamsType;
}

const initialState: ComponentBrowserState = {
  searchParams: {
    searchName: "",
    searchAuthor: "",
    searchPsetContent: "",
    searchPsetTitle: "",
    myComponents: false,
  },
};

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateBrowserSearchParams: (
      state,
      action: PayloadAction<BrowserSearchParamsType>,
    ) => {
      state.searchParams = action.payload;
    },
  },
});

export const { updateBrowserSearchParams } = componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
