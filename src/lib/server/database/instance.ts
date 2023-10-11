import { env } from '$env/dynamic/private';
import postgres from 'postgres';

const sql = postgres({
    host: env.AZURE_PGSQL_HOST,
    port: Number(env.AZURE_PGSQL_PORT),
    database: env.AZURE_PGSQL_DATABASE,
    username: env.AZURE_PGSQL_USER,
    password: env.AZURE_PGSQL_PASSWORD,
    ssl: 'require'
});

export default sql;