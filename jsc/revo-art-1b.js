var js_sojlo = 3; //30+3;
var sec_art = "s_artikolo";

/*
window.onload = function() {
    preparu_art()
}
*/

function preparu_art() {
    top.document.title='Reta Vortaro ['
        + document.getElementById(sec_art).getElementsByTagName("H1")[0].textContent.trim()
        + ']';
    /* aktivigu nur por longaj artikoloj... */
    var d = document.getElementsByClassName("kasxebla");
    if (d.length > js_sojlo) {
        preparu_kashu_sekciojn();
        preparu_maletendu_sekciojn();
        h1_kashu_malkashu_butonoj();
        interna_navigado();
        //etendu_ekzemplojn();   
    }
}

/* kaŝu sekciojn de derivaĵoj, se la artikolo estas tro longa
   kaj provizu per ebleco remalkaŝi */
function preparu_kashu_sekciojn() {
    var d = document.getElementsByClassName("kasxebla");
    var h = document.location.hash.substr(1);
    var sojlo = 3+2; // ekde tri drv + trd + fnt, au du drv kaj adm
    if (d.length > sojlo) { // ĝis tri derivaĵoj (+tradukoj, fontoj), ne kaŝu la alineojn
        var first = true;
        for (var el of d) {
            el.parentElement.insertBefore(
                make_flat_button("\u22ee",etendu_trd,"montru ĉion"),
                el);

            var h2 = getPrevH2(el);
            if (h2) {
                h2.classList.add("kashilo");
                if ((h && h2.id != h) || (!h && first)) { 
                    // \u25be
                    h2.appendChild(make_flat_button("\u23f7",malkashu,"malkaŝu derivaĵon"));
                    el.classList.add("kasxita") 
                } else {
                    // "\u25b2"
                    h2.appendChild(make_flat_button("\u23f6",kashu,"kaŝu derivaĵon"));
                }                    
                first = false;
                h2.addEventListener("click", function(event) { 
                    kashu_malkashu_drv(event);
                });    
            }
        }    
    }
}

/* kelkajn sekciojn kiel ekzemploj, tradukoj, rimarkoj ni maletendas, pro eviti troan amplekson,
  ili ricevas eblecon por reetendi ilin per "pli..." */
function preparu_maletendu_sekciojn() {
    var d = document.getElementsByClassName("etendebla");
//    var sojlo = 3+2; // ekde tri drv + trd + fnt, au du drv kaj adm
// if (d.length > sojlo) { // ĝis tri derivaĵoj (+tradukoj, fontoj), ne kaŝu la alineojn
    for (var el of d) {
            if (el.classList.contains("tradukoj")) {
                maletendu_trd(el);
            }
    }
}

/** kaŝu ĉiujn derivaĵojn **/
function kashu_chiujn_drv() {
    for (var el of document.getElementsByClassName("kasxebla")) {
        var h2 = getPrevH2(el);
        if (h2) {
            el.classList.add("kasxita");
            h2.querySelector(".kashilo").textContent = "\u23f6";
        }
    }    
}

/** malfkaŝu ĉiujn derivaĵojn **/
function malkashu_chiujn_drv() {
    for (var el of document.getElementsByClassName("kasxebla")) {
        var h2 = getPrevH2(el);
        if (h2) {
            el.classList.remove("kasxita") 
            h2.querySelector(".kashilo").textContent = "\u23f7";
        }
    }    
}

function kashu_malkashu_drv(event) {
    var section = event.target.parentElement;    
    //getNextDiv(this).classList.toggle("kasxita");
    if (section.getElementsByClassName("kasxebla")[0].classList.contains("kasxita")) {
        for (var el of section.getElementsByClassName("kasxebla")) {
            el.classList.remove("kasxita");
        }
        section.querySelector("h2 .kashilo").textContent = "\u23f7";
    } else {
        for (var el of section.getElementsByClassName("kasxebla")) {
            el.classList.add("kasxita");
        }
        section.querySelector("h2 .kashilo").textContent = "\u23f6";
    }
}

function maletendu_trd(element) {
    var nav_lng = navigator.languages || [navigator.language];
    var eo;
    for (var id of element.children) {
        var id_lng = id.getAttribute("lang");
        // la tradukoj estas paroj de ea lingvo-nomo kaj nacilingvaj tradukoj
        if ( id_lng == "eo") {
            eo = id;
        } else if ( nav_lng.indexOf(id_lng) < 0 ) {
            eo.classList.add("kasxita");
            id.classList.add("kasxita");
        }
    }
    // aldonu pli...
    var pli = document.createElement("A");
    pli.addEventListener("click",etendu_trd);
    pli.setAttribute("lang","eo");    
    pli.classList.add("pli");
    pli.appendChild(document.createTextNode('pli...')); 
    element.appendChild(pli);
}


function etendu_trd(event) {
    var div_trd = event.target.parentElement;
    for (var id of div_trd.children) {
        id.classList.remove("kasxita");
    };
    // kaŝu pli...
    div_trd.querySelector(".pli").classList.add("kasxita");
}



function make_flat_button(label,handler,hint='') {
    var span = document.createElement("SPAN");
    span.classList.add("kashilo");
    span.appendChild(document.createTextNode(label)); 
    span.addEventListener("click",handler);
    if (hint) span.setAttribute("title",hint)
    return span;
}

function h1_kashu_malkashu_butonoj() {
    // aldonu kasho/malkasho-butonojn  
    var art = document.getElementById(sec_art);
    var h1 = art.getElementsByTagName("H1")[0];   
    h1.appendChild(make_button("\u23eb\uFE0E",kashu_chiujn_drv,"kaŝu ĉiujn derivaĵojn"));
    h1.appendChild(make_button("\u23ec\uFE0E",malkashu_chiujn_drv,"malkaŝu ĉiujn derivaĵojn"));
}

function make_button(label,handler,hint='') {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    btn.classList.add("kashilo");
    if (hint) btn.setAttribute("title",hint)
    return btn;
}

function interna_navigado() {
    // certigu, ke sekcioj malfermiĝu, kiam ili entenas navig-celon
    var a = document.getElementsByTagName("A");
    for (var k=0; k<a.length; k++) {
        var href = a[k].getAttribute("href");
        if (href && isLocalLink(href)) {
            a[k].addEventListener("click", function() {
                var id = this.getAttribute("href").split('#')[1];
                var trg = document.getElementById(id);
                showContainingDiv(trg);
            });
        }
    }
}

function getPrevH2(element) {
    var prv = element.previousSibling;
    while ( prv && prv.nodeName != "H2") { prv = prv.previousSibling }
    return prv;
}

function getNextDiv(element) {
    var nxt = element.nextSibling;
    while ( nxt && nxt.nodeName != "DIV") { nxt = nxt.nextSibling }
    return nxt;
}

function showContainingDiv(element) {
    if (element.nodeName == "H2") {
        var div = getNextDiv(element);
        div.classList.remove("kasxita")
    } else {
        var par = element.parentElement;
        while (par) {
            if (par.classList.contains("kasxita")) {
                par.classList.remove("kasxita")
            } else {
                par = par.parentElement;
            }
        }
    }
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