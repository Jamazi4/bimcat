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
    <div className=" justify-center flex flex-col px-4 mx-auto  ">
      <Title text={component ? component.name : "loading..."} />
      <div className="justify-center grid lg:grid-cols-6 gap-4 ">
        <div className="lg:col-span-4">
          {component ? (
            <div>
              <Renderer id={component ? component.geomId : ""} />
            </div>
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
