
/* 
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

import * as u from '../u';
import * as x from '../x';

import { Xmlarea, RevoListoj } from '../x';
import { ht_element } from '../u';
import { DOM, Slipar, Buton, Elektil, List, Valid } from '../ui';

import { Erarolisto } from './ui_err';
import { artikolo } from '../a/artikolo';

import { Artikolo } from './ui_art';

//import { xpress } from './jquery_ext';
import { show_xhr_error } from './ui_dlg';
import { vortokontrolo, xmlkontrolo, klrkontrolo, surmetita_dialogo } from './ui_err.js';
import { vikiSerĉo, citaĵoSerĉo, regulEsprimo, verkoListo, verkoPeriodo, verkElekto, retoSerĉo, bildoSerĉo } from './ui_srch.js';


const revo_url = 'https://' + u.agordo.revo_url; //reta-vortaro.de';

export const revo_listoj = new RevoListoj('../voko');

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
    
    let artikolo = new Artikolo("#xml_text", {
        poziciŝanĝo: function() {
            // tion ni povos forigi
            /*
            var line_pos = $("#xml_text").getCursorLinePos();
            $("#edit_position").text("linio " + (line_pos.line+1) + ", " + (line_pos.pos+1));
            */
            // tion ni uzu estonte:
            // aktualigu pozicion
            const xmlarea = Artikolo.artikolo("#xml_text")?.opcioj.xmlarea;
            if (xmlarea) {
                const pos = xmlarea.position();
                DOM.al_t("#position",(1+pos.line)+":"+(1+pos.pos));    
            }
        },
        tekstŝanĝo: function() {
            // fermu la navigilon, ĉar ĝi bezonas aktualigon, kio okazas per
            // evento "change" nur post forlaso de la XML-tekst-areo
            /*
            $("#collapse_outline").accordion({active:false});
            */
            DOM.al_t("#rigardo","");
        },
        xmlarea: new Xmlarea("xml_text",
            function(subt,index,selected) { // reago je aldono de nova subteksto: aldonu en la listo art_strukturo
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
            function(subt) { // reago al interna elektoŝanĝo: elektu ankaŭ en la listo art_strukturo
                DOM.e("#art_strukturo option[value='"+subt.id+"']")?.setAttribute('selected','selected');
            }
        )        
    });
    DOM.klavpremo("#xml_text",x.xpress);
    DOM.ŝanĝo("#art_strukturo", function(event) {
        const val = (event.target as HTMLInputElement).value;
    
        // tio renovigas la strukturon pro eblaj intertempaj snc-/drv-aldonoj ks...
        // do ni poste rekreos ĝin kaj devos ankaŭ marki la elektitan laŭ _item_
        const art = Artikolo.artikolo("#xml_text");
        if (art) {
            const xmlarea = art.opcioj.xmlarea;
            xmlarea.changeSubtext(val,true);
            // okazigu eventon poziciŝanĝo ĉe Artikolo...
            const ps = art.opcioj.poziciŝanĝo; 
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
        a_click: function(event) {
            const a = event.target;
            const span = a.parentElement;
            const xmlarea = artikolo.opcioj.xmlarea;
            if (span.classList.contains('snc_mrk')) {
                //const art = $("#xml_text");
                xmlarea.goto(span.parentElement.getAttribute("value"),4);
                artikolo.elekto("<snc mrk=\"" + a.textContent + "\"","<snc");
                span.parentElement.remove();
            } else if (span.classList.contains('klr_ppp')) {
                xmlarea.goto(span.parentElement.getAttribute("value"),14);
                artikolo.elekto(a.textContent,"<klr>...</klr>");
                span.parentElement.remove();
            } else {
                surmetita_dialogo("static/anaklar.html","klarigo_teksto", "klarigo_" + span.getAttribute("data-takso"));
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
    let klv = DOM.e("#dock_klavaro");
    if (klv) {
      const xklv = new x.XKlavaro(klv,null,"#xml_text",
      () => Artikolo.xmlarea("#xml_text").getRadiko(),
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
/*
        function(event,ui) {
            switch (ui.cmd) {
                
                case "fermu":
                    $("#dock_klavaro").hide();
                    //this.element.hide();
                    //$("#kromklavaro").show(); // butono por reaperigi ĝin poste
                    break;
                    
                case "indiko":
                    montri_indikojn();
                    break;
                case "sercho":
                    // iru al paĝo serĉo...
                    const slip = Slipar.montru("#tabs",2);
                    break;
            }
        },*/
        function(event,ui) {
            const xmlarea = Artikolo.xmlarea("#xml_text");
            xmlarea?.setUnsynced();
        }
      );
      xklv.indiko_klavoj(DOM.e("#r\\:klv_ind"), revo_listoj.stiloj);
      xklv.fako_klavoj(DOM.e("#r\\:klv_fak"), revo_listoj.fakoj);
      const klv_elm = DOM.e("#r\\:klv_elm");
      if (klv_elm) xklv.elemento_klavoj(klv_elm,klv_elm.textContent);
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
            const xmlarea = Artikolo.xmlarea("#xml_text");
            const rad = xmlarea?.getRadiko() || '';
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

    klv = DOM.e("#sercho_malplenigo");
    if (klv) {
        const xklv = new x.XKlavaro("#sercho_malplenigo","#sercho_kampo","#sercho_sercho",
            ()=>'',
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.al_v("#sercho_sercho","");
                }
            },
            undefined
        );
        xklv.elemento_klavoj(klv);
    }
    DOM.klavpremo("#sercho_sercho",x.xpress);
    DOM.klavpremo("#re_radiko",x.xpress);

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
        const art = Artikolo.artikolo("#xml_text");
        artikolo.backup();
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
export function antaŭ_slipŝanĝo(ui) {
    var old_p = ui.slipo_malnova.id;
    var new_p = ui.slipo_nova.id;
    var new_t = ui.langeto_nova.id;

    // transirante al serĉo prenu markitan tekston kiel serĉaĵo
    if (old_p == "xml" && new_p == "sercho") {
        /*
        var art = $("#xml_text");
        var elektita = art.Artikolo("elekto");
        var radiko = art.Artikolo("radiko");
        */
        const xmlarea = Artikolo.xmlarea("#xml_text");
        if (xmlarea) {
            const elektita = xmlarea.selection();
            const radiko = xmlarea.getRadiko();
           
            var sercho = x.replaceTld(radiko,elektita)
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
 * @param {*} event 
 * @param {*} ui - enhavas informojn pri al paĝŝanĝo (slipo_malnova, slipo_nova)
 */
export function nova_slipo(ui) {
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
    const xmlarea = Artikolo.xmlarea("#xml_text");
    const ahtml = DOM.html("#rigardo");

    /* teorie ni povos ŝapri remeti antaŭrigardon, se nenio
    intertempe ŝanĝiĝis (xmlarea.ar_in_sync...), sed estas malfacile fidinde
    eltrovi tion pro kio en antaŭaj eldonoj ni havis manan refreŝbutonon...
    'sync' ja okazas ekz-e ĉe kontrolo kaj tradukado sen ke la antaŭrigardo estas
    refreŝigata. Do ni aldonu flagon ankoraŭ en xmlarea, kiu memoras, ĉu ni
    iam kreis aktualan antaŭrigardon post la lasta efektiva ŝanĝo.
    */
    if (xmlarea) {

        if (ahtml && xmlarea.ar_in_sync) {
            xmlarea.saltu();
            return;
        }

        const xml_text = xmlarea.syncedXml(); //$("#xml_text").val();
        
        if (! xml_text) {
            // PLIBONIGU: eble aldone testu: xml.startsWith("<?xml")

            DOM.al_html("#rigardo","<br>¬ xml:<br>Nu, unue vi ŝargu aŭ kreu XML-tekston, poste la antaŭrigardo estos pli impresa.");
            return;
        }

        u.HTTPRequest('post',"revo_rigardo", { xml: xml_text },
            function(data) {   
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
                    xmlarea.ar_in_sync = true;
                    xmlarea.saltu();
    
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
            function(xhr) {
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
    const xmltxt = DOM.e("#xml_text");
    const xmlarea = Artikolo.xmlarea("#xml_text");

    // PLIBONIGU: enkonduku apartajn elementojn span...
    const klv_fak = klvr;
    const klv_ind = klvr;

    if (klvr && xmlarea) {
        
        // @ts-ignore
        const xklavaro = new x.XKlavaro(klvr, null, xmltxt,
            () => xmlarea.getRadiko(),
            (event: Event, cmd) => { 
                // KOREKTU: ...
                if (cmd.cmd == 'indiko') {
                x.hide("r:klv_fak");
                x.show("r:klv_ind");
                x.hide("r:klv_elm");
                } else if (cmd.cmd == 'fako') {
                x.hide("r:klv_ind");
                x.show("r:klv_fak");
                x.hide("r:klv_elm");
                } else if (cmd.cmd == 'klavaro') {
                x.hide("r:klv_fak");
                x.show("r:klv_elm");
                x.hide("r:klv_ind");
                }
            },
            () => xmlarea.setUnsynced()
        );

        if (klv_fak) xklavaro.fako_klavoj(klv_fak, revo_listoj.fakoj);
        if (klv_ind) xklavaro.indiko_klavoj(klv_ind, revo_listoj.stiloj);
    }
}

/**
 * Enmetas klakitan indikon en la XML-tekston
 * @param {*} event 
 */
function indikon_enmeti(event) {
    event.preventDefault();
    let enmetu = '';

    const el = event.target;
    
    const cmd = el.getAttribute("data-cmd");
    if (cmd == "fermu") {
      DOM.kaŝu("#elekto_indikoj",true);
      DOM.kaŝu("#kromklavaro",false); // butono por reaperigi kromklavaron poste
    } else if (cmd == "klavaro") {
      montri_kromklavaron();
    }
    else {
      switch (this.className) {
        case "stl":
            enmetu = '<uzo tip="stl">' + el.getAttribute("data-stl") + '</uzo>';
            break;
        case "fak":
            enmetu = '<uzo tip="fak">' + el.getAttribute("data-fak") + '</uzo>';
            break;
        case "ofc":
            enmetu = '<ofc>' + el.getAttribute("data-ofc") + '</ofc>';
            break;
        case "gra":
            enmetu = '<gra><vspec>' + el.getAttribute("data-vspec") + '</vspec></gra>';
            break;
        }
        
        if (enmetu) {
            //$("#xml_text").insert(enmetu);
            const xmlarea = Artikolo.xmlarea("#xml_text");
            if (xmlarea) xmlarea.selection(enmetu);
        }
    }
}






