import { getUserStateLibrariesAction } from "@/utils/actions/userActions";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserStateComponent = {
  id: string;
  name: string;
  public: boolean;
};

type UserStateLibrary = {
  id: string;
  name: string;
  public: boolean;
  components: UserStateComponent[];
};

export type UserState = {
  libraries: UserStateLibrary[];
  loading: boolean;
  error: string | null;
};

const initialState: UserState = {
  libraries: [],
  loading: false,
  error: null,
};

export const fetchUserLibraries = createAsyncThunk(
  "userState/fetchUserLibraries",
  async (_, thunkAPI) => {
    try {
      const dbUser = await getUserStateLibrariesAction();
      if (!dbUser) return [];

      const librariesState = dbUser.authoredLibraries.map((lib) => ({
        id: lib.id,
        name: lib.name,
        public: lib.public,
        components: lib.Components.map((component) => ({
          id: component.id,
          name: component.name,
          public: component.public,
        })),
      }));

      return librariesState;
    } catch (err) {
      console.log(err);
      return thunkAPI.rejectWithValue("Failed to fetch user libraries");
    }
  }
);

const userSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    updateLibraries: (
      state,
      action: PayloadAction<{ libraries: UserStateLibrary[] }>
    ) => {
      console.log("hello from userSlice");
      state.libraries = action.payload.libraries;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLibraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserLibraries.fulfilled,
        (state, action: PayloadAction<UserStateLibrary[]>) => {
          state.libraries = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchUserLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateLibraries } = userSlice.actions;
export default userSlice.reducer;
