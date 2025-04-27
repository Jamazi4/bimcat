"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

const LibraryBrowserFilters = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const [myLibraries, setMyLibraries] = useState(
    searchParams.get("myLibraries") === "true"
  );
  const [favorites, setFavorites] = useState(
    searchParams.get("favorites") === "true"
  );
  const [searchString, setSearchString] = useState(
    searchParams.get("search") || ""
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    replace(`/libraries?${params.toString()}`);
  }, 500);

  const handleSwitchMyComponents = (checked: boolean) => {
    setMyLibraries(checked);
    if (checked === true && favorites === true) {
      handleSwitchfavorites(checked);
    }
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("myLibraries", "true");
    } else {
      params.delete("myLibraries");
    }
    replace(`/libraries?${params.toString()}`);
  };

  const handleSwitchfavorites = (checked: boolean) => {
    setFavorites(checked);
    if (checked === true && myLibraries === true) {
      handleSwitchMyComponents(checked);
    }
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("favorites", "true");
    } else {
      params.delete("favorites");
    }

    replace(`/libraries?${params.toString()}`);
  };
  return (
    <div className="mb-4">
      <div>
        <div className="flex">
          <Input
            name="search"
            type="search"
            placeholder="search by name, author or description"
            value={searchString}
            onChange={(e) => {
              console.log("onchange fired");
              setSearchString(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          <div className="flex justify-center items-center mx-4">
            <Checkbox
              className="mx-2"
              id="my"
              onCheckedChange={(checked: boolean) => {
                handleSwitchMyComponents(checked);
              }}
              checked={myLibraries}
            />
            <Label htmlFor="my">Your libraries</Label>
          </div>
          <div className="flex justify-center items-center mx-4">
            <Checkbox
              className="mx-2"
              id="favorites"
              onCheckedChange={(checked: boolean) => {
                handleSwitchfavorites(checked);
              }}
              checked={favorites}
            />
            <Label htmlFor="favorites">Favorites</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LibraryBrowserFilters;
