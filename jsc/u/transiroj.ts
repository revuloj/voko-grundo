/*
   (c) 2020, 2021-2023 ĉe Wolfram Diestel
   laŭ permesilo GPL 2.0

    Simpla stato-aŭtomato por reguligi la transirojn de la retpaĝaj 
    kadroj naviga, precipa kaj redakta.

    Ni difinos stato-transirojn "de1"->"al1", "de2"->"al1" ktp. 
    kiel strukturon, kiu aldone enhavas agojn forlasajn kaj alvenajn.
    Transiraj agoj krome povas esti protektataj per gardo-kondiĉo.
    (vd. malsupre pri aktuala limigo de tio)

    Stato-aŭtomato estas kolekto da tiaj stato-transiroj, kiuj
    difinas, kiuj transiroj eblas kaj kio okazos dum transiroj.
    Transiroj povas havi limigan kondiĉon, nomatan gardo.

    Ĉar ni serĉos statojn dum transiro per statoj "_de_"+"_al_" aŭ "_al_",
    ni uzas _al_ kiel unua-ranga ŝlosilo kaj _de_ kiel dua-ranga.

    En la retpaĝo de Revo, ni uzas tri sendependajn stato-aŭtomatojn por respeguli la staton
    de la sub-paĝoj "nav" - navigado, "main" - ĉefa kadro kaj "red" - redaktilo

    { <al1>: { 
        "__alvene__"; {
            ago: ag_func
        },
        "__forire__"; {
            ago: ag_func
        },
        <de1>: {
            ago: ag_func,
            grd: gard_func
            }

        },
        ...
    },
    { <al2>:
        ...
    }



*/

type Ago = {
    ago: Function
};

type Transago = Ago & {
    grd?: Function
};

/**
 * Transagoj reprezentas asocian liston de ĉiuj eblaj statoj (Nodoj) de la stato-aŭtomato
 * La ŝlosiloj ests la nomoj de la statoj. Pli konkrete tio estas la celstatoj:
 * la transiraj agoj estas difinitaj en tia nodo kiel alia asocia listo, 
 * en la formo <de: Transago>, vd. malsupre.
 */
type Transagoj = {
    // key <al> estas la nomo de celstato,
    // la Nodo difinias la alvenajn/forirajn agojn de la stato <al>
    // kaj la statojn _el_ kiuj oni povas atingi ĝin
    [key: string]: Nodo
};

type Nodo = {
    __alvene__?: Ago,
    __forire__?: Ago,
    // ceteraj atributoj (key <el>) estas la eblaj transiraj agoj
    // _el_ kiuj oni povas atingi la staton 
    [key: string]: Transago
};

class TransiroEscepto {
    public name: string = "TransiroEscepto";
    /**
     * Kreas transiro-escepton kun eraromesaĝo.
     * @constructor
     * @param {string} message - la eraromesaĝo
     */
    constructor(public message: string) {}
};

export class Transiroj {
    
    private trans: Transagoj;
    public stato: string;

    /**
     * Kreas novan statoaŭtomaton.
     * @constructor
     * @param nomo - la nomo de la statomasino
     * @param start - la komenca stato
     * @param stats - la eblaj statoj
     */
    constructor(public nomo: string, public start:string = "start", public stats: Array<string> = []) {
        //transiroj komence malplena
        this.trans = {}; 
    }


    /**
     * Difinas, kiu ago estu vokata ĉe transiro 'de'-&gt;'al' 
     * kaj sub kiu gardo-kondiĉo la transiro estas ebla
     * @param de - deira stato
     * @param al - alira stato
     * @param ago - vokenda ago
     * @param gardo - kondico de transiro
     */
    transire(de: string, al: string, ago: Function, gardo: Function=null) {
        // permesu difinojn nur por jam difinitaj statoj, 
        // provizore ni ne permesas traniran funkcion start-><iu stato> - ĉu bezonata?
        if (this.stats.indexOf(al) == -1) throw new TransiroEscepto("Stato \""+al+"\" ne difinita.");
        if (this.stats.indexOf(de) == -1) throw new TransiroEscepto("Stato \""+de+"\" ne difinita.");
        // enigu la transiran funkcion en la strukturon "trans"
        if (!this.trans[al]) this.trans[al] = {};
        if (! this.trans[al][de])
            this.trans[al][de] = {ago: ago, grd: gardo};
        else 
            throw new TransiroEscepto("Transiro "+de+" -> "+al+" jam difinita.");   
    };

    /**
     * Difinas, kiu ago okazu, kiam la cela transirstato estas 'al'
     * @param al - la alira stato
     * @param ago - la ago kiu okazu tiam
     */
    alvene(al: string, ago: Function) {
        // permesu difinojn nur por jam difinitaj statoj aŭ this.stato (start)
        if (this.stats.indexOf(al) == -1) throw new TransiroEscepto("Stato \""+al+"\" ne difinita.");
        // enigu la transiran funkcion en la strukturon "trans"
        if (!this.trans[al]) this.trans[al] = {};
        if (!this.trans[al].__alvene__)
            this.trans[al].__alvene__ = {ago: ago};
        else 
            throw new TransiroEscepto("Alveno al "+al+" jam difinita.");   
    };

    /**
     * Difinas, kiu ago okazu, kiam la forlasata transirstato estas 'de'
     * @param de - la deira stato
     * @param ago - la ago kiu okazu tiam
     */
    forire(de: string, ago: Function) {
        // permesu difinojn nur por jam difinitaj statoj aŭ this.stato (start)
        if (this.stats.indexOf(de) == -1) throw new TransiroEscepto("Stato \""+de+"\" ne difinita.");
        // enigu la transiran funkcion en la strukturon "trans"
        if (!this.trans[de]) this.trans[de] = {};
        if (!this.trans[de].__forire__)
            this.trans[de].__forire__ = {ago: ago};
        else 
            throw new TransiroEscepto("Foriro de "+de+" jam difinita.");   
    };

    /**
     * Efektivigas transiron de la statoaŭtomato de la stato
     * @param al - deira stato
     * @param de - alira stato, se ne donita ni supozas la aktualan staton
     * @param evento - argumento transdonata al la transira ago-funkcio
     */
    transiro(al: string, de?: string, evento?: any) {

        // 1. eltrovu eĝon al nova stato konsiderante eblajn gardojn
        // 2. forlasu nunan staton (senkondiĉe)
        // 3. transiru al nova stato
        // 4. alvenu ĉe nova stato (senkondiĉe)

        // la nomo de la stato-aŭtomato
        const n = this.nomo;

        /**
         * Plenumas foriran agon, sed difinita
         * @param d - la stato (nodo), kiun ni forlasas
         */
        function _forire(d: Nodo) {
            // ago difinita por foriro el d->...
            const t = d.__forire__;
            if (t && t.ago) {
                console.debug(n+": foriro de "+de);
                // faru transiran agon
                t.ago(evento);
            }
        }    

        /**
         * Plenumas alvenan agon, sed difinita
         * @param a - la stato (nodo), kiun ni aliras
         */
        function _alvene(a: Nodo) {
            // ago difinita por transiro al ...->a
            const t = a.__alvene__;
            if (t && t.ago) {
                console.debug(n+": alveno al "+al);
                // faru transiran agon
                t.ago(evento);
            }
        }

        /**
         * Plenumas transiran agon, sed difinita. Alie ol forira
         * kaj alira ago, kiuj estas specifaj por _unu_ stato, la transira
         * ago estas specifa nur al certa transiro inter _du_ statoj
         * La transira ago nur plenumiĝas, se ankaŭ las garda kondiĉo validas!
         * @param t - la transira ago
         */
        function _transire(t: Transago) {
            if( t.ago && (!t.grd || t.grd(evento)) ) {
                console.debug(n+": transiro "+de+" -> "+al);
                // faru transiran agon
                t.ago(evento);
            }    
        }
        
        // permesu transiron nur al difinita stato
        if (this.stats.indexOf(al) == -1) throw new TransiroEscepto("Stato \""+al+"\" ne difinita.");

        // provizore ni ignoras transirojn al identa stato,
        // ĉe eble ni poste bezonos ankaŭ agojn por transiroj kiel artikolo->artikolo?
        if (al == this.stato) {
            console.info("transiro "+this.stato+" -> "+al+ "(ignorata).");
            return;
        }

        const a:Nodo = this.trans[al]; // ĉu transiroj al celstato <al> estas difinitaj?
        if (!de) de = this.stato; // se ni ne ricevis deiran staton, ni implicas la nunan staton
        const d:Nodo = this.trans[de]; // ĉu transiro <al> -> <de> estas difinita?
        const t:Transago = a? a[de]: null; // transira ago, sed difinita aŭ null

        // ago por de -> ..
        if (d) _forire(d);

        // gardo/ago difinita por de -> al
        if (t) _transire(t);

        // ATENTU: provizore ni senkondiĉe transiras al la nova stato
        // do fiaskinta gardo ne malhelpas tion, sed nur la plenumon de la transira ago!
        // Do ni alvenos al la celstato sen plenumo de transira ago.
        // 
        // Se pluraj transiroj eblus depende de la gardo
        // (momente ni permesas nur unu, aliokaze avertas)
        // ni devus unue kontroli la gardon kaj nur 
        // se ekzistas almenaŭ unu ebla eĝo iri al la nova stato

        // notu novan staton...    
        this.stato = al;

        // en _alvene ni povas fari aferojn, kiuj bezonas jam vidi (ĉeesti) la novan staton

        // ago por .. -> al
        if (a) _alvene(a);
    };

}