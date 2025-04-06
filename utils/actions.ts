"use server";

import { prisma } from "@/db";
import {
  validateWithZodSchema,
  geometrySchema,
  componentSchema,
  Pset,
  geometryArraySchema,
  componentWithGeometrySchema,
  ComponentSchemaType,
  ComponentWithGeometrySchemaType,
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

const getDbUser = async () => {
  try {
    const user = await currentUser();

    if (!user) return;
    const clerkId = user.id;
    const dbUser = prisma.user.findUnique({
      where: { clerkId },
      include: {
        Components: true,
        authoredLibraries: true,
        guestLibraries: true,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("No user in db for this clerkId");
  }
};

const addEditableToComponent = async (
  component: ComponentSchemaType | ComponentWithGeometrySchemaType
) => {
  const dbUser = await getDbUser();
  const dbUserId = dbUser?.id;

  if (!component.userId)
    throw new Error("Could not find the owner of the component");

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
  const makePrivate = formData.get("makePrivate") === "on";

  const parsedGeometry = validateWithZodSchema(
    geometryArraySchema,
    JSON.parse(geometry)
  );
  const parsedPsets = JSON.parse(psets);

  try {
    const dbUser = await getDbUser();
    const author = `${dbUser?.firstName} ${dbUser?.secondName}`;

    await prisma.component.create({
      data: {
        name,
        psets: parsedPsets,
        public: !makePrivate,
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
  try {
    const dbUser = await getDbUser();

    const component = await prisma.component.findUnique({
      where: { id: id },
      include: {
        geometry: true,
      },
    });

    if (!component) throw new Error("No component with this id");

    const componentWithEditable = {
      ...component,
      editable: component.userId === dbUser?.id,
    };

    const validatedComponent = validateWithZodSchema(
      componentWithGeometrySchema,
      componentWithEditable
    );

    return validatedComponent;
  } catch (error) {
    renderError(error);
  }
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

    if (!component) throw new Error("No component with this id");
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

    if (!component) throw new Error("No component with this id");
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

    if (!component) throw new Error("No component with this id");
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
  if (!user.clerkId || !user.firstName || !user.secondName) return;

  try {
    await prisma.user.create({
      data: {
        clerkId: user.clerkId,
        firstName: user.firstName,
        secondName: user.secondName,
      },
      include: {
        authoredLibraries: {
          include: {
            Components: true,
          },
        },
        Components: true,
        guestLibraries: {
          include: {
            Components: true,
          },
        },
      },
    });
  } catch (error) {
    return renderError(error);
  }
};

export const deleteComponentAction = async (componentId: string) => {
  try {
    const dbUser = await getDbUser();

    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: { geometry: true, User: true },
    });

    if (!component || component.User?.id !== dbUser?.id) {
      throw new Error("Error deleting component or unauthorized");
    }

    const geometryIds = component.geometry.map((g) => g.id);

    await prisma.component.delete({
      where: {
        id: componentId,
      },
    });

    for (const geometryId of geometryIds) {
      const count = await prisma.componentGeometry.findUnique({
        where: { id: geometryId },
        include: { components: true },
      });

      if (count?.components.length === 0) {
        await prisma.componentGeometry.delete({
          where: { id: geometryId },
        });
      }
    }

    revalidatePath(`/components/browse`);

    return { message: `${component.name} succesfully deleted.` };
  } catch (error) {
    return renderError(error);
  }
};

export const toggleComponentPrivateAction = async (componentId: string) => {
  try {
    const dbUser = await getDbUser();
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: { User: true },
    });

    if (!component || component.User?.id !== dbUser?.id) {
      throw new Error("Error changing private attribute or unauthorized");
    }

    const curPublic = component.public;

    await prisma.component.update({
      where: {
        id: componentId,
      },
      data: {
        public: !curPublic,
      },
    });

    revalidatePath(`/components/browse`);

    return {
      message: `${component.name} is now ${!curPublic ? "public" : "private"}.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const createLibraryAction = async (
  prevState: any,
  formData: FormData
) => {
  const libraryName = formData.get("name") as string;
  const libraryDesc = formData.get("description") as string;
  const makePrivate = formData.get("makePrivate") === "on";
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error("You must be logged in to create a library");

    const library = await prisma.library.create({
      data: {
        name: libraryName,
        description: libraryDesc,
        userId: dbUser.id,
        public: !makePrivate,
      },
    });
    revalidatePath("/libraries");
    return { message: `Library ${libraryName} succesfully created!` };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAllLibraries = async () => {
  try {
    const dbUser = await getDbUser();
    const libraries = await prisma.library.findMany({
      include: {
        guests: true,
        author: true,
        Components: true,
      },
      where: {
        OR: [{ public: true }, { userId: dbUser?.id }],
      },
    });

    const frontEndLibraries = libraries.map((lib) => {
      const { clerkId, ...authorWithoutClerkId } = lib.author;

      const guestsWithoutClerkId = lib.guests.map((guest) => {
        const { clerkId, ...restOfGuest } = guest;
        return restOfGuest;
      });

      const editable = lib.userId === dbUser?.id;

      return {
        ...lib,
        author: authorWithoutClerkId,
        guests: guestsWithoutClerkId,
        editable,
      };
    });

    return frontEndLibraries;
  } catch (error) {
    console.log(error);
  }
};
