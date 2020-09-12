const revo_url = "reta-vortaro.de";
const sercho_url = "/cgi-bin/sercxu-json.pl";

// instalu farendaĵojn por prepari la paĝon: evento-reagoj...
when_doc_ready(function() { 
    console.log("kadro.when_doc_ready...")
    restore_preferences();

    // ni ne kreas la kadron, se ni estas en (la malnova) "frameset"
    if (! top.frames.length) {
        // provizore rezignu pri tia preparo, aparte la aŭtomata enkadrigo de artikoloj
        // enkadrigu();
        if (document.getElementById("navigado")) {
            // anstataŭe ŝargu tiujn du el ĉefa indeks-paĝo
            load_page("main","titolo.html");
            load_page("nav","/revo/inx/_eo.html");   
        }
        
        document.body 
        //document.getElementById("navigado")
            .addEventListener("click",navigate_link);
    
        window
            .addEventListener('popstate', navigate_history);    
    }
});


// se la artikolo ŝargiĝis aparte de la kadro ni aldonu la kadron
function enkadrigu() {

    // preparu la ĉefan parton de la paĝo
    if (document.getElementsByTagName("main").length == 0) {
        var main = make_element("main",{});
        main.append(...document.body.children);
        document.body.appendChild(main);
    } else {
        load_page("main","titolo.html");
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
    if (href.startsWith('../')) {
        return '/revo/' + href.substr(3);
    } else if (href[0] != '/' && ! href.startsWith('http')) {
        return '/revo/' + prefix[target] + href;
    } else if (href.startsWith('/cgi-bin/vokomail.pl')) {
        var query = href.substring(href.search('art='));
        return '/revo/dlg/redaktilo.html?' + query
    } else {
        return href;
    }
}     

function load_page(trg,url,push_state=true) {
    HTTPRequest('GET', url, {},
        function(data) {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(data,"text/html");
            var nav = document.getElementById("navigado");
            var main = document.querySelector("main");

            if (nav && trg == "nav") {
                nav.textContent= '';
                var table = doc.querySelector("table"); 
                adaptu_paghon(table,url);
                nav.append(table);
                //img_svg_bg(); // anst. fakvinjetojn, se estas la fak-indekso - ni testos en la funkcio mem!
            } else if (main && trg == "main") {
                var body = doc.body;
                adaptu_paghon(body,url);
                main.textContent = '';
                main.append(...body.children);
                main.setAttribute("id","w:"+url);
                artikolo.preparu_art();
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
    function fix_img_src() {
        // ĉar la kadra paĝo estas unu ŝtupo pli alta
        // ol la enhavaj paĝoj, la relativajn padojn de bildoj
        // ni devos adapti: ../ -> ./
        for (var i of root_el.getElementsByTagName("img")) {
            var src = i.getAttribute("src");
            if (src.startsWith("..")) i.setAttribute("src",src.substring(1))
        }
    }

    function x_utf8(event) {
        if (document.getElementById("x").checked) {
            var serch_in = event.target;
            t = serch_in.value.replace(/c[xX]/g, "\u0109")
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
            if (t != serch_in.value) {
                serch_in.value = t;
           }
        }
    }

    fix_img_src();

    var filename = url.split('/').pop()
    if (filename == 'titolo.html') {
        // adaptu serĉilon
        var s_form = root_el.querySelector("form[name='f']");
        var sercxata = s_form.querySelector("#sercxata");
        var submit = s_form.querySelector("input[type='submit']");
        s_form.setAttribute("action","");
        submit.addEventListener("click",serchu);
        sercxata.setAttribute("onkeyup","");
        sercxata.addEventListener("keyup",x_utf8);
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

    var serch_in = document.getElementById('sercxata');
    var esprimo = serch_in.value;

    console.log("Ni serĉu:"+esprimo);

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
                var div = make_element("div");
                div.append(make_element("h1",{},lng.titolo));
                var dl = make_element("dl",{},"");
                for (var t of lng.trovoj) {
                    var dt = make_element("dt",{},"");
                    var dd = make_element("dd",{},"");
                    var a1 = make_element("a",{target: "precipa", href: t.art+"#"+t.mrk1},t.vrt1);
                    var a2 = make_element("a",{target: "precipa", href: t.art+"#"+t.mrk2},t.vrt2);
                    dt.append(a1);
                    dd.append(a2);
                    dl.append(dt,dd);
                }
                div.append(dl);
                return div;
            }
        
            console.log("Ni trovis: "+data);
            var json = JSON.parse(data);
            var navigado = document.getElementById("navigado");

            var trovoj = make_element("div",{id: "x:trovoj"},"");
            for (var lng of json) {
                console.log("TRD:"+lng.lng1+"-"+lng.lng2);
                trovoj.append(findings(lng));
            }

            navigado.textContent = "";
            navigado.append(trovoj);
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

function restore_preferences() {
    // tion ni momente povas fari nur, kiam la redaktilo
    // jam ĉeestas, ĉar ni metas valorojn 
    // rekte al DOM:
    // redaktilo.restore_preferences();
    artikolo.restore_preferences();
}

