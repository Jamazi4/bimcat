import { Separator } from "../ui/separator";

const PsetRow = ({
  name,
  value,
}: {
  name: string;
  value: string | boolean | number;
}) => {
  return (
    <div className="mb-4">
      <div className="justify-between p-2 min-h-[60px]">
        <div className="mb-2">
          <p className="font-bold text-secondary-foreground">{name}</p>
        </div>
        <p>{value || "-"}</p>
      </div>
      <Separator />
    </div>
  );
};
export default PsetRow;
