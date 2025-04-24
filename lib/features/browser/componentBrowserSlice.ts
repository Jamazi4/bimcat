import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { searchParamsType } from "@/components/componentList/ComponentListWrapper";
import { fetchAllComponents } from "@/utils/actions/componentActions";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

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

export const fetchBrowserComponents = createAsyncThunk(
  "browserState/fetchBrowserComponents",
  async (params: searchParamsType, thunkAPI) => {
    try {
      const components = await fetchAllComponents(params);
      const mapped: ComponentRow[] = components.map((component) => {
        return {
          id: component.id,
          name: component.name,
          createdAt: component.createdAt.toISOString(),
          updatedAt: component.updatedAt.toISOString(),
          author: component.author,
          editable: component.editable,
          public: component.public,
        };
      });
      return mapped;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue("Failed to fetch browser components");
    }
  }
);

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
      state.fetchedComponents = action.payload;
    },
    clearBrowserSelection: (state) => {
      state.fetchedComponents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrowserComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBrowserComponents.fulfilled,
        (state, action: PayloadAction<ComponentRow[]>) => {
          state.fetchedComponents = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchBrowserComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateBrowserData,
  clearBrowserSelection,
  updateMyComponents,
  updateSearchString,
} = componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
