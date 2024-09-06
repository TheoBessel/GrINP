import { redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load : PageServerLoad = async (event : ServerLoadEvent) => {
    if (!event.locals.user) {
        throw redirect(302, "/login");
    }
};