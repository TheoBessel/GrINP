import prisma from "@/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const { slot_id } = await event.request.json();

  const user = event.locals.user;

  if (user) {
    const user_id = user.id;
    // Add the user to the database
    try {
      await prisma.slot.update({
        where: {
          id: slot_id,
        },
        data: {
          participants: {
            connect: {
              id: user_id,
            },
          },
        },
      });

      await prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          slots: {
            connect: {
              id: slot_id,
            },
          },
        },
      });

      const participants = await prisma.user.findMany({
        where: {
          slots: {
            some: {
              id: slot_id,
            },
          },
        },
      });

      return new Response(JSON.stringify(participants), {
        status: 200,
      });
    } catch (error) {
      console.log(error);

      return new Response(JSON.stringify(error), {
        status: 400,
      });
    }
  } else {
    return new Response(JSON.stringify("User not logged in !"), {
      status: 400,
    });
  }
};
