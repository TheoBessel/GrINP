import prisma from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    return {
        user: await prisma.user.findUniqueOrThrow({
            where: {
                churros_uid: params.id
            }
        })
    }
}