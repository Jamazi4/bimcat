import { fetchLibraryComponents } from "@/utils/actions";
import { columns } from "@/components/componentList/ComponentListColumns";
import { ComponentList } from "@/components/componentList/ComponentList";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const page = async ({ params }: { params: Promise<{ libraryId: string }> }) => {
  const { libraryId } = await params;
  const result = await fetchLibraryComponents(libraryId);
  if (result === undefined) return <div>Library does not exist</div>;
  const { libraryInfo, frontendComponents } = result;
  if (!libraryId) return <div>Library does not exist</div>;

  if (!frontendComponents) return <div>No components found.</div>;

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <BreadCrumbs name={libraryInfo.libraryName} />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold my-6">{libraryInfo.libraryName}</h1>
      </div>
      <ComponentList columns={columns} data={frontendComponents} />
      <div className="mt-12">
        <h1 className="font-semibold mb-4">Description:</h1>
        <p className="bg-accent border rounded-md p-4 ">{libraryInfo.desc}</p>
      </div>
    </main>
  );
};
export default page;

const BreadCrumbs = ({ name }: { name: string }) => {
  return (
    <Breadcrumb className="border-accent">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/libraries">Libraries</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
