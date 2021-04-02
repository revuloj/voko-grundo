
/* jshint esversion: 6 */

const js_sojlo = 3; //30+3;
const ekz_sojlo = 3;
const sec_art = "s_artikolo";
const vokoref_url = "/cgi-bin/vokoref-json.pl";
const vikipedio_url = "https://eo.wikipedia.org/wiki/";
const art_path = "../art/";

//const KashEvento = new Event("kashu", {bubbles: true});
const MalkashEvento = new Event("malkashu", {bubbles: true});
const KomutEvento = new Event("komutu", {bubbles: true});

window.addEventListener("hashchange", function() {
    //console.log("hashchange: "+window.location.hash )
    //event.stopPropagation();
    //var id = this.getAttribute("href").split('#')[1];
    var id = getHashParts().mrk; // el: util.js
    if (id) {
        var trg = document.getElementById(id);

        // this.console.log("ni malkaŝu "+id);    
        if (trg && trg.tagName == "H2") {
            // ĉe derivaĵoj, la kaŝita div venos post h2
            const sec = trg.closest("section"); //parentElement;    
            trg = sec.querySelector("div.kasxebla");
        }
    
        //showContainingDiv(trg);
        //triggerEvent(trg,"malkashu");
        if (trg)
            trg.dispatchEvent(MalkashEvento);
        else
            this.console.error("ne troviĝis saltomarko '"+id+'"');
    }
});

// difinu ĉion sub nomprefikso "artikolo"

var artikolo = function() {

    when_doc_ready(function() {
        console.log("artikolo.when_doc_ready...:" + location.href);
        preparu_art();
        //enkadrigu();
    });

    function preparu_art(url) {
        // evitu preparon, se ni troviĝas en la redaktilo kaj
        // la artikolo ne ĉeestas!
        if (! document.getElementById(sec_art)) return;

        // ŝargu fone la referencojn de Vikipedio kaj tezaŭro
        const fn = getUrlFileName(url);
        const artikolo = fn.substring(0,fn.lastIndexOf('.'));
        referencoj(artikolo);

        if (window.location.protocol != 'file:') {
            top.document.title='Reta Vortaro [' +
            document.getElementById(sec_art).getElementsByTagName("H1")[0].textContent.trim() +
            ']';
        }
        /* aktivigu nur por longaj artikoloj... */
        var d = document.getElementsByClassName("kasxebla");
        //if (d.length > js_sojlo) {
            preparu_kashu_sekciojn();
            preparu_malkashu_fontojn();
            preparu_maletendu_sekciojn();
            kashu_malkashu_butonoj();
            piedlinio_modifo();
            //interna_navigado();
            //etendu_ekzemplojn();   
        //}
    }

    function getPrevH2(element) {
        var prv = element.previousSibling;
        while ( prv && prv.nodeName != "H2") { prv = prv.previousSibling; }
        return prv;
    }

    /* kaŝu sekciojn de derivaĵoj, se la artikolo estas tro longa
    kaj provizu ilin per ebleco remalkaŝi */
    function preparu_kashu_sekciojn() {
        var d = document.getElementsByClassName("kasxebla");

        // derivaĵo aŭ alia elemento celita kaj do montrenda
        var h = getHashParts().mrk; 
        var trg = h? document.getElementById(h) : null;
        var d_vid = trg? trg.closest("section.drv, section.fontoj").firstElementChild.id : null;

        var multaj = d.length > js_sojlo;
        var first = true;

        for (var el of d) {

            // forigu titolon "administraj notoj", se la sekcio estas malplena
            if (el.closest(".admin") && el.childElementCount == 0) {
                el.closest(".admin").textContent= '';
                continue;
            }
            
            // provizore ne bezonata: el.addEventListener("kashu", function(event) { kashu_drv(event.currentTarget) });
            el.addEventListener("malkashu", function(event) { 
                malkashu_drv(event.currentTarget);
                event.stopPropagation();
            });
            el.addEventListener("komutu", function(event) { 
                kashu_malkashu_drv(event.currentTarget);
                event.stopPropagation();
            });           

            var h2 = getPrevH2(el);
            if (h2) {

                h2.classList.add("kashilo");
                // ni kaŝas derivaĵon sub la sekvaj kondiĉoj:
                // 1. estas multaj derivaĵoj en la artikolo (vd. js_sojlo)
                // 2a. ne temas pri derivaĵo, al kiu ni celis rekte (per marko #, povas esti drv, snc, ekz, fnt)
                // 2b. aŭ ĝi ne estas la unua derivaĵo en la artikolo, kondiĉe ke ni ne celas al specifa derivaĵo 
                if ( multaj && (h && h2.id != d_vid) || (!h && !first) ) { 
                    // \u25be
                    h2.appendChild(make_icon_button("i_mkash",
                        null,"malkaŝu derivaĵon"));
                    el.classList.add("kasxita");
                } else {
                    // "\u25b2"
                    h2.appendChild(make_icon_button("i_kash",
                        null,"kaŝu derivaĵon"));
                }                    
                first = false;

                // difinu eventojn
                h2.addEventListener("click", function(event) { 
                    //kashu_malkashu_drv(event);
                    var sec = event.target.closest("section"); //parentElement;    
                    var div = sec.querySelector("div.kasxebla");
                    div.dispatchEvent(KomutEvento);
                    //triggerEvent(div,"komutu");
                });
            }
        }    
    }

    function preparu_malkashu_fontojn() {
        var d = document.getElementsByClassName("fontoj kasxita");
        for (var el of d) {
            el.addEventListener("malkashu", function(event) { 
                event.currentTarget.classList.remove("kasxita");
                event.stopPropagation();
            });
        }
    }

    /* kelkajn sekciojn kiel ekzemploj, tradukoj, rimarkoj ni maletendas, poo eviti troan amplekson.
    Ili ricevas eblecon por reetendi ilin per "pli..." */
    function preparu_maletendu_sekciojn() {
        var d = document.getElementsByClassName("etendebla");
    //    var sojlo = 3+2; // ekde tri drv + trd + fnt, au du drv kaj adm
    // if (d.length > sojlo) { // ĝis tri derivaĵoj (+tradukoj, fontoj), ne kaŝu la alineojn
        for (var el of d) {
            if (el.classList.contains("tradukoj")) {
                maletendu_trd(el);
            }
        }

        var art = document.getElementById("s_artikolo");
        if (art) {
            var d1 = art.querySelectorAll("span.dif");
            for (var dif of d1) {
                maletendu_ekz(dif);
            }
        }
    }

    /** kaŝu ĉiujn derivaĵojn **/
    function kashu_chiujn_drv() {
        for (var el of document.getElementsByClassName("kasxebla")) 
            if (el.parentElement.classList.contains("drv") ||
                el.parentElement.classList.contains("notoj")) 
                kashu_drv(el);
    }

    /** malkaŝu ĉiujn derivaĵojn **/
    function malkashu_chiujn_drv() {
        for (var el of document.getElementsByClassName("kasxebla")) 
            if (el.parentElement.classList.contains("drv") ||
                el.parentElement.classList.contains("notoj"))  
                malkashu_drv(el);
    }

    function kashu_drv(el) {
        el.classList.add("kasxita");
        var h2 = getPrevH2(el);
        if (h2) {
            var kash = h2.querySelector(".i_kash");
            if (kash) kash.classList.replace("i_kash","i_mkash");
        }
    }

    function malkashu_drv(el) {
        // console.log("malkaŝu drv");
        el.classList.remove("kasxita");
        var h2 = getPrevH2(el);
        if (h2) {
            var mkash = h2.querySelector(".i_mkash");
            if (mkash) mkash.classList.replace("i_mkash","i_kash");
        }
    }

    function kashu_malkashu_drv(el) {
        //event.stopPropagation();
        //var div = section.getElementsByClassName("kasxebla")[0];

        var sec = el.closest("section"); //parentElement;    
        var div = sec.querySelector("div.kasxebla");

        if (div.classList.contains("kasxita")) 
            malkashu_drv(div);
        else 
            kashu_drv(div);
    }

    function maletendu_trd(element) {
        //var nav_lng = navigator.languages || [navigator.language];
        var eo;
        var maletenditaj = 0;
        var serch_lng = getHashParts().lng;

        for (var id of element.children) {
            var id_lng = id.getAttribute("lang");
            // la tradukoj estas paroj de ea lingvo-nomo kaj nacilingvaj tradukoj
            if (id_lng) {
                if ( id_lng == "eo") {
                    eo = id;
                } else if ( id_lng != serch_lng && preferoj.languages().indexOf(id_lng) < 0 ) {
                    eo.classList.add("kasxita");
                    id.classList.add("kasxita");
                    maletenditaj += 1;
                } else {
                    // tio necesas, se ni adaptas la preferojn
                    // por vidi pli da tradukoj!
                    eo.classList.remove("kasxita");
                    id.classList.remove("kasxita");
                }
            }
        }
        // aldonu pli...
        if (maletenditaj && ! element.querySelector(".pli")) {
            var pli = make_elements([
                ["DT",{class: "pli lng"},
                    ["(",["A",{lang: "eo", href: "#", class: "pli etendilo"},"+"+maletenditaj],")"]
                ],
                ["DD", {class: "pli"}]
            ]);
                // href=# necesas por ebligi fokusadon per TAB-klavo
            pli[0].addEventListener("click",etendu_trd);
            element.append(...pli);

            const _MS_PER_DAY = 1000 * 60 * 60 * 24;
            if ( Math.round((Date.now() - preferoj.date()) / _MS_PER_DAY, 0) < 1 ) {
                var pref = make_elements([
                    ["DT",{class: "pref"},
                        [["A",{lang: "eo", href: "#", class: "pref"}, "preferoj..."]]
                    ],
                    ["DD", {class: "pref"}]
                ]);
                pref[0].addEventListener("click",preferoj.dialog);
                element.append(...pref);
            }
        }
    }

    function etendu_trd(event) {
        event.preventDefault();
        var div_trd = event.target.closest("DL");
        for (var id of div_trd.children) {
            id.classList.remove("kasxita");
        }
        // kaŝu pli...
        div_trd.querySelectorAll("dt.pli, dd.pli").forEach(
            p => p.classList.add("kasxita")
        );
        div_trd.querySelectorAll("dt.pref, dd.pref").forEach(
            p => p.classList.add("kasxita")
        );
    }


    function maletendu_ekz(dif) {
        var ekz_cnt = 0;
        for (var ch of dif.childNodes) {
            if (ch.classList && ch.classList.contains("ekz")) {
                ekz_cnt += 1;
                if (ekz_cnt > ekz_sojlo) {
                    ch.classList.add("kasxita");
                }
            } else if ( ch.nextSibling && ch.nodeType == 3 && ! ch.nodeValue.trim() ) {
                // ignoru "blankjn" tekstojn
                continue;
            } else {
                // se ni ĵus kaŝis iujn ekzemplojn, ni montru
                // etendilon "+nn..."
                if (ekz_cnt > ekz_sojlo) {
                    var maletenditaj = ekz_cnt - ekz_sojlo;
                    var pli = make_elements([
                            ["i",{class: "ekz pli"},
                                ["(",["A",{href: "#", class: "pli etendilo"},"+"+maletenditaj],")"]
                            ]])[0];
                    pli.addEventListener("click",etendu_ekz);
                    dif.insertBefore(pli,ch);        
                }
                // ni rekomencu kalkuladon - atentu, ke ekzemploj de difino
                // ne nepre estas unu post alia, sed povas esti pli distritaj...
                ekz_cnt = 0;
            }
        }    
    }

    function etendu_ekz(event) {
        var dif = event.target.closest("span.dif");
        for (var ch of dif.querySelectorAll(".ekz")) {
            ch.classList.remove("kasxita");
            if (ch.classList.contains("pli"))
                // ĉu forigi aŭ kaŝi - dependas, ĉu poste ni denove bezonus ĝin...
                dif.removeChild(ch);
        }
    }

    /*
    function make_flat_button(label,handler,hint='') {
        var span = document.createElement("SPAN");
        span.classList.add("kashilo");
        span.appendChild(document.createTextNode(label)); 
        //span.addEventListener("click",handler);
        if (hint) span.setAttribute("title",hint)
        return span;
    }*/

    function kashu_malkashu_butonoj() {
        // aldonu kasho/malkasho-butonojn  
        //var art = document.getElementById(sec_art);
        var art = document.getElementsByTagName("article")[0];
        var div=make_element("DIV",{id: "kash_btn"});
        div.appendChild(make_icon_button("i_kash_ch",kashu_chiujn_drv,"kaŝu ĉiujn derivaĵojn"));
        div.appendChild(make_icon_button("i_mkash_ch",malkashu_chiujn_drv,"malkaŝu ĉiujn derivaĵojn"));
        //h1.appendChild(make_button(icon_opcioj,preferoj_dlg,"agordu viajn preferatajn lingvojn"));
        art.appendChild(div);
    }

    function piedlinio_modifo() {
        var pied = document.body.getElementsByTagName("FOOTER")[0];
        if (pied) { // en la redeaktilo eble jam foriĝis...
            var first_a = pied.querySelector("A");
            if (first_a) {
                var pref = make_element("A",{class: "redakto", href: "#", title: "agordu preferatajn lingvojn"},"preferoj");
                pref.addEventListener("click",preferoj.dialog);
                first_a.insertAdjacentElement("afterend",pref);
                first_a.insertAdjacentText("afterend"," | ");      
            }
            // forigu nun unuan ligilon "Revo"
            first_a.nextSibling.remove();
            first_a.remove();
            // mallongigu referencon xml kaj aldonu "download"
            var xml = pied.querySelector("A[href^='../xml/']");
            if (xml) {
                xml.textContent="xml";
                xml.setAttribute("download","download");
            }
            var hst = pied.querySelector("A[href^='../hst/']");
            var ver = hst.nextSibling;
            hst.textContent = ver.nodeValue
                .split(/\s+/)[2]
                .replace(/\//g,'-');
            ver.remove();
            // forigu finan <br>
            pied.querySelector("br").remove();
        }        
    }

    function referencoj(artikolo) {
        HTTPRequestFull('POST', vokoref_url, {}, {art: artikolo},
            function(data) {
                function mrk_art_url(mrk) {
                    const fn = mrk.substring(0,mrk.indexOf('.'));
                    return art_path + fn + '.html#' + mrk;
                }
                function kreu_ref_div(mrk, first_drv = false) {
                    var refs = [];
                    // viki-referenco
                    for (r of json.viki) {
                        if (r.m == mrk || 
                            (first_drv && r.m == mrk.substring(0,mrk.indexOf('.')))) {
                            const v = make_elements([
                                'W:',['a',{ href: vikipedio_url+r.v },r.v],['br']
                            ]);
                            refs.push(...v); 
                        }
                    }
                    // tezaŭro-referencoj
                    for (r of json.tez) {
                        const fnt = r.fnt;
                        if (fnt.m == mrk || 
                            (first_drv && fnt.m == mrk.substring(0,mrk.indexOf('.')))) {
                            const cel = r.cel;
                            const a = make_elements([
                                ['img',{ 
                                    src: '../smb/' + r.tip + '.gif', 
                                    class: "ref r_" + r.tip, 
                                    alt: r.tip }],
                                ['a',{ href: mrk_art_url(cel.m) },cel.k],['br']
                            ]);
                            if (cel.n) {
                                const s = make_element("sup",{},cel.n);
                                a.splice(1,0,s);
                            }
                            refs.push(...a); 
                        }
                    }
                    if (refs.length) {
                        const div = make_element("div");
                        div.append(...refs);
                        return div;
                    }
                }

                if (! data) return;                 
                var json = JSON.parse(data);

                // trakuru la derivaĵojn kaj alordigu la referencojn kun sama mrk-o
                // en la unua drv aldonu ankaŭ referencojn celantaj al la artikolo (sen '.')
                const art = document.getElementById(sec_art);
                for (h2 of art.querySelectorAll('h2[id]')) {
                    const div = kreu_ref_div(h2.id);
                    if (div) {
                        const sec = h2.closest("section");
                        const dk = sec.querySelector("div.kasxebla");
                        dk.prepend(div);
                    }
                }
            }
        );
    }


   // eksportu publikajn funkction
   return {
        preparu_art: preparu_art
   };

}();
