"use client";

import { BrowserSearchParamsType } from "@/utils/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useReducer } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useBrowserParams } from "@/utils/customHooks/useBrowserParams";
import LabeledFilterInput from "../global/LabeledFilterInput";
import LabeledFilterCheckbox from "../global/LabeledFilterCheckbox";

const Filters = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const initialParams = useBrowserParams();

  type Action =
    | { type: "SET_MY_COMPONENTS"; payload: boolean }
    | { type: "SET_SEARCH_NAME"; payload: string }
    | { type: "SET_SEARCH_AUTHOR"; payload: string }
    | { type: "SET_SEARCH_PSETTITLE"; payload: string }
    | { type: "SET_SEARCH_PSETCONTENT"; payload: string };

  const reducer = (state: BrowserSearchParamsType, action: Action) => {
    switch (action.type) {
      case "SET_MY_COMPONENTS":
        return { ...state, myComponents: action.payload };
      case "SET_SEARCH_NAME":
        return { ...state, searchName: action.payload };
      case "SET_SEARCH_AUTHOR":
        return { ...state, searchAuthor: action.payload };
      case "SET_SEARCH_PSETTITLE":
        return { ...state, searchPsetTitle: action.payload };
      case "SET_SEARCH_PSETCONTENT":
        return { ...state, searchPsetContent: action.payload };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    myComponents: initialParams.myComponents,
    searchAuthor: initialParams.searchAuthor,
    searchName: initialParams.searchName,
    searchPsetContent: initialParams.searchPsetContent,
    searchPsetTitle: initialParams.searchPsetTitle,
  });

  const handleSearch = useDebouncedCallback(
    (key: keyof BrowserSearchParamsType, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      replace(`/components/browse?${params.toString()}`);
    },
    500,
  );

  const handleSwitchMyComponents = (key: string, value: boolean) => {
    dispatch({
      type: "SET_MY_COMPONENTS",
      payload: value,
    });

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, "true");
    } else {
      params.delete("myComponents");
    }
    replace(`/components/browse?${params.toString()}`);
  };

  return (
    <div className=" space-y-4 pb-4">
      <div className="grid grid-cols-2 space-x-2">
        <LabeledFilterInput
          labelContent="name"
          placeholder="component name"
          htmlId="searchName"
          inputValue={state.searchName}
          onChange={(e) => {
            handleSearch("searchName", e.target.value);
            dispatch({ type: "SET_SEARCH_NAME", payload: e.target.value });
          }}
        />

        <LabeledFilterInput
          labelContent="author"
          placeholder="component author"
          htmlId="searchAuthor"
          inputValue={state.searchAuthor}
          onChange={(e) => {
            handleSearch("searchAuthor", e.target.value);
            dispatch({ type: "SET_SEARCH_AUTHOR", payload: e.target.value });
          }}
        />
      </div>
      <div className="grid grid-cols-2 space-x-2">
        <LabeledFilterInput
          labelContent="pset title"
          placeholder="property set titles"
          htmlId="searchPsetTitle"
          inputValue={state.searchPsetTitle}
          onChange={(e) => {
            handleSearch("searchPsetTitle", e.target.value);
            dispatch({
              type: "SET_SEARCH_PSETTITLE",
              payload: e.target.value,
            });
          }}
        />

        <LabeledFilterInput
          labelContent="pset content"
          placeholder="propert set contents"
          htmlId="searchPsetContent"
          inputValue={state.searchPsetContent}
          onChange={(e) => {
            handleSearch("searchPsetContent", e.target.value);
            dispatch({
              type: "SET_SEARCH_PSETCONTENT",
              payload: e.target.value,
            });
          }}
        />
      </div>
      <div className="justify-end flex">
        <LabeledFilterCheckbox
          checked={state.myComponents}
          switchFunc={handleSwitchMyComponents}
          htmlId="myComponents"
          labelContent="Your Components"
        />
      </div>
    </div>
  );
};
export default Filters;
