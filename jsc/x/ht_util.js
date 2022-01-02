
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

