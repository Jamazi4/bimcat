import CreateLibraryButton from "@/components/libraries/CreateLibraryButton";
import LibraryMinature from "@/components/libraries/LibraryMinature";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { fetchAllLibrariesAction } from "@/utils/actions";

const page = async () => {
  const libraries = await fetchAllLibrariesAction();

  if (!libraries) return <div>Nothing to look at here...</div>;

  const frontendLibraries = libraries.map((library) => {
    return {
      libId: library.id,
      libName: library.name,
      description: library.description,
      libAuthor: `${library.author.firstName} ${library.author.secondName}`,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      numComponents: library.Components.length,
      numGuests: library.guests.length,
      editable: library.editable,
      publicFlag: library.public,
    };
  });

  return (
    <main className="w-full px-4 justify-center mx-auto ">
      <BreadCrumbs />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {frontendLibraries.map((library) => {
          return <LibraryMinature key={library.libId} library={library} />;
        })}
      </div>
      <CreateLibraryButton />
    </main>
  );
};
export default page;

const BreadCrumbs = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Libraries</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
