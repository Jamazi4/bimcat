import { Pset } from "@/utils/schemas";
import { ComponentGeometry } from "@/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface modelState {
  geometry: ComponentGeometry[];
  psets: Pset[];
  info: { name: string; author: string };
}

type downloadIfcState = {
  modelState: modelState;
  liveGeometryRequested: boolean;
  requestCompleted: { geom: boolean; psets: boolean; info: boolean };
  parametersActive: boolean;
};

const initialState: downloadIfcState = {
  modelState: {
    geometry: [],
    psets: [],
    info: { name: "", author: "" },
  },
  liveGeometryRequested: false,
  requestCompleted: { geom: false, psets: false, info: false },
  parametersActive: false,
};

const downloadIfcSlice = createSlice({
  name: "downloadIfcState",
  initialState,
  reducers: {
    setLiveStateGeometry: (
      state,
      action: PayloadAction<{ geometry: ComponentGeometry[] }>,
    ) => {
      state.modelState.geometry = action.payload.geometry;
      state.requestCompleted.geom = true;
    },
    setLiveStatePsets: (state, action: PayloadAction<{ psets: Pset[] }>) => {
      state.modelState.psets = action.payload.psets;
      state.requestCompleted.psets = true;
    },
    setLiveStateInfo: (
      state,
      action: PayloadAction<{ info: { name: string; author: string } }>,
    ) => {
      state.modelState.info = action.payload.info;
      state.requestCompleted.info = true;
    },
    requestLiveGeometry: (
      state,
      action: PayloadAction<{ request: boolean }>,
    ) => {
      state.liveGeometryRequested = action.payload.request;
    },
    setControlsActive: (state, action: PayloadAction<{ active: boolean }>) => {
      state.parametersActive = action.payload.active;
    },
    resetDownloadState: (state) => {
      state.modelState = { ...initialState.modelState };
      state.requestCompleted = { ...initialState.requestCompleted };
      state.liveGeometryRequested = false;
    },
  },
});

export const {
  setLiveStateInfo,
  setLiveStateGeometry,
  setControlsActive,
  setLiveStatePsets,
  resetDownloadState,
  requestLiveGeometry,
} = downloadIfcSlice.actions;
export default downloadIfcSlice.reducer;
