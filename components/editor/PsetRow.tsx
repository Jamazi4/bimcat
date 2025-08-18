import { Zap } from "lucide-react";

const PsetRow = ({
  isDynamic,
  name,
  value,
}: {
  isDynamic: boolean;
  name: string;
  value: string | boolean | number;
}) => {
  return (
    <div className="mb-2 bg-accent rounded-md p-2">
      <div className="justify-between px-2 min-h-[60px]">
        <div className="mb-2 place-content-between flex">
          <p className="font-bold text-secondary-foreground">{name}</p>
          {isDynamic && <Zap size={16} />}
        </div>
        <p>{value || "-"}</p>
      </div>
    </div>
  );
};
export default PsetRow;
