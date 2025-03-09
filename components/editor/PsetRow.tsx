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
      <div className="justify-between p-2">
        <div className="mb-2">
          <p className="text-sm text-secondary-foreground">{name}</p>
        </div>
        <p className="text-right">{value}</p>
      </div>
      <Separator />
    </div>
  );
};
export default PsetRow;
