/**
 * Helpfunkcioj por fona ŝargado de paĝoj.
 */

import * as u from '../u';
import {agordo as g} from '../u';
import * as s from './shargo';



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
 * Montras arbitran artikolon. Ni elserĉas hazardan kapvorton en la datumbazo
 * kaj montras la artikolon kaj la kapvorton en de tiu artikolo.
 */
export function hazarda_art() {

   u.HTTPRequest('POST', g.sercho_url, {sercxata: "!iu ajn!"},
       function(data: string) {
           // sukceso!
           var json = 
               /** @type { {hazarda: Array<string>} } */
               (JSON.parse(data));
           const mrk = json.hazarda[0];
           const href = g.art_prefix + mrk.split('.')[0] + '.html#' + mrk;
           if (href) load_page("main",href);
       }, 
       s.start_wait,
       s.stop_wait 
   );
}