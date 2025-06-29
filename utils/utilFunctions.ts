import { IfcFileInfo } from "@/components/libraries/DownloadLibraryButton";
import {
  componentWithGeometrySchemaType,
  PsetContentSchemaType,
} from "./schemas";
import { generateIfcFile } from "./ifc/ifcFileBuilder";
import { useCallback } from "react";

export const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "an error occured...",
  };
};

export const downloadFile = (
  blob: Blob,
  fileName: string,
  fileExtension: string,
) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.${fileExtension}`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const searchParamsToQuery = (
  params: Record<string, string | boolean>,
) => {
  const urlParams = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = value.toString();
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
  return urlParams;
};

export const searchInsensitive = (searchString: string, searchIn: string) => {
  return new RegExp(searchString, "i").test(searchIn);
};

export const psetContentToString = (psetContent: PsetContentSchemaType) => {
  return psetContent
    .map((content) =>
      Object.entries(content)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" "),
    )
    .join(" ");
};

export const generateIfcFilesLibrary = async (
  validatedComponents: componentWithGeometrySchemaType[],
) => {
  const ifcFiles = await Promise.all(
    validatedComponents.map(async (component) => {
      const info: IfcFileInfo = {
        name: component.name,
        author: component.author,
      };
      const blob = await generateIfcFile(
        component.geometry,
        info,
        component.psets,
      );
      return { name: component.name, blob };
    }),
  );
  return ifcFiles;
};

export const createNodeId = () => {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const createEdgeId = () => {
  return `edge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};
