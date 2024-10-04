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

    import { page } from "$app/stores";
    import { toast } from "svelte-sonner";
    import { getFlash } from "sveltekit-flash-message";

    const flash = getFlash(page, {
        clearOnNavigate: true,
        clearAfterMs: 10,
        clearArray: true,
    });

    $: if ($flash) {
        console.log("Flash message received !");
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

    // Variable pour contrôler l'ouverture du menu
    let menuOpen = false;

    function toggleMenu() {
        menuOpen = !menuOpen;
    }

    function closeMenu() {
        menuOpen = false;
    }
</script>

<div class="page flex h-full md:h-screen flex-col relative">
    <!-- Image de fond unique -->
    <div class="background absolute inset-0"></div>
    <!--<div
        class="background absolute inset-0"
        style={`background-image: url(${currentBackground});`}
    ></div>-->

    <!-- Contenu de la page -->
    <div class="content relative z-10 flex flex-col h-full">
        <!-- Bouton hamburger/croix visible sur mobile -->
        <Button on:click={toggleMenu} class="md:hidden hamburger-button h-16 flex justify-start" variant="background">
            <div class={`hamburger ${menuOpen ? 'open' : ''}`}>
                <span class="line"></span>
                <span class="line"></span>
                <span class="line"></span>
            </div>
        </Button>

        <!-- Menu principal (header entier) -->
        <header
            class={`sticky top-0 flex max-md:flex-col md:h-16 items-center gap-8 border-b bg-background p-4 w-full z-50 justify-between max-md:transition-transform max-md:duration-500 max-md:ease-in-out transform ${
                menuOpen ? "max-md:translate-y-0" : "max-md:-translate-y-full"
            }`}
        >
            <!-- Liens classiques -->
            <div class="flex flex-col items-center gap-4 md:flex-row">
                <Button href="/" class="text-3xl font-bold" variant="tertiary" on:click={closeMenu}>
                    Gr'INP
                </Button>

                {#if user}
                    <Button href="/calendar" variant="tertiary" on:click={closeMenu}>Créneaux</Button>
                {/if}
            </div>

            <!-- Liens gestion -->
            <div class="flex flex-col items-center gap-4 md:flex-row">
                {#if !user}
                    <Button
                        href="/login"
                        class="flex mx-4 md:px-4"
                        variant="secondary"
                        on:click={closeMenu}
                        >Connexion</Button
                    >
                    <Button href="/register" class="flex mx-4 md:px-4" on:click={closeMenu}>Inscription</Button>
                {:else}
                    {#if instructor}
                        <Button
                            href="/instructor"
                            class="flex mx-4 md:px-4"
                            variant="tertiary"
                            on:click={closeMenu}
                            >Intervenant</Button
                        >
                    {/if}
                    {#if root}
                        <Button
                            href="/admin"
                            class="flex mx-4 md:px-4"
                            variant="tertiary"
                            on:click={closeMenu}
                            >Admin</Button
                        >
                    {/if}
                    <Button href="/logout" class="flex mx-4 md:px-4" data-sveltekit-reload on:click={closeMenu}>
                        Déconnexion
                    </Button>
                {/if}
            </div>
        </header>

        <div class="h-screen">
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
        background-color: rgba(214, 209, 152, 0.24);
        background-blend-mode: saturation;
    }

    /* Styles pour le header responsive avec transition */
    @media (max-width: 768px) {
        header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: hsl(var(--background));
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 50;
        }

        /* Transition lors de l'ouverture/fermeture */
        header.max-md.-translate-y-full {
            transform: translateY(-100%);
        }

        header.max-md.translate-y-0 {
            transform: translateY(0);
        }
    }

    /* Styles pour l'animation hamburger/croix */
    .hamburger {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        width: 30px;
        height: 30px;
        cursor: pointer;
        transition: all 0.5s ease;
        z-index: 60; /* S'assurer que le bouton est au-dessus */
    }

    .line {
        height: 4px; /* Augmenter la hauteur pour une meilleure visibilité */
        width: 100%;
        background-color: hsl(var(--foreground)); /* Couleur des lignes */
        transition: all 0.5s ease;
        transform-origin: center; /* Centre de transformation */
    }

    .hamburger.open .line:nth-child(1) {
        transform: translateY(10px) rotate(45deg) scale(1.1); /* Rotation et déplacement vers le bas */
    }

    .hamburger.open .line:nth-child(2) {
        opacity: 0; /* Masquer la ligne du milieu */
        transform: scale(0); /* Réduire la taille à zéro */
    }

    .hamburger.open .line:nth-child(3) {
        transform: translateY(-10px) rotate(-45deg) scale(1.1); /* Rotation et déplacement vers le haut */
    }
</style>