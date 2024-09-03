<script lang="ts">
    import { loginScheme } from "$lib";
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import AvatarFallback from "@/components/ui/avatar/avatar-fallback.svelte";
    import AvatarImage from "@/components/ui/avatar/avatar-image.svelte";
    import Avatar from "@/components/ui/avatar/avatar.svelte";
    import CardDescription from "@/components/ui/card/card-description.svelte";
    import { superForm } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import type { PageData } from "./$types.js";

    export let data: PageData;

    const form = superForm(data.form, {
        validators: zodClient(loginScheme),
    });

    const { form: formData, enhance } = form;
</script>

<Card class="m-auto w-1/2">
    <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Entrez votre E-Mail ci dessous pour vous connecter</CardDescription>
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t"/>
        </div>
    </div>
    
    <CardContent class="flex gap-4 pt-6">
        <form method="POST" action="?/manual" use:enhance class="w-full">
            <Form.Field {form} name="email">
                <Form.Control let:attrs>
                    <Form.Label>E-Mail</Form.Label>
                    <Input type="email" {...attrs} bind:value={$formData.email} placeholder="nom@exemple.fr" />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="password">
                <Form.Control let:attrs>
                    <Form.Label>Mot de passe</Form.Label>
                    <Input type="password" {...attrs} bind:value={$formData.password} />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Button class="w-full">Se connecter</Form.Button>
        </form>

        <div class="relative flex">
            <div class="absolute inset-2 flex flex-col items-center">
                <span class="h-full border-l"/>
            </div>
            <div class="relative flex flex-col m-auto text-xs uppercase">
                <span class="bg-background py-2 text-muted-foreground"> Ou </span>
            </div>
        </div>

        <form method="POST" action="?/oauth" class="w-full flex flex-col m-auto">
            <Avatar class="m-auto">
                <AvatarImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmPRK3nIU545-R6tiB9ouXL1yCFCY7-q8iTw&s" alt="Churros" />
                <AvatarFallback>CR</AvatarFallback>
            </Avatar>

            <div class="h-4"></div>
            
            <Form.Button>Connexion via Churros</Form.Button>
        </form>
    </CardContent>
</Card>