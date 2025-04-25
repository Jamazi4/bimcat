import { SelectedRow } from "@/utils/types";
import { cn } from "@/lib/utils";

const NameList = ({
  components,
  highlightDestructiveIds,
  highlightedConstructiveIds,
}: {
  components: SelectedRow[];
  highlightDestructiveIds?: string[];
  highlightedConstructiveIds?: string[];
}) => {
  return (
    <span>
      {components.map((component) => {
        const componentKey = Object.keys(component)[0];
        const highlightDestructive =
          highlightDestructiveIds?.includes(componentKey);
        const highlightedConstructive =
          highlightedConstructiveIds?.includes(componentKey);

        const color = highlightDestructive
          ? "text-destructive"
          : "text-constructive";

        const highlight = highlightDestructive || highlightedConstructive;
        return (
          <span
            className={cn(
              "flex font-semibold mt-2",
              highlight ? color : "text-primary"
            )}
            key={componentKey}
          >
            {`${Object.values(component)[0].name}`}
          </span>
        );
      })}
    </span>
  );
};
export default NameList;
