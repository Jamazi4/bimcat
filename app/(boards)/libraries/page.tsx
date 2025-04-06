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
import { fetchAllLibraries } from "@/utils/actions";

const page = async () => {
  const libraries = await fetchAllLibraries();

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
    };
  });

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <BreadCrumbs />
      <div className="mt-4">
        {frontendLibraries.map((library) => {
          return <LibraryMinature key={library.libId} library={library} />;
        })}
        <CreateLibraryButton />
      </div>
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
