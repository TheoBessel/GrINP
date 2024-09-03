<script lang="ts">
    import type { PageData } from "./$types";
    
    export let data: PageData;
    const { user } = data;

    import CardContent from "@/components/ui/card/card-content.svelte";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import CardHeader from "@/components/ui/card/card-header.svelte";
    import CardTitle from "@/components/ui/card/card-title.svelte";
    import Card from "@/components/ui/card/card.svelte";
</script>

<Card class="m-auto w-1/2">
    <CardHeader>
        <CardTitle>{user.first_name} {user.last_name}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
    </CardHeader>
    <CardContent>
        <p>Id: {user.id}</p>
        <p>First Name: {user.first_name}</p>
        <p>Last Name: {user.last_name}</p>
        <p>Email: {user.email}</p>
        <p>Churros UID: {user.churros_uid}</p>
    </CardContent>
</Card>