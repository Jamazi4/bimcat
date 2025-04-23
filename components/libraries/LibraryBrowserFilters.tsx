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

  const [myComponents, setMyComponents] = useState(
    searchParams.get("myComponents") === "true"
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
    setMyComponents(checked);
    const params = new URLSearchParams(searchParams);
    if (checked) {
      params.set("myComponents", "true");
    } else {
      params.delete("myComponents");
    }
    replace(`/libraries?${params.toString()}`);
  };
  return (
    <div className="my-4">
      <div>
        <div className="flex">
          <Input
            name="search"
            type="search"
            placeholder="search by name or author"
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
              checked={myComponents}
            />
            <Label htmlFor="my">Your components</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LibraryBrowserFilters;
