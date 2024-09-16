<script lang="ts">
    import Button from "@/components/ui/button/button.svelte";
    import "../app.css";

    import background2 from "$lib/assets/background-2.png";
    import background3 from "$lib/assets/background-3.png";
    import background4 from "$lib/assets/background-4.png";
    import type { PageData } from "./$types";

    import { Toaster } from "$lib/components/ui/sonner";

    export let data: PageData;

    const backgrounds = [background2, background3, background4];

    let currentBackgroundIndex = 0;
    let currentBackground = backgrounds[currentBackgroundIndex];

    function changeBackgroundRandom() {
        currentBackgroundIndex = Math.floor(Math.random() * backgrounds.length);
        currentBackground = backgrounds[currentBackgroundIndex];
    }

    // get event.locals.user to know if the user is logged in
    $: user = data.user;
    $: root = data.root;
    $: instructor = data.instructor;

    //setInterval(changeBackgroundRandom, 5000);

    import { page } from "$app/stores";
    import { toast } from "svelte-sonner";
    import { getFlash } from "sveltekit-flash-message";

    const flash = getFlash(page, {
        clearOnNavigate: true,
        clearAfterMs: 10,
        clearArray: true,
    });

    $: if ($flash) {
        console.log("Flash message recieved !");
        if ($flash.type === "success") {
            toast.success($flash.message, {
                action: {
                    label: "X",
                    onClick: () => toast.dismiss(),
                },
            });
        } else {
            toast.error($flash.message, {
                action: {
                    label: "X",
                    onClick: () => toast.dismiss(),
                },
            });
        }
    }
</script>

<div class="page flex h-screen flex-col relative">
    <!-- Image de fond unique -->
    <div
        class="background absolute inset-0"
        style={`background-image: url(${currentBackground});`}
    ></div>

    <!-- Contenu de la page -->
    <div class="content relative z-10 flex flex-col h-screen">
        <header
            class="sticky top-0 flex h-16 items-center gap-8 border-b bg-background px-4 md:px-6 w-full"
        >
            <!--<a href="/" class="text-3xl font-bold">Gr'</a>
            <img src={inp} alt="inp" style="height: 1.5rem;">-->
            <nav
                class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
            >
                <Button href="/" class="text-3xl font-bold" variant="tertiary"
                    >Gr'INP</Button
                >
                {#if user}
                    <!--<Button href="/events" variant="tertiary">Évènements</Button
                    >-->
                    <Button href="/calendar" variant="tertiary">Créneaux</Button
                    >
                {/if}

                <div class="absolute right-0 flex">
                    {#if !user}
                        <Button
                            href="/login"
                            class="flex flex-wrap mx-4 md:px-4"
                            variant="secondary">Connexion</Button
                        >
                        <Button href="/register" class="flex mx-4 md:px-4"
                            >Inscription</Button
                        >
                    {:else}
                        {#if instructor}
                            <Button
                                href="/instructor"
                                class="flex mx-4 md:px-4"
                                variant="tertiary">Intervenant</Button
                            >
                        {/if}
                        {#if root}
                            <Button
                                href="/admin"
                                class="flex mx-4 md:px-4"
                                variant="tertiary">Admin</Button
                            >
                        {/if}
                        <Button
                            href="/logout"
                            class="flex mx-4 md:px-4"
                            data-sveltekit-reload>Déconnexion</Button
                        >
                    {/if}
                </div>
            </nav>
        </header>

        <div class="content-body flex h-full">
            <slot></slot>
        </div>
    </div>

    <Toaster />
</div>

<style>
    .background {
        background-size: cover;
        background-position: center;
        transition: background-image 1s ease-in-out;
        z-index: -1;
    }

    .content {
        backdrop-filter: blur(5px);
        background-color: rgba(214, 209, 152, 0.24);
        background-blend-mode: saturation;
    }
</style>
