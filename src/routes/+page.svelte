<script lang="ts">
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
    import Button from "@/components/ui/button/button.svelte";
    </script>

<Card class="m-auto w-1/2">
    <CardHeader>
        <CardTitle>Club Gr'INP - AS INP</CardTitle>
        <!--<CardDescription>Entrez votre E-Mail ci dessous pour vous connecter</CardDescription>-->
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t"/>
        </div>
    </div>
    
    <CardContent class="flex flex-col items-center gap-4 pt-6">
        <p class="w-full">
            Bienvenue sur le site du club Gr'INP - AS INP. Vous trouverez ici toutes les informations nécessaires pour vous inscrire et participer à nos évènements.
        </p>
        <p></p>
        <Button href="/events" class="w-1/2">Voir les évènements</Button>
        <p></p>
        <Button href="/calendar" class="w-1/2">Voir le calendrier</Button>
    </CardContent>
</Card>