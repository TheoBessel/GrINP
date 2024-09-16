import type { ServerLoadEvent } from "@sveltejs/kit";

export const load = async (event: ServerLoadEvent) => {
  return {
    user: event.locals.user,
  };
};
