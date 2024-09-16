<script lang="ts">
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
    import Button from "@/components/ui/button/button.svelte";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import CardFooter from "@/components/ui/card/card-footer.svelte";
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

    const flash = getFlash(page, {
        clearOnNavigate: true,
        clearAfterMs: 10,
        clearArray: true,
    });

    export let data: {
        slot: Slot;
        owner: User;
        participants: User[];
        user: User;
        form: any
    };

    $: user = data.user;

    $: participants_count = 0;

    $: subscribed = false; // new state for subscription

    $: {
        if (data.participants) {
            participants_count = data.participants.length;
            subscribed = data.participants.some(participant => participant.id === user.id);
        }
    }

    async function handle_subscribe() {
        if (subscribed) {
            await unsubscribe_slot();
        } else {
            await subscribe_slot();
        }
    }

    async function subscribe_slot() {
        const subscribe = await fetch("api/slots/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slot_id: data.slot.id,
                participants_count: participants_count,
            }),
        });

        if (subscribe.status == 200) {
            try {
                const response = await subscribe.json();
                if (response.updated) {
                    participants_count = response.participants_count;
                    subscribed = true; // Update subscription state

                    $flash = {
                        type: "success",
                        message: "L'inscription a bien été prise en compte !",
                    };
                }
            } catch (error) {
                $flash = {
                    type: "error",
                    message: "Une erreur est survenue lors de l'inscription !",
                };
            }
        }
    }

    async function unsubscribe_slot() {
        const unsubscribe = await fetch("api/slots/unsubscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                slot_id: data.slot.id,
                participants_count: participants_count,
            }),
        });

        if (unsubscribe.status == 200) {
            try {
                const response = await unsubscribe.json();
                if (response.updated) {
                    participants_count = response.participants_count;
                    subscribed = false; // Update subscription state

                    $flash = {
                        type: "success",
                        message: "L'annulation de l'inscription a bien été prise en compte !",
                    };
                }
            } catch (error) {
                $flash = {
                    type: "error",
                    message: "Une erreur est survenue lors de l'annulation de l'inscription !",
                };
            }
        }
    }

    async function create_slot() {
        const formData = {
            title: $formData.title,
            description: $formData.description,
            date: $formData.date
        };

        const response = await fetch("/api/slots/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                $flash = {
                    type: "success",
                    message: "Le créneau a bien été créé !",
                };
            }
        } else {
            $flash = {
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
</script>

<Card class="flex flex-col justify-between w-full">
    {#if data.user.id == data.owner.id}
        <CardHeader class="p-4">
            <CardTitle>{data.slot.name}</CardTitle>
            <CardDescription>Gérer le créneau</CardDescription>
        </CardHeader>
    {:else if data.slot.id != "0"}
        <CardHeader class="p-4">
            <CardTitle>{data.slot.name}</CardTitle>
            <CardDescription
                >Encadré par {data.owner.first_name}
                {data.owner.last_name}</CardDescription
            >
            <CardDescription>
                {#if data.slot.starts_at.getDate() == data.slot.ends_at.getDate()}
                    Le {data.slot.starts_at.toLocaleDateString()} de {data.slot.starts_at.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                    )} à {data.slot.ends_at.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}.
                {:else}
                    Du {data.slot.starts_at.toLocaleDateString()} à {data.slot.starts_at.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                    )} au {data.slot.ends_at.toLocaleDateString()} à {data.slot.ends_at.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                    )}.
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
            {data.slot.description}
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

            <Button class="px-4 py-0" on:click={handle_subscribe}>
                {#if !subscribed}S'inscrire{:else}Se désinscrire{/if}
            </Button>
        </CardFooter>
    {:else if (user.instructor || user.root)}
        <CardHeader class="p-4">
            <CardTitle>Créer un créneau</CardTitle>
            <form method="POST" on:submit|preventDefault={create_slot} use:enhance>
                <div class="flex flex-col gap-4">
                    <Form.Field {form} name="title" class="w-full">
                        <Form.Control let:attrs>
                            <Form.Label>Titre du créneau</Form.Label>
                            <Input type="text" {...attrs} bind:value={$formData.title} placeholder="Titre du créneau" />
                        </Form.Control>
                        <Form.FieldErrors />
                    </Form.Field>

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
                                <div class="flex gap-4 content-center">
                                    De
                                    <Input type="time" {...attrs} bind:value={$formData.date.starts_at} />
                                    à
                                    <Input type="time" {...attrs} bind:value={$formData.date.ends_at} />
                                </div>
                            </Form.Control>
                            <Form.FieldErrors />
                        </Form.Field>
                    </div>

                    <Button type="submit">Créer le créneau</Button>
                </div>
            </form>
        </CardHeader>
    {/if}
</Card>