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
            churros_id: attributes.churros_id,
            email: attributes.email,
            root: attributes.root
        };
    },
    getSessionAttributes: (attributes) => {
        return {
            userId: attributes.userId,
            expiresAt: attributes.expiresAt
        }
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof Lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
    churros_id: string;
    root: boolean;
}

interface DatabaseSessionAttributes {
    userId: string;
    expiresAt: Date;
}