import Renderer from "@/components/editor/Renderer";
import Title from "@/components/componentList/Title";
import ComponentCardTabs from "@/components/editor/ComponentCardTabs";
import { fetchSingleComponentAction } from "@/utils/actions";

const ComponentCard = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;

  const component = await fetchSingleComponentAction(resolved.id);

  return (
    <div>
      <Title text={component ? component.name : "loading..."} />
      <div className="justify-center grid grid-cols-1 lg:grid-cols-6 gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto">
        <div className="lg:col-span-4">
          {component ? (
            <Renderer id={component ? component.geomId : ""} />
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <ComponentCardTabs psets={component.psets} />
        </div>
      </div>
    </div>
  );
};
export default ComponentCard;
