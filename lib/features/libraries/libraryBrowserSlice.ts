import { LibrariesSearchParamsType } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export type selectedComponent = {
//   id: string;
//   name: string;
//   editable: string;
// };
interface INavigationData {
  id: string;
  name: string;
}
export interface ICompositeNavigation {
  composite: INavigationData;
  library: INavigationData;
  component: INavigationData;
}

interface LibraryBrowserState {
  librarySliceSearchParams: LibrariesSearchParamsType;
  compositeNavigation: ICompositeNavigation;
}

const initialState: LibraryBrowserState = {
  compositeNavigation: {
    composite: { id: "", name: "" },
    library: { id: "", name: "" },
    component: { id: "", name: "" },
  },
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
    updateCompositeNavigation: (
      state,
      action: PayloadAction<ICompositeNavigation["composite"]>,
    ) => {
      state.compositeNavigation.composite = action.payload;
    },
    updateLibraryNavigation: (
      state,
      action: PayloadAction<ICompositeNavigation["library"]>,
    ) => {
      state.compositeNavigation.library = action.payload;
    },
    updateCompponentNavigation: (
      state,
      action: PayloadAction<ICompositeNavigation["component"]>,
    ) => {
      state.compositeNavigation.component = action.payload;
    },
  },
});

export const {
  updateLibrarySearchParams,
  updateCompponentNavigation,
  updateLibraryNavigation,
  updateCompositeNavigation,
} = libraryBrowserSlice.actions;
export default libraryBrowserSlice.reducer;
