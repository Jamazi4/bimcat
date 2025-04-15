import CreateLibraryButton from "@/components/libraries/CreateLibraryButton";
import LibrariesFallback from "@/components/libraries/LibrariesFallback";
import LibraryList from "@/components/libraries/LibraryList";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Suspense } from "react";

const page = async () => {
  return (
    <main className="w-full px-4 justify-center mx-auto ">
      <BreadCrumbs />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold my-6">Libraries</h1>
        <CreateLibraryButton />
      </div>

      <Suspense fallback={<LibrariesFallback />}>
        <LibraryList />
      </Suspense>
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
