import { selectedRow } from "@/utils/types";

const NameList = ({ components }: { components: selectedRow[] }) => {
  return (
    <span className="pt-4">
      {components.map((component) => {
        return (
          <span
            className="flex font-semibold mt-2 text-primary"
            key={Object.keys(component)[0]}
          >
            {`${Object.values(component)[0].name}`}
          </span>
        );
      })}
    </span>
  );
};
export default NameList;
