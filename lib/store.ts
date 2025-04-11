import { configureStore } from "@reduxjs/toolkit";
import componentBrowserReducer from "./features/browser/componentBrowserSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      componentBrowser: componentBrowserReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
