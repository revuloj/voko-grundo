/* 
  (c) 2021-2023 ĉe Wolfram Diestel
*/

import {StrObj} from './global';
/**
 * HTML-elemento-specifo, konsistanta el nomo:string, atributoj:Object kaj enhavo.
 * Enhavo povas esti malplena, teksto aŭ listo de enhavataj HTML-elemento-specifoj.
 * La tipkontrolo de closure-compiler ne povas kontroli tro kompleksajn kaj refleksivajn
 * tipdifinojn kiel:
 */
 
export type AtributSpec = StrObj;
// Plibonigu, por permesi miksitan enhavon ni devus ŝanĝi la lastan
// al Array<string|ElementSpec>, sed ni implemento tion ne jam subtenas
export type ElementSpec = [string, AtributSpec?, (string|Array<ContentSpec>)?];
export type ContentSpec = string|ElementSpec

type Kapoj = StrObj;
type Parametroj = StrObj;

/**
 * Ŝargas fonan dokumenton de la servilo per XMLHttpRequest
 * @param method - la HTTP-metodo
 * @param url - la URL
 * @param headers - la HTTP-kapoj
 * @param params - la HTTP-parametroj
 * @param onSuccess - vokata post sukceso
 * @param onStart - vokata antaŭ la ŝargo
 * @param onFinish - vokata fine
 * @param onError - vokata kiam okazas eraro
 */
export function HTTPRequestFull(method: string, url: string, headers: Kapoj, params: Parametroj, 
    onSuccess: Function, onStart?: Function, onFinish?: Function, onError?: Function) {        

    var request = new XMLHttpRequest();
    var data = new FormData();

      // alpendigu aktualigilon por eventuale certigi freŝajn paĝojn
    function url_v() {
      const akt = window.localStorage.getItem("aktualigilo");
      const ver = (akt && parseInt(akt,10)) || 0;

      if (ver > 0) {
        const _url = url.split("#");

        if (_url[0].indexOf('?')>-1) {
          _url[0] += "&v="+ver;
        } else {
          _url[0] += "?v="+ver;
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
          onSuccess.call(request,request.response);
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
 * Sendas JSON-dokumenton al la servilo kaj Ŝargas la rezulton atendante ankaŭ JSON per XMLHttpRequest
 * @param method - la HTTP-metodo
 * @param url - la URL
 * @param headers - la HTTP-kapoj
 * @param json - la JSON-dokumento por sendi
 * @param onSuccess - vokata post sukceso
 * @param onStart - vokata antaŭ la ŝargo
 * @param onFinish - vokata fine
 * @param onError - vokata kiam okazas eraro
 */
export function HTTPRequestJSON(method: string, url: string, headers: Kapoj, json: any, 
    onSuccess: Function, onStart?: Function, onFinish?: Function, onError?: Function) {        

    const request = new XMLHttpRequest();
    const data = JSON.stringify(json);
    const _headers = Object.assign(headers||{},{ "Content-Type": "application/json" })

    if (onStart) onStart();
    request.open(method, url , true);

  // kapo-linioj
    for (let [key,value] of Object.entries(_headers)) {
      request.setRequestHeader(key,value);
    }      
    
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
          if (!request.response) {
            console.error('Ni atendis JSON kiel rezulto de '+url);  
          } else {
            onSuccess.call(request,JSON.parse(request.response));
          }
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
    
    request.send(data);  
}


/**
 * Ŝargas fonan dokumenton de la servilo per XMLHttpRequest
 * @param method - la HTTP-metodo
 * @param url - la URL
 * @param params - la HTTP-parametroj
 * @param onSuccess - vokata post sukceso
 * @param onStart - vokata antaŭ la ŝargo
 * @param onFinish - vokata fine
 * @param onError - vokata kiam okazas eraro
 */
export function HTTPRequest(method: string, url: string, params: Parametroj, 
  onSuccess: Function, onStart?: Function, onFinish?: Function, onError?: Function) {  
    
    HTTPRequestFull(method, url, null, params, onSuccess, 
    onStart, onFinish, onError);
}

/**
 * Metas plurajn HTML-atributojn samtempe
 * @param el - la HTML-elemento
 * @param attrs - Objekto, kies ŝlosiloj estas la atributnomoj, donantaj ties valorojn
 */
export function ht_attributes(el: Element, attrs: AtributSpec) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

/**
 * Kreas HTML-elementon kun atributoj kaj eventuala tekstenhavo. 
 * @param name - elemento-nomo, ekz-e 'div'
 * @param attributes 
 * @param textcontent 
 * @returns {!Element}
 */
export function ht_element(name: string, attributes: AtributSpec = null, 
  textcontent?: string): Element 
{
    var element = document.createElement(name);
    ht_attributes(element,attributes);
    if (textcontent) element.append(textcontent);
    return element;
}

/**
 * Kreas ingitan HTML-elementostrukturon. Vi transdonu liston de kreendaj elementoj.
 * Ĉiu elemento estas tri-elementa listo [elementnomo,atributoj,enhavo]. La enhavo 
 * povas esti malplena, teksto aŭ samstruktura elementolisto.
 * Ni momente ne subtenas miksitan enhavon en la enhavoparto (tria listero)
 * Se vi volas krei tion, unue kreu la ĉirkaŭan elementon per ht_elemento
 * kaj poste uzu JS HTMLElement.append por aldoni la enhavon kiel miksaĵon de
 * tekstoj kaj elementoj kreitaj unuope per ht_element (aŭ ht_elements, se pluraj aŭ ingigitaj)
 * @param jlist 
 * @returns listo de kreitaj elementoj, eventuale ingitaj
 */
export function ht_elements(jlist: Array<ContentSpec>): Array<Node> {
    var dlist = [];
    for (var el of jlist) {

      // unuopa teksta enhavo
      if (typeof el == "string") { 
        dlist.push(document.createTextNode(el));

      // elemento kun malsimpla enhavo: [nomo,attributoj,[...]]
      } else { 
        let element: Element;

        // ingigita enhavo de la elemento estas listo (array)
        if (el[2] && el[2] instanceof Array) {
            let content = ht_elements(el[2]); // ni vokas nin mem por la enhavo-kreado
            element = ht_element(el[0],el[1]);
            if (content) element.append(...content);

        } else { // elemento kun simpla tekstenhavo: [nomo,attributoj,enhavo]
            element = ht_element(el[0],el[1],el[2] as string);
        }
        dlist.push(element);
      } //else

    } // for
    return dlist;
}

/**
 * Kreas kaj redonas <br>-elementon
 */
export function ht_br() {
  return ht_element('br');
}

/**
 * Kreas HTML-butonon kun teksto
 * @param label - la surskribo
 * @param handler - la reagfunkcio al premoj
 * @param hint - la musnoto klariganta la butonfunkcion
 * @returns la HTML-butono
 */
export function ht_button(label: string, handler: EventListenerOrEventListenerObject, 
  hint: string=''): Node 
{
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    //btn.classList.add("kashilo");
    if (hint) btn.setAttribute("title",hint);
    return btn;
}

/**
 * Kreas HTML-butonon kun bildeto
 * @param iclass - CSS-klasoj, dividitaj per spaco
 * @param handler - la reagfunkcio al premoj
 * @param hint - la musnoto klariganta la butonfunkcion
 * @returns la HTML-butono
 */
export function ht_icon_button(iclass: string,handler: EventListenerOrEventListenerObject, 
  hint: string=''): Node 
{
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
 * @param list - la listo de enhavoj
 * @param listtype - la nomo de la ĉirkaŭa elemento
 * @param attrlist - atributlisto aldonante al la ĉirkaŭa elemento
 * @param listero_cb - revokfunkcioj por adaptita kreado de la listeroj
 * @returns la HTML-elemento kun la tuta listo
 */
export function ht_list(list: Array<any>, listtype: string='ul', attrlist?: AtributSpec, 
  listero_cb?: Function): Node 
{
  const elmtype = (listtype == 'ul' || listtype == 'ol')? 'li' : 'span';
  const container = ht_element(listtype,attrlist);
  for (let e of list) {    
    let li = (listero_cb? listero_cb(e) : ht_element(elmtype,{},e));
    container.append(li);
  }
  return container;
}

/**
 * Kreas difinliston (HTML-dl). La ŝlosiloj de la transdonita objekto donas la difin-termojn ('dt')
 * kaj la valoroj la difinojn ('dd'). Per la revokfunkcio item_cb vi povas strukturi ilin individue.
 * @param obj 
 * @param item_cb 
 * @param sorted - true: ordigu la ŝlosilojn
 * @returns
 */
export function ht_dl(obj: { [s: string]: any; }, item_cb: Function, 
  sorted: boolean): Node 
{
  const dl = ht_element("dl");
  // PLIBONIGU: se ni supozas ordigon laŭ esperanta aŭ alilingva
  // alfabeto ni devos uzi: .sort(new Intl.Collator(lng).compare)
  const keys = (sorted)? Object.keys(obj).sort() : Object.keys(obj);

  for (const key of keys) {
    const value = obj[key];
    let dt: Element, dd: Element;

    if (! item_cb) {
      dt = ht_element('dt',{}, key);
      dd = ht_element('dd',{}, value as string);

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
 * @param sum - la enhavo de 'summary'
 * @param det - la enhavo de 'details'
 * @param det_callback 
 * @param sum_callback 
 * @returns
 */
export function ht_details(sum: string, det: string, 
  det_callback?: Function, sum_callback?: Function): Node 
{
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
 * @param n_kasxitaj - la nombro de kasitaj elementoj
 * @returns la HTML-elemento
 */
export function ht_pli(n_kasxitaj: number): Array<Node> 
{
  const pli = ht_elements([
      ["dt",{},
          [["a",{href: "#"},"(+"+(n_kasxitaj)+")"]]
      ],
      ["dd"]
  ]);

  // funkcio por malkaŝi la reston...
  pli[0].addEventListener("click",function(event) {
      const trg = event.target as Element;
      const dl = trg.closest("dl");
      dl.childNodes.forEach((ch) => {
          if (ch instanceof Element)
            ch.classList.remove("kasxita");
      });

      trg.closest("dt").classList.add("kasxita");
      var p = dl.parentElement.querySelector("p");
      if (p) p.classList.remove("kasxita");
  });
  return pli;
}

/**
 * Transformas HTML-unuojn en la formoj &#9999; aŭ &#xFFFF; al la
 * reprezentitaj signoj
 * @param str - la traktenda teksto
 * @returns la teksto kun anstataŭigitaj HTML-unuoj
 */
export function parseHtmlEntities(str: string): string 
{
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
 * @param a - la unua teksto
 * @param b - la dua teksto
 * @returns -1, se a&lt;b; 1, se a&gt;b; 0 se a=b post la normigo de ambaŭ
 */
export function compareXMLStr(a?: string, b?: string) {  
  return (parseHtmlEntities(a||'').toLowerCase()
    === parseHtmlEntities(b||'').toLowerCase());
}

