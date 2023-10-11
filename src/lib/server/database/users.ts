import bcrypt from 'bcryptjs'
import sql from './instance'
import type { PostgresError } from 'postgres';
import type { Failable } from '$lib/server/Failable';
import { sha512 } from 'hash.js';

export interface DbUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

/**
 * Inserts a new user into the database
 * 
 * @param username The username of the new user
 * @param email The email of the new user
 * @param password The password of the new user
 * 
 * @returns A failable containing the new user if successful, or an error message if not
 */
export async function createUser(username: string, email: string, password: string): Promise<Failable<DbUser, string, PostgresError>> {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const users = await sql<DbUser[]>`
      INSERT INTO users
        (username, email, password_hash)
      VALUES
        (${username}, ${email}, ${passwordHash})
      RETURNING
        *
    `;

    if (users.length === 0) {
      console.error('Zero users returned after insert');

      return {
        ok: false,
        error: 'Internal server error'
      }
    }

    return {
      ok: true,
      value: users[0]
    }
  } catch (error) {
    const pgError = error as PostgresError;

    let message: string | null = null;

    if (pgError.code === '23505') {
      const constraint = pgError.constraint_name;

      switch (constraint) {
        case 'users_username_unique':
          message = 'Username already exists';
          break;
        case 'users_email_unique':
          message = 'Email already exists';
          break;
        default:
          console.error('Query failed with unknown constraint', constraint, pgError);
          message = 'Internal server error';
          break;
      }
    }

    if (!message) {
      console.error(pgError);
      message = 'Internal server error';
    }

    return {
      ok: false,
      error: message,
      exception: pgError
    }
  }
}

/**
 * Gets a user from the database by their username or email and password
 * 
 * @param usernameOrEmail The username or email of the user
 * @param password The password of the user
 * 
 * @returns A promise containing the user if successful, or null if not
 */
export async function getUserByLogin(usernameOrEmail: string, password: string): Promise<Failable<DbUser, string, PostgresError>> {
  try {
    const users = await sql<DbUser[]>`
      SELECT
        *
      FROM users
      WHERE
        username = ${usernameOrEmail} OR
        email = ${usernameOrEmail}
      LIMIT 1
    `;

    if (users.length === 0) {
      // Wait a bit to prevent timing attacks, ideally we'd profile bcrypt.compare and wait for that long
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        ok: false,
        error: 'User, email or password incorrect'
      }
    }

    const passwordOk = await bcrypt.compare(password, users[0].password_hash);
    if (!passwordOk) {
      return {
        ok: false,
        error: 'User, email or password incorrect'
      }
    }

    return {
      ok: true,
      value: users[0]
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
 * Gets a user from the database by their session token
 * 
 * @param sessionToken The session token of the user
 * 
 * @returns A failable containing the user if successful, or an error message if not
 */
export async function getUserBySessionToken(sessionToken: string): Promise<Failable<DbUser, string, PostgresError>> {
  const tokenHash = sha512().update(sessionToken).digest('hex');

  try {
    const users = await sql<DbUser[]>`
      SELECT
        users.*
      FROM users
      INNER JOIN sessions
        ON users.id = sessions.user_id
      WHERE
        sessions.token_hash = ${tokenHash}
      LIMIT 1
    `;

    if (users.length === 0) {
      return {
        ok: false,
        error: 'Invalid session token'
      };
    }

    return {
      ok: true,
      value: users[0]
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

