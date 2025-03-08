"use server";

import { prisma } from "@/db";
import { ComponentGeometry } from "./types";
import { validateWithZodSchema, geometrySchema } from "./schemas";
import { redirect } from "next/navigation";

export const createComponentAction = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const geometry = formData.get("geometry") as string;
  const parsed = JSON.parse(geometry) as ComponentGeometry;
  const geometryResponse = await createGeometryAction(parsed);

  if (!geometryResponse) return;

  let componentId: string | null;
  try {
    const response = await prisma.component.create({
      data: {
        name: name,
        geomId: geometryResponse.id,
      },
    });
    componentId = response.id;
  } catch (error) {
    componentId = null;
    console.log(error);
  }
  if (componentId) {
    redirect(`/components/${componentId}`);
  }
};

export const createGeometryAction = async (geometry: ComponentGeometry) => {
  try {
    const response = await prisma.componentGeometry.create({
      data: {
        position: geometry.position,
        indices: geometry.indices,
      },
    });

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const fetchSingleComponentAction = async (id: string) => {
  const component = await prisma.component.findUnique({
    where: {
      id: id,
    },
  });
  return component;
};

export const fetchGeometryAction = async (id: string) => {
  if (!id) return;

  try {
    const response = await prisma.componentGeometry.findUnique({
      where: {
        id: id,
      },
    });
    if (response) {
      return validateWithZodSchema(geometrySchema, {
        position: response.position,
        indices: response.indices,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllComponents = async () => {
  try {
    const components = await prisma.component.findMany({});
    console.log(components);
    return components;
  } catch (error) {
    console.log(error);
  }
};

export const writeDb = async (formData: FormData) => {
  console.log("hello world");
  await prisma.product.create({
    data: {
      name: "zimnoch2",
    },
  });
};
