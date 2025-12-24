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

      <div
        className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-6
    px-4
    mt-12
    pb-12
  "
      >
        <Link href={"/visualiser"} className="h-full">
          <div className={`${highlightDivStyles} h-full p-4 sm:p-6`}>
            <h2 className={tableHeaderStyles}>Upload or Create</h2>
            <ol className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Upload your components from .ifc files
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Create parametric models</p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Add dynamic property sets</p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Edit and download</p>
              </li>
              <li className="flex items-start gap-3 opacity-70">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Account needed</p>
              </li>
            </ol>
          </div>
        </Link>

        <Link href={"/components/browse"} className="h-full">
          <div className={`${highlightDivStyles} h-full p-4 sm:p-6`}>
            <h2 className={tableHeaderStyles}>Browse</h2>
            <ol className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Browse through public components</p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Filter by author, property set content or name
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Modify parametric models with available controls
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Download .ifc for any available component
                </p>
              </li>
            </ol>
          </div>
        </Link>

        <Link href={"/libraries"} className="h-full">
          <div className={`${highlightDivStyles} h-full p-4 sm:p-6`}>
            <h2 className={tableHeaderStyles}>Share and Organize</h2>
            <ol className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Build libraries of your components
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Share libraries with your team</p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Manage who can see your libraries
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">
                  Merge libraries into composite libraries
                </p>
              </li>
              <li className="flex items-start gap-3">
                <Dot size={16} className="mt-1 shrink-0" />
                <p className="leading-snug">Download nested folders of .ifc</p>
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
