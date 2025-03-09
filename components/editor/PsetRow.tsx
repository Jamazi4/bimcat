import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";

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
        <p className="mb-2">
          <Badge>{name}</Badge>
        </p>
        <p className="text-right">{value}</p>
      </div>
      <Separator />
    </div>
  );
};
export default PsetRow;
