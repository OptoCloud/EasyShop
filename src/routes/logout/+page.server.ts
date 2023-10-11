export function load({ cookies }) {
    cookies.delete('session_token');

    return {};
}