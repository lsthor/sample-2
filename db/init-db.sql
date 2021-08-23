CREATE TABLE characters (
    id bigint primary key,
    name text,
    description text,
    etag text unique not null
);
