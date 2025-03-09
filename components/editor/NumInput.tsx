import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const NumInput = ({
  title,
  defaultValue,
}: {
  title: string;
  defaultValue: number;
}) => {
  return (
    <div className="mb-4">
      <Label htmlFor="witdth" className="capitalize mb-2">
        {title}:{" "}
      </Label>
      <div className="flex space-x-4">
        <Input id="width" defaultValue={defaultValue} className="bg-input" />
        <Button variant="ghost" className="cursor-pointer">
          Save
        </Button>
      </div>
    </div>
  );
};
export default NumInput;
