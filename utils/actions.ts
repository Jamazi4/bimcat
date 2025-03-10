"use server";

import { prisma } from "@/db";
import { ComponentGeometry } from "./types";
import {
  validateWithZodSchema,
  geometrySchema,
  componentSchema,
  Pset,
} from "./schemas";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "an error occured...",
  };
};

const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) redirect("/");
};

export const createComponentAction = async (
  prevState: any,
  formData: FormData
) => {
  const name = formData.get("name") as string;
  const geometry = formData.get("geometry") as string;
  const psets = formData.get("psets") as string;
  const parsedGeometry = JSON.parse(geometry) as ComponentGeometry;
  const parsedPsets = JSON.parse(psets);
  const geometryResponse = await createGeometryAction(parsedGeometry);

  if (!geometryResponse) throw new Error("Error processing geometry.");

  try {
    const response = await prisma.component.create({
      data: {
        name: name,
        geomId: geometryResponse.id,
        psets: parsedPsets,
      },
    });
    revalidatePath(`/components`);
    return { message: `Component ${name} created successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

const createGeometryAction = async (geometry: ComponentGeometry) => {
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

  return validateWithZodSchema(componentSchema, component);
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

    return components;
  } catch (error) {
    console.log(error);
  }
};

export const updatePsetsAction = async (prevState: any, formData: FormData) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;
  const keysToRemove = ["componentId", "psetTitle"];
  const newPsetData = Object.fromEntries(
    formData.entries().filter(([key]) => !keysToRemove.includes(key))
  );

  try {
    const component = await fetchSingleComponentAction(componentId);

    const validatedComponent = validateWithZodSchema(
      componentSchema,
      component
    );

    const newPsets: Pset[] = validatedComponent.psets.map((pset: Pset) => {
      if (pset.title === psetTitle) {
        return {
          title: psetTitle,
          content: Object.entries(newPsetData).map(([key, value]) => ({
            [key]: value as string | number | boolean,
          })),
        };
      }
      return pset;
    });

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });
    revalidatePath(`/components/${componentId}`);
    return { message: `${psetTitle} updated successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

export const removePsetAction = async (prevState: any, formData: FormData) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;

  try {
    const component = await fetchSingleComponentAction(componentId);
    const validatedComponent = validateWithZodSchema(
      componentSchema,
      component
    );

    const newPsets: Pset[] = validatedComponent.psets.filter(
      (pset) => pset.title !== psetTitle
    );

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });

    revalidatePath(`/components/${componentId}`);
    return { message: `successfully removed ${psetTitle}` };
  } catch (error) {
    return renderError(error);
  }
};

export const addPsetAction = async (prevState: any, formData: FormData) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;

  try {
    const component = await fetchSingleComponentAction(componentId);
    const validatedComponent = validateWithZodSchema(
      componentSchema,
      component
    );

    const newPsets: Pset[] = [
      ...validatedComponent.psets,
      { title: psetTitle, content: [] },
    ];

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        psets: newPsets,
      },
    });
    revalidatePath(`/components/${componentId}`);
    return {
      message: `Pset ${psetTitle} successfully added to ${validatedComponent.name}.`,
    };
  } catch (error) {
    return renderError(error);
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
