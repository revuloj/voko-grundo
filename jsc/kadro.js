
/* jshint esversion: 6 */

const version="1f";
const debug=false; //true; // ni bezonas provizore aparte por vidi erarojn en iOS Webkit, kie ni ne havas "console"
const revo_url = "reta-vortaro.de";
const art_prefix = "/revo/art/";
const sercho_url = "/cgi-bin/sercxu-json-"+version+".pl";
//const hazarda_url = "/cgi-bin/hazarda_art.pl";
const titolo_url = "titolo-"+version+".html";
const redaktilo_url = "redaktilo-"+version+".html";
const redaktmenu_url = "redaktmenu-"+version+".html";
//const inx_eo_url = "/revo/inx/_eo.html";

const inx_eo_url = "/revo/inx/_plena.html";
const mx_trd_url = "/cgi-bin/mx_trd.pl";
const http_404_url = "/revo/dlg/404.html";
const sercho_videblaj = 7;

// statoj kaj transiroj
var t_nav  = new Transiroj("nav","start",["ĉefindekso","subindekso","serĉo","redaktilo"]);
var t_main = new Transiroj("main","start",["titolo","artikolo","red_xml","red_rigardo"]);
var t_red  = new Transiroj("red","ne_redaktante",["ne_redaktante","redaktante","sendita"]);


// helpofunkcio, por instali klak-reagojn
function onclick(id,reaction) {
    var nb;
    if (nb = document.getElementById(id)) {
        nb.addEventListener("click", function(event) {
            event.preventDefault();
            if (debug) console.debug("clicked: "+id);
            reaction(event);
            //event.stopPropagation();
        });
    }
}


/*
    navigado laŭ a href=... estas traktata per navigate_link()...
*/

// instalu farendaĵojn por prepari la paĝon: evento-reagoj...
when_doc_ready(function() { 


    // dom_console();
    console.log("kadro.when_doc_ready...");

    // sendu erarojn al aside#console - ŝaltu supre debug=true!
    if (debug) {
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


    // difinu agojn por transiroj al cel-statoj
    //t_nav.alvene("ĉefindekso",()=>{ load_page("nav",inx_eo_url) })
    //t_nav.alvene("serĉo",(event)=>{ serchu(event) });
    //t_nav.alvene("serĉo",serchu,(event)=>{event.key == "Enter"});

    
    const srch = getParamValue("q");
    if (srch) serchu_q(srch);
    
    ////t_nav.alvene("serĉo",()=>{ const s=getParamValue("q"); serchu_q(s) },getParamValue("q"));

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
            } else if (t_main == "red_rigardo") {
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

    t_red.alvene("ne_redaktante",()=>{
        // ni devos fari tion en "alvene", ĉar
        // load_page kontrolas t_red.stato por scii ĉu montri "x:redakt_btn"
        load_page("main",titolo_url); // ĉu pli bone la ĵus redaktatan artikolon - sed povus konfuzi pro malapero de ŝangoj?
        load_page("nav",inx_eo_url);
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
        // provizore rezignu pri tia preparo, aparte la aŭtomata enkadrigo de artikoloj
        // enkadrigu();
        if (document.getElementById("navigado")) {
            // anstataŭe ŝargu tiujn du el ĉefa indeks-paĝo
            load_page("main",titolo_url);
            load_page("nav",inx_eo_url);   
        }

        onclick("x:nav_montru_btn",index_spread);
        onclick("x:nav_kashu_btn",index_collapse);

        //onclick("x:nav_start_btn",()=>{ load_page("nav",inx_eo_url) });
        //t_nav.je("x:nav_start_btn","click","ĉefindekso");
        onclick("x:nav_start_btn",()=>{ 
            load_page("nav",inx_eo_url);
            //t_nav.transiro("ĉefindekso") 
        });

        //onclick("x:titol_btn",()=>{ load_page("main",titolo_url) });
        onclick("x:titol_btn",()=>{ 
            load_page("main",titolo_url);
            //t_main.transiro("titolo") 
        });
        //t_main.je("x:titol_btn","click","titolo")

        //onclick("x:nav_srch_btn",(event)=>{ serchu(event) })
        onclick("x:nav_srch_btn",(event)=>{ 
            serchu(event);
            // transiro aŭ lanĉu la serĉon aŭ evtl. sekvu ĝin...
        });
        //t_nav.je("x:nav_srch_btn","click","serĉo");

        /*
        onclick("x:redakt_btn",()=>{ 
            show("r:tab_txmltxt",'collapsed');
            hide("r:tab_trigardo",'collapsed');
            //...
        });
        */
        onclick("x:redakt_btn",()=>{ 
            if (t_nav.stato != "redaktilo")
                load_page("nav",redaktmenu_url);

            // ni bezonas eble relegi la redaktilan kadron kaj
            // fine de tio relegi la artikolon!...
            if (t_main.stato != "red_xml" && t_main.stato != "red_rigardo")
                load_page("main",redaktilo_url);

            // metu staton "red_xml" se ni venos de red_rigardo,
            // aliokaze ni faros tion en load_page - tie ĉi estus tro frue tiuokaze
            if (t_main.stato == "red_rigardo")
                t_main.transiro("red_xml");
        });
        //t_main.je("x:redakt_btn","click","red_xml");

        /*
        onclick("x:rigardo_btn",()=>{ 
            hide("r:tab_txmltxt",'collapsed');
            show("r:tab_trigardo",'collapsed');
            redaktilo.rantaurigardo();
        });
        */
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
                    var s = event.target.value;
                    var s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;
                }
            // keycode fix for older Android Chrome 
            } else if ((event.keyCode == 0 || event.keyCode == 229) 
                && document.getElementById("x:cx").value == "1") {
                var s = event.target.value;
                var key = s.charAt(s.length-1);
                //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                if (key == "x" || key == "X") {
                    var s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1;    
                }
            }
        });
    
        document.body 
        //document.getElementById("navigado")
            .addEventListener("click",navigate_link);

        // tio vokiĝas, i.a. kiam la uzanto reŝargas la paĝon aŭ fermas la redaktilon.
        window
            .addEventListener('beforeunload', aktualigilo);
        window // por iOS...:
            .addEventListener('pagehide', aktualigilo);
            
        window
            .addEventListener('popstate', navigate_history);    

        // kondiĉe, ke serĉo-parametro (q) estis donita en URL ni tuj sercos
        // ĉu ni bezonos ankoraŭ originan staton "start" anstataŭ tuj "ĉefindekso"?
        t_nav.transiro("ĉefindekso","serĉo"); // ĉu parametro ?q= estis donita, devus testi la stato-maŝino per la pli supra difino kun gardo

    }
});

function aktualigilo() {
    // Por ebligi ŝargi freŝajn paĝojn ni altigas la version, kiu
    // estas alpendigata al GET, tiel evitante ricevi paĝojn el la loka bufro.
    // Se ni uzus sessionStorage ni post remalfermo de la retumilo denove
    // ricevus pli malnovajn paĝ-versiojn, do ni uzas localStorage
    const akt = window.localStorage.getItem("aktualigilo");
    const akt1 = (((akt && parseInt(akt)) || 0) + 1) % 30000; // +1, sed rekomencu ĉe 0 post 29999
    window.localStorage.setItem("aktualigilo",akt1);
}

function index_toggle() {
    document.getElementById("navigado").classList.toggle("eble_kasxita");
    toggle("x:nav_kashu_btn");
    toggle("x:nav_montru_btn");
    //document.querySelector("main").classList.toggle("kasxita");
}

function index_spread() {
    document.getElementById("navigado").classList.remove("eble_kasxita");
    show("x:nav_kashu_btn");
    hide("x:nav_montru_btn");
}

function index_collapse() {
    document.getElementById("navigado").classList.add("eble_kasxita");
    show("x:nav_montru_btn");
    hide("x:nav_kashu_btn");
}

// se la artikolo ŝargiĝis aparte de la kadro ni aldonu la kadron
function enkadrigu() {

    // preparu la ĉefan parton de la paĝo
    if (document.getElementsByTagName("main").length == 0) {
        var main = make_element("main",{});
        main.append(...document.body.children);
        document.body.appendChild(main);
    } else {
        load_page("main",titolo_url);
    }

    // preparu la navigo-parton de la paĝo
    if (document.getElementsByTagName("nav").length == 0) {
        var nav = make_element("nav",{});
        var div = make_element("div",{id: "navigado"});
        nav.appendChild(div);
        document.body.appendChild(nav);
    }

    // rekreu la indekson laŭ la historio aŭ ŝargu la centran eo-indekson
    if (history.state && history.state.nav) {
        console.log(history.state);
        // ni bezonas unue revo-1b.js:
        load_page("nav",history.state.nav,false);
    } else {
        load_page("nav",inx_eo_url);
    }
}

// vd. https://wiki.selfhtml.org/wiki/HTML/Tutorials/Navigation/Dropdown-Men%C3%BC
function nav_toggle() {
    var menu = document.getElementById("navigado");
    if (menu.style.display == "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "";
    }
}

/*
Navigante ni devas distingi plurajn kazojn:

1. int: temas pri interna referenco (href="#...")
2. ext: temas pri alekstera referenco (href="http(s)://iu-retejo...")
3. nav: temas pri referenco al alia indekso, t.e. inx: target="", art: target="indekso"    
4. main: temas pri referenco al artikolo/ĉefpaĝo, t.e. inx: target="precipa", art: target=""    
    
*/

function ref_target(a_el) {
    var href = a_el.getAttribute("href");
    var trg = a_el.getAttribute("target");   

    if (! href) {
        console.error("mankas atributo href ĉe elemento "+a_el.tagName+" ("+a_el.id+")");
        return;
    }

    if (href.startsWith('#')) {
        return "int";
    } else if (
        href.startsWith('http://') && href.substring('http://'.length-1,revo_url.length) != revo_url ||
        href.startsWith('https://') && href.substring('https://'.length-1,revo_url.length) != revo_url
        ) {
        return "ext";
    } else if (href.indexOf("/cgi-bin/vokomail.pl")>=0) {
        return "red"; // redakti...
    } else if (trg == "precipa") {
        return "main";
    } else if (trg == "indekso") {
        return "nav";
    } else if (!trg) {
        var cnt = a_el.closest("nav,main");
        if (cnt) return cnt.tagName.toLowerCase(); 
    }
}

/* En la kazoj ref_target = main | nav, ni adaptos la originajn URL-ojn por Ajax:
1. ../xxx -> /revo/xxx
2. aliaj relativaj (t.e. ne ^/ aŭ ^http) -> /revo/art/xxxx | /revo/inx/xxx
3. /cgi-bin/vokomail.pl?art=xxx -> /revo/dlg/redaktilo.html?art=xxx
4. aliaj absolutaj (t.e. ^/ aŭ http) ni lasu
*/

function normalize_href(target, href) {
    // ĉu estas fidinde uzi "target" tie ĉi aŭ ĉu ni uzu "source"?
    const prefix = { main: "art/", nav: "inx/"};
    if (href.endsWith('titolo.html')) {
        return '/revo/dlg/'+titolo_url;
    } else if (href.startsWith('../')) {
        return '/revo/' + href.substr(3);
    } else if (href.startsWith('tz_') || href.startsWith('vx_')) {
        return '/revo/tez/' + href;
    } else if (href[0] != '/' && ! href.startsWith('http')) {
        return '/revo/' + prefix[target] + href;
    /*} else if (href.startsWith('/cgi-bin/vokomail.pl')) {
        var query = href.substring(href.search('art='));
        return '/revo/dlg/redaktilo-1c.html?' + query
        */
    } else {
        return href;
    }
}   

function start_wait() {
    var s_btn = document.getElementById('x:revo_icon');
    if (s_btn) s_btn.classList.add('revo_icon_run');
    s_btn = document.getElementById('w:revo_icon');
    if (s_btn) s_btn.classList.add('revo_icon_run');
}

function stop_wait(btn_id) {
    var s_btn = document.getElementById('x:revo_icon');
    if (s_btn) s_btn.classList.remove('revo_icon_run');
    s_btn = document.getElementById('w:revo_icon');
    if (s_btn) s_btn.classList.remove('revo_icon_run');
}

function load_error(request) {
    if (request.status == 404)
        load_page("main",http_404_url);
}

/*
function index_home_btn(parent) {
    // aldonu butonon por reveni al ĉefa indekso
    const ibtn = make_icon_button("i_start",()=>{load_page("nav",inx_eo_url)})
    ibtn.setAttribute("title","al la enira indekso")
    if (parent.children && parent.children[0].tagName != "A")
        parent.children[0].prepend(ibtn);   
    else
        parent.prepend(ibtn); 
}
*/

function load_page(trg,url,push_state=true,whenLoaded) {
    function update_hash() {
        var hash;
        if (url.indexOf('#') > -1) {
            hash = url.split('#').pop();
        } else {
            hash = '';
        }
        // evitu, ĉar tio konfuzas la historion:... window.location.hash = hash;
        if (hash && (h=document.getElementById(hash))) {
            h.scrollIntoView();
            history.replaceState(history.state,null,
                location.origin+location.pathname+"#"+encodeURIComponent(hash));
        } else if (!hash) {
            history.replaceState(history.state,null,
                location.origin+location.pathname);
        }
    }

    function load_page_nav(doc,nav) {
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
            // aldonu butonon por reveni al ĉefa indekso
            /*
            if (! filename.startsWith("_plena") ) {
                show("x:nav_start_btn");
                hide("x:titol_btn"); // ne montru ambaŭ samtempe por ŝpari spacon!
            } else {
                hide("x:nav_start_btn");
                if (! document.getElementsByTagName("main")[0].id.startsWith("w:titolo") )
                    show("x:titol_btn"); // montru nur se ne jam montriĝas titolpaĝo!
            }
            */

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
        }
        index_spread();

        // laŭbezone ankoraŭ iru al loka marko
        update_hash();
    }

    function load_page_main(doc,main) {
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
                load_page_nav(doc,nav,update_hash);

                if (url == redaktmenu_url)
                    t_nav.transiro("redaktilo"); 
                else if (url == inx_eo_url)
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
                load_page_main(doc,main,update_hash);
                if (url == titolo_url)
                    t_main.transiro("titolo"); 
                else if (url.startsWith(redaktilo_url))
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
                history.pushState(hstate,null,null);
            }  
            
            // faru, kion poste faru donita kiel argumento
            if (whenLoaded) whenLoaded();
    },  
    start_wait,
    stop_wait,
    load_error
    );
}


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
    }
    else if ( filename.startsWith('mx_trd.') ) {
        var a;
        for (a of root_el.querySelectorAll("a[href^='?']")){
            var href = a.getAttribute("href");
            a.setAttribute("href",mx_trd_url+href);
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
                var s = event.target.value;
                var key = s.charAt(s.length-1);
                //alert("Android dbg: "+event.keyCode+ "s: "+s+" kcd: "+kCd);
                if (key == "x" || key == "X") {
                    var s1 = ascii_eo(s);
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

    /*
function load_xml(art) {

    $("body").css("cursor", "progress");
    $.get('/revo/xml/'+art+'.xml','text')
        .done(function(data) {
                $("#rxmltxt").val(data);
        })
        .fail (function(xhr, textStatus, errorThrown) {
            console.error(xhr.status + " " + xhr.statusText);                
            if (xhr.status == 404) {
                var msg = "Pardonu, la dosiero ne troviĝis sur la servilo: ";
                alert( msg );
            } else {
                var msg = "Pardonu, okazis netandita eraro: ";
                alert( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
            }
        })
        .always(function() {
            $("body").css("cursor", "default");
        })
       
}
 */

function serchu(event) {
    event.preventDefault();
    var serch_in = event.target.closest("form")
        .querySelector('input[name=q]');
    var esprimo = serch_in.value;
    if (esprimo) {
        if (esprimo.indexOf('%') < 0 && esprimo.indexOf('_') < 0 && esprimo.length >= 3)
        esprimo += '%'; // serĉu laŭ vortkomenco, se ne jam enestas jokeroj, kaj
                        // almenaŭ 3 literoj

        // evitu ŝanĝi .search, ĉar tio refreŝigas la paĝon nevolite: 
        // location.search = "?q="+encodeURIComponent(esprimo);
        history.pushState(history.state,null,location.origin+location.pathname+"?q="+encodeURIComponent(esprimo));
        serchu_q(esprimo);
    }
}

function serchu_q(esprimo) {

    const srch = new Sercho();
    srch.serchu(esprimo, function() {

            // la rezulto estas listo de objektoj po lingvo kiu enhavas po unu trov-liston:
            // [
            //     {
            //    "lng1":"eo","lng2":"de","titolo":"esperante (de)", "trovoj": [
            //         {"art":"cxeval","mrk1":"cxeval.0o","vrt1":"ĉevalo","mrk2":"lng_de","vrt2":"Gaul, Pferd, Ross, Springer"} 
            //     ]}
            // ]
            function make_pli(n_kasxitaj) {
                var pli = make_elements([
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

            function findings(lng) {
                var div = make_elements([
                    ["div",{},
                        [["h1",{},lng]]
                    ]
                ])[0];
                var dl = make_element("dl");

                // ĉe lng=eo ni ordigu                
                const trvj = srch.trovoj(lng);
                console.log(trvj);
                // nun ankoraŭ ni kungrupigas erojn kun sama "vrt1"
                //trvj = trvj.reduce((r, a) => {
                //    console.debug("a", a);
                //    console.debug('r', r);
                //    r[a.vrt1] = [...r[a.vrt1] || [], a];
                //    return r;
                //}, {});

                var atr = {};
                for (var n=0; n<trvj.length; n++) {
                    var t = trvj[n];
                    if (n+1 > sercho_videblaj && trvj.length > sercho_videblaj+1) {
                        // enmetu +nn antaŭ la unua kaŝita elemento
                        if (n - sercho_videblaj == 1) {
                            var pli = make_pli(trvj.length - sercho_videblaj);
                            dl.append(...pli);
                        }                        
                        atr = {class: "kasxita"};
                    }

                    const dt = make_elements([
                        // tradukojn oni momente ne povas ne povas rekte alsalti,
                        // do ni provizore uzas t.eo.mrk anst. t[l].mrk
                        ["dt",atr,
                            [["a",{target: "precipa", href: t.h}, t.v]]
                        ]])[0];

                    // dum redakto ni aldonas transprenan butonon por kreado de referencoj
                    if (t_red.stato == "redaktante") {
                        const ref_btn = make_element("button",{
                            class: "icon_btn r_vid", 
                            value: mrk,
                            title:"transprenu kiel referenco"
                        });
                        dt.append(ref_btn);
                    }                            

                    // trovitaj tradukoj de tiu e-a vorto
                    const dd = make_element("dd",atr);
                    for ( let [lng,trd] of Object.entries(t.t) ) { // ni trairu ĉiujn lingvojn....
                        // tradukojn oni momente ne povas rekte alsalti,
                        // do ni (provizore?) uzas href (el drv-mrk) 
                        // PLIBONIGU: do ni ne bezonas liston de unulingvaj tradukoj,
                        // sed povos kunigi ĉion en unu objekto!
                        const a = make_elements([
                                ["a",{target: "precipa", href: t.h},
                                    [["code",{}, lng + ":"], trd]
                                ],["br"]
                            ]);    
                        //}
                        dd.append(...a);                            
                    } // for l ...
                    dl.append(dt,dd);
                }
                div.append(dl);

                // atentigo pri limo
                //if (lng.max == lng.trovoj.length) {
                //    const noto = make_element("p",{class: "kasxita"},"noto: por trovi ankoraŭ pli, bv. precizigu la serĉon!");
                //    div.append(noto);
                //}
                return div;
            }

            function nofindings() {
                return make_elements([
                    ["p",{},
                        [["strong",{},"Nenio troviĝis!"]]
                    ]
                ])[0];
            }

            index_spread();
            const nav = document.getElementById("navigado");
            const inx_enh = nav.querySelector(".enhavo");
            const trovoj = make_element("div",{id: "x:trovoj"},"");

            // se nenio troviĝis...
            if (! srch.malplena() ) {
                trovoj.append(nofindings());

            // se troviĝis ekzakte unu kaj ni ne redaktas, iru tuj al tiu paĝo
            } else if ( srch.sola() && t_red.stato != "redaktante" ) {
                var t = json[0].trovoj[0];
                load_page("main",srch.unua().href);
            }

            trovoj.append(findings('eo'));

            // ordigu laŭ lingvo (4a kampo)
            //const trd = group_by(3,json.trd);
            //console.log(trd); return;
//
            //// montru la trovojn de la serĉo
            //for (var lng of json) {
            //    //console.debug("TRD:"+lng.lng1+"-"+lng.lng2);
            //    trovoj.append(findings(lng));
            //}

            // aldonu la reagon por ref-enmetaj butonoj
            if (t_red.stato == "redaktante") {
                for (btn of trovoj.querySelectorAll("button.r_vid")) {
                    btn.addEventListener("click",(event)=>{                         
                        // kiun ref-mrk ni uzu - depende de kiu butono premita
                        const refmrk = event.target.value;
                        // revenu de trovlisto al redakto-menuo
                        load_page("nav",redaktmenu_url,true,
                            () => {
                                document.getElementById("r:refmrk").value = refmrk;
                                redaktilo.fs_toggle("r:ref");
                            });        
                    });
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



    /*
    
    $.getJSON("/cgi-bin/sercxu-json.pl",
        { 
            sercxata: $("#serchteksto").val() 
        })
    .done(function(data) {
        //alert( "Data Loaded: " + data );
        for (tr of data) {
            cosole.log(tr);
        }
    });
    */
}

function hazarda_art() {

    HTTPRequest('POST', sercho_url, {sercxata: "!iu ajn!"},
        function(data) {
            // sukceso!
            var json = JSON.parse(data);
            const mrk = json.hazarda[0];
            const href = art_prefix+mrk.split('.')[0]+'.html#'+mrk;
            if (href) load_page("main",href);
        }, 
        start_wait,
        stop_wait 
    );
}

function redaktu(href) {
    const params = href.split('?')[1];
    //const art = getParamValue("art",params);
    
    load_page("main",redaktilo_url+'?'+params);
    load_page("nav",redaktmenu_url);
}

function viaj_submetoj() {
    if (redaktilo.get_preference("r:redaktanto")) {
        console.debug("+viaj submetoj");
        const nv = document.getElementById("navigado");
        const ds = make_elements([
            ["details",{id: "submetoj"},
                [
                    ["summary",{},[
                        ["strong",{},"viaj submetoj"]
                    ],'...']
                ]
            ]
        ]);
        nv.append(...ds);
        ds[0].addEventListener("toggle", function(event) {
            if (event.target.hasAttribute("open")) {
                redaktilo.submetoj_stato(montru_submeto_staton,start_wait,stop_wait);
                aktualigilo(); // altigu aktualigilon por eventuale vidi la redaktitan artikolon
                                // anstataŭ la bufritan!
            }
        })
    }    
}

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
        };
        if (r) {
            return b64DecodeUnicode(r.split(':').slice(-1)).replace('[m ','[');
        } else {
            return '';
        }
    }
    
    if (sj) {
        const ds = document.getElementById("submetoj");
        // forigu antaŭajn...
        for (ch of ds.querySelectorAll("details")) {
            ds.removeChild(ch);
        }
        // enŝovu novan staton....
        for (s of sj) {
            var info = make_elements([
                ["details",{},[
                    ["summary",{},[
                        ["span",{class:'s_stato'},(stat[s.state]||'--')],
                        " ",s.time.substr(0,16)," ",
                        ["a",{href: '/revo/art/'+s.fname+'.html', target: 'precipa'},s.fname]                        
                    ]],
                    ["div",{},[
                        ["i",{},s.desc],["br",{},''],
                        decode_result(s.result)    
                    ]]
                ]]
            ]);
            ds.append(...info);
        }
    }   
}