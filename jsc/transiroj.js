/*
    Ni difinos stato-transirojn "de1"->"al1", "de2"->"al1" ktp. 
    kiel strukturo, kiu korme enhavas agojn forlasajn kaj alvenajn.
    Transiroj krome povas esti protektataj per gardo-kondiĉo.

    { al1: { 
        "__alvene__"; {
            ago: ag_func
        },
        "__forire__"; {
            ago: ag_func
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
Transiroj.prototype.transire = function(de,al,ago,gardo=null) {
    //...
    if (!this.trans[al]) this.trans[al] = {};
    if (! this.trans[al][de])
        this.trans[al][de] = {ago: ago, grd: gardo};
    else 
        throw new TransiroEscepto("Transiro "+de+" -> "+al+" jam difinita.");   
}

// difino de alveno al stato, kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.alvene = function(al,ago) {
    //...
    if (!this.trans[al]) this.trans[al] = {};
    if (!this.trans[al]["__alvene__"])
        this.trans[al]["__alvene__"] = {ago: ago};
    else 
        throw new TransiroEscepto("Alveno al "+al+" jam difinita.");   
}

// difino de forio de stato, kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.forire = function(de,ago) {
    //...
    if (!this.trans[de]) this.trans[de] = {};
    if (!this.trans[de]["__forire__"])
        this.trans[de]["__forire__"] = {ago: ago};
    else 
        throw new TransiroEscepto("Foriro de "+de+" jam difinita.");   
}

/** 
 * por ne konolikigi ni momente rezignas konekti rekte DOM-eventojn kun Transiroj,
 * sed lasas tion en kadro.js ktp. Tamen ni povus pripensi uzi CustomEvent("transiro",{details:{...}})
 * por transiri al nova stato...:
 * document.addEventHandler("transiro", ...)
 * 
// alligu transiron [de->]al ĉe elemento je evento
Transiroj.prototype.je = function(element_id,evento,al,de=null) {
    var el = document.getElementById(element_id);
    const a = this.trans[al];
    if (!a) console.error(this.nomo+": alira stato \""+al+"\" ne difinita.");
    const t = de? a[de] : a["ĉiam"];
    const self=this;
    el.addEventListener(evento, function(ev) {
        if(!t.grd || t.grd(ev)) { // KOREKTU: tiel ni duoble testas grd: tie ĉi kaj en transiro!
            console.debug("transiro "+de+" -> "+al);
            ev.preventDefault();
            self.transiro(al,de||this.stato,ev)
        }
    });
}
*/

Transiroj.prototype.transiro = function (al,de=null,evento) {
    // PLIBONIGU:
    // strukturu ĉi-funkcion
    // 1. eltrovu eĝon al nova stato konsidernate eblajn gardojn
    // 2. forlasu nunan staton (senkondiĉe)
    // 3. transiru al nova stato
    // 4. alvenu ĉe nova stato (senkondiĉe)


    // provizore ni ignoras transirojn al identa stato,
    // ĉe eble ni poste bezonos ankaŭ agojn por transiroj kiel artikolo->artikolo?
    if (al == this.stato) {
        console.info("transiro "+this.stato+" -> "+al+ "(ignorata).");
        return;
    }

    const a = this.trans[al]; // ĉu transiro estas difinita?
    // proviore ne kreu escepton, sed nur avertu
    // if (!a) throw new TransiroEscepto("transira stato \""+al+"\" ne difinita.");
    if (!a) {
        console.warn("transira stato \""+al+"\" ne difinita.");
        //return;
    }

    if (!de) de = this.stato;    
    const d = this.trans[de]; // ĉu transiro estas difinita?
    // proviore ne kreu escepton, sed nur avertu
    // if (!d) throw new TransiroEscepto("forlasita stato \""+de+"\" ne difinita.");
    if (!d) {
        console.warn("forlasita stato \""+de+"\" ne difinita.");
        //return;
    }

    // gardo/ago difinita por ->al
    const t0 = d? d["__forire__"]: null;
    if (t0 && (!t0.grd||t0.grd(evento))) {
        console.debug(this.nomo+": foriro de "+de);
        // faru transiran agon
        if (t0.ago) t0.ago(evento);
    }

    // gardo/ago difinita por de->al
    const t = a? a[de]: null;
    // proviore ne kreu escepton, sed nur avertu
    //if (!t) throw new TransiroEscepto("transiro de \""+de+"\" al \""+al+"\" ne difinita.");
    // se gardkondiĉo validas?
    //if (!t) console.error("transiro de \""+de+"\" al \""+al+"\" ne difinita.");

    if(t && (!t.grd || t.grd(evento)) ) {
        console.debug(this.nomo+": transiro "+de+" -> "+al);
        // faru transiran agon
        if (t.ago) t.ago(evento);
    }

    // gardo/ago difinita por ->al
    const t1 = a? a["__alvene__"]: null;
    if (t1 && (!t1.grd||t1.grd(evento))) {
        console.debug(this.nomo+": alveno al "+al);
        // faru transiran agon
        if (t1.ago) t1.ago(evento);
    }

    // notu novan staton, en okazo, ke t.ago ne estis farita...    
    this.stato = al;
}