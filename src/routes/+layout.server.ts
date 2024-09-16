import prisma from "@/server/prisma";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { loadFlash } from "sveltekit-flash-message/server";

export const load = loadFlash(async (event: ServerLoadEvent) => {
  const user = event.locals.user;

  try {
    if (user) {
      const prisma_user = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      const root = prisma_user?.root;
      const instructor = prisma_user?.instructor;

      return {
        user: event.locals.user,
        root: root,
        instructor: instructor
      };
    } else {
      return {
        user: null,
        root: false,
        instructor: false
      };
    }
  } catch (error) {
    return {
      user: null,
      root: false,
      instructor: false
    };
  }
});
