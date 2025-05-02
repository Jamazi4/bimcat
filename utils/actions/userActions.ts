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
      },
    });
    if (!dbUser) return;

    const { authoredLibraries } = dbUser;
    const frontendLibraries = authoredLibraries.map((lib) => {
      return {
        id: lib.id,
        name: lib.name,
        isPublic: lib.public,
        isShared: !!lib.sharedId,
        isEditable: userId === lib.userId,
        components: lib.Components,
      };
    });
    const frontendDbUser = { ...dbUser, authoredLibraries: frontendLibraries };

    return frontendDbUser;
  } catch (error) {
    renderError(error);
  }
};

export const dleteUserAction = async (clerkId: string) => {
  try {
    console.log("Hellodelete");
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

      await tx.library.deleteMany({
        where: { userId },
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

      await tx.component.deleteMany({
        where: { userId },
      });

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
