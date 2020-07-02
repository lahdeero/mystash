CREATE USER username WITH PASSWORD 'password' CREATEDB;

CREATE DATABASE database OWNER username;

GRANT ALL PRIVILEGES ON DATABASE database TO username;

CREATE TABLE account (
	id SERIAL PRIMARY KEY,
	username varchar(64) NOT NULL UNIQUE,
	github_id varchar(32),
	google_id varchar(32),
	facebook varchar(32),
	password varchar(1024),
	realname varchar(256) NOT NULL,
	email varchar(256) NOT NULL UNIQUE,
	register_date DATE,
  tier integer NOT NULL
);

CREATE TABLE note(
	id SERIAL PRIMARY KEY,
	title varchar(256) NOT NULL,
	content text NOT NULL,
	modified_date timestamp,
	created_date timestamp,
	account_id integer REFERENCES Account(id)
);

CREATE TABLE tag(
	id SERIAL PRIMARY KEY,
	name varchar(32) NOT NULL UNIQUE
);

CREATE TABLE notetag (
	note_id integer,
	tag_id integer,
	FOREIGN KEY(note_id) REFERENCES Note(id) ON DELETE CASCADE,
	FOREIGN KEY(tag_id) REFERENCES Tag(id) ON DELETE CASCADE
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO username
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO username

INSERT INTO account (username, realname,email, tier, github_id) VALUES ('testi', 'testaaja','testi@host.fi', 1, 123456);

