import { env } from '$env/dynamic/private';
import postgres from 'postgres';

const sql = postgres({
    host: env.PGSQL_HOST,
    port: Number(env.PGSQL_PORT),
    database: env.PGSQL_DATABASE,
    username: env.PGSQL_USER,
    password: env.PGSQL_PASSWORD,
    ssl: 'require'
});

export default sql;