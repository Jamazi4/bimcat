import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Label } from "../ui/label";

const Filters = () => {
  return (
    <div className="my-4">
      <div>
        <div className="flex">
          <Input name="search" className=" rounded-r-none" />
          <Button className="rounded-l-none">
            <Search />
          </Button>
          <div className="flex justify-center items-center mx-4">
            <Checkbox className="mx-2" id="my" />
            <Label htmlFor="my">Only my components</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Filters;
