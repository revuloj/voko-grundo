
/* jshint esversion: 6 */

// (c) 2016 - 2022 Wolfram Diestel
// laŭ GPL 2.0

import { show_xhr_error } from './ui_dlg.js';
import { vortokontrolo, xmlkontrolo, klrkontrolo, surmetita_dialogo } from './ui_err.js';
import { vikiSerĉo, citaĵoSerĉo, regulEsprimo, verkoListo, verkoPeriodo, verkElekto, retoSerĉo, bildoSerĉo } from './ui_srch.js';

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
    $( "#tabs" ).tabs({
        activate: activate_tab,
        beforeActivate: before_activate_tab
    });
    $( "#tabs" ).tabs()
        .addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#tabs ul" ).tabs()
        .removeClass("ui-corner-all");
    $( "#tabs li" )
        .removeClass( "ui-corner-top" )
        .addClass( "ui-corner-right" ); 
       
    $(".menu_toggle").button();
    $(".menu_toggle").click(
        () => {
            const sb = $("#xml_sidebar");
            sb.toggle();
            if (sb.is(":visible")) {
                $("#menu_show_btn").text("\u00ab");
            } else {
                $("#menu_show_btn").text("\u2630");
            }
        }
    );
  //###### subpaĝoj

  //### XML-redaktilo
    
    var artikolo = $("#xml_text").Artikolo({
        poziciŝanĝo: function() {
            // tion ni povos forigi
            /*
            var line_pos = $("#xml_text").getCursorLinePos();
            $("#edit_position").text("linio " + (line_pos.line+1) + ", " + (line_pos.pos+1));
            */
            // tion ni uzu estonte:
            // aktualigu pozicion
            const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
            const pos = xmlarea.position();
            $("#position").text((1+pos.line)+":"+(1+pos.pos));
        },
        tekstŝanĝo: function() {
            // fermu la navigilon, ĉar ĝi bezonas aktualigon, kio okazas per
            // evento "change" nur post forlaso de la XML-tekst-areo
            /*
            $("#collapse_outline").accordion({active:false});
            */
            $("#rigardo").empty();
        },
        xmlarea: new Xmlarea("xml_text",
            function(subt,index,selected) {
                const sel_stru = document.getElementById("art_strukturo");
                if (index == 0) sel_stru.textContent = ''; // malplenigu la liston ĉe aldono de unua ero...        
                if (selected) {
                    sel_stru.append(ht_element('option',{value: subt.id, selected: 'selected'},subt.dsc));
                } else {
                    sel_stru.append(ht_element('option',{value: subt.id},subt.dsc));
                }
            }
        )        
    });
    $("#xml_text").keypress(xpress);
    $("#art_strukturo").on("change", function(event) {
        const val = event.target.value;
    
        // tio renovigas la strukturon pro eblaj intertempaj snc-/drv-aldonoj ks...
        // do ni poste rekreos ĝin kaj devos ankaŭ marki la elektitan laŭ _item_
        const art = $("#xml_text");
        const xmlarea = art.Artikolo("option","xmlarea");
        xmlarea.changeSubtext(val,true);
        // okazigu eventon poziciŝanĝo ĉe Artikolo...
        art.Artikolo("option","poziciŝanĝo")();        
        //show_pos();
    });

    $("#kromklvr").button();
    $("#kromklvr").click(() => {
        const pressed = 1 - $("#kromklvr").val();
        $("#kromklvr").val(pressed);
        //$("#dock_klavaro").toggle()
        if (pressed) {
            $("#dock").show();
        } else {
            $("#dock").hide();
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
    $("#dock_eraroj").Erarolisto({});
    $("#dock_avertoj").Erarolisto({
        a_click: function(event) {
            const a = $(event.currentTarget);
            const span = a.parent();
            if (span.hasClass('snc_mrk')) {
                const art = $("#xml_text");
                const xmlarea = art.Artikolo("option","xmlarea");
                xmlarea.goto(span.parent().attr("value"),4);
                art.Artikolo("elekto","<snc mrk=\"" + a.text() + "\"","<snc");
                span.parent().remove();
            } else if (span.hasClass('klr_ppp')) {
                const art = $("#xml_text");
                const xmlarea = art.Artikolo("option","xmlarea");
                xmlarea.goto(span.parent().attr("value"),14);
                art.Artikolo("elekto",a.text(),"<klr>...</klr>");
                span.parent().remove();
            } else {
                surmetita_dialogo("static/anaklar.html","klarigo_teksto", "klarigo_" + span.attr("data-takso"));
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
    $("#dock_klavaro").Klavaro({
        artikolo: artikolo,
        posedanto: "#xml_text",
        akampo: "#xml_text",
        reĝimpremo: function(event,ui) {
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
                    $( "#tabs" ).tabs( "option", "active", 2 );
                    break;
            }
        },
        postenmeto: function(event,ui) {
            const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
            xmlarea.setUnsynced();
        }
    });

    // kromklavarbutonon kaŝu komence
    $("#kromklavaro").hide();
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
        $( "#tabs" ).tabs( "option", "active", 1 );
        //iru_al(pozicio_html);
        antaurigardo();
    });

    //### subpaĝo "serĉo"
    $("#s_klasikaj").click("klasikaj",citaĵoSerĉo);
    $("#s_elektitaj").click("elektitaj",citaĵoSerĉo);

    $("#sercho_det_regexes").on("toggle",() => {
        if (! $("#re_radiko").val()) {
            const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
            $("#re_radiko").val(xmlarea.getRadiko());
        }
    });
    $("#sercho_det_verklisto").on("toggle",verkoListo);
    $("#sercho_verklisto button").click(verkElekto);
    verkoPeriodo();

    $("#s_vikipedio").click(vikiSerĉo);
    $("#s_anaso").click(retoSerĉo);
    $("#s_bildoj").click(bildoSerĉo);

    //$("#regexes input[type='button']").button();
    $("#regexes input[type='radio']").checkboxradio();
    $("#regexes input[type='checkbox']").checkboxradio();
    /*
    $("#re_b").click(
        () => $("#sercho_sercho")
            .val("\\b"+$("#sercho_sercho").val())
    );*/
    $("#regexes input").click(regulEsprimo);
    $("#re_radiko").on("input",regulEsprimo);

    $( "#sercho_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#sercho_sercho",
        akampo: "#sercho_sercho",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#sercho_sercho").val("");
            }
        }
    });
    $("#sercho_sercho").keypress(xpress);
    $("#re_radiko").keypress(xpress);

    $("#sercho_error").hide();
    $("#sercho_sercho").Checks({
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
        $("#xml_text").Artikolo("backup");
    });
 
    // klarigo-notoj per muso elekteblaj
    /* provizore malŝaltu ĉar ĝi kolizias kun .empty ĉe kontrolo...!
    $("#dock_avertoj").tooltip({
        items: "span.ana_klarigo",
        //content: "klarigoj..."
        content: function() {
          var el = $(this);
          var takso = el.attr("data-takso");
          switch (takso) {
            case "neanalizebla": return 'Vorto <span class="neanalizebla">neanalizebla</span>, '+
              'ekz. ĉar: <ul><li>Radiko aŭ vortelemento mankas en la vortaro, evitinda, ' +
              'sen klara vortspeco. Ekz. "in" aplikiĝas nur al bestoj. ' +
              '<li>Vorto fremdlingva aŭ nomo, ofte aperantaj en ekzemploj: ' +
              '"Carlos". Marku per &lt;nac&gt; aŭ &lt;nom&gt;. ' +
              '<li>Vorto malĝuste kunigita, ekz. ' +
              '"depost" anstataŭ "de post"... Enŝovu spacsignon aŭ en citaĵo marku '+
              'per &lt;esc&gt;. ' +
              '<li>Vorto kun ne-ea litero aŭ alia signo: Volap|ü|k, ĝeni[n]ta k.s. ' +
              '<li>Mallongigo, kiun la vortanalizilo ne komprenas. ' +
              '<li>Verbo ne markita kiel transitiva, ekz. "abol/it/a". ' +
              '<li>Vorto ne derivita/kunmetita laŭgramatike.' +
              '</ul>';
            case "dubebla":
              return 'Vortoj <span class="dubebla">dubeblaj</span> ' +
                'havas pli ol tri radikojn, kio estas relative malofte, kaj povas signi ' +
                'misanalizitan vorton, sed eble ankaŭ tajperaron.';
            case "kuntirita":
            return ' Vortoj <span class="kuntirita">kuntiritaj</span> ' +
                'foje estas, depende de la vidpunkto, malĝustaj aŭ stile neglataj. ' +
                'Ordinare oni ne kuntiras adverbon kun posta adjektivo "ĵusnaskita" anstataŭ "ĵus naskita", ' +
                '"nebona" anstataŭ "ne bona". Sed multaj, eble influita de sia nasklingvo, tamen faras. ' +
                'Mi rekomendas korekti tian uzon en difinoj, sed en citaĵoj marki per &lt;esc&gt;.';
          }
        }
    });*/

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
    $("#dock_eraroj").empty();
    $("#dock_avertoj").empty();

    xmlkontrolo();
    klrkontrolo();
    vortokontrolo();

    switch_dock_klavaro_kontrolo();
}

/**
 * Montras la panelon kun la redaktobutonoj de elementoj, specialsignoj... 
 */
function switch_dock_indikoj() {
    $("#elekto_indikoj").show();
    $("#dock_kontrolo").hide();
    $("#dock_klavaro").hide();
    $("#kromklavaro").show();   
}

/**
 * Montras la panelon kun la kromklavaro kaj la kontrolrezultoj
 */
function switch_dock_klavaro_kontrolo() {
    $("#elekto_indikoj").hide();
    $("#dock_kontrolo").show();
    $("#dock_klavaro").show();
    $("#kromklavaro").hide();   
}


//*********************************************************************************************
//* Aktualigoj dum redaktado (pozicio, navigilo, tekstelekto, klavpremoj) 
//*********************************************************************************************

/*
 * Plenigas liston kun alstireblaj derivaĵoj
 */
/*
function fill_outline() {
    var drvoj = $("#xml_text").Artikolo("drv_markoj"); // drvMrkoj($("#xml_text").val());

    var outlineStr = "<ol>";
    if (drvoj) {
        for (var i=0; i<drvoj.length; i++) {
            var drv = drvoj[i];
            var id = "outline_"+drv.line;
            var li_ref = '#'+id;
            outlineStr += '<li id="' + id + '" value="' + (drv.line+1) + '">' + drv.kap + '</li>';
            $("#art_outline").on("click",li_ref,drv,function(event) {
                var drv = event.data;
                iru_al(drv)                
            });
        }
    }
    outlineStr += "</ol>"
    $("#art_outline").empty();
    $("#art_outline").html(outlineStr);
}
*/

/*
 * Iras al derivaĵo en la artikolo
 * @param {string} drv 
 */
/*
function iru_al(drv) {
    if (drv) {
        var page =  $( "#tabs" ).tabs( "option", "active");

        if (page == 0) { // Xml-redakto-paĝo 
            ///$("#xml_text").data("ignoreSelect",1);
            $("#xml_text").selectRange(drv.pos); // ruliĝas al aktuala pozicio nur se start=end
            $("#xml_text").selectRange(drv.pos,drv.pos+5); // nur nun marku pli...
            //$("#xml_text").on("select",xml_text_selected);
            
            // ne plu memoru la pozicion...
            pozicio_xml = drv;
            
        } else if (page == 1) { // antaŭrigardo
            window.location.hash = drv.mrk;
            
            // memoru la pozicion...
            pozicio_html=drv;
        }

    }
}
*/


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
        const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
        const elektita = xmlarea.selection();
        const radiko = xmlarea.getRadiko();
       
        var sercho = replaceTld(radiko,elektita)
           .replace(/<[^>]+>/g,'')
           .replace(/\s\s+/g,' ');
        if ( sercho.length > 0 ) {
            $("#sercho_sercho").val(sercho);
            $("#sercho_det_regexes").removeAttr("open");
        }

    } else if (old_p == "html" && new_p == "sercho") {
        var selection = $("#rigardo").selection();
        if ( selection.length > 0 ) {
            $("#sercho_sercho").val(selection);
            $("#sercho_det_regexes").removeAttr("open");
        }
    }

    // alirante la serĉon ni distingas internan kaj eksteran serĉadon
    if (new_p == "sercho") {
        if(new_t == "t_s_ext") {
            $("#sercho_form .s_ext").show();
            $("#sercho_form .s_int").hide();
        } else {
            $("#sercho_form .s_ext").hide();
            $("#sercho_form .s_int").show();
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
        $('#xml_text').focus();
        // kaj forgesu...
        //lasta_salto = null;
    } 

}

/**
 * Montras la antaŭrigardon de la artikolo
 */
function antaurigardo() {
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");

    /* teorie ni povos ŝapri remeti antaŭrigardon, se nenio
    intertempe ŝanĝiĝis (xmlarea.ar_in_sync...), sed estas malfacile fidinde
    eltrovi tion pro kio en antaŭaj eldonoj ni havis manan refreŝbutonon...
    'sync' ja okazas ekz-e ĉe kontrolo kaj tradukado sen ke la antaŭrigardo estas
    refreŝigata. Do ni aldonu flagon ankoraŭ en xmlarea, kiu memoras, ĉu ni
    iam kreis aktualan antaŭrigardon post la lasta efektiva ŝanĝo.
    */
    if ($("#rigardo").html() && xmlarea.ar_in_sync) {
        xmlarea.saltu();
        return;
    }

    const xml_text = xmlarea.syncedXml(); //$("#xml_text").val();
    
      if (! xml_text) {
        // PLIBONIGU: eble aldone testu: xml.startsWith("<?xml")
        return;
      }
    
      $("body").css("cursor", "progress");
      $.post(
            "revo_rigardo", 
            //{ art: $("shargi_dosiero").val() },
            { xml: xml_text })
        .done(
            function(data) {   
                // ial elektilo "article" ne funkcias tie ĉi !?
                //const article = $( data ).find( "article" );
                const article = $(data).find("#s_artikolo").parent();
                const footer = article.next();

                //$("#rigardo").html(data);
                $("#rigardo").empty().append(article).append(footer);
                xmlarea.ra_in_sync = true;
                xmlarea.saltu();

                // refaru matematikajn formulojn, se estas
                if (typeof(MathJax) != 'undefined' && MathJax.Hub) {
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                }
                
                // korektu ligilojn en <a href...
                $("#rigardo a").each( function() {
                    const href = $(this).attr('href');
                    let newUrl;
                    if (href && href[0] != '#' && href.slice(0,4) != 'http') {
                        if (href[0] != '/' && href[0] != '.') {
                        // referenco al alia artikolo
                            // var newUrl = revo_url + '/revo/art/' + href;
                            const art = href.split('.')[0];
                            newUrl = revo_url + '/index.html#' + art;
                            //console.debug(href+" -> "+newUrl);
                            $(this).attr('href', newUrl);
                            $(this).attr('target', '_new');
                        } else if (href.slice(0,3) == '../' ) {
                        // relativa referenco al Revo-dosiero, ekz-e indekso
                            newUrl = revo_url + '/revo/'+href.slice(3);
                            //console.debug(href+" -> "+newUrl);
                            $(this).attr('href', newUrl);
                            $(this).attr('target', '_new');
                        } else if (href[0] == '/' ) {
                        // absoluta referenco al Revo-dosiero
                            newUrl = revo_url + href;
                            //console.debug(href+" -> "+newUrl);
                            $(this).attr('href', newUrl);
                            $(this).attr('target', '_new');
//                        } else {
                            //console.debug("lasita: " + href);
//                            null
                        }
                    }
                });  
                
                $("#rigardo img").each(function() {
                    var src = $(this).attr('src');
                    if ( src.slice(0,7) == '../bld/' ) {
                        $(this).attr('src',revo_url + '/revo/bld/'+src.slice(7));
                    }
                });

                // anstataŭigu GIF per SVG  
                fix_img_svg(document.getElementById('rigardo'));

                /** anstataŭigo de URL ne funkcias, anst. servu de la redaktilo fone (kiel proxy)...
                $("#rigardo embed").each(function() {
                    var src = $(this).attr('src');
                    if ( src.slice(0,7) == '../bld/' ) {
                        $(this).attr('src','http://retavortaro.de/revo/bld/'+src.slice(7))
                    }
                });
                $("#rigardo object").each(function() {
                    var src =$(this).attr('data');
                    if ( src.slice(0,7) == '../bld/' ) {
                        $(this).replaceWith('<object data="http://retavortaro.de/revo/bld/'
                            +src.slice(7)+'" type="image/svg+xml"></object>');
                    }
                });
                 */
                $("#rigardo source").each(function() {
                    var src = $(this).attr('srcset');
                    if ( src.slice(0,7) == '../bld/' ) {
                        $(this).attr('srcset', revo_url + '/revo/bld/'+src.slice(7));
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
                    $("#rigardo footer a[href*='/dok/']").replaceWith(".");
                    $("#rigardo footer a[href*='/xml/']").replaceWith(".");
                    $("#rigardo footer a[href*='/cgi-bin/']").replaceWith(".");
                }

                /*
                iru_al(pozicio_html);
                */
            })
        .fail (
            // FARENDA: eble metu eraron en apartan kampon 
            // anst. uzi alert..., tiam vi povas uzi $.alportu
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 400) {
                    // alert("Eraro dum transformado: " + xhr.responseText);
                    $("#rigardo").html("<p>Eraro dum transformado:</p><pre>" 
                        + quoteattr(xhr.responseText) + "</pre>");
                } else {
                    /* PLIBONIGU: ĉe HTTP-500 verŝajne la seanco ne plu ekzistas,
                    ĉu ni povas distingi tion? eble mesaĝo: http_session `_53070' does not exist
                    Ni traktu HTTP-500 iom unuece kaj konduku la uzanton kun iom da helpo
                    al resaluto, ĉu?
                    */
                   show_xhr_error(xhr,"Ho ve, okazis eraro:",
                    "Supozeble via seanco forpasis kaj vi devas resaluti!");
                }
        })
        .always(
               function() {
                   $("body").css("cursor", "default");
        });
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
    
    var get_stiloj = $.ricevu('../voko/stiloj.xml',"#elekto_indikoj");
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
    
    var get_fakoj = $.ricevu('../voko/fakoj.xml',"#elekto_indikoj");
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

           
            $("stilo",stiloj_data).each(
                        function(i,e) {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            indikoj += "<div class='stl' data-stl='"
                                + $(this).attr("kodo") 
                                + "' title='" + "stilo: " + $(this).text() + "'>"
                                + "<span>" 
                                + $(this).text()
                                + "<br/>"
                                + $(this).attr("kodo") 
                                + "</span></div>";
                            
                        });
    
            $("fako",fakoj_data).each(
                        function(i,e) {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            indikoj += "<div class='fak' data-fak='"
                                + $(this).attr("kodo")
                                + "' title='"
                                + "fako: " + $(this).text() 
                                + "'><img src='" + $(this).attr("vinjeto")
                                + "' alt='" + $(this).attr("kodo") 
                                + "'><br/>"
                                + $(this).attr("kodo") 
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
            
            $( "#elekto_indikoj" ).html(indikoj);
            
            $( "#elekto_indikoj" ).on("click","div",indikon_enmeti);
            
        });
}

/**
 * Enmetas klakitan indikon en la XML-tekston
 * @param {*} event 
 */
function indikon_enmeti(event) {
    event.preventDefault();
    var enmetu = '';
    
    var cmd = $(this).attr("data-cmd");
    if (cmd == "fermu") {
      $("#elekto_indikoj").hide();
      $("#kromklavaro").show(); // butono por reaperigi kromklavaron poste
    } else if (cmd == "klavaro") {
      montri_kromklavaron();
    }
    else {
      switch (this.className) {
        case "stl":
            enmetu = '<uzo tip="stl">' + $(this).attr("data-stl") + '</uzo>';
            break;
        case "fak":
            enmetu = '<uzo tip="fak">' + $(this).attr("data-fak") + '</uzo>';
            break;
        case "ofc":
            enmetu = '<ofc>' + $(this).attr("data-ofc") + '</ofc>';
            break;
        case "gra":
            enmetu = '<gra><vspec>' + $(this).attr("data-vspec") + '</vspec></gra>';
            break;
        }
        
        if (enmetu) {
            //$("#xml_text").insert(enmetu);
            const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
            xmlarea.selection(enmetu);
        }
    }
}






