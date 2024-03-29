/*
 (c) 2021-2023 ĉe Wolfram Diestel
*/

import {type StrObj} from '../u';
import {agordo as g} from '../u/global';

//const help_base_url = 'https://revuloj.github.io/temoj/';

export type LinePos = {
  line: number,
  pos: number
}

/**
 * Aldonas agon farendan ĉe forlaso de la paĝo (ekz-e pro reŝargo aŭ fermo).
 * Utila ekz-e por memori preferatajn valoroj k.s.
 * @param todo_cb - ago farenda
 */
export function do_before_unload(todo_cb: EventListenerOrEventListenerObject) {
  // tio vokiĝas, i.a. kiam la uzanto reŝargas la paĝon aŭ fermas la redaktilon.
  window.addEventListener('beforeunload', todo_cb);
  // por iOS...:
  window.addEventListener('pagehide', todo_cb); 
}


/**
 * Reordigas liston de objektoj havantaj komunan ŝlosilkampon
 * al objekto de listoj de objektoj uzante la valorojn de la ŝlosilkampo
 * kiel ŝlosilo (indekso) de tiu objekto.
 * Se mankas la ŝlosilkampo tiu listero estas aldonata al "&lt;_sen_&gt;".
 * Tio ankaŭ funkcias por listo de listoj, kiel ŝlosilo (key) tiam vi donu la
 * numeron de la kolumno laŭ kiu ordigi: group_by(0,listo_de_listoj)
 * @param key 
 * @param array 
 * @returns grupigitajn listojn
 */
export function group_by(key: string|number, array: Array<any>): {[key: string]: Array<any>} {
  let grouped: {[key: string]: Array<any>} = {};

  for (var el of array) {
    const v = el[key] || '<_sen_>';
    if (! grouped[v] ) grouped[v] = [];
    grouped[v].push(el);      
  }
  return grouped;
}

/**
 * Testas, ĉu io estas nura objekto, sed ne de tipo Array
 * @param item 
 * @returns 
 */
export function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
};


/**
 * profunda detrua fando de objektoj
 * @param target
 * @param ...sources
 */
export function enfandu(target: any, ...sources: any) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
          if (isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            enfandu(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
      }
    }

    return enfandu(target, ...sources);
}    



/**
 * Transformas markon al href por artikolo
 * @param mrk 
 * @returns URL-o por artikolo.
 */
export function art_href(mrk: string): string {
  return g.art_prefix + mrk.split('.')[0] + '.html#' + mrk;
}


/**
 * Aldonas ../art en href-atributoj kun relativaj URL-oj
 * @param root_el 
 */
export function fix_art_href(root_el: Element) {
  for (var a of Array.from(root_el.getElementsByTagName("a"))) {
    var href = a.getAttribute("href");

    // aldonu ../art nur se ne estas absoluta URL
    // aŭ ĝi montras per ../ ali-loken aŭ estas ene, komencigante per #
    if ( href && href[0] != '#' && href.indexOf('/') < 0 ) {
      a.setAttribute("href","../art/"+href);
    }
  }
}


/**
 * Tradukas referenctipon al responda CSS-klasnomo.
 * (Ni ne havas por ĉiu referenctipo apartan vinjeton
 * kaj ni nun uzas SVG-fonon per CSS anstataŭ GIF-bildeton.)
 * @param tip - la referenctipo
 * @returns la CSS-klasnomo
 */
export function ref_tip_class(tip: string): string|undefined {
  return {
    dif: "r_dif", difino: "r_dif", 
    sin: "r_sin", ant: "r_ant",
    sub: "r_sub", prt: "r_prt", 
    super: "r_super", 
    malprt: "r_malprt", mal: "r_malprt",
    vid: "r_vid", vidu: "r_vid",
    hom: "r_hom",
    lst: "r_lst", listo: "r_lst",
    ekz: "r_ekz", url: "r_url"
  }[tip];
}

/**
 * Tradukas referenctipon al responda ALT-atributo.
 * @param tip - la referenctipo
 * @returns la HTML-ALT-atributo
 */
export function ref_tip_alt(tip: string): string|undefined {
  return {
    dif: "=", difino: "=", 
    sin: "SIN:", ant: "ANT:",
    sub: "SUB:", prt: "PRT:", 
    super: "SUP:", 
    malprt: "TUT:", mal: "TUT:",
    vid: "VD:", vidu: "VD:",
    hom: "HOM:",
    lst: "LST:", listo: "LST:",
    ekz: "EKZ:", url: "URL:"
  }[tip];
}

/**
 * Tradukas referenctipon al responda TITLE-atributo.
 * @param tip - la referenctipo
 * @returns la HTML-TITLE-atributo
 */
export function ref_tip_title(tip: string): string|undefined {
  return {
    dif: "difino ĉe", difino: "difino ĉe", 
    sin: "sinonimo", ant: "antonimo",
    sub: "subnocio", prt: "parto", 
    super: "supernocio", 
    malprt: "parto de", mal: "TUT:",
    vid: "vidu", vidu: "vidu",
    hom: "homonimo",
    lst: "listo", listo: "listo",
    ekz: "ekzemplo", url: "retpaĝo"
  }[tip];
}


/**
 * Anstataŭigas GIF per SVG en IMG-SRC-atributoj
 * @param root_el 
 */
export function fix_img_svg(root_el: Element) {

  for (var i of Array.from(root_el.getElementsByTagName("img"))) {
    const src = i.getAttribute("src");

    // aldonu klason por referencoj
    if ( src && src.endsWith('.gif') && !i.classList.length ) {
      // referencilo
      i.classList.add("ref");
      const nom = src.split('/').pop()?.split('.')[0];
      if (nom) {
        const ref_tip = ref_tip_class(nom);
        if (ref_tip) i.classList.add(ref_tip);
      }
    }                    
  }
}

/**
 * Videbligas HTML-elementon forigante CSS-klason 'kasxita'.
 * @deprecated uzu DOM.malkaŝu kun #id
 * @param id - la 'id'-atributo de la elemento
 * @param cls - CSS-klaso, se alia ol 'kasxita'
 */
export function show(id: string,cls: string='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.remove(cls);
  else console.warn("show: elemento "+id+" ne troviĝis.");
}

/**
 * Kaŝas HTML-elementon aldonante CSS-klason 'kasxita'.
 * @deprecated uzu DOM.kaŝu kun #id
 * @param id - la 'id'-atributo de la elemento
 * @param cls - CSS-klaso, se alia ol 'kasxita'
 */
export function hide(id: string,cls: string='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.add(cls);
  else console.warn("hide: elemento "+id+" ne troviĝis.");
}

/**
 * Ŝanĝas videblecon de HTML-elemento aldonante aŭ forigante CSS-klason 'kasxita'.
 * @deprecated uzu DOM.malkaŝu+DOM.kaŝita kun #id (?) 
 * @param id - la 'id'-atributo de la elemento
 * @param cls - CSS-klaso, se alia ol 'kasxita'
 */
export function toggle(id: string,cls: string='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.toggle(cls);
  else console.warn("toggle: elemento "+id+" ne troviĝis.");
}

/**
 * Malaktivigas HTML-elementon metante atributon 'disabled'.
 * @deprecated uzu DOM.malaktivigu kun #id
 * @param id - la 'id'-atributo de la elemento
 */
export function disable(id: string) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("disabled","disabled");
  else console.warn("disable: elemento "+id+" ne troviĝis.");
}

/**
 * Aktivigas HTML-elementon forigante atributon 'disabled'.
 * @deprecated uzu DOM.aktivigu kun #id
 * @param id - la 'id'-atributo de la elemento
 */
export function enable(id: string) {
  const el = document.getElementById(id);
  if (el) el.removeAttribute("disabled");
  else console.warn("enable: elemento "+id+" ne troviĝis.");
}

/**
 * Navigas la retumilon al helpo-paĝo
 * @param url - la pado de helpopaĝo, rilate al 'help_base_url'
 */
export function helpo_pagho(url: string) {
    window.open(g.help_base_url+url);
}


/**
 * Kontrolas ĉu 'url' estas al la sama paĝo, kiel ĵus montrata. Se url komenciĝas
 * per '#' tio estas evidenta, alie ni komparas la URL-on de la aktuala paĝo kun 'url'.
 * @param url 
 * @returns true: se estas paĝo-loka referenco
 */
export function isLocalLink(url: string): boolean {
    if (url[0] == '#') return true;
    // necesas kompari ankaŭ la dosiernomon      
    var doc = getUrlFileName(document.location.pathname);
    var trg = getUrlFileName(url);
    return doc==trg;
}

/**
 * Ekstraktas la dosieronomon el URL, t.e. la parto inter la lasta '/' kaj eventuala '#'
 * @param url 
 * @returns 
 */
export function getUrlFileName(url: string): string {
    return url.substring(url.lastIndexOf('/')+1).split('#')[0];
}


/**
 * Redonas la parton post '#' interpretante ĝin kiel parametroliston.
 * @returns la trovitaj parametroj kiel Objekto kies ŝlosiloj estas la parametronomoj
 */
export function getHashParts(): StrObj {
    const h = (location.hash[0] == '#' ?
        location.hash.slice(1) :
        location.hash);
    let r: StrObj = {};
    for (const p of h.split('&')) {
        if (p.indexOf('=') < 0) {
          // ne estas egalsigno, ni interpretas la parametron kiel marko
          r["mrk"] = p;
        } else {
          // ŝlosilo=valoro
          const v = p.split('=');
          r[v[0]] = v[1];
        }
    }
    return r;
}

/**
 * Ekstraktas unuopan parametron el signoĉeno kun pluraj HTML-parametroj
 * @param param - la nomo de la petata parametro
 * @param params - la signoĉeno de parametroj, se manks location.search estas uzata
 * @returns la valoro de la petata parametro
 */
export function getParamValue(param: string, params?: string): string|null {
  // ĉu ni vere bezonos tion? parametroj estas afero de la servilo,
  // sed ni povas kaŝi ilin ankaŭ post #, vd. supre getHashParts
    let result: string|null = null,
        tmp: string[] = [],
        parstr = params || location.search.slice(1);

    parstr.split("&").forEach(function (item) {
      tmp = item.split("=");
      if (tmp[0] === param) result = (tmp[1]? decodeURIComponent(tmp[1]) : '');
    });
    
    return result;
}

/**
 * Kreas signoĉenon el samaj signoj
 * @param {string} rStr - la ripetenda signo
 * @param {number} rNum - la nombro de ripetoj
 * @returns {string}
 */
export function str_repeat(rStr: string, rNum: number): string {
    var nStr="";
    for (var x=1; x<=rNum; x++) {
        nStr+=rStr;
    }
    return nStr;
} 

/**
 * Nombras, kiom ofte certa signo aperas en teksto. Vi povas limigi la nombradon al parto de la teksto.
 * @param str - la teksto
 * @param chr - la nombrenda signo
 * @param from - komenco de nombrado, se ne donita 0
 * @param to - fino de nombrado, se ne donita fino de 'str'
 * @returns
 */
export function count_char(str: string, chr: string, from?: number,to?: number): number 
{
  var nc = 0;
  const f = from||0;
  const t = to||str.length;
  for (var i = f; i<t; i++) {
    if (str[i] == chr) nc++;
  }
  return nc;
}
  

/**
 * Konvertas supersignajn literojn al askia x-konvencio, do ĉ al cx ... ŭ al ux
 * @param str - la konvertenda teksto
 * @returns la konvertita teksto
 */
export function eo_ascii(str: string): string {
    return str
        .replace(/ĉ/g,'cx')
        .replace(/ĝ/g,'gx')
        .replace(/ŝ/g,'sx')
        .replace(/ĵ/g,'jx')
        .replace(/ĥ/g,'hx')
        .replace(/ŭ/g,'ux');
}

/**
 * Konvertas de la x-konvencio al supersignaj literoj, do cx al ĉ ... ux al ŭ.
 * @param str - la konvertenda teksto
 * @returns la konvertita teksto
 */
export function ascii_eo(str: string): string {
  return str
    .replace(/c[xX]/g, "\u0109")
    .replace(/g[xX]/g, "\u011d")
    .replace(/h[xX]/g, "\u0125")
    .replace(/j[xX]/g, "\u0135")
    .replace(/s[xX]/g, "\u015d")
    .replace(/u[xX]/g, "\u016d")
    .replace(/C[xX]/g, "\u0108")
    .replace(/G[xX]/g, "\u011c")
    .replace(/H[xX]/g, "\u0124")
    .replace(/J[xX]/g, "\u0134")
    .replace(/S[xX]/g, "\u015c")
    .replace(/U[xX]/g, "\u016c");
}

  
/**
 * Anstataŭigas cx -> ĉ, gx -> ĝ, ..., ux -> ŭ, ĉx -> cx, ĝx -> gx,..., ŭx -> ux
 * @param b - la antaŭa signo
 * @param key - la tajpita klavkodo
 * @returns - la eventuale modifita signo
 */
export function cxigi(b: string, key: number) {
    var n="";
    var k=String.fromCharCode(key);

    return {
    s: '\u015D', '\u015D': 's'+k, 
    S: '\u015C', '\u015C': 'S'+k, 
    c: '\u0109', '\u0109': 'c'+k,
    C: '\u0108', '\u0108': 'C'+k,
    h: '\u0125', '\u0125': 'h'+k,
    H: '\u0124', '\u0124': 'H'+k,
    g: '\u011D', '\u011D': 'g'+k,
    G: '\u011C', '\u011C': 'G'+k,
    u: '\u016D', '\u016D': 'u'+k,
    U: '\u016C', '\u016C': 'U'+k,
    j: '\u0135', '\u0135': 'j'+k,
    J: '\u0134', '\u0134': 'J'+k,
    x: 'x'+k, X: 'X'+k
    }[b] || '';
}

/*
function dom_console() {
  if (navigator.userAgent.indexOf("AppleWebKit") > -1) {
    document.getElementById("console").classList.remove("kasxita");
    sys_console = console;
    console = new Object();
    console.log = function(str) {
      sys_console.log(str);
      const c = document.getElementById("console");
      if (c) {
        const tn = document.createTextNode(str);
        const br = document.createElement("br");
        c.append(tn,br);
      }
    }
    console.trace = console.log;
    console.debug = console.log;
    console.info = console.log;
    console.warn = console.log;
    console.error = console.log;
    console.log(navigator.userAgent);
    console.log(navigator.platform);
    console.log(navigator.vendor);
    window.onerror = function(message,source,line) {
      console.log("@"+source+"."+line);
      console.log(">> "+message);
    }
  }
}
*/
