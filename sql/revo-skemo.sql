CREATE TABLE nodo (
  mrk TEXT PRIMARY KEY NOT NULL,
  kap TEXT NOT NULL,
  num VARCHAR(5)
);

CREATE TABLE traduko (
  mrk TEXT NOT NULL,
  lng VARCHAR(3) NOT NULL,
  trd TEXT NOT NULL,
  txt TEXT
);

CREATE TABLE referenco (
  mrk TEXT NOT NULL,
  cel TEXT NOT NULL,
  tip VARCHAR(7)
);

CREATE TABLE uzo (
  mrk TEXT NOT NULL,
  uzo VARCHAR(7) NOT NULL
);

CREATE TABLE malong ( 
  mrk TEXT NOT NULL,
  mlg TEXT NOT NULL
);

CREATE TABLE bildo ( 
  mrk TEXT NOT NULL,
  url TEXT NOT NULL,
  txt TEXT
);

CREATE TABLE artikolo (
  mrk TEXT PRIMARY KEY NOT NULL,
  txt TEXT
);

