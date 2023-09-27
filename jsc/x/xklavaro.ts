/*
  (c) 2016-2023 ĉe Wolfram Diestel
  laŭ GPL 2.0
*/

//import '../u/ht_util';
import * as u from '../u';
import { kameligo, minuskligo} from './tekstiloj';
import { Xlist } from './xlisto';
import { XmlRedakt } from './xmlredakt';
import { DOM, UIElement, Klavar } from '../ui';

/*
ctl: citilo-elemento
mis: misstilo-elemento
nom: nomo (ne-e-a)
nac: nacilingva vorto
esc: escepta vorto
ind: indeksero
var: variaĵo de kapvorto
frm: formulo
*/

/*
type KlavSpec = "ctl" | "mis" | "nom" | "nac" | "esc" | "ind" | "var" | "frm" 
  | "[elemento]" | "[indiko]" | "[serĉo]" | "[blank]" | "dekstren" | "maldekstren"
  | "tld" | "grase" | "kursive" | "emfaze" | "minuskle" | "kamele" | "sup" | "sub" ;
*/

// paletro de la klavaro: klavoj por ciuj fakoj, por diversaj aliaj indikoj (vspec, stl, ofc...) kaj 
// ceteraj klavoj por manipuli elementojn
type Reghimo = "indiko" | "fako" | "klavaro" | "sercho" | "blankigo" | null;
type Reghimpremo = (e: Event, r: {cmd: Reghimo}) => void;

type KiuRadiko = () => string;
type Komando = {cmd: Reghimo|string};
type PostEnmeto = (event: Event, cmd?: Komando) => void;

console.debug("Instalante la klavarfunkciojn...");

/**
 * @ deprecated

export function xpress(event: KeyboardEvent) {
    const key = event.key;
    const trg = event.target;
    if ((trg instanceof HTMLInputElement || trg instanceof HTMLTextAreaElement) 
        && (key == 'x' || key == 'X')) {   // X or x
        const res = xklavo(trg,key);
        if (!res) event.preventDefault();
    }
}*/

/**
 * Ebligas ŝanĝi la tajpmetodon por elemento al x-metodo, t.e. 
 * aŭtaomta traduko de cx -> ĉ, ĉx -> cx, ... ux -> ŭ, ŭx -> ux
 * Do unu "x" malantaŭ konverna litero transformas al supersigna litero.
 * Duobla "xx" malfaras tion aldonante normalan "x" post al litero.
 * La donita xbutono estas buton-elemento per kiu oni povas ŝalti inter
 * normala tajpado kaj x-tajpado por supersignoj.
 */
export class XTajpo {
    public elementoj: Array<HTMLInputElement|HTMLTextAreaElement>;
    public xbutono: HTMLInputElement|HTMLButtonElement;
    public aktiva: HTMLElement;

    constructor (
        elementoj: Array<HTMLInputElement|HTMLTextAreaElement|string>, 
        xbutono?: HTMLInputElement|HTMLButtonElement|string) {

            // pli bone uzu WeakSet, ĉar elementoj povas malaperi!
        this.elementoj = [];

        elementoj.forEach((e) => {
            this.aldonu(e);
        });

        // unua donita estu la aktiva ĝis evtl. plia aldono aŭ ŝanĝo
        this.aktiva = this.elementoj[0];

        if (xbutono) {
            const xbtn = (typeof xbutono == "string")? document.getElementById(xbutono) : xbutono;
            if (xbtn instanceof HTMLInputElement || xbtn instanceof HTMLButtonElement)
                this.xbutono = xbtn;
    
            this.xbutono.addEventListener("click",this.xŝalto.bind(this));
        }
    }
    
    aldonu(element: HTMLInputElement|HTMLTextAreaElement|string) {
        const el = (typeof element == "string")? document.getElementById(element) : element;
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            this.elementoj.push(el);
            Klavar.aldonu(el,"KeyX",this.xreago.bind(this));
            this.aktiva = el;
        } else
            throw "Ne valida elementtipo "+el?.id;
    }

    xŝalto(event: Event) {
        const btn = event.target;
        if (btn instanceof HTMLInputElement || btn instanceof HTMLButtonElement) {
            event.preventDefault();
            btn.value = ""+(1 - parseInt(btn.value));

            // saltu al la aktiva enigkampo por tuj ektajpi
            if (this.aktiva) this.aktiva.focus();
        }
    }

    xreago(event: KeyboardEvent) {
        const el = event.currentTarget;  
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            if (event.altKey) {	// Alt-x  --> ŝanĝu tajpmetodon cx <-> ĉ

                this.xbutono.value = ""+(1-parseInt(this.xbutono.value) || 0);
                event.preventDefault();

            } else if ((!this.xbutono || this.xbutono.value == "1") 
                && ! event.ctrlKey && ! event.metaKey) {

                const res = xklavo(el,event.key);
                if (!res) event.preventDefault();
            }
        }
    }
}


/*
    // Default options.
    options: {
            klavoj: '', // povas esti String, ekz 'ĉ ĝ ĥ ĵ ŝ ŭ',
               // se malplena ĝi estas prenita el la klavaro-elemento:
               // <div id="klavoj">ĉ ĝ ĥ ĵ ŝ ŭ Ĉ Ĝ Ĥ Ĵ Ŝ Ŭ</div>
            artikolo: {},
            posedanto: '', // dialogo, en kiu troviĝas
            akampo: '', // apriora kampo, al kiu klavoj efikas
            reĝimpremo: null, // evento kiam reĝimbuton premiĝis (fermu, indiko, serĉo)
            postenmeto: null // evento, vokita post kiam enmeto okazis
    },
    */

// PLIBONIGU: prefere ni havu du klasojn aŭ almenaŭ du diversajn constructor-signaturojn:
// 1. por XMLRedakt-kampo
// 2. por dialogo
// Alternative ni povus uzi TS overload aŭ paki la parametrojn en opcio-objektojn.

/**
 * Klaso por regi aldonajn butonarojn por redaktado (indikoj, fakoj, stiloj, elementoj, aliaj simboloj)
 */
export class XKlavaro extends UIElement {
    /**
     * Influejo estas la HTML-elemento en kies kadro la butonaro efikas, t.e. formularo kun la kampoj aŭ unuopa kampo, 
     * en kiuj okazas la redaktoj. Ordinare ili mem estas ekster tiu influejo.
     */
    static influejoj = new WeakMap();


    /**
     * Retrovas la klavaron ligita al HTML-elemento
     */
    static klavaro(element: HTMLElement|string) {
        const k = super.obj(element);
        if (k instanceof XKlavaro) return k;
    }

    /**
     * Difinas la tekston por tildoj ĉe la klavaro ligita al HTML-elemento
     */
    static tildo(element: HTMLElement|string, teksto: string) {
        const k = XKlavaro.klavaro(element);
        if (k) k.tildo = teksto;
    }

    /**
     * Signoj kun ties helpotekstoj
     */
    static signoj: u.StrObj = {
        "\u2015": "longa streko",
        "\u2013": "mezlonga streko",
        "\u00b7": "mezpunkto", 
        "\u2AFD": "versrompo",
        "\xa0": "spaco nerompebla",
        "\u202f": "spaceto nerompebla"
    }

    /**
     * XML-Elementoklavoj kun ties helpotekstoj
     */
    static elementoj: u.StrObj = {
        ctl: "citilo-elemento",
        mis: "misstilo-elemento",
        nom: "nomo (ne-e-a)",
        nac: "nacilingva vorto",
        esc: "escepta vorto",
        ind: "indeksero",   
        var: "variaĵo de kapvorto",
        frm: "formulo"                    
    };

    /**
     * Diversaj krampoj / klarigelementoj kun ties helpotekstoj.
     */
    static krampoj: u.StrObj = {
        "()": "rondaj krampoj",
        "[]": "rektaj krampoj",
        '„“': "citiloj",
        "‚‘": "simplaj citiloj"
    }

    public celo: HTMLInputElement|HTMLTextAreaElement;
    private klavoj: string;
    public tildo: string; // per kiu teksto (radiko) ni anstataŭigu tildojn

    /**
     * 
     * @param klavaro la HTML-Elemento, kiu enhavas la klavaron aŭ ties HTML-id
     * @param celo  la cel-kampo en kiu ni redaktas
     * @param reĝimpremo reago, kiam okazas reĝimŝanĝo, t.e. se reĝim-klavo estas premita, kutime montrante aliajn klavojn (fakoj->stiloj ks)
     * @param postenmeto reago, kiu okazu post redakto en celo
     */
    constructor(klavaro: HTMLElement|string, 
        celo: HTMLInputElement|HTMLTextAreaElement|string, 
        public reĝimpremo?: Reghimpremo, 
        public postenmeto?: PostEnmeto) 
    {
        super(klavaro,{});

        const c = (typeof celo === "string")? document.getElementById(celo) : celo;
        if (c instanceof HTMLInputElement || c instanceof HTMLTextAreaElement) {
            this.celo = c;
            XKlavaro.influejoj.set(c,this);
        }

        this.klavoj = this.element.textContent || '';

        // registru klak-reagon
        // vd. https://stackoverflow.com/questions/1338599/the-value-of-this-within-the-handler-using-addeventlistener
        this.element.addEventListener("click", (event) => this.premo(event));
    }


    /**
     * Kreas elemento-klavojn laŭ teksta priskribo. Ekz-e
     * [indiko] &#x2015; &middot; &nbsp; &#x202f;
     * tld [] () &#x201e;&#x201c; &sbquo;&#x2018; 
     * ctl nom nac esc ind var frm
     * grase kursive emfaze sup sub minuskloj kamelo
     * @param klvrElm - elemento en kiun aranĝi la fakoklavojn
     * @param klavstr - klavaro-specifo kiel teksto
     */
    elemento_klavoj(klavstr?: string|null, sub?: HTMLElement) {
        let html='';
        const klavoj = (klavstr?klavstr:this.klavoj)
            .trim().split(/[ \n\r\t\f\v]+/);

        const elm = sub? sub: this.element;

        for (let i=0; i<klavoj.length; i++) {
            let klv = klavoj[i];
            // unuopa signo -> simbolo-klavo
            if (klv.length == 1) {
                const title = XKlavaro.signoj[klv]||'';
                switch (klv) {
                    case '\xa0':
                        html += `<div class="klv" data-btn="&nbsp;" title="${title}">]&nbsp;[</div>`;
                        break;
                    case '\u202f':
                        html += `<div class="klv" data-btn="&#x202f;" title="${title}">][</div>`;
                        break;
                    default:
                        html += `<div class="klv" data-btn="${klv}" title="${title}">${klv}</div>`;
                } 
            // duopa signo -> enkrampiga
            } else if (klv.length == 2) {
                const title = XKlavaro.krampoj[klv];
                html += `<div class="klv elm_btn" data-cmd="${klv}" title="${title}">${klv[0]}&hellip;${klv[1]}</div>`;
            // pli longaj estas elemento-butonoj k.s.
            } else {
                if (klv in XKlavaro.elementoj) {
                    const title = XKlavaro.elementoj[klv]
                    html += `<div class="klv elm_btn" data-cmd="${klv}" title="${title}">${klv}</div>`;
                } else {
                    switch (klv) {
                        /*
                    case '[fermu]':
                        html += '<div class="reghim_btn" data-cmd="fermu" title="kaŝu la klavaron">&#x2b07;&#xFE0E;</div>';
                        break;
                        */
                    case '[elemento]':
                        html += "<div class='klv reghim_btn' data-cmd='klavaro' title='krom-klavaro'><span>&lt;&hellip;&gt;<br/>[&hellip;]</span></div>"                   
                        break;
                    case '[indiko]':
                        html += '<div class="klv reghim_btn" data-cmd="indiko" title="indiko-klavaro">&#x2605;&#xFE0E;</div>';
                        break;
                    case '[fako]':
                        html += '<div class="klv reghim_btn" data-cmd="fako" title="fako-klavaro">&#x26CF;&#xFE0E;</div>';
                        break;
                    case '[serĉo]':
                        html += '<div class="klv reghim_btn" data-cmd="sercho" title="Serĉi la elektitan tekston">&#x1F50D;&#xFE0E;</div>';
                        break;
                    case '[blank]':
                        html += '<div class="klv reghim_btn" data-cmd="blankigo" title="Blankigu la kampojn">&#x232b;</div>';
                        break;
                    case 'tld': 
                        html += '<div class="klv elm_btn" data-cmd="tld" title="tildo/tildigo">~</div>';
                        break;
                    case 'grase':
                        html += '<div class="klv elm_btn" data-cmd="g" title="grase"><b>g</b></div>';
                        break;
                    case 'kursive':
                        html += '<div class="klv elm_btn" data-cmd="k" title="kursive"><i>k</i></div>';
                        break;
                    case 'emfaze':
                        html += '<div class="klv elm_btn" data-cmd="em" title="emfazo"><strong>em</strong></div>';
                        break;
                    case 'strekite':
                            html += '<div class="klv elm_btn" data-cmd="ts" title="trastreko"><del>ts</del></div>';
                            break;
                    case 'sup':
                        html += '<div class="klv elm_btn" data-cmd="sup" title="suprigite" ' +
                                'style="padding-top:0.35em; padding-bottom:0.15em ">a<sup>s</sup></div>';
                        break;
                    case 'sub':
                        html += '<div class="klv elm_btn" data-cmd="sub" title="subigite">a<sub>s</sub></div>';
                        break;
                    case 'minuskle':
                        html += '<div class="klv elm_btn" data-cmd="minuskloj" title="minuskligo">A&#x25ba;a</div>';
                        break;
                    case 'kamele':
                        html += '<div class="klv elm_btn" data-cmd="kamelo" title="komenc-majuskloj">&#x25ba;Ab</div>';
                        break;
                    case 'trd':
                        html += '<div class="klv elm_btn" data-cmd="trd" title="traduko">trd</div>';
                        break;
                    case 'dekstren':
                        html += '<div value="+2i" class="klv tab_btn" title="Ŝovu la markitan tekston dekstren.">&#x21E5;</div>';
                        break;
                    case 'maldekstren':
                        html += '<div value="-2i" class="klv tab_btn" title="Ŝovu la markitan tekston maldekstren.">&#x21E4;</div>';
                        break;
                    default:
                        html += '<div class="klv elm_btn" data-cmd="' + klv + '">' + klv + '</div>';
                    }
                }
            }
        }
        elm.innerHTML = html;
    }


    /**
     * Kreas butonojn por stiloj, fakoj, gramatikaj indikoj
     * @param klvrElm - elemento en kiun aranĝi la fakoklavojn
     * @param stlList - Xlist kun stiloj
     */
    indiko_klavoj(stlList: Xlist, sub?: HTMLElement) {

        const elm = sub? sub: this.element;
    
        this.elemento_klavoj(elm.textContent||'',elm);
        const pos = elm.children.length; // tie ni poste enŝovos la stilbutonojn!

        let indikoj = "<div class='klv ofc' data-ofc='*' title='fundamenta (*)'><span>funda-<br/>menta</span></div>";
        for (var i=1; i<10; i++) {
            indikoj += "<div class='klv ofc' data-ofc='" + i + "' title='" + i + "a oficiala aldono'><span><b>" + i + "a</b> aldono" + "</span></div>";
        }
        
        indikoj += "<div class='klv gra' data-vspec='tr' title='vortspeco: transitiva verbo'><span>tr.<br/>verbo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='ntr' title='vortspeco: netransitiva verbo'><span>netr.<br/>verbo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='x' title='vortspeco: verbo (x)'><span>tr./ntr.<br/>verbo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='abs.' title='vortspeco: absoluta, senkomplementa verbo'><span>abs.<br/>verbo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='subst.' title='vortspeco: substantivo'><span>subs- tantivo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='adj.' title='vortspeco: substantivo'><span>adjek- tivo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='adv.' title='vortspeco: substantivo'><span>adver- bo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='artikolo' title='vortspeco: artikolo'><span>arti-<br/>kolo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='determinilo' title='vortspeco: determinilo'><span>deter- minilo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='interjekcio' title='vortspeco: interjekcio'><span>inter- jekcio</span></div>";
        indikoj += "<div class='klv gra' data-vspec='konjunkcio' title='vortspeco: konjunkcio'><span>konjunk- cio</span></div>";
        indikoj += "<div class='klv gra' data-vspec='prefikso' title='vortspeco: prefikso'><span>pre- fikso</span></div>";
        indikoj += "<div class='klv gra' data-vspec='sufikso' title='vortspeco: sufikso'><span>su-<br/>fikso</span></div>";
        indikoj += "<div class='klv gra' data-vspec='prepozicio' title='vortspeco: prepozicio'><span>prepo- zicio</span></div>";
        indikoj += "<div class='klv gra' data-vspec='prepoziciaĵo' title='vortspeco: prepoziciaĵo'><span>prepo- ziciaĵo</span></div>";
        indikoj += "<div class='klv gra' data-vspec='pronomo' title='vortspeco: pronomo'><span>pro- nomo</span></div>";
        
        elm.innerHTML += indikoj;

        function stilKlavoHtml(kod: string, nom: string) {
            const btn = u.ht_elements([
                ['div',{
                    class: 'klv stl', 
                    'data-stl': kod,
                    title: 'stilo: ' + nom},
                    [ ['span',{},[nom,['br'],kod]] ]
                ]
            ]);
            elm.children[pos?pos-1:0]
                .insertAdjacentElement('afterend', btn[0] as Element);
        }
        
        stlList.load(null,stilKlavoHtml);
    };

    /**
     * Kreas butonojn por fakoj
     * @param klvrElm - elemento en kiun aranĝi la fakoklavojn
     * @param fakList - Xlist kun fakoj
     */
    fako_klavoj(fakList: Xlist, sub?: HTMLElement) {
    
        const elm = sub? sub: this.element;

        function fakoKlavoHtml(kod: string, nom: string) {
            const btn = u.ht_elements([
                ['div',{
                    class: 'klv fak', 
                    'data-fak': kod,
                    title: 'fako: ' + nom},
                    [['img',{
                        src: '../smb/' + kod + '.png',
                        alt: kod}],
                    ['br'],kod]
                ]
            ]);
            if (btn)
                elm.append(...btn);
        }            

        this.elemento_klavoj(elm.textContent, elm);
        fakList.load(null,fakoKlavoHtml);
    };


    /**
     * Reago al premo de X-klavo
     * @param event 
     */
    premo(event: Event) {
        event.stopPropagation();
        const trg = event.target as Element;
        const btn = trg.closest(".klv");

        if (btn) {
            const text = btn.getAttribute("data-btn");
            const cmd = btn.getAttribute("data-cmd");
            /// const element = this.klavaro;

            if (btn.classList.contains("reghim_btn")) {
                if (this.reĝimpremo) this.reĝimpremo(event,{cmd: cmd as Reghimo});

            } else if (btn.classList.contains("stl")) {
                const stl = btn.getAttribute("data-stl");
                this.enmeto('<uzo tip="stl">' + stl + '</uzo>');
                if (this.postenmeto) this.postenmeto(event);

            } else if (btn.classList.contains("fak")) {
                const fak = btn.getAttribute("data-fak");
                this.enmeto('<uzo tip="fak">' + fak + '</uzo>');
                if (this.postenmeto) this.postenmeto(event);

            } else if (btn.classList.contains("ofc")) {
                const ofc = btn.getAttribute("data-ofc");
                this.enmeto('<ofc>' + ofc + '</ofc>');
                if (this.postenmeto) this.postenmeto(event);

            } else if (btn.classList.contains("gra")) {
                const vspec = btn.getAttribute("data-vspec");
                this.enmeto('<gra><vspec>' + vspec + '</vspec></gra>');
                if (this.postenmeto) this.postenmeto(event);

            /* ni lasos por subklaso, kie celo estas XMLRedakt
            } else if (btn.classList.contains("tab_btn")) {
                // butonoj por en-/elŝovo
                const val = btn.getAttribute("value");
                if (val) {
                    let n = parseInt(val.substring(0,2),10);
                    const ta = this.celo;

                    if (n && ta instanceof HTMLTextAreaElement) {
                        const i_ = get_indent(ta).length;
                        if (i_ % 2 == 1) n = n/2; // ŝovu nur unu (±2/2) ĉe momente nepara enŝovo!
                        indent(ta,n);
                        if (this.postenmeto) this.postenmeto(event);
                    }
                }
            } else if (cmd == "tld") { // anstataŭigo de tildo
                const elektita = this.elekto(); 
                if (elektita == "~" || elektita == "") {
                    this.enmeto("<tld/>");
                } else {
                    //var radiko = xmlGetRad($("#xml_text").val());
                    // traktu ankaŭ majusklan / minusklan formon de la radiko
                    let first = radiko.charAt(0);
                    first = (first == first.toUpperCase() ? first.toLowerCase() : first.toUpperCase());
                    const radiko2 = first + radiko.slice(1);
                            
                    if ( radiko ) {
                        const newtext = elektita.replace(radiko,'<tld/>').replace(radiko2,'<tld lit="'+first+'"/>');
                        this.enmeto(newtext); 
                    }
                }

                if (this.postenmeto) this.postenmeto(event,{cmd: cmd});

            // traduko
            } else if (cmd == "trd") {
                const sel = this.elekto();
                // PLIBONIGU: principe povus interesti alilingva traduko
                // do pli bone uzu regulesprimon, krome ni ankaŭ povus rigardi en antau_elekto()
                if (sel) {
                    const enm = this.post_elekto().indexOf("</trdgrp")>-1
                    ? '<trd>' + sel + '</trd>' 
                    : '<trd lng="">' + sel + '</trd>';
                    this.enmeto(enm);
                    if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
                }

            // majusklaj komencliteroj de vortoj
            } else if (cmd == "kamelo") {
                const sel = this.elekto();
                //var rad = sel.includes('<tld')? xmlGetRad($("#xml_text").val()) : '';
                if (sel) {
                    const rad = sel.includes('<tld')? radiko : '';
                    this.enmeto(kameligo(sel,rad));    
                    if (this.postenmeto) this.postenmeto(event,{cmd: cmd});    
                }

            // minuskligo
            } else if (cmd == "minuskloj") {
                const sel = this.elekto();
                this.enmeto(minuskligo(sel,radiko));
                if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
*/
            // aliajn kazojn traktu per _ekran_klavo...
            } else {
                const sel = this.elekto();
                const enm = text 
                    || (cmd? this.ekran_klavo(cmd,sel) : '');
                if (enm) this.enmeto(enm);
                if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
            }
        }
    };    


    /**
     * Redonas la elektitan tekston de la lasta tekstelemento (input,textarea) kiu havis la fokuson
     * @returns la elektitan tekston
     */
    elekto(): string|undefined {
        const element = this.celo;
        /*
        if ('selection' in document) {
            // Internet Explorer
            element.focus();
            const sel = document.selection.createRange();
            return sel.text;
        }
        else if ('selectionStart' in el) { */
            // other, e.g. Webkit based
            if (element)
                return element.value.substring(element.selectionStart||0, element.selectionEnd||0);
            /*
        } else {
            console.error("selection (preni markitan tekston) ne subtenita por tiu krozilo");
        }*/
    };    


    /**
     * Enmetas tekston ĉe la pozicio de kursoro, resp. anstataŭigas la nunan elekton per nova teksto.
     * @param val - teksto por enmeti
     */
    enmeto(val: string) {
        const element = this.celo;

        // @ts-ignore
        if (document.selection && document.selection.createRange) { // IE/Opera
            element.focus();
            // @ts-ignore
            let sel = document.selection.createRange();
            sel.text = val;
            element.focus();

        } else if (element.selectionStart || element.selectionStart === 0) {
            // Firefox and Webkit based
            const startPos = element.selectionStart;
            const endPos = element.selectionEnd||startPos;
            const scrollTop = element.scrollTop;
            element.value = element.value.substring(0, startPos)
            + val
            + element.value.substring(endPos, element.value.length);
            element.focus();
            element.selectionStart = startPos + val.length;
            element.selectionEnd = startPos + val.length;
            element.scrollTop = scrollTop;

        } else {
            element.value += val;
            element.focus();
        }
    };


    /**
     * Redonas tekston por ekranklavo, ĉe tekstklavo, tio estas la koncerna teksto
     * ĉe komando tio estas kombino de komando kaj la elekto 
     * @param text - la teksto asociita kun la klavo
     * @param cmd - la komando asociita kun la klavo
     * @param sel - la teksto elektita en la redaktata kampo
     * @returns 
     */
    ekran_klavo(cmd: string, sel?: string): string {
        let s_ = '';
        // simbol-klavo redonu la tekston
        // if (text) {
        //     return text;
        // citiloj
        //} else 
        if (cmd == "\u201e\u201c" || cmd =="\u201a\u2018" || cmd == "\u29da\u29db") {
            s_ = sel || "\u2026";
            return (cmd[0] + s_ + cmd[1]);
        // klarigoj en krampoj
        } else if (cmd == "[]" || cmd == "()") {
            s_ = sel || "\u2026";
            return ('<klr>' 
                // krampon ks ni ne aldonas, se ĝi jam estas parto de la elektita teksto
                + ( sel && sel[0] != cmd[0]? cmd[0]:"" ) 
                + s_ + ( sel && sel[sel.length-1] != cmd[1]? cmd[1]:"" ) 
                + '</klr>');
        // variaĵo
        } else if (cmd == "var"){
            s_ = sel || "\u2026";
            return ('<var><kap>' + s_.replace('~','<tld/>') + '</kap></var>');
        // elemento-klavo
        } else {
            s_ = sel || "\u2026";
            return ('<' + cmd + '>' + s_ + '</' + cmd + '>');
        } 
    };

}

export class XRedaktKlavaro extends XKlavaro {

    /**
     * Kreas XML-ekran-klavaron. La klavaro efikas ene de kadra dialogo. Fokusŝanĝoj pri enhavataj input- kaj textarea-elementoj
     * estas memorataj. Se la lasta fokuso ne kuŝis en tia tekst-elemento la klavoj efikas al la donita apriora elemento.
     * la HTML-enhavo de klavaro povas esti plej simple io kiel 'ĉ ĝ ĥ ĵ ŝ ŭ'...
     * @constructor
     * @param klavaro - la elemento enhavante la klavaron kiel HTML-elementoj
     * @param xmlarea  la cel-kampo en kiu ni redaktas, XMLRedakt-objekto
     * @param reĝimpremo - revokfunkcio, vokata kiam reĝimklavo estas premata
     * @param postenmeto - revokfunkcio, vokata post kiam tekstenmeta klavo estis premita
     */    
    constructor(
        klavaro: HTMLElement|string, 
        protected xmlarea: XmlRedakt,
        public reĝimpremo?: Reghimpremo, 
        public postenmeto?: PostEnmeto) 
    { 
        super(klavaro, xmlarea.element as HTMLTextAreaElement, reĝimpremo, postenmeto);
    }

    premo(event: Event) {

        event.stopPropagation();
        const trg = event.target as Element;
        const btn = trg.closest(".klv");

        const radiko = this.xmlarea.radiko;
        const ta = this.xmlarea.element;

        if (btn) {
            const text = btn.getAttribute("data-btn");
            const cmd = btn.getAttribute("data-cmd");

            if (btn.classList.contains("tab_btn")) {
                // butonoj por en-/elŝovo
                const val = btn.getAttribute("value");
                if (val) {
                    let n = parseInt(val.substring(0,2),10);
                    const ta = this.celo;

                    if (n && ta instanceof HTMLTextAreaElement) {
                        const i_ = this.xmlarea.enŝovo?.length || 0;
                        if (i_ % 2 == 1) n = n/2; // ŝovu nur unu (±2/2) ĉe momente nepara enŝovo!
                        this.xmlarea.enŝovo = n;
                        if (this.postenmeto) this.postenmeto(event);
                    }
                }
            } else if (cmd == "tld") { // anstataŭigo de tildo
                const elektita = this.elekto()||''; 
                if (elektita == "~" || elektita == "") {
                    this.enmeto("<tld/>");
                } else {
                    //var radiko = xmlGetRad($("#xml_text").val());
                    // traktu ankaŭ majusklan / minusklan formon de la radiko
                    let first = radiko.charAt(0);
                    first = (first == first.toUpperCase() ? first.toLowerCase() : first.toUpperCase());
                    const radiko2 = first + radiko.slice(1);
                            
                    if ( radiko ) {
                        const newtext = elektita.replace(radiko,'<tld/>').replace(radiko2,'<tld lit="'+first+'"/>');
                        this.enmeto(newtext); 
                    }
                }

                if (this.postenmeto) this.postenmeto(event,{cmd: cmd});

            // traduko
            } else if (cmd == "trd") {
                const sel = this.elekto();
                // PLIBONIGU: principe povus interesti alilingva traduko
                // do pli bone uzu regulesprimon, krome ni ankaŭ povus rigardi en antau_elekto()
                if (sel) {
                    const enm = this.post_elekto().indexOf("</trdgrp")>-1
                    ? '<trd>' + sel + '</trd>' 
                    : '<trd lng="">' + sel + '</trd>';
                    this.enmeto(enm);
                    if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
                }

            // majusklaj komencliteroj de vortoj
            } else if (cmd == "kamelo") {
                const sel = this.elekto();
                //var rad = sel.includes('<tld')? xmlGetRad($("#xml_text").val()) : '';
                if (sel) {
                    const rad = sel.includes('<tld')? radiko : '';
                    this.enmeto(kameligo(sel,rad));    
                    if (this.postenmeto) this.postenmeto(event,{cmd: cmd});    
                }

            // minuskligo
            } else if (cmd == "minuskloj") {
                const sel = this.elekto();
                if (sel) {
                    this.enmeto(minuskligo(sel,radiko));
                    if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
                }
            } else {
                super.premo(event);
            }
        }
    }

    antau_elekto(): string {
        const element = this.celo;
        const start = element.selectionStart||0;
        return element.value.substring(
            Math.max(0,start-20), start);
    }

    post_elekto(): string {
        const element = this.celo;
        const end = element.selectionEnd||0;
        return element.value.substring(end,end+20);
    }
}

/**
 * Realigas XKlavaron, kies influejo estas formularo kun pluraj enigkampoj.
 * Ĝi memoras la laste fokusitan, por scii kien efiku la klav-redaktoj
 */
export class XFormularKlavaro extends XKlavaro {

    private influejo: HTMLElement|null;

    /**
     * Kreas XML-ekran-klavaron. La klavaro efikas ene de kadra dialogo. Fokusŝanĝoj pri enhavataj input- kaj textarea-elementoj
     * estas memorataj. Se la lasta fokuso ne kuŝis en tia tekst-elemento la klavoj efikas al la donita apriora elemento.
     * la HTML-enhavo de klavaro povas esti plej simple io kiel 'ĉ ĝ ĥ ĵ ŝ ŭ'...
     * @constructor
     * @param klavaro - la elemento enhavante la klavaron kiel HTML-elementoj
     * @param formularo - la kadra formularo (HTML-elemento) en kiu efiku la klavaro
     * @param postenmeto - revokfunkcio, vokata post kiam tekstenmeta klavo estis premita
     */    
    constructor(
        klavaro: HTMLElement|string, 
        formularo: HTMLElement|string, 
        public reĝimpremo?: Reghimpremo,
        public postenmeto?: PostEnmeto) 
    {
        super(klavaro, '', reĝimpremo, postenmeto);

        this.influejo = typeof formularo === "string"? document.getElementById(formularo) : formularo;

        if (this.influejo) {
            XKlavaro.influejoj.set(this.influejo, this);

            // celon ni komenci difinu aŭ per kampo kun tabindex=1 aŭ
            // la unuan en la influejo
            const unua = this.influejo.querySelector("[tabindex='1']")
                || this.element.querySelector("input,textarea");            
            if (unua instanceof HTMLInputElement
                || unua instanceof HTMLTextAreaElement) this.celo = unua;

            // por scii kie klavoj ind/klr efiku
            DOM.reago(this.influejo,"focusout",(event: Event) => {
                const trg = event.target;
                if (trg instanceof HTMLInputElement || trg instanceof HTMLTextAreaElement) {
                    this.celo = trg;
                }
            });             
        }
    }
}


function xklavo(el: HTMLInputElement|HTMLTextAreaElement, key: string): boolean {

    const cx1: any = {
        s: '\u015D',
        S: '\u015C',
        c: '\u0109',
        C: '\u0108',
        h: '\u0125',
        H: '\u0124',
        g: '\u011D',
        G: '\u011C',
        u: '\u016D',
        U: '\u016C',
        j: '\u0135',
        J: '\u0134'
    };

    const cx2: any = {
        '\u015D': 's',
        '\u015C': 'S',
        '\u0109': 'c',
        '\u0108': 'C',
        '\u0125': 'h',
        '\u0124': 'H',
        '\u011D': 'g',
        '\u011C': 'G',
        '\u016D': 'u',
        '\u016C': 'U',
        '\u0135': 'j',
        '\u0134': 'J'
    };
    
    function cxigi(b: string, key: string) {
        const k = key; //String.fromCharCode(key);
        return (cx1[b] || (cx2[b] ? cx2[b] + k : ''));
    }

    // @ts-ignore
    if (document.selection && document.selection.createRange) { // IE/Opera
        /* /save window scroll position
        if (document.documentElement && document.documentElement.scrollTop)
            var winScroll = document.documentElement.scrollTop
        else if (document.body)
            var winScroll = document.body.scrollTop;
            */
        //get current selection  
        el.focus();
        // @ts-ignore
        var range = document.selection.createRange();
        if (range.text != "") return true; // la retumilo traktu la eventon mem
        range.moveStart('character', -1); 
        const nova = cxigi(range.text, key);
        if (nova != "") {
            range.text = nova;
            return false;
        }
    } else if (el.selectionStart || el.selectionStart === 0) { // Mozilla
        var start = el.selectionStart;
        var end = el.selectionEnd;
        if (start != end || start == 0) return true; // la retumilo traktu la eventon mem

        const nova = cxigi(el.value.substring(start-1, start), key);
        if (nova != "") {
            //save textarea scroll position
            var textScroll = el.scrollTop;
            var val = el.value;
            el.value = val.substring(0,start-1) + nova + val.substring(end,val.length);
            el.selectionStart = start + nova.length-1;
            el.selectionEnd = el.selectionStart;
            //restore textarea scroll position
            el.scrollTop = textScroll;
            return false;
        }
    };
    return true;  // la retumilo traktu la eventon mem
};