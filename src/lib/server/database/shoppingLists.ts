import type { Failable } from '$lib/server/Failable';
import type { PostgresError, Row } from 'postgres';
import sql from './instance';
import { cryptoRandomStringAsync } from 'crypto-random-string';

interface DB_ShoppingList_LeftJoin_Items {
    id: number;
    name: string;
    description: string;
    public_id: string;
    items__name: string;
    items__checked: boolean;
}

export interface DbShoppingList {
    id: number;
    name: string;
    description: string;
    public_id: string;
}
export interface DbShoppingListItem {
    shopping_list_id: number;
    name: string;
    checked: boolean;
}
export interface ShoppingListItem {
    name: string;
    checked: boolean;
}
export interface ShoppingListWithItems extends DbShoppingList {
    items: ShoppingListItem[];
}

/**
 * Creates a new shopping list
 * 
 * @param user_id The id of the user to create the shopping list for
 * @param name The name of the shopping list
 * @param description The description of the shopping list
 * 
 * @returns A failable containing the shopping list if successful, or an error message if not
 */
export async function createShoppingList(user_id: number, name: string, description: string): Promise<Failable<DbShoppingList, string, PostgresError>> {
    try {
        const publicId = await cryptoRandomStringAsync({ length: 64, type: 'url-safe' });

        const shoppingLists = await sql<DbShoppingList[]>`
            INSERT INTO shopping_lists (
                name,
                description,
                public_id
            ) VALUES (
                ${name},
                ${description},
                ${publicId}
            )
            RETURNING *
        `;

        if (shoppingLists.length === 0) {
            return {
                ok: false,
                error: 'Shopping list not created'
            };
        }

        const shoppingList = shoppingLists[0];

        const userShoppingListMappings = await sql<Row[]>`
            INSERT INTO user_shopping_list_mappings (
                user_id,
                shopping_list_id
            ) VALUES (
                ${user_id},
                ${shoppingList.id}
            )
            RETURNING *
        `;

        if (userShoppingListMappings.length === 0) {
            return {
                ok: false,
                error: 'Shopping list not created'
            };
        }

        return {
            ok: true,
            value: shoppingList
        };
    } catch (error) {
        const pgError = error as PostgresError;

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        };
    }
}

/**
 * Deletes a shopping list
 * 
 * @param user_id The id of the user to delete the shopping list for
 * @param shopping_list_id The id of the shopping list to delete
 * 
 * @returns A failable containing the shopping list if successful, or an error message if not
 */
export async function deleteShoppingList(publicId: string, ownerUserId: number): Promise<Failable<'deleted', string, PostgresError>> {
    try {
        const shoppingLists = await sql<DbShoppingList[]>`
            DELETE FROM shopping_lists
            LEFT JOIN user_shopping_list_mappings AS uslm
                ON shopping_lists.id = uslm.shopping_list_id
            WHERE
                shopping_lists.public_id = ${publicId} AND
                uslm.user_id = ${ownerUserId}
            RETURNING *
        `;

        if (shoppingLists.length === 0) {
            return {
                ok: false,
                error: 'Shopping list not deleted'
            };
        }

        return {
            ok: true,
            value: 'deleted'
        };
    } catch (error) {
        const pgError = error as PostgresError;

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        };
    }
}

/**
 * Gets a shopping list by its public id, including its items
 * 
 * @param publicId The public id of the shopping list
 * @param ownerUserId Optional. The id of the user that owns the shopping list, will be used to check if the shopping list is owned by the user
 * 
 * @returns A failable containing the shopping list if successful, or an error message if not
 */
export async function getShoppingListByPublicId(publicId: string, ownerUserId: number | null): Promise<Failable<ShoppingListWithItems | null, string, PostgresError>> {
    try {
        const shoppingListsWithItems = await sql<DB_ShoppingList_LeftJoin_Items[]>`
            SELECT
                sl.id,
                sl.name,
                sl.description,
                sl.public_id,
                sli.name AS items__name,
                sli.checked AS items__checked
            FROM shopping_lists AS sl
            LEFT JOIN shopping_list_items AS sli
                ON sl.id = sli.shopping_list_id
            ${ownerUserId ? sql`INNER JOIN user_shopping_list_mappings AS uslm ON sl.id = uslm.shopping_list_id` : sql``}
            WHERE sl.public_id = ${publicId} ${ownerUserId ? sql`AND uslm.user_id = ${ownerUserId}` : sql``}
        `;

        if (shoppingListsWithItems.length === 0) {
            return {
                ok: true,
                value: null
            };
        }

        const first = shoppingListsWithItems[0];

        return {
            ok: true,
            value: {
                id: first.id,
                name: first.name,
                description: first.description,
                public_id: first.public_id,
                items: shoppingListsWithItems
                    .filter(i => !!i.items__name) // Filter out items that don't exist
                    .map((item) => {
                        return {
                            name: item.items__name,
                            checked: item.items__checked
                        };
                    })
            }
        };
    } catch (error) {
        const pgError = error as PostgresError;

        console.error(pgError);

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        };
    }
}

/**
 * Lists all shopping lists for the given user, including their items
 * 
 * @param id The id of the shopping list
 * 
 * @returns A failable containing the shopping list if successful, or an error message if not
 */
export async function getShoppingListsWithItemsByUserId(userId: number): Promise<Failable<ShoppingListWithItems[], string, PostgresError>> {
    try {
        const shoppingListsWithItems = await sql<DB_ShoppingList_LeftJoin_Items[]>`
            SELECT
                sl.id,
                sl.name,
                sl.description,
                sl.public_id,
                sli.name AS items__name,
                sli.checked AS items__checked
            FROM shopping_lists AS sl
            LEFT JOIN shopping_list_items AS sli
                ON sl.id = sli.shopping_list_id
            INNER JOIN user_shopping_list_mappings AS uslm
                ON sl.id = uslm.shopping_list_id
            WHERE uslm.user_id = ${userId}
        `;

        if (shoppingListsWithItems.length === 0) {
            return {
                ok: true,
                value: []
            };
        }

        // Group the items by shopping list
        const shoppingListsWithItemsMap = new Map<number, ShoppingListWithItems>();
        for (const shoppingListWithItems of shoppingListsWithItems) {
            const shoppingListId = shoppingListWithItems.id;

            let shoppingListWithItemsGroup = shoppingListsWithItemsMap.get(shoppingListId);
            if (!shoppingListWithItemsGroup) {
                shoppingListWithItemsGroup = {
                    id: shoppingListWithItems.id,
                    name: shoppingListWithItems.name,
                    description: shoppingListWithItems.description,
                    public_id: shoppingListWithItems.public_id,
                    items: []
                };

                shoppingListsWithItemsMap.set(shoppingListId, shoppingListWithItemsGroup);
            }

            shoppingListWithItemsGroup.items.push({
                name: shoppingListWithItems.items__name,
                checked: shoppingListWithItems.items__checked
            });
        }

        return {
            ok: true,
            value: Array.from(shoppingListsWithItemsMap.values())
        };
    } catch (error) {
        const pgError = error as PostgresError;

        console.error(pgError);

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        };
    }
}

/**
 * Adds an item to a shopping list
 * 
 * @param publicId The public id of the shopping list to add the item to
 * @param ownerUserId The id of the user that owns the shopping list, will be used to check if the shopping list is owned by the user
 * @param name The name of the item to add
 * 
 * @returns A failable containing the shopping list if successful, or an error message if not
 */
export async function insertItemIntoShoppingList(publicId: string, ownerUserId: number, name: string): Promise<Failable<'success', string, PostgresError>> {
    try {
        const shoppingList = await getShoppingListByPublicId(publicId, ownerUserId);
        if (!shoppingList.ok || !shoppingList.value) {
            return {
                ok: false,
                error: 'Shopping list not found'
            };
        }

        const shoppingListItems = await sql<DbShoppingListItem[]>`
            INSERT INTO shopping_list_items (
                shopping_list_id,
                name,
                checked
            ) VALUES (
                ${shoppingList.value.id},
                ${name},
                false
            )
            RETURNING *
        `;

        if (shoppingListItems.length === 0) {
            return {
                ok: false,
                error: 'Item not added'
            };
        }

        return {
            ok: true,
            value: 'success'
        };
    } catch (error) {
        const pgError = error as PostgresError;

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        };
    }
}