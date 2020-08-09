var js_sojlo = 3; //30+3;
var sec_art = "s_artikolo";

var icon_kashu = "\u2305"; //"\u2306";
var icon_malkashu = "\u2304"; // "\u23f7";
var icon_kashu_chiujn = "\u2796"; // "\u23eb\uFE0E";
var icon_malkashu_chiujn = "\u2795"; //"\u23ec\uFE0E";

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
    var h = document.location.hash.substr(1); // derivaĵo aŭ alia elemento celita kaj do montrenda
    var d_vid = h? document.getElementById(h).closest("section.drv, section.fontoj").firstChild.id : null;
    var first = true;

    for (var el of d) {
        var h2 = getPrevH2(el);
        if (h2) {
            h2.classList.add("kashilo");
            if ((h && h2.id != d_vid) || (!h && !first)) { 
                // \u25be
                h2.appendChild(make_flat_button(icon_malkashu,
                    kashu_malkashu_drv,"malkaŝu derivaĵon"));
                el.classList.add("kasxita") 
            } else {
                // "\u25b2"
                h2.appendChild(make_flat_button(icon_kashu,
                    kashu_malkashu_drv,"kaŝu derivaĵon"));
            }                    
            first = false;
            h2.addEventListener("click", function(event) { 
                kashu_malkashu_drv(event);
            });    
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
            h2.querySelector(".kashilo").textContent = icon_malkashu;
        }
    }    
}

/** malfkaŝu ĉiujn derivaĵojn **/
function malkashu_chiujn_drv() {
    for (var el of document.getElementsByClassName("kasxebla")) {
        var h2 = getPrevH2(el);
        if (h2) {
            el.classList.remove("kasxita") 
            h2.querySelector(".kashilo").textContent = icon_kashu;
        }
    }    
}

function kashu_malkashu_drv(event) {
    var section = event.target.closest("section"); //parentElement;    
    var div = section.getElementsByClassName("kasxebla")[0];
    //getNextDiv(this).classList.toggle("kasxita");
    if (div.classList.contains("kasxita")) {
        for (var el of section.getElementsByClassName("kasxebla")) {
            el.classList.remove("kasxita");
        }
        section.querySelector("h2 .kashilo").textContent = icon_kashu;
        // aktualigu la salto-markon per la "id" de section>h2
        // por teni ĝin malkaŝita ĉe reŝargo de la dokumento
        // aŭ ĉu ni lasu la originan???
        document.location.hash = "#"+section.firstChild.id;
    } else {
        for (var el of section.getElementsByClassName("kasxebla")) {
            el.classList.add("kasxita");
        }
        section.querySelector("h2 .kashilo").textContent = icon_malkashu;
    }
}

function maletendu_trd(element) {
    var nav_lng = navigator.languages || [navigator.language];
    var eo;
    var kashita = false;
    for (var id of element.children) {
        var id_lng = id.getAttribute("lang");
        // la tradukoj estas paroj de ea lingvo-nomo kaj nacilingvaj tradukoj
        if ( id_lng == "eo") {
            eo = id;
        } else if ( nav_lng.indexOf(id_lng) < 0 ) {
            eo.classList.add("kasxita");
            id.classList.add("kasxita");
            kashita = true;
        }
    }
    // aldonu pli...
    if (kashita) {
        var pli = document.createElement("A");
        pli.addEventListener("click",etendu_trd);
        pli.setAttribute("lang","eo");    
        pli.setAttribute("href","#"); // por ebligi fokusadon per TAB-klavo
        pli.classList.add("pli","etendilo");
        pli.appendChild(document.createTextNode('pli...')); 
        element.appendChild(pli);
    }
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
    //span.addEventListener("click",handler);
    if (hint) span.setAttribute("title",hint)
    return span;
}

function h1_kashu_malkashu_butonoj() {
    // aldonu kasho/malkasho-butonojn  
    var art = document.getElementById(sec_art);
    var h1 = art.getElementsByTagName("H1")[0];   
    h1.appendChild(make_button(icon_kashu_chiujn,kashu_chiujn_drv,"kaŝu ĉiujn derivaĵojn"));
    h1.appendChild(make_button(icon_malkashu_chiujn,malkashu_chiujn_drv,"malkaŝu ĉiujn derivaĵojn"));
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
        if (href && isLocalLink(href) && href != "#") {
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
        var par = element.closest(".kasxita");
        if (par) par.classList.remove("kasxita");
        /*
        var par = element.parentElement;
        while (par) {
            if (par.classList.contains("kasxita")) {
                par.classList.remove("kasxita")
            } else {
                par = par.parentElement;
            }
        }
        */
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