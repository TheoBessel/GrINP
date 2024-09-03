<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import Calendar from "@/components/ui/calendar/calendar.svelte";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import CardFooter from "@/components/ui/card/card-footer.svelte";
    import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
    import type { Slot, User } from "@prisma/client";

    let value : CalendarDate = today(getLocalTimeZone());

    function pad(n: number, k: number): string {
        return ('00' + n).slice(-k);
    }

    export let data: {
        slot: Slot,
        owner: User,
        participants: User[]
    };

    // Update URL when `value` changes
    $: {
        if (browser) {  // Ensure this code runs only on the client-side
            const query = new URLSearchParams($page.url.searchParams.toString());
            query.set('date', value.toString());
            // Updating the URL without reloading the page
            goto($page.url.pathname + '?' + query.toString(), { replaceState: true });
        }
    }
</script>

<Card class="m-auto w-1/2">
    <CardHeader>
        <CardTitle>Calendrier</CardTitle>
        <CardDescription>Le calendrier permettant de s'inscrire aux différents créneaux et évènements.</CardDescription>
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t"/>
        </div>
    </div>
    
    <CardContent class="flex gap-4 pt-6">
        <Calendar bind:value class="rounded-md border" />

        <div class="relative flex">
            <div class="absolute inset-0 flex flex-col items-center">
                <span class="h-full border-l"/>
            </div>
        </div>

        <Card class="flex flex-col justify-between w-full">
            {#if data.slot.id != "0"}
                <CardHeader class="p-4">
                    <CardTitle>{data.slot.name}</CardTitle>
                    <CardDescription>Encadré par {data.owner.first_name} {data.owner.last_name}</CardDescription>
                    <CardDescription>
                        {#if data.slot.starts_at.getDate() == data.slot.ends_at.getDate()}
                            Le {data.slot.starts_at.toLocaleDateString()} de {data.slot.starts_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} à {data.slot.ends_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        {:else}
                            Du {data.slot.starts_at.toLocaleDateString()} à {data.slot.starts_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} au {data.slot.ends_at.toLocaleDateString()} à {data.slot.ends_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        {/if}
                    </CardDescription>
                </CardHeader>

                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"/>
                    </div>
                </div>
                
                <CardContent class="flex flex-col gap-4 pt-6 h-full text-balance w-full">
                    {data.slot.description}
                </CardContent>

                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t"/>
                    </div>
                </div>

                <CardFooter class="p-2">
                    <CardDescription>
                        {data.participants.length > 0 ? data.participants.length + " participants" : "Aucun participant"}
                    </CardDescription>
                </CardFooter>
            {/if}
        </Card>
    </CardContent>
</Card>