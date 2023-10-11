import { fail, redirect } from '@sveltejs/kit';
import { createUser } from '$lib/server/database';
import { validate } from 'email-validator';
import { fetchUser } from '$lib/server/UserFetcher.js';

export async function load({ cookies }) {
    const user = await fetchUser(cookies);
    if (user) {
        throw redirect(302, '/home');
    }

    return {};
}

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        const username = data.get('username')?.toString();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !email || !password) {
            return fail(422, {
                success: false,
                username,
                email,
                error: 'Username, email and password are required'
            });
        }

        if (username.length < 3) {
            return fail(400, {
                success: false,
                username,
                email,
                error: 'Username must be at least 3 characters long'
            });
        }

        if (username.length > 20) {
            return fail(400, {
                success: false,
                username,
                email,
                error: 'Username must be at most 20 characters long'
            });
        }

        if (!validate(email.toString())) {
            return fail(400, {
                success: false,
                username,
                email,
                error: 'Email must be a valid email address'
            });
        }

        if (password.length < 8 || password.length > 64) {
            return fail(400, {
                success: false,
                username,
                email,
                error: 'Password must be at least 8 characters long'
            });
        }

        const user = await createUser(username, email, password);
        if (!user.ok) {
            if (user.exception) {
                console.error(user.exception);
            }

            return fail(400, {
                success: false,
                username,
                email,
                error: user.error
            });
        }

        return {
            success: true,
            username,
            email,
        }
    }
};
