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
import { currentUser } from "@clerk/nextjs/server";

const page = async () => {
  const libraries = await fetchAllLibrariesAction();
  const user = await currentUser();
  console.log(user);

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
      <h1 className="text-2xl font-bold my-6">Libraries</h1>
      {user && <CreateLibraryButton />}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {frontendLibraries.map((library) => {
          return <LibraryMinature key={library.libId} library={library} />;
        })}
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
