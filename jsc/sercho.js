// sendu vorton al la serĉ-CGI kaj redonu la rezultojn grupigite kaj porciumite

// La rezultoj riceviĝas en la formo [mrk,kap,lng,ind,trd] kaj estas
// rearanĝitaj konvene por la prezentado
const MRK=0; // drv@mrk
const KAP=1; // kapvorto, t.e. drv/kap, ankaŭ variaĵoj
const LNG=2; // lingvokodo
const IND=3; // indeksita parto de trd: ind aŭ mll aŭ text()
const TRD=4; // kompleta kun klr ktp
const EKZ=5; // ekz/ind aŭ bld/ind

const e_regex = /[\.\^\$\[\(\|+\?{\\]/;

function Sercho(kion) {
    //komence malplena
    this.eo = [];
    this.trd = []; 
}

Sercho.prototype.serchu = function(esprimo,onSuccess,onStart,onStop) {
    const self = this;

    if ( esprimo.indexOf('%') < 0 
        && esprimo.indexOf('_') < 0 
        && esprimo.length >= 3
        && ! esprimo.match(e_regex) ) {
        esprimo += '%'; // serĉu laŭ vortkomenco, se ne jam enestas jokeroj, kaj
        // almenaŭ 3 literoj
    }        

    HTTPRequestFull('POST', sercho_url, 
        {"Accept-Language": preferoj.languages().join(',')},
        {sercxata: esprimo},
        function(data) {
            var json = JSON.parse(data);
            self.eo = json.eo ? 
                group_by(KAP,json.eo) // ordigu laŭ kapvorto
                : undefined;
            self.trd = json.trd ? 
                group_by(LNG,json.trd) // ordigu laŭ lingvo
                : undefined; 
            onSuccess.call(self);
        },
        onStart,
        onStop    
    );    
};


// redoni la trovojn de unu lingvo kiel listo de objektoj
// {v - vorto, h - href, t - <trdj>} - lng = eo <trdj> estas objekto 
// de la formo {de: "trdj", en: "trdj"...}
// por aliaj lingvoj estas nur signaro kun esperanta traduko, do ne objekto
Sercho.prototype.trovoj = function(lng) {

    // strukturas unu e-an trovon kun unika kap-mrk
    function trovo_eo(kap,mrk,trdj) {
        // grupigu la tradukojn laŭ lingvo kaj kunigi ĉiujn de
        // sama lingvo per komoj...
        const t_l = Object.entries(
            group_by(LNG,trdj)) // grupigu tradukojn laŭ lingvo            
            .filter( ([lng,list]) => { return lng != '<_sen_>' } )
            .reduce( (obj,[lng,list]) => {
                obj[lng] = 
                    // ĉenigu ĉiujn tradukojn de unu lingvo, se estas trd (lasta kampo)
                    // uzu tiun, ĉar ĝi estas pli longa ol ind, enhavante klarigojn ks.
                    list.map((e) => e[TRD]||e[IND]) 
                    .join(', ');
                return obj;
            }, {} );
        return {
            v: kap,
            h: art_href(mrk),
            t: t_l
        }
    }

    // strukturas unu ne-e-an trovon kun unika ind-mrk
    function trovo_trd(trd,eroj) {
        // list transformu al paroj {k: <kapvorto>, h: href}
        const e_l = eroj.map((ero) =>
            { return {
                k: ero[EKZ] || ero[KAP], 
                h: art_href(ero[MRK])
            } }
        );
        return {
            v: trd,
            t: e_l
        }
    }

    // komenco de .trovoj()...
    var trvj = [];
    if (lng == 'eo') {
        // ni jam grupigis laŭ kapvortoj, sed
        // la liston de trovoj/tradukoj por la sama kapvorto
        // ...ni ankoraŭ grupigu laŭ mrk - ĉar povas enesti homonimoj!
        for (let [kap,eroj] of Object.entries(this.eo)) {
            const grouped = group_by(MRK,eroj);
            trvj.push(...Object.keys(grouped)
                .map( mrk => trovo_eo(kap,mrk,grouped[mrk]) ));
        };
        return trvj.sort((a,b) =>
            a.v.localeCompare(b.v,'eo'));

    } else {
        // la liston de trovoj/tradukoj por 
        // la elektita lingvo: [mrk,kap,num,lng,ind,trd] 
        // ...ni grupigos laŭ trd, sed devos plenigi ĝin per ind, kie ĝi mankas
        const trvj = this.trd[lng];
        for (t of trvj) { if (! t[TRD]) t[TRD] = t[IND] };
        const grouped = group_by(TRD,trvj); // ni grupigas laŭ 'ind'
        return Object.keys(grouped)
            .sort(new Intl.Collator(lng).compare)
            .map( trd => trovo_trd(trd,grouped[trd]) );
    }
}

// en kiuj lingvoj (krom eo) ni trovis ion?
Sercho.prototype.lingvoj = function() {
    return ( Object.keys(this.trd) );
}

Sercho.prototype.malplena = function() {
    return ( (!this.eo || Object.keys(this.eo).length === 0) 
        && (!this.trd || Object.keys(this.trd).length === 0) );
}

Sercho.prototype.sola = function() {
    return ( Object.keys(this.eo).length === 1 
             && Object.keys(this.trd).length === 0 
          || Object.keys(this.eo).length === 0 
             && Object.keys(this.trd).length === 1 
             && Object.values(this.trd)[0].length === 1 );
}

Sercho.prototype.unua = function() {
    var u = Object.values(this.eo)[0] || Object.values(this.trd)[0];
    return { href: art_href(u[0][MRK]) }        
}
