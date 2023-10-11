import type { Cookies } from "@sveltejs/kit";
import { getUserBySessionToken } from "./database";

export async function fetchUser(cookies: Cookies) {
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) {
        cookies.delete('session_token');

        return null;
    }

    const user = await getUserBySessionToken(sessionToken);
    if (!user.ok) {
        cookies.delete('session_token');

        return null;
    }

    return user.value;
}