import Renderer from "@/components/editor/Renderer";
import Title from "@/components/componentList/Title";
import { fetchSingleComponentAction } from "@/utils/actions";
import PsetsList from "@/components/editor/PsetsList";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const ComponentContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const resolvedParams = await params;
  console.log(resolvedParams);
  const id = resolvedParams.id;
  const component = await fetchSingleComponentAction(id);

  if (!component) return <p>Could not fetch component</p>;

  if (!component.geometry) return <p>Could not fetch geometry</p>;
  return (
    <div>
      <BreadCrumbs name={component.name} />
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
          <PsetsList
            psets={component.psets ?? []}
            editable={component.editable}
          />
        </div>
      </div>
    </div>
  );
};
export default ComponentContent;

const BreadCrumbs = ({ name }: { name: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components/browse">Browse</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
