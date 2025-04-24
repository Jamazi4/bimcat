"use server";

import { prisma } from "@/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getDbUser } from "./globalActions";
import { renderError } from "../utilFunctions";

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
      const isGuest = lib.guests.some((guest) => guest.id === dbUser?.id);

      return {
        ...lib,
        author: authorWithoutClerkId,
        guests: guestsWithoutClerkId,
        isGuest,
        editable,
      };
    });

    return frontEndLibraries;
  } catch (error) {
    console.log(error);
  }
};

export const addComponentToLibraryAction = async (
  componentIds: string[],
  libraryId: string
) => {
  try {
    const dbUser = await getDbUser(true);

    const dbUserComponentIds = dbUser?.Components.map((comp) => comp.id);

    const onlyAuthoredComponents = componentIds.every((selectedId) => {
      return dbUserComponentIds?.some(
        (dbUserCompId) => dbUserCompId === selectedId
      );
    });

    const authoredLibrary = dbUser?.authoredLibraries.filter((lib) => {
      return lib.id === libraryId;
    });

    const allowed = authoredLibrary && onlyAuthoredComponents;

    if (!allowed)
      throw new Error(
        "User not authorized to modify this library or component."
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
      include: { Components: true, guests: true },
    });

    if (!library) throw new Error("Could not fetch library");

    const authorRequesting = library.userId === dbUser?.id;
    const libraryPublic = library.public;
    const userIsGuest = library.guests.some((guest) => guest.id === dbUser?.id);

    if (!authorRequesting && !libraryPublic && !userIsGuest)
      throw new Error("Unauthorized");

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
      data: { public: !curPublic },
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

export const toggleLibraryFavoritesAction = async (libraryId: string) => {
  try {
    const dbUser = await getDbUser();

    if (!dbUser) throw new Error("Unauthorized");

    const currentGuestLibrariesIds = dbUser.guestLibraries.map((lib) => lib.id);

    const isFavorite = currentGuestLibrariesIds.some(
      (curGuestId) => curGuestId === libraryId
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
