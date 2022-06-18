CREATE TABLE nodo (
  mrk TEXT PRIMARY KEY NOT NULL,
  art TEXT NOT NULL,
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
  tip VARCHAR(3) NOT NULL,
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

CREATE TABLE vorto_speco (
  mrk TEXT PRIMARY KEY NOT NULL,
  speco TEXT NOT NULL
);

CREATE TABLE agordo (
  nomo TEXT PRIMARY KEY NOT NULL,
  valoro TEXT
);
INSERT INTO agordo (nomo,valoro)
VALUES('kreotempo',datetime('now'));

CREATE VIEW _eo AS
SELECT
  nodo.kap AS eo,
  artikolo.txt AS teksto,
  nodo.ROWID AS ROWID
FROM nodo, artikolo
WHERE nodo.art = artikolo.mrk;

CREATE VIEW _de AS
SELECT
  traduko.trd AS de,
  nodo.kap AS eo,
  artikolo.txt AS teksto,
  traduko.ROWID AS ROWID
FROM traduko, nodo, artikolo
WHERE traduko.lng='de'
  AND traduko.mrk = nodo.mrk
  AND nodo.art = artikolo.mrk;


CREATE VIEW _fr AS
SELECT
  traduko.trd AS fr,
  nodo.kap AS eo,
  artikolo.txt AS teksto,
  traduko.ROWID AS ROWID
FROM traduko, nodo, artikolo
WHERE traduko.lng='fr'
  AND traduko.mrk = nodo.mrk
  AND nodo.art = artikolo.mrk;


CREATE VIEW _en AS
SELECT
  traduko.trd AS en,
  nodo.kap AS eo,
  artikolo.txt AS teksto,
  traduko.ROWID AS ROWID
FROM traduko, nodo, artikolo
WHERE traduko.lng='en'
  AND traduko.mrk = nodo.mrk
  AND nodo.art = artikolo.mrk;

CREATE VIEW _ru AS
SELECT
  traduko.trd AS ru,
  nodo.kap AS eo,
  artikolo.txt AS teksto,
  traduko.ROWID AS ROWID
FROM traduko, nodo, artikolo
WHERE traduko.lng='ru'
  AND traduko.mrk = nodo.mrk
  AND nodo.art = artikolo.mrk;



