"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/db";

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
