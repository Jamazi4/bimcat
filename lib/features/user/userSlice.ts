import { getUserStateLibrariesAction } from "@/utils/actions/userActions";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserStateContent = {
  id: string;
  name: string;
  public: boolean;
};

type UserStateLibrary = {
  id: string;
  name: string;
  isPublic: boolean;
  isShared: boolean;
  isEditable: boolean;
  isComposite: boolean;
  content: UserStateContent[];
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

      const librariesState = dbUser.frontendLibraries?.map((lib) => ({
        id: lib.id,
        name: lib.name,
        isPublic: lib.isPublic,
        isShared: lib.isShared,
        isEditable: lib.isEditable,
        isComposite: lib.isComposite,
        content: lib.content.map((cont) => ({
          id: cont.id,
          name: cont.name,
          public: cont.public,
        })),
      }));

      return librariesState;
    } catch (err) {
      console.log(err);
      return thunkAPI.rejectWithValue("Failed to fetch user libraries");
    }
  },
);

const userSlice = createSlice({
  name: "userState",
  initialState,
  reducers: {
    updateLibraries: (
      state,
      action: PayloadAction<{ libraries: UserStateLibrary[] }>,
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
        },
      )
      .addCase(fetchUserLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateLibraries } = userSlice.actions;
export default userSlice.reducer;
