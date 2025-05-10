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
  const composite = formData.get("createComposite") === "on";
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error("You must be logged in to create a library");

    const data = {
      name: libraryName,
      description: libraryDesc,
      userId: dbUser.id,
      public: !makePrivate,
      updatedAt: new Date(),
    };

    if (composite) {
      await prisma.compositeLibrary.create({ data });
    } else {
      await prisma.library.create({ data });
    }

    revalidatePath("/libraries");
    return {
      message: `${composite ? "Composite " : ""}Library ${libraryName} succesfully created!`,
    };
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
    searchContent: searchContent,
    myLibraries,
    favorites,
    composite,
  } = params;
  try {
    const dbUser = await getDbUser();
    const dbUserId = dbUser?.id;

    const whereCondition:
      | Prisma.LibraryWhereInput
      | Prisma.CompositeLibraryWhereInput = {};
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

    const libraryAndConditions: Prisma.LibraryWhereInput[] = [];
    const compositeAndConditions: Prisma.CompositeLibraryWhereInput[] = [];

    if (searchName) {
      const query = { name: { contains: searchName, mode: "insensitive" } };
      libraryAndConditions.push(query as Prisma.LibraryWhereInput);
      compositeAndConditions.push(query as Prisma.CompositeLibraryWhereInput);
    }

    if (searchDescription) {
      const query = {
        description: { contains: searchDescription, mode: "insensitive" },
      };
      libraryAndConditions.push(query as Prisma.LibraryWhereInput);
      compositeAndConditions.push(query as Prisma.CompositeLibraryWhereInput);
    }

    if (searchAuthor) {
      const query = {
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
      };
      libraryAndConditions.push(query as Prisma.LibraryWhereInput);
      compositeAndConditions.push(query as Prisma.CompositeLibraryWhereInput);
    }

    if (searchContent) {
      compositeAndConditions.push({
        Libraries: {
          some: { name: { contains: searchContent, mode: "insensitive" } },
        },
      });
      libraryAndConditions.push({
        Components: {
          some: { name: { contains: searchContent, mode: "insensitive" } },
        },
      });
    }

    if (libraryAndConditions.length > 0) {
      whereCondition.AND = libraryAndConditions;
    }

    const libraryPayload = {
      guests: { select: { id: true, firstName: true, secondName: true } },
      author: { select: { id: true, firstName: true, secondName: true } },
      Components: { select: { id: true } },
    };

    let libraries: Prisma.LibraryGetPayload<{
      include: typeof libraryPayload;
    }>[] = [];

    if (!composite) {
      libraries = await prisma.library.findMany({
        include: libraryPayload,
        where: whereCondition as Prisma.LibraryWhereInput,
        orderBy: { updatedAt: "asc" },
      });
    }
    whereCondition.AND = [];

    if (compositeAndConditions.length > 0) {
      whereCondition.AND = compositeAndConditions;
    }

    const compositeLibraries = await prisma.compositeLibrary.findMany({
      include: {
        guests: { select: { id: true, firstName: true, secondName: true } },
        author: { select: { id: true, firstName: true, secondName: true } },
        Libraries: { select: { id: true } },
      },
      where: whereCondition as Prisma.CompositeLibraryWhereInput,
      orderBy: { updatedAt: "asc" },
    });

    const frontEndLibraries = [...compositeLibraries, ...libraries].map(
      (library) => {
        const isEditable = library.userId === dbUser?.id;
        const isGuest = library.guests.some((guest) => guest.id === dbUser?.id);
        const isComposite = "Libraries" in library;
        const numElements = isComposite
          ? library.Libraries.length
          : library.Components.length;
        return {
          id: library.id,
          name: library.name,
          description: library.description,
          author: `${library.author.firstName} ${library.author.secondName}`,
          createdAt: library.createdAt.toISOString(),
          updatedAt: library.updatedAt.toISOString(),
          numElements: numElements,
          numGuests: library.guests.length,
          editable: isEditable,
          publicFlag: library.public,
          isGuest,
          isComposite,
        };
      },
    );

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

export const deleteLibraryAction = async (
  libraryId: string,
  isComposite: boolean,
) => {
  try {
    const dbUser = await getDbUser();
    let library: { name?: string; userId?: string } | null = null;
    if (isComposite) {
      library = await prisma.compositeLibrary.findUnique({
        where: { id: libraryId },
        select: { name: true, userId: true },
      });
    } else {
      library = await prisma.library.findUnique({
        where: { id: libraryId },
        select: { name: true, userId: true },
      });
    }

    if (!library) throw new Error("Could not fetch library");
    if (library.userId !== dbUser?.id || !dbUser)
      throw new Error("Unauthorized");

    if (isComposite) {
      await prisma.compositeLibrary.delete({ where: { id: libraryId } });
    } else {
      await prisma.library.delete({ where: { id: libraryId } });
    }

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

    if (library.userId !== dbUser?.id || !dbUser)
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

export const toggleLibraryFavoritesAction = async (
  libraryId: string,
  isComposite: boolean,
) => {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) throw new Error("Unauthorized");

    let currentGuestLibrariesIds: string[] = [];
    if (isComposite) {
      currentGuestLibrariesIds = dbUser.guestCompositeLibraries.map(
        (lib) => lib.id,
      );
    } else {
      currentGuestLibrariesIds = dbUser.guestLibraries.map((lib) => lib.id);
    }

    const isAuthor = dbUser.authoredLibraries.some(
      (lib) => lib.id === libraryId,
    );

    if (isAuthor) throw new Error("Can not add your own library to favorites");

    const isFavorite = currentGuestLibrariesIds.some(
      (curGuestId) => curGuestId === libraryId,
    );

    const updateData = isComposite
      ? {
          guestCompositeLibraries: {
            [isFavorite ? "disconnect" : "connect"]: { id: libraryId },
          },
        }
      : {
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
  libraryId: string,
  newName: string,
) => {
  try {
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
    throw error;
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

export const editLibraryDescriptionAction = async (
  libraryId: string,
  newDescription: string,
) => {
  try {
    const dbUser = await getDbUser();
    const authorized = dbUser?.authoredLibraries.some(
      (lib) => lib.id === libraryId,
    );

    if (!authorized) throw new Error("Unauthorized");

    const library = await prisma.library.update({
      where: { id: libraryId },
      data: { description: newDescription },
    });
    revalidatePath(`/libraries/${libraryId}`);
    return { message: `Description for ${library.name} succesfully changed.` };
  } catch (error) {
    throw error;
  }
};

export const fetchCompositeLibraryAction = async (
  compositeLibraryId: string,
) => {
  try {
    const dbUser = await getDbUser();

    const isAuthor = dbUser?.authoredCompositeLibraries.some(
      (lib) => lib.id === compositeLibraryId,
    );
    const isGuest = dbUser?.guestCompositeLibraries.some(
      (lib) => lib.id === compositeLibraryId,
    );

    const isPublic = await prisma.compositeLibrary.findUnique({
      where: { id: compositeLibraryId },
      select: { public: true },
    });

    const authorized = isAuthor || isGuest || isPublic?.public;

    if (!authorized) throw new Error("Unauthorized");

    const compositeLibrary = await prisma.compositeLibrary.findUnique({
      where: { id: compositeLibraryId },
      include: { Libraries: { include: { Components: true } } },
    });
    return compositeLibrary;
  } catch (error) {
    throw error;
  }
};

export const mergeLibraryAction = async (
  compositeLibraryId: string,
  libraryId: string,
) => {
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error("You must be logged in to create a library");

    const isCompositeAuthor = dbUser.authoredCompositeLibraries.some(
      (lib) => lib.id === compositeLibraryId,
    );

    let libraryName = "";
    const canAccessGuest = dbUser.guestLibraries.some((lib) => {
      if (lib.id === libraryId) {
        libraryName = lib.name;
        return true;
      }
      return false;
    });

    const canAccessOwn = dbUser.authoredLibraries.some((lib) => {
      if (lib.id === libraryId) {
        libraryName = lib.name;
        return true;
      }
      return false;
    });

    const canAccess = canAccessGuest || canAccessOwn;

    if (!isCompositeAuthor || !canAccess) throw new Error("Unauthorized.");

    const compositeLibrary = await prisma.compositeLibrary.update({
      where: { id: compositeLibraryId },
      data: { Libraries: { connect: { id: libraryId } } },
    });
    return {
      message: `Library ${libraryName} succesfully merged into ${compositeLibrary.name}`,
    };
  } catch (error) {
    throw error;
  }
};
