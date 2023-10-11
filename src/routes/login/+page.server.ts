import { fail, redirect } from '@sveltejs/kit';
import { getUserByLogin } from '$lib/server/database';
import { createSession } from '$lib/server/database/sessions.js';
import { fetchUser } from '$lib/server/UserFetcher.js';

export async function load({ cookies }) {
    const user = await fetchUser(cookies);
    if (user) {
        throw redirect(302, '/home');
    }

    return {};
}

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();

        const usernameOrEmail = data.get('usernameOrEmail')?.toString();
        const password = data.get('password')?.toString();

        if (!usernameOrEmail || !password) {
            return fail(422, {
                success: false,
                usernameOrEmail,
                error: 'Username/email and password are required'
            });
        }

        const user = await getUserByLogin(usernameOrEmail, password);
        if (!user.ok) {
            if (user.exception) {
                console.error(user.exception);
            }

            return fail(400, {
                success: false,
                usernameOrEmail,
                error: user.error
            });
        }

        const session = await createSession(user.value.id);
        if (!session.ok) {
            if (session.exception) {
                console.error(session.exception);
            }

            return fail(400, {
                success: false,
                usernameOrEmail,
                error: session.error
            });
        }

        cookies.set('session_token', session.value.token);

        return {
            success: true,
            usernameOrEmail,
            authToken: session.value.token
        }
    }
};
