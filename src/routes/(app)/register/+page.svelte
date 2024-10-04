<script lang="ts">
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import { registerScheme } from "@/index";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import type { PageData } from "./$types";

    export let data: PageData;

    const form = superForm(data.form, {
        validators: zodClient(registerScheme),
    });

    const { form: formData, enhance } = form;
</script>

<Card class="m-auto w-full h-full">
    <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription
            >Veuillez renseigner les informations ci-dessous pour vous inscrire</CardDescription
        >
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t" />
        </div>
    </div>

    <CardContent class="pt-6">
        <form method="POST" action="?/manual" use:enhance class="w-full">
            <div class="flex gap-4">
                <Form.Field {form} name="first_name" class="w-full">
                    <Form.Control let:attrs>
                        <Form.Label>Prénom</Form.Label>
                        <Input
                            type="text"
                            {...attrs}
                            bind:value={$formData.first_name}
                            placeholder="John"
                        />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>

                <Form.Field {form} name="last_name" class="w-full">
                    <Form.Control let:attrs>
                        <Form.Label>Nom</Form.Label>
                        <Input
                            type="text"
                            {...attrs}
                            bind:value={$formData.last_name}
                            placeholder="Doe"
                        />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>
            </div>

            <Form.Field {form} name="email">
                <Form.Control let:attrs>
                    <Form.Label>E-Mail</Form.Label>
                    <Input
                        type="email"
                        {...attrs}
                        bind:value={$formData.email}
                        placeholder="john.doe@exemple.fr"
                    />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <div class="flex max-md:flex-col gap-4">
                <Form.Field {form} name="password" class="w-full">
                    <Form.Control let:attrs>
                        <Form.Label>Mot de passe</Form.Label>
                        <Input
                            type="password"
                            {...attrs}
                            bind:value={$formData.password}
                        />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>

                <Form.Field {form} name="confirmPassword" class="w-full">
                    <Form.Control let:attrs>
                        <Form.Label>Confirmation mot de passe</Form.Label>
                        <Input
                            type="password"
                            {...attrs}
                            bind:value={$formData.confirmPassword}
                        />
                    </Form.Control>
                    <Form.FieldErrors />
                </Form.Field>
            </div>

            <Form.Button class="w-full">S'inscrire</Form.Button>
        </form>
    </CardContent>
</Card>
