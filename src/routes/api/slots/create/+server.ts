import prisma from "@/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
    const { form } = await event.request.json();

    const user = event.locals.user;

    const prisma_user = await prisma.user.findUnique({
        where: {
            id: user?.id,
        },
    });

    if (prisma_user?.instructor || prisma_user?.root) {
        const user_id = prisma_user.id;

        // Create the slot
        try {
            const slot = await prisma.slot.create({
                data: {
                    name: form.title,
                    description: form.description,
            
                    starts_at: new Date(form.date.starts_at),
                    ends_at: new Date(form.date.ends_at),
            
                    owner: {
                        connect: {
                            id: user_id,
                        },
                    },
            
                    participants: {},
                },
            });

            return new Response(
                JSON.stringify({}),
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
