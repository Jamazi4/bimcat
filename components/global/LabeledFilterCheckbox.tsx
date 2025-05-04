import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const LabeledFilterCheckbox = ({
  switchFunc,
  htmlId,
  labelContent,
  checked,
}: {
  switchFunc: (key: string, value: boolean) => void;
  htmlId: string;
  labelContent: string;
  checked: boolean;
}) => {
  const checkLabelClassname =
    "text-muted-foreground  transition-all group-hover:text-foreground";
  const checkboxClassname = "mx-2 group-hover:border-foreground transition-all";
  return (
    <div className="group flex justify-center items-center mx-4">
      <Checkbox
        checked={checked}
        className={checkboxClassname}
        id={htmlId}
        onCheckedChange={(checked: boolean) => {
          switchFunc(htmlId, checked);
        }}
      />
      <Label htmlFor={htmlId} className={checkLabelClassname}>
        {labelContent}
      </Label>
    </div>
  );
};
export default LabeledFilterCheckbox;
