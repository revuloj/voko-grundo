/* (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import {agordo as g} from '../u/global';
import * as x from '../x';

type LngSpec = {lc: string, ln: string}; // ISO-kodo, lingvonomo

//const lingvoj_xml = "../cfg/lingvoj.xml";

// difinu ĉion sub nomprefikso "preferoj"

const sec_art = "s_artikolo";


type Seanco = {
    tez_videbla?: boolean
}

/**
 * La nomspaco 'preferoj' enhavas funkciojn kaj variablojn por
 * konservi, legi, ŝanĝi la preferojn de la uzanto.
 * @namespace preferoj
 */
export namespace preferoj {  
    
    // la listo de la preferataj lingvoj
    var _lingvoj: string[] = [];
    
    export var seanco: Seanco = {};
    var _dato = Date.now();
    
    /**
     * Ŝargas la lingvo-liston de la servilo, dividas ilin en 
     * preferataj kaj aliaj kaj preparas la prezenton kiel
     * listojn en la prefero-adapata dialogo
     * @memberof preferoj
     * @inner
     */
    function legu_pref_lng() {
        u.HTTPRequest('GET', g.lingvoj_xml, {},
        function(data: string) {
            // Success!
            const parser = new DOMParser();
            const doc = parser.parseFromString(data,"text/xml");
            const plist = document.getElementById("pref_lng");
            const alist = document.getElementById("alia_lng");
            // malplenigu la listojn antaŭ evtl. replenigo
            plist.textContent = '';
            alist.textContent = '';

            // ni montras ĉiam nur parton de la lingvolisto
            // laŭ alfabeto - kiu literintervalo do estas elektita?
            const ichecked = document.getElementById("preferoj")
                .querySelector('input[name="pref_lingvoj"]:checked') as HTMLInputElement;
            const selection = ichecked.value.split('_');
            
            // ni kolektu la lingvojn unue, ĉar ni bezonos ordigi ilin...
            let _lngvj: { [ascii: string]: LngSpec } = {};
            for (let e of Array.from(doc.getElementsByTagName("lingvo"))) {
                const c: Attr = e.attributes.getNamedItem('kodo'); // jshint ignore:line
                if (c.value != "eo") {
                    const ascii = x.eo_ascii(e.textContent);
                    _lngvj[ascii] = {lc: c.value, ln: e.textContent};
                }
            }

            // nun ni trakuras ordigitan lingvoliston
            for (var l of Object.keys(_lngvj).sort()) {    
                var lc = _lngvj[l].lc; // lingvokodo
                var ln = _lngvj[l].ln; // lingvonomo
                var li = document.createElement("LI");
                li.setAttribute("data-lng",lc);
                li.setAttribute("data-la",l);
                li.appendChild(document.createTextNode(ln));

                // preferoj._lingvoj enhavas preferatajn lingvojn,
                // ĉiujn aliajn ni listigas por povi alelekti ilin
                if ( _lingvoj.indexOf(lc) < 0 ) {
                    li.setAttribute("title","aldonu");
                    if (ln[0] < selection[0] || ln[0] > selection[1]) 
                        li.classList.add("kasxita");
                    alist.appendChild(li);
                } else {
                    // preferatajn lingvojn ni montras aparte
                    li.setAttribute("title","forigu");
                    plist.appendChild(li);

                    var lk = <Element>li.cloneNode(true);
                    lk.setAttribute("class","kasxita");
                    alist.appendChild(lk);
                }
            }
        
            alist.addEventListener("click",aldonu_lingvon);
            plist.addEventListener("click",forigu_lingvon);
        });     
    }

    /**
     * Kaŝas / malkaŝas  preferatajn lingvojn post
     * unuopa adapto en la listo de aliaj lingvoj.
     * @memberof preferoj
     * @inner
     */
    function ŝanĝu_pref_lng() {
        const checked = document.getElementById("preferoj") 
            .querySelector('input[name="pref_lingvoj"]:checked') as HTMLInputElement;
        const selection = checked.value.split('_');

        for (const e of Array.from(document.getElementById("alia_lng").children)) {
                const la = e.getAttribute("data-la");

                if (la[0] < selection[0] || la[0] > selection[1]) 
                    e.classList.add("kasxita");
                else
                    e.classList.remove("kasxita");
        };
    }

    /**
     * Reagas al evento por aldoni lingvon al preferataj
     * @memberof preferoj
     * @inner
     * @param {Event} event 
     */
    function aldonu_lingvon(event: Event) {
        var el = event.target as Element; 

        if (el.tagName == "LI") {
            var lng = el.getAttribute("data-lng");
            if (lng) {
                //console.log("+"+lng);
                _lingvoj.push(lng);
                _dato = Date.now();
            }
            //el.parentElement.removeChild(el);
            document.getElementById("pref_lng").appendChild(el.cloneNode(true));
            el.classList.add("kasxita");
        }
    }

    /**
     * Reagas al evento por forigi lingvon el la preferataj
     * @memberof preferoj
     * @inner
     * @param {Event} event 
     */
    function forigu_lingvon(event: Event) {
        var el = event.target as Element; 

        if (el.tagName == "LI") {
            var lng = el.getAttribute("data-lng");
            if (lng) {
                //console.log("-"+lng);
                // forigu elo la areo pref_lng
                var i = _lingvoj.indexOf(lng);
                _lingvoj.splice(i, 1);
            }
            el.parentElement.removeChild(el);
            const ela = document.getElementById("alia_lng").querySelector("[data-lng='"+lng+"'");
            ela.classList.remove("kasxita");
        }
    }

    export function dlg_konservo(sePreta?: Function) {
        //document.getElementById("pref_dlg").classList.add("kasxita");
        const dlg = document.getElementById("pref_dlg");
        if (dlg instanceof HTMLDialogElement) dlg.close();
        konservu();
        if (sePreta) sePreta();
    }

    /**
     * Prezentas dialogon kun ĉiuj difinitaj lingvoj kaj la momente
     * preferataj por ebligi adapti tiujn.
     * @memberof preferoj
     * @param {Function} sePreta 
     */
    export function dialog(sePreta?: Function) {
        const pref = document.getElementById("pref_dlg");
        if (pref instanceof HTMLDialogElement) {
/*            
            pref.classList.toggle("kasxita");
            konservu();
        // se ankoraŭ ne ekzistas, faru la fenestrojn por preferoj (lingvoj)
        } else {
            */

            const btn_preta = document.getElementById("pref_dlg_preta");
            if (btn_preta) {
                btn_preta.addEventListener("click", function() {
                    dlg_konservo(sePreta);
                    /*
                    const dlg = document.getElementById("pref_dlg");
                    if (dlg instanceof HTMLDialogElement) dlg.close();
                    konservu();
                    if (sePreta) sePreta();
                    */
                });
            }

            // ni montras parton de la lingvo laŭ la elektitaj literoj de la alfabeto
            // a..b, c..g ktp.
            const xdiv = document.getElementById("w:ix_literoj");
            if (xdiv) xdiv.addEventListener("click",ŝanĝu_pref_lng);

            /*
            var dlg = u.ht_element("DIV",{id: "pref_dlg", class: "overlay"});
            var div = u.ht_element("DIV",{id: "preferoj", class: "preferoj"});
            //var tit = u.ht_element("H2",{title: "tiun ĉi dialogon vi povas malfermi ĉiam el la piedlinio!"},"preferoj");
            var close = <Element>u.ht_button("preta", function() {
                document.getElementById("pref_dlg").classList.add("kasxita");
                konservu();
                // adaptu la rigardon, t.e. trd-listojn
                //preparu_maletendu_sekciojn();
                sePreta();
            },"fermu preferojn");
            close.setAttribute("id","pref_dlg_close");

            var inx = [['a','b'],['c','g'],['h','j'],['k','l'],['m','o'],['p','s'],['t','z']];
            var xopt = inx.map(i => { return {id: i.join('_'), label: i.join('..')}; });
            var xdiv = u.ht_element("DIV",{id: "w:ix_literoj", class: "tabs"});
            aldonu_elektilojn(xdiv,"pref_lingvoj",null,xopt,ŝanĝu_pref_lng);
            
            //div.appendChild(make_element("SPAN"));
            xdiv.appendChild(close);
            div.appendChild(xdiv);

            div.appendChild(u.ht_element("H3",{},"preferataj lingvoj"));
            div.appendChild(u.ht_element("H3",{},"aldoneblaj lingvoj"));
            div.appendChild(u.ht_element("UL",{id: "pref_lng"}));
            div.appendChild(u.ht_element("UL",{id: "alia_lng"}));

            //dlg.appendChild(tit)
            dlg.appendChild(div);
        
            // enigu liston de preferoj en la artikolon
            var art = document.getElementById(sec_art);
            var h1 = art.getElementsByTagName("H1")[0];           
            h1.appendChild(dlg);
        */

            legu_pref_lng();

            pref.show();
        } 
    }


    /**
     * Kreas grupon de opcioj (radio), donu 
     * ilin kiel vektoro da {id,label}. Ni uzas tion por grupigi la
     * lingvoj laŭ alfabeto ĉar ni ne povas montri ciujn samtempe
     * @memberof preferoj
     * @inner
     * @param parent - la parenca elemento por la opcioj
     * @param name - la nevidebla nomo (atributo 'name') 
     * @param glabel - la videbla nomo de la grupo
     * @param radios - listo de HTML-id por la opcioj
     * @param handler - reago al elekto-eventoj
     */
    /*
    function aldonu_elektilojn(parent: Element, name: string, glabel: string|null,
        radios: Array<{ id: string, label: string }>, handler: EventListenerOrEventListenerObject) {
        if (glabel) {
            const gl = document.createElement("LABEL");
            gl.appendChild(document.createTextNode(glabel));
            parent.appendChild(gl);   
        }
        let first = true;
        if (radios) {
            for (const r of radios) {
                const span = document.createElement("SPAN");
                const input = first?
                    u.ht_element("INPUT",{name: name, type: "radio", id: r.id, checked: "checked", value: r.id}) :
                    u.ht_element("INPUT",{name: name, type: "radio", id: r.id, value: r.id});
                first = false;
                const label = u.ht_element("LABEL",{for: r.id}, r.label);
                span.appendChild(input);
                span.appendChild(label);
                parent.appendChild(span);
            }    
        }
        if(handler) {
            parent.addEventListener("click",handler);
        }
    }*/

    /**
     * Konservas valorojn de preferoj en la loka memoro de la retumilo.
     * @memberof preferoj
     */    
    function konservu() {
        if (_lingvoj.length > 0) {
            var prefs: { [key: string]: any} = {};
            prefs["w:preflng"] = _lingvoj;
            prefs["w:prefdat"] = _dato;
            window.localStorage.setItem("revo_preferoj",JSON.stringify(prefs));     
        }
    }


    
    /**
     * Reprenas memorigitajn valorojn de preferoj el la 
     * loka memoro de la retumilo.
     * @memberof preferoj
     */
    export function relegu() {
        const str = window.localStorage.getItem("revo_preferoj");            
        const prefs = (str? JSON.parse(str) : null);

        const nav_lng = navigator.languages || [navigator.language];
        _dato = (prefs && prefs["w:prefdat"])? prefs["w:prefdat"] : Date.now();
        const _lngvj = (prefs && prefs["w:preflng"])? prefs["w:preflng"] : nav_lng.slice();
        // ni ankoraŭ forigos evtl. landokodojn el lingvoj aŭ duoblaĵojn
        _lngvj.forEach((lc: string) => {
            const _ = lc.indexOf('-');
            lc = (_>0)? lc.substring(0,_) : lc;
            if (_lingvoj.indexOf(lc) < 0) _lingvoj.push(lc);
        });
    }

    
    /**
     * Memoras staton de la seanco - forgesota 
     * kiam la seanco finiĝas/retumilo fermiĝas
     * @memberof preferoj
     * @inner
     */
    function konservu_seancon() {
        window.sessionStorage.setItem("revo_seanco",JSON.stringify(seanco));     
    }


    /**
     * Reprenas memorigitajn valorojn de seanco el 
     * la seanco-memoro de la retumilo.
     * @memberof preferoj
     * @inner
     */
    function restarigu_seancon() {
        var str = window.sessionStorage.getItem("revo_seanco");            
        seanco = (str? JSON.parse(str) : null);
    }

    /**
     * Redonas la kompletan lingvoliston.
     * @memberof preferoj
     * @returns la lingvolisto
     */
    export function lingvoj() {
        return _lingvoj;
    }

    /**
     * Redonas la daton de la preferoj. (En la unuaj tagoj ni ebligas
     * adapti lingvojn en la traduklistoj de la sekcioj, poste plu nur en la piedlinio.)
     * @memberof preferoj
     * @returns la dato kiam ni metis la preferojn
     */
    export function dato() {
        return _dato;
    }
};
