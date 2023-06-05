
CREATE TABLE submeto (
  sub_id INTEGER PRIMARY KEY NOT NULL, -- implicite, do ne skribenda: AUTOINCREMENT 
  sub_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sub_state VARCHAR(5) NOT NULL DEFAULT 'nov'
    CHECK (sub_state IN ('nov','trakt','arkiv','erar','ignor')), 
                                -- trakt' = traktata, 'arkiv' = akceptita/arkivita, 'eraro' = rifuzita pro eraro
                                -- ignor ni uzas por testado
  sub_email VARCHAR(50) NOT NULL,
  sub_cmd VARCHAR(20) NOT NULL DEFAULT 'redakto', -- 'aldono' por nova dosiero, principe eblus ankau forigo!
  sub_desc VARCHAR(255) NOT NULL, -- la ŝanĝpriskribo
  sub_type VARCHAR(20) NOT NULL DEFAULT 'xml', -- 'zip/xml' por kunpremita xml
  sub_fname VARCHAR(50) NOT NULL, -- ĉe 'aldono' la nomo de nova dosiero
  sub_content TEXT NOT NULL,
  sub_result TEXT
);

CREATE INDEX inx_sub_state ON submeto(sub_state);
CREATE INDEX inx_sub_email ON submeto(sub_email);


