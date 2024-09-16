import { goto } from "$app/navigation";
import prisma from "$lib/server/prisma";
import { slotScheme } from "@/index";
import { redirect } from "sveltekit-flash-message/server";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";

let slot = {
  id: 0,
  starts_at: new Date("0000-00-00T00:00:00Z"),
  ends_at: new Date("0000-00-00T00:00:00Z"),
  owner_id: 0,
};

let owner = {
  id: 0,
  name: "",
};

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;

  // Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!user) {
    redirect(
      302,
      "/login",
      /*{
        type: "error",
        message: "Vous devez être connecté pour accéder à cette page !",
      },
      event,*/
    );
  }

  try {
    // Extrait la date à partir de l'URL ou des paramètres
    const dateParam = event.url.searchParams.get("date");

    // Convertit le paramètre en objet Date (assurez-vous que `dateParam` est au bon format)
    const date = dateParam ? new Date(dateParam) : new Date();

    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      // La date est invalide, vous pouvez renvoyer une erreur ou une date par défaut
      return {
        status: 400,
        error: "Invalid date parameter",
      };
    }

    // Normalise la date au début de la journée (00:00:00)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Crée une date pour la fin de la journée (23:59:59)
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    // Trouve le créneau correspondant
    const slot = await prisma.slot.findFirstOrThrow({
      where: {
        starts_at: {
          gte: startOfDay, // greater than or equal to start of day
          lt: endOfDay, // less than end of day
        },
      },
    });

    // Trouve le propriétaire du créneau
    const owner = await prisma.user.findUniqueOrThrow({
      where: {
        id: slot.owner_id,
      },
    });

    // Trouve les participants du créneau
    const participants = await prisma.user.findMany({
      where: {
        slots: {
          some: {
            id: slot.id,
          },
        },
      },
    });

    // Retourne les données nécessaires à la page, y compris l'utilisateur actuel
    return {
      slot: slot,
      owner: owner,
      participants: participants,
      user: event.locals.user,
      form: await superValidate(zod(slotScheme)),
    };
  } catch (error: any) {
    if (error.code === "P2025") {
      return {
        slot: slot,
        owner: owner,
        participants: [],
        user: event.locals.user,
        form: await superValidate(zod(slotScheme)),
      };
    } else {
      goto(event.url);
      return {
        status: error.status,
        error: error,
      };
    }
  }
};
