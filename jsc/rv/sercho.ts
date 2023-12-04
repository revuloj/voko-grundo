
/* 
(c) 2020 - 2023 ĉe Wolfram Diestel
*/

import * as u from '../u';
import {type StrObj} from '../u';
import {agordo as g} from '../u/global';
import * as x from '../x';
import * as s from './shargo';

import {t_nav,t_red} from './stato';
import {redaktilo} from './redaktilo';
import {preferoj} from '../a/preferoj';

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

export type Lingvo = string;

// mrk, kap, lng, ind, trd, ekz
type Trovero = [string,string,string,string,string,string?];

// trovoj grupigita laŭ trovvorto por pli facila kreado de la HTML en la serĉlisto
// v: vorto, k: kapvorto, h: href, t: trovoj
export type TrovEo = { v: string, h: string, t: { [lng: string]: string } };
export type TrovTrd = { v: string, t: Array<{ k: string, h: string }> };
export type TrovVorto = TrovEo | TrovTrd;

// trovitaj rikordoj grupigitaj laŭ kapvorto (KAP=1) por 'eo'
// kaj lingvo (LNG=2) por nacilingvoj
type TrovGrupoj = { [key: string]: Array<Trovero> };



export namespace sercho {


    /**
     * Montras arbitran artikolon. Ni elserĉas hazardan kapvorton en la datumbazo
     * kaj montras la artikolon kaj la kapvorton en de tiu artikolo.
     */
    export function hazarda_art() {

        u.HTTPRequest('POST', g.sercho_url, {sercxata: "!iu ajn!"},
            function(data: string) {
                // sukceso!
                var json = 
                    /** @type { {hazarda: Array<string>} } */
                    (JSON.parse(data));
                const mrk = json.hazarda[0];
                const href = g.art_prefix + mrk.split('.')[0] + '.html#' + mrk;
                if (href) s.ŝargu_paĝon("main",href);
            }, 
            s.start_wait,
            s.stop_wait 
        );
    }

    /**
     * La uzanto volas serĉi ion...
     * @param {*} event 
     */
    export function ekserchu(event: any) {
        event.preventDefault();
        var serch_in = event.target.closest("form")
            .querySelector('input[name=q]');
        var esprimo = serch_in.value||"malpleno";
        if (esprimo) {
            // evitu ŝanĝi .search, ĉar tio refreŝigas la paĝon nevolite: 
            // location.search = "?q="+encodeURIComponent(esprimo);
            history.pushState(history.state,'',location.origin+location.pathname+"?q="+encodeURIComponent(esprimo));
            serchu_q(esprimo);
        }
    }


    /**
     * Serĉas per la transdonita serĉesprimo.
     * @param esprimo 
     */
    export function serchu_q(esprimo: string) {
        function nav_enh() {
            const nav = document.getElementById("navigado");
            return nav?.querySelector(".enhavo");
        }

        function sercho_start() {
            s.start_wait();
            const inx_enh = nav_enh();
            if (inx_enh) {
                inx_enh.textContent = '';
                inx_enh.insertAdjacentHTML("afterbegin",
                "<span id='x:serchante' class='animated-nav-font'>serĉante...</span>");
            }
        }

        function sercho_halt() {
            s.stop_wait();
            const srch = document.getElementById("x:serchante");
            if (srch) srch.remove();
        }

        // se la uzanto tajpis nur unuopan signon, sed ne literon, ni serĉu
        // konvenan vorton
        function nur_unu(s: string): string {
            const s_nomo: StrObj = {
                "%": "procento", "_": "substreko",
                ".": "punkto", ",": "komo", ";": "punktokomo", ":": "dupunkto",
                "?": "demando", "!": "ekkrio", '"': "citilo", "'": "apostrofo", "*": "steleto",
                " ": "spacsigno", "&": "kaj", "|": "aŭ", "/": "oblikvo", "\\": "deklivo",
                "0": "nul", "1": "unu", "2": "du", "3": "tri", "4": "kvar",
                "5": "kvin", "6": "ses", "7": "sep", "8": "ok", "9": "naŭ",
                "§": "paragrafo", "$": "dolaro", "(": "ronda krampo", ")": "ronda krampo",
                "[": "rekta krampo", "]": "rekta krampo", "{": "kuniga krampo",
                "}": "kuniga krampo", "=": "egalsigno", "<": "malpli", ">": "pli",
                "@": "heliko", "+": "plus", "-": "minus", "~": "tildo", "^": "ĉapelo",
                "°": "grado", "`": "akcento"             
            }
            if (s.length == 1) {
                return s_nomo[s]||s;
            } else {
                return s;
            }
        }

        function mieneto(esprimo: string): boolean {
            return (esprimo.length==2 || esprimo.length==3) 
                && /^[:;8Xx][-<>o=]?[\)\(\/\[\]PD><]$/.test(esprimo)
        }

        // aparte traktu unuopajn signojn
        if (esprimo.length == 1) esprimo = nur_unu(esprimo);
        if (mieneto(esprimo)) esprimo = "mieneto";

        const srch = new Sercho();
        srch.serchu(esprimo, function() {

            function findings(lng: Lingvo) {

                var div = u.ht_elements([
                    ["div",{},
                        [["h1",{}, s.revo_listoj.lingvoj.codes[lng]||lng ]]
                    ]
                ])[0] as Element;
                var dl = u.ht_element("dl");

                const trvj = srch.trovoj(lng);
                // console.log(trvj);

                let atr = {};
                if (trvj) for (let n=0; n<trvj.length; n++) {
                    let t = trvj[n];

                    if (n+1 > g.sercho_videblaj && trvj.length > g.sercho_videblaj+1) {
                        // enmetu +nn antaŭ la unua kaŝita elemento
                        if (n - g.sercho_videblaj == 1) {
                            const pli = u.ht_pli(trvj.length - g.sercho_videblaj);
                            if (pli) dl.append(...pli);
                        }                        
                        atr = {class: "kasxita"};
                    }

                    const dt = u.ht_element("dt",atr);

                    if ( lng == 'eo' ) {
                        // tradukojn oni momente ne povas ne povas rekte alsalti,
                        // do ni provizore uzas t.eo.mrk anst. t[l].mrk
                        const a = u.ht_element("a",{target: "precipa", href: (t as TrovEo).h}, t.v);
                        dt.append(a);
                    } else {
                        const s = u.ht_element("span",{lang: lng}, t.v);
                        dt.append(s);
                    }

                    // dum redakto ni aldonas transprenan butonon por kreado de referencoj
                    if ( lng == 'eo' && t_red.stato == "redaktante") {
                        const ref_btn = u.ht_element("button",{
                            class: "icon_btn r_vid", 
                            value: (t as TrovEo).h.split('#')[1], // mrk
                            title:"transprenu kiel referenco"
                        });
                        dt.append(ref_btn);
                    }                            

                    const dd = u.ht_element("dd",atr);

                    if ( lng == 'eo' ) {
                        // trovitaj tradukoj de tiu e-a vorto
                        for ( let [l,trd] of Object.entries(t.t) ) { // ni trairu ĉiujn lingvojn....
                            // tradukojn oni momente ne povas rekte alsalti,
                            // do ni (provizore?) uzas href (el drv-mrk) 
                            const a = u.ht_elements([
                                    ["a",{target: "precipa", href: (t as TrovEo).h},
                                        [["code",{}, l + ":"],["span",{lang: l}, trd]]
                                    ],["br"]
                                ]);    
                            if (a) dd.append(...a);
                        } // for lng,trd ...
                    } else {
                        // trovitaj esperantaj tradukoj de tiu nacilingva vorto
                        for (let e of (t as TrovTrd).t) {
                            const a = u.ht_elements([
                                ["a",{target: "precipa", href: e.h},
                                    e.k
                                ],["br"]
                            ]);    
                            if (a) dd.append(...a);
                        } // for e
                    }
                    dl.append(dt,dd);
                }
                div.append(dl);

                // atentigo pri limo
                //if (lng.max == lng.trovoj.length) {
                //    const noto = ht_element("p",{class: "kasxita"},"noto: por trovi ankoraŭ pli, bv. precizigu la serĉon!");
                //    div.append(noto);
                //}
                return div;
            } // ...findings

            function nofindings() {
                return u.ht_elements([
                    ["p",{},
                        [["strong",{},"Nenio troviĝis!"]]
                    ]
                ])[0];
            } // ...nofindings

            function serch_lng() {
                const div = u.ht_elements([["div",{class:"s_lng"},
                    [
                        ["a",{id: "x:serch_lingvoj", href: "#", class: "llbl"},"serĉlingvoj: "],
                        ["span",{class: "llst"}, srch.s_lng.join(', ')]
                    ]
                ]]);
                return div[0];
            };

            s.malfaldu_nav();
            const nav = document.getElementById("navigado");
            const inx_enh = nav?.querySelector(".enhavo");
            const trovoj = u.ht_element("div",{id: "x:trovoj"},"");

            // serĉlingvoj
            if ( srch.s_lng ) {
                trovoj.append(serch_lng());
            }

            // se nenio troviĝis...
            if ( srch.malplena() ) {
                trovoj.append(nofindings());

            // se troviĝis ekzakte unu kaj ni ne redaktas, iru tuj al tiu paĝo
            } else if ( srch.sola() && t_red.stato != "redaktante" ) {
                const href = srch.unua()?.href;
                if (href) s.ŝargu_paĝon("main",href);
            }

            if ( !srch.malplena() ) {
                trovoj.append(findings('eo'));
                for (let lng of srch.lingvoj()) {
                    trovoj.append(findings(lng));
                }    

                // aldonu la reagon por ref-enmetaj butonoj
                if (t_red.stato == "redaktante") {
                    trovoj.querySelectorAll("button.r_vid").forEach((btn) => {
                        btn.addEventListener("click", (event) => {                         
                            const trg = event.target as HTMLInputElement;
                            // kiun ref-mrk ni uzu - depende de kiu butono premita
                            const refmrk = trg.value;
                            const refstr = trg.previousSibling?.textContent;
                            // revenu de trovlisto al redakto-menuo
                            if (refmrk && refstr) s.ŝargu_paĝon("nav",g.redaktmenu_url,true,
                                () => redaktilo.notu_ref(refmrk,refstr));        
                        });
                    });
                }
            }

            // montru butonon por reveni al ĉefa indekso
            //index_home_btn(trovoj.children[0]);
            //show("x:nav_start_btn");
            t_nav.transiro("serĉo");

            if (inx_enh) {
                inx_enh.textContent = "";
                //inx_enh.append(...s_form,trovoj);
                inx_enh.append(trovoj); 

                // permesu adapti serĉlingvojn
                const sl = document.getElementById("x:serch_lingvoj");
                if (sl) sl.addEventListener("click",() => preferoj.dialog());
            }
            // forigu ankaŭ eventualan "viaj submetoj", ĝi estu nur en ĉefindekso por
            // eviti konfuzojn
            if (nav) {
                const subm = nav.querySelector("#submetoj");
                if (subm) nav.removeChild(subm);    
            }
        },
        sercho_start,
        sercho_halt 
        );
    }
}

/**
 * Klaso por krei novan serĉon. 
 * Ĝi helpas aliri la esperantajn kaj nacilingvajn trovojn post farita serĉo.
 */
export class Sercho {

    private eo: TrovGrupoj;
    private trd: TrovGrupoj; 
    public s_lng: Array<Lingvo>;
    
    constructor() {
        //komence malplena
        this.eo = {};
        this.trd = {}; 
        this.s_lng = [];
    }

    /**
     * Rulas la sercon demandante la servilon
     * @param esprimo - la serĉesprimo
     * @param onSuccess 
     * @param onStart 
     * @param onStop 
     */
    serchu(esprimo: string,
        onSuccess: Function, onStart: Function, onStop: Function) 
    {
        const self = this;

        // la esprimo enhavas jokersignojn (%_)
        function ĵokeroj(e: string) {
            return ( esprimo.indexOf('%') >= 0 
                || esprimo.indexOf('_') >= 0 );
        }

        // la esprimo enhavas signojn regulesprimajn
        function regesp(e: string) {
            return esprimo.match(e_regex);
        }

        // la esprimo komenciĝas per silabsignoj
        // ĉina, japana, korea k.a.
        // Mi ne scias, ĉu ni tiel kaptas ĉiujn,
        // evtl. do aldonu areaojn laŭbezone
        // kp. https://unicode-explorer.com/blocks
        function silab(e: string) {
            const u1 = e.codePointAt(0)||0;
            return (
                   u1 >= 0x3100 && u1 <= 0xa6ff
                || u1 >= 0xac00 && u1 <= 0xdbff
                || u1 >= 0xf900 && u1 <= 0xfaff
               || u1 >= 0x20000 && u1 <= 0x2faff
               || u1 >= 0x30000 && u1 <= 0x313ff
            );
        }
/*
        if ( esprimo.indexOf('%') < 0 
            && esprimo.indexOf('_') < 0 
            && esprimo.length >= 3
            && ! esprimo.match(e_regex) ) {
            esprimo += '%'; // serĉu laŭ vortkomenco, se ne jam enestas ĵokeroj, kaj
            // almenaŭ 3 literoj
        } */    

        // serĉu laŭ vortkomenco, se ne jam enestas ĵokeroj/regulesprimo, kaj
        // almenaŭ 3 literoj aŭ unu silabo
        if (
            !ĵokeroj(esprimo) && !regesp(esprimo) && 
            (esprimo.length >= 3 || silab(esprimo)) ) 
        {
                esprimo += '%'; 
        }        

        u.HTTPRequestFull('POST', g.sercho_url, 
            {"Accept-Language": preferoj.lingvoj().join(',')},
            {sercxata: esprimo},
            function(data: string) {
                const json = JSON.parse(data);
                self.eo = json.eo ? 
                    x.group_by(KAP,json.eo) // ordigu laŭ kapvorto
                    : {};
                self.trd = json.trd ? 
                    x.group_by(LNG,json.trd) // ordigu laŭ lingvo
                    : {}; 
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
     * 
     * PLIBONIGU: la diversa strukturo de eo / aliaj konfuzas la tipkontrolon de TypeScript
     * do pli bone laŭeble apartigu la funkciojn por 'eo' kaj por aliaj lingvoj
     */
    trovoj(lng: string): TrovVorto[]|undefined {

        // strukturas unu e-an trovon kun unika kap-mrk
        function trovo_eo(kap: string, mrk: string, trdj: string[]): TrovVorto {
            // grupigu la tradukojn laŭ lingvo kaj kunigi ĉiujn de
        // sama lingvo per komoj...
            // grupigu tradukojn laŭ lingvo            
            const t_grouped = (x.group_by(LNG,trdj) || {});
            const t_l = Object.entries(t_grouped)
                .filter( ([lng,list]) => { return lng != '<_sen_>'; } )
                .reduce( (obj,[lng,list]) => {
                    // ĉenigu ĉiujn tradukojn de unu lingvo, se estas trd (lasta kampo)
                    // uzu tiun, ĉar ĝi estas pli longa ol ind, enhavante klarigojn ks.
                    const ulist = new Set();
                    list.forEach((e: Trovero) => ulist.add(e[TRD]||e[IND]));
                    // uzante Set ni krome forigas duoblaĵojn, kiuj ekz-e okazas en
                    // aziaj lingvoj pro aldonitaj/serĉeblaj prononcaj transskriboj
                    obj[lng] = 
                        // ĉenigu ĉiujn tradukojn de unu lingvo, se estas trd (lasta kampo)
                        // uzu tiun, ĉar ĝi estas pli longa ol ind, enhavante klarigojn ks.
                        Array.from(ulist.values()).join(', ');
                    return obj;
                }, {} as StrObj );    
            return {
                v: kap,
                h: x.art_href(mrk),
                t: t_l
            };
        }

        // strukturas unu ne-e-an trovon kun unika ind-mrk
        function trovo_trd(trd: string, eroj: Trovero[]): TrovVorto {
            // list transformu al paroj {k: <kapvorto>, h: href}
            const e_l = eroj.map((ero) =>
                { return {
                    k: ero[EKZ] || ero[KAP], 
                    h: x.art_href(ero[MRK])
                }; 
            });
            return {
                v: trd,
                t: e_l
            };
        }

        // komenco de .trovoj()...
        var trvj: TrovVorto[] = [];
        if (lng == 'eo') {
            // ni jam grupigis laŭ kapvortoj, sed
            // la liston de trovoj/tradukoj por la sama kapvorto
            // ...ni ankoraŭ grupigu laŭ mrk - ĉar povas enesti homonimoj!
            if (this.eo) {
                for (let [kap,eroj] of Object.entries(this.eo)) {
                    if (Array.isArray(eroj)) {
                        // grupigu troverojn laŭ kampo 'MRK'
                        const grouped = x.group_by(MRK,eroj);
                        if (grouped) {
                            trvj.push(...Object.keys(grouped)
                                // transformu Trovero -> TrovVorto
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
                // grupigu troverojn laŭ kampo 'TRD'
                const grouped = x.group_by(TRD,trvj); 
                if (grouped)
                    return Object.keys(grouped)
                        // ordigu lau la koncerna lingvo
                        .sort(new Intl.Collator(lng).compare)
                        // transformu Trovero -> TrovVorto
                        .map( trd => trovo_trd(trd,grouped[trd]) );
            }
        }
    };


    /**
     * Redonas, en kiuj lingvoj (krom eo) ni trovis ion
     * @returns - listo de nacilingvoj
     */
    lingvoj(): Lingvo[] {
        if (this.trd) return ( Object.keys(this.trd) );
        return [];
    };

    /**
     * Testas, ĉu la trovoj estas malplenaj, t.e. nek e-a nek nacilingva rezulto
     * @returns true: malplena
     */
    malplena(): boolean {
        return ( (!this.eo || Object.keys(this.eo).length === 0) 
            && (!this.trd || Object.keys(this.trd).length === 0) );
    };

    /**
     * Tastas, ĉu ni ricevis unusolan rezulton, tiuokzae ni povos tuj
     * ŝargi kaj prezenti la trovitan artikolon
     * @returns true: unusola rezulto
     */
    sola(): boolean {
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
     * Redonas la unuan rezulton (aŭ nenion, se ne estas)
     * @returns la pretigita HTML-referenco al la unua trovaĵo
     */
    unua(): { href: string } | undefined {
        if (this.eo && this.trd) {
            // la unua kapvorto aŭ la unua traduko
            const u = (Object.values(this.eo)[0] || Object.values(this.trd)[0]);
            // unua trovero de tiu grupo
            const tv = u[0]; 
            // la marko de tiu trovero
            return { href: x.art_href(tv[MRK]) };            
        }
    };



    /**
     * Serĉas en universala vortreto, vd. http://www.lexvo.org/uwn/
     * @param vorto 
     * @param onSuccess 
     * @param onStart 
     * @param onStop 
     */
    serchu_uwn(vorto: string,
        onSuccess: Function, onStart: Function, onStop: Function) 
    {
        const self = this;

        u.HTTPRequest('POST', g.trad_uwn_url, {sercho: vorto}, 
            function(data: string) {
                if (data) {
                    const json = JSON.parse(data);
                    onSuccess.call(self,json);    
                } else {
                    onSuccess.call(self);    
                }
            },
            onStart,
            onStop
        );
    };

}