import { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const LabeledFilterInput = ({
  inputValue,
  onChange,
  labelContent,
  placeholder,
  htmlId,
}: {
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  labelContent: string;
  placeholder: string;
  htmlId: string;
}) => {
  const inputClassname = "hover:border-muted-foreground transition-all";
  const labelClassname =
    "text-muted-foreground mb-1 mx-3 transition-all group-hover:text-foreground";
  return (
    <div className="group">
      <Label
        htmlFor={htmlId}
        className={`${labelClassname} group-hover:text-foreground`}
      >
        {labelContent}
      </Label>
      <Input
        className={inputClassname}
        id={htmlId}
        name={htmlId}
        type="search"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          onChange(e);
        }}
      />
    </div>
  );
};
export default LabeledFilterInput;
