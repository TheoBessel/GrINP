<script lang="ts">
	import { page } from '$app/stores';
	import CardDescription from "@/components/ui/card/card-description.svelte";
	import CardHeader from "@/components/ui/card/card-header.svelte";
	import CardTitle from "@/components/ui/card/card-title.svelte";
	import Card from "@/components/ui/card/card.svelte";
</script>

<Card class="m-auto">
    <CardHeader>
        <CardTitle>Error {$page.status}</CardTitle>
        <CardDescription>{$page.error?.message}</CardDescription>
    </CardHeader>
</Card>