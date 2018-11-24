CREATE TABLE kayttaja(
	id SERIAL PRIMARY KEY,
	nimi varchar(32) NOT NULL UNIQUE,
	salasana varchar(32) NOT NULL
);

CREATE TABLE muistiinpano(
	id SERIAL PRIMARY KEY,
	otsikko varchar(256) NOT NULL,
	sisalto text NOT NULL,
	kayttaja_id integer REFERENCES Kayttaja(id)
);

CREATE TABLE tagi(
	id SERIAL PRIMARY KEY,
	nimi varchar(32)
);

CREATE TABLE muistiinpanotagi (
	muistiinpano_id integer,
	tagi_id integer,
	FOREIGN KEY(muistiinpano_id) REFERENCES Muistiinpano(id) ON DELETE CASCADE,
	FOREIGN KEY(tagi_id) REFERENCES Tagi(id) ON DELETE CASCADE
);


