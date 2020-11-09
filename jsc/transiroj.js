/*
    Ni difinos stato-transirojn "de1"->"al1", "de2"->"al1" ktp. 
    kiel strukturo:

    { al1: { 
        "ĉiam"; {
            ago: ag_func,
            grd: gard_func
        },
        de1: {
            ago: ag_func,
            grd: gard_func
            }

        },
        ...
    },
    { al2:
        ...
    }

    Stato-maŝino estas kolekto da tiaj stato-transiroj, kiuj
    difinas, kiuj transiroj eblas kaj kio okazos dum transiroj.
    Transiroj povas havi limigan kondiĉon, nomatan gardo.

    Ĉar ni serĉos statojn dum transiro per statoj "_de_"+"_al_" aŭ "_al_",
    ni uzas _al_ kiel unua-ranga ŝlosilo kaj _de_ kiel dua-ranga.

    Ni uzas du sendependajn stato-mæsinojn por respeguli la staton
    de la sub-poaĝoj "nav" - navigado kaj "main" - ĉefa kadro, kie aperas titolüaĝo, artikoloj, redaktilo

*/

function Transiroj(nomo, start="start") {
    this.nomo = nomo;
    this.stato = start;
    this.trans = {}; //komence malplena
    //this.stats = {}; //komence malplena
}

function TransiroEscepto(message) {
    this.message = message;
    this.name = "TransiroEscepto";
  }

// difino de transiro inter statoj "de" kaj "al", 
// kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.de_al = function(de,al,ago=null,gardo=null) {
    //...
    if (!this.trans[al]) this.trans[al] = {};
    this.trans[al][de] = {ago: ago, grd: gardo}    
}

// difino de eniro al stato "en", kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.al = function(al,ago=null,gardo=null) {
    //...
    if (!this.trans[al]) this.trans[al] = {};
    this.trans[al]["ĉiam"] = {ago: ago, grd: gardo}
}

// alligu transiron [de->]al ĉe elemento je evento
Transiroj.prototype.je = function(element_id,evento,al,de=null) {
    var el = document.getElementById(element_id);
    const a = this.trans[al];
    if (!a) console.error(this.nomo+": alira stato \""+al+"\" ne difinita.");
    const t = de? a[de] : a["ĉiam"];
    const self=this;
    el.addEventListener(evento, function(ev) {
        if(!t.grd || t.grd(ev)) {
            console.debug("transiro "+de+" -> "+al);
            self.transiro(de||this.stato,al,ev)
        }
    });
}

Transiroj.prototype.transiro = function (de,al,evento) {
    // ĉu transiro estas difinita?
    const a = this.trans[al];
    if (!a) throw new TransiroEscepto("transira stato \""+al+"\" ne difinita.");
    const t = a[de];
    if (!t) throw new TransiroEscepto("transiro de \""+de+"\" al \""+al+"\" ne difinita.");
    // se gardkondiĉo validas?
    if(!t.grd || t.grd(evento)) {
        // faru transiran agon
        if (t.ago) t.ago(evento);
        // notu novan staton    
        this.stato = al;
    }
}