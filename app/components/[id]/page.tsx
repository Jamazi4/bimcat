import Renderer from "@/components/ComponentEditor/Renderer";
import Title from "@/components/Title";
import ComponentCardTabs from "@/components/ComponentEditor/ComponentCardTabs";
import { fetchSingleComponentAction } from "@/utils/actions";

const ComponentCard = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolved = await params;
  // const [component, setComponent] = useState<>(null);

  const geomId = "040002d1-03e5-4d77-8ece-2c3f698e243a"; //temp
  const component = await fetchSingleComponentAction(resolved.id);

  return (
    <div>
      <Title text={component ? component.name : "loading..."} />
      <div className="grid grid-cols-2 ">
        <div>
          {component ? (
            <>
              <Renderer id={component ? component.geomId : ""} />
            </>
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div>
          <ComponentCardTabs />
        </div>
      </div>
    </div>
  );
};
export default ComponentCard;
