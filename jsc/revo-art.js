var js_sojlo = 30+3;

window.onload = function() {
    top.document.title='Reta Vortaro ['
        + document.getElementsByTagName("H1")[0].textContent.trim()
        + ']';
    /* aktivigu nur por longaj artikoloj... */
    var d = document.getElementsByClassName("kasxebla");
    if (d.length > js_sojlo) {
        faldu_sekciojn();
        faldu_malfaldu_butonoj();
        interna_navigado();
        malfaldu_ekzemplojn();   
    }
}

function faldu_sekciojn() {
    // faldu sekciojn, se la artikolo estas tro longa
    var d = document.getElementsByClassName("kasxebla");
    var h = document.location.hash.substr(1);
    var sojlo = 3+2; // ekde tri drv + trd + fnt, au du drv kaj adm
    if (d.length > sojlo) { // ĝis tri derivaĵoj (+tradukoj, fontoj), ne kaŝu la alineojn
        for (var i=0; i<d.length; i++) {
            var h2 = getPrevH2(d[i]);            
            if ((h && h2.id != h) || (!h && i>0)) { 
                d[i].classList.add("kasxita") 
            }; 
            h2.classList.add("faldilo");
            h2.addEventListener("click", function(event) { 
                getNextDiv(this).classList.toggle("kasxita");
            });
        }    
    }
}

function faldu_chiujn() {
    var d = document.getElementsByClassName("kasxebla");
    for (var i=0; i<d.length; i++) {
        var h2 = getPrevH2(d[i]);
        d[i].classList.add("kasxita") 
    }    
}

function malfaldu_chiujn() {
    var d = document.getElementsByClassName("kasxebla");
    for (var i=0; i<d.length; i++) {
        var h2 = getPrevH2(d[i]);
        d[i].classList.remove("kasxita") 
    }    
}


function faldu_malfaldu_butonoj() {
    // aldonu faldo/malfaldo-butonojn  
    var h1 = document.getElementsByTagName("H1")[0];   
    h1.appendChild(make_button("\u23eb\uFE0E",faldu_chiujn,"faldu ĉiujn"));
    h1.appendChild(make_button("\u23ec\uFE0E",malfaldu_chiujn,"malfaldu ĉiujn"));
}

function make_button(label,handler,hint='') {
    var btn = document.createElement("BUTTON");
    btn.appendChild(document.createTextNode(label)); 
    btn.addEventListener("click",handler);
    btn.classList.add("faldilo");
    if (hint) btn.setAttribute("title",hint)
    return btn;
}

function malfaldu_ekzemplojn() {
    // malfaldu ekzemplojn
    var e = document.getElementsByClassName("ekz");
    for (var j=0; j<e.length; j++) {
        var ie = e[j];
        if (ie.nodeName == "I") ie.classList.add("ekz-propra-linio");
    }
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