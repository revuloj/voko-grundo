/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/


import * as u from '../u';
import {agordo as g} from '../u';
import {preferoj} from '../a/preferoj';

import * as x from '../x';
import {revo_listoj, start_wait, stop_wait} from './shargo';

import {Sercho, Lingvo} from './sercho';

  /**
   * Ŝargas tradukproponojn el Universala Vort-Reto (UWN)
   * @param {Event} event 
   */
export function trad_uwn(event: Event, xmlarea: x.XmlRedakt) {
    event.preventDefault();
    const s_trd = document.getElementById('r:trd_elekto');
    if (s_trd) s_trd.textContent = '';

    const sercho = xmlarea.aktuala_kap; //'hundo';

    // prezento de traduklisto kiel HTML-dd-elemento
    // enhavanta la tradukojn kiel ul-listo
    function dl_dd(lng: Lingvo, trd: string[]): Element {
      return <Element>u.ht_list(trd,'ul',{}, function(t: string) {
          //var t = s; // la traduko
          const li = u.ht_element('li');
          if (t.slice(0,2) == '?;') {
            li.append(u.ht_element('span',{class: 'dubinda'},'?'));
            t = t.slice(2);
          }
          li.append(u.ht_element('span',{class: 'trd'},t));
          return li;
      });
    } 

    const srch = new Sercho();
    if (sercho) srch.serchu_uwn(sercho, function(json: any) {
      if (json) {
          // butonojn por aldoni ni montras nur, se (sub)drv|(sub)snc estas
          // elektita en la redaktilo...
          if (s_trd) s_trd.prepend('El ',u.ht_element('a',{href: g.uwn_url},'Universala Vortreto'),
            ', kontrolu ĝustecon antaŭ aldoni!');          

          for (let t in json) {
              const tv = json[t];
              // montru serĉ-rezultojn kiel html summary/details 
              const details = u.ht_details(
                tv.trd.eo.map((s: string) => s.replace(/\?;/,'?:\u00a0'))
                  .join(', ')||t, '',
                function(d: Element) {
                  // esp-a difino
                  const eo = (tv.dif && tv.dif.length)? tv.dif : ['-/-'];
                  const pe = u.ht_elements([
                      ['p',{},[
                          ['em',{},'eo: '],
                          ...eo
                      ]]
                  ]);
                  if (pe) d.append(...pe);

                  // angla difino
                  const en = tv.dsc? tv.dsc : ['-/-'];
                  const pa = u.ht_elements([
                      ['p',{},[
                        ['em',{},'en: '], 
                        en ]]
                  ]);
                  if (pa) d.append(...pa);

                  // tradukojn prezentu kiel difinlisto (dl)
                  var nkasxitaj = 0;
                  const dl = <Element>u.ht_dl(
                    tv.trd,

                    // tiu funkcio revokiĝas por ĉiu trovita en la json-listo lingvo 
                    // kun listo de tradukoj
                    function(lng: Lingvo, trd: string[], dt: Element, dd: Element) {
                      // lingvonomo
                      const ln = revo_listoj.lingvoj.codes[lng];

                      // ni ne montras nekonatajn lingvojn, ĉar enmeto
                      // en la artikolon ne havas sencon aktuale...
                      if (ln && lng != 'eo') {
                        // atributoj (class, style...)
                        // ne montru e-ajn tradukojn en la listo (ili estas jam en summary)
                        // komence kaŝu ĉiujn krom la preferataj lingvoj
                        var cls: string[] = [];
                        if (preferoj.lingvoj().indexOf(lng) < 0) {
                          cls.push('kasxita');
                          nkasxitaj++;
                        }

                        // se jam ekzistas tradukoj por tiu lingvo montru tion
                        // per CSS
                        //if (has_trd(lng)) cls.push('tradukita');

                        var atr: u.AtributSpec = {};
                        if (cls.length) atr = {class: cls.join(' ')};

                        // DT
                        u.ht_attributes(dt,atr);
                        dt.append('['+lng+'] ' +ln);

                        // DD: tradukoj estas listo, kiun ni aldonas en dd
                        atr.lang = lng; 
                        u.ht_attributes(dd,atr);

                        dd.append(dl_dd(lng,trd));
                      } // ...if ln                      
                    }, // u.ht_dl callback
                    true); // true = sorted (keys=lng)

                    // aldonu eventon por reagi al +-butonoj
                    dl.addEventListener('click', function(event) {
                      const trg = event.target as HTMLInputElement;
                      if (trg.value == 'plus') {
                        const dd = trg.closest('dd');

                        if (dd) {
                          // la traduko troivĝas rekte antaŭ la butono!
                          const sp = trg.previousSibling;
                          const lng = dd.getAttribute('lang');
                          if (sp && lng) {
                            console.log('aldonu ['+lng+'] '+sp.textContent);
                            xmlarea.aldonu_trad_lng(lng,sp.textContent||lng);  
                          }
                        }

                        // montru per hoketo, ke ni nun havas la tradukon en XML
                        const li = trg.closest('li');
                        if (li) {
                          li.classList.remove('aldonebla');
                          li.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
                          u.ht_remove(li.querySelector('button'));  
                        }
                      }
                    });
                    
                    // aldonu (+nn) - por videbligi la kasxitajn tradukojn
                    if (nkasxitaj) {
                      const pli = u.ht_pli(nkasxitaj);
                      if (pli) dl.append(...pli);  
                    }

                    d.append(dl);
                }
              ); // u.ht_details
              if (details && s_trd) s_trd.append(details);

          }  // for t in json

          // aldonu hoketojn kaj +-butonojn...
          trad_ebloj(xmlarea);
          
          //t_red.transiro("tradukante");
          x.show("r:tab_tradukoj",'collapsed');    
      } else {
        if (s_trd) s_trd.append("Nenio troviĝis.");
        x.show("r:tab_tradukoj",'collapsed');    
      }
    },
    start_wait,
    stop_wait
    );
  }

  /**
   * Montras depende de elektita (sub)drv|(sub)snc la jam ekzistantajn
   * tradukojn kaj +-butonojn por eblaj aldonoj
   * @memberof redaktilo
   * @inner
   */
export function trad_ebloj(xmlarea: x.XmlRedakt) {
    const elekto = document.getElementById('r:trd_elekto');
    if (!elekto) return;

    const _ele_ = xmlarea.aktiva;
    const drv_snc = (_ele_ && _ele_.el && (_ele_.el == 'snc' || _ele_.el == 'drv'));
    //const drv_snc = ('drv|snc'.indexOf(_ele_?.el.slice(-3)) > -1);

    // se iu (sub)drv|(sub)snc estas elektita ni montras +-butonojn kaj hoketojn...
    if (elekto.querySelector('details')) {
      if ( drv_snc ) {
        // forigu la noton pri drv/snc-elekto...
        const noto = elekto.querySelector('p.noto');
        if (noto) noto.remove();

        // eltrovu kiujn tradukojn ni havas en la aktuala teksto
        xmlarea.kolektu_ĉiujn_tradukojn();

        elekto.querySelectorAll('dd').forEach( (dd) => {
          const lng = dd.getAttribute('lang');

          if (lng) dd.querySelectorAll('li').forEach( (li) => {
            const trd = li.querySelector('.trd');
            const t = trd?.textContent || undefined;
            // se drv/snc estas elektita kaj la traduko ankoraŭ 
            // ne troviĝas tie, ni permesu aldoni ĝin
            if ( ! xmlarea.tradukoj()[lng] 
              || ! xmlarea.tradukoj()[lng].find((e: string) => u.compareXMLStr(e,t) )
              ) {
              // d.push('\u00a0'); // nbsp
              li.classList.add('aldonebla');

              if (!li.querySelector('button')) {
                li.append(u.ht_element('button',{
                  value: 'plus', 
                  title: 'aldonu al XML-(sub)drv/snc'},
                  '+'));    
              }
              u.ht_remove(li.querySelector('span.ekzistas'));

            } else {
              // montru per hoketo, ke ni jam havas la tradukon en XML
              li.classList.remove('aldonebla');
              if (! li.querySelector('span.ekzistas')) {
                li.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
              }
              u.ht_remove(li.querySelector('button'));
            }

          }); // forEach li...

          // krome ni elstarigu lingvojn, kiuj jam havas tradukon por
          // eviti tro facilan aldonon!
          const dt = dd.previousSibling;
          if (lng && dt instanceof Element) {
            const e = dt as Element;
            if (xmlarea.tradukoj()[lng]) {
              e.classList.add('ekzistas');
              u.ht_remove(dt.querySelector('span.aldonebla'));
              if (! dt.querySelector('span.ekzistas'))
                e.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
            } else {
              e.classList.remove('ekzistas');
              u.ht_remove(e.querySelector('span.ekzistas'));
              if (! e.querySelector('span.aldonebla'))
                e.append(u.ht_element('span',{class: 'aldonebla'},'\u2026'));
            }
          }
     
        }); // forEach dd..

      // ĉe elekto de (sub)art|xml ni montras nur la tradukojn..., t.e. ni
      // forigas ilin, se ili restis de antaŭa elekto
      } else {

        elekto.prepend(u.ht_element('p',{class: 'noto'},'Elektu (sub)derivaĵon aŭ (sub)sencon '
          + 'en la redaktilo, poste vi povas aldoni tie novajn tradukojn el la '
          + 'malsupraj faldlistoj per la +-butonoj.'));

        elekto.querySelectorAll('dd li').forEach( (li) => {
          u.ht_remove(li.querySelector('.ekzistas'));
          u.ht_remove(li.querySelector('button'));
        });

        elekto.querySelectorAll('dt').forEach( (dt) => {
          dt.classList.remove('ekzistas');
          u.ht_remove(dt.querySelector('span.ekzistas'));
          u.ht_remove(dt.querySelector('span.aldonebla'));
        });

      } // if drv_snc
    } // if.. details..else..

  }