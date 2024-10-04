<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
    import SlotCard from "@/components/SlotCard.svelte";
    import Calendar from "@/components/ui/calendar/calendar.svelte";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import { participants } from "@/stores";
    import {
      CalendarDate,
      getLocalTimeZone,
      parseDate,
      today
    } from "@internationalized/date";
    import type { Slot, User } from "@prisma/client";

    let value: CalendarDate;

    export let data: {
        slot: Slot;
        owner: User;
        user: User;
        form: any
        participants_list: User[];
    };

    // Récupérer la date dans l'URL au chargement
    if (browser) {
        const query = new URLSearchParams($page.url.searchParams.toString());
        const dateInUrl = query.get("date");
        
        if (dateInUrl) {
            // Si une date est présente dans l'URL, on l'utilise pour initialiser `value`
            value = parseDate(dateInUrl);
        } else {
            // Sinon, on initialise avec la date du jour
            value = today(getLocalTimeZone());
        }
    }

    // Mettre à jour les participants
    $: {
        participants.set(data.participants_list);

        // Mettre à jour l'URL lorsque `value` change
        if (browser) {
            const query = new URLSearchParams($page.url.searchParams.toString());
            if (value != undefined) {
                query.set("date", value.toString());
            }
            goto($page.url.pathname + "?" + query.toString(), {
                replaceState: true,  // Utilise `replaceState` pour éviter de pousser dans l'historique
            });
        }
    }

</script>

<Card class="m-auto w-full h-full">
    <CardHeader>
        <CardTitle>Calendrier</CardTitle>
        <CardDescription
            >Le calendrier permettant de s'inscrire aux différents créneaux et
            évènements.</CardDescription
        >
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t" />
        </div>
    </div>

    <CardContent class="flex max-sm:flex-col gap-4 pt-6">
        <Calendar
            initialFocus
            numberOfMonths={1}
            weekStartsOn={1}
            bind:value
            class="rounded-md border md:w-1/2"
        />

        <div class="relative">
            <div class="absolute inset-0 flex sm:flex-col items-center">
                <span class="sm:h-full sm:border-l w-full border-t" />
            </div>
        </div>

        <SlotCard data={data} slotDate={value?.toString()}/>
                
    </CardContent>
</Card>
