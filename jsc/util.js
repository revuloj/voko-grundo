
/* jshint esversion: 6 */

// ajax http request
function HTTPRequestFull(method, url, headers, params, onSuccess, 
    onStart, onFinish, onError) {  // onStart, onFinish, onError vi povas ellasi!

    var request = new XMLHttpRequest();
    var data = new FormData();

      // alpendigu aktualigilon por eventuale certigi freŝajn paĝojn
    function url_v() {
      var akt = window.localStorage.getItem("aktualigilo");
      akt = (akt && parseInt(akt)) || 0;

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
    for (let [key, value] of Object.entries(params)) {
        data.append(key,value);
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
      if (this.status >= 200 && this.status < 400) {
          onSuccess.call(this,this.response);
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

function HTTPRequest(method, url, params, onSuccess, 
  onStart, onFinish, onError) {  // onStart, onFinish, onError vi povas ellasi!
    HTTPRequestFull(method, url, null, params, onSuccess, 
    onStart, onFinish, onError);
}

// Reordigas liston de objektoj havantaj komunan ŝlosilkampon
// al objekto de listoj de objektoj uzante la valorojn de la ŝlosilkampo
// kiel ŝlosilo (indekso) de tiu objekto.
// Se mankas la ŝlosilkampo tiu listero estas aldonata al "<_sen_>".
// Tio ankaŭ funkcia por listo de listoj, kiel ŝlosilo (key) tiam vi donu la
// numeron de la kolumno laŭ kiu ordigi: group_by(0,listo_de_listoj)
function group_by(key, array) {
  var grouped = {}
  for (var el of array) {
    const v = el[key] || '<_sen_>';
    //if (v) {
      if (! grouped[v] ) grouped[v] = [];
      grouped[v].push(el);      
    //}
  }
  return grouped;
}

// transformu markon al href por artikolo
function art_href(mrk) {
  return art_prefix + mrk.split('.')[0] + '.html#' + mrk;
}

// aldonu ../art en relativaj URL-oj
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

// ni ne havas por ĉiu referenctipo apartan vinjeton
// kaj ni nun uzas SVG-fonon per CSS anstataŭ GIF-bildeton
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
  }[tip]
}

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
  }[tip]
}

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
  }[tip]
}


// anstataŭigu GIF per SVG  
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


function show(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.remove(cls);
  else console.warn("show: elemento "+id+" ne troviĝis.");
}

function hide(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.add(cls);
  else console.warn("hide: elemento "+id+" ne troviĝis.");
}

function toggle(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.toggle(cls);
  else console.warn("toggle: elemento "+id+" ne troviĝis.");
}

function disable(id) {
  const el = document.getElementById(id);
  if (el) el.setAttribute("disabled","disabled");
  else console.warn("disable: elemento "+id+" ne troviĝis.");
}

function enable(id) {
  const el = document.getElementById(id);
  if (el) el.removeAttribute("disabled");
  else console.warn("disable: elemento "+id+" ne troviĝis.");
}

// aliras helpo-paĝon
function helpo_pagho(url) {
    window.open('https://revuloj.github.io/temoj/'+url);
}

// por prepari paĝon post kiam ĝi estas ŝargita
function when_doc_ready(onready_fn) {
    if (document.readyState != 'loading'){
      onready_fn();
    } else {
      document.addEventListener('DOMContentLoaded',  onready_fn);
    }
}

function make_element(name,attributes,textcontent) {
    var element = document.createElement(name);
    for (var a in attributes) {
        element.setAttribute(a,attributes[a]);
    }
    if (textcontent) element.appendChild(document.createTextNode(textcontent));
    return element;
}

function make_elements(jlist) {
    var dlist = [];
    for (var el of jlist) {
      var element;
      if (typeof el == "string") {
        element = document.createTextNode(el);
      } else {
        if (el[2] && el[2] instanceof Array) {
            var content = make_elements(el[2]);
            element = make_element(el[0],el[1]);
            element.append(...content);
        } else {
            element=make_element(el[0],el[1],el[2]);
        }
      } //else
      dlist.push(element);
    } // for
    return dlist;
}
/*
function createTElement(name,text) {
  var el = document.createElement(name);
  var tx= document.createTextNode(text);
  el.appendChild(tx); return el;
}

function addAttribute(node,name,value) {
  var att = document.createAttribute(name);
  att.value = value;
  node.setAttributeNode(att);    
}
*/

function make_button(label,handler,hint='') {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    //btn.classList.add("kashilo");
    if (hint) btn.setAttribute("title",hint);
    return btn;
}

function make_icon_button(iclass,handler,hint='') {
    var btn = document.createElement("BUTTON");
    //btn.appendChild(document.createTextNode(label)); 
    if (handler) btn.addEventListener("click",handler);
    btn.classList.add(...iclass.split(' '),"icon_btn");
    if (hint) btn.setAttribute("title",hint);
    return btn;
}

function make_list(list,listtype = 'ul',attrlist,listero_cb) {
  const elmtype = (listtype == 'ul' || listtype == 'ol')? 'li' : 'span';
  const container = make_element(listtype,attrlist);
  for (e of list) {    
    let li = (listero_cb? listero_cb(e) : make_element(elmtype,{},e));
    container.append(li);
  }
  return container;
}

function make_dl(obj,dt_callback,dd_callback) {
  const dl = make_element("dl");
  for (const [key, value] of Object.entries(obj)) {
    const dt = make_element('dt',{},dt_callback? dt_callback(key) : key);
    const dd = make_element('dd',{},dd_callback? dd_callback(value) : value);
    dl.append(dt,dd);
  }
  return dl;
}

function make_details(sum,det,det_callback,sum_callback) {
  const details = make_element("details");
  if (sum_callback) {
    const summary = make_element('summary'); 
    sum_callback(summary,sum);
    details.append(summary);
  } else {
    details.append(make_element('summary',{},sum));
  }
  det_callback? det_callback(details,det) : details.append(det);  
  return details;
}

function isLocalLink(url) {
    if (url[0] == '#') return true;
    // necesas kompari ankaŭ la dosiernomon      
    var doc = getUrlFileName(document.location.pathname);
    var trg = getUrlFileName(url);
    return doc==trg;
}

function getUrlFileName(url) {
    return url.substring(url.lastIndexOf('/')+1).split('#')[0];
}

function getHashParts() {
    var h = (location.hash[0] == '#' ?
        location.hash.substr(1) :
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


// ĉu ni vere bezonos tion? parametroj estas afero de la servilo,
// sed ni povas kaŝi ilin ankaŭ post #, vd. supre getHashParts
function getParamValue(param,params) {
    var result = null,
        tmp = [],
        parstr = params || location.search.substr(1);
        parstr.split("&").forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === param) result = decodeURIComponent(tmp[1]);
        });
    return result;
}


function str_repeat(rStr, rNum) {
    var nStr="";
    for (var x=1; x<=rNum; x++) {
        nStr+=rStr;
    }
    return nStr;
} 

function count_char(str,chr,from,to) {
  var nc = 0;
  const f = from||0;
  const t = to||str.length;
  for (var i = f; i<t; i++) {
    if (str[i] == chr) nc++
  }
  return nc;
}
  

function eo_ascii(str) {
    return str
        .replace(/ĉ/g,'cx')
        .replace(/ĝ/g,'gx')
        .replace(/ŝ/g,'sx')
        .replace(/ĵ/g,'jx')
        .replace(/ĥ/g,'hx')
        .replace(/ŭ/g,'ux');
}

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

  
// en textarea ni nur rigardas la antaŭan signon
// por anstataŭigi cx -> ĉ ktp.
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

// listoj lingvoj, fakoj, stiloj de Revo
// por montri elektilojn en la redaktilo kaj traduki lingvojn en la
// serĉilo
function Codelist(xmlTag,url) {
  this.url = url;
  this.xmlTag = xmlTag;
  this.codes = {};

  this.fill = function(selection) {
    var sel = document.getElementById(selection);
  
    for (var item in this.codes) {
      //var opt = createTElement("option",item + ' - ' + this.codes[item]);
      //addAttribute(opt,"value",item);
      const opt = make_element("option",{value: item},item + ' - ' + this.codes[item]);
      sel.appendChild(opt);
    }
  };

  this.load = function(selection) {
    var self = this;

    // unuafoje ŝargu la tutan liston el XML-dosiero
    if (! self.codes.keys) {
      var codes = {};

      HTTPRequest('GET', this.url, {},
        function() {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(this.response,"text/xml");
      
            for (var e of doc.getElementsByTagName(self.xmlTag)) {
                var c = e.attributes.kodo;
                //console.log(c);
                codes[c.value] = e.textContent;
            } 
            self.codes = codes;

            if (selection) {
              self.fill.call(self,selection);
            } 
        });

    // se ni jam ŝargis iam antaŭw, ni eble nur devas plenigi la videbalan elektilon
    } else {
      if (selection) {
        self.fill.call(self,selection);
      } 
    }
  };  
}

