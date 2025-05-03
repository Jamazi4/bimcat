import { LibrariesSearchParamsType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type selectedComponent = {
  id: string;
  name: string;
  editable: string;
};

interface LibraryBrowserState {
  searchParams: LibrariesSearchParamsType;
}

const initialState: LibraryBrowserState = {
  searchParams: {
    searchName: "",
    searchAuthor: "",
    searchDescription: "",
    searchComponents: "",
    myLibraries: false,
    favorites: false,
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
      state.searchParams = action.payload;
    },
  },
});

export const { updateLibrarySearchParams } = libraryBrowserSlice.actions;
export default libraryBrowserSlice.reducer;
