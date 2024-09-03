// src/lib/server/lucia.ts

import { dev } from '$app/environment';
import prisma from "$lib/server/prisma";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev
        }
    },
    getUserAttributes: (attributes) => {
        return {
            churros_uid: attributes.churros_uid
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof Lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    churros_uid: string;
}