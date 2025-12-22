"use client";

import ComponentContentWrapper from "@/components/global/ComponentContentWrapper";
import LoadingSpinner from "@/components/global/LoadingSpinner";
import { fetchSingleComponentAction } from "@/utils/actions/componentActions";
import { componentWithGeometrySchemaType } from "@/utils/schemas";
import { SelectedRow } from "@/utils/types";
import { Dot } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

  const tableHeaderStyles = "font-bold text-4xl pb-12 text-center";

  return (
    <main className="max-w-7xl px-4 justify-center mx-auto mt-24">
      <h1 className="text-center p-24 m-4 text-6xl font-black">
        Upload, build and manage parametric BIM models natively in .ifc
      </h1>

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
        <LoadingSpinner />
      )}

      <div className="grid grid-cols-3  pt-12 mt-12 px-4 gap-4 border-2 rounded-md bg-accent mb-12 pb-12">
        <div>
          <h2 className={tableHeaderStyles}>Upload or Create</h2>
          <ol className="space-y-2 text-xl">
            <li className="flex">
              <Dot />
              <p>Components - Create at the navbar on top</p>
            </li>
            <li className="flex">
              <Dot />
              <p>File - Upload to load .ifc</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Click on mesh and Component - Save</p>
            </li>
            <li className="flex">
              <Dot />
              <p>OR</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Component - Create to create a new one!</p>
            </li>
            <li className="flex">
              <Dot />
              <p>*account needed</p>
            </li>
          </ol>
        </div>
        <div>
          <h2 className={tableHeaderStyles}>Browse</h2>
          <ol className="space-y-2 text-xl">
            <li className="flex">
              <Dot />
              <p>Components - Browse at the navbar on top</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Play with search and filters</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Go to component page</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Modify parametric components</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Download .ifc</p>
            </li>
          </ol>
        </div>
        <div>
          <h2 className={tableHeaderStyles}>Share and Organize</h2>
          <ol className="space-y-2 text-xl">
            <li className="flex">
              <Dot />
              <p>Components - Browse at the navbar on top</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Play with search and filters</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Go to component page</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Modify parametric components</p>
            </li>
            <li className="flex">
              <Dot />
              <p>Download .ifc</p>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
