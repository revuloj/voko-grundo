
/* jshint esversion: 6 */

// (c) 2016 - 2018 - Wolfram Diestel
// laŭ GPL 2.0

import { show_error_status, surmetita_dialogo } from './ui_err.js';

// aldonu al jQuery UI dialog proprajn metodojn
// bezonatajn en la redaktilaj dialogoj
console.debug("Instalante la dialogfunkciojn...");
$.widget( "ui.dialog", $.ui.dialog, {

    // Default options.
    options: {
            kampoj: {},
            autoOpen: false,
            width: "auto",
            closeText: "", // fermu
            show: {
                effect: "fade"
            },
            hide: {
                effect: "fade"
            },
            valorŝanĝo: null // evento lanĉita, post voko de "valoroj" kun novaj valoroj
    },

    valoroj: function(values) {
        const kampoj = this.options.kampoj;
        if (values === undefined) {
            // return values
            let vals = {};
            for (let key in kampoj) {
                let k = $(kampoj[key]);
                if (k.attr("type") == "checkbox" || k.attr("type") == "radio") {
                    vals[key] = k.is(":checked");
                } else {
                    vals[key] = $(k).val();
                }
            }
            return vals;
        } else {
            // set values
            for (let key in kampoj) {
                let k = $(kampoj[key]);
                if (key in values) {
                    let value = values[key] ? values[key] : '';
                    if (k.attr("type") == "checkbox" || k.attr("type") == "radio") {
                        k.prop("checked",values[key]);
                    } else {
                        k.val(value);
                    }
                }
            }
            this._trigger("valorŝanĝo");
        }
    },

    shrink: function() {
        const el = this.element;
        el.hide(); 
        el.prev(".ui-dialog-titlebar").hide();
        this._setOption("position",{
            my: "center top",
            at: "center top+5",
            of: "#xml"
        });
        $("#xml_text").focus();
    },

    expand: function() {
        const el = this.element;
        el.show(); 
        el.prev(".ui-dialog-titlebar").show();
        this._setOption("position",{
            my: "center center",
            at: "center center",
            of: window
        });
    },

    toggle: function() {
        if (this.element.is(':visible')) {
            this.shrink();
        } else {
            this.expand();
        }
    }

});


export default function() {
    
    //>>>>>>>> dialogo: Nova artikolo
    $( "#krei_dlg" ).dialog({
        kampoj: {
            dos: "#krei_dos",
            rad: "#krei_rad",
            fin: "#krei_fin",
            dif: "#krei_dif"    
        },
        buttons: { 
            "Krei": function() { 
                var art = $("#krei_dlg").dialog("valoroj");
                $("#xml_text").Artikolo("nova",art);
                $("#re_radiko").val(art.rad);
                $("#dock_eraroj").empty();
                $("#dock_avertoj").empty();
                $(this).dialog("close") ;
            },
            "\u2718": function() { $(this).dialog("close"); }
        },
        open: function() {
            // ĉar tiu change_count ankaŭ sen vera ŝanĝo altiĝas, 
            // ni permesu ĝis 2 lastajn ŝanĝojn sen averti
            if ($("#xml_text").Artikolo("change_count") > 2) {
                $("#krei_error").html("Averto: ankoraŭ ne senditaj ŝanĝoj en la nuna artikolo perdiĝos kreante novan.")
                $("#krei_error").show();
            } else {
                $("#krei_error").hide();
            }
        }
    });
    $( "#krei_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#krei_dlg",
        akampo: "#krei_dif",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#krei_dlg input").val("");
                $("#krei_dif").val("");
            }
        }
    });
    $("#krei_rad").keypress(xpress);
    $("#krei_dif").keypress(xpress);

    //>>>>>>>> dialogo: Artikolon ŝargi
    $( "#shargi_dlg" ).dialog({
        kampoj: {
            dosiero: "#shargi_dosiero"
        },
        buttons: {
            "Ŝargi": function(event) { 
                event.preventDefault();
                if (! $("#shargi_dosiero").validate()) return;
                var values = $("#shargi_dlg").dialog("valoroj");
                download_art(values.dosiero,"#shargi_error","#shargi_dlg");
                $("#dock_eraroj").empty();
                $("#dock_avertoj").empty();
                //$(this).dialog("close") 
            },
            "\u2718": function() { $(this).dialog("close"); } 
        },
        open: function() {
            // ĉar tiu change_count ankaŭ sen vera ŝanĝo altiĝas, 
            // ni permesu ĝis 2 lastajn ŝanĝojn sen averti
            if ($("#xml_text").val() && $("#xml_text").val() && $("#xml_text").Artikolo("change_count") > 2) {
                $("#shargi_error").html("Averto: ankoraŭ ne senditaj ŝanĝoj en la nuna artikolo perdiĝos kreante novan.")
                $("#shargi_error").show();
            } else {
                $("#shargi_error").hide();
            }

            $("#shargi_sercho").selectAll();
        }
    });
    $("#shargi_sercho").keypress(xpress);
    $("#shargi_sercho").autocomplete({
        source: shargi_sercho_autocomplete,
        select: function(event,ui) { $("#shargi_dosiero").val(ui.item.art+'.xml'); }   
    });
    $("#shargi_sercho").Checks({
        pattern: {
            regex: /^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ-]+$/,
            message: "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketo kaj spacsignoj. "+
                     "Interpunkcioj kaj apostrofo ne estas permesitaj."
        },
        err_to: "#shargi_error"
    });
    $("#shargi_dosiero").Checks({
        pattern: {
            message: "La dosiernomo (krom xml-finaĵo) konsistu el almenaŭ unu litero kaj eble pliaj: " +
                     "simplaj literoj kaj ciferoj",
            regex: /^[a-zA-Z][0-9_a-zA-Z]*(\.xml)?$/
        },
        err_to: "#shargi_error"
    });

    //>>>>>>>> dialogo: Lastaj redaktoj
    $( "#lastaj_dlg" ).dialog({
        kampoj: {
            dosiero: "#lastaj_mesagho",
        },
        position: { my: "top", at: "top+10", of: window },
        buttons: [
            { 
                text: "Reredakti",
                id: "lastaj_reredakti",
                disabled: true,
                click: function(event) {  
                    event.preventDefault();
                    if (! $("#lastaj_dosiero").validate()) return;
                    if ($("#lastaj_dosiero").data("rezulto") != "eraro") {
                        $("#lastaj_error").text("Vi povas reredakti nur artikolojn, ĉe kiuj "
                        + "troviĝis eraro dum traktado de la redaktoservo.");
                        $("#lastaj_error").show();
                        return;
                    } else {
                        var url = $("#lastaj_dosiero").data("url");
                        var dos = $("#lastaj_dosiero").val();
                        download_url(url,dos,"#lastaj_error","#lastaj_dlg");
                        $("#dock_eraroj").empty();
                        $("#dock_avertoj").empty();
                        //$(this).dialog("close") 
                    }
                }
            },
            {
                text: "\u25f1",
                click: function() { $("#lastaj_dlg").dialog("toggle"); }
            },
            {
                text: "\u2718",
                click: function() { $(this).dialog("close"); }
            }
        ], 
        open: function() {
            $("#lastaj_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
            plenigu_lastaj_liston();            
            $("#lastaj_error").show();
        }
    });    
    $("#lastaj_dosiero").Checks({
        pattern: {
            message: "Bonvolu elekti artikolon en la listo por malfermi.",
            regex: /^[a-zA-Z][0-9_a-zA-Z]*(\.xml)?$/
        },
        err_to: "#lastaj_error"
    });
    $( "#lastaj_tabelo" ).on("click","td",lastaj_tabelo_premo);
    $( "#lastaj_rigardu").click(
        function(event) {
            event.preventDefault();
            var url = $(this).data("url");
            window.open(url);
        });


    //>>>>>>>> dialogo: Artikolon sendi tra servilo
    $( "#sendiservile_dlg" ).dialog({
        buttons: { 
            "Submeti": sendi_artikolon_servile,
            "(Sendi)": sendi_artikolon_servile,
            "\u2718": function() { $(this).dialog("close"); }
        }, 
        open: function() {
            $("#sendiservile_error").hide();
            if ($("#xml_text").Artikolo("option","reĝimo") == "aldono") {
                $("#sendiservile_komento").val($("#krei_dos").val());
                $("#sendiservile_komento").prop('disabled',true);
            } else {
                $("#sendiservile_komento").val('');
                $("#sendiservile_komento").prop('disabled',false);
            }        
        }
    });
    $("#sendiservile_komento").Checks({
        nonemtpy: "Necesas doni mallongan priskribon de viaj ŝanĝoj. Kion vi redaktis?",
        pattern: {
            regex: /^[\x20-\x7E\xC0-\xFF\u0100-\u017F]+$/,
            message: "En la priskribo nur latinaj signoj estas permesitaj."
        },
        err_to: "#sendiservile_error"
    });   
   
    ///>>>>>>>> dialogo: Enmeti referencon
    $( "#referenco_dlg" ).dialog({
        kampoj: {
            tip: "#referenco_tipo",
            grp: "#referenco_grp",
            cel: "#referenco_celo",
            lst: "#referenco_listo",
            enh: "#referenco_enhavo"
        },
        buttons: { 
            "Enmeti la referencon": referenco_enmeti,
            "\u25f1": function() { $("#referenco_dlg").dialog("toggle") ;},
            "\u2718": function() { $(this).dialog( "close" ); }
        }, 
        open: function() {
            $("#referenco_error").hide();
            $("#referenco_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
            // se io estas elektita jam serĉu
            var sel = $("#xml_text").textarea_selection();
            if (sel) {
                $("#referenco_celo").val('');
                $("#referenco_enhavo").val('');
                $("#referenco_sercho").val(sel);
                $("#referenco_sercho").autocomplete("search");
            }
        }
    }); 
    /*
    $( "#referenco_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#referenco_sercho",
        akampo: "#referenco_sercho"
    });
    $( "#referenco_butonoj2").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#referenco_sercho",
        akampo: "#referenco_sercho"
    });
    */
    $("#referenco_listo").keypress(xpress);
    $("#referenco_sercho").keypress(xpress);
    $("#referenco_enhavo").keypress(xpress);

    $( "#referenco_sercho" ).Checks({
        err_to: "#referenco_error",
        pattern: {
            regex: /^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ\-]+$/,
            message: "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketoj kaj spacsignoj. " +
                     "Interpunkcioj kaj apostrofo ne estas permesitaj."
        }
    });
    $( "#referenco_listo" ).prop('disabled',( $( "#referenco_tipo" ).val() != 'lst') );
    $( "#referenco_tipo" ).change( function() {
        if ($( "#referenco_tipo" ).val() == 'lst') {
            $( "#referenco_listo" ).prop('disabled',false);
        } else {
            $( "#referenco_listo" ).val('');
            $( "#referenco_listo" ).prop('disabled',true);
        }
    });    
    plenigu_referenco_listojn();
    $( "#referenco_sercho" ).autocomplete({
        source: referenco_sercho_autocomplete,
        select: function(event,ui) {
            var item = ui.item;
            var enhavo = item.num == "" ? item.kap : item.kap + "<sncref/>";
            $( "#referenco_celo" ).val(item.mrk);
            $( "#referenco_enhavo" ).val(enhavo);
        }   
    });
      
    //>>>>>>>> dialogo: Enmeti ekzemplon
    $( "#ekzemplo_dlg" ).dialog({
        kampoj: {
            frazo: "#ekzemplo_frazo",
            bib: "#ekzemplo_bib",
            vrk: "#ekzemplo_vrk",
            aut: "#ekzemplo_aut",
            url: "#ekzemplo_url",
            lok: "#ekzemplo_lok"
        },
        buttons: {   
            "Enmeti la ekzemplon": function(event) { ekzemplo_enmeti(event,false); },
            "... nur la fonton": function(event) { ekzemplo_enmeti(event,true); },
            "\u25f1": function() { $("#ekzemplo_dlg").dialog("toggle"); },
            "\u2718": function() { $(this).dialog( "close" ); }
        },
        open: function() {
            $("#ekzemplo_error").hide();
            $("#ekzemplo_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
        }
    });  
    plenigu_ekzemplo_bib();
    $( "#ekzemplo_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#ekzemplo_dlg",
        akampo: "#ekzemplo_frazo",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#ekzemplo_dlg input").val("");
                $("#ekzemplo_frazo").val("");
            }
        }
    });

    $("#ekzemplo_frazo").keypress(xpress);
    $("#ekzemplo_bib").keypress(xpress);
    $("#ekzemplo_vrk").keypress(xpress);
    $("#ekzemplo_aut").keypress(xpress);
    $("#ekzemplo_lok").keypress(xpress);

    
    //>>>>>>>> dialogo: Enmeti bildon
    $( "#bildo_dlg" ).dialog({ 
        kampoj: {
            url: "#bildo_url",
            aut: "#bildo_aut",
            prm: "#bildo_prm",
            fnt: "#bildo_fnt",
            fmt: "#bildo_fmt",
            frazo: "#bildo_frazo"
        },
        buttons: {   
            "Enmeti la bildon": function(event) { bildo_enmeti(event,false); },
            "\u25f1": function() { $("#bildo_dlg").dialog("toggle"); },
            "\u2718": function() { $(this).dialog("close"); }
        },
        open: function() {
            $("#bildo_error").hide();
            $("#bildo_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...

            if (parseFloat($("#bildo_fmt").val()) > 1) {
                bildo_larĝecoj([640,320],640); // eble ankaŭ 800?
            } else {
                bildo_larĝecoj([576,360,180],360); // eble ankaŭ 450, 768?
            }
            $( "#bildo_lrg input" ).checkboxradio("refresh");
        },
        valorŝanĝo: function() {
            if (parseFloat($("#bildo_fmt").val()) > 1) {
                bildo_larĝecoj([640,320],640); // eble ankaŭ 800?
            } else {
                bildo_larĝecoj([576,360,180],360); // eble ankaŭ 450, 768?
            }
            $( "#bildo_lrg input" ).checkboxradio("refresh");
        }
    });

    $( "#bildo_lrg input" ).checkboxradio();
    $( "#bildo_lrg" ).controlgroup();
    $( "#bildo_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#bildo_dlg",
        akampo: "#bildo_frazo",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#bildo_dlg input[type!='radio']").val("");
                $("#bildo_frazo").val("");
            }
        }
    });
    $("#bildo_frazo").keypress(xpress);

    ///>>>>>>>> dialogo: Enmeti derivaĵon
    $("#derivajho_dlg").dialog({
        kampoj: {
            kap: "#derivajho_kap",
            dif: "#derivajho_dif",
        },
        buttons: {   
            "Enmeti la derivaĵon": derivajho_enmeti, 
            "\u25f1": function() { $("#derivajho_dlg").dialog("toggle"); },
            "\u2718": function() { $(this).dialog( "close" ); }
        },
        open: function() {
            $("#derivajho_error").hide();
            $("#derivajho_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
        }
    });
    plenigu_derivajxojn();   
    $("#derivajho_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#derivajho_dlg",
        akampo: "#derivajho_dif",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#derivajho_dlg input").val("");
                $("#derivajho_dif").val("");
            }
        }
    });
    $("#derivajho_kap").keypress(xpress);
    $("#derivajho_dif").keypress(xpress);

    //>>>>>>>> dialogo: Enmeti sencon
    $("#senco_dlg").dialog({
        kampoj: {
            mrk: "#senco_mrk",
            dif: "#senco_dif"
        },
        buttons: {   
            "Enmeti la sencon": senco_enmeti,
            "\u25f1": function() { $("#senco_dlg").dialog("toggle"); },
            "\u2718": function() { $(this).dialog( "close" ); }
        },
        open: function() {
            $("#senco_error").hide();
            $("#senco_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
        }
    });
    $( "#senco_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#senco_dlg",
        akampo: "#senco_dif",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#senco_dlg input").val("");
                $("#senco_dif").val("");
            }
        }
    });
    $("#senco_dif").keypress(xpress);

    //>>>>>>>> dialogo: Enmeti tradukojn
    plenigu_lingvojn();
    $( "#traduko_dlg" ).dialog({
        position: { my: "top", at: "top+10", of: window },
        buttons: {   
            "Enmeti la tradukojn": function(event) { tradukojn_enmeti(event); },
            "\u2718": function() { $(this).dialog( "close" ); }
        },
        open: function() {
            $("#traduko_error").hide();
            //$("#traduko_tradukoj").data("trd_shanghoj",{});
            plenigu_lingvojn_artikolo();
            $("#traduko_menuo").menu("refresh");
            // jam difinita en ui_kreo... var preflng = pref_lngoj? pref_lngoj[0] : 'en'; // globala variablo
            const preflng = globalThis.preflng;
            fill_tradukojn(preflng,$("#trd_pref_"+preflng).text());
            // adaptu altecon de la tabelo
            var view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var dlg = $("#traduko_dlg").parent();
            var tab_h = (view_h * 0.80) - dlg.children(".ui-dialog-titlebar").height() - dlg.children(".ui-dialog-buttonpane").height();
            $(".dlg_tab_div").height(tab_h);        
        }
    }); 
    $( "#traduko_menuo" ).menu({
        items: "> :not(.ui-widget-header)",
        select: shanghu_trd_lingvon
    });  
    $( "#traduko_tabelo" ).on("blur","input",traduko_memoru_fokuson);
    $( "#traduko_butonoj" ).on("click","div",traduko_butono_premo);

    //>>>>>>>> dialogo: Enmeti per ŝablono
    plenigu_sxablonojn();
    $( "#sxablono_dlg" ).dialog({
        buttons: {   
            "Enmeti la tekston": sxablono_enmeti,
            "\u25f1": function() { $("#sxablono_dlg").dialog("toggle"); },
            "\u2718": function() { $( this ).dialog( "close" ); }
        },
        open: function() {
            $("#sxablono_error").hide();
            $("#sxablono_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
        }
    });
    $( "#sxablono_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#sxablono_dlg",
        akampo: ""
    });
    $( "#sxablono_elekto" ).change(kiam_elektis_sxablonon);     
    $( ".controlgroup-vertical" ).controlgroup({ "direction": "vertical" });

    //>>>>>>>> dialogo: Enmeti rimarkon
    $( "#rimarko_dlg" ).dialog({
        kampoj: {
            aut: "#rimarko_aut",
            rim: "#rimarko_rim",
            adm: "#rimarko_adm"
        },
        buttons: {   
            "Enmeti la rimarkon": function(event) { 
                event.preventDefault();
                const indent=2;
                var rim = $("#rimarko_dlg").dialog("valoroj");
                rim.rim = linirompo(rim.rim.replace(/~/g,'<tld/>'),indent);
                rim.elm = rim.adm ? 'adm' : 'rim';                   
                var rimstr = new XMLRimarko(rim,rim.elm).xml(indent*2);
                $("#xml_text").Artikolo("insert",rimstr);
                $("#rimarko_dlg").dialog("close");
                $(this).dialog("close");
            },
            "\u25f1": function() { $("#rimarko_dlg").dialog("toggle"); },
            "\u2718": function() { $(this).dialog("close"); }
        },
        open: function() {
            $("#rimarko_error").hide();
            $("#rimarko_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
        }
    });
    $( "#rimarko_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#riarko_dlg",
        akampo: "#rimarko_rim",
        reĝimpremo: function(event,ui) {
            if (ui.cmd == "blankigo") {
                $("#rimarko_dlg input").val("");
                $("#rimarko_rim").val("");
            }
        }
    });
    $("#rimarko_rim").keypress(xpress);

    /*
    //>>>>>>>> dialogo: Kontroli > homonimojn
    $( "#homonimo_dlg" ).dialog({
        kampoj: {
            dosiero: "#homonimo_dos",
        },
        position: { my: "top", at: "top+10", of: window },
        buttons: {
            "Ŝargi": function(event) { hom_art_shargi(event) },
            "\u25f1": function() { $("#homonimo_dlg").dialog("toggle") },
            "\u2718": function() { $( this ).dialog( "close" ) }  
        },
        open: function() {
            $("#homonimo_dlg").dialog("expand"); // necesas, se la dialogo estis fermita en faldita stato...
            plenigu_homonimo_liston();            
            $("#homonimo_error").show();  
        }
    });  
    $( "#homonimo_tabelo" ).on("click","td.hom_art",homonimo_tabelo_premo);
              */


    //>>>>>>>> eraro-dialogo
    $( "#error_dlg" ).dialog({
        buttons: { 
            "Resaluti": function() { location.href='../auth/logout'; },
            "\u2718": function() { $(this).dialog("close"); }
        },
        open: () => { $("#error_msg").show(); }
    });

    //>>>>>>>> surmetitta dialogo ekz. por deklaro pri datumprotekto, klarigoj/helpo ks
    $( "#surmetita_dlg" ).dialog({
        position: { my: "left top", at: "left+20 top+20", of: window },
        maxWidth: "90%" 
    });
}  


//*********************************************************************************************
//* Helpfunkcioj por dialogoj 
//*********************************************************************************************



export function shargi_sercho_autocomplete(request,response) {
    $("#shargi_dosiero").val('');
    if (! $("#shargi_sercho").validate()) return;
/*    
      if (! validate_pattern(/^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ]+$/,$("#shargi_sercho"),$("#shargi_error"),
                             "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj kaj spacsignoj. Interpunkcioj kaj apostrofo ne estas permesitaj.")) {
          return;
      }
      */
    
      var sercho = request.term; //$("#referenco_secho").val();
      var results = [];
    
  //    $("body").css("cursor", "progress");
      //$.post(
          $.alportu(
            "revo_sercho", 
            //{ art: $("shargi_dosiero").val() },
            { 
                sercho: sercho,
                lng: "eo" 
            }, show_xhr_error) //"#shargi_error")
        .done(
            function(data, status, xhr) {   
                if (xhr.status == 302) {
                    // FIXME: When session ended the OpenID redirect 302 is handled behind the scenes and here we get openid/login with status 200
                    show_xhr_error(xhr,"Via seanco finiĝis. Bonvolu resaluti!");
                } else {
                    var i;
                    for (i=0; i<data.length; i++) {
                       var label = (data[i].num != "")? data[i].kap + " " + data[i].num : data[i].kap;
                       results[i] = { 
                           value: label, 
                           art: data[i].art
                       }; 
                    }
                }
                response(results);
            });
/*            
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 400) {
                    $("#shargi_error").html('Pardonu, jen malbona serĉesprimo. Ĝi ne enhavu interpunkcion aŭ eĉ apostrofon.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#shargi_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
                $("#shargi_error").show()  
        })
        .always(
               function() {
                   $("body").css("cursor", "default");
                   response(results)
               });
               */
}

export function show_xhr_error(xhr,msg_prefix="Eraro:",msg_suffix='') {
    const msg_infix = xhr.status + " " + xhr.statusText + 
        (xhr.responseText? " " + xhr.responseText.substring(0,100) : "");
    console.error(msg_infix);
    // alert(xhr.status + " " + xhr.statusText); 
    const msg = "Ho ve, okazis eraro: " 
     + xhr.status + " " + xhr.statusText + " " + xhr.responseText;
    $( "#error_msg" ).html(msg_prefix +  "<br/>" + msg_infix + "<br/>" +  msg_suffix);
    $( "#error_dlg" ).dialog("open");    
}


/*
export function shargi_sercho_select(event,ui) {
    var item = ui.item;
    $( "#shargi_dosiero" ).val(item.art+'.xml');
}
*/

/*
export function shargi_artikolon(event) {
    event.preventDefault();

    if (! $("#shargi_dosiero").Pattern("check")) return false;
*
     if (! validate_pattern(
        /^[a-zA-Z][0-9_a-zA-Z]*(\.xml)?$/,
        $("#shargi_dosiero"),$("#shargi_err"),
            "La dosiernomo (krom xml-finaĵo) konsistu el almenaŭ unu litero kaj eble pliaj: simplaj literoj kaj ciferoj")) {
        return;
    }
*
    var values = $("#shargi_dlg").dialog("valoroj");
    download_art(values.dosiero,"#shargi_error");
}*/

/*
function hom_art_shargi(event) {
     event.preventDefault();

     var values = $("#homonimo_dlg").dialog("valoroj");

     download_art(values.dosiero,"#homonimo_error",'#homonimo_dlg',do_close=false);
     //shargi_art_dosieron("#homonimo_dlg","#homonimo_dos","#homonimo_error",false)
}
*/

function download_art(dosiero,err_to,dlg_id,do_close=true) {
    
    var fin = dosiero.slice(-4);
    if (fin == '.xml') {
        dosiero = dosiero.slice(0,-4);
    }

    $.alportu2({
          url: "revo_artikolo", 
          method: "POST",
          //{ art: $("shargi_dosiero").val() },
          data: { art: dosiero }
      }, err_to)
     .done(
        function(data) {   
            if (data.slice(0,5) == '<?xml') {
                $("#xml_text").Artikolo("load",dosiero,data);
                const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
                $("#re_radiko").val(xmlarea.getRadiko());
                $("#collapse_outline").accordion("option","active",0);
                $(err_to).hide();
                $("#tabs").tabs( "option", "active", 0);

                if (do_close) {
                    $(dlg_id).dialog("close");
                } else {
                    $(dlg_id).dialog("shrink");
                }
            } else {
                var msg = "Okazis neatendita eraro: ";
                $(err_to).html("Okazis eraro, supozeble necesas resaluti.");
            }
        });
}

function download_url(url,dosiero,err_to,dlg_id,do_close=true) {
    
    $.ricevu(url, err_to)
     .done(
        function(data) {   
            if (data.slice(0,5) == '<?xml') {
                $("#xml_text").Artikolo("load",dosiero,data);
                $("#collapse_outline").accordion("option","active",0);
                $(err_to).hide();
                $("#tabs").tabs( "option", "active", 0);

                if (do_close) {
                    $(dlg_id).dialog("close");
                } else {
                    $(dlg_id).dialog("shrink");
                }
            } else {
                var msg = "Okazis neatendita eraro: ";
                $(err_to).html("Okazis eraro, supozeble necesas resaluti.");
            }
        });
}


function sendi_artikolon_servile(event) {
    event.preventDefault();
    // $("#sendiservile_error").hide();

    const metodo = ($(event.target).text() == 'Submeti'? 'api' : 'email');
    
    // aldono (t.e. nova artikolo) aŭ redakto (t.e. ŝanĝo)
    const reĝimo = $("#xml_text").Artikolo("option","reĝimo"); 

    // ĉe novaj artikoloj komento entenas la dosiernomon
    if (! $("#sendiservile_komento").validate()) return;

    const komento = $("#sendiservile_komento").val();
    const dosiero = (reĝimo == 'aldono')? komento: $("#xml_text").Artikolo("art_drv_mrk"); 
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");

    $.alportu("revo_sendo", {
        xml: xmlarea.syncedXml(),
        shangho: komento,
        redakto: reĝimo,
        metodo: metodo,
        dosiero: dosiero

    }, "#sendiservile_error")
   .done( 
       function(data) {   
        // Montru sukceson...
        var dosiero = $("#xml_text").Artikolo("option","dosiero");
        $("#xml_text").Artikolo("change_count",0);

        var url=data.html_url;
        var msg = "<b>'" + dosiero  + "'</b> sendita. " +
        (metodo == 'api'
          ? "Kelkajn tagojn vi trovas vian redakton <a target='_new' href='"+url+"'>tie ĉi ĉe Github</a> kaj sub 'Lastaj...'."
          : "Bv. kontroli ĉu vi ricevis kopion de la retpoŝto.\n(En tre esceptaj okazoj la spam-filtrilo povus bloki ĝin...)"
          );
        $("#dock_eraroj").Erarolisto("aldonu", {
            id: "art_sendita_msg",
            cls: "status_ok",
            msg: msg
        });
        //alert("Sendita. Bv. kontroli ĉu vi ricevis kopion de la retpoŝto.\n(En tre esceptaj okazoj la spam-filtrilo povus bloki ĝin...)");
        $("#sendiservile_dlg").dialog("close");
        //$("#xml_text").val('');
        xmlarea.setText('');
        $("#shargi_dlg input").val("");
    });
/*
      $("body").css("cursor", "progress");
      $.post(
            "revo_sendo", 
            //{ art: $("shargi_dosiero").val() },
            { xml: $("#xml_text").val(),
              shangho: komento,
              redakto: reĝimo})
        .done(
            function(data) {   
                alert("Sendita. Bv. kontroli ĉu vi ricevis kopion de la retpoŝto.\n(En tre esceptaj okazoj la spam-filtrilo povus bloki ĝin...)");
                $("#sendiservile_dlg").dialog("close");
                $("#xml_text").text('');
            })
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                var msg = "Ho ve, okazis eraro: ";
                $("#sendiservile_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                $("#sendiservile_error").show()  
        })
        .always(
               function() {
                   $("body").css("cursor", "default");
               });
               */
}


function plenigu_referenco_listojn() {
    //$("body").css("cursor", "progress");
    //$.get('../voko/klasoj.xml')
    $.ricevu('../voko/klasoj.xml',"#referenco_error")
     .done(
            function(data) {  
                var seen = {}; // evitu duoblaĵojn
                $( "#referenco_listo" ).autocomplete({
                    source: $("kls",data).map(
                        function(i,e) {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            let nom = $(this).attr("nom").split('#')[1];
                            let mrk = $(this).attr("mrk");
                            let kap = $(this).attr("kap");
                            if (seen[nom]) {
                                return false;
                            } else {
                                seen[nom] = true;
                                if (mrk) mrk = mrk.split('#')[1];
                                return {value: nom, mrk: mrk, kap: kap};
                            }
                        }).get(),
                    select: referenco_listo_elekto
                });
            });
}

function referenco_listo_elekto(event,ui) {
    if (ui.item.mrk) $("#referenco_sercho").val('');
    if (ui.item.mrk) $("#referenco_celo").val(ui.item.mrk);
    if (ui.item.kap) $("#referenco_enhavo").val(ui.item.kap);
}

function referenco_sercho_autocomplete(request,response) {
    /*
      $("#referenco_error").hide();
    
      if (! validate_pattern(/^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ\-]+$/,$("#referenco_sercho"),$("#referenco_error"),
                             "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketoj kaj spacsignoj. Interpunkcioj kaj apostrofo ne estas permesitaj.")) {
          return;
      }
      */
      if (! $("#referenco_sercho").validate()) return; //Checks("check")) return;
    
      var sercho = request.term; //$("#referenco_secho").val();
      var results = Array();
    
      $.alportu("revo_sercho", 
          { sercho: sercho, lng: "eo" },
          "#referenco_error")
        .done(
            function(data) {   
                // kap+num -> enhavo
                // mrk -> celo
                //var enhavo = (data.num != "")? data.kap + "<sncref/>" : data.kap;
                var i;
                for (i=0; i<data.length; i++) {
                   var d = data[i];
                   var label = d.kap; //(d.num != "")? d.kap + " " + d.num : d.kap;
                    
                   // ĉe pluraj sencoj aldonu numeron kaj lastan parton de mrk por pli bone distingi
                   if (d.num) {                        
                      label += " " + d.num + " [" + d.mrk.split('.').slice(2) + "]";
                   }
                   results[i] = { 
                       value: label, 
                       mrk: d.mrk, 
                       kap: d.kap, 
                       num: d.num };
                }
                response(results);
            });
      /*
      $("body").css("cursor", "progress");
      $.post(
            "revo_sercho", 
            //{ art: $("shargi_dosiero").val() },
            { sercho: sercho,
              lng: "eo" })
        .done(
            function(data) {   
                // kap+num -> enhavo
                // mrk -> celo
                //var enhavo = (data.num != "")? data.kap + "<sncref/>" : data.kap;
                //$( "#referenco_celo").val(data.mrk);
                //$( "#referenco_enhavo").val(enhavo)
                var i;
                for (i=0; i<data.length; i++) {
                   var d = data[i];
                   var label = d.kap; //(d.num != "")? d.kap + " " + d.num : d.kap;
                    
                   // ĉe pluraj sencoj aldonu numeron kaj lastan parton de mrk por pli bone distingi
                   if (d.num) {  
                       
                      label += " " + d.num + " [" + d.mrk.split('.').slice(2) + "]";
                   };
                   results[i] = { 
                       value: label, 
                       mrk: d.mrk, 
                       kap: d.kap, 
                       num: d.num } 
                }
            })
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 400) {
                    $("#referenco_error").html('Pardonu, jen malbona serĉesprimo. Ĝi ne enhavu interpunkcion aŭ eĉ apostrofon.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#referenco_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
                $("#referenco_error").show()  
        })
        .always(
               function() {
                   $("body").css("cursor", "default");
                   response(results)
               });
               */
}

/*
function referenco_sercho_select(event,ui) {
    var item = ui.item;
    var enhavo = item.num == "" ? item.kap : item.kap + "<sncref/>";
    $( "#referenco_celo" ).val(item.mrk);
    $( "#referenco_enhavo" ).val(enhavo)
}
*/

function referenco_enmeti(event) {
    event.preventDefault();
    $("#referenco_error").hide();
    //var refgrp = $( "#referenco_grp" ).is(':checked');
    var ref = $("#referenco_dlg").dialog("valoroj");

    var refstr = '';

    if (ref.grp) {
        refstr = new XMLReferencGrupo(ref).xml();
    } else {
        refstr = new XMLReferenco(ref).xml();
    }
    
    var enmetu_en = $("#referenco_dlg").dialog('option','enmetu_en') || "xml_text";
    if (enmetu_en == "xml_text") {
        $("#xml_text").Artikolo("insert",refstr);
        //$("#"+enmetu_en).insert(refstr);
    } else {
        $("#"+enmetu_en).text(refstr.trim());
    }
    $("#"+enmetu_en).change();
      
    // post refgrp venos nuda referenco sekvafoje...
    if (ref.grp) {
        $("#referenco_dlg").dialog("valoroj",{grp: false, tip: "nuda"});
        $( "#referenco_listo" ).val('');
        $( "#referenco_listo" ).prop('disabled',true);
        //$( "#referenco_grp" ).prop("checked",false);
        //$( "#referenco_tipo" ).val("nuda");
    }
    $("#referenco_dlg").dialog("close");
}

function plenigu_ekzemplo_bib() {
    //$("body").css("cursor", "progress");
    $.ricevu('../voko/biblist.xml',"#ekzemplo_error")
     .done(
            function(data) {  
                $( "#ekzemplo_bib" ).autocomplete({
                    source: $("vrk",data).map(
                        function(i,e) {
                            //console.log(this + " "+i+" "+e);
                            //console.debug($(this).children("bib").text() +  ": " + $(this).children("text").text());
                            return {
                                value: $(this).children("bib").text(),
                                label: $(this).children("text").text(),
                                url: $(this).children("url").text()
                            };
                        }).get()
                });
            });
/*            
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 404) {
                    $("#ekzemplo_error").html('Pardonu, la bibliografio ne troviĝis sur la servilo.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#ekzemplo_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
                $("#ekzemplo_error").show()  
        })
        */
//        .always(
//               function() {
//                  null; // $("body").css("cursor", "default");
//               });
}


function ekzemplo_enmeti(event, nur_fnt) {
    event.preventDefault();
    $("#ekzemplo_error").hide();

    var values = $("#ekzemplo_dlg").dialog("valoroj");
    var xmlstr = '';

    if (nur_fnt) {
        const indent=8;
        xmlstr = new XMLFonto(values).xml(indent);
    } else {
        const indent=2;
        values.frazo = linirompo(values.frazo,indent);
        xmlstr = new XMLEkzemplo(values).xml(indent+4);
    }
   
    // de kie vokiĝis la dialogo tien remetu la rezulton
    var enmetu_en = $("#ekzemplo_dlg").dialog('option','enmetu_en') || "xml_text";
    if (enmetu_en == "xml_text") {
        $("#xml_text").Artikolo("insert",xmlstr);
        // $("#"+enmetu_en).insert(xmlstr);
    } else {
        $("#"+enmetu_en).text(xmlstr.trim());
    }
    $("#"+enmetu_en).change();

    $("#ekzemplo_dlg").dialog("close");
}


function bildo_enmeti(event, nur_fnt) {
    event.preventDefault();
    $("#bildo_error").hide();

    let bld =  $("#bildo_dlg").dialog("valoroj");
    bld.lrg = $("#bildo_lrg input:checked").val() || 360;
    bld.fnt_dec = bld.fnt;
    bld.fnt = encodeURI(bld.fnt);
    // ne kodigu duoble, ekz. % al %25: bld.url = encodeURI(bld.url);
    const indent = 4;
    bld.frazo = linirompo(bld.frazo,indent);

    var bldstr = new XMLBildo(bld).xml(indent);
    $("#xml_text").Artikolo("insert",bldstr);
    //$("#xml_text").insert(bldstr);    
    //$("#xml_text").change();
    $("#bildo_dlg").dialog("close");
}

function bildo_larĝecoj(lrg,chk) {
    $("#bildo_lrg input").each(function(i) {
        const el = $(this);
        el.prop("checked",false);
        let l = parseInt(el.attr("value"));
        if (lrg.indexOf(l) >=0 ) {
            $("#bildo_lrg label[for='bildo_lrg_" + l + "']").show();
            if (l == chk) {
                el.prop("checked",true);
            }
        } else {
            $("#bildo_lrg label[for='bildo_lrg_" + l + "']").hide();
        }
    });
}

/**************** helpfunkcioj por derivajho-dialogo **********/

function plenigu_derivajxojn() {
    let drv_list = '';
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");

    for (let ero in xmlarea.xmlstruct.strukturo) {
        if (ero.el == 'drv')
            drv_list += '<option value="'+el.id+'">' + el.dsc + '</option>';
    }
    $("#sxablono_listoo").append(drv_list);
}

function derivajho_enmeti(event) {
    event.preventDefault();
    $("#derivajho_error").hide();

    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");    
    
    var values = $("#derivajho_dlg").dialog("valoroj");
    //values.mrk = xmlArtDrvMrk($("#xml_text").val()); 
    const indent = 2;
    values.dif = linirompo(values.dif,indent);
    values.mrk = xmlarea.getDosiero(); 
    
    var drvxml = new XMLDerivaĵo(values).xml();

    // PLIBONIGU: pro la sinkronigado se ni estas sur nivelo de alia drv
    // la nova ŝajnas malaperi (ĝi estas super aŭ sub la aktuala)
    // do eble pli bone aldonu la novan derivaĵon rekte en la xmlstrukturon(?)
    // kaj/aŭ navigu al la nova derivaĵo, se ni estas sur nivelo art/subart/xml

    // if (values.listo == 'kursoro') {
    $("#xml_text").Artikolo("insert",drvxml,true);
    // } else {
    // ...aldoni drv rekte en la strukturon de xmlarea/xmlstruct
    //}

    // $("#xml_text").insert(drvxml);
    // $("#xml_text").change();
    $("#derivajho_dlg").dialog("close");
}

function senco_enmeti(event) {
    event.preventDefault();
    $("#senco_error").hide();

    var snc = $("#senco_dlg").dialog("valoroj");
    const indent=2;
    snc.dif = linirompo(snc.dif,indent);

    try{
        snc.drvmrk = $("#xml_text").Artikolo("drv_before_cursor").mrk;
    } catch(e) {
          // donu aprioran valoron al mrk en kazo, ke la XML ne estas valida...
          snc.drvmrk = 'XXXXXXX.YYY';
          // avertu pri la eraro
          show_error_status(e);
    }
    const sncxml = new XMLSenco(snc).xml();
    
    $("#xml_text").Artikolo("insert",sncxml,true);
    // $("#xml_text").insert(sncxml);
    // $("#xml_text").change();
    $("#senco_dlg").dialog("close");
}


/***************** traduk-dialogo ********************************************************************/


// aldonu kompletan lingvoliston kaj preferatajn lingvojn al traduko-dialogo
function plenigu_lingvojn() {
    var p_pref = $.get('revo_preflng').fail();

    var p_lingvoj = $.ricevu('../voko/lingvoj.xml',"#traduko_error");
    /*
        $.get('../voko/lingvoj.xml')
        .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (xhr.status == 404) {
                    $("#traduko_error").html('Pardonu, la listo de lingvoj ne troviĝis sur la servilo.')
                } else {
                    var msg = "Pardonu, okazis netandita eraro: ";
                    $("#traduko_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                };
        });
        */

    $.when(p_pref,p_lingvoj)
         .done(
             function(pref_data,lingvoj_data) {

                //console.debug(pref_data);
                var pref_lngoj = pref_data[0];
                globalThis.preflng = pref_lngoj[0] || 'en'; // globala variablo (ui_kreo)
                 
                var lingvoj_a_b = '';
                var lingvoj_c_g = '';
                var lingvoj_h_j = '';
                var lingvoj_k_l = '';
                var lingvoj_m_o = '';
                var lingvoj_p_s = '';
                var lingvoj_t_z = '';
                var pref_lingvoj = '';
                $("lingvo",lingvoj_data).sort(jsort_lng).each(
                        function(i,e) {
                            var kodo =$(this).attr('kodo');
                            if (kodo != 'eo') {
                                if ($.inArray(kodo, pref_lngoj) > -1) {
                                    pref_lingvoj += '<li id="trd_pref_' + $(this).attr('kodo') + '"><div>' + $(this).text() + '</div></li>';
                                    /*
                                    if (kodo == preflng) {
                                        pref_lingvoj += '<li id="trd_pref_' + $(this).attr('kodo') + '"><div>' + $(this).text() + '</div></li>';
                                    } else {
                                        pref_lingvoj += '<option value="' + $(this).attr('kodo') + '">' + $(this).text() + '</option>';
                                    }
                                    */
                                    
                                } // else {
                                    var lnomo = $(this).text();
                                    var letter = lnomo.charAt(0);
                                    var lkodo = $(this).attr('kodo');
                                    if (letter >= 'a' && letter <= 'b')
                                        lingvoj_a_b += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 'c' && letter <= 'g' || letter == 'ĉ' || letter == 'ĝ')
                                        lingvoj_c_g += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 'h' && letter <= 'j' || letter == 'ĥ' || letter == 'ĵ')
                                        lingvoj_h_j += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 'k' && letter <= 'l')
                                        lingvoj_k_l += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 'm' && letter <= 'o')
                                        lingvoj_m_o += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 'p' && letter <= 's' || letter == 'ŝ')
                                        lingvoj_p_s += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                    else if (letter >= 't' && letter <= 'z' || letter == 'ŭ')
                                        lingvoj_t_z += '<li id="trd_chiuj_' + lkodo + '"><div>' + lnomo + '</div></li>';
                                //}
                            }
                        });
                // $("#traduko_lingvoj").html(pref_lingvoj +  '<option disabled>────────────────────</option>' +lingvoj); 
                $("#traduko_aliaj").before(pref_lingvoj);
                $("#traduko_chiuj_a_b").append(lingvoj_a_b);
                $("#traduko_chiuj_c_g").append(lingvoj_c_g);
                $("#traduko_chiuj_h_j").append(lingvoj_h_j);
                $("#traduko_chiuj_k_l").append(lingvoj_k_l);
                $("#traduko_chiuj_m_o").append(lingvoj_m_o);
                $("#traduko_chiuj_p_s").append(lingvoj_p_s);
                $("#traduko_chiuj_t_z").append(lingvoj_t_z);
                $( "#traduko_menuo" ).menu("refresh");
             }
        );
}

// aldonu la traduk-lingojn de la ŝargita artikolo al la traduko-dialogo (lingvo-elekto)
function plenigu_lingvojn_artikolo() {
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
    const xml = xmlarea.syncedXml();

    var lng_nomoj = {};
    for (var kodo in traduk_lingvoj(xml)) {
        const lnomo = $("#trd_chiuj_"+kodo).children('div').text();
        lng_nomoj[lnomo] = kodo;
    }
    var lingvoj = Object.keys(lng_nomoj).sort(sort_lng);
    var lingvoj_html = '';
    for (var i=0; i<lingvoj.length; i++) {
        const lnomo = lingvoj[i];
        const kodo = lng_nomoj[lnomo];
        lingvoj_html += '<li id="trd_art_' + kodo + '"><div>' + lnomo + '</div></li>';
    }
    $("#traduko_artikolaj").empty();
    $("#traduko_artikolaj").append(lingvoj_html);
//    $("#traduko_menuo[id^=trd_art_]").remove();
//    $("#traduko_artikolaj").after(lingvoj_html);
}

function traduko_memoru_fokuson(event) {
    $("#traduko_dlg").data("last-focus",this.id);
}

function traduko_butono_premo(event) {
    ////var text = $(this).attr("data-btn");
    var cmd = $(this).attr("data-cmd");
    //var form_element = $( document.activeElement );
    var form_element_id = $("#traduko_dlg").data("last-focus")
        .replace(/\./g,'\\\.')
        .replace(/\:/g,'\\\:') || '';

    if ( form_element_id ) {
        var element = $("#" + form_element_id);
        // var form_element = $("#ekzemplo_form input:focus");
    //    if (text) {
    //        element.insert(text);
    //    } else 
        var sel = element.textarea_selection();
        var s_ = '';
        if (cmd == "[]" || cmd == "()") {
            s_ = sel || "\u2026";
            s_ = ('<klr>' + ( sel[0] != cmd[0]? cmd[0]:"" ) 
                + s_ + ( sel[sel.length-1] != cmd[1]? cmd[1]:"" ) +  '</klr>');
        // elemento-klavo
        } else {
            s_ = sel || "\u2026";
            s_ = ('<' + cmd + '>' + s_ + '</' + cmd + '>');
        } 

        element.insert(s_);
        
        trd_input_shanghita(element[0]);
    }
}



// lingvoj - sort function callback for jQuery
function jsort_lng(a, b){
    //return ($(b).text()) < ($(a).text()) ? 1 : -1;    
   // try { // 2017-06: tio ankoraŭ ne bone funkcias, ekz. en Chromium "c" venos antaŭ "ĝ" ...?
    //    $(a).text().localeCompare($(b).text(), "eo"); 
    //} catch (e) {
        var at = $(a).text();
        var bt = $(b).text();
        var pos = 0,
          min = Math.min(at.length, bt.length);
        // ne perfekte sed pli bone ol ĉ, ĝ ... tute ĉe la fino...
        var alphabet = 'AaBbCĈcĉDdEeFfGĜgĝHĤhĥIiJĴjĵKkLlMmNnOoPpRrSŜsŝTtUŬuŭVvZz';

        while(at.charAt(pos) === bt.charAt(pos) && pos < min) { pos++; }
        return alphabet.indexOf(at.charAt(pos)) > alphabet.indexOf(bt.charAt(pos)) ?
          1 : -1;
   // }
}

// lingvoj - sort function callback for normal strings
function sort_lng(at, bt){
    //try { // 2017-06: tio ankoraŭ ne bone funkcias, ekz. en Chromium "c" venos antaŭ "ĝ" ...?
    //    at.localeCompare(bt, "eo"); 
    //} catch (e) {
        var pos = 0,
          min = Math.min(at.length, bt.length);
        // ne perfekte sed pli bone ol ĉ, ĝ ... tute ĉe la fino...
        var alphabet = 'AaBbCĈcĉDdEeFfGĜgĝHĤhĥIiJĴjĵKkLlMmNnOoPpRrSŜsŝTtUŬuŭVvZz';

        while(at.charAt(pos) === bt.charAt(pos) && pos < min) { pos++; }
        return alphabet.indexOf(at.charAt(pos)) > alphabet.indexOf(bt.charAt(pos)) ?
          1 : -1;
    //}
}


function fill_tradukojn(lng,lingvo_nomo) {
    // forigu antauajn eventojn por ne multobligi ilin...
    $("#traduko_tradukoj").off("click");
    $("#traduko_tradukoj").off("change");
    
    // ĉar la tradukdialogo montras samtempe ĉiam nur tradukojn de unu lingvo
    // ni kunfandas tiujn el la artikolo, kaj tiujn, kiuj jam estas
    // aldonitaj aŭ ŝanĝitaj en la dialogo
    // var trdoj = $("#xml_text").Artikolo("tradukoj",lng); 
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
    const xmltrad = xmlarea.xmltrad;
    xmltrad.preparu(xmlarea.xmlstruct);
    xmltrad.collectTrdAllStruct(lng);
    //const trd_shanghoj = $("#traduko_tradukoj").data("trd_shanghoj") || {};

    var tableCnt = '';

    //if (trdoj) {

        // PLIBONIGU: estas neelegante tie pridemandi
        // .xmlstruct - pli bone xmlarea jam redonu la pretan
        // bezonatan strukturon por tradukprezento!
        //
        // Krom la uzo de semantikaj id-atributoj ne estas tro eleganta
        // pli bone kreu propran tradukoj-objekton kun insert, update ktp
        // kiu transprentas la administradon kaj aktualigadon...
        // ŝangojn oni devus skribi tiam nur se oni ŝanĝas lingvon aŭ enmetas tradukojn
        // en la dialogon ĝin fermante...
        for (let s of xmlarea.xmlstruct.strukturo) {
            if (['drv','subdrv','snc','subsnc'].indexOf(s.el) > -1) {
                const parts = s.dsc.split(':');
                let dsc = parts[1] || parts[0];
                if (s.el == 'snc' || s.el == 'subsnc' && parts[1]) {
                    const p = dsc.indexOf('.');
                    if (p>-1) dsc = dsc.slice(p);
                }
                if (s.el == 'drv') dsc = '<b>'+dsc+'</b>';
                tableCnt += '<tr class="tr_' + s.el + '"><td>' + dsc + '</td><td>';
            
                const trd = xmltrad.getStruct(lng,s.id);
                /*
                try {
                    // preferu jam ŝanĝitajn tradukojn
                    trd = trd_shanghoj[s.id][lng];
                } catch (e) {
                    // se ŝanĝoj ne ekzistas prenu tiujn el la XML-artikolo
                    trd = xmltrad.getStruct(lng,s.id); //trdoj[s.id];
                }*/
                
                if ( trd && trd.length ) {
                    for (let j=0; j<trd.length; j++) {
                        tableCnt += traduko_input_field(s.id,j,quoteattr(trd[j]));
                        tableCnt += "<br/>";
                    }
                } else {
                   tableCnt += traduko_input_field(s.id,0,'') + '<br/>';  
                }
                tableCnt += '</td>';
                tableCnt += '<td>' + traduko_add_btn(s.id) + '</td>';
                tableCnt += '</tr>';
            } // if drv..subsnc
        } // for s...
    //} // if trdj
    $("#traduko_lingvo").text(lingvo_nomo +" ["+lng+"]");
    $("#traduko_dlg").data("lng",lng);
    $("#traduko_tradukoj").empty();

    // enigu traduko-kampojn
    $("#traduko_tradukoj").html(tableCnt);

    // rimarku ĉiujn ŝanĝojn de unuopaj elementoj
    $("#traduko_tradukoj").on("change","input", trd_shanghita);
}

function trd_shanghita() {
    trd_input_shanghita(this);
}

function trd_input_shanghita(element) {
    const sid = element.id.split(':')[1];
    const lng = $("#traduko_dlg").data("lng");

    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
    const xmltrad = xmlarea.xmltrad;   

    // prenu ĉiujn tradukojn kun tiu marko, ne nur la ĵus ŝanĝitan
    $("#traduko_tradukoj input[id^='trd\\:" + sid + "\\:']").each( function(){
        var nro = this.id.split(':')[2];
        xmltrad.putStruct(sid,lng,nro,$(this).val());                               
    });
}

/*
function trd_put(mrk,lng,no,trd) {
    // PLIBONIGU: verŝajne estas pli efike meti aldonojn kaj ŝanĝojn 
    // al Xmlarea.tradukoj nun anstataŭ en aparta dlg-alpendo trd_shanghoj...
    var trd_shanghoj = $("#traduko_tradukoj").data("trd_shanghoj") || {};
    if (! trd_shanghoj[mrk]) trd_shanghoj[mrk] = {};
    if (! trd_shanghoj[mrk][lng]) trd_shanghoj[mrk][lng] = Array();

    trd_shanghoj[mrk][lng][no] = trd;
    $("#traduko_tradukoj").data("trd_shanghoj",trd_shanghoj);
}
*/

function traduko_input_field(mrk,nro,trd) {
    var id = "trd:" + mrk + ':' + nro; //.replace(/\./g,'\\\\.') + '_' + nro;
    return '<input id="' + id + '" type="text" name="' + id + '" size="30" value="' + trd + '"/>';
}

function traduko_add_btn(mrk) {
    var id = mrk; //.replace(/\./g,'\\\\.');
    var id_esc = mrk.replace(/\./g,'\\\.');
    $("#traduko_tradukoj").on("click","#trdadd\\:"+id_esc,function() {
        var first_input_of_mrk = $("#trd\\:" + id_esc + "\\:0");
        if (first_input_of_mrk) {
            var last_input_of_mrk = first_input_of_mrk.parent().children("input:last-of-type");
            var parts = last_input_of_mrk.attr('id').split(':');
            var next_id = parts[0] + ':' + parts[1] + ':' + (parseInt(parts[2]) + 1);
            last_input_of_mrk.after('<br/><input id="' + next_id + '" type="text" name="' + next_id + '" size="30" value=""/>');
        } // else: estu ĉiam almenaŭ unu eĉ se malplena kampo....
    });
    return '<button id="trdadd:' + id 
        + '" class="ui-button ui-widget ui-corner-all" title="Aldonu"><b>+</b></button>';
}

function shanghu_trd_lingvon(event,ui) {
    var id = ui.item.attr('id');
    if (id && id.slice(0,4) == "trd_") {
        var lng= id.split('_')[2];
        var lingvo_nomo = ui.item.text();
        //alert($("#traduko_lingvoj").val())
        fill_tradukojn(lng,lingvo_nomo);
    }
    $("#traduko_dlg").data("last-focus",'');
}

// enmetu ŝanĝitajn kaj aldonitajn tradukojn en la XML-artikolon
function tradukojn_enmeti(event) {
    // prenu la shanghitajn tradukojn
    //var trd_shanghoj = $("#traduko_tradukoj").data("trd_shanghoj"); 
    try {
        $("#xml_text").Artikolo("insert_tradukojn"); //,trd_shanghoj);
        $("#traduko_dlg").dialog( "close" );
    } catch (e) {
        $("#traduko_error").html(e.toString());
        $("#traduko_error").show();
    }
}

/***************** ŝablono-dialogo ********************************************************************/

function plenigu_sxablonojn() {
    var sxbl_list = '';
    for (let nomo in snc_sxablonoj) {
        sxbl_list += '<option>' + nomo + '</option>';
    }
    $("#sxablono_elekto").append(sxbl_list);
}

function kiam_elektis_sxablonon(event) {
    var sxbl = $("#sxablono_elekto").val();
    $("#sxablono_xml").empty();
    $("#sxablono_xml").off("keypress");
    $("#sxablono_xml").off("click");
    $("#sxablono_xml").append(new SncŜablono(sxbl).html());
    /*
    var lines = new SncŜablono(sxbl).form().split('\n');
    for (var i=0; i<lines.length; i++) {
        $("#sxablono_xml").append('<tr><td><b class="sxbl">&ndash;</b></td><td><pre class="line">'+lines[i]+'</pre></td></tr>');
    }
    */
    $("#sxablono_xml button").click(sxablono_button_click);
    //$("#sxablono_xml input[type='checkbox']").click(sxablono_checkbox_click);
    $("#sxablono_xml b.sxbl").click(sxablono_strike_click);
    $("#sxablono_xml span.sxbl").click(sxablono_span_click);
    $("#sxablono_xml input").keypress(xpress);
}

function sxablono_button_click(event) {
    event.preventDefault(); 
    var text_span = $(event.target).closest("button").prev("span");
    if (text_span) {
        if (text_span.html().startsWith('&lt;ref')) {
            $("#referenco_dlg").dialog("option","enmetu_en",text_span[0].id);
            $("#referenco_dlg").dialog("open");
            //referenco_dialogo(text_span[0].id);
        } else if (text_span.html().startsWith('&lt;ekz')) {
            $("#ekzemplo_dlg").dialog("option","enmetu_en",text_span[0].id);
            $("#ekzemplo_dlg").dialog("open");
            //ekzemplo_dialogo(text_span[0].id);
        }
    }
}


function sxablono_strike_click(event) {
    var text_line = $(event.target).closest("tr").find("pre");
    var style = text_line.css("text-decoration-line");
    text_line.css('text-decoration-line',style=="none"?"line-through":"none");
}

function sxablono_span_click(event) {
  var text_span_id = event.target.id;
 // if (text_span_id.startsWith('o_')) {
//      var checkbox = $("#"+text_span_id).next("input[type='checkbox']");
//      checkbox.prop('checked',function(i,val){return !val});
//      $("#"+text_span_id).css("text-decoration-line",checkbox.prop('checked')?"none":"line-through"); 
//  } else 
  if (text_span_id.startsWith('r_')) {
      //referenco_dialogo(text_span_id);
      $("#referenco_dlg").dialog("option","enmetu_en",text_span_id);
      $("#referenco_dlg").dialog("open");
  } else if (text_span_id.startsWith('e_')) {
      //ekzemplo_dialogo(text_span_id);
      $("#ekzemplo_dlg").dialog("option","enmetu_en",text_span_id);
      $("#ekzemplo_dlg").dialog("open");
    }
}

function sxablono_enmeti(event) {
    //$("#xml_text").insert($("#sxablono_xml").val());
    var text = '';
    $("#sxablono_xml pre").each( function() {
        var pre = $(this);
        //var cb = $(this).children("input[type='checkbox']");
        //if (cb.length == 0 || cb.prop('checked'))
        if (pre.css("text-decoration-line") != "line-through") {
            text += pre.form_text() + "\n";
        }
    });
    $("#xml_text").Artikolo("insert",text,true);
    // $("#xml_text").insert(text);
    // $("#xml_text").change();
    $("#sxablono_dlg").dialog("close");
}

function plenigu_lastaj_liston() {
    $("body").css("cursor", "progress");
    $.ricevu("revo_lastaj_redaktoj", show_xhr_error)
      .done(
        function(data, status, xhr) {   
            if (xhr.status == 302) {
                // FIXME: When session ended the OpenID redirect 302 is handled 
                // behind the scenes and here we get openid/login with status 200
                show_xhr_error(xhr,"Via seanco finiĝis. Bonvolu resaluti!");
            } else {
                var listo = '';
                var previous = null; //{kap: '', art1: '', art2: ''};
                
                for (let h=0; h< data.length; h++) {
                    var entry = data[h];
                    var status_icon;
                    switch (entry.rezulto) {
                        case 'eraro':
                            status_icon = '&#x26a0;';
                            break;
                        case 'konfirmo':
                            status_icon = '&#x2713;';
                            break;
                        default:
                            status_icon = '&#x23f2'; //'&#x2709;';
                    }

                    //if (! (previous && previous.kap == hom.kap && previous.art1 == hom.art2 && previous.art2 == hom.art1))
                    listo += '<tr class="last_art" id="'
                        + entry.id 
                        + '"><td>'
                        + entry.name.split('.')[0]
                        + '</a></td><td>'
                        + status_icon
                        + '</td><td>' 
                        + entry.created.substring(0,16).replace('T',' ') 
                        + '</td><td>' 
                        + entry.desc.split(':').slice(1).join(':')
                        + '</td></tr>';                    
                }
                
                $("#lastaj_listo").html(listo);
                $("#lastaj_listo").data("detaloj",data);
            }


            // adaptu altecon de la dialogo, por ke la listo ruliĝu sed la titolo kaj reir-butono montriĝu...
            //var dlg = $("#lastaj_dlg").parent();
            //var view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            //var decl_h = (view_h * .70) - dlg.children(".ui-dialog-titlebar").height(); // - dlg.children(".ui-dialog-buttonpane").height();
            //$("#lastaj_tabelo").height(decl_h);
        });
}


function lastaj_tabelo_premo(event) {
    event.preventDefault();
    var id = $(event.target).parent().attr('id');
    var dtl = $("#lastaj_listo").data("detaloj");
    var entry = dtl.filter(function(e) { if (e.id == id) return e; });
    if (entry) {
        entry = entry[0];
        $("#lastaj_dosiero").val(entry.name);
        $("#lastaj_dosiero").data("url",entry.xml_url);
        $("#lastaj_rigardu").data("url",entry.html_url);
        $("#lastaj_dosiero").data("rezulto",entry.rezulto);
        if (entry.rezulto == 'eraro') {
            $("#lastaj_reredakti").button("enable");
        } else {
            $("#lastaj_reredakti").button("disable");
        }
        $("#lastaj_mesagho").val('');
        if (entry.rez_url) {
            $.ricevu(entry.rez_url)
            .done(
                function(data) {  
                    var rez = JSON.parse(data); 
                    if (rez && rez.mesagho) {
                        var msg = rez.mesagho.replace(/\|\| */g,"\n").replace('[m ','[');
                        $("#lastaj_mesagho").val(msg);
                    }
                });
        } else if (! entry.rezulto) {
            $("#lastaj_mesagho").val('Atendante traktadon...');
        }
    }
}

/*
function plenigu_homonimo_liston() {
    $("body").css("cursor", "progress");
    $("#homonimo_error").show(); // montru la komentojn...
    //$.get(
    $.ricevu("homonimoj_senref", "#homonimo_error")
    .done(
      function(data, status, xhr) {   
        if (xhr.status == 302) {
            // FIXME: When session ended the OpenID redirect 302 is handled behind the scenes and here we get openid/login with status 200
            console.debug(xhr.status + " " + xhr.statusText);
            alert(xhr.status + " " + xhr.statusText); //'Seanco finiĝis. Bonvolu resaluti!');
        } else {
            var listo = '';
            var previous = null; //{kap: '', art1: '', art2: ''};
            
            for (h=0; h< data.length; h++) {
                var hom = data[h];
                
                if (! (previous && previous.kap == hom.kap && previous.art1 == hom.art2 && previous.art2 == hom.art1))
                    listo += '<tr><td>' + hom.kap + '</td><td class="hom_art">' + hom.art1 + '</td><td class="hom_art">' + hom.art2 + '</td></tr>';
                
                previous = hom;
            }
            
            $("#homonimo_listo").html(listo);
            $("#homonimo_error").html('Aktuale ne ĉiuj interreferencoj <br/> '+
                'kaŝitaj en (sub-)sencoj troviĝas. Do ne ĉiun okazon necesas korekti.');
        }
        // adaptu altecon de la dialogo, por ke la listo ruliĝu sed la titolo kaj reir-butono montriĝu...
        var dlg = $("#homonimo_dlg").parent();
        var view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var decl_h = (view_h * .70) - dlg.children(".ui-dialog-titlebar").height(); // - dlg.children(".ui-dialog-buttonpane").height();
        $("#homonimo_tabelo").height(decl_h);
    })
}

function homonimo_tabelo_premo(event) {
    event.preventDefault();
    var dosiero = $(event.target).text();
    $ ("#homonimo_dos").val(dosiero);
}
*/