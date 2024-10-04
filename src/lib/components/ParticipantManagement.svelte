<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import * as DropdownMenu from "./ui/dropdown-menu";
  
    export let id: string;
    export let slot_id: string;
    export let unsubscribe_slot;
  </script>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild let:builder>
      <Button
        variant="ghost"
        builders={[builder]}
        size="icon"
        class="relative h-8 w-8 p-0"
      >
        <span class="sr-only">Open menu</span>
        <Ellipsis class="h-4 w-4" />
      </Button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Group>
        <DropdownMenu.Label>Actions</DropdownMenu.Label>
        <DropdownMenu.Item on:click={() => navigator.clipboard.writeText(id)}>
          Copy UserID
        </DropdownMenu.Item>
      </DropdownMenu.Group>
      <DropdownMenu.Separator />
      <DropdownMenu.Item on:click={() => unsubscribe_slot(id, slot_id)}>
        Remove participant
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>