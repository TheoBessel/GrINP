import prisma from "@/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const { user_id, slot_id } = await event.request.json();

  const user = event.locals.user;

  const can_manage = await prisma.user.findUnique({
    where: {
      id: user?.id
    }
  }).then((u) => u?.root
    || (
      u?.instructor &&
        (prisma.slot.findUnique({
          where: {
            id: slot_id
          }
        }).then((s) => s?.owner_id === user?.id))
    )
  );

  const participants_count = await prisma.user.findMany({
    where: {
      slots: {
        some: {
          id: slot_id,
        },
      },
    },
  }).then((participants) => participants.length);

  if (user?.id == user_id || can_manage) {
    // Add the user to the database
    try {
      const capacity = await prisma.slot.findUnique({
        where: {
          id: slot_id,
        },
      }).then((slot) => slot?.capacity);

      if (capacity && participants_count >= capacity && !can_manage) {
        return new Response(JSON.stringify("Slot is full !"), {
          status: 400,
        });
      }

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

      let participants_count_new = participants?.length ?? -1;

      return new Response(
        JSON.stringify({
          updated: participants_count_new > participants_count,
          participants: participants,
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
    return new Response(JSON.stringify("User not logged in or insufficient permissions !"), {
      status: 400,
    });
  }
};
