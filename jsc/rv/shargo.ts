/**
 * Helpfunkcioj por fona ŝargado de paĝoj.
 */

// import * as u from '../u';
// import {agordo as g} from '../u';
import * as x from '../x';
import {agordo as g} from '../u/global';

import {RevoListoj} from '../x/xlisto';


/**
 * Ni bezonas ŝargi paĝojn el kelkaj moduloj (ekz-e sercho.ts), sed ĝi estas tro specifa por ŝovi ĝin
 * mem el kadro.ts al submodulo. Momente mi ne vidas kiel dissolvi la interdependecon kaj tial
 * difinas variablon tie ĉi, kiun ni ligas en kadro.ts, sed kiu povas esti uzata de aliaj moduloj
 * sen devi meti rektan krucreferencon inter kadro.ts kaj shargo.ts
 */
type ŜargoFunkcio = (trg: string, url: string, push_state?: boolean, whenLoaded?: Function)=>void;
export var ŝargu_paĝon: ŜargoFunkcio;
export function diffn_ŝargu_paĝon(lp: ŜargoFunkcio) {
    ŝargu_paĝon = lp;
}

export const revo_listoj = new RevoListoj();


/**
 * Eblas doni en la Revo-URL por rekta aliro artikolon/derivaĵon/sencon ekzemple per #hund.0o.dombesto
 * Tion ni transformas al /revo/art/hund.html#hund.0o.dombesto por ebligi navigi tien.
 * @param hash - la valoro de loka URL-marko, ekz-e #hund.0o.dombesto
 */
export function hash2art(hash: string) {
    if (hash) {
        const art = hash.substring(1).split('.')[0];
        if (art)
            return (
                g.art_prefix + art + '.html' + hash
            );
    }
}


/**
 * Por ebligi ŝargi freŝajn paĝojn ni altigas la version, kiu
 * estas alpendigata al GET, tiel evitante ricevi paĝojn el la loka bufro.
 */
export function aktualigilo() {
    const akt = window.localStorage.getItem("aktualigilo");
    const akt1 = (((akt && parseInt(akt,10)) || 0) + 1) % 30000; // +1, sed rekomencu ĉe 0 post 29999
    // Se ni uzus sessionStorage ni post remalfermo de la retumilo denove
    // ricevus pli malnovajn paĝ-versiojn, do ni uzas localStorage por memori la versi-numeron.
    window.localStorage.setItem("aktualigilo",akt1.toString());
}

/**
 * Traktas saltojn ene de paĝo / al certa loko en paĝo
 */
export function interna_salto(url: string, history: History) {
    let hash: string|undefined;
    if (url.indexOf('#') > -1) {
        hash = <string>url.split('#').pop();
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

/** 
* Kiam ni fone ŝargas ion ni montras tion per turniĝanta revo-fiŝo
* (la serĉbutono)
*/
export function start_wait() {
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
export function stop_wait() {
   var s_btn = document.getElementById('x:revo_icon');
   if (s_btn) s_btn.classList.remove('revo_icon_run');
   s_btn = document.getElementById('w:revo_icon');
   if (s_btn) s_btn.classList.remove('revo_icon_run');
}


/**
 * vd. https://wiki.selfhtml.org/wiki/HTML/Tutorials/Navigation/Dropdown-Men%C3%BC
 */
export function nav_toggle() {
    const menu = document.getElementById("navigado");
    if (menu) {
        if (menu.style.display == "") {
            menu.style.display = "block";
        } else {
            menu.style.display = "";
        }    
    }
}

/**
 * Faldas-malfaldas la navigan panelon (tiu kun la indeksoj, serĉo...)
 */
export function refaldu_nav() {
    const nav = document.getElementById("navigado");
    if (nav) nav.classList.toggle("eble_kasxita");
    x.toggle("x:nav_kashu_btn");
    x.toggle("x:nav_montru_btn");
    //document.querySelector("main").classList.toggle("kasxita");
}

/**
 * Malfaldas la navigan panelon
 */
export function malfaldu_nav() {
    const nav = document.getElementById("navigado");
    if (nav) nav.classList.remove("eble_kasxita");
    x.show("x:nav_kashu_btn");
    x.hide("x:nav_montru_btn");
}

/**
 * Faldas la navigan panelon. Tiel estas pli da spaco por la artikolo
 * aŭ redaktado.
 */
export function faldu_nav() {
    const nav = document.getElementById("navigado");
    if (nav) nav.classList.add("eble_kasxita");
    x.show("x:nav_montru_btn");
    x.hide("x:nav_kashu_btn");
}


