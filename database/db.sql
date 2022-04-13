CREATE TYPE status AS ENUM ('created', 'in process', 'canceled', 'done');

CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    name TEXT,
    date TIMESTAMP,
    status STATUS
);

