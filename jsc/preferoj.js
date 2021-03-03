
/* jshint esversion: 6 */

const lingvoj_xml = "../cfg/lingvoj.xml";

// difinu ĉion sub nomprefikso "preferoj"
var preferoj = function() {  
    
    var lingvoj = [];
    var dato = Date.now();
    
    function load_pref_lng() {
        HTTPRequest('GET', lingvoj_xml, {},
        function() {
            // Success!
            var parser = new DOMParser();
            var doc = parser.parseFromString(this.response,"text/xml");
            var plist = document.getElementById("pref_lng");
            var alist = document.getElementById("alia_lng");

            var selection = document.getElementById("preferoj")
                .querySelector('input[name="pref_lingvoj"]:checked').value.split('_');
            
            // kolekti la lingvojn unue, ni bezonos ordigi ilin...
            var _lingvoj = {};
            for (var e of doc.getElementsByTagName("lingvo")) {
                var c = e.attributes.kodo;
                if (c.value != "eo") {
                    var ascii = eo_ascii(e.textContent);
                    _lingvoj[ascii] = {lc: c.value, ln: e.textContent};
                }
            }

            for (var l of Object.keys(_lingvoj).sort()) {    
                var lc = _lingvoj[l].lc;
                var ln = _lingvoj[l].ln;
                var li = document.createElement("LI");
                li.setAttribute("data-lng",lc);
                li.setAttribute("data-la",l);
                li.appendChild(document.createTextNode(ln));

                if ( lingvoj.indexOf(lc) < 0 ) {
                    li.setAttribute("title","aldonu");
                    if (ln[0] < selection[0] || ln[0] > selection[1]) 
                        li.classList.add("kasxita");
                    alist.appendChild(li);
                } else {
                    li.setAttribute("title","forigu");
                    plist.appendChild(li);

                    var lk = li.cloneNode(true);
                    lk.setAttribute("class","kasxita");
                    alist.appendChild(lk);
                }
            }
        
            alist.addEventListener("click",aldonuLingvon);
            plist.addEventListener("click",foriguLingvon);
        });     
    }

    function change_pref_lng() {
        var selection = document.getElementById("preferoj")
            .querySelector('input[name="pref_lingvoj"]:checked').value.split('_');

        for (var ch of document.getElementById("alia_lng").childNodes) {
            var la=ch.getAttribute("data-la");
            if (la[0] < selection[0] || la[0] > selection[1]) 
                ch.classList.add("kasxita");
            else
                ch.classList.remove("kasxita");
        }
    }

    /*
    function montru_opciojn() {    
        var opt = make_options();
        var art = document.getElementById(sec_art);
        var h1 = art.getElementsByTagName("H1")[0];   
        h1.appendChild(opt);
    }
    */



    
    function aldonuLingvon(event) {
        var el = event.target; 

        if (el.tagName == "LI") {
            var lng = el.getAttribute("data-lng");
            if (lng) {
                //console.log("+"+lng);
                lingvoj.push(lng);
                dato = Date.now();
            }
            //el.parentElement.removeChild(el);
            document.getElementById("pref_lng").appendChild(el.cloneNode(true));
            el.classList.add("kasxita");
        }
    }

    function foriguLingvon(event) {
        var el = event.target; 

        if (el.tagName == "LI") {
            var lng = el.getAttribute("data-lng");
            if (lng) {
                //console.log("-"+lng);
                // forigu elo la areo pref_lng
                var i = lingvoj.indexOf(lng);
                lingvoj.splice(i, 1);
            }
            el.parentElement.removeChild(el);
            ela = document.getElementById("alia_lng").querySelector("[data-lng='"+lng+"'");
            ela.classList.remove("kasxita");
        }
    }


    function dialog() {
        var pref = document.getElementById("pref_dlg");
        var inx = [['a','b'],['c','g'],['h','j'],['k','l'],['m','o'],['p','s'],['t','z']];

        if (pref) {
            pref.classList.toggle("kasxita");
            store();
        // se ankoraŭ ne ekzistas, faru la fenestrojn por preferoj (lingvoj)
        } else {
            var dlg = make_element("DIV",{id: "pref_dlg", class: "overlay"});
            var div = make_element("DIV",{id: "preferoj", class: "preferoj"});
            //var tit = make_element("H2",{title: "tiun ĉi dialogon vi povas malfermi ĉiam el la piedlinio!"},"preferoj");
            var close = make_button("preta",function() {
                document.getElementById("pref_dlg").classList.add("kasxita");
                store();
                // adaptu la rigardon, t.e. trd-listojn
                preparu_maletendu_sekciojn();            
            },"fermu preferojn");
            close.setAttribute("id","pref_dlg_close");

            var xopt = inx.map(i => { return {id: i.join('_'), label: i.join('..')}; });
            var xdiv = make_element("DIV",{id: "w:ix_literoj", class: "tabs"});
            add_radios(xdiv,"pref_lingvoj",null,xopt,change_pref_lng);
            
            //div.appendChild(make_element("SPAN"));
            xdiv.appendChild(close);
            div.appendChild(xdiv);

            div.appendChild(make_element("H3",{},"preferataj lingvoj"));
            div.appendChild(make_element("H3",{},"aldoneblaj lingvoj"));
            div.appendChild(make_element("UL",{id: "pref_lng"}));
            div.appendChild(make_element("UL",{id: "alia_lng"}));

            //dlg.appendChild(tit)
            dlg.appendChild(div);
        
            // enigu liston de preferoj en la artikolon
            var art = document.getElementById(sec_art);
            var h1 = art.getElementsByTagName("H1")[0];           
            h1.appendChild(dlg);
        
            load_pref_lng();
        } 
    }


    // kreas grupon de opcioj (radio), donu ilin kiel vektoro da {id,label}
    function add_radios(parent,name,glabel,radios,handler) {
        if (glabel) {
            var gl = document.createElement("LABEL");
            gl.appendChild(document.createTextNode(glabel));
            parent.appendChild(gl);   
        }
        var first = true;
        for (var r of radios) {
            var span = document.createElement("SPAN");
            var input = first?
                make_element("INPUT",{name: name, type: "radio", id: r.id, checked: "checked", value: r.id}) :
                make_element("INPUT",{name: name, type: "radio", id: r.id, value: r.id});
            first = false;
            var label = make_element("LABEL",{for: r.id}, r.label);
            span.appendChild(input);
            span.appendChild(label);
            parent.appendChild(span);
        }
        if(handler) {
            parent.addEventListener("click",handler);
        }
    }


    // memoras valorojn de preferoj en la loka memoro de la retumilo
    function store() {
        if (lingvoj.length > 0) {
            var prefs = {};
            prefs["w:preflng"] = lingvoj;
            prefs["w:prefdat"] = dato;
            window.localStorage.setItem("revo_preferoj",JSON.stringify(prefs));     
        }
    }

    // reprenas memorigitajn valorojn de preferoj el la loka memoro de la retumilo
    function restore() {
        var str = window.localStorage.getItem("revo_preferoj");            
        var prefs = (str? JSON.parse(str) : null);

        var nav_lng = navigator.languages || [navigator.language];
        lingvoj = (prefs && prefs["w:preflng"])? prefs["w:preflng"] : nav_lng.slice();
        dato = (prefs && prefs["w:prefdat"])? prefs["w:prefdat"] : Date.now();
    }

    function languages() {
        return lingvoj;
    }


    function date() {
        return dato;
    }

    // eksportu publikajn funkction
    return {
        //store: store,
        restore: restore,
        dialog: dialog,
        languages: languages,
        date: date
    };
    
}();
