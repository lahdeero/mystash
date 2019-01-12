CREATE TABLE account (
	id SERIAL PRIMARY KEY,
	username varchar(64) NOT NULL UNIQUE,
	password varchar(1024) NOT NULL,
	realname varchar(256) NOT NULL,
	email varchar(256) NOT NULL,
	register_date DATE,
    tier integer NOT NULL
);

CREATE TABLE note(
	id SERIAL PRIMARY KEY,
	title varchar(256) NOT NULL,
	content text NOT NULL,
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


