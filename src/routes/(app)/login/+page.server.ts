import { dev } from "$app/environment";
import { loginScheme } from "$lib";
import { authentik, lucia } from "@/server/lucia.js";
import prisma from "@/server/prisma.js";
import { error, fail, type Actions, type ServerLoadEvent } from "@sveltejs/kit";
import { OAuth2RequestError, generateCodeVerifier, generateState } from "arctic";
import * as argon2 from "argon2";
import { redirect, setFlash } from "sveltekit-flash-message/server";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types.js";

const maxCookiesAge = 60 * 60 * 24 * 15;

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
  if (event.locals.user) {
    throw redirect(302, "/");
  }

  const oauthState = event.cookies.get("oauthState") ?? null;
  const oauthCodeVerifier = event.cookies.get("oauthCodeVerifier") ?? null;

	const state = event.url.searchParams.get("state");
	const code = event.url.searchParams.get("code");

  if (!code || !state || !oauthState || !oauthCodeVerifier) {
    // Do nothing
  } else if (state !== oauthState) {
    // Error 400: OAuth state mismatch
    throw error(400, "OAuth state mismatch");
  } else {
    try {
      const tokens = await authentik.validateAuthorizationCode(code, oauthCodeVerifier);
      const response = await fetch("https://auth.inpt.fr/application/o/userinfo/", {
        method: 'post',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(response);
      const user: AuthentikUserResult = await response.json();

      let prismaUser = await prisma.user.findUnique({
        where: {
          churros_uid: user.preferred_username
        }
      });

      const existsClassicUser = await prisma.user.findUnique({
        where: {
          email: user.email
        }
      })
      .then((u) => u ? true : false)
      .catch(() => false);

      if (!prismaUser) {
        if (existsClassicUser) {
          prismaUser = await prisma.user.update({
            where: {
              email: user.email
            },
            data: {
              churros_uid: user.preferred_username
            }
          });
        } else {
          prismaUser = await prisma.user.create({
            data: {
              churros_uid: user.preferred_username,
              first_name: user.firstName,
              last_name: user.lastName,
              email: user.email,
            }
          });
        }
      }

      const session = await lucia.createSession(prismaUser.id, {
        userId: prismaUser.id,
        expiresAt: new Date(Date.now() + 1000 * maxCookiesAge), // 15 days
      });
      const sessionCookie = lucia.createSessionCookie(session.id);

      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });
      
    } catch (e) {
      if (e instanceof OAuth2RequestError) {
        throw error(400, e.message);
      }
      else if (e instanceof Error) {
        throw error(500, e.message);
      }
    }

    throw redirect(
      302,
      "/",
      {
        type: "success",
        message: "Vous êtes connecté !",
      },
      event,
    );
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
              const session = await lucia.createSession(user.id, {
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
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = await authentik.createAuthorizationURL(state, codeVerifier, {
        scopes: ['openid', 'profile', 'email', 'churros:profile']
    });

    event.cookies.set('oauthState', state, {
      path: "/",
      secure: !dev,
      httpOnly: true,
      maxAge: maxCookiesAge,
      sameSite: "lax",
    });

    event.cookies.set('oauthCodeVerifier', codeVerifier, {
      path: "/",
      secure: !dev,
      httpOnly: true,
      maxAge: maxCookiesAge,
      sameSite: "lax",
    });

    throw redirect(302, url);
  },
};

interface AuthentikUserResult {
  preferred_username: string;
	firstName: string;
  lastName: string;
  email: string;
}