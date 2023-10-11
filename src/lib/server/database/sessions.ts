import sql from './instance'
import type { PostgresError } from 'postgres';
import type { Failable } from '$lib/server/Failable';
import hash from 'hash.js'
import { cryptoRandomStringAsync } from 'crypto-random-string'

export interface DbSession {
    id: number;
    user_id: number;
    token_hash: string;
}

/**
 * Gets a session from the database by its token
 * 
 * @param token The token of the session
 * 
 * @returns A failable containing the session if successful, or an error message if not
 */
export async function getSessionByToken(token: string): Promise<Failable<DbSession, string, PostgresError>> {
    const tokenHash = hash.sha512().update(token).digest('hex');

    try {
        const sessions = await sql<DbSession[]>`
            SELECT
                *
            FROM sessions
            WHERE
                token_hash = ${tokenHash}
            LIMIT 1
        `;

        if (sessions.length === 0) {
            return {
                ok: false,
                error: 'Session not found'
            }
        }

        return {
            ok: true,
            value: sessions[0]
        }
    } catch (error) {
        const pgError = error as PostgresError;

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        }
    }
}

/**
 * Creates a new session for a given user
 * 
 * @param user_id The id of the user
 * 
 * @returns A failable containing the session id and token if successful, or an error message if not
 */
export async function createSession(user_id: number): Promise<Failable<{ id: number, token: string }, string, PostgresError>> {
    const token = await cryptoRandomStringAsync({ length: 64, type: 'url-safe' });
    const tokenHash = hash.sha512().update(token).digest('hex');

    try {
        const sessions = await sql<DbSession[]>`
            INSERT INTO sessions
                (user_id, token_hash)
            VALUES
                (${user_id}, ${tokenHash})
            RETURNING
                *
        `;

        if (sessions.length === 0) {
            return {
                ok: false,
                error: 'Internal server error'
            }
        }

        return {
            ok: true,
            value: {
                id: sessions[0].id,
                token
            }
        }
    } catch (error) {
        const pgError = error as PostgresError;

        return {
            ok: false,
            error: 'Internal server error',
            exception: pgError
        }
    }
}