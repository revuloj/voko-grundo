
/* 
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

import * as u from '../u';
import * as x from '../x';

import { Xmlarea } from '../x';
import { ht_element } from '../u';
import { DOM, Slip, Elektil, Eraro, Valid } from '../ui';

import { Erarolisto } from './ui_err';
import { artikolo } from '../a/artikolo';

import { Artikolo } from './ui_art';

//import { xpress } from './jquery_ext';
import { show_xhr_error } from './ui_dlg';
import { vortokontrolo, xmlkontrolo, klrkontrolo, surmetita_dialogo } from './ui_err.js';
import { vikiSerĉo, citaĵoSerĉo, regulEsprimo, verkoListo, verkoPeriodo, verkElekto, retoSerĉo, bildoSerĉo } from './ui_srch.js';

// vd. https://mariusschulz.com/blog/declaring-global-variables-in-typescript
// alternative oni povus uzi alnoton ty-ignore ne la malsupraj linioj kiuj uzas MathJax
//const MathJax = (window as any).MathJax;
declare global {
    const MathJax: any; 
}

const revo_url = 'https://'+globalThis.revo_url; //reta-vortaro.de';

//var sercho_focused_button = null;
//var change_count = 0;
/*
var pozicio_xml = '';
var pozicio_html = '';
*/

console.debug("Instalante la ĉefan redaktilopaĝon...");

/**
 * Preparas la ĉefan laborfenestron kaj la unuopajn partojn
 * uzante la rimedojn de jQuery UI
 */
export default function() {    
    const slipoj = new Slip("#tabs", {
        activate: activate_tab,
        beforeActivate: before_activate_tab
    });
    // PLIBONIGU: ĉar ni implementas slipojn nun mem anst. jQuery UI tabs,
    // ni povus meti la klasojn rekte al CSS aŭ opcioj de objekto Slip
    const sl = DOM.e("#tabs");
    if (sl) {                    
        sl.classList.add("ui-tabs-vertical ui-helper-clearfix");
        sl.querySelector("ul")?.classList.add("ui-corner-all");
        slipoj.langetoj()?.forEach((l) => {
            const cl = l.classList;
            cl.add("ui-corner-right");
            cl.remove("ui-corner-top");
        });    
    }
       
    $(".menu_toggle").button();
    $(".menu_toggle").click(
        () => {
            const sb = DOM.e("#xml_sidebar");
            sb.toggle();
            if (sb.is(":visible")) {
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
                $("#position").text((1+pos.line)+":"+(1+pos.pos));    
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
                $("#art_strukturo option[value='"+subt.id+"']").prop('selected', true);
            }
        )        
    });
    $("#xml_text").keypress(xpress);
    $("#art_strukturo").on("change", function(event) {
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

    $("#kromklvr").button();
    $("#kromklvr").click(() => {
        const stato = $("#kromklvr").val() as string;
        const pressed = "" + (1 - +stato);
        DOM.al_v("#kromklvr",pressed);
        //$("#dock_klavaro").toggle()
        if (pressed) {
            DOM.kaŝu("#dock",false);
        } else {
            DOM.kaŝu("#dock",true);
        }
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
            const a = event.currentTarget;
            const span = a.parentElement;
            const xmlarea = artikolo.opcioj.xmlarea;
            if (span.hasClass('snc_mrk')) {
                //const art = $("#xml_text");
                xmlarea.goto(span.parentElement.getAttribute("value"),4);
                artikolo.elekto("<snc mrk=\"" + a.text() + "\"","<snc");
                span.parentElement.remove();
            } else if (span.hasClass('klr_ppp')) {
                xmlarea.goto(span.parentElement.getAttribute("value"),14);
                artikolo.elekto(a.text(),"<klr>...</klr>");
                span.parentElement.remove();
            } else {
                surmetita_dialogo("static/anaklar.html","klarigo_teksto", "klarigo_" + span.getAttribute("data-takso"));
            }
        }
    });

    // Helpo-butono
    $( "#help_btn" ).button({});
    $( "#help_btn" ).on( "click", function( event, ui ) {
        window.open($("#help_btn > a").attr("href"));
    });

    // Adiaŭ-butono
    $( "#logout_btn" ).button({});
    $( "#logout_btn" ).on( "click", function( event, ui ) {
        location.href='../auth/logout';
    });

    // ekrana klavaro
    new x.XKlavaro("#dock_klavaro","#xml_text","#xml_text",
        undefined,
        function(event,ui) {
            switch (ui.cmd) {
                /*
                case "fermu":
                    $("#dock_klavaro").hide();
                    //this.element.hide();
                    //$("#kromklavaro").show(); // butono por reaperigi ĝin poste
                    break;
                    */
                case "indiko":
                    montri_indikojn();
                    break;
                case "sercho":
                    // iru al paĝo serĉo...
                    const slip = Slip.montru("#tabs",2);
                    break;
            }
        },
        function(event,ui) {
            const xmlarea = Artikolo.xmlarea("#xml_text");
            xmlarea?.setUnsynced();
        }
    );
    

    // kromklavarbutonon kaŝu komence
    DOM.kaŝu("#kromklavaro");
    $("#kromklavaro").click(function() {    
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
    $( "#re_antaurigardo" ).click(function() {
        const slip = Slip.montru("#tabs",1);
        //iru_al(pozicio_html);
        antaurigardo();
    });

    //### subpaĝo "serĉo"
    $("#s_klasikaj").click("klasikaj",citaĵoSerĉo);
    $("#s_elektitaj").click("elektitaj",citaĵoSerĉo);

    $("#sercho_det_regexes").on("toggle",() => {
        if (! $("#re_radiko").val()) {
            const xmlarea = Artikolo.xmlarea("#xml_text");
            const rad = xmlarea?.getRadiko() || '';
            DOM.al_v("#re_radiko",rad);
        }
    });
    $("#sercho_det_verklisto").on("toggle",verkoListo);
    $("#sercho_verklisto button").click(verkElekto);
    verkoPeriodo();

    $("#s_vikipedio").click(vikiSerĉo);
    $("#s_anaso").click(retoSerĉo);
    $("#s_bildoj").click(bildoSerĉo);

    //$("#regexes input[type='button']").button();
    Elektil.kreu("#regexes input[type='radio']");
    Elektil.kreu("#regexes input[type='checkbox']");
    /*
    $("#re_b").click(
        () => $("#sercho_sercho")
            .val("\\b"+$("#sercho_sercho").val())
    );*/
    $("#regexes input").click(regulEsprimo);
    $("#re_radiko").on("input",regulEsprimo);

    new x.XKlavaro("#sercho_butonoj","#sercho_sercho","#sercho_sercho",
        undefined,
        function(event,ui) {
            if (ui.cmd == "blankigo") {
                DOM.al_v("#sercho_sercho","");
            }
        },
        undefined
    );
    $("#sercho_sercho").keypress(xpress);
    $("#re_radiko").keypress(xpress);

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
    $(window).on("unload", function() { 
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
export function before_activate_tab(event,ui) {
    var old_p = ui.oldPanel[0].id;
    var new_p = ui.newPanel[0].id;
    var new_t = ui.newTab[0].id;

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
        var selection = $("#rigardo").selection();
        if ( selection.length > 0 ) {
            DOM.al_v("#sercho_sercho",selection);
            DOM.e("#sercho_det_regexes")?.removeAttribute("open");
        }
    }

    // alirante la serĉon ni distingas internan kaj eksteran serĉadon
    if (new_p == "sercho") {
        if(new_t == "t_s_ext") {
            DOM.kaŝu("#sercho_form .s_ext",false);
            DOM.kaŝu("#sercho_form .s_int");
        } else {
            DOM.kaŝu("#sercho_form .s_ext");
            DOM.kaŝu("#sercho_form .s_int",false);
        }
    }
}

/**
 * Aktivigas alian subpaĝon
 * @param {*} event 
 * @param {*} ui - enhavas informojn pri al paĝŝanĝo (oldPanel, newPanel)
 */
export function activate_tab(event,ui) {
    var old_p = ui.oldPanel[0].id;
    var new_p = ui.newPanel[0].id;
    
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
            return;
        }
        
        
    u.HTTPRequest('post',"revo_rigardo", { xml: xml_text },
            function(data) {   
                // ial elektilo "article" ne funkcias tie ĉi !?
                //const article = $( data ).find( "article" );
                const article = $(data).find("#s_artikolo").parent();
                const footer = article.next();

                //$("#rigardo").html(data);
                $("#rigardo").empty().append(article).append(footer);
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
                globalThis.lingvoj_xml = '../voko/lingvoj.xml'; // PLIBONIGU: distingu redaktilojn iel
                            // anstataŭ manipuli tie ĉi centran agordon!
                artikolo.preparu_art();

                // ankoraŭ reduktu la piedlinion
                // PLIBONIGU: eble permesu kaŝi ilin per CSS uzante apartajn
                // klasojn en la elementoj de la piedlinio
                if (footer) {
                    DOM.al_t("#rigardo footer a[href*='/dok/']",".");
                    DOM.al_t("#rigardo footer a[href*='/xml/']",".");
                    DOM.al_t("#rigardo footer a[href*='/cgi-bin/']",".");
                }

                /*
                iru_al(pozicio_html);
                */
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            // FARENDA: eble metu eraron en apartan kampon 
            // anst. uzi alert..., tiam vi povas uzi $.alportu
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 400) {
                    // alert("Eraro dum transformado: " + xhr.responseText);
                    $("#rigardo").html("<p>Eraro dum transformado:</p><pre>" 
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
    
    let get_stiloj; 
    u.HTTPRequest('get','../voko/stiloj.xml',{},
        (data) => get_stiloj = data,
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        (msg: string) => Eraro.al("#elekto_indikoj",msg)
    );
    /*
      $.get('../voko/stiloj.xml')
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 404) {
                    $("#elekto_indikoj").html('Pardonu, la listo de stiloj ne troviĝis sur la servilo.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#elekto_indikoj").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
                //$("#referenco_error").show()  
        });
        */
    
    let get_fakoj;
    u.HTTPRequest('get','../voko/fakoj.xml',{},
        (data) => get_fakoj = data,
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        (msg: string) => Eraro.al("#elekto_indikoj",msg)
    );
    /*
      $.get('../voko/fakoj.xml')
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 404) {
                    $("#elekto_indikoj").html('Pardonu, la listo de stiloj ne troviĝis sur la servilo.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#elekto_indikoj").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
                //$("#referenco_error").show()  
        });
        */
    
    $.when(get_stiloj,get_fakoj)
     .done(
        function(stiloj_data,fakoj_data) {  
           var indikoj='';
            
           indikoj += /*<div class='reghim_btn' data-cmd='fermu' title='kaŝu la klavaron'><span>kaŝu<br/>&#x2b07;&#xFE0E;</span></div>"
                    +*/ "<div class='reghim_btn' data-cmd='klavaro' title='krom-klavaro'><span>&lt;&hellip;&gt;<br/>[&hellip;]</span></div>";

           
            stiloj_data.querySelectorAll("stilo").forEach(
                        function(e) {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            indikoj += "<div class='stl' data-stl='"
                                + e.getAttribute("kodo") 
                                + "' title='" + "stilo: " + e.textContent + "'>"
                                + "<span>" 
                                + e.textContent
                                + "<br/>"
                                + e.getAttribute("kodo") 
                                + "</span></div>";
                            
                        });
    
            fakoj_data.querySelectorAll("fako").forEach(
                        function(e) {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            indikoj += "<div class='fak' data-fak='"
                                + e.getAattribute("kodo")
                                + "' title='"
                                + "fako: " + e.textContent 
                                + "'><img src='" + e.attr("vinjeto")
                                + "' alt='" + e.getAattribute("kodo") 
                                + "'><br/>"
                                + e.getAattribute("kodo") 
                                + "</div>";
                            
                        });
            
            indikoj += "<div class='ofc' data-ofc='*' title='fundamenta (*)'><span>funda-<br/>menta</span></div>";
            for (var i=1; i<10; i++) {
                indikoj += "<div class='ofc' data-ofc='" + i + "' title='" + i + "a oficiala aldono'><span><b>" + i + "a</b> aldono" + "</span></div>";
            }
            
            indikoj += "<div class='gra' data-vspec='tr' title='vortspeco: transitiva verbo'><span>tr.<br/>verbo</span></div>";
            indikoj += "<div class='gra' data-vspec='ntr' title='vortspeco: netransitiva verbo'><span>netr.<br/>verbo</span></div>";
            indikoj += "<div class='gra' data-vspec='x' title='vortspeco: verbo (x)'><span>tr./ntr.<br/>verbo</span></div>";
            indikoj += "<div class='gra' data-vspec='abs.' title='vortspeco: absoluta, senkomplementa verbo'><span>abs.<br/>verbo</span></div>";
            indikoj += "<div class='gra' data-vspec='subst.' title='vortspeco: substantivo'><span>subs- tantivo</span></div>";
            indikoj += "<div class='gra' data-vspec='adj.' title='vortspeco: substantivo'><span>adjek- tivo</span></div>";
            indikoj += "<div class='gra' data-vspec='adv.' title='vortspeco: substantivo'><span>adver- bo</span></div>";
            indikoj += "<div class='gra' data-vspec='artikolo' title='vortspeco: artikolo'><span>arti-<br/>kolo</span></div>";
            indikoj += "<div class='gra' data-vspec='determinilo' title='vortspeco: determinilo'><span>deter- minilo</span></div>";
            indikoj += "<div class='gra' data-vspec='interjekcio' title='vortspeco: interjekcio'><span>inter- jekcio</span></div>";
            indikoj += "<div class='gra' data-vspec='konjunkcio' title='vortspeco: konjunkcio'><span>konjunk- cio</span></div>";
            indikoj += "<div class='gra' data-vspec='prefikso' title='vortspeco: prefikso'><span>pre- fikso</span></div>";
            indikoj += "<div class='gra' data-vspec='sufikso' title='vortspeco: sufikso'><span>su-<br/>fikso</span></div>";
            indikoj += "<div class='gra' data-vspec='prepozicio' title='vortspeco: prepozicio'><span>prepo- zicio</span></div>";
            indikoj += "<div class='gra' data-vspec='prepoziciaĵo' title='vortspeco: prepoziciaĵo'><span>prepo- ziciaĵo</span></div>";
            indikoj += "<div class='gra' data-vspec='pronomo' title='vortspeco: pronomo'><span>pro- nomo</span></div>";
            
            DOM.al_html( "#elekto_indikoj",indikoj);
            
            $( "#elekto_indikoj" ).on("click","div",indikon_enmeti);
            
        });
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






