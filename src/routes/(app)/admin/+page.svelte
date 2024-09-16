<script lang="ts">
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Root } from "@/components/ui/separator";
    import * as Table from "@/components/ui/table/";
    import type { PageData } from "../user/edit/$types";
    import type { User } from "@prisma/client";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import { createTable, Render, Subscribe } from "svelte-headless-table";
    import { readable } from "svelte/store";
    import { addPagination } from "svelte-headless-table/plugins";
    import { Button } from "$lib/components/ui/button";
    import CardFooter from "@/components/ui/card/card-footer.svelte";

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
        <CardTitle>Admin</CardTitle>
        <CardDescription>Pannel admin du site</CardDescription>
    </CardHeader>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="m-4 w-full border-t" />
        </div>
    </div>

    <CardContent class="flex gap-4 pt-6">
        <div class="rounded-md border w-full">
            <Table.Root {...$tableAttrs}>
                <Table.Header>
                    {#each $headerRows as headerRow}
                        <Subscribe rowAttrs={headerRow.attrs()}>
                            <Table.Row>
                                {#each headerRow.cells as cell (cell.id)}
                                    <Subscribe
                                        attrs={cell.attrs()}
                                        let:attrs
                                        props={cell.props()}
                                    >
                                        <Table.Head {...attrs}>
                                            <Render of={cell.render()} />
                                        </Table.Head>
                                    </Subscribe>
                                {/each}
                            </Table.Row>
                        </Subscribe>
                    {/each}
                </Table.Header>
                <Table.Body {...$tableBodyAttrs}>
                    {#each $pageRows as row (row.id)}
                        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                            <Table.Row {...rowAttrs}>
                                {#each row.cells as cell (cell.id)}
                                    <Subscribe attrs={cell.attrs()} let:attrs>
                                        <Table.Cell {...attrs}>
                                            <Render of={cell.render()} />
                                        </Table.Cell>
                                    </Subscribe>
                                {/each}
                            </Table.Row>
                        </Subscribe>
                    {/each}
                </Table.Body>
            </Table.Root>
        </div>
    </CardContent>

    <div class="relative">
        <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
        </div>
    </div>

    <CardFooter>
        <div class="flex items-center justify-end space-x-4 py-4">
            <Button
                variant="outline"
                size="sm"
                on:click={() => ($pageIndex = $pageIndex - 1)}
                disabled={!$hasPreviousPage}>Previous</Button
            >
            <span class="text-gray-500"
                >Page {$pageIndex + 1} / {$pageCount}</span
            >
            <Button
                variant="outline"
                size="sm"
                disabled={!$hasNextPage}
                on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
            >
        </div>
    </CardFooter>
</Card>
