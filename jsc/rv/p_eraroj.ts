/**
 * (c) 2020 - 2023 ĉe Wolfram Diestel
 * laŭ GPL 2.0
 * 
 * Helfunkcioj por la eraropaĝo.
 */

import * as u from '../u';
import * as x from '../x';
import {agordo as g} from '../u';
import * as s from './shargo';

export namespace eraroj {

    /**
     * Pridemandas erarojn pri mrk-atributoj de la servilo kaj prezentas ilin en
     * la eraropaĝo.
     */
    export function mrk_eraroj() {
        u.HTTPRequest('POST', g.mrk_eraro_url, { x: "1" }, // ni sendu ion per POST por ĉiam havi aktualan liston
            function(data: string) {
                var json = 
                    /** @type { {drv: Array<Array>, snc: Array<Array>, hom: Array<Array>} } */
                    (JSON.parse(data));
                const listo = document.getElementById("mrk_sintakso");
                if (listo) {
                    listo.textContent= '';

                    const sum = u.ht_element("summary",{},"Nekongruaj markoj / referencoj");
                    listo.append(sum);
                    // tri- kaj plipartaj drv@mrk
                    if (json.drv && json.drv.length) {
                        const e1 = u.ht_element("p",{},"Markoj de derivaĵoj havu nur du partojn, t.e. "
                        + "enhavu nur unu punkton:");
                        const ul = u.ht_element("ul");
                        listo.append(e1,ul);
        
                        for (let m of json.drv) {
                            let li = u.ht_elements([
                                ['li',{},
                                    [['a',{href: x.art_href(m[0]), target: 'precipa'}, m[1]+' ['+m[0]+']']]
                                ]
                            ]);
                            if (li) ul.append(...li);
                        }
                    }
                    // mrk nekongruaj kun drv@mrk
                    if (json.snc && json.snc.length) {
                        const e2 = u.ht_element("p",{},"Markoj de sencoj, rimarkoj ktp. kongruu kun la "
                            + "marko de la enhavanta derivaĵo, ĝia prefikso estu la sama:");
                        const ul = u.ht_element("ul");
                        listo.append(e2,ul);
                        for (let m of json.snc) {
                            let li = u.ht_elements([
                                ['li',{},
                                    [['a',{href: x.art_href(m[0]), target: 'precipa'}, m[1]+' ['+m[0]+']']]
                                ]
                            ]);
                            if (li) ul.append(...li);
                        }
                    }
                    // homonimoj sen ref-hom
                    if (json.hom && json.hom.length) {
                        const e2 = u.ht_element("p",{},"Homonimoj, kiuj ne havas referencon de la tipo 'hom' aŭ duoblaj derivaĵoj:");
                        const ul = u.ht_element("ul");
                        listo.append(e2,ul);
                        for (let m of json.hom) {
                            let li = u.ht_elements([
                                ['li',{},[
                                    ['a',{href: x.art_href(m[1]), target: 'precipa'}, m[0]],' [',
                                    ['a',{href: x.art_href(m[1]), target: 'precipa'}, 'de '+m[1]],' ',
                                    ['a',{href: x.art_href(m[2]), target: 'precipa'}, 'al '+m[2]],']'
                                ]]
                            ]);
                            if (li) ul.append(...li);
                        }
                    }
                }

            },
            s.start_wait,
            s.stop_wait 
        );    
    }

}