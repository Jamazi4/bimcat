import Renderer from "@/components/ComponentEditor/Renderer";
import Title from "@/components/Title";
import ComponentCardTabs from "@/components/ComponentEditor/ComponentCardTabs";

const ComponentCard = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;

  const geomId = "040002d1-03e5-4d77-8ece-2c3f698e243a"; //temp

  return (
    <div>
      <Title text={resolved.id} />
      <div className="grid grid-cols-2 ">
        <div>
          <Renderer id={geomId} />
        </div>
        <div>
          <ComponentCardTabs />
        </div>
      </div>
    </div>
  );
};
export default ComponentCard;
