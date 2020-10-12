const revo_url = "reta-vortaro.de";
const sercho_url = "/cgi-bin/sercxu-json.pl";
const hazarda_url = "/cgi-bin/hazarda_art.pl";
const titolo_url = "titolo-1c.html";
const inx_eo_url = "/revo/inx/_eo.html";
const sercho_videblaj = 7;

// instalu farendaĵojn por prepari la paĝon: evento-reagoj...
when_doc_ready(function() { 
    console.log("kadro.when_doc_ready...")
    restore_preferences();

    const srch = getParamValue("q");
    if (srch) serchu_q(srch);

    // ni ne kreas la kadron, se ni estas en (la malnova) "frameset"
    if (! top.frames.length) {
        // provizore rezignu pri tia preparo, aparte la aŭtomata enkadrigo de artikoloj
        // enkadrigu();
        if (document.getElementById("navigado")) {
            // anstataŭe ŝargu tiujn du el ĉefa indeks-paĝo
            load_page("main",titolo_url);
            load_page("nav",inx_eo_url);   
        }
        document.getElementById("x:nav_inx_btn")
            .addEventListener("click", function(event) {
                event.preventDefault();
                index_toggle()
            });
        
        document.getElementById("x:nav_srch_btn")
            .addEventListener("click", function(event) {
                event.preventDefault();
                // turnu la revo-fiŝon...
                document.getElementById('x:revo_icon').classList.add('revo_icon_run');
                serchu(event);
            });

        var query = document.getElementById("x:q");
        var cx = document.getElementById("x:cx");

        query.addEventListener("keydown", function(event) {
            if (event.key == "Enter") {  
                // turnu la revo-fiŝon...
                document.getElementById('x:revo_icon').classList.add('revo_icon_run');
                serchu(event);
            }
        });

        query.addEventListener("keyup",function(event){
            //console.debug("which: "+event.which+" code:"+event.code + " key: "+ event.key);
            if (event.key == "x" || event.key == "Shift") { // x-klavo
                if (document.getElementById("x:cx").value == "1") {
                    var s = event.target.value;
                    var s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1
                }
            }
        });

        cx.addEventListener("click", function(event) {
            event.preventDefault();
            var cx = event.target;
            cx.value = 1 - cx.value; 
            document.getElementById('x:q').focus()
        });
    
        document.body 
        //document.getElementById("navigado")
            .addEventListener("click",navigate_link);
    
        window
            .addEventListener('popstate', navigate_history);    
    }
});

function index_toggle(event) {
    document.getElementById("navigado").classList.toggle("eble_kasxita");
    //document.querySelector("main").classList.toggle("kasxita");
}

function index_spread() {
    document.getElementById("navigado").classList.remove("eble_kasxita");
}

function index_collapse() {
    document.getElementById("navigado").classList.add("eble_kasxita");
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
    if (history.state && history.state.inx) {
        console.log(history.state);
        // ni bezonas unue revo-1b.js:
        load_page("nav","/revo/inx/"+history.state.inx.substring(2)+".html",false);
    } else {
        load_page("nav","/revo/inx/_eo.html");
    }
}

// vd. https://wiki.selfhtml.org/wiki/HTML/Tutorials/Navigation/Dropdown-Men%C3%BC
function nav_toggle() {
    var menu = document.getElementById("navigado");
    if (menu.style.display == "") {
        menu.style.display = "block"
    } else {
        menu.style.display = ""
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
        href.startsWith('http://') && href.substring('http://'.length-1,revo_url.length) != revo_url
        || href.startsWith('https://') && href.substring('https://'.length-1,revo_url.length) != revo_url
        ) {
        return "ext";
    } else if (trg == "precipa") {
        return "main"
    } else if (trg == "indekso") {
        return "nav"
    } else if (!trg) {
        var cnt = a_el.closest("nav,main");
        if (cnt) return cnt.tagName.toLowerCase(); 
    };
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
        return '/revo/dlg/'+titolo_url
    } else if (href.startsWith('../')) {
        return '/revo/' + href.substr(3);
    } else if (href.startsWith('tz_') || href.startsWith('vx_')) {
        return '/revo/tez/' + href;
    } else if (href[0] != '/' && ! href.startsWith('http')) {
        return '/revo/' + prefix[target] + href;
    } else if (href.startsWith('/cgi-bin/vokomail.pl')) {
        var query = href.substring(href.search('art='));
        return '/revo/dlg/redaktilo-1c.html?' + query
    } else {
        return href;
    }
}     

function load_page(trg,url,push_state=true) {
    function update_hash() {
        if (url.indexOf('#') > -1) {
            var hash = url.split('#').pop();
        } else {
            hash = '';
        }
        window.location.hash = hash;    
        // ALDONU: ankoraŭ document.getElementById(hash).scrollIntoView()...    
    }

    function load_page_nav(doc,nav) {
        nav.textContent= '';
        var table = doc.querySelector("table"); 
        try {
            var filename = url.split('/').pop().split('.')[0];
            table.id = "x:"+filename;
            adaptu_paghon(table,url);    
        } catch(error) {
            console.error(error);
        }

        nav.append(table);
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

            artikolo.preparu_art();                      
            var s_artikolo = document.getElementById("s_artikolo");
            // refaru matematikajn formulojn, se estas
            if (s_artikolo &&
                typeof(MathJax) != 'undefined' && MathJax.Hub) {

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
        index_collapse();
    }

    HTTPRequest('GET', url, {},
        function(data) {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/html");
            var nav = document.getElementById("navigado");
            var main = document.querySelector("main");

            if (nav && trg == "nav") {
                load_page_nav(doc,nav,update_hash);

                //img_svg_bg(); // anst. fakvinjetojn, se estas la fak-indekso - ni testos en la funkcio mem!
            } else if (main && trg == "main") {
                load_page_main(doc,main,update_hash);
            }                    

            //if (push_state)
            //    history.pushState({
            //        inx: nav.firstElementChild.id,
            //        art: main.id
            //        },
            //        null,
            //    main.id.substring(2));
            // provizore ne ŝanĝu la URL de la paĝo
            if (push_state) {
                var nf = nav.firstElementChild? nav.firstElementChild.id : null;
                history.pushState({
                    inx: nf,
                    art: main.id
                    },
                    null,
                    null);
            }                
    });
}


function adaptu_paghon(root_el, url) {
    // adapto de atributoj img-atributoj
    function fix_img() {
        for (var i of root_el.getElementsByTagName("img")) {
            var src = i.getAttribute("src");
            //if (src.startsWith("..")) i.setAttribute("src",src.substring(1));

            // aldonu klason por rerencoj
            if (src.endsWith('.gif'))
                if (! i.classList.length) {
                    // referencilo
                    var src = i.getAttribute("src");
                    if (src) {
                        var nom = src.split('/').pop().split('.')[0];
                        var svg = {
                            dif: "r_dif", difino: "r_dif", 
                            sin: "r_sin", ant: "r_ant",
                            sub: "r_sub", super: "r_super",
                            prt: "r_sub", malprt: "r_super",
                            vid: "r_vid", vidu: "r_vid",
                            hom: "r_vid",
                            lst: "r_lst", listo: "r_lst",
                            ekz: "r_ekz"                            
                        }[nom]
                        if (nom) i.classList.add("ref",svg);
                    }                    
                }                    
        }
    }

    fix_img();

    var filename = url.split('/').pop()
    if ( filename.startsWith('_eo.') ) {
        for (var n of root_el.querySelectorAll(".kls_nom")) {
            if (n.tagName != "summary") {
                n.classList.add("maletendita");

                n.addEventListener("click", function(event) {
                    event.target.classList.toggle("maletendita");
                })    
            }
        }
    }
    else if ( filename.startsWith('_ktp.') ) {
        // hazarda artikolo
        const hazarda = root_el.querySelector("p[id='x:Iu_ajn_artikolo'] a");
        hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            hazarda_art();
            event.stopPropagation(); // ne voku navigate_link!
        })        
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
                // turnu la revo-fiŝon...
                document.getElementById('w:revo_icon').classList.add('revo_icon_run');
                serchu(event);
            }
        });
        query.addEventListener("keyup",function(event){
            if (event.key == "x" || event.key == "Shift") { // x-klavo 
                if (document.getElementById("w:cx").value == "1") {
                    var s = event.target.value;
                    var s1 = ascii_eo(s);
                    if (s != s1)
                        event.target.value = s1
                }
            }
        });

        cx.addEventListener("click", function(event) {
            event.preventDefault();
            var cx = event.target;
            cx.value = 1 - cx.value; 
            document.getElementById('w:q').focus()
        })

        s_form.querySelector("button[value='revo']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                // turnu la revo-fiŝon...
                document.getElementById('w:revo_icon').classList.add('revo_icon_run');
                serchu(event)
            });

        s_form.querySelector("button[value='ecosia']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                var q = document.getElementById('w:q').value
                location.href = 'https://www.ecosia.org/search?q='+encodeURIComponent(q+' site:reta-vortaro.de')
            });

        s_form.querySelector("button[value='anaso']")
            .addEventListener("click", function(event) {
                event.preventDefault();
                var q = document.getElementById('w:q').value
                location.href = 'https://duckduckgo.com?q='+encodeURIComponent(q+' site:reta-vortaro.de')
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
        })
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
    var href = el? el.getAttribute("href") : null;

    if (el && href) {
        var href = el.getAttribute("href");
        var target = ref_target(el);
    
        if (href && target && target != "int") {
            event.preventDefault();
            if (target == "ext") {
                window.open(href);
            } else if (target == "main") {
                load_page(target,normalize_href(target,href));
                /*
                $('#s_artikolo').load(href, //+' body>*'                            
                    preparu_art
                );   
                */  
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
    var state = event.state;

    console.log("event.state:"+state);

    // FARENDA: ni komparu kun la nuna stato antaŭ decidi, ĉu parton
    // ni devos renovigi!
    if (state) {
        if (state.inx) load_page("nav","/revo/inx/"+state.inx.substring(2)+".html",false);
        if (state.art) load_page("main",state.art.substring(2),false);    
    }
}            

function load_xml(art) {
    /*
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
        */
}


function serchu(event) {
    event.preventDefault();
    var serch_in = event.target.closest("form")
        .querySelector('input[name=q]');
    var esprimo = serch_in.value;
    if (esprimo.indexOf('%') < 0 && esprimo.indexOf('_') < 0 && esprimo.length >= 3)
        esprimo += '%' // serĉu laŭ vortkomenco, se ne jam enestas jokeroj, kaj
                        // almenaŭ 3 literoj

    location.search = "?q="+encodeURIComponent(esprimo);
    serchu_q(esprimo);
}

function serchu_q(esprimo) {

    //console.debug("Ni serĉu:"+esprimo);

    HTTPRequest('POST', sercho_url, {sercxata: esprimo},
        function(data) {

            // la rezulto estas listo de objektoj po lingvo kiu enhavas po unu trov-liston:
            // [
            //     {
            //    "lng1":"eo","lng2":"de","titolo":"esperante (de)", "trovoj": [
            //         {"art":"cxeval","mrk1":"cxeval.0o","vrt1":"ĉevalo","mrk2":"lng_de","vrt2":"Gaul, Pferd, Ross, Springer"} 
            //     ]}
            // ]

            function findings(lng) {
                var div = make_elements([
                    ["div",{},
                        [["h1",{},lng.titolo || "["+lng.lng1+"]"]]
                    ]
                ])[0];
                var dl = make_element("dl");

                // ĉe lng1=eo pro variaĵoj povas okazi, ke la ordo ne estas
                // perfekta, do ni reordigu
                var trvj = [];
                if (lng.lng1 == "eo") {
                    trvj = lng.trovoj.sort(function(a,b) {
                        // ĉu localeCompare por eo funkcias ĉie, kio pri iOS, Windows...?
                        return a.vrt1.localeCompare(b.vrt1,'eo');
                    })
                } else {
                    trvj = lng.trovoj; // lasu la ordon por aliaj lingvoj
                }

                // nun ankoraŭ ni kungrupigas erojn kun sama "vrt1"
                //trvj = trvj.reduce((r, a) => {
                //    console.debug("a", a);
                //    console.debug('r', r);
                //    r[a.vrt1] = [...r[a.vrt1] || [], a];
                //    return r;
                //}, {});

                var n=0;
                var atr = {};
                for (var t of trvj) {
                    if (++n > sercho_videblaj && trvj.length > sercho_videblaj+1) {
                        // enmetu +nn antaŭ la unua kaŝita elemento
                        if (n - sercho_videblaj == 1) {
                            var pli = make_elements([
                                ["dt",{},
                                    [["a",{href: "#"},"(+"+(trvj.length-sercho_videblaj)+")"]]
                                ],
                                ["dd"]
                            ]);
                            // funkcio por malkovri la reston...
                            pli[0].addEventListener("click",function(event) {
                                var dl = event.target.closest("dl");
                                for (ch of dl.childNodes) {
                                    ch.classList.remove("kasxita")
                                }
                                event.target.closest("dt").classList.add("kasxita");
                                var p = dl.parentElement.querySelector("p");
                                if (p) p.classList.remove("kasxita")
                            })
                            dl.append(...pli);
                        }                        
                        atr = {class: "kasxita"}
                    }
                    var dt_dd = make_elements([
                        ["dt",atr,
                            [["a",{target: "precipa", href: t.art+".html#"+t.mrk1},t.vrt1]]
                        ],
                        ["dd",atr,
                            [["a",{target: "precipa", href: t.art+".html#"+t.mrk2},t.vrt2]]
                        ]
                    ]);
                    dl.append(...dt_dd);
                }
                div.append(dl);

                // atentigo pri limo
                if (lng.max == lng.trovoj.length) {
                    const noto = make_element("p",{class: "kasxita"},"noto: por trovi ankoraŭ pli, bv. precizigu la serĉon!");
                    div.append(noto);
                }
                return div;
            }

            function stop_search(btn_id) {
                var s_btn = document.getElementById(btn_id);
                if (s_btn) s_btn.classList.remove('revo_icon_run');
            }

            //console.debug("Ni trovis: "+data);

            index_spread();

            var json = JSON.parse(data);

            // debug Unicode issues...
            //console.debug("data: "+data);
            //console.debug("stng: "+JSON.stringify(json));

            var inx_enh = document.getElementById("navigado").querySelector(".enhavo");

            //var s_form = serch_frm(esprimo);
            //var submit = s_form[0].querySelector("input[type='submit']");
            //submit.addEventListener("click",serchu);

            // se troviĝis ekzakte unu, iru tuj al tiu paĝo
            if (json.length == 1 && json[0].trovoj.length == 1) {
                var t = json[0].trovoj[0];
                load_page("main","/revo/art/"+t.art+".html#"+t.mrk1);
            }

            // montru la trovojn de la serĉo
            var trovoj = make_element("div",{id: "x:trovoj"},"");
            for (var lng of json) {
                //console.debug("TRD:"+lng.lng1+"-"+lng.lng2);
                trovoj.append(findings(lng));
            }

            inx_enh.textContent = "";
            //inx_enh.append(...s_form,trovoj);
            inx_enh.append(trovoj);

            // haltigu la revo-fiŝon
            stop_search('x:revo_icon');
            stop_search('w:revo_icon');
        }
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

    HTTPRequest('POST', hazarda_url, {senkadroj: "1"},
        function(data) {
            // Success!
            const parser = new DOMParser();
            const doc = parser.parseFromString(data,"text/html");     
            const a = doc.querySelector("a[target='precipa']");
            const href = a.getAttribute("href");
            if (href) load_page("main",href);
        });
}

function restore_preferences() {
    // tion ni momente povas fari nur, kiam la redaktilo
    // jam ĉeestas, ĉar ni metas valorojn 
    // rekte al DOM:
    // redaktilo.restore_preferences();
    artikolo.restore_preferences();
}

