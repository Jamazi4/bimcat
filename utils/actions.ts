"use server";

import { prisma } from "@/db";
import {
  validateWithZodSchema,
  geometrySchema,
  Pset,
  geometryArraySchema,
  componentWithGeometrySchema,
  PsetActionsComponentSchema,
} from "./schemas";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { User } from "./types";
import { searchParamsType } from "../components/componentList/ComponentListWrapper";

const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "an error occured...",
  };
};

export const getDbUser = async () => {
  try {
    const { userId } = await auth();

    if (!userId) return;
    const clerkId = userId;
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        // Components: true,
        authoredLibraries: true,
        guestLibraries: true,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("No user in db for this clerkId");
  }
};

const addEditableToComponent = async <T extends { userId: string }>(
  component: T
): Promise<T & { editable: boolean }> => {
  const dbUser = await getDbUser(); //TODO: usually dbUser can already be passsed here
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
    throw new Error("Could not fetch components");
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
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
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

export const mockRemovePsetAction = async (
  prevstate: any,
  formData: FormData
) => {
  return { message: "done lol" };
};

export const removePsetAction = async (prevState: any, formData: FormData) => {
  const componentId = formData.get("componentId") as string;
  const psetTitle = formData.get("psetTitle") as string;

  try {
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
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
    const component = await prisma.component.findUnique({
      where: {
        id: componentId,
      },
      select: {
        psets: true,
        userId: true,
        name: true,
      },
    });

    if (!component) throw new Error("No component with this id");
    const componentWithEditable = await addEditableToComponent(component);

    if (!componentWithEditable.editable)
      throw new Error("User has no rights to edit this component");

    const validatedComponent = validateWithZodSchema(
      PsetActionsComponentSchema,
      componentWithEditable
    );

    if (!component.psets) throw new Error("No psets in component");

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
    });
  } catch (error) {
    return renderError(error);
  }
};

export const deleteComponentAction = async (componentIds: string[]) => {
  try {
    const dbUser = await getDbUser();

    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      include: { geometry: true, User: true },
    });

    const userIds = components.map((component) => component.userId);

    if (!components || !userIds.every((id) => id === dbUser?.id)) {
      throw new Error("Error deleting component(s) or unauthorized");
    }

    const geometryIds = components.map((component) =>
      component.geometry.map((g) => g.id)
    );

    const geometriesToRemove = [];
    for (const geometryId of geometryIds) {
      const geometries = await prisma.componentGeometry.findMany({
        where: { id: { in: geometryId } },
        include: { components: { select: { id: true } } },
      });

      for (const geometry of geometries) {
        if (geometry.components.length === 1) {
          geometriesToRemove.push(geometry.id);
        }
      }
    }
    console.log("fired");

    await prisma.componentGeometry.deleteMany({
      where: { id: { in: geometriesToRemove } },
    });

    await prisma.component.deleteMany({
      where: {
        id: { in: componentIds },
      },
    });

    revalidatePath(`/components/browse`);

    return {
      message: `Successfully removed ${components.length} component${
        components.length > 1 ? "s" : ""
      }.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const toggleComponentPrivateAction = async (componentIds: string[]) => {
  try {
    const dbUser = await getDbUser();

    const components = await prisma.component.findMany({
      where: { id: { in: componentIds } },
      select: {
        User: true,
        public: true,
        name: true,
        userId: true,
        libraries: { select: { id: true, public: true } },
      },
    });

    const userIds = components.map((component) => component.userId);

    if (!components || !userIds.every((id) => id === dbUser?.id)) {
      throw new Error("Error deleting component(s) or unauthorized");
    }

    const curPublics = components.map((component) => component.public);

    const publicComponents = components.filter((component) => component.public);

    let affectedLibraries =
      publicComponents.length > 0
        ? publicComponents.flatMap((component) => {
            return component.libraries.filter((library) => library.public);
          })
        : [];

    const affectedLibrariesUnique = Object.values(
      affectedLibraries.reduce((acc, library) => {
        acc[library.id] = library;
        return acc;
      }, {} as Record<string, (typeof affectedLibraries)[number]>)
    );

    await Promise.all(
      componentIds.map((id, i) => {
        return prisma.component.update({
          where: { id },
          data: {
            public: !curPublics[i],
            libraries: {
              disconnect: affectedLibrariesUnique.map((lib) => ({
                id: lib.id,
              })),
            },
          },
        });
      })
    );

    await Promise.all([
      ...componentIds.map((id, i) =>
        prisma.component.update({
          where: { id },
          data: {
            public: !curPublics[i],
            libraries: {
              disconnect: affectedLibrariesUnique.map((lib) => ({
                id: lib.id,
              })),
            },
          },
        })
      ),
      prisma.library.updateMany({
        where: {
          id: { in: affectedLibrariesUnique.map((lib) => lib.id) },
        },
        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    revalidatePath(`/components/browse`);

    return {
      message: `Successfully toggled private for ${
        components.length
      } component${components.length > 1 ? "s" : ""}.`,
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

    await prisma.library.create({
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

export const fetchAllLibrariesAction = async () => {
  try {
    const dbUser = await getDbUser();
    const libraries = await prisma.library.findMany({
      include: {
        guests: true,
        author: true,
        Components: { select: { id: true } },
      },
      where: {
        OR: [
          { public: true },
          { userId: dbUser?.id },
          { guests: { some: { id: dbUser?.id } } },
        ],
      },
      orderBy: { createdAt: "asc" },
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

export const getUserLibrariesAction = async () => {
  try {
    const dbUser = await getDbUser();
    return dbUser?.authoredLibraries;
  } catch (error) {
    console.log("Could not get user libraries");
  }
};

export const getUserStateLibrariesAction = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return;
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        authoredLibraries: {
          select: {
            id: true,
            name: true,
            public: true,
            Components: { select: { id: true, name: true, public: true } },
          },
        },
      },
    });
    return dbUser;
  } catch (error) {
    renderError(error);
  }
};

export const addComponentToLibraryAction = async (
  componentIds: string[],
  libraryId: string
) => {
  try {
    const dbUser = await getDbUser();

    const allowed = dbUser?.authoredLibraries.filter((lib) => {
      return lib.id === libraryId;
    });

    if (!allowed) throw new Error("User not authorized to modify this library");

    const library = await prisma.library.update({
      where: {
        id: libraryId,
      },
      data: {
        Components: {
          connect: componentIds.map((id) => ({ id: id })),
        },
        updatedAt: new Date(),
      },
    });

    const libraryPublic = library.public;
    if (libraryPublic) {
      const components = await prisma.component.findMany({
        where: { id: { in: componentIds } },
        select: { public: true, id: true },
      });
      const privateComponents = components.filter(
        (component) => !component.public
      );

      if (privateComponents.length > 0) {
        await prisma.component.updateMany({
          where: {
            id: {
              in: privateComponents.map((component) => component.id),
            },
          },
          data: { public: true },
        });
        revalidatePath("/components/browser");
      }
    }

    revalidatePath("/libraries");
    return {
      message: `Successfully added ${componentIds.length} component${
        componentIds.length > 1 ? "s" : ""
      } to ${library.name}.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchLibraryComponents = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { Components: true },
    });

    if (!library) throw new Error("Could not fetch library");

    const frontendComponents = library?.Components.map((component) => {
      return {
        ...component,
        editable: component.userId === dbUser?.id,
      };
    });

    const libraryInfo = {
      libraryName: library?.name,
      desc: library?.description,
    };

    return { libraryInfo, frontendComponents };
  } catch (error) {
    console.log(error);
  }
};

export const deleteLibraryAction = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) throw new Error("Could not fetch library");
    if (!(library.userId === dbUser?.id) || !dbUser)
      throw new Error("Unauthorized");

    await prisma.library.delete({ where: { id: libraryId } });

    revalidatePath("/libraries");

    return {
      message: `Successfully removed ${library.name}`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const libraryTogglePrivateAction = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) throw new Error("Could not fetch library");
    if (!(library.userId === dbUser?.id) || !dbUser)
      throw new Error("Unauthorized");

    const curPublic = library.public;
    await prisma.library.update({
      where: { id: libraryId },
      data: { public: !curPublic },
    });

    revalidatePath("/libraries");

    return {
      message: `Successfully changed ${library.name} to ${
        curPublic ? "private" : "public"
      }.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const removeComponentFromLibraryAction = async (
  componentIds: string[],
  libraryId: string
) => {
  try {
    const dbUser = await getDbUser();
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) throw new Error("Could not fetch library");
    if (!(library.userId === dbUser?.id) || !dbUser)
      throw new Error("Unauthorized");

    await prisma.library.update({
      where: {
        id: libraryId,
      },
      data: {
        updatedAt: new Date(),
        Components: { disconnect: componentIds.map((id) => ({ id: id })) },
      },
    });

    revalidatePath(`/libraries/${libraryId}`);
    return {
      message: `Removed ${componentIds.length} component${
        componentIds.length > 1 ? "s" : ""
      } from ${library.name}`,
    };
  } catch (error) {
    return renderError(error);
  }
};
