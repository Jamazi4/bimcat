import Renderer from "@/components/ComponentEditor/Renderer";
import Title from "@/components/Title";
import ComponentCardTabs from "@/components/ComponentEditor/ComponentCardTabs";
import { prisma } from "@/db";

const ComponentCard = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;

  return (
    <div>
      <Title text={resolved.id} />
      <div className="grid grid-cols-2 ">
        <div>
          <Renderer />
        </div>
        <div>
          <ComponentCardTabs />
        </div>
      </div>
    </div>
  );
};
export default ComponentCard;
