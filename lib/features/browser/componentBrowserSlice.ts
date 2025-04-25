import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { RootState } from "@/lib/store";
import { fetchAllComponents } from "@/utils/actions/componentActions";
import { searchParamsType } from "@/utils/types";
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
      const state = thunkAPI.getState() as RootState;
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
  },
  {
    condition: (params: searchParamsType, { getState }) => {
      const state = getState() as RootState;
      const currentParams = state.componentBrowser.searchParams;
      console.log({
        oldParams: currentParams,
        incomingParams: params,
      });
      return !(
        currentParams.searchString === params.searchString &&
        currentParams.myComponents === params.myComponents
      );
    },
  }
);

const componentBrowserSlice = createSlice({
  name: "componentBrowser",
  initialState,
  reducers: {
    updateSearchParams: (state, action: PayloadAction<searchParamsType>) => {
      state.searchParams = action.payload;
    },
    updateBrowserData: (state, action: PayloadAction<ComponentRow[]>) => {
      state.fetchedComponents = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrowserComponents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrowserComponents.fulfilled, (state, action) => {
        state.searchParams = action.meta.arg;
        state.fetchedComponents = action.payload;
        console.log("onextrareducer action meta", action.meta.arg);
        console.log("onextrareducer searchparams", state.searchParams);
        state.loading = false;
      })
      .addCase(fetchBrowserComponents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateBrowserData, updateSearchParams } =
  componentBrowserSlice.actions;
export default componentBrowserSlice.reducer;
