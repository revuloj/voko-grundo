// (c) 2020 - 2023 Wolfram Diestel
// laŭ permesilo GPL 2.0

//import '../x/util';
import * as u from '../u';
import {agordo as g} from '../u';
import * as x from '../x';
import * as s from './shargo';
import {DOM, Dialog} from '../ui';

import {t_nav,t_red,t_main,stato_difinoj} from './stato';
import {artikolo} from '../a/artikolo';
import {preferoj} from '../a/preferoj';

import {sercho} from './sercho';
import {redaktilo} from './redaktilo';

// moduloj kun funkcioj por unuopaj paĝoj
import { plena, ktp, mx_trd, eo } from './p_plena';
import { titolo } from './p_titolo';
import { bibliogr } from './p_bibliogr';
import { eraroj } from './p_eraroj';


// keydown / keyup mankas apriore en difinoj de TypeScript...!
declare global {
    interface Element {
        removeEventListener(type: 'keyup' | 'keydown', listener: (event: KeyboardEvent) => any, options?: boolean | EventListenerOptions): void;
        addEventListener(type: 'keyup' | 'keydown', listener: (event: KeyboardEvent) => any, options?: boolean | EventListenerOptions): void;  
    }
}
  
// x-tajpado (cx->ĉ...)
let xtajpo: x.XTajpo;

// referencu la malsupran ŝargo-funkcion en shargo.ts
s.diffn_ŝargu_paĝon(ŝargu_paĝon_html);


/*
    navigado laŭ a href=... estas traktata per navigate_link()...
*/

/**
 * Enira funkcio vokata post ŝarĝo de la kadra paĝo. Ĝi 
 * finpreparas la paĝon: evento-reagoj...
 */
DOM.dok_post_lego(function() { 

    // en aparatoj, kie ni ne havas programistan kromfenestron (iOS, Android...)
    // ni tiel povas krei fenestreton kun la eraromesaĝoj. Normale ni ne kreas gin!
    /// if (g.debug) dom_console();

    // ek...
    console.log("kadro.dok_post_lego...");

    // sendu erarojn al aside#console - ŝaltu supre debug=true!
    if (g.debug) {
        window.addEventListener("error", function(event) {
            // message,filename,lineno,error.message,error.stack
            const c = document.getElementById("console");
            if (c) {
              const tn = document.createTextNode(
                event.filename + "@" +
                event.lineno + ": " +
                event.message);
              const br = document.createElement("br");
              c.append(tn,br);
            }
        });  
    }


    //##################### transiroj / statoj

    // difinu la stato-transirojn
    stato_difinoj();


    //##################### dialogoj

    // legu prefertajn lingvojn kaj kreu dialogon por agordi ilin
    preferoj.relegu();
    new Dialog("#pref_dlg",{});
    /*
        butonoj: {
            "Preta": preferoj.dlg_konservo(artikolo.preparu_maletendu_sekciojn)
        }
    });*/

    // la traduko-dialogo 

    const t_dlg = new x.TradukDialog("#r\\:traduko_dlg", {
        trd_tabelo: "#traduko_table",
        kampoj: {}, 
        butonoj: {   
          "Enmeti la tradukojn": function(ev: Event) { 
            try {
              this.xmlarea.enmetu_tradukojn();
              this.fermu();
            } catch (e) {
              DOM.al_t("#traduko_error",e.toString());
            }
          },
          "\u2718": function() { this.fermu(); }
        },      
    });
 

    
    //##################### kadro kaj reagoj de elementoj

    // ni ne kreas la kadron, se ni estas en (la malnova) "frameset"
    const malnova = top && top.frames.length;
    if (! malnova) {

        // ĉe URL-parametro 'q' ni rekte lanĉu serĉon
        // provizore rezignu pri tia preparo, aparte la aŭtomata enkadrigo de artikoloj
        // enkadrigu();
        if (document.getElementById("navigado")) {

            let srch = x.getParamValue("q"); if (srch === '') srch = "tohuvabohuo"; // Kajto :-)
            const red = x.getParamValue("r");
            const hash = window.location.hash;
    
            if (hash) {
                // se post # troviĝas artikolnomo, ni rekte iru al tiu artikolo
                // se okazas eraro pro nevalida #... ni montru la titolpaĝon (ne 404-paĝon)
                const art_url = s.hash2art(hash);
                if (art_url) ŝargu_paĝon_html("main",art_url,true,undefined,
                    g.dlg_prefix+g.titolo_url);   
                ŝargu_paĝon_html("nav",g.inx_eo_url);   
            } else if (red) {
                // se parametro r estas donita, ni ekredaktos la donitan artikolon...
                redaktu(window.location.href);
            } else if (srch) {
                // ĉe URL-parametro '?q=' ni tuj lanĉu serĉon
                // ni devas certigi, ke la naviga kaj titolpaĝo antaŭ la
                // serĉo ŝargiĝu, por ke depende de la rezulto la vortaro 
                // tamen aperu bona! Tial la ĉenigo!
                ŝargu_paĝon_html("nav",g.inx_eo_url,true,()=>{
                    ŝargu_paĝon_html("main",g.titolo_url,true,
                        ()=>sercho.serchu_q(srch || "tohuvabohuo"));
                });
            } else {
                // anstataŭe ŝargu tiujn du el ĉefa indeks-paĝo
                ŝargu_paĝon_html("main",g.titolo_url);
                ŝargu_paĝon_html("nav",g.inx_eo_url);   
            }
        }

        DOM.klak_halt("#x\\:nav_montru_btn",s.malfaldu_nav);
        DOM.klak_halt("#x\\:nav_kashu_btn",s.faldu_nav);

        //onclick("x:nav_start_btn",()=>{ ŝargu_paĝon("nav",inx_eo_url) });
        //t_nav.je("x:nav_start_btn","click","ĉefindekso");
        DOM.klak_halt("#x\\:nav_start_btn",()=>{ 
            ŝargu_paĝon_html("nav",g.inx_eo_url);
            //t_nav.transiro("ĉefindekso") 
        });

        //onclick("x:titol_btn",()=>{ ŝargu_paĝon("main",titolo_url) });
        DOM.klak_halt("#x\\:titol_btn", () => { 
            ŝargu_paĝon_html("main",g.titolo_url);
            //t_main.transiro("titolo") 
        });
        //t_main.je("x:titol_btn","click","titolo")

        //onclick("x:nav_srch_btn",(event)=>{ serchu(event) })
        DOM.klak_halt("#x\\:nav_srch_btn", (event: Event) => { 
            sercho.ekserchu(event);
            // transiro aŭ lanĉu la serĉon aŭ evtl. sekvu ĝin...
        });
        //t_nav.je("x:nav_srch_btn","click","serĉo");

        DOM.klak_halt("#x\\:redakt_btn", () => { 
            if (t_nav.stato != "redaktilo")
                ŝargu_paĝon_html("nav",g.redaktmenu_url);

            // ni bezonas eble relegi la redaktilan kadron kaj
            // fine de tio relegi la artikolon!...
            if (t_main.stato != "red_xml" && t_main.stato != "red_rigardo")
                ŝargu_paĝon_html("main",g.redaktilo_url);

            // metu staton "red_xml" se ni venos de red_rigardo,
            // aliokaze ni faros tion en ŝargu_paĝon - tie ĉi estus tro frue tiuokaze
            if (t_main.stato == "red_rigardo")
                t_main.transiro("red_xml");
        });
        //t_main.je("x:redakt_btn","click","red_xml");

        DOM.klak_halt("#x\\:rigardo_btn",()=>{ t_main.transiro("red_rigardo"); });
        //t_main.je("x:rigardo_btn","click","red_rigardo");

        xtajpo = new x.XTajpo(["x:q"],"x:cx");
        /*
        onclick("x:cx", (event: Event) => { 
            var cx = <HTMLInputElement>event.currentTarget;
            cx.value = ""+(1 - parseInt(cx.value)); 
            const xq = document.getElementById('x:q'); 
            if (xq) xq.focus();
        });*/

        
        let query = document.getElementById("x:q");
        if (query) {
            
            query.addEventListener("keydown", function(event) {
                if (event.key == "Enter") {  
                    sercho.ekserchu(event);
                    // t_nav.transiro("serĉo")...
                }
            });
            
            //t_nav.je("x:q","keydown","serĉo");

            //var query = document.getElementById("x:q");
            /*
            query.addEventListener("keyup",function(event) {
                const trg = event.target as HTMLInputElement;
                
                const xcx = document.getElementById("x:cx") as HTMLInputElement;
                //console.debug("which: "+event.which+" code:"+event.code + " key: "+ event.key);
                if (event.key == "x" || event.key == "Shift") { // x-klavo
                    if (xcx.value == "1") {
                        const s = trg.value;
                        const s1 = x.ascii_eo(s);
                        if (s != s1)
                            trg.value = s1;
                    }
                // keycode fix for older Android Chrome 
                } else if ((event.keyCode == 0 || event.keyCode == 229) && xcx.value == "1") {
                    const s = trg.value;
                    const key = s.charAt(s.length-1);
                    //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                    if (key == "x" || key == "X") {
                        const s1 = x.ascii_eo(s);
                        if (s != s1)
                            trg.value = s1;    
                    }
                }
            });*/
        }
        
        document.body 
        //document.getElementById("navigado")
            .addEventListener("click",navigate_link);

            
        window
            .addEventListener('popstate', navigate_history);    

        // tio vokiĝas, i.a. kiam la uzanto reŝargas la paĝon aŭ fermas la redaktilon.
        x.do_before_unload(s.aktualigilo);

        // kondiĉe, ke serĉo-parametro (q) estis donita en URL ni tuj serĉos
        // ĉu ni bezonos ankoraŭ originan staton "start" anstataŭ tuj "ĉefindekso"?
        t_nav.transiro("ĉefindekso","serĉo"); // ĉu parametro ?q= estis donita
            // (tion fakte jam devus testi la stato-maŝino 't_nav' per la pli supra difino kun gardo)

    }
});


/**
 * Se la artikolo ŝargiĝis aparte de la kadro ni aldonos la kadron.
 * Provizore ni ne uzas tiun funkcion, ĉar alstirado de la artikolo
 * post enkadrigo ankoraŭ ne fidinde funkcias. Estu la ebleco referenci 
 * unuopan artikolon kaj esti gvidata bone al Revo prezentanta la artikolon.
 * Provizore restas la referenco [^Revo] sub ĉiu arikolo por alstiri la
 * ĉefan Revo-paĝon.
 */
function enkadrigu() {

    // preparu la ĉefan parton de la paĝo
    if (document.getElementsByTagName("main").length == 0) {
        var main = u.ht_element("main",{});
        main.append(...Array.from(document.body.children));
        document.body.appendChild(main);
    } else {
        ŝargu_paĝon_html("main",g.titolo_url);
    }

    // preparu la navigo-parton de la paĝo
    if (document.getElementsByTagName("nav").length == 0) {
        var nav = u.ht_element("nav",{});
        var div = u.ht_element("div",{id: "navigado"});
        nav.appendChild(div);
        document.body.appendChild(nav);
    }

    // rekreu la indekson laŭ la historio aŭ ŝargu la centran eo-indekson
    if (history.state && history.state.nav) {
        console.log(history.state);
        // ni bezonas unue revo-1b.js:
        ŝargu_paĝon_html("nav",history.state.nav,false);
    } else {
        ŝargu_paĝon_html("nav",g.inx_eo_url);
    }
}


/** 
 * Helpfunkcio por navigado. Navigante laŭ a@href ni devas distingi plurajn kazojn:
 * 1. int: temas pri interna referenco (href="#...")
 * 2. ext: temas pri alekstera referenco (href="http(s)://iu-retejo...")
 * 3. nav: temas pri referenco al alia indekso, t.e. inx: target="", art: target="indekso"    
 * 4. main: temas pri referenco al artikolo/ĉefpaĝo, t.e. inx: target="precipa", art: target="" 
 * 5. red: temas pri referenco al redaktilo: vokomail.pl (malnova), parametro ?r (nova)   
*/
function ref_target(a_el: Element) {
    const href = a_el.getAttribute("href");
    if (! href) {
        console.error("mankas atributo href ĉe elemento "+a_el.tagName+" ("+a_el.id+")");
        return;
    }

    const trg = a_el.getAttribute("target");
    const red = x.getParamValue("r",href.split('?')[1]);

    if (red || href.indexOf("/cgi-bin/vokomail.pl")>=0) {
        return "red"; // redakti...
    } else if (href.startsWith('#')) {
        return "int";
    } else if (
        href.startsWith('http://') 
        && href.substring('http://'.length-1,g.revo_url.length) != g.revo_url ||
        href.startsWith('https://') 
        && href.substring('https://'.length-1,g.revo_url.length) != g.revo_url
        ) {
        return "ext";
    } else if (trg == "precipa") {
        return "main";
    } else if (trg == "indekso") {
        return "nav";
    } else if (!trg) {
        var cnt = a_el.closest("nav,main");
        if (cnt) return cnt.tagName.toLowerCase(); 
    }
}


/** 
 * En la kazoj ref_target = main | nav, ni adaptos la originajn URL-ojn por Ajax:
 * 1. ../xxx -> /revo/xxx
 * 2. aliaj relativaj (t.e. ne ^/ aŭ ^http) -> /revo/art/xxxx | /revo/inx/xxx
 * 3. /cgi-bin/vokomail.pl?art=xxx -> /revo/dlg/redaktilo.html?art=xxx
 * 4. aliaj absolutaj (t.e. ^/ aŭ http) ni lasu
*/
function normalize_href(target: "main"|"nav", href: string) {
    // ĉu estas fidinde uzi "target" tie ĉi aŭ ĉu ni uzu "source"?
    const prefix = { main: "art/", nav: "inx/"};
    if (href.endsWith('titolo.html')) {
        return g.dlg_prefix + g.titolo_url;
    } else if (href.startsWith('../')) {
        return g.revo_prefix + href.slice(3);
    } else if (href.startsWith('tz_') || href.startsWith('vx_')) {
        return g.tez_prefix + href;
    } else if (href[0] != '/' && ! href.startsWith('http')) {
        return g.revo_prefix + prefix[target] + href;
    /*} else if (href.startsWith('/cgi-bin/vokomail.pl')) {
        var query = href.substring(href.search('art='));
        return '/revo/dlg/redaktilo-1c.html?' + query
        */
    } else {
        return href;
    }
}   

/**
 * Helpfunkcio por ŝargu_paĝon. Enŝovas la enhavon de ŝargita
 * dokumento en la navigan panelon.
 */
function enigu_dok_nav(url: string, doc: Document, nav: Element) {
    nav.textContent= '';
    let filename: string = '';

    const table = doc.querySelector("table"); 
    if (table)
        try {
            const file = url.split('/').pop()
            filename = file? file.split('.')[0]: '';
            table.id = "x:"+filename;
            adaptu_paghon(table,url);    

            // forigu menuon kaj "colspan" 
            const menu = table.querySelector("tr.menuo");
            if (menu) menu.remove();
            else if (!url.startsWith("redak")) {
                // provizora solvo, ĉar class="menuo" mankas ankoraŭ en kelkaj dosieroj
                const fona = table.querySelector("td.fona");
                const tr_menu = fona? fona.parentElement: null;
                if (tr_menu) tr_menu.remove();
            }
            const enh = table.querySelector(".enhavo");
            if (enh) enh.removeAttribute("colspan");

        } catch(error) {
            console.error(error);
        }

    if (table) nav.append(table);

    if (filename && filename.startsWith("redaktmenu")) {
        redaktilo.preparu_menuon(); // redaktilo-paĝo
        
        // butono por rezigni
        const rzg = document.getElementById("r:rezignu");
        if (rzg) rzg.addEventListener("click",function() {
                t_red.transiro("ne_redaktante");
        });
    } else if (filename.startsWith("_plena")) {
        plena.viaj_submetoj();
    /*} else if (filename == "bibliogr") {
        bibliogr.ŝargo(<string>url.split('#').pop());*/
    } else if (filename == "eraroj") {
        eraroj.mrk_eraroj();
    }
    s.malfaldu_nav();

    // laŭbezone ankoraŭ iru al loka marko
    s.interna_salto(url, history);
}


/**
 * Helpfunkcio por ŝargu_paĝon. Enŝovas la enhavon de ŝargita
 * dokumento en la ĉefan panelon.
 */
function enigu_dok_main(url: string, doc: Document, main: Element) {
    try {
        adaptu_paghon(doc.body,url);
    } catch(error) {
        console.error(error);
    }
    const art_al = main.querySelector("article");
    const art_el = doc.querySelector("article");
    const piedo = doc.querySelector("footer");

    if (art_al && art_el) {       
        art_al.textContent = '';
        art_al.setAttribute("id","w:"+url.split('/').pop());
        art_al.append(...Array.from(art_el.children));
        if (piedo) art_al.append(piedo);
        
        let filename = url.split('/').pop();

        if (filename && filename.startsWith("redaktilo")) {
            const params = filename.split('?').pop() || '';

            // la ekranklavaro ŝargos la fak- kaj la stil-listojn
            // do ni ne bezonas fari tion tie ĉi!
            // revo_listoj.stiloj.load();
            // revo_listoj.fakoj.load();

            // transdonu la listojn al la redaktilo por poste kontrolado
            // de stiloj kaj fakoj en la XML-artikolo
            // redaktilo.revo_listoj = revo_listoj;
            redaktilo.preparu_redaktilon(params, xtajpo); // redaktilo-paĝo
            
        } else {
            // laŭbezone ankoraŭ iru al loka marko
            s.interna_salto(url,history);

            const fn = x.getUrlFileName(url);
            const art = fn.substring(0,fn.lastIndexOf('.')); 
            if (art)  
                artikolo.preparu_art(art);                      
            
            var s_artikolo = document.getElementById("s_artikolo");
            // refaru matematikajn formulojn, se estas
            if (s_artikolo) {
                // aldonu ../art/ ĉe href, eble ni devus fari tion jam en adaptu_paghon
                // ĉar tre rapida uzanto povus ankoraŭ kalki sur la nekorektitan ligon
                // aliflanke tiel la paĝo aperas jam iomete pli frue...
                x.fix_art_href(s_artikolo);
            
                // vd eble https://github.com/mathjax/MathJax/issues/2385
                // aŭ https://mariusschulz.com/blog/declaring-global-variables-in-typescript
                if ( typeof(MathJax) != 'undefined' && MathJax.Hub) {               
                    MathJax.Hub.Config({showMathMenu: false, showMathMenuMSIE: false});                        
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"s_artikolo"]);
                }
            }                    
        }
    }
    //if (url == titolo_url) hide("x:titol_btn"); 
    //else if ( document.getElementById("x:_plena") ) show("x:titol_btn");
    s.faldu_nav();
}

/**
 * Fone ŝargas HTML-paĝon kaj enigas aŭ en la naviagan aŭ la ĉefan panelon
 * @param {string} trg - la panelo (subpaĝo nav aŭ main) en kiu aperu la petita paĝo
 * @param {string} url - la URL de la petita paĝo
 * @param {boolean} push_state - true: memoru la petitan paĝon en la historio, tiel ni povos poste reiri
 * @param {Function} whenLoaded - ago, farenda post fonŝargo de la paĝo
 */
function ŝargu_paĝon_html(trg: string, url: string, push_state: boolean=true, whenLoaded?: Function, eraro_url?: string) {

    u.HTTPRequest('GET', url, {},
        function(data: string) {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/html");
            var nav = document.getElementById("navigado");
            var main = document.querySelector("main");

            // elprenu la historio-staton
            var hstate=history.state || {};

            if (nav && trg == "nav") {
                // PLIBONIGU: difinu ŝærgu_nav kiel ago de transiro
                enigu_dok_nav(url,doc,nav);

                if (url == g.redaktmenu_url)
                    t_nav.transiro("redaktilo"); 
                else if (url == g.inx_eo_url)
                    t_nav.transiro("ĉefindekso"); 
                else
                    t_nav.transiro("subindekso"); 
                hstate.nav = url;

                //img_svg_bg(); // anst. fakvinjetojn, se estas la fak-indekso - ni testos en la funkcio mem!
            } else if (main && trg == "main") {
                // se redaktado ne jam estas finita, sekurigu la artikolon
                if (t_red.stato == "redaktante" &&
                   (t_main.stato == "red_xml" || t_main.stato == "red_rigardo"))
                    redaktilo.store_art();

                // PLIBONIGU: difinu ŝargu_main kiel ago de transiro(?()
                enigu_dok_main(url,doc,main);
                if (url == g.titolo_url)
                    t_main.transiro("titolo"); 
                else if (url.startsWith(g.redaktilo_url))
                    t_main.transiro("red_xml");
                else
                    t_main.transiro("artikolo");
                hstate.main = url;
            }                    

            // aktualigu la historion
            if (push_state) {
                console.debug("transiru el:"+JSON.stringify(history.state));
                console.debug("=======> al:"+JSON.stringify(hstate));
                // provizore ne ŝanĝu la URL de la paĝo
                history.pushState(hstate,'');
            }  
            
            // faru, kion poste faru donita kiel argumento
            if (whenLoaded) whenLoaded();
    },  
    s.start_wait,
    s.stop_wait,
    (request: Request) => http_eraro(request,eraro_url)
    );
}


/**
 * Fone ŝargas JSON-dosieron kaj enigas la enhavon aŭ en la naviagan aŭ la ĉefan panelon
 * @param {string} trg - la panelo (subpaĝo nav aŭ main) en kiu aperu la petita paĝo
 * @param {string} url - la URL de la petita paĝo
 * @param {boolean} push_state - true: memoru la petitan paĝon en la historio, tiel ni povos poste reiri
 * @param {Function} whenLoaded - ago, farenda post fonŝargo de la paĝo
 */
function ŝargu_paĝon_json(trg: string, url: string, push_state: boolean=true, whenLoaded?: Function) {

    if (url.indexOf("/bibliogr.") > -1) {
        s.malfaldu_nav(); // se ni ne faras unue la alsalto ne funkcias. Eble ni tion ŝovu al bibliogr.ŝargo?

        bibliogr.ŝargo("bib",function() {
            // elprenu la historio-staton
            var hstate = history.state || {};

            t_nav.transiro("subindekso");

            hstate.nav = url;

            // aktualigu la historion
            if (push_state) {
                console.debug("transiru el:"+JSON.stringify(history.state));
                console.debug("=======> al:"+JSON.stringify(hstate));
                // provizore ne ŝanĝu la URL de la paĝo
                history.pushState(hstate,'');
            }

            // laŭbezone ankoraŭ iru al loka marko
            s.interna_salto(url, history);
            
            // faru, kion poste faru donita kiel argumento
            if (whenLoaded) whenLoaded();
        })
    } else {
        throw "Por tiu URL ne estas difinita ŝargoprocedo: "+url;
    }

}


/**
 * Se mankas paĝo petata ni montros nian apartan 404-paĝon
 * @param {*} request 
 */
function http_eraro(request: any, http_404_url = g.http_404_url) {
    if (request.status == 404 && request.responseURL.indexOf('404')<0) // evitu ciklon se 404.html mankas!
        ŝargu_paĝon_html("main",http_404_url);
}


/**
 * Faras necesajn adaptojn de la paĝo. Ni uzas statikajn paĝojn, kiuj iam funkciis
 * memstare, sed nun devas funkcii en la javoskripta kadro. Precipe temas pri adaptoj de
 * referencoj (href) kaj prezento (stilo).
 * @param {Element} root_el 
 * @param {string} url 
 */
function adaptu_paghon(root_el: Element, url: string) {
    // adapto de atributoj img-atributoj

    // anstataŭigu GIF per SVG  
    x.fix_img_svg(root_el);

    const filename = url.split('/').pop();
    if (!filename) return;

    if ( filename.startsWith('_plena.') ) {
        plena.adaptoj(root_el);
    }
    else if ( filename && filename.startsWith('titolo') ) {
        titolo.adapto(root_el);
    } 
    else if ( filename.startsWith('_eo.') ) {
        // index Esperanto. Atentu! Por la elirpunkto de navigado 
        // ni nun uzas _plena. (vd. malsupre)
        eo.adapto(root_el);
    }
    else if ( filename.startsWith('_ktp.') ) {
        ktp.adapto(root_el);
    }
    else if ( filename.startsWith('mx_trd.') ) {
        mx_trd.adapto(root_el);
    }
    else if ( filename.startsWith('tz_') ) {
        // paĝoj de la tezaŭro (ĉu ni havas ankoraŭ?)
        root_el.querySelector("tr")?.classList.add("menuo");
    }
}


// anstataŭigu vinjetojn per CSS-SVG-klasoj
//function img_svg_bg() {
//    var x_fak = document.getElementById('x:_fak');
//    if (x_fak) {
//        for (var i of x_fak.getElementsByTagName('img')) {
//            var name=i.getAttribute("alt");
//            i.classList.add(name);
//        }
//    }
//}

/**
 * Navigado laŭ referenco (a@href) depende de kie estas la celo (ext,int,nav,red,main).
 * @param {*} event 
 * @returns se estas elŝuto (XML) laŭ atributo 'download' ni ne navigas sed tuj revenas.
 */
function navigate_link(event: Event) {
    const trg = event.target;
    if (trg instanceof HTMLElement) {
        const el = trg.closest("a");

        if (el && el.getAttribute("download")) return; // tion traktu la retumilo mem!
    
        var href = el? el.getAttribute("href") : null;
    
        if (el && href) {
            href = el.getAttribute("href");
            var target = ref_target(el);
        
            if (href && target && target != "int") {
                event.preventDefault();
                // ekstera paĝo
                if (target == "ext") {
                    window.open(href);
    
                // redaktilo
                } else if (target == "red") {
                    redaktu(href);
    
                // paĝo en la ĉefa parto (main)
                } else if (target == "main") {
                    ŝargu_paĝon_html(target,normalize_href(target,href));
                    /*
                    $('#s_artikolo').load(href, //+' body>*'                            
                        preparu_art
                    );   
                    */  
                // paĝo en la naviga parto (nav)
                } else if (target == "nav") {
                        // bibliografion ni legas fone el JSON, ne HTML 
                    if (href.indexOf("/bibliogr.")>-1) {
                        ŝargu_paĝon_json("nav",href); // href povas finiĝi je .html, sed ni ŝanĝos poste.
                    } else {
                        // ĉiuj aliaj pagoj estas HTML-dosieroj
                        ŝargu_paĝon_html(target,normalize_href(target,href));
                    }
                    /*
                    $('#navigado').load(href+' table');
                    */
                }
            }
        }
    }

}   

/**
 * Navigas laŭ la historio, do returne.
 * @param {*} event 
 */
function navigate_history(event: any) {
    event.preventDefault();
    var state = event.state;

    // FARENDA: eble ni komparu kun la nuna stato antaŭ decidi, ĉu parton
    // ni devos renovigi!
    if (state) {
        console.debug("revenu el:"+JSON.stringify(history.state));
        console.debug("<===== al:"+JSON.stringify(state));
        if (state.nav) ŝargu_paĝon_html("nav",state.nav,false);
        if (state.main) ŝargu_paĝon_html("main",state.main,false);    
    }
}            



/**
 * Komencas redaktadon de la aktuala artikolo ŝargante la redaktopaĝon kaj -ilaron.
 * @param href 
 */
function redaktu(href: string) {
    const params = href.split('?')[1];
    //const art = getParamValue("art",params);
    
    ŝargu_paĝon_html("main",g.redaktilo_url+'?'+params);
    ŝargu_paĝon_html("nav",g.redaktmenu_url);
}


