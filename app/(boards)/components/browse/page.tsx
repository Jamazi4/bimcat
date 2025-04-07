import BrowserFallback from "@/components/componentList/BrowserFallback";
import ComponentListWrapper from "@/components/componentList/ComponentListWrapper";
import Filters from "@/components/componentList/Filters";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Suspense } from "react";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ myComponents: string; search: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="w-full px-4 justify-center mx-auto">
      <BreadCrumbs />
      <h1 className="text-2xl font-bold my-6">Component browser</h1>
      <Filters />
      <Suspense key={params.search} fallback={<BrowserFallback />}>
        <ComponentListWrapper params={params} />
      </Suspense>
    </main>
  );
}

const BreadCrumbs = () => {
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
          <BreadcrumbPage>Browse</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
