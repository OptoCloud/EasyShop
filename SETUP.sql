CREATE TABLE [IF NOT EXISTS] users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
);

CREATE TABLE [IF NOT EXISTS] sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,

    CONSTRAINT sessions_userid_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE [IF NOT EXISTS] shopping_lists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    public_id TEXT NOT NULL UNIQUE
);

CREATE TABLE [IF NOT EXISTS] shopping_list_items (
    shopping_list_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    checked BOOLEAN NOT NULL,

    PRIMARY KEY (shopping_list_id, name),
    CONSTRAINT shoppinglistitems_shoppinglistid_fk FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);

CREATE TABLE [IF NOT EXISTS] user_shopping_list_mappings (
    user_id INTEGER NOT NULL,
    shopping_list_id INTEGER NOT NULL,

    PRIMARY KEY (user_id, shopping_list_id),
    CONSTRAINT usershoppinglistmappings_userid_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT usershoppinglistmappings_shoppinglistid_fk FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);