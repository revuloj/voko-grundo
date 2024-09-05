
/* 
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

import * as u from '../u';
import * as x from '../x';

import { XmlRedakt, type SDet, RevoListoj } from '../x';
import { ht_element } from '../u';
import { DOM, Slipar, type SlipSalto, Buton, Elektil, List, Valid } from '../ui';

import { Erarolisto } from './ui_err';
import { artikolo } from '../a/artikolo';
import { preferoj } from '../a/preferoj';

//import { xpress } from './jquery_ext';
import { show_xhr_error } from './ui_dlg';
import { vortokontrolo, xmlkontrolo, klrkontrolo, surmetita_dialogo } from './ui_err.js';
import { vikiSerĉo, citaĵoSerĉo, regulEsprimo, verkoListo, verkoPeriodo, verkElekto, retoSerĉo, bildoSerĉo } from './ui_srch.js';


const revo_url = 'https://' + u.agordo.revo_url; //reta-vortaro.de';

export const revo_listoj = new RevoListoj('../voko');
export var xtajpo: x.XTajpo; 


//var sercho_focused_button = null;
//var change_count = 0;
/*
var pozicio_xml = '';
var pozicio_html = '';
*/


/**
 * Preparas la ĉefan laborfenestron kaj la unuopajn partojn
 * uzante la rimedojn de jQuery UI
 */
export default function() {    
    console.debug("Instalante la ĉefan redaktilopaĝon...");

    const sliparo = new Slipar("#tabs", {
        poste: nova_slipo,
        antaŭe: antaŭ_slipŝanĝo
    });
    // PLIBONIGU: ĉar ni implementas slipojn nun mem anst. jQuery UI tabs,
    // ni povus meti la klasojn rekte al CSS aŭ opcioj de objekto Slip
    const sl = DOM.e("#tabs");
    if (sl) {                    
        sl.classList.add("ui-tabs-vertical","ui-helper-clearfix");
        sl.querySelector("ul")?.classList.add("ui-corner-all");
        sliparo.langetoj()?.forEach((l) => {
            const cl = l.classList;
            cl.add("ui-corner-right");
            cl.remove("ui-corner-top");
        });    
    }
       
    new Buton(".menu_toggle");
    DOM.klak(".menu_toggle",
        () => {
            const sb_videbla = !DOM.kaŝita("#xml_sidebar");
            DOM.kaŝu("#xml_sidebar",sb_videbla);
            if (!sb_videbla) {
                DOM.al_t("#menu_show_btn","\u00ab");
            } else {
                DOM.al_t("#menu_show_btn","\u2630");
            }
        }
    );
  //###### subpaĝoj

  //### XML-redaktilo
    
    const xmlredakt = new XmlRedakt("#xml_text", 
        // post_aldono:
        function(subt: SDet, index: number, selected: boolean) { // reago je aldono de nova subteksto: aldonu en la listo art_strukturo
            const sel_stru = document.getElementById("art_strukturo");
            if (sel_stru) {
                if (index == 0) sel_stru.textContent = ''; // malplenigu la liston ĉe aldono de unua ero...        
                if (selected) {
                    sel_stru.append(ht_element('option',{value: subt.id, selected: 'selected'},subt.dsc));
                } else {
                    sel_stru.append(ht_element('option',{value: subt.id},subt.dsc));
                }    
            }
        },    
        // subtekst_elekto: 
        function(subt: SDet) { // reago al interna elektoŝanĝo: elektu ankaŭ en la listo art_strukturo
            DOM.e("#art_strukturo option[value='"+subt.id+"']")?.setAttribute('selected','selected');
        },            
        // poziciŝanĝo: 
        function() {
            // aktualigu pozicion
            const xr = XmlRedakt.xmlredakt("#xml_text");
            if (xr) {
                const pos = xr.pozicio;
                DOM.al_t("#position",(1+pos.lin)+":"+(1+pos.poz));    
            }
        },
        // tekstŝanĝo: 
        function() {
            // forviŝu ne plu validan antaŭrigardon
            DOM.al_t("#rigardo","");
        }
    ); 

    // restarigi el loka krozil-memoro
    const art_xml = xmlredakt.relegu("red_artikolo","xml");

    if (art_xml && art_xml.xml) {
        /// xmlarea.setText(art.xml);

        xmlredakt.opcioj.reĝimo = art_xml.red;
        // ni povus alternaitve demandi xmlarea.getDosiero(), 
        // se ni certas, ke enestas mrk
        xmlredakt.opcioj.dosiero = art_xml.nom;
        //this._setRadiko();
    }

    // preferataj lingvoj
    preferoj.relegu();  


    // aktivigu x-tajpadon
    xtajpo = new x.XTajpo(['xml_text']);

    /// tion nun faras XmlRedakt mem DOM.klavpremo("#xml_text",x.xpress);
    DOM.ŝanĝo("#art_strukturo", function(event) {
        const val = (event.target as HTMLInputElement).value;
    
        // tio renovigas la strukturon pro eblaj intertempaj snc-/drv-aldonoj ks...
        // do ni poste rekreos ĝin kaj devos ankaŭ marki la elektitan laŭ _item_
        const xr = XmlRedakt.xmlredakt("#xml_text");
        if (xr) {
            // const xmlarea = art.opcioj.xmlarea;
            xr.ekredaktu(val,true);
            // okazigu eventon poziciŝanĝo ĉe Artikolo...
            const ps = xr.opcioj.poziciŝanĝo; 
            if (ps) (ps as Function)();
        }
        //show_pos();
    });

    new Buton("#kromklvr");
    DOM.klak("#kromklvr", () => {
        const stato = DOM.v("#kromklvr")||0;
        const ŝaltita = (1 - +stato);
        DOM.al_v("#kromklvr",""+ŝaltita);
        //$("#dock_klavaro").toggle()
        DOM.kaŝu("#dock",ŝaltita==0);
    });    
    
    // outline
    /*
    $( "#collapse_outline" ).accordion({
        collapsible: true,
        heightStyle: "content",
        beforeActivate: function(event,ui) {
            if (ui.newPanel)
                fill_outline();
        }
    });
    */

    // erarolistoj
    new Erarolisto("#dock_eraroj",{});
    new Erarolisto("#dock_avertoj", {
        a_click: function(event: PointerEvent) {
            const a = event.target;
            if (a instanceof HTMLElement) {                
                const span = a.parentElement;
                const xr = XmlRedakt.xmlredakt("#xml_text");
                if (xr && span) {
                    // linio en erarolisto kun propono havas strukturon li/span/a
                    // li@value enhavas indikon linio:pozicio
                    const lin_pos = span.parentElement?.getAttribute("value");
                    if (span.classList.contains('snc_mrk') && lin_pos) {
                        xr.iru_al(lin_pos,4);
                        xr.elektanstataŭigo("<snc mrk=\"" + a.textContent + "\"","<snc");
                        span.parentElement?.remove();
                    } else if (span.classList.contains('klr_ppp') && lin_pos) {
                        xr.iru_al(lin_pos,14);
                        xr.elektanstataŭigo(a.textContent||'',"<klr>...</klr>");
                        span.parentElement?.remove();
                    } else {
                        surmetita_dialogo("static/anaklar.html","klarigo_teksto", "klarigo_" + span.getAttribute("data-takso"));
                    }
                }
            }
        }
    });

    // Helpo-butono
    new Buton( "#help_btn", {});
    DOM.klak("#help_btn", function( event ) {
        const href = DOM.e("#help_btn > a")?.getAttribute("href");
        if (href) window.open(href);
    });

    // Adiaŭ-butono
    new Buton( "#logout_btn",{});
    DOM.klak( "#logout_btn", function( event ) {
        location.href='../auth/logout';
    });

    // ekrana klavaro
    const klv = DOM.e("#dock_klavaro");
    const xr = XmlRedakt.xmlredakt("#xml_text")
    if (klv instanceof HTMLElement && xr) {
      const xklv = new x.XRedaktKlavaro(klv, xr,
        // reĝimpremo
        (event: Event, ui) => { 
            // PLIBONIGU: tion ni povas ankaŭ meti en xklavaro.js!
            if (ui.cmd == 'indiko') {
              x.hide("r:klv_fak");
              x.show("r:klv_ind");
              x.hide("r:klv_elm");
            } else if (ui.cmd == 'fako') {
              x.hide("r:klv_ind");
              x.show("r:klv_fak");
              x.hide("r:klv_elm");
            } else if (ui.cmd == 'klavaro') {
              x.hide("r:klv_fak");
              x.show("r:klv_elm");
              x.hide("r:klv_ind");
            }
        },
        // postenmeto
        function(event,ui) {
            const xr = XmlRedakt.xmlredakt("#xml_text");
            xr?.malsinkrona();
        }
      );
      xklv.indiko_klavoj(revo_listoj.stiloj,<HTMLElement>DOM.e("#r\\:klv_ind"));
      xklv.fako_klavoj(revo_listoj.fakoj,<HTMLElement>DOM.e("#r\\:klv_fak"), );
      const klv_elm = DOM.e("#r\\:klv_elm");
      if (klv_elm instanceof HTMLElement) xklv.elemento_klavoj(klv_elm.textContent,klv_elm);
    }
    

    // kromklavarbutonon kaŝu komence
    DOM.kaŝu("#kromklavaro");
    DOM.klak("#kromklavaro", function() {    
        switch_dock_klavaro_kontrolo();            
    });

        // dock: elekto de indikoj
    //$("#elekto_indikoj").hide();
    switch_dock_klavaro_kontrolo();
    /*
    $("#dock_fermu").click(function(){
        $("#elekto_indikoj").hide();
        $("#dock_kontrolo").hide();
        $("#dock_klavaro").hide();
        $("#kromklavaro").show();
    });
    */
    plenigu_elekto_indikoj();
    
  //### antaŭrigardo
    DOM.klak( "#re_antaurigardo", function() {
        const slip = Slipar.montru("#tabs",1);
        //iru_al(pozicio_html);
        antaurigardo();
    });

    //### subpaĝo "serĉo"
    DOM.reago("#s_klasikaj","click",citaĵoSerĉo);
    DOM.reago("#s_elektitaj","click",citaĵoSerĉo);

    DOM.reago("#sercho_det_regexes","toggle",() => {
        if (! DOM.v("#re_radiko")) {
            const xr = XmlRedakt.xmlredakt("#xml_text");
            const rad = xr?.radiko || '';
            DOM.al_v("#re_radiko",rad);
        }
    });
    DOM.reago("#sercho_det_verklisto","toggle",verkoListo);
    DOM.klak("#sercho_verklisto button",verkElekto);
    verkoPeriodo();

    DOM.klak("#s_vikipedio",vikiSerĉo);
    DOM.klak("#s_anaso",retoSerĉo);
    DOM.klak("#s_bildoj",bildoSerĉo);

    //$("#regexes input[type='button']").button();
    Elektil.kreu("#regexes input[type='radio']");
    Elektil.kreu("#regexes input[type='checkbox']");
    /*
    $("#re_b").click(
        () => $("#sercho_sercho")
            .val("\\b"+$("#sercho_sercho").val())
    );*/
    DOM.ido_reago("#regexes","click","input",regulEsprimo);
    DOM.reago("#re_radiko","input",regulEsprimo);
    new x.XFormularKlavaro("#sercho_malplenigo","serch_kampo",
        // reĝimpremo
        function(event,ui) {
            if (ui.cmd == "blankigo") {
                DOM.al_v("#sercho_sercho","");
            }
        } // neniu postenmeto
    ).elemento_klavoj();
    
    /// DOM.klavpremo("#sercho_sercho",x.xpress);
    /// DOM.klavpremo("#re_radiko",x.xpress);

    xtajpo.aldonu("sercho_sercho");
    xtajpo.aldonu("re_radiko");

    new List("#sercho_trovoj","dt,li,.bildstriero");
    /*
    DOM.reago("#sercho_trovoj", "click", (event) => {

            // forigu antaŭan aktivan elementon
            const aktiva = DOM.e("#sercho_trovoj .active");
            if (aktiva instanceof HTMLElement) aktiva.classList.remove("active");

            // aktivigu alklakitan
            const trg = event.target;
            if (trg instanceof HTMLElement) {

                const listero = trg.closest("dt,li,.bildstriero");
                if (listero) {
                    listero.classList.add("active");
                }    
            }
        }
    );
    */

    DOM.kaŝu("#sercho_error");
    Valid.aldonu("#sercho_sercho",{
        nonempty: "Malplena serĉokampo. Kion vi volas serĉi?",
        pattern: {
            regex: /^../,
            message: "Bonvolu doni pli longan serĉaĵon. Ne eblas serĉi laŭ unuopa signo."
        },
        err_to: "#sercho_error"
    });

    // ne plu funkcias? 
    DOM.reago(window, "unload", function() { 
    //do_before_unload(() => {
        console.debug("sekurigante la aktualan XML-tekston...");
        const xr = XmlRedakt.xmlredakt("#xml_text");
        xr?._konservu_fone();
    });

}

/**
 * Montras la panelon kun indiko-butonoj (oficialeco, fakoj, stiloj, vorspecoj...)
 */
export function montri_indikojn() {
    switch_dock_indikoj();
}

/**
 * Montras la panelon kun la redaktobutonoj de elementoj, specialsignoj... 
 */
export function montri_kromklavaron() {
    switch_dock_klavaro_kontrolo();
}

/**
 * Kontrolas la artikolon (sintakso, klarigoj, vortanalizo)
 */
export function kontroli_artikolon(){
    DOM.al_t("#dock_eraroj",'');
    DOM.al_t("#dock_avertoj",'');

    xmlkontrolo();
    klrkontrolo();
    vortokontrolo();

    switch_dock_klavaro_kontrolo();
}

/**
 * Montras la panelon kun la redaktobutonoj de elementoj, specialsignoj... 
 */
function switch_dock_indikoj() {
    DOM.kaŝu("#elekto_indikoj",false);
    DOM.kaŝu("#dock_kontrolo");
    DOM.kaŝu("#dock_klavaro");
    DOM.kaŝu("#kromklavaro",false);   
}

/**
 * Montras la panelon kun la kromklavaro kaj la kontrolrezultoj
 */
function switch_dock_klavaro_kontrolo() {
    DOM.kaŝu("#elekto_indikoj");
    DOM.kaŝu("#dock_kontrolo",false);
    DOM.kaŝu("#dock_klavaro",false);
    DOM.kaŝu("#kromklavaro");   
}


//*********************************************************************************************
//* Paĝoj (XML, Antaŭrigardo, Serĉo) 
//*********************************************************************************************

/**
 * Agas antaŭ transiro al alia subpaĝo (redaktilo, antaŭrigardo, serĉo).
 * Transirante al serĉo ni metos la momente markita tekston en la serĉkampon.
 * @param {*} event 
 * @param {*} ui 
 */
export function antaŭ_slipŝanĝo(ui: SlipSalto) {
    var old_p = ui.slipo_malnova.id;
    var new_p = ui.slipo_nova.id;
    var new_t = ui.langeto_nova.id;

    // transirante al serĉo prenu markitan tekston kiel serĉaĵo
    if (old_p == "xml" && new_p == "sercho") {
        const xr = XmlRedakt.xmlredakt("#xml_text");
        if (xr) {
            const elektita = xr.elekto||'';
            const radiko = xr.radiko;
           
            var sercho = x.replaceTld(radiko, elektita)
               .replace(/<[^>]+>/g,'')
               .replace(/\s\s+/g,' ');
            if ( sercho.length > 0 ) {
                DOM.al_v("#sercho_sercho",sercho);
                DOM.e("#sercho_det_regexes")?.removeAttribute("open");
            }    
        }

    } else if (old_p == "html" && new_p == "sercho") {
        var selection = DOM.elekto("#rigardo")||''; // $("#rigardo").selection();
        if ( selection.length > 0 ) {
            DOM.al_v("#sercho_sercho",selection);
            DOM.e("#sercho_det_regexes")?.removeAttribute("open");
        }
    }

    // alirante la serĉon ni distingas internan kaj eksteran serĉadon
    if (new_p == "sercho") {
        if(new_t == "t_s_ext") {
            DOM.kaŝu_plurajn("#sercho_form .s_ext",false);
            DOM.kaŝu_plurajn("#sercho_form .s_int");
        } else {
            DOM.kaŝu_plurajn("#sercho_form .s_ext");
            DOM.kaŝu_plurajn("#sercho_form .s_int",false);
        }
    }
}

/**
 * Aktivigas alian subpaĝon
 * @param {*} ui - enhavas informojn pri al paĝŝanĝo (slipo_malnova, slipo_nova)
 */
export function nova_slipo(ui: SlipSalto) {
    var old_p = ui.slipo_malnova.id;
    var new_p = ui.slipo_nova.id;
    
    /*
    if (old_p == "xml" && new_p == "html") {
        // eltrovu, en kiu drv momente troviĝas...
        // kaj iru tien ankaŭ su antaŭrigardo...
        pozicio_xml = $("#xml_text").Artikolo("drv_before_cursor"); 
        pozicio_html = pozicio_xml;
    }
    */

    // PLIBONIGU: necesas nur, ke teksto ŝanĝigis
    // kiel rimarki tion? -ŝargi, focus+change....
    if (new_p == "html") {
        // if ($('#xml_text').val() && ! $("#rigardo").html())
        antaurigardo();
        // devas esti en antuarigardo, pro nesinkroneco...: iru_al(pozicio_html);
    } else if (new_p == 'xml') {
        // (saltu en la XML-teksto nur se antaŭ saltiĝis en la HTML, aliokaze ĝi estis jam forgesita en iru_al...)
        /*
        if (old_p == 'html' && pozicio_xml.mrk != pozicio_html.mrk) {
            pozicio_xml = pozicio_html;
            iru_al(pozicio_xml);  
        } 
        */
        DOM.i('#xml_text')?.focus();
        // kaj forgesu...
        //lasta_salto = null;
    } 

}

/**
 * Montras la antaŭrigardon de la artikolo
 */
function antaurigardo() {
    const xr = XmlRedakt.xmlredakt("#xml_text");
    const ahtml = DOM.html("#rigardo");

    /* teorie ni povos ŝapri remeti antaŭrigardon, se nenio
    intertempe ŝanĝiĝis (xmlarea.antaŭrigardo_sinkrona...), sed estas malfacile fidinde
    eltrovi tion pro kio en antaŭaj eldonoj ni havis manan refreŝbutonon...
    'sync' ja okazas ekz-e ĉe kontrolo kaj tradukado sen ke la antaŭrigardo estas
    refreŝigata. Do ni aldonu flagon ankoraŭ en xmlarea, kiu memoras, ĉu ni
    iam kreis aktualan antaŭrigardon post la lasta efektiva ŝanĝo.
    */
    if (xr) {

        if (ahtml && xr.antaŭrigardo_sinkrona) {
            xr.saltu();
            return;
        }

        const xml_text = xr.teksto; //$("#xml_text").val();
        
        if (! xml_text) {
            // PLIBONIGU: eble aldone testu: xml.startsWith("<?xml")

            DOM.al_html("#rigardo","<br>¬ xml:<br>Nu, unue vi ŝargu aŭ kreu XML-tekston, poste la antaŭrigardo estos pli impresa.");
            return;
        }

        u.HTTPRequest('post',"revo_rigardo", { xml: xml_text },
            function(data: string) {   
                const parser = new DOMParser();
                const doc = parser.parseFromString(data,"text/html");       

                // ial elektilo "article" ne funkcias tie ĉi !?
                //const article = $( data ).find( "article" );
                const article = doc.querySelector("#s_artikolo")?.parentElement;
                if (article) {
                    const footer = article.nextSibling;

                    //$("#rigardo").html(data);
                    const rig = DOM.e("#rigardo");
                    if (rig) {
                        rig.textContent = '';
                        rig.append(article,footer as Node);    
                    }
                    xr.antaŭrigardo_sinkrona = true;
                    xr.saltu();
    
                    // refaru matematikajn formulojn, se estas
                    if (typeof(MathJax) != 'undefined' && MathJax.Hub) {
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    }
                    
                    // korektu ligilojn en <a href...
                    DOM.ej("#rigardo a").forEach((a) => {
                        const href = a.getAttribute('href');
                        let newUrl;
                        if (href && href[0] != '#' && href.slice(0,4) != 'http') {
                            if (href[0] != '/' && href[0] != '.') {
                            // referenco al alia artikolo
                                // var newUrl = revo_url + '/revo/art/' + href;
                                const mrk = href.split('#')[1] || href.split('.')[0];
                                newUrl = revo_url + '/index.html#' + mrk;
                                //console.debug(href+" -> "+newUrl);
                                a.setAttribute('href', newUrl);
                                a.setAttribute('target', '_new');
                            } else if (href.slice(0,3) == '../' ) {
                            // relativa referenco al Revo-dosiero, ekz-e indekso
                                newUrl = revo_url + '/revo/'+href.slice(3);
                                //console.debug(href+" -> "+newUrl);
                                a.setAttribute('href', newUrl);
                                a.setAttribute('target', '_new');
                            } else if (href[0] == '/' ) {
                            // absoluta referenco al Revo-dosiero
                                newUrl = revo_url + href;
                                //console.debug(href+" -> "+newUrl);
                                a.setAttribute('href', newUrl);
                                a.setAttribute('target', '_new');
    //                        } else {
                                //console.debug("lasita: " + href);
    //                            null
                            }
                        }
                    });  
                    
                    DOM.ej("#rigardo img").forEach((e) => {
                        var src = e.getAttribute('src');
                        if ( src && src.slice(0,7) == '../bld/' ) {
                            e.setAttribute('src',revo_url + '/revo/bld/'+src.slice(7));
                        }
                    });
    
                    // anstataŭigu GIF per SVG  
                    const ar = DOM.e('#rigardo');
                    if (ar) x.fix_img_svg(ar);
    
                    DOM.ej("#rigardo source").forEach((e) => {
                        const src = e.getAttribute('srcset');
                        if ( src && src.slice(0,7) == '../bld/' ) {
                            e.setAttribute('srcset', revo_url + '/revo/bld/'+src.slice(7));
                        }
                    });
    
                    // preparu la artikolon per ties JS!
                    /// KOREKTU: ni elprenis <head>, do ni devos alie provitzi tion:
                    //restore_preferences();    
                    u.agordo.lingvoj_xml = '../voko/lingvoj.xml'; // PLIBONIGU: distingu redaktilojn iel
                                // anstataŭ manipuli tie ĉi centran agordon!
                    artikolo.preparu_art();
    
                    // ankoraŭ reduktu la piedlinion
                    // PLIBONIGU: eble permesu kaŝi ilin per CSS uzante apartajn
                    // klasojn en la elementoj de la piedlinio
                    if (footer) {
                        DOM.al_t("#rigardo footer a[href*='/dok/']",".");
                        DOM.al_t("#rigardo footer a[href*='/xml/']",".");
                        DOM.al_t("#rigardo footer a[href*='/cgi-bin/']",".");
                        DOM.al_t("#rigardo footer a[href*='?r=']",".");
                    }
    
                    /*
                    iru_al(pozicio_html);
                    */
                }
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            // FARENDA: eble metu eraron en apartan kampon 
            // anst. uzi alert..., tiam vi povas uzi $.alportu
            function(xhr: XMLHttpRequest) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 400) {
                    // alert("Eraro dum transformado: " + xhr.responseText);
                    DOM.al_html("#rigardo","<p>Eraro dum transformado:</p><pre>" 
                        + x.quoteattr(xhr.responseText) + "</pre>");
                } else {
                    /* PLIBONIGU: ĉe HTTP-500 verŝajne la seanco ne plu ekzistas,
                    ĉu ni povas distingi tion? eble mesaĝo: http_session `_53070' does not exist
                    Ni traktu HTTP-500 iom unuece kaj konduku la uzanton kun iom da helpo
                    al resaluto, ĉu?
                    */
                show_xhr_error(xhr,"Ho ve, okazis eraro:",
                    "Supozeble via seanco forpasis kaj vi devas resaluti!");
                }
            }
        );
    }
}




//*********************************************************************************************
//* Malsupra parto (indikoelekto, erarolisto) 
//*********************************************************************************************


/**
 * Plenigas la vinjetoklavojn por indikoj (oficialeco, fakoj, stiloj, vortspecoj)
 */
// FARENDA: ĉu ŝovi tion al ui_btn -> ui_klv
function plenigu_elekto_indikoj() {
    //$("body").css("cursor", "progress");

    const klvr = DOM.e("#elekto_indikoj");
    // const xmltxt = DOM.e("#xml_text");
    const xr = XmlRedakt.xmlredakt("#xml_text");

    if (klvr instanceof HTMLElement && xr) {
        // PLIBONIGU: enkonduku apartajn elementojn span...
        const klv_fak = klvr;
        const klv_ind = klvr;
        
        // @ts-ignore
        const xklavaro = new x.XRedaktKlavaro(klvr, xr,
            // reĝimŝanĝo
            (event: Event, cmd) => { 
                // KOREKTU: ...
                if (cmd.cmd == 'indiko') {
                DOM.kaŝu("#r\\:klv_fak");
                DOM.malkaŝu("#r\\:klv_ind");
                DOM.kaŝu("#r\\:klv_elm");
                } else if (cmd.cmd == 'fako') {
                DOM.kaŝu("#r\\:klv_ind");
                DOM.malkaŝu("#r\\:klv_fak");
                DOM.kaŝu("#r\\:klv_elm");
                } else if (cmd.cmd == 'klavaro') {
                DOM.kaŝu("#r\\:klv_fak");
                DOM.malkaŝu("#r\\:klv_elm");
                DOM.kaŝu("#r\\:klv_ind");
                }
            },
            // postenmeto
            () => xr.malsinkrona()
        );

        if (klv_fak) xklavaro.fako_klavoj(revo_listoj.fakoj,klv_fak);
        if (klv_ind) xklavaro.indiko_klavoj(revo_listoj.stiloj,klv_ind);
    }
}






