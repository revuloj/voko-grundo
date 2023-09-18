/*
  (c) 2016-2023 ĉe Wolfram Diestel
  laŭ GPL 2.0
*/

//import '../u/ht_util';
import * as u from '../u';
import {indent,get_indent,kameligo,minuskligo,get_line_pos} from './tekstiloj';
import { Xlist } from './xlisto';
import { Klavar } from '../ui';

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

console.debug("Instalante la klavarfunkciojn...");

/**
 * @deprecated

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

export class XKlavaro {
    public klavaro: Element | null;
    public dialogo: Element | null;
    public apriora_kampo: HTMLInputElement | null;
    public lasta_fokuso?: string;
    public klavoj: string;

    static signoj: u.StrObj = {
        "\u2015": "longa streko",
        "\u2013": "mezlonga streko",
        "\u00b7": "mezpunkto", 
        "\u2AFD": "versrompo",
        "\xa0": "spaco nerompebla",
        "\u202f": "spaceto nerompebla"
    }

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

    static krampoj: u.StrObj = {
        "()": "rondaj krampoj",
        "[]": "rektaj krampoj",
        '„“': "citiloj",
        "‚‘": "simplaj citiloj"
    }


    /**
     * Kreas XML-ekran-klavaron. La klavaro efikas ene de kadra dialogo. Fokusŝanĝoj pri enhavataj input- kaj textarea-elementoj
     * estas memorataj. Se la lasta fokuso ne kuŝis en tia tekst-elemento la klavoj efikas al la donita apriora elemento.
     * la HTML-enhavo de klavaro povas esti plej simple io kiel 'ĉ ĝ ĥ ĵ ŝ ŭ'...
     * @constructor
     * @param klavaro - la elemento enhavante la klavaron kiel HTML-elementoj
     * @param dialogo - la kadra dialogo (kadra HTML-elemento) en kiu efiku la klavaro, forlasebla se vi havas nur 'apriora_kampo'
     * @param apriora_kampo - la apriora teksto-elementon (input/textarea), al kiu efiku la klavoj
     * @param kiuradiko - revokfunkcio, vokata por eltrovi la radikon de la artikolo
     * @param reĝimpremo - revokfunkcio, vokata kiam reĝimklavo estas premata
     * @param postenmeto - revokfunkcio, vokata post kiam tekstenmeta klavo estis premita
     */    
    constructor(
        klavaro: Element|string, 
        dialogo: Element|string|null, 
        apriora_kampo: HTMLInputElement|string, 
        public kiuradiko?: Function, 
        public reĝimpremo?: Reghimpremo, 
        public postenmeto?: Function) 
    {
        this.klavaro = (typeof klavaro === "string")? document.querySelector(klavaro) : klavaro;
        this.dialogo = (typeof dialogo === "string")? document.querySelector(dialogo) : dialogo;
        if (apriora_kampo) this.apriora_kampo = (typeof apriora_kampo === "string")? 
            document.querySelector(apriora_kampo) : apriora_kampo;

        this.lasta_fokuso = this.apriora_kampo?.id;
        this.klavoj = this.klavaro?.textContent || '';
        const self = this;
        
        // kreu la klavojn
        //if (this.klavoj)
        //    this.elemento_klavoj(this.klavoj);

        // registru klak-reagon
        // vd. https://stackoverflow.com/questions/1338599/the-value-of-this-within-the-handler-using-addeventlistener
        this.klavaro?.addEventListener("click", (event) => this.premo(event));

        // certigu, ke fokus-ŝanĝoj en la posedanto (ekz. dialogo) memoriĝas
        if (this.dialogo) {
            this.dialogo.addEventListener("focusout",function(event) {
                const element = event.target;
                if (element instanceof HTMLElement && element.id 
                    && (element.tagName == "INPUT" || element.tagName == "TEXTAREA"))
                    self.lasta_fokuso = element.id;
            });            
            /*
            this.dialogo.querySelectorAll("textarea,input").forEach( (e) =>
                e.addEventListener("blur", function(event) {
                    self.lasta_fokuso = (event.target as Element).id;
                })
            );
            */
        }            
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
    elemento_klavoj(klvrElm: Element, klavstr?: string) {
        let html='';
        const klavoj = (klavstr?klavstr:this.klavoj)
            .trim().split(/[ \n\r\t\f\v]+/);

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
        klvrElm.innerHTML = html;
    }


    /**
     * Kreas butonojn por stiloj, fakoj, gramatikaj indikoj
     * @param klvrElm - elemento en kiun aranĝi la fakoklavojn
     * @param stlList - Xlist kun stiloj
     */
    indiko_klavoj(klvrElm: Element, stlList: Xlist) {
    
        this.elemento_klavoj(klvrElm,klvrElm.textContent||'');
        const pos = klvrElm.children.length; // tie ni poste enŝovos la stilbutonojn!

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
        
        klvrElm.innerHTML += indikoj;

        function stilKlavoHtml(kod: string, nom: string) {
            const btn = u.ht_elements([
                ['div',{
                    class: 'klv stl', 
                    'data-stl': kod,
                    title: 'stilo: ' + nom},
                    [ ['span',{},[nom,['br'],kod]] ]
                ]
            ]);
            klvrElm.children[pos-1]
                .insertAdjacentElement('afterend', btn[0] as Element);
        }
        
        stlList.load(null,stilKlavoHtml);
    };

    /**
     * Kreas butonojn por fakoj
     * @param klvrElm - elemento en kiun aranĝi la fakoklavojn
     * @param fakList - Xlist kun fakoj
     */
    fako_klavoj(klvrElm: Element, fakList: Xlist) {
    
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
                klvrElm.append(...btn);
        }            

        this.elemento_klavoj(klvrElm,klvrElm.textContent);
        fakList.load(null,fakoKlavoHtml);
    };

    /**
     * Redonas la HTML-kampon, al kiu ni tajpas
     * @returns la kampon, kiu laste havis la fokuson aŭ la aprioran kampon
     */
    celo(): HTMLInputElement {
        if (this.lasta_fokuso) {
            return document.getElementById(this.lasta_fokuso) as HTMLInputElement;
        } 
        return this.apriora_kampo as HTMLInputElement;
    };

    /**
     * Reago al premo de X-klavo
     * @param event 
     */
    premo(event: Event) {
        event.stopPropagation();
        const trg = event.target as Element;
        const btn = trg.closest(".klv");
        const text = btn.getAttribute("data-btn");
        const cmd = btn.getAttribute("data-cmd");
        const element = this.klavaro;

        // MANKAS ankoraŭ...
        const radiko =  this.kiuradiko? this.kiuradiko() : '';

        if (btn.classList.contains("reghim_btn")) {
            this.reĝimpremo(event,{cmd: cmd as Reghimo});

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

        } else if (btn.classList.contains("tab_btn")) {
            // butonoj por en-/elŝovo
            const val = btn.getAttribute("value");
            if (val) {
                let n = parseInt(val.substring(0,2),10);
                if (n) {
                    const ta = this.celo();
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
            const enm = this.post_elekto().indexOf("</trdgrp")>-1
                ? '<trd>' + sel + '</trd>' 
                : '<trd lng="">' + sel + '</trd>';
            this.enmeto(enm);
            if (this.postenmeto) this.postenmeto(event,{cmd: cmd});

        // majusklaj komencliteroj de vortoj
        } else if (cmd == "kamelo") {
            const sel = this.elekto();
            //var rad = sel.includes('<tld')? xmlGetRad($("#xml_text").val()) : '';
            const rad = sel.includes('<tld')? radiko : '';
            this.enmeto(kameligo(sel,rad));    
            if (this.postenmeto) this.postenmeto(event,{cmd: cmd});

        // minuskligo
        } else if (cmd == "minuskloj") {
            const sel = this.elekto();
            this.enmeto(minuskligo(sel,radiko));
            if (this.postenmeto) this.postenmeto(event,{cmd: cmd});

        // aliajn kazojn traktu per _ekran_klavo...
        } else {
            const sel = this.elekto();
            this.enmeto(this.ekran_klavo(text,cmd,sel));
            if (this.postenmeto) this.postenmeto(event,{cmd: cmd});
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
    ekran_klavo(text: string, cmd: string, sel: string) {
        let s_ = '';
        // simbol-klavo redonu la tekston
        if (text) {
            return text;
        // citiloj
        } else if (cmd == "\u201e\u201c" || cmd =="\u201a\u2018" || cmd == "\u29da\u29db") {
            s_ = sel || "\u2026";
            return (cmd[0] + s_ + cmd[1]);
        // klarigoj en krampoj
        } else if (cmd == "[]" || cmd == "()") {
            s_ = sel || "\u2026";
            return ('<klr>' + ( sel[0] != cmd[0]? cmd[0]:"" ) 
                            + s_ + ( sel[sel.length-1] != cmd[1]? cmd[1]:"" ) +  '</klr>');
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

    /**
     * Redonas la elektitan tekston de la lasta tekstelemento (input,textarea) kiu havis la fokuson
     * @returns la elektitan tekston
     */
    elekto(): string {
        const element = this.celo();
        /*
        if ('selection' in document) {
            // Internet Explorer
            element.focus();
            const sel = document.selection.createRange();
            return sel.text;
        }
        else if ('selectionStart' in el) { */
            // other, e.g. Webkit based
            return element.value.substring(element.selectionStart, element.selectionEnd);
            /*
        } else {
            console.error("selection (preni markitan tekston) ne subtenita por tiu krozilo");
        }*/
    };

    antau_elekto(): string {
        const element = this.celo();
        return element.value.substring(
            Math.max(0,element.selectionStart-20),
            element.selectionStart);
    }

    post_elekto(): string {
        const element = this.celo();
        return element.value.substring(
            element.selectionEnd,
            element.selectionEnd+20);
    }
        
    /**
     * Enmetas tekston ĉe la pozicio de kursoro, resp. anstataŭigas la nunan elekton per nova teksto.
     * @param val - teksto por enmeti
     */
    enmeto(val: string) {
        const element = this.celo();

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
            const endPos = element.selectionEnd;
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