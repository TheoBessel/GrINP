import { registerScheme } from "$lib";
import { lucia } from "@/server/lucia.js";
import prisma from "@/server/prisma.js";
import { fail, redirect, type Actions, type ServerLoadEvent } from '@sveltejs/kit';
import * as argon2 from "argon2";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async (event : ServerLoadEvent) => {
    if (event.locals.user) {
        redirect(302, "/");
    }
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
            // Add the user to the database
            try {
                const hash = await argon2.hash(form.data.password);
                const user = await prisma.user.create({
                    data: {
                        //id: "0",
                        first_name: form.data.first_name,
                        last_name: form.data.last_name,
                        email: form.data.email,
                        password: hash,
                    }
                });

                try {
                    const session = await lucia.createSession(user.email, {
                        userId: user.id,
                        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15) // 15 days
                    });
                    const sessionCookie = lucia.createSessionCookie(session.id);

                    event.cookies.set(sessionCookie.name, sessionCookie.value, {
                        path: ".",
                        ...sessionCookie.attributes
                    });
                } catch (error : any) {
                    console.log(error);
                }
            } catch (error) {
                console.log(error);
            }

            // Redirect to the home page
            throw redirect(302, '/');
        }
    },

	oauth: async ( ) => {
		throw redirect(302, "/login");
	}
};