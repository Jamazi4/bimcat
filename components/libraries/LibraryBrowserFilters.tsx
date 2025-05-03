"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useReducer } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useLibrariesParams } from "@/utils/customHooks/useLibrariesParams";
import { LibrariesSearchParamsType } from "@/utils/types";

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
        return { ...state, searchComponents: action.payload };
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
    searchComponents: initialParams.searchComponents,
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

  const handleSwitch = (key: "myLibraries" | "favorites", value: boolean) => {
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

  const inputClassname = "hover:border-muted-foreground transition-all";
  const labelClassname = "text-muted-foreground mb-1 mx-3";

  return (
    <div className="space-y-4 pb-4">
      <div className="grid grid-cols-2 space-x-2">
        {/* first row seach bars */}
        <div>
          <Label className={labelClassname}>name</Label>
          <Input
            className={inputClassname}
            name="searchName"
            type="search"
            placeholder="library name"
            value={state.searchName}
            onChange={(e) => {
              handleSearch("searchName", e.target.value);
              dispatch({ type: "SET_SEARCH_NAME", payload: e.target.value });
            }}
          />
        </div>

        <div>
          <Label className={labelClassname}>author</Label>
          <Input
            className={inputClassname}
            name="searchAuthor"
            type="search"
            placeholder="library author"
            value={state.searchAuthor}
            onChange={(e) => {
              handleSearch("searchAuthor", e.target.value);
              dispatch({ type: "SET_SEARCH_AUTHOR", payload: e.target.value });
            }}
          />
        </div>
      </div>

      {/* second row search bars */}
      <div className="grid grid-cols-2 space-x-2">
        <div>
          <Label className={labelClassname}>description</Label>
          <Input
            className={inputClassname}
            name="searchDescription"
            type="search"
            placeholder="library description"
            value={state.searchDescription}
            onChange={(e) => {
              handleSearch("searchDescription", e.target.value);
              dispatch({
                type: "SET_SEARCH_DESCRIPTION",
                payload: e.target.value,
              });
            }}
          />
        </div>

        <div>
          <Label className={labelClassname}>component</Label>
          <Input
            className={inputClassname}
            name="searchComponents"
            type="search"
            placeholder="component names"
            value={state.searchComponents}
            onChange={(e) => {
              handleSearch("searchComponents", e.target.value);
              dispatch({
                type: "SET_SEARCH_COMPONENTS",
                payload: e.target.value,
              });
            }}
          />
        </div>
      </div>

      {/* checkboxes */}
      <div className="justify-end flex">
        <div className="flex justify-center items-center mx-4">
          <Checkbox
            className="mx-2"
            id="myLibraries"
            onCheckedChange={(checked: boolean) => {
              handleSwitch("myLibraries", checked);
            }}
          />
          <Label htmlFor="my">Your libraries</Label>
        </div>
        <div className="flex justify-center items-center mx-4 space-x-2">
          <Checkbox
            className="mx-2"
            id="favorites"
            onCheckedChange={(checked: boolean) => {
              handleSwitch("favorites", checked);
            }}
          />
          <Label htmlFor="favorites">Favorites</Label>
        </div>
        <div className="flex justify-center items-center mx-4 space-x-2">
          <Checkbox className="mx-2" id="Composite" disabled />
          <Label htmlFor="Composite">Composite</Label>
        </div>
      </div>
    </div>
  );
};
export default LibraryBrowserFilters;
