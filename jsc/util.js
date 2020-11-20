// ajax http request
function HTTPRequest(method, url, params, onSuccess, 
    onStart = null, onFinish = null,
    onError = null) {

    var request = new XMLHttpRequest();
    var data = new FormData();

    // PLIBONIGU: momente tio funkcias nur por POST, 
    //sed ĉe GET ni devus alpendigi tion al la URL!
    for (let [key, value] of Object.entries(params)) {
        data.append(key,value);
    }

    if (method.toUpperCase() == "GET") {
      // alpendigu aktualigilon por eventuale certigi freŝajn paĝojn
      var akt = window.localStorage.getItem("aktualigilo");
      akt = (akt && parseInt(akt)) || 0;
      if (url.indexOf('?') > -1)
        url += "&v="+akt
      else
        url += "?v="+akt
    }

    if (onStart) onStart();
    request.open(method, url , true);
    
    request.onload = function() {
      if (this.status >= 200 && this.status < 400) {
          onSuccess.call(this,this.response);
      } else {
          // post konektiĝo okazis eraro
          console.error('Eraro dum ŝargo de ' + url);  
          if (onError) onError(request);
        };
      if (onFinish) onFinish();
    }
    
    request.onerror = function() {
      // konekteraro
      console.error('Eraro dum konektiĝo por ' + url);
      if (onError) onError(request);
      if (onFinish) onFinish();
    };
    
    //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(data);  
}

function show(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.remove(cls);
  else console.warn("show: elemento "+id+" ne troviĝis.")
}

function hide(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.add(cls);
  else console.warn("hide: elemento "+id+" ne troviĝis.")
}

function toggle(id,cls='kasxita') {
  const el = document.getElementById(id);
  if (el) el.classList.toggle(cls);
  else console.warn("toggle: elemento "+id+" ne troviĝis.")
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
      document.addEventListener('DOMContentLoaded',  onready_fn)
    }
}

function make_element(name,attributes,textcontent) {
    var element = document.createElement(name);
    for (var a in attributes) {
        element.setAttribute(a,attributes[a])
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
      dlist.push(element)
    } // for
    return dlist;
}

function make_button(label,handler,hint='') {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    //btn.classList.add("kashilo");
    if (hint) btn.setAttribute("title",hint)
    return btn;
}

function make_icon_button(iclass,handler,hint='') {
    var btn = document.createElement("BUTTON");
    //btn.appendChild(document.createTextNode(label)); 
    if (handler) btn.addEventListener("click",handler);
    btn.classList.add(iclass,"icon_btn");
    if (hint) btn.setAttribute("title",hint)
    return btn;
}

function isIE() {
  ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  
  return is_ie; 
}

function isKHTMLEdge() {
  ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  var is_ek = ua.indexOf("KHTML ") > -1 && ua.indexOf("Edge/") > -1;
  
  return is_ek; 
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
    var h = (location.hash[0] == '#'
        ? location.hash.substr(1) 
        : location.hash);
    var r = {};
    for (p of h.split('&')) {
        if (p.indexOf('=') < 0) {
            r.mrk = p
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

function Textarea(ta_id) {
    this.txtarea = document.getElementById(ta_id);
}

    Textarea.prototype.scrollPos =  function(pos) {
        var txtarea = this.txtarea;
        if (typeof pos == "number") {
          // set scroll pos
          if (typeof txtarea.scrollTop == "number")  // Mozilla & Co
            txtarea.scrollTop = pos;
          else if (document.documentElement && document.documentElement.scrollTop)
            document.documentElement.scrollTop = pos
          else if (document.body)
            document.body.scrollTop = pos;
        } else {
          // get scroll pos
          if (txtarea.scrollTop)  // Mozilla
            return txtarea.scrollTop;
          else if (document.documentElement && document.documentElement.scrollTop)
            return document.documentElement.scrollTop
          else /*if (document.body)*/
            return document.body.scrollTop;
        }
    },


    Textarea.prototype.position = function() {
      // kalkulu el la signoindekso la linion kaj la pozicion ene de la linio
      function get_line_pos(inx,text) {
        var lines = 0;
        var last_pos = 0;
        for (i=0; i<inx; i++) { 
            if (text[i] == '\n') {
                lines++;
                last_pos = i;
            }
        }
        pos = (lines == 0)? inx : (inx-last_pos-1);
        return({line: lines, pos: pos})
      }

      //...
      var pos;
      var txtarea = this.txtarea;
      if('selectionStart' in txtarea) {
        pos = txtarea.selectionStart;
      } else if('selection' in document) {
        txtarea.focus();
        var sel = document.selection.createRange();
        var selLength = document.selection.createRange().text.length;
        sel.moveStart('character', -txtarea.value.length);
        pos = sel.text.length - selLength;
      }
      return get_line_pos(pos,txtarea.value);
    }

    
    Textarea.prototype.selection = function(insertion,p_kursoro=0) {
        //var txtarea = document.getElementById('r:xmltxt');
        var txtarea = this.txtarea;
        txtarea.focus();
    
        if (typeof insertion == "string") { // enmetu tekston ĉe la markita loko
          if (document.selection && document.selection.createRange) { // IE/Opera
            var range = document.selection.createRange();
            range.text = insertion;  
            range.select();   
          } else {
            var startPos = txtarea.selectionStart
            txtarea.value = 
              txtarea.value.substring(0, startPos)
              + insertion
              + txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
            if (p_kursoro>-1) {
              // movu la kursoron al startPost+p_kursoro
              txtarea.selectionStart = startPos + p_kursoro;
              txtarea.selectionEnd = txtarea.selectionStart;
            } else {
              // movu la kursoron post la aldonita teksto
              txtarea.selectionStart = startPos + insertion.length;
              txtarea.selectionEnd = txtarea.selectionStart;
            }
          }
        } else { // redonu la markitan tekston
          if (document.selection && document.selection.createRange) { // IE/Opera
            var range = document.selection.createRange();
            return range.text;  
          } else { // Mozilla
            var startPos = txtarea.selectionStart;
            var endPos = txtarea.selectionEnd;
            return txtarea.value.substring(startPos, endPos); 
          }
        }
    },
    
    Textarea.prototype.indent = function(indent) {
        //var txtarea = document.getElementById('r:xmltxt');
        var txtarea = this.txtarea;
        if (typeof indent == "number") { // enŝovu
          var selText;
      
          if (document.selection  && document.selection.createRange) { // IE/Opera
            alert("enŝovado por malnova retumilo IE aŭ Opera ne funkcias.");
          } else if (txtarea.selectionStart || txtarea.selectionStart==0) { // Mozilla
      
            //save textarea scroll position
            var scrollPos = this.scrollPos();
      
            //get current selection
            txtarea.focus();
            var startPos = txtarea.selectionStart;
            //if (startPos > 0) {
            //  startPos--;
            //}
            var endPos = txtarea.selectionEnd;
            //if (endPos > 0) {
            //  endPos--;
            //}
            selText = txtarea.value.substring(startPos, endPos);
            if (selText=="") {
              alert("Marku kion vi volas en-/elŝovi.");
            } else {
              var nt;
              if (indent == 2)
                nt = selText.replace(/\n/g, "\n  ");
              else 
                nt = selText.replace(/\n  /g, "\n");
      
              this.selection(nt);
              // txtarea.value = txtarea.value.substring(0, startPos)
              //       + nt
              //       + txtarea.value.substring(endPos, txtarea.value.length);
              // txtarea.selectionStart = startPos+1;
              // txtarea.selectionEnd = startPos + nt.length+1;
      
              //restore textarea scroll position
              this.scrollPos(scrollPos);
            }
          } 
        } else { // eltrovu la nunan enŝovon
          indent = 0;
          if (document.selection  && document.selection.createRange) { // IE/Opera
            var range = document.selection.createRange();
            range.moveStart('character', - 200); 
            var selText = range.text;
            var linestart = selText.lastIndexOf("\n");
            while (selText.charCodeAt(linestart+1+indent) == 32) {indent++;}
          } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
            var startPos = txtarea.selectionStart;
            var linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
            while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+indent) == 32) {indent++;}
          }
          return (str_repeat(" ", indent));  
        }
    },
    
    Textarea.prototype.charBefore = function() {
        //var txtarea = document.getElementById('r:xmltxt');
        var txtarea = this.txtarea;
        if (document.selection  && document.selection.createRange) { // IE/Opera  
          txtarea.focus();
          var range = document.selection.createRange();
          range.moveStart('character', - 1); 
          return range.text;
        } else {
          var startPos = txtarea.selectionStart;
          txtarea.setSelectionRange(startPos-1,startPos);
          return txtarea.value.substring(startPos - 1, startPos)
        }
    },

    Textarea.prototype.resetCursor = function() { 
        var txtarea = this.txtarea;
        if (txtarea.setSelectionRange) { 
            txtarea.focus(); 
            //txtarea.setSelectionRange(0, 0); // problemo en Chrome?
            txtarea.selectionStart = 0;
            txtarea.selectionEnd = 0;
        } else if (txtarea.createTextRange) { 
            var range = txtarea.createTextRange();  
            range.moveStart('character', 0); 
            range.select(); 
        } 
        txtarea.focus();
      }


   