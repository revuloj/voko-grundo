
/* jshint esversion: 6 */

// (c) 2020, 2021 Wolfram Diestel

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

/**
 * Kreas novan serĉon. Ĝi helpas aliri la esperantajn kaj nacilingvajn trovojn post farita serĉo.
 * @constructor
 */
function Sercho() {
    //komence malplena
    this.eo = [];
    this.trd = []; 
    this.s_lng = [];
}

/**
 * Rulas la sercon demandante la servilon
 * @param {string} esprimo - la serĉesprimo
 * @param {Function} onSuccess 
 * @param {Function} onStart 
 * @param {Function} onStop 
 */
Sercho.prototype.serchu = function(esprimo,onSuccess,onStart,onStop) {
    const self = this;

    if ( esprimo.indexOf('%') < 0 
        && esprimo.indexOf('_') < 0 
        && esprimo.length >= 3
        && ! esprimo.match(e_regex) ) {
        esprimo += '%'; // serĉu laŭ vortkomenco, se ne jam enestas jokeroj, kaj
        // almenaŭ 3 literoj
    }        

    HTTPRequestFull('POST', globalThis.sercho_url, 
        {"Accept-Language": preferoj.languages().join(',')},
        {sercxata: esprimo},
        function(data) {
            const json = JSON.parse(data);
            self.eo = json.eo ? 
                group_by(KAP,json.eo) // ordigu laŭ kapvorto
                : undefined;
            self.trd = json.trd ? 
                group_by(LNG,json.trd) // ordigu laŭ lingvo
                : undefined; 
            self.s_lng = json.lng; // la serĉlingvoj, eble reduktitaj se estis tro en preferoj
            onSuccess.call(self);
        },
        onStart,
        onStop    
    );    
};


/**
 * Redoni la trovojn de unu lingvo kiel listo de objektoj
 * {v - vorto, h - href, t - <trdj>} - lng = eo; 
 * <trdj> estas objekto de la formo {de: "trdj", en: "trdj"...}
 * por aliaj lingvoj estas nur signaro kun esperanta traduko, do ne objekto 
 * @param {string} lng - la lingvo kies trovojn ni volas
 * @returns - la trovoj en la supre priskribita formo
 */
Sercho.prototype.trovoj = function(lng) {

    // strukturas unu e-an trovon kun unika kap-mrk
    function trovo_eo(kap,mrk,trdj) {
        // grupigu la tradukojn laŭ lingvo kaj kunigi ĉiujn de
    // sama lingvo per komoj...
        // grupigu tradukojn laŭ lingvo            
        const t_grouped = (group_by(LNG,trdj) || {});
        const t_l = Object.entries(t_grouped)
            .filter( ([lng,list]) => { return lng != '<_sen_>'; } )
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
        };
    }

    // strukturas unu ne-e-an trovon kun unika ind-mrk
    function trovo_trd(trd,eroj) {
        // list transformu al paroj {k: <kapvorto>, h: href}
        const e_l = eroj.map((ero) =>
            { return {
                k: ero[EKZ] || ero[KAP], 
                h: art_href(ero[MRK])
              }; 
            }
        );
        return {
            v: trd,
            t: e_l
        };
    }

    // komenco de .trovoj()...
    var trvj = [];
    if (lng == 'eo') {
        // ni jam grupigis laŭ kapvortoj, sed
        // la liston de trovoj/tradukoj por la sama kapvorto
        // ...ni ankoraŭ grupigu laŭ mrk - ĉar povas enesti homonimoj!
        if (this.eo) {
            for (let [kap,eroj] of Object.entries(this.eo)) {
                if (Array.isArray(eroj)) {
                    const grouped = group_by(MRK,eroj);
                    if (grouped) {
                        trvj.push(...Object.keys(grouped)
                            .map( mrk => trovo_eo(kap,mrk,grouped[mrk]) ));    
                    }
                }
            }    
        }
        return trvj.sort((a,b) =>
            a.v.localeCompare(b.v,'eo'));

    } else {
        // la liston de trovoj/tradukoj por 
        // la elektita lingvo: [mrk,kap,num,lng,ind,trd] 
        // ...ni grupigos laŭ trd, sed devos plenigi ĝin per ind, kie ĝi mankas
        const trvj = this.trd[lng];
        if (Array.isArray(trvj)) {
            for (let t of trvj) { if (! t[TRD]) t[TRD] = t[IND]; }
            const grouped = group_by(TRD,trvj); // ni grupigas laŭ 'ind'
            if (grouped)
                return Object.keys(grouped)
                    .sort(new Intl.Collator(lng).compare)
                    .map( trd => trovo_trd(trd,grouped[trd]) );
        }
    }
};


/**
 * Redonas, en kiuj lingvoj (krom eo) ni trovis ion
 * @returns - listo de nacilingvoj
 */
Sercho.prototype.lingvoj = function() {
    if (this.trd) return ( Object.keys(this.trd) );
};

/**
 * Testas, ĉu la trovoj estas malplenaj, t.e. nek e-a nek nacilingva rezulto
 * @returns true: malplena
 */
Sercho.prototype.malplena = function() {
    return ( (!this.eo || Object.keys(this.eo).length === 0) 
        && (!this.trd || Object.keys(this.trd).length === 0) );
};

/**
 * Tastas, ĉu ni ricevis unusolan rezulton, tiuokzae ni povos tuj
 * ŝargi kaj prezenti la trovitan artikolon
 * @returns true: unusola rezulto
 */
Sercho.prototype.sola = function() {
    return ( 
            this.eo 
            && Object.keys(this.eo).length === 1 
            && (!this.trd || Object.keys(this.trd).length === 0) 
          || 
            (!this.eo || Object.keys(this.eo).length === 0)
            && this.trd
            && Object.keys(this.trd).length === 1 
            && Object.values(this.trd)[0].length === 1 );
};

/**
 * Redonas la unuan rezulton.
 * @returns {{href}|undefined} la pretigita HTML-referenco al la unua trovaĵo
 */
Sercho.prototype.unua = function() {
    if (this.eo && this.trd) {
        var u = Object.values(this.eo)[0] || Object.values(this.trd)[0];
        return { href: art_href(u[0][MRK]) };            
    }
};



/**
 * Serĉas en universala vortreto, vd. http://www.lexvo.org/uwn/
 * @param {string} vorto 
 * @param {Function} onSuccess 
 * @param {Function} onStart 
 * @param {Function} onStop 
 */
Sercho.prototype.serchu_uwn = function(vorto,onSuccess,onStart,onStop) {
    const self = this;

    HTTPRequest('POST', globalThis.trad_uwn_url, {sercho: vorto}, 
        function(data) {
            if (data) {
                const json = JSON.parse(data);
                onSuccess.call(self,json);    
            } else {
                onSuccess.call(self);    
            }
        },
        start_wait,
        stop_wait
    );
};  
