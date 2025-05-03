"use server";

import { prisma } from "@/db";
import { revalidatePath } from "next/cache";
import { getDbUser } from "./globalActions";
import { renderError } from "../utilFunctions";
import { componentWithGeometrySchema, validateWithZodSchema } from "../schemas";
import {
  LibrariesSearchParamsType,
  LibraryInfo,
  LibraryErrors,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { Prisma } from "@prisma/client";

export const createLibraryAction = async (
  _prevState: unknown,
  formData: FormData,
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

export const fetchAllLibrariesAction = async (
  params: LibrariesSearchParamsType,
) => {
  const {
    searchName,
    searchDescription,
    searchAuthor,
    searchComponents,
    myLibraries,
    favorites,
  } = params;
  try {
    const dbUser = await getDbUser();
    const dbUserId = dbUser?.id;

    const whereCondition: Prisma.LibraryWhereInput = {};
    if (!dbUserId) {
      whereCondition.public = true;
    } else if (myLibraries) {
      whereCondition.userId = dbUserId;
    } else if (favorites) {
      whereCondition.guests = { some: { id: dbUser?.id } };
    } else {
      whereCondition.OR = [
        { public: true },
        { userId: dbUserId },
        { guests: { some: { id: dbUserId } } },
      ];
    }

    const andConditions: Prisma.LibraryWhereInput[] = [];

    if (searchName) {
      andConditions.push({
        name: { contains: searchName, mode: "insensitive" },
      });
    }
    if (searchDescription) {
      andConditions.push({
        description: { contains: searchName, mode: "insensitive" },
      });
    }
    if (searchAuthor) {
      andConditions.push({
        OR: [
          {
            author: {
              firstName: { contains: searchAuthor, mode: "insensitive" },
            },
          },
          {
            author: {
              secondName: { contains: searchAuthor, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (searchComponents) {
      andConditions.push({
        Components: {
          some: { name: { contains: searchComponents, mode: "insensitive" } },
        },
      });
    }

    if (andConditions.length > 0) {
      whereCondition.AND = andConditions;
    }

    const libraries = await prisma.library.findMany({
      include: {
        guests: { select: { id: true, firstName: true, secondName: true } },
        author: { select: { id: true, firstName: true, secondName: true } },
        Components: { select: { id: true } },
      },
      where: whereCondition,
      orderBy: { createdAt: "asc" },
    });

    const frontEndLibraries = libraries.map((library) => {
      const isEditable = library.userId === dbUser?.id;
      const isGuest = library.guests.some((guest) => guest.id === dbUser?.id);

      return {
        id: library.id,
        name: library.name,
        description: library.description,
        author: `${library.author.firstName} ${library.author.secondName}`,
        createdAt: library.createdAt.toISOString(),
        updatedAt: library.updatedAt.toISOString(),
        numComponents: library.Components.length,
        numGuests: library.guests.length,
        editable: isEditable,
        publicFlag: library.public,
        isGuest,
      };
    });

    return frontEndLibraries;
  } catch (error) {
    console.log(error);
  }
};

export const addComponentToLibraryAction = async (
  componentIds: string[],
  libraryId: string,
) => {
  try {
    const dbUser = await getDbUser(true);

    const dbUserComponentIds = dbUser?.Components.map((comp) => comp.id);

    const onlyAuthoredComponents = componentIds.every((selectedId) => {
      return dbUserComponentIds?.some(
        (dbUserCompId) => dbUserCompId === selectedId,
      );
    });

    const authoredLibrary = dbUser?.authoredLibraries.filter((lib) => {
      return lib.id === libraryId;
    });

    const allowed = authoredLibrary && onlyAuthoredComponents;

    if (!allowed)
      throw new Error(
        "User not authorized to modify this library or component.",
      );

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
        (component) => !component.public,
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
      include: { Components: true, guests: true },
    });

    if (!library) throw new Error("Could not fetch library");

    let hasRights = false;
    if (dbUser) {
      hasRights = authReadLibrary(dbUser, libraryId);
    }

    const authorized = hasRights || library.public;

    if (!authorized) throw new Error("Unauthorized");

    const frontendGuests = library.guests.map((guest) => {
      return { name: `${guest.firstName} ${guest.secondName}`, id: guest.id };
    });
    const frontendComponents = library?.Components.map((component) => {
      return {
        id: component.id,
        name: component.name,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString(),
        author: component.author,
        public: component.public,
        editable: component.userId === dbUser?.id,
      };
    });

    const libraryEditable = library.userId === dbUser?.id;

    const libraryInfo: LibraryInfo = {
      empty: library.Components.length === 0,
      name: library?.name,
      desc: library?.description,
      isEditable: libraryEditable,
      sharedId: library.sharedId || "",
      isPublic: library.public,
      guests: frontendGuests,
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
      include: {
        Components: { select: { id: true, userId: true, public: true } },
      },
    });

    if (!library) throw new Error("Could not fetch library");

    if (!(library.userId === dbUser?.id) || !dbUser)
      throw new Error("Unauthorized");

    const curPublic = library.public;

    const privateComponents = library.Components.filter((component) => {
      const privateFlag = component.public === false;
      const authorized = component.userId === dbUser.id;
      return privateFlag && authorized;
    });

    if (privateComponents.length > 0 && !curPublic) {
      await prisma.component.updateMany({
        where: { id: { in: privateComponents.map((comp) => comp.id) } },
        data: { public: true },
      });
    }

    const displayWarning = !curPublic && privateComponents.length > 0;

    await prisma.library.update({
      where: { id: libraryId },
      data: { public: !curPublic, sharedId: null },
    });

    revalidatePath("/libraries");

    const message = `Successfully changed ${library.name} to ${
      curPublic ? "private" : "public"
    }${
      displayWarning
        ? ` and changed ${privateComponents.length} component${
            privateComponents.length > 1 ? "s" : ""
          } to public`
        : ""
    }.`;

    return { message: message };
  } catch (error) {
    return renderError(error);
  }
};

export const removeComponentFromLibraryAction = async (
  componentIds: string[],
  libraryId: string,
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

export const toggleLibraryFavoritesAction = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) throw new Error("Unauthorized");
    const currentGuestLibrariesIds = dbUser.guestLibraries.map((lib) => lib.id);

    const isFavorite = currentGuestLibrariesIds.some(
      (curGuestId) => curGuestId === libraryId,
    );
    const updateData = {
      guestLibraries: {
        [isFavorite ? "disconnect" : "connect"]: { id: libraryId },
      },
    };

    await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
    });

    revalidatePath("/libraries");
    return {
      message: `Library ${isFavorite ? "removed from" : "added to"} favorites.`,
    };
  } catch (error) {
    return renderError(error);
  }
};

export const renameLibraryAction = async (
  _prevState: unknown,
  formData: FormData,
) => {
  try {
    const newName = formData.get("newName") as string;
    const libraryId = formData.get("id") as string;

    console.log(libraryId);
    const library = await prisma.library.findUnique({
      where: {
        id: libraryId,
      },
      select: { id: true, name: true, userId: true },
    });

    if (!library) throw new Error("Library not found.");

    const oldName = library.name;

    const dbUser = await getDbUser();
    const authoredLibrariesIds = dbUser?.authoredLibraries.map((lib) => lib.id);

    const authorized = authoredLibrariesIds?.some((id) => id === libraryId);

    if (!authorized) throw new Error("Unauthorized.");

    await prisma.library.update({
      where: { id: libraryId },
      data: { name: newName, updatedAt: new Date() },
    });

    revalidatePath(`/libraries`);
    revalidatePath(`/libraries/${libraryId}`);

    return { message: `Succesfully renamed ${oldName} to ${newName}` };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchLibraryDownloadAction = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { Components: { include: { geometry: true } } },
    });
    if (!library) throw new Error("Could not find library");

    let hasRights = false;
    if (dbUser) {
      hasRights = authReadLibrary(dbUser, libraryId);
    }

    const authorized = hasRights || library.public;

    if (!authorized) throw new Error("Unauthorized");

    const validatedComponents = library.Components.map((component) => {
      const componentWithEditable = { ...component, editable: true };
      //just to shut zod up                         ^^^^^^^^

      return validateWithZodSchema(
        componentWithGeometrySchema,
        componentWithEditable,
      );
    });

    return { libraryName: library.name, validatedComponents };
  } catch (error) {
    console.log(error);
  }
};

const authReadLibrary = <
  T extends {
    authoredLibraries: { id: string }[];
    guestLibraries: { id: string }[];
  },
>(
  dbUser: T,
  libraryId: string,
) => {
  const authoredLibrariesIds =
    dbUser.authoredLibraries.map((lib) => lib.id) || [];
  const guestLibrariesIds = dbUser.guestLibraries.map((lib) => lib.id) || [];
  const allUserLibraryIds = [...authoredLibrariesIds, ...guestLibrariesIds];
  const hasRights = allUserLibraryIds.some((id) => id === libraryId);
  return hasRights;
};

export const fetchSingleLibraryComponentAction = async (
  libraryId: string,
  componentId: string,
) => {
  try {
    const dbUser = await getDbUser();

    let hasRights = false;
    if (dbUser) {
      hasRights = authReadLibrary(dbUser, libraryId);
    }

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { Components: { select: { id: true } } },
    });
    if (!library) throw new Error("Could not find library");

    const authorized = hasRights || library.public;

    if (!authorized) throw new Error("Unauthorized");

    const componentInLibrary = library.Components.some(
      (comp) => comp.id === componentId,
    );

    if (!componentInLibrary) throw new Error("Component not in library");

    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: { geometry: true },
    });
    if (!component) throw new Error("Could not find component");

    const componentWithEditable = {
      ...component,
      editable: component?.userId === dbUser?.id,
    };

    const validatedComponent = validateWithZodSchema(
      componentWithGeometrySchema,
      componentWithEditable,
    );

    return { libraryName: library.name, component: validatedComponent };
  } catch (error) {
    console.log(error);
  }
};

const authShareActions = async (libraryId: string) => {
  const dbUser = await getDbUser();

  if (!dbUser) throw new Error("Could not find user");

  const targetLibrary = dbUser.authoredLibraries.find(
    (lib) => lib.id === libraryId,
  );

  if (!targetLibrary) throw new Error("Could not find library.");
  const alreadyShared = targetLibrary.sharedId !== null;

  const authorized = targetLibrary.userId === dbUser.id;

  if (!authorized) throw new Error("Unauthorized.");

  return { authorized, alreadyShared };
};

export const shareLibraryAction = async (libraryId: string) => {
  try {
    const { alreadyShared } = await authShareActions(libraryId);

    if (alreadyShared) throw new Error("Already shared.");
    const sharedId = uuidv4();

    await prisma.library.update({
      where: { id: libraryId },
      data: { sharedId },
    });

    return sharedId;
  } catch (error) {
    throw error;
  }
};

export const disableShareLibraryAction = async (libraryId: string) => {
  try {
    const { alreadyShared } = await authShareActions(libraryId);

    if (!alreadyShared) throw new Error(LibraryErrors.NotShared);

    const targetLibrary = await prisma.library.update({
      where: { id: libraryId },
      data: { sharedId: null },
    });
    return { message: `Share link for ${targetLibrary.name} disabled.` };
  } catch (error) {
    throw error;
  }
};

export const giveAccessToLibraryAction = async (sharedId: string) => {
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error(LibraryErrors.UserNotFound);

    const isYourOwn = dbUser.authoredLibraries.some(
      (lib) => lib.sharedId === sharedId,
    );

    if (isYourOwn) throw new Error(LibraryErrors.OwnLibrary);

    const sharedLibraryId = await prisma.library.findFirst({
      where: { sharedId },
      select: { id: true },
    });

    if (!sharedLibraryId) throw new Error(LibraryErrors.NotShared);

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { guestLibraries: { connect: { id: sharedLibraryId.id } } },
    });

    return sharedLibraryId.id;
  } catch (error) {
    throw error;
  }
};

export const removeGuestAction = async (libraryId: string, userId: string) => {
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error(LibraryErrors.UserNotFound);

    const hasRights = dbUser.authoredLibraries.some(
      (lib) => lib.userId === dbUser.id,
    );

    if (!hasRights) throw new Error(LibraryErrors.Unauthorized);
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { guests: true },
    });

    if (!library) throw new Error(LibraryErrors.LibraryNotFound);

    const userIsGuest = library.guests.some((guest) => guest.id === userId);
    if (!userIsGuest) throw new Error(LibraryErrors.UserNotFound);

    await prisma.library.update({
      where: { id: libraryId },
      data: { guests: { disconnect: { id: userId } } },
    });
    revalidatePath(`/libraries/${libraryId}`);
  } catch (error) {
    return renderError(error);
  }
};
