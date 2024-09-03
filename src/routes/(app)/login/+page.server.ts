import { dev } from "$app/environment";
import { loginScheme } from "$lib";
import { churros, generateState, identity, login } from "@/server/oauth.js";
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";

const maxCookiesAge = 5;

export const load: PageServerLoad = async ( page ) => {
	const code = page.url.searchParams.get('code');
    const state = page.url.searchParams.get('state');
    const oauthState = page.cookies.get("oauthState") ?? null;

	if (!code || !state || !oauthState || state !== oauthState) {
        if (state !== oauthState) {
            // Error 400: OAuth state mismatch
            throw error(400, "OAuth state mismatch");
        }
    } else {
        try {
            let token = page.cookies.get("oauthToken") ?? null;
            if(!token) {
                token = await login(code, state);
                page.cookies.set("oauthToken", token, {
                    path: "/",
                    secure: !dev,
                    httpOnly: true,
                    maxAge: 60 * maxCookiesAge,
                    sameSite: "lax"
                });
            }
            const user = await identity(token);
            console.log(user);
        } catch (e) {
            if (e instanceof Error) {
                throw error(500, e.message);
            }
        }
	}

    return {
        form: await superValidate(zod(loginScheme)),
    };
};

export const actions: Actions = {
    manual: async (event) => {
        const form = await superValidate(event, zod(loginScheme));
        if (!form.valid) {
            return fail(400, { form });
        } else {
            throw redirect(302, '/');
        }
        //return { form };
    },

	oauth: async ( event ) => {
        const state = await generateState();
        churros.state = state;
        event.cookies.set("oauthState", state, {
            path: "/",
            secure: !dev,
            httpOnly: true,
            maxAge: 60 * maxCookiesAge,
            sameSite: "lax"
        });
		throw redirect(302, churros.authorizationURL);
	}
};