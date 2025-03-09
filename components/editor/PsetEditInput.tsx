"use client";

import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const PsetEditInput = ({
  value,
  name,
}: {
  value: number | string | boolean;
  name: string;
}) => {
  const [selectedValue, setSelectedValue] = useState(value.toString());
  if (typeof value === "boolean") {
    return (
      <Select
        value={selectedValue}
        onValueChange={(newVal) => {
          setSelectedValue(newVal);
        }}
        name={name}
      >
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
  return (
    <Input id={name} name={name} defaultValue={value} className="col-span-3" />
  );
};
export default PsetEditInput;
