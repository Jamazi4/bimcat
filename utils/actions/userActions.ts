"use server";

import { User } from "@prisma/client";
import { prisma } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { renderError } from "../utilFunctions";

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

export const getUserStateLibrariesAction = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        authoredCompositeLibraries: {
          select: {
            id: true,
            name: true,
            public: true,
            sharedId: true,
            Libraries: { select: { id: true, name: true, public: true } },
            userId: true,
          },
        },
        authoredLibraries: {
          select: {
            id: true,
            name: true,
            public: true,
            sharedId: true,
            Components: { select: { id: true, name: true, public: true } },
            userId: true,
          },
        },
        guestLibraries: {
          select: {
            id: true,
            name: true,
            public: true,
            sharedId: true,
            Components: { select: { id: true, name: true, public: true } },
            userId: true,
          },
        },
      },
    });

    if (!dbUser) return;
    const { authoredLibraries, authoredCompositeLibraries, guestLibraries } =
      dbUser;

    const frontendLibraries = [
      ...authoredLibraries,
      ...authoredCompositeLibraries,
      ...guestLibraries,
    ].map((lib) => {
      const isComposite = "Libraries" in lib;
      const isFavorite = guestLibraries.some((glib) => glib.id === lib.id);
      return {
        id: lib.id,
        name: lib.name,
        isPublic: lib.public,
        isShared: !!lib.sharedId,
        isEditable: dbUser.id === lib.userId,
        isComposite,
        isFavorite,
        content: isComposite ? lib.Libraries : lib.Components,
      };
    });
    const frontendDbUser = { ...dbUser, frontendLibraries };

    return frontendDbUser;
  } catch (error) {
    renderError(error);
  }
};

export const dleteUserAction = async (clerkId: string) => {
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!user) throw new Error("User with this clerkId not found");

      const userId = user.id;
      const userComponentGeometries = await tx.component.findMany({
        where: { userId },
        select: { geometry: { select: { id: true } } },
      });

      const geometryIdsToCheck = new Set<string>();
      userComponentGeometries.forEach((component) => {
        component.geometry.forEach((geom) => geometryIdsToCheck.add(geom.id));
      });

      const libraries = await tx.library.findMany({
        where: {
          guests: {
            some: {
              id: userId,
            },
          },
        },
        select: { id: true },
      });

      for (const lib of libraries) {
        await tx.library.update({
          where: { id: lib.id },
          data: {
            guests: {
              disconnect: [{ id: userId }],
            },
          },
        });
      }

      for (const geomId of geometryIdsToCheck) {
        const count = await tx.component.count({
          where: {
            geometry: {
              some: {
                id: geomId,
              },
            },
          },
        });
        if (count === 0) {
          await tx.componentGeometry.delete({
            where: { id: geomId },
          });
        }
      }
      await tx.user.delete({ where: { id: userId } });
    });
  } catch (error) {
    renderError(error);
  }
};
