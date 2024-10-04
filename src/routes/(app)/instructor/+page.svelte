<script lang="ts">
    import {
      Card,
      CardDescription,
      CardHeader,
      CardTitle
    } from "$lib/components/ui/card";
    import type { User } from "@prisma/client";
    import { createTable } from "svelte-headless-table";
    import { addPagination } from "svelte-headless-table/plugins";
    import { readable } from "svelte/store";

    export let data: {
        users: User[];
    };

    const table = createTable(readable(data.users), {
        page: addPagination({
            initialPageSize: 5,
        }),
    });

    const columns = table.createColumns([
        table.column({
            accessor: ({ id }) => id.substring(0, 8) + "...",
            header: "ID",
        }),
        table.column({
            accessor: "churros_uid",
            header: "Churros UID",
        }),
        table.column({
            accessor: "first_name",
            header: "First Name",
        }),
        table.column({
            accessor: "last_name",
            header: "Last Name",
        }),
        table.column({
            accessor: "email",
            header: "Email",
        }),
        table.column({
            accessor: "root",
            header: "Root",
        }),
        table.column({
            accessor: "instructor",
            header: "Instructor",
        }),
    ]);

    const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
        table.createViewModel(columns);

    const { hasNextPage, hasPreviousPage, pageIndex, pageCount } =
        pluginStates.page;
</script>

<Card class="m-auto w-full h-full">
    <CardHeader>
        <CardTitle>Intervenant</CardTitle>
        <CardDescription>Pannel intervenant du site</CardDescription>
    </CardHeader>
</Card>
