/* jshint esversion: 6 */

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

function Transiroj(nomo, start="start", stats = []) {
    this.nomo = nomo;
    this.stato = start;
    this.trans = {}; //komence malplena
    this.stats = stats; //komence malplena
}

function TransiroEscepto(message) {
    this.message = message;
    this.name = "TransiroEscepto";
}

// difino de transiro inter statoj "de" kaj "al", 
// kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.transire = function(de,al,ago,gardo=null) {
    // permesu difinojn nur por jam difinitaj statoj, 
    // provizore ni ne permesas traniran funkcion start-><iu stato> - ĉu bezonata?
    if (this.stats.indexOf(al) == -1) throw TransiroEscepto("Stato \""+al+"\" ne difinita.");
    if (this.stats.indexOf(de) == -1) throw TransiroEscepto("Stato \""+de+"\" ne difinita.");
    // enigu la transiran funkcion en la strukturon "trans"
    if (!this.trans[al]) this.trans[al] = {};
    if (! this.trans[al][de])
        this.trans[al][de] = {ago: ago, grd: gardo};
    else 
        throw new TransiroEscepto("Transiro "+de+" -> "+al+" jam difinita.");   
};

// difino de alveno al stato, kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.alvene = function(al,ago) {
    // permesu difinojn nur por jam difinitaj statoj aŭ this.stato (start)
    if (this.stats.indexOf(al) == -1) throw TransiroEscepto("Stato \""+al+"\" ne difinita.");
    // enigu la transiran funkcion en la strukturon "trans"
    if (!this.trans[al]) this.trans[al] = {};
    if (!this.trans[al].__alvene__)
        this.trans[al].__alvene__ = {ago: ago};
    else 
        throw new TransiroEscepto("Alveno al "+al+" jam difinita.");   
};

// difino de forio de stato, kondiĉe ke funkcio "gardo" redonas true
// tiam la fukcio "ago" estos procedata
Transiroj.prototype.forire = function(de,ago) {
    // permesu difinojn nur por jam difinitaj statoj aŭ this.stato (start)
    if (this.stats.indexOf(de) == -1) throw TransiroEscepto("Stato \""+de+"\" ne difinita.");
    // enigu la transiran funkcion en la strukturon "trans"
    if (!this.trans[de]) this.trans[de] = {};
    if (!this.trans[de].__forire__)
        this.trans[de].__forire__ = {ago: ago};
    else 
        throw new TransiroEscepto("Foriro de "+de+" jam difinita.");   
};

/* vi povas forlasi de kaj evento...(?) */
Transiroj.prototype.transiro = function (al,de,evento) {
    // PLIBONIGU:
    // restrukturu ĉi-funkcion
    // 1. eltrovu eĝon al nova stato konsiderante eblajn gardojn
    // 2. forlasu nunan staton (senkondiĉe)
    // 3. transiru al nova stato
    // 4. alvenu ĉe nova stato (senkondiĉe)

    const n = this.nomo;

    function _forire(d) {
        // ago difinita por de->...
        const t = d.__forire__;
        if (t && t.ago) {
            console.debug(n+": foriro de "+de);
            // faru transiran agon
            t.ago(evento);
        }
    }    

    function _alvene(a) {
        // ago difinita por ...->al
        const t = a.__alvene__;
        if (t && t.ago) {
            console.debug(n+": alveno al "+al);
            // faru transiran agon
            t.ago(evento);
        }
    }

    function _transire(t) {
        if( t.ago && (!t.grd || t.grd(evento)) ) {
            console.debug(n+": transiro "+de+" -> "+al);
            // faru transiran agon
            t.ago(evento);
        }    
    }
    
    // permesu transiron nur al difinita stato
    if (this.stats.indexOf(al) == -1) throw TransiroEscepto("Stato \""+al+"\" ne difinita.");

    // provizore ni ignoras transirojn al identa stato,
    // ĉe eble ni poste bezonos ankaŭ agojn por transiroj kiel artikolo->artikolo?
    if (al == this.stato) {
        console.info("transiro "+this.stato+" -> "+al+ "(ignorata).");
        return;
    }

    const a = this.trans[al]; // ĉu transiro estas difinita?
    if (!de) de = this.stato;    
    const d = this.trans[de]; // ĉu transiro estas difinita?
    const t = a? a[de]: null;

    // ago por de -> ..
    if (d) _forire(d);

    // gardo/ago difinita por de->al
    if (t) _transire(t);

    // ATENTU: provizore ni senkondiĉe transiras al la nova stato
    // do fiaskinta gardo ne malhelpas tion!
    // se pluraj transiroj eblus depende de la gardo
    // (momente permesas nur unu, aliokaze avertas)
    // ni devus unue kontroli la gardon kaj nur 
    // se ekzias almenaŭ unu ebla eĝo iri al la nova stato

    // notu novan staton...    
    this.stato = al;

    // en _alvene ni povas fari aferojn, kiuj bezonas jam vidi la novan staton

    // ago por .. -> al
    if (a) _alvene(a);
};
