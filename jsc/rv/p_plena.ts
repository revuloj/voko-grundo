/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import {agordo as g} from '../u';
import * as s from './shargo';
import {sercho} from './sercho';
import {submetoj_stato} from './redk_submeto';
import {preferoj} from '../a/preferoj';
import {get_preference} from './redk_pref';

type SubmetoStato = "nov" | "trakt" | "erar" | "arkiv";
type Submeto = { state: SubmetoStato, fname: string, desc: string, time: string, result: string };

/**
 * Helpfunkcioj por indekspaĝoj _plena, _eo, _ktp k.a.
 */

export namespace eo {
    export function adapto(root_el: Element) {
        root_el.querySelectorAll(".kls_nom").forEach((n) => {
            if (n.tagName != "SUMMARY") {
                n.classList.add("maletendita");

                n.addEventListener("click", function(event) {
                    const trg = event.target;
                    if (trg instanceof Element)
                        (trg as Element).classList.toggle("maletendita");
                });   
            }
        });
    }    
}

export namespace ktp {
    export function adapto(root_el: Element) {
        // hazarda artikolo
        const hazarda = root_el.querySelector("p[id='x:Iu_ajn_artikolo'] a") ||
                        root_el.querySelector("a[href*='hazarda_art.pl'");
        if (hazarda) hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            sercho.hazarda_art();
            event.stopPropagation(); // ne voku navigate_link!
        });       
    }
}

export namespace mx_trd {
    export function adapto(root_el: Element) {
        root_el.querySelectorAll("a[href^='?']").forEach((a) => {
            var href = a.getAttribute("href");
            a.setAttribute("href",g.mx_trd_url+href);
        });
        root_el.querySelectorAll("a[target='_blank']").forEach((a) => {
            a.removeAttribute("target");
        });
    }    
}

export namespace plena {

    export function adaptoj(root_el: Element) {
        // hazarda artikolo
        const hazarda = root_el.querySelector("p[id='x:Iu_ajn_artikolo'] a") ||
                        root_el.querySelector("a[href*='hazarda_art.pl'");
        if (hazarda) hazarda.addEventListener("click", function(event) {
            event.preventDefault();
            sercho.hazarda_art();
            event.stopPropagation(); // ne voku navigate_link!
        });
        // en la lingva indekso metu preferatajn lingvojn supren
        const lingvoj = root_el.querySelector("a[href*='lx_la_']")?.closest('details');
        if (lingvoj) {
            const p = lingvoj.querySelector('p');
            var jam: string[] = [];
            for (let l of preferoj.lingvoj()) {
                let l_ = l.split(/-/)[0];
                if (jam.indexOf(l_)<0) { // evitu duoblaĵojn!
                    let a = lingvoj.querySelector("a[href*='lx_"+l_+"_']");
                    if (a && p) p.prepend(a.cloneNode(true));
                    jam.push(l_);
                }
            }    
        }
    }

    /**
     * Pridemandas la submetitajn redaktojn kaj ties statojn
     * de la aktuala redaktanto (laŭ ties donita retadreso)
     * kaj prezentas ilin en la indekspaĝo.
     */
    export function viaj_submetoj() {
        if (get_preference("r:redaktanto")) {
            console.debug("+viaj submetoj");
            const nv = document.getElementById("navigado");
            const ds = u.ht_elements([
                ["details",{id: "submetoj"},
                    [
                        ["summary",{},[
                            ["strong",{},"viaj submetoj"]
                        ]],'...'
                    ]
                ]
            ]);
            if (ds && nv) nv.append(...ds);
            ds[0].addEventListener("toggle", function(event) {
                const trg = event.target as Element;
                if (trg.hasAttribute("open")) {
                    submetoj_stato(montru_submeto_staton,s.start_wait,s.stop_wait);
                    s.aktualigilo(); // altigu aktualigilon por eventuale vidi la redaktitan artikolon
                                    // anstataŭ la bufritan!
                }
            });
        }    
    }

    /**
     * Montras la staton de submetoj
     * @param sj - la informoj pri la submetoj de la redaktanto
     */
    function montru_submeto_staton(sj: Array<Submeto>) {
        const stat = {
            'nov': '\u23f2\ufe0e', 'trakt': '\u23f2\ufe0e', 
            'erar': '\u26a0\ufe0e', 'arkiv': '\u2713\ufe0e'};

        function decode_result(r: string) {
            function b64DecodeUnicode(str: string) {
                // Going backwards: from bytestream, to percent-encoding, to original string.
                return decodeURIComponent(atob(str).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            }
            if (r) {
                return ("["+b64DecodeUnicode(r.split(':').slice(-1)[0])+"]")
                    .replace('[m ','[');
            } else {
                return '';
            }
        }

        const ds = document.getElementById("submetoj");

        if (sj && ds) {
            // forigu antaŭajn...
            ds.querySelectorAll("details").forEach( (ch) => ds.removeChild(ch) );
            
            // enŝovu novan staton....
            for (let s of sj) {
                const info = u.ht_elements([
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
}