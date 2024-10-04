<script lang="ts">
    import { loginScheme } from "$lib";
    import {
      Card,
      CardContent,
      CardHeader,
      CardTitle,
    } from "$lib/components/ui/card";
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

    import { page } from "$app/stores";
    import Button from "@/components/ui/button/button.svelte";
    import CardFooter from "@/components/ui/card/card-footer.svelte";
    import { getFlash } from "sveltekit-flash-message";

    const flash = getFlash(page, {
        clearOnNavigate: true,
        clearAfterMs: 10,
        clearArray: true,
    });
</script>

<Card class="m-auto w-full h-full">
    <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription
            >Entrez votre E-Mail ci dessous pour vous connecter</CardDescription
        >
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t" />
        </div>
    </div>

    <CardContent class="flex max-md:flex-col gap-4 pt-6">
        <form method="POST" action="?/manual" use:enhance class="w-full">
            <Form.Field {form} name="email">
                <Form.Control let:attrs>
                    <Form.Label>E-Mail</Form.Label>
                    <Input
                        type="email"
                        {...attrs}
                        bind:value={$formData.email}
                        placeholder="nom@exemple.fr"
                    />
                </Form.Control>
                <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="password">
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

            <Form.Button class="w-full">Se connecter</Form.Button>
        </form>

        <div class="relative flex flex">
            <div class="absolute inset-2 flex flex-col items-center">
                <span class="md:h-full md:border-l max-md:w-full max-md:border-t" />
            </div>
            <div class="relative flex flex-col m-auto text-xs uppercase">
                <span class="bg-card md:py-2 max-md:px-2 text-muted-foreground"> Ou </span>
            </div>
        </div>

        <form
            method="POST"
            action="?/oauth"
            class="w-full flex flex-col max-md:gap-4 justify-between"
        >
            <Avatar class="m-auto border-2">
                <AvatarImage
                    src="https://git.inpt.fr/inp-net/visual-identity/-/raw/main/favicon-color.png?ref_type=heads"
                    alt="inp-net"
                />
                <AvatarFallback>CR</AvatarFallback>
            </Avatar>

            <Form.Button class="w-full">Connexion via INP Net</Form.Button>
        </form>
    </CardContent>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
        </div>
    </div>

    <CardFooter class="p-2 flex justify-evenly gap-4">
        <CardDescription>Je n'ai pas encore de compte ?</CardDescription>

        <Button href="/register" class="px-4 py-0">S'inscrire</Button>
    </CardFooter>
</Card>
