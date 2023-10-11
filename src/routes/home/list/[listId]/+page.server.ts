import { fetchUser } from '$lib/server/UserFetcher.js';
import { insertItemIntoShoppingList, getShoppingListByPublicId } from '$lib/server/database/shoppingLists';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params, cookies }) {
    const user = await fetchUser(cookies);
    if (!user) {
        throw redirect(302, '/logout');
    }

    const shoppingListsResponse = await getShoppingListByPublicId(params.listId, user.id);
    if (!shoppingListsResponse.ok || !shoppingListsResponse.value) {
        return fail(404, {
            success: false,
            error: 'Shopping list not found'
        });
    }

    return {
        username: user.username,
        shoppingList: shoppingListsResponse.value
    };
}

export const actions = {
    addItem: async ({ params, request, cookies }) => {
        const data = await request.formData();

        const itemName = data.get('itemName')?.toString();
        if (!itemName) {
            return fail(422, {
                success: false,
                itemName,
                error: 'Item name is required'
            });
        }

        const user = await fetchUser(cookies);
        if (!user) {
            throw redirect(302, '/logout');
        }

        const publicListId = params.listId;

        const result = await insertItemIntoShoppingList(publicListId, user.id, itemName);
        if (!result.ok) {
            return fail(500, {
                success: false,
                error: result.error
            });
        }

        return {
            success: true,
            itemName
        };
    }
};
