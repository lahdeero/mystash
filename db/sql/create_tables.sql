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

CREATE TABLE backupnote(
	id SERIAL PRIMARY KEY,
	note_id integer,
	title varchar(256) NOT NULL,
	content text NOT NULL,
	modified_date timestamp,
	created_date timestamp,
	account_id integer REFERENCES Account(id),
	FOREIGN KEY(note_id) REFERENCES Note(id)	
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

-- dev login info: testi / salasana
INSERT INTO account (username, password, realname,email, tier, github_id) VALUES('testi', '$2b$10$Z2Hw2e.kUu1KVXJ0brEgdesGN9Uqj51UiKVVUUoi85mPj0NMc.wBi',	'testaaja','testi@host.fi', 1, 123456);

