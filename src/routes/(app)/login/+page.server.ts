import { dev } from "$app/environment";
import { loginScheme } from "$lib";
import { lucia } from "@/server/lucia.js";
import { churros, generateState, identity, login } from "@/server/oauth.js";
import prisma from "@/server/prisma.js";
import { error, fail, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import * as argon2 from "argon2";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { Authentik } from "arctic";

const maxCookiesAge = 60 * 60 * 24 * 15;

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
  if (event.locals.user) {
    throw redirect(302, "/");
  }

  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const oauthState = event.cookies.get("oauthState") ?? null;

  if (!code || !state || !oauthState || state !== oauthState) {
    if (state !== oauthState) {
      // Error 400: OAuth state mismatch
      //throw error(400, "OAuth state mismatch");
    }
  } else {
    try {
      let token = event.cookies.get("oauthToken") ?? null;
      if (!token) {
        token = await login(code, state);
        event.cookies.set("oauthToken", token, {
          path: "/",
          secure: !dev,
          httpOnly: true,
          maxAge: maxCookiesAge,
          sameSite: "lax",
        });
      }
      const user = await identity(token);
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
      // Verify the user's credentials
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: form.data.email,
          },
        });

        let password = user?.password;

        if (password === undefined || password === null) {
          setFlash(
            {
              type: "error",
              message:
                "Vous devez ajouter un mot de passe à votre compte ou utiliser OAuth pour vous connecter !",
            },
            event,
          );
        } else {
          const check = await argon2.verify(password, form.data.password);
          if (check) {
            if (!user) {
              setFlash(
                {
                  type: "error",
                  message:
                    "Votre mot de passe ou nom d'utilisateur est incorrect !",
                },
                event,
              );
              return;
            }

            try {
              const session = await lucia.createSession(user.email, {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * maxCookiesAge), // 15 days
              });
              const sessionCookie = lucia.createSessionCookie(session.id);

              event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: ".",
                ...sessionCookie.attributes,
              });
            } catch (error: any) {
              console.log(error);
            }

            throw redirect(
              302,
              "/",
              {
                type: "success",
                message: "Vous êtes connecté en tant que : " + user.email,
              },
              event,
            );
          } else {
            setFlash(
              {
                type: "error",
                message:
                  "Votre mot de passe ou nom d'utilisateur est incorrect !",
              },
              event,
            );
          }
        }
      } catch (error: any) {
        console.log(error);
      }
    }
  },

  oauth: async (event) => {
    const state = await generateState();
    churros.state = state;
    event.cookies.set("oauthState", state, {
      path: "/",
      secure: !dev,
      httpOnly: true,
      maxAge: maxCookiesAge,
      sameSite: "lax",
    });
    throw redirect(302, churros.authorizationURL);
  },
};
