import Renderer from "@/components/Renderer";
import Title from "@/components/Title";
import ComponentCardTabs from "./ComponentCardTabs";

const ComponentCard = () => {
  return (
    <div className="border rounded p-4 bg-muted w-full">
      <Title text="Cube" />
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
