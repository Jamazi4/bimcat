"use client";

import ComponentContentWrapper from "@/components/global/ComponentContentWrapper";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import { componentWithGeometrySchemaType } from "@/utils/schemas";
import { SelectedRow } from "@/utils/types";
import { Dot } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import RendererFallback from "./RendererFallback";

export default function Home() {
  const exampleId = "5c5d71c9-1145-4421-b616-7b43bb41d446";
  const [fetched, setFetched] = useState(false);
  const [componentState, setComponentState] = useState<
    null | componentWithGeometrySchemaType | undefined
  >(null);

  const fetchComponentAsync = useCallback(async () => {
    const comp = await fetchSingleComponentAction(exampleId);
    setComponentState(comp);
  }, [exampleId]);

  const componentData = useRef<SelectedRow>({});

  useEffect(() => {
    fetchComponentAsync();
  }, [fetchComponentAsync]);

  useEffect(() => {
    if (!componentState) return;
    componentData.current = {
      [exampleId]: {
        name: componentState!.name,
        isPublic: componentState!.public,
        editable: componentState!.editable,
      },
    };
    setFetched(true);
  }, [componentState, exampleId]);

  const tableHeaderStyles =
    "font-bold text-xl sm:text-2xl lg:text-4xl text-center min-h-24";
  const highlightDivStyles =
    "hover:text-primary transition-all hover:scale-102 duration-400 py-2 text-sm sm:text-xl sm:px-4 sm:py-4 lg:text-2xl lg:px-6 lg:py-6";

  return (
    <main className="max-w-7xl px-4 justify-center mx-auto mt-24">
      <HeroTitle />

      {fetched ? (
        <ComponentContentWrapper
          componentAuthor={componentState!.author}
          componentData={componentData.current}
          isUsingNodes={!!componentState!.nodes?.id}
          componentId={exampleId}
          componentGeometry={componentState!.geometry}
          componentEditable={componentState!.editable}
          componentPsets={componentState!.psets}
          uiControls={componentState!.nodes?.uiControls || undefined}
        />
      ) : (
        <RendererFallback />
      )}

      <div className="grid grid-cols-3 pt-2 lg:pt-4 sm:pt-6 mt-12 px-4 gap-4 border-2 rounded-md bg-accent mb-12 pb-12">
        <Link href={"/visualiser"}>
          <div className={highlightDivStyles}>
            <h2 className={tableHeaderStyles}>Upload or Create</h2>
            <ol className="space-y-2">
              <li className="flex">
                <Dot size={32} />
                <p>Upload your components from .ifc files</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Create parametric models</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Add dynamic property sets</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Edit and download</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>* Account needed</p>
              </li>
            </ol>
          </div>
        </Link>

        <Link href={"/browse"}>
          <div className={highlightDivStyles}>
            <h2 className={tableHeaderStyles}>Browse</h2>
            <ol className="space-y-2">
              <li className="flex">
                <Dot size={32} />
                <p>Browse through public components</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Filter by author, property set content or name</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Download .ifc for any available component</p>
              </li>
            </ol>
          </div>
        </Link>

        <Link href={"/libraries"}>
          <div className={highlightDivStyles}>
            <h2 className={tableHeaderStyles}>Share and Organize</h2>
            <ol className="space-y-2">
              <li className="flex">
                <Dot size={32} />
                <p>Build libraries of your components</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Share libraries with your team</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Manage who can see your libraries</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Merge libraries into composite libraries</p>
              </li>
              <li className="flex">
                <Dot size={32} />
                <p>Download nested folders of .ifc</p>
              </li>
            </ol>
          </div>
        </Link>
      </div>
    </main>
  );
}

function HeroTitle() {
  return (
    <div className="perspective-[1000px]">
      <h1
        className="
          text-center
          font-black
          transition-transform
          duration-700
          ease-out
          will-change-transform

          text-3xl
          px-6
          py-12

          sm:text-4xl
          sm:px-12
          sm:py-16

          lg:text-6xl
          lg:px-24
          lg:py-24

          hover:scale-[1.03]
          hover:drop-shadow-md
        "
      >
        Upload, build and manage parametric BIM models natively in .ifc
      </h1>
    </div>
  );
}
