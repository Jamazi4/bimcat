"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useReducer } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useLibrariesParams } from "@/utils/customHooks/useLibrariesParams";
import { LibrariesSearchParamsType } from "@/utils/types";
import LabeledFilterInput from "../global/LabeledFilterInput";
import LabeledFilterCheckbox from "../global/LabeledFilterCheckbox";

const LibraryBrowserFilters = () => {
  const { replace } = useRouter();
  const initialParams = useLibrariesParams();
  const searchParams = useSearchParams();

  type Action =
    | { type: "SET_MY_LIBRARIES"; payload: boolean }
    | { type: "SET_FAVORITES"; payload: boolean }
    | { type: "SET_SEARCH_NAME"; payload: string }
    | { type: "SET_SEARCH_AUTHOR"; payload: string }
    | { type: "SET_SEARCH_DESCRIPTION"; payload: string }
    | { type: "SET_SEARCH_COMPONENTS"; payload: string };

  const reducer = (state: LibrariesSearchParamsType, action: Action) => {
    switch (action.type) {
      case "SET_MY_LIBRARIES":
        return { ...state, myLibraries: action.payload };
      case "SET_FAVORITES":
        return { ...state, favorites: action.payload };
      case "SET_SEARCH_NAME":
        return { ...state, searchName: action.payload };
      case "SET_SEARCH_AUTHOR":
        return { ...state, searchAuthor: action.payload };
      case "SET_SEARCH_DESCRIPTION":
        return { ...state, searchDescription: action.payload };
      case "SET_SEARCH_COMPONENTS":
        return { ...state, searchContent: action.payload };
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    myLibraries: initialParams.myLibraries,
    favorites: initialParams.favorites,
    searchName: initialParams.searchName,
    searchAuthor: initialParams.searchAuthor,
    searchDescription: initialParams.searchDescription,
    searchContent: initialParams.searchContent,
  });

  const handleSearch = useDebouncedCallback(
    (key: keyof LibrariesSearchParamsType, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      replace(`/libraries?${params.toString()}`);
    },
    500,
  );

  const handleSwitch = (key: string, value: boolean) => {
    dispatch({
      type: key === "myLibraries" ? "SET_MY_LIBRARIES" : "SET_FAVORITES",
      payload: value,
    });

    if (value && key === "myLibraries" && state.favorites) {
      dispatch({ type: "SET_FAVORITES", payload: false });
    } else if (value && key === "favorites" && state.myLibraries) {
      dispatch({ type: "SET_MY_LIBRARIES", payload: true });
    }

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }
    replace(`/libraries?${params.toString()}`);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="grid grid-cols-2 space-x-2">
        {/* first row seach bars */}

        <LabeledFilterInput
          placeholder="library name"
          htmlId="searchName"
          inputValue={state.searchName}
          labelContent="name"
          onChange={(e) => {
            handleSearch("searchName", e.target.value);
            dispatch({
              type: "SET_SEARCH_NAME",
              payload: e.target.value,
            });
          }}
        />
        <LabeledFilterInput
          placeholder="library author"
          htmlId="searchAuthor"
          inputValue={state.searchAuthor}
          labelContent="author"
          onChange={(e) => {
            handleSearch("searchAuthor", e.target.value);
            dispatch({
              type: "SET_SEARCH_AUTHOR",
              payload: e.target.value,
            });
          }}
        />
      </div>

      {/* second row search bars */}
      <div className="grid grid-cols-2 space-x-2">
        <LabeledFilterInput
          placeholder="library description"
          htmlId="searchDescription"
          inputValue={state.searchDescription}
          labelContent="description"
          onChange={(e) => {
            handleSearch("searchDescription", e.target.value);
            dispatch({
              type: "SET_SEARCH_DESCRIPTION",
              payload: e.target.value,
            });
          }}
        />
        <LabeledFilterInput
          placeholder="Contained library or component"
          htmlId="searchContent"
          inputValue={state.searchContent}
          labelContent="content"
          onChange={(e) => {
            handleSearch("searchContent", e.target.value);
            dispatch({
              type: "SET_SEARCH_COMPONENTS",
              payload: e.target.value,
            });
          }}
        />
      </div>

      {/* checkboxes */}
      <div className="justify-end flex">
        <LabeledFilterCheckbox
          checked={state.myLibraries}
          switchFunc={handleSwitch}
          htmlId="myLibraries"
          labelContent="Your Libraries"
        />
        <LabeledFilterCheckbox
          checked={state.favorites}
          switchFunc={handleSwitch}
          htmlId="favorites"
          labelContent="Favorites"
        />
      </div>
    </div>
  );
};
export default LibraryBrowserFilters;
