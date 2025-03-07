"use server";

import { prisma } from "@/db";

export type ComponentGeometry = {
  position: number[];
  indices: number[];
};

export const createGeometryAction = async (formData: FormData) => {
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const geometry = formData.get("geometry") as string;
  const parsed = JSON.parse(geometry) as ComponentGeometry;

  try {
    const response = await prisma.componentGeometry.create({
      data: {
        position: parsed.position,
        indices: parsed.indices,
      },
    });

    console.log(response.id);
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
