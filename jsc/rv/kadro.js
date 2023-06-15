
/* jshint esversion: 6 */

// (c) 2020 - 2023 Wolfram Diestel
// laŭ permesilo GPL 2.0


// statoj kaj transiroj - ni uzas tri diversajn statomaŝinojn por la tri paĝoj navigilo, ĉefpago kaj redaktilo
const t_nav  = new Transiroj("nav","start",["ĉefindekso","subindekso","serĉo","redaktilo"]);
const t_main = new Transiroj("main","start",["titolo","artikolo","red_xml","red_rigardo"]);
const t_red  = new Transiroj("red","ne_redaktante",["ne_redaktante","redaktante","tradukante","sendita"]);

/**
 * Kodlistoj agorditaj por Reta Vortaro: lingvoj, fakoj, stiloj
 */
const revo_codes = {
    lingvoj: new Xlist('lingvo', '/revo/cfg/lingvoj.xml'),
    fakoj: new Xlist('fako','/revo/cfg/fakoj.xml'),
    stiloj: new Xlist('stilo','/revo/cfg/stiloj.xml')
};
revo_codes.lingvoj.load();
  

/**
 * Helpofunkcio, por instali klak-reagojn
 * @param {string} id - la id-atributo de HTML-elemento
 * @param {Function} reaction - la reago al la klak-evento
 */
function onclick(id,reaction) {
    var nb = document.getElementById(id);
    if (nb) {
        nb.addEventListener("click", function(event) {
            event.preventDefault();
            if (globalThis.debug) console.debug("clicked: "+id);
            reaction(event);
            //event.stopPropagation();
        });
    }
}


/*
    navigado laŭ a href=... estas traktata per navigate_link()...
*/

/**
 * Eblas doni en la Revo-URL por rekta aliro artikolon/derivaĵon/sencon ekzemple per #hund.0o.dombesto
 * Tion ni transformas al /revo/art/hund.html#hund.0o.dombesto por ebligi navigi tien.
 * @param {*} hash - la valoro de loka URL-marko, ekz-e #hund.0o.dombesto
 */
function hash2art(hash) {
    if (hash) {
        const art = hash.substring(1).split('.')[0];
        if (art)
            return (
                globalThis.art_prefix + art + '.html' + hash
            );
    }
}

/**
 * Enira funkcio vokata post ŝarĝo de la kadra paĝo. Ĝi 
 * finpreparas la paĝon: evento-reagoj...
 */
when_doc_ready(function() { 

    // dom_console();
    console.log("kadro.when_doc_ready...");

    // sendu erarojn al aside#console - ŝaltu supre debug=true!
    if (globalThis.debug) {
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

    // preferataj lingvoj
    preferoj.restore();

    //// PLIBONIGU: provizore limigu Transiroj-n al memorado de la momenta stato
    //// kaj adapto de videbleco / stato de butonoj, sed rezignu pri tro komplikaj
    //// agoj kiel ŝargi paĝojn ktp. (?)

    t_nav.alvene("ĉefindekso",()=>{ 
        if (t_main.stato != "titolo") 
            show("x:titol_btn");
        hide("x:nav_start_btn");
        // viaj_submetoj(); -- ĉe renovigado tio venus tro frue kaj reforiĝus....
    });

    t_nav.forire("ĉefindekso",()=>{ 
        hide("x:titol_btn");
        show("x:nav_start_btn");
    });

    t_nav.alvene("redaktilo",()=>{ 
        // metu buton-surskribon Rezignu kaj malaktivigu la aliajn du
        if (t_red.stato == "redaktante") {
                // ĉe sendita ne jam montru, sed eble tio eĉ en povus okazi?
            document.getElementById("r:rezignu").textContent = "Rezignu"; 
            enable("r:kontrolu"); 
            enable("r:konservu");

            // se ni revenas al redaktado post portempa forlaso
            // ni devos adapti la butonon laŭ t_main
            // ĉar ĝi ne ŝanĝiĝas kaj do ne mem kaŭzas la adapton
            if (t_main.stato == "red_xml") {
                hide("x:redakt_btn");
                show("x:rigardo_btn");
            } else if (t_main.stato == "red_rigardo") {
                show("x:redakt_btn");
                hide("x:rigardo_btn");
            }
        }
    });

    t_nav.forire("redaktilo",()=>{ 
        hide("x:rigardo_btn");
        // se ni ankoraŭ redaktas, ni bezonas butonon por reveni al la redaktilo!
        if (t_red.stato == "redaktante") {
            show("x:redakt_btn");
        }
    });

    t_main.alvene("titolo",()=>{ 
       hide("x:titol_btn");
       nombroj();
    });

    t_main.forire("titolo",()=>{ 
        if (t_nav.stato == "ĉefindekso") 
            show("x:titol_btn");
    });

    // difinu agojn por transiroj al cel-statoj
    //t_main.alvene("titolo",()=>{ load_page("main",titolo_url) });
    t_main.alvene("red_xml",()=>{ 
        t_red.transiro("redaktante"); // transiro al ne_redaktante okazas ĉe sendo aŭ rezigno!
        show("r:tab_txmltxt",'collapsed');
        show("x:rigardo_btn"); 
        hide("x:redakt_btn"); 
        /***
         * se ne videbla...?:
            load_page("nav",redaktmenu_url);
            index_spread();
         */    
    });
    t_main.forire("red_xml",()=>{ 
        hide("r:tab_txmltxt",'collapsed');
        hide("x:rigardo_btn"); 
        // tiu servos por reveni al la redaktilo
        // ĝis ni definitive finis redaktadon!
        if (t_red.stato == "redaktante") 
            show("x:redakt_btn"); 
    });
    t_main.alvene("red_rigardo",()=>{ 
        show("r:tab_trigardo",'collapsed');
        show("x:redakt_btn"); 
        redaktilo.rantaurigardo();
    });
    t_main.forire("red_rigardo",()=>{ 
        hide("r:tab_trigardo",'collapsed');
    });

    t_red.forire("redaktante",()=>{
        // memoru enhavon de kelkaj kampoj de la redaktilo
        redaktilo.store_preferences();

        hide("x:redakt_btn");
        hide("x:rigardo_btn");
    });

    /*
    t_red.alvene("tradukante",()=>{
        show("r:tab_tradukoj",'collapsed');
        // tion ni faru verŝajne pli bone en forire("redaktante"), ĉu?
        // hide("r:tab_txmltxt",'collapsed');
    });
    */

    t_red.alvene("ne_redaktante",()=>{
        // ni devos fari tion en "alvene", ĉar
        // load_page kontrolas t_red.stato por scii ĉu montri "x:redakt_btn"
        load_page("main",globalThis.titolo_url); // ĉu pli bone la ĵus redaktatan artikolon - sed povus konfuzi pro malapero de ŝangoj?
        load_page("nav",globalThis.inx_eo_url);
    });

    t_red.alvene("sendita",()=>{
        // ŝanĝu tekston al nurlege
        document.getElementById("r:xmltxt").setAttribute("readonly","readonly");
        // ŝanĝu buton-surskribon Rezignu->Finu kaj aktivigu la aliajn du 
        document.getElementById("r:rezignu").textContent = "Finu"; 
        disable("r:kontrolu"); 
        disable("r:konservu"); 
    });
    

    // ni ne kreas la kadron, se ni estas en (la malnova) "frameset"
    if (! top.frames.length) {

        // ĉe URL-parametro 'q' ni rekte lanĉu serĉon
        // provizore rezignu pri tia preparo, aparte la aŭtomata enkadrigo de artikoloj
        // enkadrigu();
        if (document.getElementById("navigado")) {

            let srch = getParamValue("q"); if (srch === '') srch = "tohuvabohuo"; // Kajto :-)
            const red = getParamValue("r");
            const art = window.location.hash;
    
            if (art) {
                // se post # troviĝas artikolnomo, ni rekte iru al tiu artikolo
                const art_url = hash2art(art);
                load_page("main",art_url);   
                load_page("nav",globalThis.inx_eo_url);   
            } else if (red) {
                // se parametro r estas donita, ni ekredaktos la donitan artikolon...
                redaktu(window.location.href);
            } else if (srch) {
                // ĉe URL-parametro '?q=' ni tuj lanĉu serĉon
                // ni devas certigi, ke la naviga kaj titolpaĝo antaŭ la
                // serĉo ŝargiĝu, por ke depende de la rezulto la vortaro 
                // tamen aperu bona! Tial la ĉenigo!
                load_page("nav",globalThis.inx_eo_url,true,()=>{
                    load_page("main",globalThis.titolo_url,true,
                        ()=>serchu_q(srch || "tohuvabohuo"));
                });
            } else {
                // anstataŭe ŝargu tiujn du el ĉefa indeks-paĝo
                load_page("main",globalThis.titolo_url);
                load_page("nav",globalThis.inx_eo_url);   
            }
        }

        onclick("x:nav_montru_btn",index_spread);
        onclick("x:nav_kashu_btn",index_collapse);

        //onclick("x:nav_start_btn",()=>{ load_page("nav",inx_eo_url) });
        //t_nav.je("x:nav_start_btn","click","ĉefindekso");
        onclick("x:nav_start_btn",()=>{ 
            load_page("nav",globalThis.inx_eo_url);
            //t_nav.transiro("ĉefindekso") 
        });

        //onclick("x:titol_btn",()=>{ load_page("main",titolo_url) });
        onclick("x:titol_btn",()=>{ 
            load_page("main",globalThis.titolo_url);
            //t_main.transiro("titolo") 
        });
        //t_main.je("x:titol_btn","click","titolo")

        //onclick("x:nav_srch_btn",(event)=>{ serchu(event) })
        onclick("x:nav_srch_btn",(event)=>{ 
            serchu(event);
            // transiro aŭ lanĉu la serĉon aŭ evtl. sekvu ĝin...
        });
        //t_nav.je("x:nav_srch_btn","click","serĉo");

        onclick("x:redakt_btn",()=>{ 
            if (t_nav.stato != "redaktilo")
                load_page("nav",globalThis.redaktmenu_url);

            // ni bezonas eble relegi la redaktilan kadron kaj
            // fine de tio relegi la artikolon!...
            if (t_main.stato != "red_xml" && t_main.stato != "red_rigardo")
                load_page("main",globalThis.redaktilo_url);

            // metu staton "red_xml" se ni venos de red_rigardo,
            // aliokaze ni faros tion en load_page - tie ĉi estus tro frue tiuokaze
            if (t_main.stato == "red_rigardo")
                t_main.transiro("red_xml");
        });
        //t_main.je("x:redakt_btn","click","red_xml");

        onclick("x:rigardo_btn",()=>{ t_main.transiro("red_rigardo"); });
        //t_main.je("x:rigardo_btn","click","red_rigardo");

        onclick("x:cx",(event)=>{ 
            var cx = event.currentTarget;
            cx.value = 1 - cx.value; 
            document.getElementById('x:q').focus();
        });

        
        var query = document.getElementById("x:q");
        query.addEventListener("keydown", function(event) {
            if (event.key == "Enter") {  
                serchu(event);
                // t_nav.transiro("serĉo")...
            }
        });
        
        //t_nav.je("x:q","keydown","serĉo");

        //var query = document.getElementById("x:q");
        query.addEventListener("keyup",function(event){
            //console.debug("which: "+event.which+" code:"+event.code + " key: "+ event.key);
            if (event.key == "x" || event.key == "Shift") { // x-klavo
                if (document.getElementById("x:cx").value == "1") {
                    const s = event.target.value;
                    const s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;
                }
            // keycode fix for older Android Chrome 
            } else if ((event.keyCode == 0 || event.keyCode == 229) 
                && document.getElementById("x:cx").value == "1") {
                const s = event.target.value;
                const key = s.charAt(s.length-1);
                //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                if (key == "x" || key == "X") {
                    const s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;    
                }
            }
        });
    
        document.body 
        //document.getElementById("navigado")
            .addEventListener("click",navigate_link);

            
        window
            .addEventListener('popstate', navigate_history);    

        // tio vokiĝas, i.a. kiam la uzanto reŝargas la paĝon aŭ fermas la redaktilon.
        do_before_unload(aktualigilo);

        // kondiĉe, ke serĉo-parametro (q) estis donita en URL ni tuj serĉos
        // ĉu ni bezonos ankoraŭ originan staton "start" anstataŭ tuj "ĉefindekso"?
        t_nav.transiro("ĉefindekso","serĉo"); // ĉu parametro ?q= estis donita
            // (tion fakte jam devus testi la stato-maŝino 't_nav' per la pli supra difino kun gardo)

    }
});

/**
 * Por ebligi ŝargi freŝajn paĝojn ni altigas la version, kiu
 * estas alpendigata al GET, tiel evitante ricevi paĝojn el la loka bufro.
 */
function aktualigilo() {
    const akt = window.localStorage.getItem("aktualigilo");
    const akt1 = (((akt && parseInt(akt,10)) || 0) + 1) % 30000; // +1, sed rekomencu ĉe 0 post 29999
    // Se ni uzus sessionStorage ni post remalfermo de la retumilo denove
    // ricevus pli malnovajn paĝ-versiojn, do ni uzas localStorage por memori la versi-numeron.
    window.localStorage.setItem("aktualigilo",akt1.toString());
}

/**
 * Faldas-malfaldas la navigan panelon (tiu kun la indeksoj, serĉo...)
 */
function index_toggle() {
    document.getElementById("navigado").classList.toggle("eble_kasxita");
    toggle("x:nav_kashu_btn");
    toggle("x:nav_montru_btn");
    //document.querySelector("main").classList.toggle("kasxita");
}

/**
 * Malfaldas la navigan panelon
 */
function index_spread() {
    document.getElementById("navigado").classList.remove("eble_kasxita");
    show("x:nav_kashu_btn");
    hide("x:nav_montru_btn");
}

/**
 * Faldas la navigan panelon. Tiel estas pli da spaco por la artikolo
 * aŭ redaktado.
 */
function index_collapse() {
    document.getElementById("navigado").classList.add("eble_kasxita");
    show("x:nav_montru_btn");
    hide("x:nav_kashu_btn");
}


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
        var main = ht_element("main",{});
        main.append(...document.body.children);
        document.body.appendChild(main);
    } else {
        load_page("main",globalThis.titolo_url);
    }

    // preparu la navigo-parton de la paĝo
    if (document.getElementsByTagName("nav").length == 0) {
        var nav = ht_element("nav",{});
        var div = ht_element("div",{id: "navigado"});
        nav.appendChild(div);
        document.body.appendChild(nav);
    }

    // rekreu la indekson laŭ la historio aŭ ŝargu la centran eo-indekson
    if (history.state && history.state.nav) {
        console.log(history.state);
        // ni bezonas unue revo-1b.js:
        load_page("nav",history.state.nav,false);
    } else {
        load_page("nav",globalThis.inx_eo_url);
    }
}

/**
 * vd. https://wiki.selfhtml.org/wiki/HTML/Tutorials/Navigation/Dropdown-Men%C3%BC
 */
function nav_toggle() {
    var menu = document.getElementById("navigado");
    if (menu.style.display == "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "";
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
function ref_target(a_el) {
    const href = a_el.getAttribute("href");
    const trg = a_el.getAttribute("target");
    const red = getParamValue("r",href.split('?')[1]);

    if (! href) {
        console.error("mankas atributo href ĉe elemento "+a_el.tagName+" ("+a_el.id+")");
        return;
    }

    if (red || href.indexOf("/cgi-bin/vokomail.pl")>=0) {
        return "red"; // redakti...
    } else if (href.startsWith('#')) {
        return "int";
    } else if (
        href.startsWith('http://') 
        && href.substring('http://'.length-1,globalThis.revo_url.length) != globalThis.revo_url ||
        href.startsWith('https://') 
        && href.substring('https://'.length-1,globalThis.revo_url.length) != globalThis.revo_url
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
function normalize_href(target, href) {
    // ĉu estas fidinde uzi "target" tie ĉi aŭ ĉu ni uzu "source"?
    const prefix = { main: "art/", nav: "inx/"};
    if (href.endsWith('titolo.html')) {
        return globalThis.dlg_prefix + globalThis.titolo_url;
    } else if (href.startsWith('../')) {
        return globalThis.revo_prefix + href.slice(3);
    } else if (href.startsWith('tz_') || href.startsWith('vx_')) {
        return globalThis.tez_prefix + href;
    } else if (href[0] != '/' && ! href.startsWith('http')) {
        return globalThis.revo_prefix + prefix[target] + href;
    /*} else if (href.startsWith('/cgi-bin/vokomail.pl')) {
        var query = href.substring(href.search('art='));
        return '/revo/dlg/redaktilo-1c.html?' + query
        */
    } else {
        return href;
    }
}   

/**
 * Kiam ni fone ŝargas ion ni montras tion per turniĝanta revo-fiŝo
 * (la serĉbutono)
 */
function start_wait() {
    var s_btn = document.getElementById('x:revo_icon');
    if (s_btn) s_btn.classList.add('revo_icon_run');
    s_btn = document.getElementById('w:revo_icon');
    if (s_btn) s_btn.classList.add('revo_icon_run');
}

/**
 * Post sukcesa fona ŝargo ni haltigas la turnigon de la revo-fiŝo
 * Noto: Se ni fonŝarĝas plurajn aferojn samtempe, la unua preta haltigas
 * la turniĝon. Se ni volus haltigi nur post la lasta, ni devus registri
 * ĉiun ekŝarĝon kaj kontroli, kiam la lasta revenis.
 */
function stop_wait() {
    var s_btn = document.getElementById('x:revo_icon');
    if (s_btn) s_btn.classList.remove('revo_icon_run');
    s_btn = document.getElementById('w:revo_icon');
    if (s_btn) s_btn.classList.remove('revo_icon_run');
}

/**
 * Se mankas paĝo petata ni montros nian apartan 404-paĝon
 * @param {*} request 
 */
function load_error(request) {
    if (request.status == 404 && request.responseURL.indexOf('404')<0) // evitu ciklon se 404.html mankas!
        load_page("main",globalThis.http_404_url);
}

/**
 * Ŝargas paĝon
 * @param {string} trg - la panelo (subpaĝo nav aŭ main) en kiu aperu la püetita paĝo
 * @param {string} url - la URL de la petita paĝo
 * @param {boolean} push_state - true: memoru la petitan paĝon en la hisotrio, tiel ni povos poste reiri
 * @param {Function} whenLoaded - ago, farenda post fonŝargo de la paĝo
 */
function load_page(trg, url, push_state=true, whenLoaded=undefined) {
    function update_hash() {
        var hash;
        if (url.indexOf('#') > -1) {
            hash = url.split('#').pop();
        } else {
            hash = '';
        }
        // evitu, ĉar tio konfuzas la historion:... window.location.hash = hash;
        if (hash) {
            const h = document.getElementById(hash); 
            if (h) {
                h.scrollIntoView();
                history.replaceState(history.state,'',
                location.origin+location.pathname+"#"+encodeURIComponent(hash));
            }
        } else {
            history.replaceState(history.state,'',
                location.origin+location.pathname);
        }
    }

    function load_page_nav(doc, nav) {
        nav.textContent= '';
        var filename;
        var table = doc.querySelector("table"); 
        try {
            filename = url.split('/').pop().split('.')[0];
            table.id = "x:"+filename;
            adaptu_paghon(table,url);    

            // forigu menuon kaj "colspan" 
            const menu = table.querySelector("tr.menuo");
            if (menu) menu.remove();
            else if (!url.startsWith("redak")) {
                // provizora solvo, ĉar class="menuo" mankas ankoraŭ en kelkaj dosieroj
                const tr_menu = table.querySelector("td.fona").parentElement;
                if (tr_menu) tr_menu.remove();
            }
            const enh = table.querySelector(".enhavo");
            enh.removeAttribute("colspan");

        } catch(error) {
            console.error(error);
        }

        nav.append(table);

        if (filename.startsWith("redaktmenu")) {
            redaktilo.preparu_menu(); // redaktilo-paĝo
            // butono por rezigni
            document.getElementById("r:rezignu")
                .addEventListener("click",function() {
                    t_red.transiro("ne_redaktante");
            });
        } else if (filename.startsWith("_plena")) {
            viaj_submetoj();
        } else if (filename == "bibliogr") {
            bibliogr();
        } else if (filename == "eraroj") {
            mrk_eraroj();
        }
        index_spread();

        // laŭbezone ankoraŭ iru al loka marko
        update_hash();
    }

    function load_page_main(doc, main) {
        var body = doc.body;
        try {
            adaptu_paghon(body,url);
        } catch(error) {
            console.error(error);
        }
        main.textContent = '';
        main.append(...body.children);
        main.setAttribute("id","w:"+url);
        var filename = url.split('/').pop();

        if (filename.startsWith("redaktilo")) {
            redaktilo.preparu_red(filename.split('?').pop()); // redaktilo-paĝo
            
        } else {
            // laŭbezone ankoraŭ iru al loka marko
            update_hash();

            const fn = getUrlFileName(url);
            const art = fn.substring(0,fn.lastIndexOf('.')); 
            if (art)  
                artikolo.preparu_art(art);                      
            
            var s_artikolo = document.getElementById("s_artikolo");
            // refaru matematikajn formulojn, se estas
            if (s_artikolo) {
                // aldonu ../art/ ĉe href, eble ni devus fari tion jam en adaptu_paghon
                // ĉar tre rapida uzanto povus ankoraŭ kalki sur la nekorektitan ligon
                // aliflanke tiel la paĝo aperas jam iomete pli frue...
                fix_art_href(s_artikolo);
            
                if ( typeof(MathJax) != 'undefined' && MathJax.Hub) {

                    /*
                    MathJax.Hub.Register.MessageHook("Math Processing Error",function (message) {
                        //  message[2] is the Error object that records the problem.
                        console.error(message)
                        });

                    MathJax.Hub.Startup.signal.Interest(
                        function (message) {console.debug("Startup: "+message)}
                    );
                    MathJax.Hub.signal.Interest(
                        function (message) {
                            console.debug("Hub: "+message)
                            if (message[1] instanceof HTMLElement) {
                                console.debug("  >>"+message[1].tagName+message[1].id)
                            }
                        }
                    ); 
                    */                         
                    MathJax.Hub.Config({showMathMenu: false, showMathMenuMSIE: false});                        
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"s_artikolo"]);
                }
            }                    
        }
        //if (url == titolo_url) hide("x:titol_btn"); 
        //else if ( document.getElementById("x:_plena") ) show("x:titol_btn");
        index_collapse();
    }

    HTTPRequest('GET', url, {},
        function(data) {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/html");
            var nav = document.getElementById("navigado");
            var main = document.querySelector("main");

            // elprenu la historio-staton
            var hstate=history.state || {};

            if (nav && trg == "nav") {
                // PLIBONIGU: difinu load_page_nav kiel ago de transiro
                load_page_nav(doc,nav);

                if (url == globalThis.redaktmenu_url)
                    t_nav.transiro("redaktilo"); 
                else if (url == globalThis.inx_eo_url)
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

                // PLIBONIGU: difinu load_page_main kiel ago de transiro(?()
                load_page_main(doc,main);
                if (url == globalThis.titolo_url)
                    t_main.transiro("titolo"); 
                else if (url.startsWith(globalThis.redaktilo_url))
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
    start_wait,
    stop_wait,
    load_error
    );
}


/**
 * Faras necesajn adaptojn de la paĝo. Ni uzas statikajn paĝojn, kiuj iam funkciis
 * memstare, sed nun devas funkcii en la javoskripta kadro. Precipe temas pri adaptoj de
 * referencoj (href) kaj prezento (stilo).
 * @param {Element} root_el 
 * @param {string} url 
 */
function adaptu_paghon(root_el, url) {
    // adapto de atributoj img-atributoj

    // anstataŭigu GIF per SVG  
    fix_img_svg(root_el);

    var filename = url.split('/').pop();
    // index Esperanto. Atentu! Ni nun uzas _plena. (vd. malsupre)
    if ( filename.startsWith('_eo.') ) {
        for (var n of root_el.querySelectorAll(".kls_nom")) {
            if (n.tagName != "summary") {
                n.classList.add("maletendita");

                n.addEventListener("click", function(event) {
                    event.target.classList.toggle("maletendita");
                });   
            }
        }
    }
    // index "ktp.
    else if ( filename.startsWith('_ktp.') ) {
        // hazarda artikolo
        const hazarda = root_el.querySelector("p[id='x:Iu_ajn_artikolo'] a") ||
                        root_el.querySelector("a[href*='hazarda_art.pl'");
        hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            hazarda_art();
            event.stopPropagation(); // ne voku navigate_link!
        });       
    }
    else if ( filename.startsWith('_plena.') ) {
        // hazarda artikolo
        const hazarda = root_el.querySelector("p[id='x:Iu_ajn_artikolo'] a") ||
                        root_el.querySelector("a[href*='hazarda_art.pl'");
        hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            hazarda_art();
            event.stopPropagation(); // ne voku navigate_link!
        });
        // en la lingva indekso metu preferatajn lingvojn supren
        const lingvoj = root_el.querySelector("a[href*='lx_la_']").closest('details');
        const p = lingvoj.querySelector('p');
        var jam = [];
        for (let l of preferoj.languages()) {
            let l_ = l.split(/-/)[0];
            if (jam.indexOf(l_)<0) { // evitu duoblaĵojn!
                let a = lingvoj.querySelector("a[href*='lx_"+l_+"_']");
                if (a) p.prepend(a.cloneNode(true));
                jam.push(l_);
            }
        }
    }
    else if ( filename.startsWith('mx_trd.') ) {
        var a;
        for (a of root_el.querySelectorAll("a[href^='?']")){
            var href = a.getAttribute("href");
            a.setAttribute("href",globalThis.mx_trd_url+href);
        }
        for (a of root_el.querySelectorAll("a[target='_blank']")){
            a.removeAttribute("target");
        }
    }
    else if ( filename.startsWith('tz_') ) {
        root_el.querySelector("tr").classList.add("menuo");
    }
    // serĉilo en titol- kaj serĉo-paĝoj
    else if ( filename.startsWith('titolo') ) {
        // adaptu serĉilon
        const s_form = root_el.querySelector("form[name='f']");
        const query = s_form.querySelector("input[name='q']");
        const cx = s_form.querySelector("button.cx");
        const hazarda = root_el.querySelector("a[id='w:hazarda']");
        //var submit = s_form.querySelector("input[type='submit']");
        //s_form.removeAttribute("action");
        //submit.addEventListener("click",serchu);
        
        query.addEventListener("keydown", function(event) {
            if (event.key == "Enter") {  
                serchu(event);
            }
        });
        query.addEventListener("keyup",function(event){
            if (event.key == "x" || event.key == "Shift") { // x-klavo 
                if (document.getElementById("w:cx").value == "1") {
                    var s = event.target.value;
                    var s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;
                }
            }
            // keycode fix for older Android Chrome 
            else if ((event.keyCode == 0 || event.keyCode == 229) 
                && document.getElementById("w:cx").value == "1") {
                const s = event.target.value;
                const key = s.charAt(s.length-1);
                //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                if (key == "x" || key == "X") {
                    const s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;    
                }
            }
        });

        cx.addEventListener("click", function(event) {
            event.preventDefault();
            var cx = event.target;
            cx.value = 1 - cx.value; 
            document.getElementById('w:q').focus();
        });

        s_form.querySelector("button[value='revo']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                serchu(event);
            });

        s_form.querySelector("button[value='ecosia']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                var q = document.getElementById('w:q').value;
                location.href = 'https://www.ecosia.org/search?q='+encodeURIComponent(q+' site:reta-vortaro.de');
            });

        s_form.querySelector("button[value='anaso']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                var q = document.getElementById('w:q').value;
                location.href = 'https://duckduckgo.com?q='+encodeURIComponent(q+' site:reta-vortaro.de');
        });

        /*
        s_form.querySelector("button[value='google']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                var q = document.getElementById('w:q').value
                location.href = 'https://www.google.com/search?q='+encodeURIComponent(q+' site:reta-vortaro.de')
        });
        */

        // hazarda artikolo
        hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            hazarda_art();
        });
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
function navigate_link(event) {
    var el = event.target.closest("a");

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
                load_page(target,normalize_href(target,href));
                /*
                $('#s_artikolo').load(href, //+' body>*'                            
                    preparu_art
                );   
                */  
            // paĝo en la naviga parto (nav)
            } else if (target == "nav") {                   
                load_page(target,normalize_href(target,href));
                /*
                $('#navigado').load(href+' table');
                */
            }
        }
    }
}   

/**
 * Navigas laŭ la historio, do returne.
 * @param {*} event 
 */
function navigate_history(event) {
    event.preventDefault();
    var state = event.state;

    // FARENDA: eble ni komparu kun la nuna stato antaŭ decidi, ĉu parton
    // ni devos renovigi!
    if (state) {
        console.debug("revenu el:"+JSON.stringify(history.state));
        console.debug("<===== al:"+JSON.stringify(state));
        if (state.nav) load_page("nav",state.nav,false);
        if (state.main) load_page("main",state.main,false);    
    }
}            

/**
 * La uzanto volas serĉi ion...
 * @param {*} event 
 */
function serchu(event) {
    event.preventDefault();
    var serch_in = event.target.closest("form")
        .querySelector('input[name=q]');
    var esprimo = serch_in.value;
    if (esprimo) {
        // evitu ŝanĝi .search, ĉar tio refreŝigas la paĝon nevolite: 
        // location.search = "?q="+encodeURIComponent(esprimo);
        history.pushState(history.state,'',location.origin+location.pathname+"?q="+encodeURIComponent(esprimo));
        serchu_q(esprimo);
    }
}

/**
 * Serĉas per la transdonita serĉesprimo.
 * @param {string} esprimo 
 */
function serchu_q(esprimo) {

    const srch = new Sercho();
    srch.serchu(esprimo, function() {

        function findings(lng) {
            var div = ht_elements([
                ["div",{},
                    [["h1",{}, revo_codes.lingvoj.codes[lng]||lng ]]
                ]
            ])[0];
            var dl = ht_element("dl");

            const trvj = srch.trovoj(lng);
            // console.log(trvj);

            var atr = {};
            for (var n=0; n<trvj.length; n++) {
                var t = trvj[n];
                if (n+1 > globalThis.sercho_videblaj && trvj.length > globalThis.sercho_videblaj+1) {
                    // enmetu +nn antaŭ la unua kaŝita elemento
                    if (n - globalThis.sercho_videblaj == 1) {
                        const pli = ht_pli(trvj.length - globalThis.sercho_videblaj);
                        if (pli) dl.append(...pli);
                    }                        
                    atr = {class: "kasxita"};
                }

                const dt = ht_element("dt",atr);

                if ( lng == 'eo' ) {
                    // tradukojn oni momente ne povas ne povas rekte alsalti,
                    // do ni provizore uzas t.eo.mrk anst. t[l].mrk
                    const a = ht_element("a",{target: "precipa", href: t.h}, t.v);
                    dt.append(a);
                } else {
                    const s = ht_element("span",{lang: lng}, t.v);
                    dt.append(s);
                }

                // dum redakto ni aldonas transprenan butonon por kreado de referencoj
                if ( lng == 'eo' && t_red.stato == "redaktante") {
                    const ref_btn = ht_element("button",{
                        class: "icon_btn r_vid", 
                        value: t.h.split('#')[1], // mrk
                        title:"transprenu kiel referenco"
                    });
                    dt.append(ref_btn);
                }                            

                const dd = ht_element("dd",atr);

                if ( lng == 'eo' ) {
                    // trovitaj tradukoj de tiu e-a vorto
                    for ( let [l,trd] of Object.entries(t.t) ) { // ni trairu ĉiujn lingvojn....
                        // tradukojn oni momente ne povas rekte alsalti,
                        // do ni (provizore?) uzas href (el drv-mrk) 
                        const a = ht_elements([
                                ["a",{target: "precipa", href: t.h},
                                    [["code",{}, l + ":"],["span",{lang: l}, trd]]
                                ],["br"]
                            ]);    
                        if (a) dd.append(...a);
                    } // for lng,trd ...
                } else {
                    // trovitaj esperantaj tradukoj de tiu nacilingva vorto
                    for (let e of t.t) {
                        const a = ht_elements([
                            ["a",{target: "precipa", href: e.h},
                                e.k
                            ],["br"]
                        ]);    
                        if (a) dd.append(...a);
                    } // for e
                }
                dl.append(dt,dd);
            }
            div.append(dl);

            // atentigo pri limo
            //if (lng.max == lng.trovoj.length) {
            //    const noto = ht_element("p",{class: "kasxita"},"noto: por trovi ankoraŭ pli, bv. precizigu la serĉon!");
            //    div.append(noto);
            //}
            return div;
        } // ...findings

        function nofindings() {
            return ht_elements([
                ["p",{},
                    [["strong",{},"Nenio troviĝis!"]]
                ]
            ])[0];
        } // ...nofindings

        function serch_lng() {
            const div = ht_elements([["div",{class:"s_lng"},
                [
                    ["span",{class: "llbl"},"serĉlingvoj: "],
                    ["span",{class: "llst"},srch.s_lng.join(', ')]
                ]
            ]]);
            return div[0];
        }

        index_spread();
        const nav = document.getElementById("navigado");
        const inx_enh = nav.querySelector(".enhavo");
        const trovoj = ht_element("div",{id: "x:trovoj"},"");

        // serĉlingvoj
        if ( srch.s_lng ) {
            trovoj.append(serch_lng());
        }

        // se nenio troviĝis...
        if ( srch.malplena() ) {
            trovoj.append(nofindings());

        // se troviĝis ekzakte unu kaj ni ne redaktas, iru tuj al tiu paĝo
        } else if ( srch.sola() && t_red.stato != "redaktante" ) {
            load_page("main",srch.unua().href);
        }

        if ( !srch.malplena() ) {
            trovoj.append(findings('eo'));
            for (let lng of srch.lingvoj()) {
                trovoj.append(findings(lng));
            }    

            // aldonu la reagon por ref-enmetaj butonoj
            if (t_red.stato == "redaktante") {
                for (let btn of trovoj.querySelectorAll("button.r_vid")) {
                    btn.addEventListener("click",(event)=>{                         
                        // kiun ref-mrk ni uzu - depende de kiu butono premita
                        const refmrk = event.target.value;
                        const refstr = event.target.previousSibling.textContent;
                        // revenu de trovlisto al redakto-menuo
                        load_page("nav",globalThis.redaktmenu_url,true,
                            () => redaktilo.load_ref(refmrk,refstr));        
                    });
                }           
            }     
        }

        // montru butonon por reveni al ĉefa indekso
        //index_home_btn(trovoj.children[0]);
        //show("x:nav_start_btn");
        t_nav.transiro("serĉo");

        inx_enh.textContent = "";
        //inx_enh.append(...s_form,trovoj);
        inx_enh.append(trovoj);
        // forigu ankaŭ eventualan "viaj submetoj", ĝi estu nur en ĉefindekso por
        // eviti konfuzojn
        const subm = nav.querySelector("#submetoj");
        if (subm) nav.removeChild(subm);
    },
    start_wait,
    stop_wait 
    );

}

/**
 * Montras arbitran artikolon. Ni elserĉas hazardan kapvorton en la datumbazo
 * kaj montras la artikolon kaj la kapvorton en de tiu artikolo.
 */
function hazarda_art() {

    HTTPRequest('POST', globalThis.sercho_url, {sercxata: "!iu ajn!"},
        function(data) {
            // sukceso!
            var json = 
                /** @type { {hazarda: Array<string>} } */
                (JSON.parse(data));
            const mrk = json.hazarda[0];
            const href = globalThis.art_prefix + mrk.split('.')[0] + '.html#' + mrk;
            if (href) load_page("main",href);
        }, 
        start_wait,
        stop_wait 
    );
}


/**
 * Ricevas la nombrojn de kapvortoj kaj tradukoj kaj prezentas ilin en la titolpaĝo.
 */
function nombroj() {

    HTTPRequest('POST', globalThis.nombroj_url, {x:0}, // sen parametroj POST ne funkcius, sed GET eble ne estus aktuala!
        function(data) {
            // sukceso!
            var json = 
                /** @type { {trd: Array, kap: Array} } */
                (JSON.parse(data));
            console.log(json);
            const n = document.getElementById('t:nombroj');
            if (n && json) {
                // {"trd":[412630],"kap":[31291]}
                const trd = json.trd[0];
                const kap = json.kap[0];
                n.prepend('Ni nun provizas '+kap+' kapvortojn kun '+trd+' tradukoj. ');
            }
        }, 
        start_wait,
        stop_wait 
    );
}

/**
 * Pridemandas erarojn pri mrk-atributoj de la servilo kaj prezentas ilin en
 * la eraropaĝo.
 */
function mrk_eraroj() {
    HTTPRequest('POST', globalThis.mrk_eraro_url, {x:1}, // ni sendu ion per POST por ĉiam havi aktualan liston
        function(data) {
            var json = 
                /** @type { {drv: Array<Array>, snc: Array<Array>, hom: Array<Array>} } */
                (JSON.parse(data));
            const listo = document.getElementById("mrk_sintakso");
            listo.textContent= '';

            const sum = ht_element("summary",{},"Nekongruaj markoj / referencoj");
            listo.append(sum);
            // tri- kaj plipartaj drv@mrk
            if (json.drv && json.drv.length) {
                const e1 = ht_element("p",{},"Markoj de derivaĵoj havu nur du partojn, t.e. "
                + "enhavu nur unu punkton:");
                const ul = ht_element("ul");
                listo.append(e1,ul);

                for (let m of json.drv) {
                    let li = ht_elements([
                        ['li',{},
                            [['a',{href: art_href(m[0]), target: 'precipa'}, m[1]+' ['+m[0]+']']]
                        ]
                    ]);
                    if (li) ul.append(...li);
                }
            }
            // mrk nekongruaj kun drv@mrk
            if (json.snc && json.snc.length) {
                const e2 = ht_element("p",{},"Markoj de sencoj, rimarkoj ktp. kongruu kun la "
                    + "marko de la enhavanta derivaĵo, ĝia prefikso estu la sama:");
                const ul = ht_element("ul");
                listo.append(e2,ul);
                for (let m of json.snc) {
                    let li = ht_elements([
                        ['li',{},
                            [['a',{href: art_href(m[0]), target: 'precipa'}, m[1]+' ['+m[0]+']']]
                        ]
                    ]);
                    if (li) ul.append(...li);
                }
            }
            // homonimoj sen ref-hom
            if (json.hom && json.hom.length) {
                const e2 = ht_element("p",{},"Homonimoj, kiuj ne havas referencon de la tipo 'hom' aŭ duoblaj derivaĵoj:");
                const ul = ht_element("ul");
                listo.append(e2,ul);
                for (let m of json.hom) {
                    let li = ht_elements([
                        ['li',{},[
                            ['a',{href: art_href(m[1]), target: 'precipa'}, m[0]],' [',
                            ['a',{href:  art_href(m[1]), target: 'precipa'}, 'de '+m[1]],' ',
                            ['a',{href:  art_href(m[2]), target: 'precipa'}, 'al '+m[2]],']'
                        ]]
                    ]);
                    if (li) ul.append(...li);
                }
            }

        },
        start_wait,
        stop_wait 
    );    
}


/**
 * Pridemandas la bibliografion kiel JSON de la servilo kaj prezentas ĝin kiel HTML
 * @param {string|undefined} [sort_by] se donita, ni ordigos la bibliografion laŭ tiu kampo (bib,aut,tit)
 */
function bibliogr(sort_by) {
    HTTPRequest('POST', globalThis.bib_json_url, {x:1}, // ni sendu ion per POST por ĉiam havi aktualan liston
        function(data) {
            var json = 
                /** @type { Array.<{bib: string, tit: string}> } */
                (JSON.parse(data));

            if (sort_by) {
                const cmp = new Intl.Collator('eo');
                json.sort( (a, b) => cmp.compare(a[sort_by],b[sort_by]) );
            }

            const enh = document.querySelector(".enhavo");
            enh.textContent= '';
            const dl = ht_element('dl');

            if (json) {

                for (const bib of json) {          
                    // dt: la mallongigo evtl. kun href/url      
                    const dt = ht_element('dt');
                    if (bib.url) {
                        const a = ht_elements([
                            ['a',{href: bib.url, target: '_new'},
                                [['b',{},bib.bib]]
                            ]
                        ]);
                        if (a) dt.append(...a);                  
                    } else {
                        dt.append(ht_element('b',{},bib.bib));
                    }
                    // dd: la detaloj: autoro, titolo ktp.
                    const dd = ht_element('dd');
                    if (bib.aut) dd.append(bib.aut,ht_br());
                    if (bib.trd) dd.append('trad. ',bib.trd,ht_br());
                    dd.append(ht_element('b',{},bib.tit),ht_br());
                    if (bib.ald) dd.append("(",bib.ald,")",ht_br());
                    if (bib.eld) dd.append(bib.eld,ht_br());
                    dl.append(dt,dd);
                } // for
            }; // if json
            const h1 = ht_element('h1',{},'bibliografio');
            enh.append(h1,dl);
        },
        start_wait,
        stop_wait 
    );    
}



/*
function traduku(event,artikolo) {
    event.preventDefault();

    //const params = href.split('?')[1];
    //const art = getParamValue("art",params);    
    load_page("main",redaktilo_url+'?'+artikolo,
        false, () => trad_uwn(artikolo));
    load_page("nav",redaktmenu_url);
}
*/

/**
 * Komencas redaktadon de la aktuala artikolo ŝargante la redaktopaĝon kaj -ilaron.
 * @param {*} href 
 */
function redaktu(href) {
    const params = href.split('?')[1];
    //const art = getParamValue("art",params);
    
    load_page("main",globalThis.redaktilo_url+'?'+params);
    load_page("nav",globalThis.redaktmenu_url);
}

/**
 * Pridemandas la submetitajn redaktojn kaj ties statojn
 * de la aktuala redaktanto (laŭ ties donita retadreso)
 * kaj prezentas ilin en la indekspaĝo.
 */
function viaj_submetoj() {
    if (redaktilo.get_preference("r:redaktanto")) {
        console.debug("+viaj submetoj");
        const nv = document.getElementById("navigado");
        const ds = ht_elements([
            ["details",{id: "submetoj"},
                [
                    ["summary",{},[
                        ["strong",{},"viaj submetoj"]
                    ],'...']
                ]
            ]
        ]);
        if (ds) nv.append(...ds);
        ds[0].addEventListener("toggle", function(event) {
            if (event.target.hasAttribute("open")) {
                redaktilo.submetoj_stato(montru_submeto_staton,start_wait,stop_wait);
                aktualigilo(); // altigu aktualigilon por eventuale vidi la redaktitan artikolon
                                // anstataŭ la bufritan!
            }
        });
    }    
}

/**
 * Montras la staton de submetoj
 * @param { Array<{state,fname,desc,time,result}> } sj - la informoj pri la submetoj de la redaktanto
 */
function montru_submeto_staton(sj) {
    const stat = {
        'nov': '\u23f2\ufe0e', 'trakt': '\u23f2\ufe0e', 
        'erar': '\u26a0\ufe0e', 'arkiv': '\u2713\ufe0e'};
    function decode_result(r) {
        function b64DecodeUnicode(str) {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(atob(str).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
        if (r) {
            return b64DecodeUnicode(r.split(':').slice(-1)).replace('[m ','[');
        } else {
            return '';
        }
    }
    
    if (sj) {
        const ds = document.getElementById("submetoj");
        // forigu antaŭajn...
        for (let ch of ds.querySelectorAll("details")) {
            ds.removeChild(ch);
        }
        // enŝovu novan staton....
        for (let s of sj) {
            var info = ht_elements([
                ["details",{},[
                    ["summary",{},[
                        ["span",{class:'s_stato'},(stat[s.state]||'--')],
                        " ",s.time.slice(0,16)," ",
                        ["a",{href: '/revo/art/'+s.fname+'.html', target: 'precipa'},s.fname]                        
                    ]],
                    ["div",{},[
                        ["i",{},s.desc],["br",{},''],
                        decode_result(s.result)    
                    ]]
                ]]
            ]);
            if (info) ds.append(...info);
        }
    }   
}