"use client";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Label } from "../ui/label";
import { useRouter, useSearchParams } from "next/navigation";

const Filters = () => {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const myComponents = searchParams.get("myComponents") === "true";

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
          <Input name="search" className=" rounded-r-none" />
          <Button className="rounded-l-none">
            <Search />
          </Button>
          <div className="flex justify-center items-center mx-4">
            <Checkbox
              className="mx-2"
              id="my"
              onCheckedChange={handleSwitchMyComponents}
              // checked={myComponents}
            />
            <Label htmlFor="my">Only my components</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Filters;
