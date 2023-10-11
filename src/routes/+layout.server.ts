import { fetchUser } from '$lib/server/UserFetcher.js';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, route }) {
    const onUnAuthedPage = route.id === '/' || route.id === '/login' || route.id === '/register';

    const user = await fetchUser(cookies);
    if (user) {
        if (onUnAuthedPage) {
            throw redirect(302, '/home');
        }

        return {
            authenticated: true,
            username: user.username
        };
    }

    if (!onUnAuthedPage) {
        throw redirect(302, '/login');
    }

    return {
        authenticated: false
    };
}