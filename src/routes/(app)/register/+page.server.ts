import { registerScheme } from "$lib";
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod(registerScheme)),
    };
};

export const actions: Actions = {
    manual: async (event) => {
        const form = await superValidate(event, zod(registerScheme));
        if (!form.valid) {
            return fail(400, { form });
        } else {
            throw redirect(302, '/');
        }
        //return { form };
    },

	oauth: async ( ) => {
		throw redirect(302, "/login");
	}
};