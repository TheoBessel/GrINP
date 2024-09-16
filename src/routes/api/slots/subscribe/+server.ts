import prisma from "@/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const { slot_id, participants_count } = await event.request.json();

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

      const participants = await prisma.user.findMany({
        where: {
          slots: {
            some: {
              id: slot_id,
            },
          },
        },
      });

      let participants_count_new = -1;

      if (participants) {
        participants_count_new = participants.length;
      }

      return new Response(
        JSON.stringify({
          updated: participants_count_new > participants_count,
          participants_count: participants_count_new,
        }),
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
    return new Response(JSON.stringify("User not logged in !"), {
      status: 400,
    });
  }
};
