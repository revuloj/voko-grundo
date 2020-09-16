
function HTTPRequest(method, url, params, onSuccess) {
    var request = new XMLHttpRequest();
    var data = new FormData();

    // PLIBONIGU: momente tio funkcias nur por POST, 
    //sed ĉe GET ni devus alpendigi tion al la URL!
    for (let [key, value] of Object.entries(params)) {
        data.append(key,value);
    }

    request.open(method, url , true);
    
    request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
        onSuccess.call(this,this.response);
    } else {
        // post konektiĝo okazis eraro
        console.error('Eraro dum ŝargo de ' + url);       
    }
    };
    
    request.onerror = function() {
    // konekteraro
    console.error('Eraro dum konektiĝo por ' + url);
    };
    
    //request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(data);  
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
      document.addEventListener('DOMContentLoaded', onready_fn);
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
        if (el[2] && el[2] instanceof Array) {
            var content = make_elements(el[2]);
            element = make_element(el[0],el[1]);
            element.append(...content);
        } else {
            element=make_element(el[0],el[1],el[2]);
        }
        dlist.push(element)
    }
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
  
function cxigi(b, key) {
    var n="";
    var k=String.fromCharCode(key);
  
          if (b=='s'     ) n='\u015D';
    else if (b=='\u015D') n='s'+k;
    else if (b=='S'     ) n='\u015C';
    else if (b=='\u015C') n='S'+k;
  
    else if (b=='c'     ) n='\u0109';
    else if (b=='\u0109') n='c'+k;
    else if (b=='C'     ) n='\u0108';
    else if (b=='\u0108') n='C'+k;
  
    else if (b=='h'     ) n='\u0125';
    else if (b=='\u0125') n='h'+k;
    else if (b=='H'     ) n='\u0124';
    else if (b=='\u0124') n='H'+k;
  
    else if (b=='g'     ) n='\u011D';
    else if (b=='\u011D') n='g'+k;
    else if (b=='G'     ) n='\u011C';
    else if (b=='\u011C') n='G'+k;
  
    else if (b=='u'     ) n='\u016D';
    else if (b=='\u016D') n='u'+k;
    else if (b=='U'     ) n='\u016C';
    else if (b=='\u016C') n='U'+k;
  
    else if (b=='j'     ) n='\u0135';
    else if (b=='\u0135') n='j'+k;
    else if (b=='J'     ) n='\u0134';
    else if (b=='\u0134') n='J'+k;
  
    return n;
}

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
    
    Textarea.prototype.selection = function(insertion) {
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
            // movu la kursoron post la aldonita teksto
            txtarea.selectionStart = startPos + insertion.length;
            txtarea.selectionEnd = txtarea.selectionStart;
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
            var scrollPos = scrollPos();
      
            //get current selection
            txtarea.focus();
            var startPos = txtarea.selectionStart;
            if (startPos > 0) {
              startPos--;
            }
            var endPos = txtarea.selectionEnd;
            if (endPos > 0) {
              endPos--;
            }
            selText = txtarea.value.substring(startPos, endPos);
            if (selText=="") {
              alert("Marku kion vi volas en-/elŝovi.");
            } else {
              var nt;
              if (indent == 2)
                nt = selText.replace(/\n/g, "\n  ");
              else 
                nt = selText.replace(/\n  /g, "\n");
      
              selection(nt);
              // txtarea.value = txtarea.value.substring(0, startPos)
              //       + nt
              //       + txtarea.value.substring(endPos, txtarea.value.length);
              // txtarea.selectionStart = startPos+1;
              // txtarea.selectionEnd = startPos + nt.length+1;
      
              //restore textarea scroll position
              scrollPos(scrollPos);
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
          txtarea.value.substring(startPos - 1, startPos)
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


   