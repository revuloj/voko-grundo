CREATE TABLE revo.kategorio (
  id_kateg VARCHAR(10) PRIMARY KEY NOT NULL, -- lx_en, fx_BELE, mlg,
  tipo VARCHAR(10), -- lingvo, fako, speciala
  subtipo VARCHAR(10), -- lingvoj: de, en, eo..., fakoj: BELE, GEOG k.a., specialaj: bildoj, mlg-oj, inversa
  nomo TEXT, -- legebla nomo de la indekso, ekz "esperanta", "angla", "matematiko"
  simbolo TEXT -- URL / nomo de vinjeto  
);


CREATE TABLE revo.indekso (
  kapvorto TEXT PRIMARY KEY NOT NULL, -- legebla kapvorto de indeksero, ekz. ""Abbildung"
  teksto TEXT NOT NULL, -- normale sama, sed foje pli longa ol kapvorto, ekz. "identische _Abbildung_"
  id_kateg VARCHAR(10) NOT NULL, -- referenco al la indekso
  subkateg VARCHAR(10), -- ekzemple la litero ene de lingva indekso
  celref TEXT, -- referenco al artikolo (@mrk)
  ordigo TEXT, -- teksto por alfabete ordigi lau unua stupo - ne distingante majusklojn, supersignojn
  subordigo TEXT, -- teksto por ordigi alfabete lau dua stupo
  tushita BOOLEAN,
  FOREIGN KEY(id_kategorio) REFERENCES revo.kategorio(id_kategorio)
);

CREATE TABLE revo.tezauro (
  fontref TEXT PRIMARY KEY NOT NULL, -- la referenco de la tezauronodo (@mrk)
  celref TEXT NOT NULL, -- referencas al tezauro.fontref, sed ne estas kontrolata automate (@cel)
  tipo VARCHAR(10), -- tipoj estas super, sub, sin, ant, ujo, ero, vid, lst, ekz
  tez_radiko VARCHAR(10), -- se temas pri chefa nocio, tio referencas al la koncerna indekso (eo au fako)
  kapvorto TEXT NOT NULL, -- la kapvorto, nomanta tiun derivajhon / sencon
  fako VARCHAR(10), -- la kapvorto kaj fako formas la titolon de la tazauropagho
  tushita BOOLEAN, -- por optimigi la aktualigon de la tabelo, oni povas marki shanghitajn erojn 
  FOREIGN KEY(tez_radiko) REFERENCES revo.kategorio(id_kategorio),
  FOREIGN KEY(fako) REFERENCES revo.kategorio(id_kategorio)
);
