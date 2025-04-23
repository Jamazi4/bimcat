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
