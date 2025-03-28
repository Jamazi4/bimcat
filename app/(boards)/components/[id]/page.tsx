import Renderer from "@/components/editor/Renderer";
import Title from "@/components/componentList/Title";
import ComponentCardTabs from "@/components/editor/ComponentCardTabs";
import { fetchSingleComponentAction } from "@/utils/actions";
import PsetsList from "@/components/editor/PsetsList";

const ComponentCard = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = await params;

  const component = await fetchSingleComponentAction(resolvedParams.id);

  if (!component) return <p>Could not fetch component</p>;
  if (!component.geometry) return <p>Could not fetch geometry</p>;

  return (
    <div>
      <Title text={component.name} />
      <div
        className="justify-center grid grid-cols-1 lg:grid-cols-6
       gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto"
      >
        <div className="lg:col-span-4">
          {component ? (
            <Renderer geometry={component.geometry} />
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div className="lg:col-span-2">
          {/* <ComponentCardTabs psets={component.psets} /> */}
          <PsetsList psets={component.psets} />
        </div>
      </div>
    </div>
  );
};
export default ComponentCard;
