// store.ts
import type { User } from '@prisma/client';
import { writable } from 'svelte/store';

// Store pour les participants
export const participants = writable<User[]>([]);

// Fonction pour inscrire un utilisateur
export async function subscribe_slot(user_id: string, slot_id: string) {
    const subscribe = await fetch("api/slots/subscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, slot_id }),
    });

    if (subscribe.status == 200) {
        try {
            const response = await subscribe.json();
            if (response.updated) {
                participants.set(response.participants);
                return { success: true };
            }
        } catch (error) {
            console.error("Erreur lors de l'inscription :", error);
        }
    }
    return { success: false };
}

// Fonction pour désinscrire un utilisateur
export async function unsubscribe_slot(user_id: string, slot_id: string) {
    const unsubscribe = await fetch("api/slots/unsubscribe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, slot_id }),
    });

    if (unsubscribe.status == 200) {
        try {
            const response = await unsubscribe.json();
            if (response.updated) {
                participants.set(response.participants);
                return { success: true };
            }
        } catch (error) {
            console.error("Erreur lors de la désinscription :", error);
        }
    }
    return { success: false };
}
