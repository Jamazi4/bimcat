import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PsetEditInput = ({
  value,
  name,
}: {
  value: number | string | boolean;
  name: string;
}) => {
  if (typeof value === "boolean") {
    return (
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue
            defaultValue={value.toString()}
            placeholder={value.toString()}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">true</SelectItem>
          <SelectItem value="false">false</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return <Input id={name} defaultValue={value} className="col-span-3" />;
};
export default PsetEditInput;
