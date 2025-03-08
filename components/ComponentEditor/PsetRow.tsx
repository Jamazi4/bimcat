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
      <div className="flex justify-between p-2">
        <p>{name}</p>
        <p>{value}</p>
      </div>
      <Separator />
    </div>
  );
};
export default PsetRow;
