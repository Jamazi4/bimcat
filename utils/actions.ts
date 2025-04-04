"use server";

import { prisma } from "@/db";
import {
  validateWithZodSchema,
  geometrySchema,
  componentSchema,
  Pset,
  geometryArraySchema,
  componentWithGeometrySchema,
  Component,
} from "./schemas";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { User } from "./types";
import { searchParamsType } from "@/app/(boards)/components/browse/page";

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "an error occured...",
  };
};

const getAuthUser = async () => {
  const user = await currentUser();
  // if (!user) redirect("/");
  return user;
};

const getDbUser = async () => {
  try {
    const user = await currentUser();

    if (!user) return;
    const clerkId = user.id;
    const dbUser = prisma.user.findUnique({
      where: { clerkId },
      include: { Components: true, Libraries: true },
    });
    return dbUser;
  } catch (error) {
    console.log("No user in db for this clerkId");
  }
};

const addEditableToComponent = async (component: Partial<Component>) => {
  const dbUser = await getDbUser();
  const dbUserId = dbUser?.id;

  const componentWithEditable = {
    ...component,
    editable: dbUserId === component.userId,
  };

  return componentWithEditable;
};

export const createComponentAction = async (
  prevState: any,
  formData: FormData
) => {
  const name = formData.get("name") as string;
  const geometry = formData.get("geometry") as string;
  const psets = formData.get("psets") as string;
  const parsedGeometry = validateWithZodSchema(
    geometryArraySchema,
    JSON.parse(geometry)
  );
  const parsedPsets = JSON.parse(psets);

  try {
    const dbUser = await getDbUser();
    const author = `${dbUser?.firstName} ${dbUser?.secondName}`;

    const response = await prisma.component.create({
      data: {
        name,
        psets: parsedPsets,
        geometry: {
          create: parsedGeometry,
        },
        userId: dbUser?.id,
        author,
      },
    });
    revalidatePath(`/components`);
    return { message: `Component ${name} created successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchSingleComponentAction = async (id: string) => {
  const component = await prisma.component.findUnique({
    where: { id: id },
    include: {
      geometry: true,
    },
  });

  return validateWithZodSchema(componentWithGeometrySchema, component);
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

export const fetchAllComponents = async (params: searchParamsType) => {
  const { myComponents, search } = params;

  try {
    const dbUser = await getDbUser();
    const dbUserId = dbUser?.id;

    const whereCondition: any = {};

    if (!dbUserId) {
      whereCondition.public = true;
    } else if (myComponents) {
      whereCondition.userId = dbUserId;
    } else {
      whereCondition.OR = [{ public: true }, { userId: dbUserId }];
    }

    if (search) {
      whereCondition.AND = [
        ...(whereCondition.AND || []),
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const components = await prisma.component.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        author: true,
        userId: true,
        public: true,
      },
    });

    const componentsWithEditable = components.map((component) => {
      return {
        ...component,
        editable: component.userId === dbUserId,
      };
    });

    return componentsWithEditable;
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

    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      componentSchema,
      componentWithEditable
    );

    if (!validatedComponent.psets) throw new Error("No psets in component");

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

    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      componentSchema,
      componentWithEditable
    );

    if (!validatedComponent.psets) throw new Error("No psets in component");

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

    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      componentSchema,
      componentWithEditable
    );

    if (!validatedComponent.psets) throw new Error("No psets in component");

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

export const createUserAciton = async (user: Partial<User>) => {
  if (!user.clerkId || !user.email || !user.firstName || !user.secondName)
    return;

  try {
    await prisma.user.create({
      data: {
        clerkId: user.clerkId,
        firstName: user.firstName,
        secondName: user.secondName,
      },
      include: {
        Libraries: {
          include: {
            components: true,
          },
        },
        Components: true,
      },
    });
  } catch (error) {
    return renderError(error);
  }
};

export const deleteComponentAction = async (componentId: string) => {
  try {
    const dbUser = await getDbUser();
    const allowed = dbUser?.Components.map((component) => {
      return component.id === componentId;
    });

    if (!allowed)
      throw new Error("Error deleting component, user or wrong component");

    await prisma.component.delete({
      where: {
        id: componentId,
      },
    });

    revalidatePath(`/components`);

    return { message: `Component ${componentId} deleted successfully!` };
  } catch (error) {
    return renderError(error);
  }
};

// export const createLibrary = async () => {
//   const user = await getAuthUser();

//   const dbUser = await prisma.user.findUnique({
//     where: {
//       clerkId: user.id,
//     },
//   });

//   const library = await prisma.library.create({

//   })
// };
