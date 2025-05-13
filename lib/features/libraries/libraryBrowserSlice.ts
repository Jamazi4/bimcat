import { LibrariesSearchParamsType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LibraryBrowserState {
  librarySliceSearchParams: LibrariesSearchParamsType;
}

const initialState: LibraryBrowserState = {
  librarySliceSearchParams: {
    searchName: "",
    searchAuthor: "",
    searchDescription: "",
    searchContent: "",
    myLibraries: false,
    favorites: false,
    composite: false,
  },
};

const libraryBrowserSlice = createSlice({
  name: "libraryBrowser",
  initialState,
  reducers: {
    updateLibrarySearchParams: (
      state,
      action: PayloadAction<LibrariesSearchParamsType>,
    ) => {
      state.librarySliceSearchParams = action.payload;
    },
  },
});

export const { updateLibrarySearchParams } = libraryBrowserSlice.actions;
export default libraryBrowserSlice.reducer;
