
/* 
 (c) 2018 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import * as x from '../x';

import { DOM, UIElement, Dialog, Slipar, Skal, Propon, Elektil, Valid, Eraro } from '../ui';

import { bar_styles, make_percent_bar } from './procentoj';
import { HTMLFonto, HTMLTrovoDt, HTMLTrovoDdBld } from './sxabloniloj';

type CitSercho = {
    sercho: string,
    kie?: string,
    vrk?: string,
    jar_de?: string|null,
    jar_ghis?: string|null
}

type TrovValoroj = { url?: string, fmt?: number, 
    aut?: string, bib?: string, vrk?: string, lok?: string, 
    prm?: string, fnt?: string, frazo?: string };


/**
 * Preparas la serĉon, kontrolante, ĉu estas valida serĉesprimo, malplenigante
 * la trovokampon.
 */
function _serĉo_preparo() {

    //var sercho_focused_button = null;
    console.debug("Instalante la serĉfunkciojn...");

    if (! Valid.valida("#sercho_sercho")) return;

    const trovoj = document.getElementById("sercho_trovoj");
    if (trovoj) {
        // ĉu necesa? trovoj.querySelectorAll("button").forEach((b) => b.removeEventListener("click");
        // KONTROLU: ĉu la kreitaj objektoj UIElement ankaŭ foriĝas aŭ ĉu estas problemo, ke ni
        // havas cirklan referencon inter elementoj kaj UIElement-objektoj?
        // vd. https://stackoverflow.com/questions/10092619/precise-explanation-of-javascript-dom-circular-reference-issue
        // laŭ tiuj informoj nur tre malnovaj retumiloj (ekz-e IE7) havis tiun problemon.
        trovoj.textContent = '';
    }

    return true;
}

/**
 * Por krei diversajn regulesprimojn ni bezonas scion pri
 * aplikeblo de afiksoj kaj finaĵoj.
 * La funkcio preparas afiksojn laŭ la vortspecoj (i,a,o), al
 * kiuj ili estas aplikeblaj kaj kiu vortspeco povas
 * rezulti, ekz-e "o-a", signifas aplikebla al substantivo kaj
 * rezultanta al adjektivo, "?" signifas ĉiuj tri vortspecoj...
 * Alternativoj estas apartigitaj per '|', ekz-e "o-a|a-a"
 * 
 * @returns {{prefiksoj:{a,i,o},sufiksoj:{a,i,o,n}}}
 */
const afiksoj = function() {

    // redonu sufiksojn aplikeblajn 
    // al radikkaraktero rk kun rezulta vortspeco vs (rk-vs|...)
    const _sufiksoj: u.StrObj = {
        "[aio]n?t": "i-u|i-a",
        "aĉ": "?-?",
        "ad": "i-?",
        "aĵ": "?-o",
        "an": "o-u",
        "ar": "o-o",
        "ebl": "i-a",
        "ec": "a-o|o-o",
        "eg": "?-?",
        "ej": "?-o",
        "em": "i-a|a-a|i-o|a-o",
        "end": "i-a",
        "er": "o-o",
        "estr": "o-u",
        "et": "?-?",
        "id": "u-u|o-o",
        "i[gĝ]": "?-?|n-?",
        "il": "i-o",
        "in": "u-u|u-a",
        "[ei]nd": "i-a|i-o",
        "ing": "o-o",
        "ism": "o-o|o-a",
        "ist": "o-u|o-a",
        "obl": "n-o|n-a",
        "o[np]": "n-o|n-a",
        "uj": "o-o",
        "ul": "?-u",
        "um": "?-?",
    };
    
    const _prefiksoj: u.StrObj = {
        // bazaj prefiksoj
        "bo": "u-u|u-a",
        "ĉef": "o-o|o-a",
        "dis": "i-?",
        "ek": "i-?",
        "eks": "o-o|o-a",
        "fi": "?-?",
        "ge": "u-u|u-a",
        "mal": "?-?",
        "mis": "i-?",
        "pra": "o-o|o-a",
        "pseŭdo": "?-?",
        "re": "i-?",

        // prepozicioj kiel prefiksoj aŭ kunderivado
        "al": "i-?",
        "antaŭ": "i-?|o-a",
        "apud": "i-?|o-a",
        "ĉe": "i-?|o-a",
        "ĉirkaŭ": "i-?|o-a",        
        "de": "i-?",
        "dum": "i-a|o-a",
        "ekster": "a-a|o-a",
        "el": "i-?",
        "en": "i-?|o-a",
        "ĝis": "i-?",
        "inter": "i-?|o-a|o-o",
        "kontraŭ": "i-?|o-a",
        "krom": "i-?|o-o",
        "kun": "i-?",
        "laŭ": "i-?|?-a",
        "per": "i-?|o-a",
        "por": "i-?",
        "post": "i-?",
        "preter": "i-?",
        "pri": "i-?|o-a",
        "pro": "i-?",
        "sen": "?-a",
        "sub": "o-o|o-a|i-?",
        "super": "o-o|o-a|a-a|i-?",
        "sur": "i-?|o-a",
        "tra": "i-?|o-a",
        "trans": "i-?|o-a",        

        // adverboj kiel prefiksoj aŭ en kunderivado
        "ambaŭ": "o-a|i-a",
        "ĉi": "a-a",
        "ĉiam": "a-a",
        "pli": "a-a",
        "plu": "i-?",
        "for": "i-?",
        "ne": "a-a|o-a",
        "tiel": "a-a",
        "nun": "o-o|o-a",
        "mem": "i-?",
        "kvazaŭ": "?-?",
        "tro": "a-?",

        // tabelvortoj uzataj en kunderivado        
        "[ĉtk]?iu": "o-a",
        "neniu": "o-a",
        "[ĉtk]?ia": "o-a",
        "nenia": "o-a"
    };

    function _preparo(afiksoj) {

        let r = {
          "?":{"?":[],a:[],i:[],o:[]},
            a:{"?":[],a:[],i:[],o:[]},
            i:{"?":[],a:[],i:[],o:[]},
            o:{"?":[],a:[],i:[],o:[]},
            u:{"?":[],a:[],i:[],o:[]},
            n:{"?":[],a:[],i:[],o:[]}};

        const push_no_dup = (el,arr) => 
            { if (arr.indexOf(el)==-1) arr.push(el);};            

        // alpendigas afikson af al listoj de objekto obj laŭ
        // celvortspeco al 
        /*
        function push(af,al,obj) {
            if (al == '?') {
                push_no_dup(af,obj.a);
                push_no_dup(af,obj.i);
                push_no_dup(af,obj.o);
            } else {
                push_no_dup(af,obj[al]);
            }
        }*/

        for (const [affix,sk] of Object.entries(afiksoj)) {
            const skemoj = (sk as string).split('|');
            for (const s of skemoj) {
                const de = s[0];
                const al = (s[2]=='u'? 'o' : s[2]); // la celon ulo ni bildigas al -o
                                // dumlonge ni ne uzas duŝtupan aplikadon pref/ul...
                push_no_dup(affix,r[de][al]);
            }
        }

        return r;
    }

    return {
        sufiksoj: _preparo(_sufiksoj),
        prefiksoj: _preparo(_prefiksoj)
    }
}(); // tuj preparu!


/**
 * Vokas la serĉon en Vikipedio kaj prezentas la rezultojn
 * @param {Event} event
 */
export function vikiSerĉo(event) {
    event.preventDefault();

    if (! _serĉo_preparo()) return;

    const esprimo = (document.getElementById("sercho_sercho") as HTMLInputElement).value;

    u.HTTPRequest('post','citajho_sercho',
        {   
            sercho: esprimo,
            kie: 'vikipedio'
        }, 
        function(data) {   
            
            if (data.query && data.query.pages) {
                var pages = data.query.pages;
                var ŝablono = new HTMLTrovoDt();

                for (let p in pages) {
                    var page = pages[p];
                    var url = 'https://eo.wikipedia.org/?curid=' + page.pageid;

                    DOM.e("#sercho_trovoj")?.append('<dd id="trv_' + page.pageid + '">');
                    new Trovo("#trv_"  + page.pageid,
                        {
                            ŝablono: ŝablono,
                            valoroj: {
                                url: url,
                                title: page.title,
                                descr: page.extract,
                                data: page
                            }
                        }
                    );
                }
            } else {
                const s_tr = DOM.e("#sercho_trovoj");
                if (s_tr) s_tr.innerHTML = "<p>&nbsp;&nbsp;Neniuj trovoj.</p>";
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error',msg)
    );
}

/**
 * Redonas la URL-on, kiu apartenas al bibliografiero.
 * @param {Array<{label,value}>} source - la bibliografia listo 
 * @param {string} bib - la mallongigo de la serĉata bibliografiero
 * @returns la URL 
 */
function _bib_url(source,bib) {
    for (var entry of source) {
        if (entry.value == bib) {
            return entry.url;
        }
    }
}

/**
 * Vokas la citaĵo-serĉon kaj prezentas la trovojn en la trovo-kampo.
 * @param {Event} event
 */
export function citaĵoSerĉo(event) {
    event.preventDefault();
    const vlist = event.currentTarget.id == "s_klasikaj"? "klasikaj" : "elektitaj";

    if (! _serĉo_preparo()) return;

    // serĉesprimo: ŝablone kreita regulesprimo aŭ tajpita serĉvorto...?
    const esprimo = DOM.i("#sercho_sercho")?.value as string;

    let sspec: CitSercho = {sercho: esprimo};
    if (vlist == 'klasikaj') {
        sspec.kie = 'klasikaj'
    } else if (! DOM.e("#sercho_verklisto")?.children.length) {
        const handle1 = DOM.t( "#periodilo_manilo_1" );
        const handle2 = DOM.t( "#periodilo_manilo_2" );
        sspec.kie = 'jar';
        sspec.jar_de = handle1;
        sspec.jar_ghis = handle2;
    } else {
        // eltrovu ĉu la verko-listo estas limigita
        sspec.kie = 'vrk';
        sspec.vrk = elektitajVerkoj().join(',');

        if (! sspec.vrk) {
            Eraro.al("#sercho_error","Neniuj verkoj elektitaj por trarigardi!");
            return;
        }
    }

    u.HTTPRequest('post', 'citajho_sercho', sspec as u.StrObj,
        function(data) {
            const s_tr = DOM.e("#sercho_trovoj");
            const json = JSON.parse(data);
            const bib_src = Propon.propon("#ekzemplo_bib")?.opcioj["source"];
            const htmlFnt = new HTMLFonto(bib_src);
            const ŝablono = new HTMLTrovoDt();

            if (s_tr && json.length && json[0].cit) {
                for (let i = 0; i < json.length; i++) {
                    const trovo = json[i], fnt = trovo.cit.fnt;
                    const url = ( fnt.url ? fnt.url : ( fnt.bib ? _bib_url(bib_src,fnt.bib) : '') );
                    const perc = make_percent_bar(trovo.sim*100, bar_styles[12], 20, 20);

                    s_tr.insertAdjacentHTML("beforeend",'<dd id="trv_' + i + '">');
                    new Trovo("#trv_"+i,
                        {
                            ŝablono: ŝablono,
                            valoroj: {
                                prompt: '&nbsp;&nbsp;<span class="perc_bar">' + perc.str + '</span>&nbsp;&nbsp;',
                                url: url,
                                title: '(' + (i+1) + ') ' + htmlFnt.html(fnt),
                                descr: trovo.cit.ekz,
                                data: trovo
                            }
                        }
                    );

                    // sercho_rigardu_btn_reaction(i,url);
                    // sercho_enmetu_btn_reaction(i,trovo);
                }
            } else {
                const s_tr = DOM.e("#sercho_trovoj");
                if (s_tr) s_tr.innerHTML = "<p>&nbsp;&nbsp;Neniuj trovoj.</p>";
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error',msg)   
    );
}

/**
 * Almetas regulesprimon al la serĉvorto
 * @param {Event} event
 */
export function regulEsprimo(event) {

    // eble traktu la helpopeton en aparta metodo!
    const re = event.target.id;
    if (re == "re_helpo") {
        window.open(globalThis.help_base_url + globalThis.help_regulesp);
        return;
    };
    /* else if (re == "sercho_det_regexes") {
        // enmetu radikon, se ankoraŭ malplena
        if (event.target.open && ! $("#re_radiko").val()) {
            const xmlarea = Artikolo.xmlarea("#xml_text");
            $("#re_radiko").val(xmlarea.getRadiko());
        }
    }*/

    // redonu prefiksojn aŭ sufiksojn aplikeblajn 
    // al radikkaraktero rkar kun rezulta vortspeco vspec
    // se ankoraŭ ne elektiĝis rkar/vspec ni povas
    // elekti afiksojn kun '?'...
    function re_afx(pref_suf,rkar,vspec) {
        const vs = (vspec?(vspec=='e'?'a':vspec):'?');
        const rk = (rkar?rkar:'?');

        function concat_no_dup(a,b) {
            return (a.concat(b))
                .filter((i,p,self)=>self.indexOf(i)===p);
        }

        let afxj = afiksoj[pref_suf]['?']['?'];

        if (vs != '?') // vortspeco (finaĵo) ne donita
            afxj = concat_no_dup(afxj,afiksoj[pref_suf]['?'][vs]);
        if (rk != '?') // radikkaraktero ne donita
            afxj = concat_no_dup(afxj,afiksoj[pref_suf][rk]['?']);
        if (rk != '?' && vs != '?') // ambaŭ ne donitaj
            afxj = concat_no_dup(afxj,afiksoj[pref_suf][rk][vs]);

        // se rkar = 'u' ni ankaŭ inkluzivas 'o', ĉar
        // afiksoj aplikeblaj al ulo, ankaŭ estas al aĵo
        if (rk == 'u') { // ula
            afxj = concat_no_dup(afxj,afiksoj[pref_suf]['o'][vs]);
        }

        // se vs = 'u' ni ankaŭ inkluzivas 'o', ĉar
        // o-finaĵo same bone aplikiĝas al uloj kiel al aĵoj
        // if (vs == 'u')
        //    afxj = afxj.concat(afiksoj[pref_suf][rk]['o']);
        // PRIPENSU: ĉu ni devas ankaŭ testi, ĉu ambaŭ rkar, vs = 'u'
        // kaj tiam inkluzivi o-o por tiuj (?)

        if (afxj.length) return '(' + afxj.join('|') + ')';        
        else return '';
    }

    const srch = DOM.e("#sercho_sercho");
    //const v = srch.val();
    //const sele = srch[0].selectionEnd;

    // kiu radikkaraktero estis elektita?
    const rk = DOM.v("#regexes input[name='re_rk']:checked") as string;
    // kiun vortspecon ni sercu?
    const vs = DOM.v("#regexes input[name='re_vs']:checked") as string;

    // vortkomenco?
    const vk = DOM.v("#re_b:checked");
    // ĉu prefikso/sufikso estu aplikataj
    const prf = DOM.c("#re_pref");
    const suf = DOM.c("#re_suf");
    
    const prfj = prf? re_afx('prefiksoj',rk,vs) : '';
    // PLIBONIGU: ni elektas tie ĉi la sufiksojn laŭ radikkaraktero,
    // sed eble ni devus uzi ĉiujn, kiuj rezultas el prefiksa apliko
    // aliflanke ne klaras ĉu unue la prefikso aŭ la sufikso aplikiĝas
    // al la radiko, sed verŝajne pli kutime unue la prefikso...
    const sufj = suf? re_afx('sufiksoj',rk,vs) : '';

    const fin = vs? {
        o: "oj?n?\\b", 
        a: "aj?n?\\b", 
        e: "en?\\b", 
        i: "([ao]s|[ui]s?)\\b",
        '?': ''
    }[vs] : '';

    const v = DOM.v("#re_radiko");
    DOM.al_html("#re_esprimo",
        (vk?'\\b':'')
        + (prfj? prfj+"<br>":"") 
        + "<b>" + v + "</b><br>" 
        + (sufj? sufj+"<br>" : "") 
        + fin);

    if (srch) (srch as HTMLInputElement).value = (vk?'\\b':'') + prfj + v + sufj + fin;
}

/**
 * Adaptas la liston de verkoj videblaj en la listo laŭ la 
 * periodo komenca jaro - fina jaro en la ŝovelektilo.
 */
export function verkoPeriodo() {
    const periodilo = DOM.e("#s_elektitaj_periodilo");

    function adaptuVerkliston(de,ghis) {
        DOM.idoj("#sercho_verklisto div")?.forEach((e) => {
            if (e.id != "vl_chiuj_") {
                const jar = +(e?.getAttribute('data-jar')||0);
                DOM.kaŝu(e, jar < de || jar > ghis); // ni kaŝas, se la argumento estas vera
            }
        });
    }

    if (periodilo instanceof HTMLElement) {
        const min = periodilo.getAttribute("data-min")||1887;
        const max = periodilo.getAttribute("data-max")||2050;
        const val = periodilo.getAttribute("data-val");
        const values = val?.split('-').map((x)=>+x); // "min-max" kiel du-nombra listo

        new Skal(periodilo, {
            range: true,
            min: +min,
            max: +max,
            valoroj: values, 
            kreo: function() {
                if (values?.length == 2) {
                    const de = values[0];
                    const ghis = values[1];
                    DOM.al_t("#periodilo_manilo_1",""+de);
                    DOM.al_t("#periodilo_manilo_2",""+ghis);       
                    adaptuVerkliston(de,ghis);    
                }
            },
            movo: function(event, ui) {
                // aktualigu la montratan periodon
                const de = ui.values[0];
                const ghis = ui.values[1];
                DOM.al_t("#periodilo_manilo_1",de);
                DOM.al_t("#periodilo_manilo_2",ghis);       

                // aktualigu la videblon de verkoj
                adaptuVerkliston(de,ghis);
                //montrilo.val( ui.values[0] + " - " + +ui.values[1] );
                verkinformo();
                //...
            }
        });
    };
};

function verkinformo() {
    const montrilo = DOM.e("#sercho_verkinfo");

    // jarperiodo
    const periodilo = DOM.e("#s_elektitaj_periodilo");

    if (periodilo instanceof HTMLElement) {
        const periodo = Skal.skal(periodilo)?.opcioj["valoroj"].join(' - ');
        let info = ' ' + periodo;
        
        // titoloj; subpremu, se verkoj ankoraŭ ne ŝargitaj kaj do 
        // ankaŭ ne adaptitaj
        const n = DOM.idoj(`#sercho_verklisto :not(.${DOM.klsKasxita}) input[name='cvl_elekto']:checked`)?.length;
        if (n) info += ', ' + n + ' titolo' + (n!=1?'j':'');
        
        if (montrilo) montrilo.textContent = info;
    }
}

/**
 * Vokas la verko-liston kaj prezentas ĝin 
 * por limigeblo de posta citaĵo-serĉo.
 * 
 * @param {Event} event
 */
export function verkoListo(event) {
    event.preventDefault();
    const vdiv = DOM.e("#sercho_verklisto");

    if (vdiv && ! vdiv.children.length) {
        // ni ŝargas la verkoliston...
        u.HTTPRequest('post', 'verkaro',
            { 
                kiu: 'chiuj'
            }, 
            function(data) {
                const json = JSON.parse(data);
                if (json.length && json[0].vrk) {                    
                    vdiv.insertAdjacentHTML("beforeend",'<div id="vl_chiuj_"><label for="vl__chiuj__">ĈIUJN malelekti/elekti</label>'
                    + '<input id="vl__chiuj__" type="checkbox" checked '
                    + 'name="cvl_chiuj" value="e_chiuj"></input></div>');

                    const jar_de = +(DOM.t("#periodilo_manilo_1")||0);
                    const jar_ghis = +(DOM.t("#periodilo_manilo_2")||0);

                    const vrkj = json.sort((a,b)=>(a.jar-b.jar||0));                  
                    for (const v of vrkj) {
                        const id = "vl_"+v.vrk;
                        let txt = v.aut? v.aut+': ':'';
                        txt += v.tit? v.tit : v.nom;
                        txt += v.jar? ' ('+v.jar+')' : '';
                        const cls = v.jar >= jar_de && v.jar <= jar_ghis? '' : ' class="kasxita"';
                        vdiv.insertAdjacentHTML("beforeend",'<div data-jar="' + +v.jar + '"' + cls +'><label for="'+ id + '">' 
                            + txt + '</label>'
                            + '<input id="'+ id +'" type="checkbox" checked '
                            + 'name="cvl_elekto" value="' + v.vrk + '"></input></div>');
                    }
                    vdiv.querySelectorAll("input").forEach((i) => {
                        const e = new Elektil(i);
                        e._on({change: verkinformo});
                    });
                    DOM.reago("#vl__chiuj__","change", (event) => {
                        const cb = event.target;
                        if (cb instanceof HTMLInputElement) {
                            const check = cb.checked;
                            vdiv.querySelectorAll("input[name='cvl_elekto']").forEach((i) => {
                                if (i instanceof HTMLInputElement) {
                                    i.checked = check; 
                                    //Elektil.refreŝigu(i);
                                }
                            });                        
                            verkinformo();       
                        }
                    });
                }
            },
            undefined, undefined,
            (msg: string) => Eraro.al('#sercho_error',msg)   
        );
    }
}

/**
 * Elektas/malektas verkojn en la verko-listo.
 * Per butono "preta" la elekto kaŝiĝas.
 * @param {Event} event
 */
export function verkElekto(event) {
    const btn = event.target;
    const kadr = btn.parentElement;
    const val = btn.value;

    function check_uncheck(v) {
        // (mal)elektu ĉiujn
        DOM.ej("#sercho_verkolisto input")?.forEach((i) => {
            if (i instanceof HTMLInputElement) {
                i.checked = v;
                //Elektil.refreŝigu(i);
            }
        });
    }

    if (val == "1") {
        // elektu ĉiujn
        check_uncheck(true);
    } else if (val == "0") {
        // elektu ĉiujn
        check_uncheck(false);
    } else if (val == "preta") {
        // kaŝu la liston
        DOM.kaŝu(kadr);
    }
}

/**
 * Eltrovas, kiuj verkoj estas elektitaj
 * @returns liston de verkoj (ties identigiloj)
 */
export function elektitajVerkoj() {
    let vl: Array<string> = [];
    DOM.ej(`#sercho_verklisto :not(.${DOM.klsKasxita})>:checked`)
    .forEach((e) => {
        const v: string = (e as HTMLInputElement).value;
        vl.push(v);         
    });
    return vl;
}

/**
 * Vokas la TTT-serĉon kaj prezentas la trovojn
 * @param {Event} event
 */
export function retoSerĉo(event) {
    event.preventDefault();
    if (! _serĉo_preparo()) return;

    const rx_img_link = /<(?:img|link)\b[^>]*>/ig;

    u.HTTPRequest('post','citajho_sercho',
        { 
            sercho: DOM.v("#sercho_sercho")||'',
            kie: 'anaso'
        }, 
        function(data) {   
            //const json = JSON.parse(data);
            const s_tr = DOM.e("#sercho_trovoj");
            if (!s_tr) throw new Error("Mankas elemento por prezenti la trovojn!");
    
            let last_link = '', last_title = '';
            let n = 0;
            const first_word = (DOM.v("#sercho_sercho")||'').split(' ')[0];
            // forigu bildojn (img) kaj <link...> el la HTML, por ke ili ne automate elshutighu...
            data = data.replace(rx_img_link, '');
            const ŝablono = new HTMLTrovoDt();
            
            data.querySelectorAll(".result-link,.result-snippet").forEach((e) => {

                // memoru la url kiel last_link
                if ( e.calssList.contains("result-link") )   {
                    const href = e.getAttribute("href") || '';
                    const hpos = href?.search('http');
                    last_link = (hpos && hpos >= 0)? decodeURIComponent(href.slice(hpos)) : href;
                    last_title = e.textContent;

                // kreu trov-eron
                } else if ( e.classList.contains("result-snippet") ) {
                    const snippet = e.textContent;
                    if ( last_title.search(first_word) >= 0 || snippet.search(first_word) >= 0 ) {

                        s_tr.insertAdjacentHTML("beforeend",'<dd id="trv_' + n + '">');

                        // DuckDuckGo alpendigas ĝenan parametron &rut
                        let url = last_link.replace(/&rut=[a-f0-9]+/,'');        

                        new Trovo("#trv_"+n,
                            {
                                ŝablono: ŝablono,
                                valoroj: {
                                    url: url,
                                    title: last_title,
                                    descr: snippet,
                                    data: {url: url, title: last_title, snip: snippet}
                                }
                            }
                        );

                        n++;
                    }
                }
            });
        
            if ( n == 0 ) {
                const s_tr = DOM.e("#sercho_trovoj");
                if (s_tr) s_tr.innerHTML = "<p>&nbsp;&nbsp;Neniuj trovoj.</p>";
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error',msg)
    );
}

/**
 * Vokas la bildo-serĉon (en Wikimedia) kaj prezentas la rezultojn.
 * @param {Event} event
 */
export function bildoSerĉo(event) {
    event.preventDefault();

    // /w/api.php?action=query&format=json&list=search&srsearch=korvo&srnamespace=0%7C-2&srlimit=20&srinfo=totalhits%7Csuggestion%7Crewrittenquery&srprop=size%7Cwordcount%7Ctimestamp%7Csnippet
    // /w/api.php?action=query&format=json&prop=imageinfo%7Cpageimages&pageids=513470%7C513472&iiprop=user%7Ccomment%7Cparsedcomment%7Ccanonicaltitle%7Ccommonmetadata%7Cextmetadata&piprop=thumbnail%7Cname%7Coriginal

    if (! _serĉo_preparo()) return;

    var pageids = "";

    u.HTTPRequest('post','bildo_sercho',
        { 
            sercho: DOM.v("#sercho_sercho")||'',
            kie: 'vikimedio'
        },
        function(data) {         
            const json = JSON.parse(data);
            const s_tr = DOM.e("#sercho_trovoj");
            let pageids:Array<string> = [];
            
            if (json.query && json.query.search 
                && json.query.search.length && s_tr) {
                var results = json.query.search;


                var ŝablono = new HTMLTrovoDt();
                var bld_ŝablono = new HTMLTrovoDdBld();

                for (let p in results) {
                    var res =results[p];
                    //pageids += res.pageid + "|";
                    pageids.push(res.pageid);      
                    

                    s_tr.insertAdjacentHTML("beforeend",'<dd id="trv_' + res.pageid + '">');
                    new Trovo("#trv_" +res.pageid,
                        {
                            type: "bildo",
                            ŝablono: ŝablono,
                            bld_ŝablono: bld_ŝablono,
                            valoroj: {
                                //url: '' + res.pageid,
                                title: res.title,
                                descr: res.snippet
                            }
                        }
                    );                       

                }
            } else {
                if (s_tr) s_tr.innerHTML = "<p>&nbsp;&nbsp;Neniuj trovoj.</p>";
            }
            // bildo_info(pageids.slice(0,-1));

            var chunk_size = 5;

            while (pageids.length) {
                _bildo_info(pageids.slice(0,chunk_size));
                pageids = pageids.slice(chunk_size);
            }            
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error',msg)    
    );
}

/**
 * Akiras la informojn pri bildoj el Wikimedia laŭ ties paĝ-indentigiloj
 * kaj prezentas enŝovas la rezultojn en la bildoprezento.
 * @param {Array<string>} pageids
 */
function _bildo_info(pageids) {

    const ids = pageids.join('|');

    // alert(pageids);
    u.HTTPRequest('post','bildo_info',
        { 
            paghoj: ids,
            kie: 'vikimedio'
        },
        function(datalist) {   
        //$("#sercho_trovoj").html('');
            for (let d=0; d<datalist.length; d++) {          
                const data = datalist[d];
        
                if (data.query && data.query.pages) {
                let results = data.query.pages;

                for (var p in results) {
                        let res = results[p];
                        let trv = Trovo.trovo("#trv_" + res.pageid);
                        if (trv) {
                            let dosieroj = trv.bildinfo(res, d==0,
                                function(event,data) {
                                    if (data) {                       
                                        _bildo_info_2(data.title);
                                    }
                                    // montru enmeto-dialogon
                                    Dialog.malfermu("#bildo_dlg");
                                    Slipar.montru("#tabs", 0);
                                });
                            // ni bezonas ankaŭ bildetojn por montri ilin, necesas aparte demandi tiujn...
                            if (dosieroj.length) _bildeto_info(dosieroj);    
                        }
                    }
                }
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error',msg)
    );
}



/**
 * Akiras bildeto-informojn (antaŭrigardoj de la bildoj)
 * @param {Array<string>} paghoj
 */
function _bildeto_info(paghoj) {
    const ps = paghoj.join('|');

    // alert(pageids);
    u.HTTPRequest('post','bildeto_info',
        { 
            dosieroj: ps,
            kie: 'vikimedio'
        },
        function(data) {   
        //$("#sercho_trovoj").html('');
            //for (var d=0; d<datalist.length; d++) {          
            //    data = datalist[d];
        
            if (data.query && data.query.pages) {
                var results = data.query.pages;

                for (let p in results) {
                    const res = results[p];
                    const pageid = res.pageid;

                    if (res.thumbnail)
                        DOM.al_html('#sercho_trovoj div.bildstriero a[href$="' + x.quoteattr(res.title) + '"]',
                            '<img src="'+res.thumbnail.source+'"/>');

                }                  
        //      } 
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error', msg)
    );
}

/** 
 * Akiras aldonajn informojn pri bildo (aŭtoro/fonto, permesilo ks)
 * @param {string} dosiero
 */
function _bildo_info_2(dosiero) {

    u.HTTPRequest('post', 'bildo_info_2',
        { 
            dosiero: dosiero,
            kie: 'vikimedio'
        },
        function(data) {   
        //$("#sercho_trovoj").html('');
        
            if (data.query && data.query.pages) {
                const results = data.query.pages;

                for (var p in results) {
                    const res = results[p];
                    const pageid = res.pageid;

                    if (res.thumbnail) {
                        DOM.e('#bildo_eta')?.setAttribute("src",res.thumbnail.source);
                    }

                    let desc = res.title, aut = '', prm = '';

                    if (res.imageinfo && res.imageinfo.length) {
                        let md = res.imageinfo[0].extmetadata;
                        aut = md.Attribution ? md.Attribution.value : (md.Artist ? md.Artist.value : '');
                        if (md.Credit) { aut += ', ' + md.Credit.value.replace('Own work','propra verko'); }
                        if ( md.ImageDescription ) desc = md.ImageDescription.value;
                        prm = md.LicenseShortName.value;
                    } else {
                        aut = '<meta-informoj mankas...>';
                        prm = '<meta-informoj mankas...>';
                    }

                    let values: TrovValoroj = {
                        url: decodeURI(res.original ? res.original.source : res.canonicalurl),
                        fmt: res.original ? res.original.width / res.original.height : 0,
                        aut: x.forigu_markup(aut),
                        prm: prm,
                        fnt: decodeURI(res.canonicalurl),
                        frazo: x.forigu_markup(desc)
                    };

                    DOM.al_v("#bildo_dlg input[type!='radio']","");
                    const dlg = Dialog.dialog("#bildo_dlg");
                    if (dlg) dlg.al_valoroj(values);
                    if (values && values.fnt)
                        DOM.e("#bildeto_url")?.setAttribute("href",values.fnt);
                }
            }
        },
        undefined, undefined,
        (msg: string) => Eraro.al('#sercho_error', msg)
    );
}



/**
 * Difinas jqueryui-elementon por prezenti unuopan trovon.
 */
class Trovo extends UIElement {
    static aprioraj = {
        type: "teksto",
        ŝablono: null,
        bld_ŝablonono: null,
        valoroj: {
            prompt: "&nbsp;&nbsp;&#x25B6;&#xFE0E;",
            id: '',
            url: '',
            title: '',
            descr: '',
            data: {} as any,
            enm_btn: true
        }
    };

    static trovo(element: HTMLElement|string) {
        const t = super.obj(element);
        if (t instanceof Trovo) return t;
    }

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element,opcioj,Trovo.aprioraj);

        this.opcioj.ŝablono = new HTMLTrovoDt();

        let v = this.opcioj.valoroj;
        this.opcioj.valoroj.id = this.element.id;
        var htmlstr = this.opcioj.ŝablono.html(v as any);
        /*
            '<dt>' + o.prompt + ' ' + '<span class = "trovo_titolo">'
                +  ( o.url ? 
                        '<a href="' + o.url + '" target="_new" ' + '>' + o.title + '</a>'
                        : o.title 
                    )
                + '</span> '
                + '<button id="r_' + id + '"/> '
                + ( o.enm_btn ? '<button id="e_' + id + '"/> ' : '' )
            + '</dt>\n';
            */
        this.element.insertAdjacentHTML("beforebegin",htmlstr);
        if (v.descr) this.element.textContent = v.descr;
        
        if (this.opcioj.type == "teksto") {
            // citaĵonumero por kunteksto estas nur en citaĵoserĉo, ne en retserĉo...:
            if (v.data.cit) {
                // en citaĵoserĉo ebligu kuntekston
                new KuntekstoBtn("#k_" + v.id, {fno: v.data.cit.fno});
            } else {
                // trovoj de retserĉo ne havu kunteksto-butonon
                DOM.e("#k_" + v.id)?.remove();
            }

            const dt = this.element.previousSibling;
            if (dt instanceof HTMLElement) {
                new RigardoBtn("#r_" + v.id, {url: v.url});
                new EkzemploBtn("#e_" + v.id, {
                    data: v.data,
                    enmetu: function(event,values) {
                        // montru enmeto-dialogon
                        DOM.al_v("#ekzemplo_dlg input","");
                        const dlg = Dialog.dialog("#ekzemplo_dlg");
                        if (dlg) {
                            dlg.al_valoroj(values);
                            dlg.malfermu();
                        }
                        Slipar.montru("#tabs", 0);
                    }
                });
            }
        } else {
            // bildoj ne havu kunteksto-butonon
            DOM.e("#k_"+v.id)?.remove();
        }

    };

    bildinfo(res, first, enmetu) {
        var o: any = this.opcioj;
        var v = o.valoroj;
        var pageid = res.pageid;

        v.data = res;
        v.url = res.canonicalurl;

        if (v.url) { // eble rezulto dividiĝas al pluraj respondoj... tiel ke mankas canonicalurl...

            // aldonu URL en la trov-alineo kaj aktivigu la butonojn Rigardu kaj Enmetu

            new RigardoBtn("#r_trv_" + pageid, {url: v.url});
            new BildoBtn("#e_trv_" + pageid, {
                data: v.data,
                enmetu: enmetu // reago-funkcio por enmeto...
            });
    
            DOM.e("#sercho_trovoj a[href='" + pageid +"']")
                ?.setAttribute("href",v.url);
            //a.after(rigardu.html(),' ',enmetu.html());
        }

        // se ekzistas bildeto aldonu ĝin ankaŭ
        if (res.thumbnail) {

/*
            let dd = '<table><tr><td><a href="' + res.original.source + '" target="_new">' +
            "<img src='" + res.thumbnail.source + "'/>" + "</a></td><td>" + 
            $("#trv_" + pageid).html() + "</td></tr></table>";
            $("#trv_" + pageid).html(dd);
            */
           DOM.al_html("#trv_" + pageid,
               o.bld_ŝablono.html({
                  original: res.original.source,
                  thumbnail: res.thumbnail.source,
                  t_html: DOM.html("#trv_" + pageid)
            }));

            if (first && res.ns == 0)
                DOM.e("#trv_" + pageid)?.append('<div class="bildstrio"></div>');
        }

        // se la trovita paĝo enhavas plurajn bildojn aldonu ilin tabele
        var dosieroj = Array();

        if (res.images) {
            for (var i in res.images) {
                let img = res.images[i];
                let ext = img.title.slice(-4).toLowerCase();

                if (ext == '.jpg' || ext == '.png') {
                    let iurl= "https://commons.wikimedia.org/wiki/" + x.quoteattr(img.title);
                    let title = img.title.slice(5,-4); // forigu File: kaj .xxx eble pli inteligente uzu Regex...
                    let li_item_id = res.pageid + "_" + img.title.hashFnv32a(true);

                    DOM.e("#trv_" + pageid + " > div")?.append(
                        "<div class='bildstriero'><p class='butonoj'>" 
                        + "<button id='r_" + li_item_id + "'></button> "
                        + "<button id='e_" + li_item_id + "'></button>" 
                        + "</p><a target='_new' href='" + iurl + "'>" + title 
                        + "</a></div>");

                    new RigardoBtn("#r_" + li_item_id, {url: iurl});
                    new BildoBtn("#e_" + li_item_id, {
                        data: img,
                        enmetu: enmetu
                        /*
                        enmetu: function(event,values) {
                            // montru enmeto-dialogon
                            $("#bildo_dlg").dialog("valoroj",values);
                            $("#bildo_dlg").dialog("open");
                            $("#tabs").tabs( "option", "active", 0);
                        } */
                    });
                    
                    dosieroj.push(img.title);
                }
            }
        }
        // ni bezonas ankaŭ bildetojn por montri ilin, necesas aparte demandi tiujn...
        return dosieroj;
    }
};

/**
 * Difinas jqueryui-elementon por la butono de citaĵo-kunteksto.
 */
class KuntekstoBtn extends UIElement {
    static aprioraj: {
        fno: null // frazo-numero per kiu peti kuntekston
    };

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element,opcioj,KuntekstoBtn.aprioraj);

        this.element.setAttribute("style","visibility: hidden");
        this.element.setAttribute("type","button");
        this.element.setAttribute("title","plia kunteksto");
        this.element.textContent = "Kunteksto";

        this._on({
            click: function(event) {
                if (this.opcioj.fno) {
                    event.preventDefault();
                    const id = event.target.id;
                    const dd_id = id.substring(2); // fortranĉu 'k_'

                    u.HTTPRequest('post','kunteksto',
                            { 
                                frazo: this.opcioj.fno,
                                n: "2"
                            },
                            function(data) {  
                                const json = JSON.parse(data); 
                                //$("#sercho_trovoj").html('');
                                if (json.length) {
                                    //console.debug(data[0]);
                                    const text = json.map(e => e.ekz).join('<br/>');
                                    DOM.al_html('#'+dd_id,text);
                                }
                                // momente ni nur unufoje povas montri pli da kunteksto
                                // poste eble ebligu laŭŝtupan plion...
                                DOM.e("#"+id)?.remove();
                            },
                            undefined, undefined,
                            (msg: string) => Eraro.al('#sercho_error',msg));

                } else {
                    throw new Error('nedifinita fraz-n-ro');
                }
            }
        });
    }
};

/**
 * Difinas jqueryui-elementon por la butono de fonto-rigardo.
 */
class RigardoBtn extends UIElement {
    static aprioraj: {
        url: null
    };

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element,opcioj,RigardoBtn.aprioraj);

        this.element.setAttribute("style","visibility: hidden");
        this.element.setAttribute("type","button");
        this.element.setAttribute("title","sur aparta paĝo");
        this.element.textContent = "Rigardu";

        this._on({
            click: function(event) {
                if (this.opcioj.url) {
                    event.preventDefault();
                    window.open(this.opcioj.url);
                    //console.debug("malfermas: "+url);
                } else {
                    throw new Error('nedifinita URL');
                }
            }
        });
    }
};

/**
 * Difinas jqueryui-elementon por lanĉi ekzemplo-dialogon
 * kiu helpas al uzanto enmeti la trovaĵon en la XML-artikolon.
 */
class EkzemploBtn extends UIElement {
    static aprioraj: {
        data: null,
        enmetu: null //event
    };

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj, EkzemploBtn.aprioraj);

        this.element.setAttribute("style","visibility: hidden");
        this.element.setAttribute("type","button");
        this.element.setAttribute("title","en la XML-tekston");
        this.element.textContent = "Enmetu";

        this._on({
            click: function(event) {
                let valoroj: TrovValoroj = {};
                const data = this.opcioj.data;

                // rezulto de Tekstaro-serĉo
                if (data.cit) {
                    valoroj = data.cit.fnt;
                    valoroj.frazo = data.cit.ekz;

                // rezulto de Vikipedio-serĉo
                } else if(data.pageid) {
                    valoroj.url = 'https://eo.wikipedia.org/?curid=' + data.pageid;
                    valoroj.bib = 'Viki';
                    valoroj.lok = data.title;
                    valoroj.frazo = data.title;

                // rezulto de Anaso-serĉo
                } else if (data.snip) {
                    valoroj.frazo = data.snip;
                    valoroj.url = data.url;        
                    valoroj.vrk = data.title;
                }

                this._trigger("enmetu",event,valoroj);
            }
        });
    }
};



/**
 * Difinas jqueryui-elementon por lanĉi bildo-dialogon
 * kiu helpas al uzanto enmeti la trovaĵon en la XML-artikolon.
 */
class BildoBtn extends UIElement {
    static aprioraj: {
        data: null,
        enmetu: null //event
    };

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element,opcioj,BildoBtn.aprioraj);

        this.element.setAttribute("style","visibility: hidden");
        this.element.setAttribute("type","button");
        this.element.setAttribute("title","en la XML-tekston");
        this.element.textContent = "Enmetu";

        this._on({
            click: function(event) {
                this._trigger("enmetu",event,this.opcioj.data);
            }
        });
    }
};
            
