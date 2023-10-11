import { PGSQL_HOST, PGSQL_PORT, PGSQL_DATABASE, PGSQL_USER, PGSQL_PASSWORD } from '$env/static/private';
import postgres from 'postgres';

const sql = postgres({
    host: PGSQL_HOST,
    port: Number(PGSQL_PORT),
    database: PGSQL_DATABASE,
    username: PGSQL_USER,
    password: PGSQL_PASSWORD,
    ssl: 'require'
});

export default sql;