import prisma from "@/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
    const { startOfDay, endOfDay } = await event.request.json();

    const user = event.locals.user;

    if (user) {
        // Create the slot
        try {
            const exists = await prisma.slot.findMany({
                where: {
                    starts_at: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                }
            }).then((res) => res.length > 0 ? true : false)
            .catch(() => false);

            return new Response(
                JSON.stringify({ exists: exists }),
                {
                    status: 200,
                },
            );
        } catch (error) {
            console.log(error);

            return new Response(JSON.stringify(error), {
                status: 400,
            });
        }
    } else {
        return new Response(JSON.stringify("User not logged in or insufficient permissions !"), {
            status: 400,
        });
    }
};
