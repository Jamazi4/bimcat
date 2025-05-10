"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/db";

export const getDbUser = async (includeComponents?: boolean) => {
  try {
    const { userId } = await auth();

    if (!userId) return;
    const clerkId = userId;
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        Components: includeComponents,
        authoredLibraries: true,
        guestLibraries: true,
        guestCompositeLibraries: true,
        authoredCompositeLibraries: true,
      },
    });
    return dbUser;
  } catch (error) {
    console.log(error);
  }
};
