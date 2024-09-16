import type { ServerLoadEvent } from "@sveltejs/kit";
import { redirect } from "sveltekit-flash-message/server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
  if (!event.locals.user) {
    redirect(
      302,
      "/login",
      /*{
        type: "error",
        message: "Vous devez être connecté pour accéder à cette page !",
      },
      event,*/
    );
  }
};
