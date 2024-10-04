<script lang="ts">

    import {
      Card,
      CardContent,
      CardDescription,
      CardFooter,
      CardHeader,
      CardTitle
    } from "$lib/components/ui/card";
    import Button from "@/components/ui/button/button.svelte";
    import * as Table from "@/components/ui/table/";
    import {
      DateFormatter
    } from "@internationalized/date";

    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";

    import type { Slot, User } from "@prisma/client";
    
    import { getFlash } from "sveltekit-flash-message";

    import { page } from "$app/stores";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import { slotScheme } from "..";

    import { createRender, createTable, Render, Subscribe } from "svelte-headless-table";
    import { addPagination } from "svelte-headless-table/plugins";

    import { participants, subscribe_slot, unsubscribe_slot } from '$lib/stores';
    
    import ParticipantManagement from "./ParticipantManagement.svelte";

    const flash = getFlash(page, {
        clearOnNavigate: true,
        clearAfterMs: 10,
        clearArray: true,
    });

    export let data: {
        slot: Slot;
        owner: User;
        user: User;
        form: any,
    };

    export let slotDate : string;

    $: current_slot = data.slot;

    $: {
        if (typeof current_slot.starts_at === 'string') {
            current_slot.starts_at = new Date(current_slot.starts_at);
        }
        if (typeof current_slot.ends_at === 'string') {
            current_slot.ends_at = new Date(current_slot.ends_at);
        }
    }

    $: user = data.user;

    $: participants_count = $participants?.length;
    $: subscribed = $participants?.some(participant => participant.id === user.id);

    async function handle_subscribe(user_id: string, slot_id: string) {
        if (!user_id || !slot_id) return;
        const result = subscribed
            ? await unsubscribe_slot(user_id, slot_id)
            : await subscribe_slot(user_id, slot_id);

        if (result.success) {
            // Logique supplémentaire en cas de succès, comme afficher un flash message
            $flash = {
                type: "success",
                message: `Votre ${!subscribed ? "désinscription" : "inscription"} a bien été prise en compte.`,
            };
        }
    }

    async function create_slot(event: Event) {
        event.preventDefault();

        type form = {
            title: string;
            description: string;
            date: {
                starts_at: string;
                ends_at: string;
            };
            capacity: number;
        };
        // Récupération des données du formulaire
        const formData : form = {
            title: $formData.title,
            description: $formData.description,
            date: $formData.date,
            capacity: $formData.capacity,
        };

        const create = await fetch("/api/slots/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ form: formData, today: slotDate }),
        });
        
        if (create.status == 200) {
            try {
                const response = await create.json();
                current_slot = response.slot;

                $flash = { // Ajout du flash message en cas de succès
                    type: "success",
                    message: "Le créneau a bien été créé !",
                };
            } catch (error) {
                console.error(error);
                $flash = { // Flash message en cas d'erreur réseau ou autre
                    type: "error",
                    message: "Une erreur est survenue.",
                };
            }
        } else {
            $flash = { // Flash message en cas d'échec
                type: "error",
                message: "Erreur lors de la création du créneau.",
            };
        }
    }


    const form = superForm(data.form, {
        validators: zodClient(slotScheme),
        dataType: 'json'
    });

    const { form: formData, enhance } = form;

    const df = new DateFormatter("fr-FR", { dateStyle: "long" });

    const table = createTable(participants, {
        page: addPagination({
            initialPageSize: 4,
        }),
    });

    const columns = table.createColumns([
        table.column({
            accessor: "churros_uid",
            header: "Churros UID",
            cell: ({ value }) => {
                if (!value) return "N/A";
                return value;
            },
        }),
        /*table.column({
            accessor: "first_name",
            header: "First Name",
        }),
        table.column({
            accessor: "last_name",
            header: "Last Name",
        }),*/
        table.column({
            accessor: ({ id }) => id,
            header: "Manage",
            cell: ({ value }) => {
                return createRender(ParticipantManagement, { id: value, slot_id: data.slot.id, unsubscribe_slot: unsubscribe_slot });
            },
        }),
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
        table.createViewModel(columns);

    const { hasNextPage, hasPreviousPage, pageIndex, pageCount } =
        pluginStates.page;
</script>

<Card class="flex flex-col justify-between w-full">
    {#if current_slot.id != "0"}
        {#if data.user.id == current_slot.owner_id}
            <CardHeader class="p-4">
                <CardTitle>Gérer le créneau : "{current_slot.name}"</CardTitle>
            </CardHeader>

            <CardContent class="flex flex-col gap-4 pt-6">
                Liste des participants :

                <div class="rounded-md border w-full">
                    <Table.Root {...$tableAttrs}>
                        <Table.Header>
                            {#each $headerRows as headerRow}
                                <Subscribe rowAttrs={headerRow.attrs()}>
                                    <Table.Row>
                                        {#each headerRow.cells as cell (cell.id)}
                                            <Subscribe
                                                attrs={cell.attrs()}
                                                let:attrs
                                                props={cell.props()}
                                            >
                                                <Table.Head {...attrs}>
                                                    <Render of={cell.render()} />
                                                </Table.Head>
                                            </Subscribe>
                                        {/each}
                                    </Table.Row>
                                </Subscribe>
                            {/each}
                        </Table.Header>
                        <Table.Body {...$tableBodyAttrs}>
                            {#each $pageRows as row (row.id)}
                                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                                    <Table.Row {...rowAttrs}>
                                        {#each row.cells as cell (cell.id)}
                                            <Subscribe attrs={cell.attrs()} let:attrs>
                                                <Table.Cell {...attrs}>
                                                    <Render of={cell.render()} />
                                                </Table.Cell>
                                            </Subscribe>
                                        {/each}
                                    </Table.Row>
                                </Subscribe>
                            {/each}
                        </Table.Body>
                    </Table.Root>
                </div>
            </CardContent>
        
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t" />
                </div>
            </div>
        
            <CardFooter>
                <div class="flex items-center justify-end space-x-4 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        on:click={() => ($pageIndex = $pageIndex - 1)}
                        disabled={!$hasPreviousPage}>Previous</Button
                    >
                    <span class="text-gray-500"
                        >Page {$pageIndex + 1} / {$pageCount}</span
                    >
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!$hasNextPage}
                        on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
                    >
                </div>
            </CardFooter>
        {:else}
            <CardHeader class="p-4">
                <CardTitle>{current_slot.name}</CardTitle>
                <CardDescription
                    >Encadré par {data.owner.first_name}
                    {data.owner.last_name}</CardDescription
                >
                <CardDescription>
                    {#if current_slot.starts_at && current_slot.ends_at}
                        {#if current_slot.starts_at.getDate() === current_slot.ends_at.getDate()}
                            Le {current_slot.starts_at.toLocaleDateString()} de {current_slot.starts_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} à {current_slot.ends_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        {:else}
                            Du {current_slot.starts_at.toLocaleDateString()} à {current_slot.starts_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} au {current_slot.ends_at.toLocaleDateString()} à {current_slot.ends_at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
                        {/if}
                    {/if}
                </CardDescription>
            </CardHeader>

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t" />
                </div>
            </div>

            <CardContent
                class="flex flex-col gap-4 pt-6 h-full text-balance w-full"
            >
                {current_slot.description}
            </CardContent>

            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t" />
                </div>
            </div>

            <CardFooter class="p-2 flex justify-between">
                <CardDescription>
                    {participants_count > 0
                        ? participants_count + " participants"
                        : "Aucun participant"}
                </CardDescription>

                <Button class="px-4 py-0" on:click={() => handle_subscribe(user.id, data.slot.id)}>
                    {#if !subscribed}S'inscrire{:else}Se désinscrire{/if}
                </Button>
            </CardFooter>
        {/if}
    {:else if (user.instructor || user.root)}
        <CardHeader class="p-4">
            <CardTitle>Créer un créneau</CardTitle>
            <form method="POST" on:submit|preventDefault={create_slot}>
                <div class="flex flex-col gap-4">
                    <div class="flex gap-4">
                        <Form.Field {form} name="title" class="w-full">
                            <Form.Control let:attrs>
                                <Form.Label>Titre du créneau</Form.Label>
                                <Input type="text" {...attrs} bind:value={$formData.title} placeholder="Titre du créneau" />
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>

                        <Form.Field {form} name="capacity">
                            <Form.Control let:attrs>
                                <Form.Label>Capacité</Form.Label>
                                <Input type="number" {...attrs} bind:value={$formData.capacity} placeholder="Capacité" />
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>
            
                    <Form.Field {form} name="description" class="w-full">
                        <Form.Control let:attrs>
                            <Form.Label>Description</Form.Label>
                            <Input type="text" {...attrs} bind:value={$formData.description} placeholder="Description" />
                        </Form.Control>
                        <Form.FieldErrors />
                    </Form.Field>

                    <div class="flex gap-4">
                        <Form.Field {form} name="date" class="w-full">
                            <Form.Control let:attrs>
                                <Form.Label>Dates</Form.Label>
                                <div class="flex gap-4 items-center">
                                    De
                                    <Input type="time" {...attrs} bind:value={$formData.date.starts_at} />
                                    à
                                    <Input type="time" {...attrs} bind:value={$formData.date.ends_at} />
                                </div>
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>
            
                    <Form.Button>Créer le créneau</Form.Button>
                </div>
            </form>
        </CardHeader>
    {:else}
        <CardHeader class="p-4">
            <CardTitle>Aucun créneau</CardTitle>
            <CardDescription>Il n'y a pas de créneau pour le moment.</CardDescription>
        </CardHeader>
    {/if}
</Card>