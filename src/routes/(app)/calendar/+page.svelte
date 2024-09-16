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
    import {
      CalendarDate,
      getLocalTimeZone,
      today
    } from "@internationalized/date";
    import type { Slot, User } from "@prisma/client";
    import MediaQuery from 'svelte-media-queries';

    let value: CalendarDate = today(getLocalTimeZone());

    $: participants_count = 0;

    export let data: {
        slot: Slot;
        owner: User;
        participants: User[];
        user: User;
        form: any
    };

    $: user = data.user;


    // Update URL when `value` changes
    $: {
        if (browser) {
            const query = new URLSearchParams($page.url.searchParams.toString());
            if (value != undefined) {
                query.set("date", value.toString());
            }
            goto($page.url.pathname + "?" + query.toString(), {
                replaceState: true,
            });
        }
    }

</script>

<MediaQuery query='(max-width: 1000px)' let:matches>
    <Card class="m-auto w-1/2 h-[90%]" style="overflow-y:scroll;">
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

        {#if !matches}
            <CardContent class="flex gap-4 pt-6">
                <Calendar
                    initialFocus
                    numberOfMonths={1}
                    weekStartsOn={1}
                    bind:value
                    class="rounded-md border"
                />

                <div class="relative flex">
                    <div class="absolute inset-0 flex flex-col items-center">
                        <span class="h-full border-l" />
                    </div>
                </div>

                <SlotCard data={data} />
                
            </CardContent>
        {:else}
            <CardContent class="flex flex-col gap-4 pt-6">
                <Calendar
                    initialFocus
                    numberOfMonths={1}
                    weekStartsOn={1}
                    bind:value
                    class="rounded-md border"
                />

                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <span class="w-full border-t" />
                    </div>
                </div>

                <SlotCard data={data} />
            </CardContent>
        {/if}
    </Card>
</MediaQuery>

