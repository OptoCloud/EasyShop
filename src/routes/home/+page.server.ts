import { fetchUser } from '$lib/server/UserFetcher.js';
import { createShoppingList, getShoppingListsWithItemsByUserId } from '$lib/server/database/shoppingLists';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const user = await fetchUser(cookies);
    if (!user) {
        throw redirect(302, '/logout');
    }

    const shoppingListsResponse = await getShoppingListsWithItemsByUserId(user.id);
    const shoppingLists = shoppingListsResponse.ok ? shoppingListsResponse.value : [];

    return {
        username: user.username,
        shoppingLists: shoppingLists.map((shoppingList) => {
            return {
                id: shoppingList.public_id,
                name: shoppingList.name,
                description: shoppingList.description,
                items: shoppingList.items.map((item) => {
                    return {
                        name: item.name,
                        checked: item.checked
                    };
                })
            };
        })
    };
}

export const actions = {
    addShoppingList: async ({ request, cookies }) => {
        const data = await request.formData();

        const name = data.get('name')?.toString();
        const description = data.get('description')?.toString() ?? '';

        if (!name) {
            return fail(422, {
                success: false,
                name,
                description,
                error: 'Name is required'
            });
        }

        const user = await fetchUser(cookies);
        if (!user) {
            throw redirect(302, '/logout');
        }

        const shoppingList = await createShoppingList(user.id, name, description);
        if (!shoppingList.ok) {
            return fail(500, {
                success: false,
                name,
                description,
                error: shoppingList.error
            });
        }

        return {
            success: true,
            name,
            description,
            shoppingList: {
                id: shoppingList.value.id,
                name: shoppingList.value.name,
                description: shoppingList.value.description,
                items: []
            }
        };
    }
};
