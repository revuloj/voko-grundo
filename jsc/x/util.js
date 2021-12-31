
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
 * pri elturnoj de specifo de revokfunkcioj por closure-compiler *kaj* JSDoc
 * vd. ekz-e https://stackoverflow.com/questions/49582691/how-do-i-document-complex-callback-requirement-in-jsdoc-while-keeping-jsdocs-ge
 * 
 * Respondo de XMLHttpRequest, ĉe malsukcesa 'response' estas nedeifinita
 * @typedef {function(string)} RequestResult
 */ var RequestResult;

/**
 * Evento okazanta antaŭ kaj post XMLHttpRequest, tio ebligas ekz-e ŝalti kaj malŝalti
 * atendovinjeton
 *  @typedef {function()} RequestStartStop
 */ var RequestStartStop;


/**
 * Ŝargas fonan dokumenton de la servilo per XMLHttpRequest
 * @param {string} method - la HTTP-metodo
 * @param {string} url - la URL
 * @param {Object<string,string>} headers - la HTTP-kapoj
 * @param {Object<string,string>} params - la HTTP-parametroj
 * @param {RequestResult} onSuccess - vokata post sukceso
 * @param {RequestStartStop} onStart - vokata antaŭ la ŝargo
 * @param {RequestStartStop} onFinish - vokata fine
 * @param {function(XMLHttpRequest)} onError - vokata kiam okazas eraro
 */
function HTTPRequestFull(method, url, headers, params, onSuccess, 
    onStart = undefined, onFinish = undefined, onError = undefined) {  // onStart, onFinish, onError vi povas ellasi!

    var request = new XMLHttpRequest();
    var data = new FormData();

      // alpendigu aktualigilon por eventuale certigi freŝajn paĝojn
    function url_v() {
      var akt = window.localStorage.getItem("aktualigilo");
      akt = (akt && parseInt(akt,10)) || 0;

      if (akt) {
        const _url = url.split("#");

        if (_url[0].indexOf('?')>-1) {
          _url[0] += "&v="+akt;
        } else {
          _url[0] += "?v="+akt;
        }

        url = _url.join('#');
      }
    }

    // parametroj
    // PLIBONIGU: momente tio funkcias nur por POST, 
    // sed ĉe GET ni devus alpendigi tion al la URL!
    if (params) {
      for (let [key, value] of Object.entries(params)) {
        data.append(key,value);
      }
    }

    // alpendigu version por certigi freŝan paĝon
    if (method.toUpperCase() == "GET") {
      url_v();
    }

    if (onStart) onStart();
    request.open(method, url , true);

    // kapo-linioj
    if (headers) {
      for (let [key,value] of Object.entries(headers)) {
        request.setRequestHeader(key,value);
      }      
    }
    
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
          onSuccess.call(request,/**@type{string}*/(request.response));
      } else {
          // post konektiĝo okazis eraro
          console.error('Eraro dum ŝargo de ' + url);  
          if (onError) onError(request);
      }
      if (onFinish) onFinish();
    };
    
    request.onerror = function() {
      // konekteraro
      console.error('Eraro dum konektiĝo por ' + url);
      if (onError) onError(request);
      if (onFinish) onFinish();
    };
    
    //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(data);  
}

/**
 * Ŝargas fonan dokumenton de la servilo per XMLHttpRequest
 * @param {string} method - la HTTP-metodo
 * @param {string} url - la URL
 * @param {Object<string,string>} params - la HTTP-parametroj
 * @param {RequestResult} onSuccess - vokata post sukceso
 * @param {RequestStartStop} onStart - vokata antaŭ la ŝargo
 * @param {RequestStartStop} onFinish - vokata fine
 * @param {function(XMLHttpRequest)} onError - vokata kiam okazas eraro
 */
function HTTPRequest(method, url, params, onSuccess, 
  onStart=undefined, onFinish=undefined, onError=undefined) {  // onStart, onFinish, onError vi povas ellasi!
    HTTPRequestFull(method, url, null, params, onSuccess, 
    onStart, onFinish, onError);
}

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
 * Metas plurajn HTML-atributojn samtempe
 * @param {Element} el - la HTML-elemento
 * @param {Object<string,string>} attrs - Objekto, kies ŝlosiloj estas la atributnomoj, donantaj ties valorojn
 */
function ht_attributes(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

/**
 * Kreas HTML-elementon kun atributoj kaj eventuala tekstenhavo. 
 * @param {!string} name - elemento-nomo, ekz-e 'div'
 * @param {Object<string,string>} attributes 
 * @param {string} textcontent 
 * @returns {!Element}
 */
function ht_element(name, attributes = null, textcontent = undefined) {
    var element = document.createElement(name);
    ht_attributes(element,attributes);
    if (textcontent) element.append(textcontent);
    return element;
}

/**
 * Kreas ingitan HTML-elementostrukturon. Vi transdonu liston de kreendaj elementoj.
 * Ĉiu elemento estas tri-elementa listo [elementnomo,atributoj,enhavo]. La enhavo 
 * povas esti malplena, teksto aŭ samstruktura elementolisto.
 * @param {!Array<*>} jlist 
 * @returns {Array<Node>} - listo de kreitaj elementoj, eventuale ingitaj
 * @suppress {checkTypes} - la tip-kontrolo de closure-compiler ne kapablas difini
 *                          specifajn diversajn tipojn por elementoj de areo (t.e. 
 *                          nia elemento-specifo, do ni devas subpremi tion tie ĉi!)
 */
function ht_elements(jlist) {
    var dlist = [];
    for (var el of jlist) {
      var element;
      if (typeof el == "string") { // teksta enhavo
        element = document.createTextNode(el);
      } else { // elemento kun malsimpla enhavo: [nomo,attributoj,[...]]
        if (el[2] && el[2] instanceof Array) {
            var content = ht_elements(el[2]); // ni vokas nin mem por la enhavo-kreado
            element = ht_element(el[0],el[1]);
            if (content) element.append(...content);
        } else { // elemento kun simpla tekstenhavo: [nomo,attributoj,enhavo]
            element=ht_element(el[0],el[1],el[2]);
        }
      } //else
      dlist.push(element);
    } // for
    return dlist;
}

/**
 * Kreas HTML-butonon kun teksto
 * @param {string} label - la surskribo
 * @param {Function} handler - la reagfunkcio al premoj
 * @param {string} hint - la musnoto klariganta la butonfunkcion
 * @returns {Node} - la HTML-butono
 */
function ht_button(label,handler,hint='') {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    //btn.classList.add("kashilo");
    if (hint) btn.setAttribute("title",hint);
    return btn;
}

/**
 * Kreas HTML-butonon kun bildeto
 * @param {string} iclass - CSS-klasoj, dividitaj per spaco
 * @param {Function} handler - la reagfunkcio al premoj
 * @param {string} hint - la musnoto klariganta la butonfunkcion
 * @returns {Node} - la HTML-butono
 */
function ht_icon_button(iclass,handler,hint='') {
    var btn = document.createElement("BUTTON");
    //btn.appendChild(document.createTextNode(label)); 
    if (handler) btn.addEventListener("click",handler);
    btn.classList.add(...iclass.split(' '),"icon_btn");
    if (hint) btn.setAttribute("title",hint);
    return btn;
}

/**
 * Kreas HTML-liston. Ĝi povas esti 'ul'- aŭ 'ol'-listo enhavanta 'li'-elementojn,
 * sed ankaŭ iu ajn alia HTML-elemento, tiam la listeroj estos 'span'-elementoj
 * @param {!Array} list - la listo de enhavoj
 * @param {string} listtype - la nomo de la ĉirkaŭa elemento
 * @param {Object<string,string>} attrlist - atributlisto aldonante al la ĉirkaŭa elemento
 * @param {Function} listero_cb - revokfunkcioj por adaptita kreado de la listeroj
 * @returns {Node} - la HTML-elemento kun la tuta listo
 */
function ht_list(list, listtype='ul', attrlist=undefined, listero_cb=undefined) {
  const elmtype = (listtype == 'ul' || listtype == 'ol')? 'li' : 'span';
  const container = ht_element(listtype,attrlist);
  for (let e of list) {    
    let li = (listero_cb? listero_cb(e) : ht_element(elmtype,{},e));
    container.append(li);
  }
  return container;
}

/**
 * Kreas difinliston (HTML-dl). La ŝlosiloj de la transdonita objekto donas la difintermojn ('dt')
 * kaj la valoroj la difinojn ('dd'). Per la revokfunkcio item_cb vi povas strukturi ilin individue.
 * @param {!Object<string,*>} obj 
 * @param {Function} item_cb 
 * @param {boolean} sorted - true: ordigu la ŝlosilojn
 * @returns {Node}
 */
function ht_dl(obj,item_cb,sorted) {
  const dl = ht_element("dl");
  var keys;
  if (sorted) keys = Object.keys(obj).sort(); else keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];
    var dt, dd;
    if (! item_cb) {
      dt = ht_element('dt',{},key);
      dd = ht_element('dd',{},/**@type{string}*/(value));
    } else {
      dt = document.createElement('dt');
      dd = document.createElement('dd');
      // permesu modifadon...
      item_cb(key,value,dt,dd);
    }
    if (dt.textContent || dd.textContent)
      dl.append(dt,dd);
  }
  return dl;
}

/**
 * Kreas HTML-details-summary-elementon. Per la revokfunkcioj vi povas
 * enmeti pli kompleksajn strukturojn ol simplajn tekstojn
 * @param {string} sum - la enhavo de 'summary'
 * @param {string} det - la enhavo de 'details'
 * @param {Function} det_callback 
 * @param {Function} sum_callback 
 * @returns {Node}
 */
function ht_details(sum, det, det_callback=undefined, sum_callback=undefined) {
  const details = ht_element("details");
  if (sum_callback) {
    const summary = ht_element('summary'); 
    sum_callback(summary,sum);
    details.append(summary);
  } else {
    details.append(ht_element('summary',{},sum));
  }
  if (det_callback) {
    det_callback(details,det);
  } else { 
    details.append(det);
  }
  return details;
}

/**
 * Kreas klakeblan tekston '(+nnn)' por malfaldi kaŝitan enhavon (pliaj tradukoj, pliaj trovoj k.c.)
 * Ni realigas ĝin kiel dt-dl-elemento ene de 'dl'-elemento, kiu enhavas la tutan liston 
 * - videblaj kaj kasitaj enhavoj.
 * @param {number} n_kasxitaj - la nombro de kasitaj elementoj
 * @returns {Array<Node>} - la HTML-elemento
 */
function ht_pli(n_kasxitaj) {
  var pli = ht_elements([
      ["dt",{},
          [["a",{href: "#"},"(+"+(n_kasxitaj)+")"]]
      ],
      ["dd"]
  ]);
  // funkcio por malkaŝi la reston...
  pli[0].addEventListener("click",function(event) {
      var dl = event.target.closest("dl");
      for (var ch of dl.childNodes) {
          ch.classList.remove("kasxita");
      }
      event.target.closest("dt").classList.add("kasxita");
      var p = dl.parentElement.querySelector("p");
      if (p) p.classList.remove("kasxita");
  });
  return pli;
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

/**
 * Transformas HTML-unuojn en la formoj &#9999; aŭ &#xFFFF; al la
 * reprezentitaj signoj
 * @param {string} str - la traktenda teksto
 * @returns - la teksto kun anstataŭigitaj HTML-unuoj
 */
function parseHtmlEntities(str) {
  return str
  .replace(/&#([0-9]{1,5});/gi, function(match, numStr) {
      var num = parseInt(numStr, 10); // read num as normal number
      return String.fromCharCode(num);
  })
  .replace(/&#x([0-9a-fA-F]{1,4});/gi, function(match, numStr) {
    var num = parseInt(numStr, 16); // read num as normal number
    return String.fromCharCode(num);
  });
}

/**
 * Komparas du HTML-tekstojn anstataŭigante la HTML-unuojn per la ĝustaj signoj
 * kaj minusklante
 * @param {string|undefined} a - la unua teksto
 * @param {string|undefined} b - la dua teksto
 * @returns -1, se a&lt;b; 1, se a&gt;b; 0 se a=b post la normigo de ambaŭ
 */
function compareXMLStr(a,b) {  
  return (parseHtmlEntities(a||'').toLowerCase()
    === parseHtmlEntities(b||'').toLowerCase());
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
