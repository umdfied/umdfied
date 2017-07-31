DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE users (
  id            serial PRIMARY KEY,
  ip_address    inet NOT NULL,
  country       text NOT NULL
);

CREATE INDEX lower_country ON users (lower(country));

CREATE TABLE package (
  id      serial PRIMARY KEY,
  name    text NOT NULL,
  version text NOT NULL,
  cdn	  text NOT NULL
);

CREATE INDEX lower_name ON package (lower(name));

