import prisma from "@/server/prisma";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { redirect } from "sveltekit-flash-message/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
  const user = event.locals.user;

  // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!user) {
    throw redirect(
      302,
      "/login",
      {
        type: "error",
        message: "Vous devez être connecté pour accéder à cette page !",
      },
      event,
    );
  } else {
    try {
      const root = await prisma.user
        .findUnique({
          where: {
            id: user.id,
          },
        })
        .then((u) => {
          if (u) {
            return u.root;
          } else {
            return false;
          }
        });
      if (!root) {
        throw redirect(
          302,
          "/login",
          {
            type: "error",
            message:
              "Vous devez être administrateur pour accéder à cette page !",
          },
          event,
        );
      }
    } catch (error) {
      throw redirect(
        302,
        "/login",
        {
          type: "error",
          message: "Vous devez être administrateur pour accéder à cette page !",
        },
        event,
      );
    }
  }

  const users = await prisma.user.findMany();

  return {
    users: users,
  };
};
