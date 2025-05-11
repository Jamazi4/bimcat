import { ComponentGeometry } from "@/utils/types";
import PsetsList from "../editor/PsetsList";
import Renderer from "../editor/Renderer";
import { Pset } from "@/utils/schemas";

const ComponentContentWrapper = ({
  componentGeometry,
  componentEditable,
  componentPsets,
}: {
  componentGeometry: ComponentGeometry[];
  componentPsets: Pset[] | undefined;
  componentEditable: boolean;
}) => {
  return (
    <div>
      <div
        className="justify-center grid grid-cols-1 lg:grid-cols-6
   gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto"
      >
        <div className="lg:col-span-4">
          {componentGeometry ? (
            <Renderer geometry={componentGeometry} />
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <PsetsList
            psets={componentPsets ?? []}
            editable={componentEditable}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentContentWrapper;
