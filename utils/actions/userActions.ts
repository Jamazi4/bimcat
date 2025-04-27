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

    const { authoredLibraries, ...rest } = dbUser;
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
