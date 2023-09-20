/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import {agordo as g} from '../u';
import * as s from './shargo';

type Bibliogr = { bib: string, aut?: string, trd?: string, tit?: string, url?: string, ald?: string, eld?: string };
type BibOrd = "bib"|"aut"|"tit";

export namespace bibliogr {

    /**
     * Pridemandas la bibliografion kiel JSON de la servilo kaj prezentas ĝin kiel HTML
     * @param bib kodo de bibliografero, al kiu ni saltu post ŝargo
     * @param sort_by se donita, ni ordigos la bibliografion laŭ tiu kampo (bib,aut,tit)
     */
    export function ŝargo(bib: string, sort_by?: BibOrd) {
        u.HTTPRequest('POST', g.bib_json_url, {x: "1"}, // ni sendu ion per POST por ĉiam havi aktualan liston
            function(data: string) {
                var json = (JSON.parse(data) as Array<Bibliogr>);

                if (sort_by) {
                    const cmp = new Intl.Collator('eo');
                    // @ts-ignore
                    json.sort( (a: Bibliogr, b: Bibliogr) => cmp.compare(a[sort_by],b[sort_by]) );
                }

                const enh = document.querySelector(".enhavo");
                if (enh) {
                    enh.textContent= '';

                    // ni ne plu legas el HTML, do manipulu table@id tie ĉi
                    const tbl = enh.closest("table");
                    if (tbl) tbl.id = "x:bibliogr";

                    // kreu difinliston kun la bibliograferoj
                    const dl = u.ht_element('dl');

                    if (json) {
                        for (const bib of json) {          
                            // dt: la mallongigo evtl. kun href/url      
                            const dt = u.ht_element('dt',{id: bib.bib});
                            if (bib.url) {
                                const a = u.ht_elements([
                                    ['a',{href: bib.url, target: '_new'},
                                        [['b',{},bib.bib]]
                                    ]
                                ]);
                                if (a) dt.append(...a);                  
                            } else {
                                dt.append(u.ht_element('b',{},bib.bib));
                            }
                            // dd: la detaloj: autoro, titolo ktp.
                            const dd = u.ht_element('dd');
                            if (bib.aut) dd.append(bib.aut,u.ht_br());
                            if (bib.trd) dd.append('trad. ',bib.trd,u.ht_br());
                            dd.append(u.ht_element('b',{},bib.tit),u.ht_br());
                            if (bib.ald) dd.append("(",bib.ald,")",u.ht_br());
                            if (bib.eld) dd.append(bib.eld,u.ht_br());
                            dl.append(dt,dd);
                        } // for
                    }; // if json
                    const h1 = u.ht_element('h1',{},'bibliografio');
                    enh.append(h1,dl);
                    h1.insertAdjacentHTML('afterend',
                        `<span id="bibliogr_ordo">ordo laŭ: `
                        + `${!sort_by || sort_by=="bib"?"<u>kodo</u>":"<a href='#bib'>kodo</a>"} `
                        + `| ${sort_by=="aut"?"<u>aŭtoro</u>":"<a href='#aut'>aŭtoro</a>"} `
                        + `| ${sort_by=="tit"?"<u>titolo</u>":"<a href='#tit'>titolo</a>"}</span>`);

                    // reago al ordo-ŝanĝo
                    const ordo = document.getElementById("bibliogr_ordo");
                    ordo?.addEventListener("click",(event)=> {
                        const a = (event.target as HTMLElement).closest("a");
                        if (a) {
                            const lau = a.getAttribute("href")?.substring(1) || "bib";

                            // reŝargu bibliogration kun nova ordo
                            ŝargo(bib,lau as BibOrd);
                        }
                    })

                    // rulu al la ĝusta bib-ero
                    const ero = document.getElementById(bib);
                    ero?.scrollIntoView();
                }
            },
            s.start_wait,
            s.stop_wait 
        );    
    }

}