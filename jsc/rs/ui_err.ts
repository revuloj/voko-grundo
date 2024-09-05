
/* 
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

import * as u from '../u';
import * as x from '../x';
import { DOM, UIElement, List, type ListOpcioj, Dialog } from '../ui';
import { XmlRedakt } from '../x';

import { show_xhr_error } from './ui_dlg';
import { HTMLError, type Valoroj } from './sxabloniloj';

interface XEraro extends Partial<x.LinePos> { id?: string, cls?: string, msg: string };

type EraroListOpcioj = ListOpcioj & {
    a_click?: (event: PointerEvent) => void;
}

// console.debug("Instalante la erar- kaj kontrolfunkciojn...");

export class Erarolisto extends List {

    static aprioraj: EraroListOpcioj = {
        a_click: undefined,
        listero: "li", // CSS-elektilo por listeroj
        komparo: (a: string, b: string) => parseInt(a) - parseInt(b)
    };

    static aldonu_eraron(element: HTMLElement|string, err: XEraro) {
        const el = super.obj(element);
        if (el instanceof Erarolisto) {
            el.aldonu_eraron(err);
        }
    }

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj, Erarolisto.aprioraj);

        this._on({
            "click": (event: PointerEvent) => {
                const trg = event.target;
                if (trg instanceof HTMLElement && trg.tagName == "A") this._trigger("a_click",event,null);
                else this._click(event);
            }
            /*
            "click li": this._click,
            "click a": function(event) { this._trigger("a_click",event,null); } 
            */
        });
    };

    aldonu_eraron(err: XEraro) { // err: {line: <l>, pos: <p>, msg: <text>}
        /*
        var l = err.line || 0; // linio
        var p = err.pos || 0;  // posicio
        var v = l? (p? l+":"+p : l) : "=)"; // atributo value: kombino de linio kaj pozico aŭ ridulo
        var t = v? "linio "+v : ""; // atributo title
        var item =  '<li value="' + v + (t? '" title="' + t :"") + (err.id?' id="'+err.id+'"':'') + '">'  + err.msg  + '</li>';
        */
        if (err && err.msg) {
            const html = new HTMLError().html(err as unknown as Valoroj);
            const n_ = err.line? err.line : -1; //parseInt(err.line) : -1;
            const ero = u.ht_html(html);

            if (ero) super.aldonu(n_,ero);
/*
            const aldonita = Array.from(this.element.querySelectorAll("li")).some((l) => {
                if (parseInt(l.getAttribute("value") as string) > n_) {
                    l.insertAdjacentHTML("beforebegin",html);
                // $("#kontrolo_list").fadeIn("fast");
                    console.debug("enmetas "+err.line+" antaŭ "+n_);
                    return true;
                }
            });
            // se ni ne jam enŝovis ie, ni alpendigas en la fino
            if ( !aldonita ) {
                this.element.insertAdjacentHTML("beforeend",html);
                console.debug("enmetas "+err.line+" ĉe fino");
                // $("#kontrolo_list").fadeIn("fast");
            }
            */
       }
    };

    aldonu_liston(entries: XEraro[]) {
        for (var i=0; i<entries.length; i++) {
            this.aldonu_eraron(entries[i]);
        }
    };

    
    _click(event: PointerEvent) {
        // la atributo value de li donas la linion en la XML-teksto,
        // la atributo title de li donas line:pos
        const el = event.target;
        if (el instanceof HTMLElement) {
            const line_pos = el.closest("li")?.getAttribute("value");
            const xr = XmlRedakt.xmlredakt("#xml_text");
            if (xr && line_pos) {
                xr.iru_al(line_pos);
                // okazigu eventon poziciŝanĝo ĉe Artikolo...
                const ps: any = xr.opcioj.poziciŝanĝo;
                if (ps instanceof Function) ps();         
            }
        }
    };

};

export function xmlkontrolo() {
    const xr = XmlRedakt.xmlredakt("#xml_text");
    const xml_text = xr?.teksto; //$("#xml_text").val();

  
    if (! xml_text ) {
        alert('Vi ankoraŭ ne ŝargis artikolon por kontroli!');
        return;
    }
 
    u.HTTPRequest('post', "revo_kontrolo", { xml: xml_text },
          function(data: string) { 
              // se la listo de eraroj estas malplena la sintakso estas bona
              // malplena listo sendiĝas kiel [] aŭ [{}]
              let json = JSON.parse(data);
              if ( json.length === 0
                || json.length == 1 && Object.keys(json[0]).length === 0) {
                  json = [{ msg: "XML-sintakso estas en ordo.", cls: "status_ok" }];
              };
              const elisto = UIElement.obj("#dock_eraroj") as Erarolisto;
              if (elisto) elisto.aldonu_liston(
                json.map((err: XEraro) => 
                    {
                        if (err.msg) err.msg = x.quoteattr(err.msg); 
                        return err;
                    })
                );
          },
          () => document.body.style.cursor = 'wait',
          () => document.body.style.cursor = 'auto',
          function(xhr: XMLHttpRequest) {
              console.error(xhr.status + " " + xhr.statusText);
              if (xhr.status == 400) {
                   alert("Eraro dum kontrolado: " + xhr.responseText);
              } else {
                  show_xhr_error(xhr,"Ho ve, okazis eraro:",
                    "Supozeble via seanco forpasis kaj vi devas resaluti.");
              }
      });

    // povas okazi dum atendi la rezulton de XML-kontrolo
    mrkkontrolo();
}


export function mrkkontrolo() {
    const xr = XmlRedakt.xmlredakt("#xml_text");

    if (xr) {
        const xml = xr.teksto; //$("#xml_text").val();

        var mrkoj = xr.markoj();
        for (let mrk in mrkoj) {
            if (mrkoj[mrk] > 1) {
                //alert("" + mrkoj[mrk] + "-obla marko: "+ mrk);
                let linpos = x.get_line_pos(mrkoj[mrk],xml);
                linpos.line++; linpos.pos+=2;
                let err = linpos as XEraro;
                (err as XEraro).msg = "marko aperas plurfoje: "+ mrk;
                const elisto = UIElement.obj("#dock_eraroj") as Erarolisto;
                if (elisto) elisto.aldonu_eraron(err);
            }
        }
        var sncoj = xr.snc_sen_mrk();
    
        if (sncoj) {
            var drvoj = xr.drv_markoj();
            var dmrk = 'xxx.0';
    
            for (let inx in sncoj) {
                let linpos = x.get_line_pos(parseInt(inx),xml);
    
                // trovu derivaĵon antaŭ tiu senco
                for(var i=drvoj.length-1; i>=0; i--) {
                    let drv = drvoj[i];
                    if (drv.line < linpos.line) {
                        dmrk = drv.mrk;
                        break;
                    }
                }
        
                linpos.line++; linpos.pos++;
                let snc = linpos as XEraro;
                snc.msg = "senco sen marko, <span class='snc_mrk' title='aldonu'>aldonebla kiel: <a>"
                         + dmrk + "." + sncoj[inx] + "</a></span>";
                const elisto = UIElement.obj("#dock_avertoj") as Erarolisto;
                if (elisto) elisto.aldonu_eraron(snc);
            }
        }
    }
}


export function klrkontrolo() {
    const xr = XmlRedakt.xmlredakt("#xml_text");
    if (xr) {
        const xml = xr.teksto; //$("#xml_text").val();
        const klroj = xr.klr_ppp();
    
        if (klroj) {
            for (let pos in klroj) {
                let linpos = x.get_line_pos(+pos,xml);
       
                linpos.line++; linpos.pos++;
                let klr = linpos as XEraro;
                klr.msg = "klarigo sen krampoj, <span class='klr_ppp' title='anstataŭigu'>anstataŭigebla per: <a>" +
                    "&lt;klr&gt;[…]&lt;/klr&gt;</a></span>";
                const elisto = UIElement.obj("#dock_avertoj") as Erarolisto;
                if (elisto) elisto.aldonu_eraron(klr);
            }
        }
    }
}


export function vortokontrolo() {
    const xr = XmlRedakt.xmlredakt("#xml_text");
    const lines = xr?.lines_as_dict();

    var chunk_size = 20;
    var i = 0;
    var l_: u.StrObj = {};

    for (let n in lines) {
        l_[n] = lines[n];
        i++;

        if (i == chunk_size) {
            kontrolu_liniojn(l_);
            i = 0; l_ = {};
        }
        //kontrolu_linion(parseInt(n),lines[n]);
    }
    // kontrolu eblan reston
    if (i < chunk_size) {
        kontrolu_liniojn(l_);
    }
}

function kontrolu_liniojn(lines: any) {   

    function _ana2txt(line: string) {
        //@ts-ignore
        var ana_arr = this[line]; 
        var txt = '';
        for(let i = 0; i<ana_arr.length; i++) {
            if (i>0) txt += "; ";
            const ana = ana_arr[i];
            txt += "<span class='" + ana.takso + "'>";
            txt += ana.analizo || ana.vorto;
            txt += "</span>";
            txt += " - kontrolinda ĉar <span class='ana_klarigo' data-takso='" + ana.takso + "'>";
            txt += ana.takso + " <a>\u24D8</a></span>";
        }
        return {line: +line, msg: txt};
    }

    //$("body").css("cursor", "progress");
    document.body.style.cursor = 'wait';
    var k = Object.keys(lines);
    var id = "vktrl_"+k[0];
    // montru linion dum atendado...
    const elisto = UIElement.obj("#dock_avertoj") as Erarolisto;
    if (elisto) elisto.aldonu_eraron({
        id: id, 
        line: +k[0],
        msg: "<span class=\"animated-dock-font\">kontrolante vortojn de linioj " + k[0] + ".." + k[k.length-1] + " ...</span>"
    });

    // redonu nur kontrolendajn analiz-rezultojn    
    lines.moduso = "kontrolendaj"; 
    u.HTTPRequestJSON('post',"analinioj",{},lines,
        function(json: any) {
            //var html = n + ": " + data;
            // $("#kontrolo_ana").append(html);
            //var str = data.replace('---','\u2014');
            DOM.e("#"+id)?.remove();

            if (json && Object.keys(json).length) {
                const elisto = UIElement.obj("#dock_avertoj") as Erarolisto;
                if (elisto) elisto.aldonu_liston(
                    Object.keys(json).map(_ana2txt,json) as Array<XEraro>
                );    
            }

            /*
            for (n in data) {
            vrtkontrolo_aldonu_linion(n,data[n]); 
            }
            */
        },
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        function(xhr: XMLHttpRequest) {
            console.error(xhr.status + " " + xhr.statusText);
            DOM.al_html("#"+id,"Okazis erraro dum kontrolo: " + xhr.statusText);
        });
}



export function surmetita_dialogo(url: string, root_el: string, loc = '') {
    
    u.HTTPRequest('get', url, {},
          function(xhr: XMLHttpRequest, data: string) {   
              if (xhr.status == 302) {
                  // FIXME: When session ended the OpenID redirect 302 is handled behind the scenes and here we get openid/login with status 200
                show_xhr_error(xhr,"Via seanco finiĝis. Bonvolu resaluti!");
              } else {
                const srm = Dialog.dialog("#surmetita_dlg");
                if (srm) {
                    DOM.al_html("#surmetita",data);
                    const titolo = DOM.t("#surmetita h1");
                    const h2 = DOM.e("#surmetita_dlg h2");
                    if (titolo && h2) {
                        const h2t = h2.firstChild;
                        if (h2t?.nodeType == Node.TEXT_NODE)
                            h2t.nodeValue = titolo;
                        //DOM.al_t("#surmetita_dlg h2",titolo);
                        DOM.e("#surmetita h1")?.remove();
                    };
                    //  $("#surmetita").html(data);
                    //  $("#surmetita_dlg").dialog("option", "title", $("#surmetita h1").text());
                    //  $("#surmetita h1").remove("h1");
                    
                    // adaptu altecon de la dialogo, por ke la deklaro ruliĝu sed la titolo kaj reir-butono montriĝu...
                    const dlg = srm.element.parentElement;
                    if (dlg) {
                        const view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                        const tbar = dlg.querySelector(".ui-dialog-titlebar") as HTMLElement;
                        if (tbar) {
                            const dlg_h = +tbar.style.height;
                            const decl_h = (view_h * 0.70) - dlg_h; // - dlg.children(".ui-dialog-buttonpane").height();
                            const dr = DOM.e("#"+root_el) as HTMLElement;
                            if (dr) dr.style.height = ""+decl_h;        
                        }
                    }

                    srm.malfermu();
                }
                window.location.hash = loc;
            } // else
        },
        function() { document.body.style.cursor = 'wait' },
        function() { document.body.style.cursor = 'auto' },
        function(xhr: XMLHttpRequest) {
            console.error(xhr.status + " " + xhr.statusText);
            if (xhr.status == 400) {
                DOM.al_html("#surmetita_error",'Pardonu, okazis eraro dum ŝargo de la dokumento.');
            } else {
                var msg = "Pardonu, okazis netandita eraro: ";
                DOM.al_html("#surmetita_error", msg + xhr.status + " " + xhr.statusText + xhr.responseText);
            }
            DOM.kaŝu("#surmetita_error",false); 
        });
}


export function montru_eraro_staton(error: Error) {
    //plenigu_xmleraro_liston([{"line": "nekonata", "msg": error.toString().slice(0,256)+'...'}]);
    const err: XEraro = {"line": -1, "msg": error.toString().slice(0,256)+'...'};
    const elisto = UIElement.obj("#dock_eraroj") as Erarolisto;
    if (elisto)  elisto.aldonu_eraron(err);

    DOM.kaŝu("#elekto_indikoj");
    DOM.kaŝu("#dock_klavaro",false);
    DOM.kaŝu("#dock_kontrolo",false);
}

