
/* jshint esversion: 6 */

// (c) 2021 Wolfram Diestel

//const help_base_url = 'https://revuloj.github.io/temoj/';

/**
 * HTML-elemento-specifo, konsistanta el nomo:string, atributoj:Object kaj enhavo.
 * Enhavo povas esti malplena, teksto aŭ listo de enhavataj HTML-elemento-specifoj.
 * La tipkontrolo de closure-compiler ne povas kontroli tro kompleksajn kaj refleksivajn
 * tipdifinojn kiel:
 * [string,Object<string,string>,string|Array<string|ElementSpec>]
 * Ni povas pripensi uzi ion kiel {tag: string, atr: Object<string,string>, cnt: ...}
 * anstatataŭ sed tio plilongigus nebezone niajn struktur-specifojn.
 * /@/typedef { Array<*> } ElementSpec; var ElementSpec;
 * /
 


/**
 * Aldonas agon farendan ĉe forlaso de la paĝo (ekz-e pro reŝargo aŭ fermo).
 * Utila ekz-e por memori preferatajn valoroj k.s.
 * @param {Function} todo_cb - ago farenda
 */
function do_before_unload(todo_cb) {
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
 * @param {string|number} key 
 * @param { !Array<Object|Array> } array 
 * @returns { Object<string|Array<Object>> }
 */
function group_by(key, array) {
  var grouped = {};
  for (var el of array) {
    const v = el[key] || '<_sen_>';
    //if (v) {
      if (! grouped[v] ) grouped[v] = [];
      grouped[v].push(el);      
    //}
  }
  return grouped;
}


/**
 * Transformas markon al href por artikolo
 * @param {string} mrk 
 * @returns {string} URL-o por artikolo.
 */
function art_href(mrk) {
  return globalThis.art_prefix + mrk.split('.')[0] + '.html#' + mrk;
}


/**
 * Aldonas ../art en href-atributoj kun relativaj URL-oj
 * @param {Node} root_el 
 */
function fix_art_href(root_el) {
  for (var a of root_el.getElementsByTagName("a")) {
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
 * @param {string} tip - la referenctipo
 * @returns {string} - la CSS-klasnomo
 */
function ref_tip_class(tip) {
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
 * @param {string} tip - la referenctipo
 * @returns {string} - la HTML-ALT-atributo
 */
function ref_tip_alt(tip) {
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
 * @param {string} tip - la referenctipo
 * @returns {string} - la HTML-TITLE-atributo
 */
function ref_tip_title(tip) {
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
 * @param {Node} root_el 
 */
function fix_img_svg(root_el) {
  var src;

  for (var i of root_el.getElementsByTagName("img")) {
    src = i.getAttribute("src");
    //if (src.startsWith("..")) i.setAttribute("src",src.substring(1));

    // aldonu klason por rerencoj
    if ( src.endsWith('.gif') && !i.classList.length ) {
      // referencilo
      src = i.getAttribute("src");
      if (src) {
        const nom = src.split('/').pop().split('.')[0];
        if (nom) i.classList.add("ref",ref_tip_class(nom));
      }                    
    }                    
  }
}

/**
 * Videbligas HTML-elementon forigante CSS-klason 'kasxita'.
 * @param {string} id - la 'id'-atributo de la elemento
 * @param {string} cls - CSS-klaso, se alia ol 'kasxita'
 */
function show(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.remove(cls);
  else console.warn("show: elemento "+id+" ne troviĝis.");
}

/**
 * Kaŝas HTML-elementon aldonante CSS-klason 'kasxita'.
 * @param {string} id - la 'id'-atributo de la elemento
 * @param {string} cls - CSS-klaso, se alia ol 'kasxita'
 */
function hide(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.add(cls);
  else console.warn("hide: elemento "+id+" ne troviĝis.");
}

/**
 * Ŝanĝas videblecon de HTML-elemento aldonante aŭ forigante CSS-klason 'kasxita'.
 * @param {string} id - la 'id'-atributo de la elemento
 * @param {string} cls - CSS-klaso, se alia ol 'kasxita'
 */
function toggle(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.toggle(cls);
  else console.warn("toggle: elemento "+id+" ne troviĝis.");
}

/**
 * Malaktivigas HTML-elementon metante atributon 'disabled'.
 * @param {string} id - la 'id'-atributo de la elemento
 */
function disable(id) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("disabled","disabled");
  else console.warn("disable: elemento "+id+" ne troviĝis.");
}

/**
 * Aktivigas HTML-elementon forigante atributon 'disabled'.
 * @param {string} id - la 'id'-atributo de la elemento
 */
function enable(id) {
  const el = document.getElementById(id);
  if (el) el.removeAttribute("disabled");
  else console.warn("disable: elemento "+id+" ne troviĝis.");
}

/**
 * Navigas la retumilon al helpo-paĝo
 * @param {string} url - la pado de helpopaĝo, rilate al 'help_base_url'
 */
function helpo_pagho(url) {
    window.open(globalThis.help_base_url+url);
}

/**
 * Preparas paĝon post kiam ĝi estas ŝargita
 * @param {Function} onready_fn 
 */
function when_doc_ready(onready_fn) {
    if (document.readyState != 'loading'){
      onready_fn();
    } else {
      document.addEventListener('DOMContentLoaded',  onready_fn);
    }
}


/**
 * Kontrolas ĉu 'url' estas al la sama paĝo, kiel ĵus montrata. Se url komenciĝas
 * per '#' tio estas evidenta, alie ni komparas la URL-on de la aktuala paĝo kun 'url'.
 * @param {string} url 
 * @returns {boolean} true: se estas paĝo-loka referenco
 */
function isLocalLink(url) {
    if (url[0] == '#') return true;
    // necesas kompari ankaŭ la dosiernomon      
    var doc = getUrlFileName(document.location.pathname);
    var trg = getUrlFileName(url);
    return doc==trg;
}

/**
 * Ekstraktas la dosieronomon el URL, t.e. la parto inter la lasta '/' kaj eventuala '#'
 * @param {string} url 
 * @returns {string}
 */
function getUrlFileName(url) {
    return url.substring(url.lastIndexOf('/')+1).split('#')[0];
}


/**
 * Redonas la parton post '#' interpretante ĝin kiel parametroliston.
 * @returns {Object<string,string>} - la trovitaj parametroj kiel Objekto kies ŝlosiloj estas la parametronomoj
 */
function getHashParts() {
    var h = (location.hash[0] == '#' ?
        location.hash.slice(1) :
        location.hash);
    var r = {};
    for (var p of h.split('&')) {
        if (p.indexOf('=') < 0) {
            r.mrk = p;
        } else {
            var v = p.split('=');
            r[v[0]] = v[1];
        }
    }
    return r;
}

/**
 * Ekstraktas unuopan parametron el signoĉeno kun pluraj HTML-parametroj
 * @param {string} param - la nomo de la petata parametro
 * @param {string} params - la signoĉeno de parametroj, se manks location.search estas uzata
 * @returns {?string} la valoro de la petata parametro
 */
function getParamValue(param, params=undefined) {
  // ĉu ni vere bezonos tion? parametroj estas afero de la servilo,
  // sed ni povas kaŝi ilin ankaŭ post #, vd. supre getHashParts
    var result = null,
        tmp = [],
        parstr = params || location.search.slice(1);
        parstr.split("&").forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === param) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

/**
 * Kreas signoĉenon el samaj signoj
 * @param {string} rStr - la ripetenda signo
 * @param {number} rNum - la nombro de ripetoj
 * @returns {string}
 */
function str_repeat(rStr, rNum) {
    var nStr="";
    for (var x=1; x<=rNum; x++) {
        nStr+=rStr;
    }
    return nStr;
} 

/**
 * Nombras, kiom ofte certa signo aperas en teksto. Vi povas limigi la nombradon al parto de la teksto.
 * @param {string} str - la teksto
 * @param {string} chr - la nombrenda signo
 * @param {number} from - komenco de nombrado, se ne donita 0
 * @param {number} to - fino de nombrado, se ne donita fino de 'str'
 * @returns {number}
 */
function count_char(str,chr,from=undefined,to=undefined) {
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
 * @param {string} str - la konvertenda teksto
 * @returns {string} - la konvertita teksto
 */
function eo_ascii(str) {
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
 * @param {string} str - la konvertenda teksto
 * @returns {string} - la konvertita teksto
 */
function ascii_eo(str) {
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
 * @param {string} b - la antaŭa signo
 * @param {number} key - la tajpita klavkodo
 * @returns - la eventuale modifita signo
 */
function cxigi(b, key) {
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
