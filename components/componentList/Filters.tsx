"use client";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Label } from "../ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const Filters = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const myComponents = searchParams.get("myComponents") === "true";

  const [search, setSearch] = useState(
    searchParams.get("search")?.toString() || ""
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    replace(`/components/browse?${params.toString()}`);
  }, 500);

  const handleSwitchMyComponents = () => {
    const params = new URLSearchParams(searchParams);
    if (myComponents) {
      params.delete("myComponents");
    } else {
      params.set("myComponents", "true");
    }
    replace(`/components/browse?${params.toString()}`);
  };

  return (
    <div className="my-4">
      <div>
        <div className="flex">
          <Input
            name="search"
            type="search"
            placeholder="search component"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleSearch(e.target.value);
            }}
          />

          <div className="flex justify-center items-center mx-4">
            <Checkbox
              className="mx-2"
              id="my"
              onCheckedChange={handleSwitchMyComponents}
              // checked={myComponents}
            />
            <Label htmlFor="my">Your components</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Filters;
