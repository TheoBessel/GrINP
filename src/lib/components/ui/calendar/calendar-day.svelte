<script lang="ts">
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { getLocalTimeZone, type DateValue } from "@internationalized/date";
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { afterUpdate } from "svelte";

	type $$Props = CalendarPrimitive.DayProps;
	type $$Events = CalendarPrimitive.DayEvents;

	export let date: $$Props["date"];
	export let month: $$Props["month"];

	let className: $$Props["class"] = undefined;
	
	export { className as class };

	async function checkDate(date : DateValue) {
        // Request the route /api/slot/exists with the date as a parameter
		let startOfDay = date.toDate(getLocalTimeZone());
		startOfDay.setHours(0, 0, 0, 0);

		// Crée une date pour la fin de la journée (23:59:59)
		let endOfDay = new Date(startOfDay);
		endOfDay.setHours(23, 59, 59, 999);

        let exists = await fetch("/api/slots/exists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ startOfDay: startOfDay, endOfDay: endOfDay }),
        });
        
        if (exists.status == 200) {
            return exists.json().then((data) => {
                return data.exists;
            });
        } else {
            return false;
        }
    }

	$: slot_exists = false;

	export async function updateSlotExists() {
		slot_exists = await checkDate(date);
	};

	afterUpdate(async () => {
		updateSlotExists();
	});
</script>

<!-- If the date is in the events array, add the border -->
<CalendarPrimitive.Day
	{date}
	{month}
	on:click
	class={cn(
		buttonVariants({ variant: "ghost" }),
		"h-9 w-9 p-0 font-normal",
		"[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground",
		// Selected
		"data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground data-[selected]:opacity-100",
		// Disabled
		"data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
		// Unavailable
		"data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through",
		// Outside months
		"data-[outside-month]:text-muted-foreground [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground data-[outside-month]:pointer-events-none data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:opacity-30",
		slot_exists ? "day-button " : "",
		className
	)}
	{...$$restProps}
	let:selected
	let:disabled
	let:unavailable
	let:builder
>
	<slot {selected} {disabled} {unavailable} {builder}>
		{date.day}
	</slot>
	<style>
		.day-button {
			display: flex;
			flex-direction: column;
		}
		.day-button::after {
			content: "";
			display: block;
			background-color: hsl(var(--primary));
			height: 0.4rem;
			width: 0.4rem;
			border-radius: 1rem;
		}
	</style>
</CalendarPrimitive.Day>