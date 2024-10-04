import { lucia } from "@/server/lucia";
import { redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load : PageServerLoad = async (event : ServerLoadEvent) => {
    if (event.locals.session) {
        await lucia.invalidateSession(event.locals.session.id);
        
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
        });
    }

    event.cookies.delete('oauthState', { path: '.' });
    event.cookies.delete('oauthCodeVerifier', { path: '.' });
    
    redirect(302, "/");
};