<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    </script>

<Card class="m-auto w-1/2">
    <CardHeader>
        <CardTitle>Évènements</CardTitle>
        <CardDescription>Les évènements organisés par le club !</CardDescription>
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t"/>
        </div>
    </div>
    
    <CardContent class="flex gap-4 pt-6">
        <p class="max-w-sm">
            Championnats de France
        </p>
    </CardContent>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t"/>
        </div>
    </div>
    
    <CardContent class="flex gap-4 pt-6">
        <p class="max-w-sm">
            Nuit de l'escalade
        </p>
    </CardContent>
</Card>