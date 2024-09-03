import { goto } from "$app/navigation";
import prisma from "$lib/server/prisma";

let slot = {
    id: 0,
    starts_at: new Date("0000-00-00T00:00:00Z"),
    ends_at: new Date("0000-00-00T00:00:00Z"),
    owner_id: 0
};

let owner = {
    id: 0,
    name: ""
};

export async function load({ url }: { url: URL }) {
    console.log("Loading data for", url.toString());
    try {
        // Extrait la date à partir de l'URL ou des paramètres
        const dateParam = url.searchParams.get('date');
        
        // Convertit le paramètre en objet Date (assurez-vous que `dateParam` est au bon format)
        const date = dateParam ? new Date(dateParam) : new Date();

        // Vérifie si la date est valide
        if (isNaN(date.getTime())) {
            // La date est invalide, vous pouvez renvoyer une erreur ou une date par défaut
            return {
                status: 400,
                error: "Invalid date parameter"
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
                    gte: startOfDay,  // greater than or equal to start of day
                    lt: endOfDay      // less than end of day
                }
            }
        });

        // Trouve le propriétaire du créneau
        const owner = await prisma.user.findUniqueOrThrow({
            where: {
                id: slot.owner_id
            }
        });

        const participants = await prisma.user.findMany({
            where: {
                slots: {
                    some: {
                        id: slot.id
                    }
                }
            }
        });

        return {
            slot,
            owner,
            participants
        };
    } catch (error : any) {
        if (error.code === "P2025") {
            return {
                slot : slot,
                owner : owner,
                participants : [],
            };
        } else {
            goto(url);
            return {
                status: error.status,
                error: error
            };
        }
    }
}