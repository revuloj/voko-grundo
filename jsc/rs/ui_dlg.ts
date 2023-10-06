
/*
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

import * as u from '../u';
import * as x from '../x';

/// import { xpress } from '../x';
import { DOM, Dialog, Menu, Grup, Slipar, Buton, Elektil, List, Propon, Valid, Eraro } from '../ui';

import * as sbl from './sxablonoj';
import { Artikolo } from './ui_art';
import { Erarolisto } from './ui_err';
import { revo_listoj, xtajpo } from './ui_tabl';

import { XMLReferenco, XMLReferencGrupo, XMLRimarko, XMLEkzemplo, 
         XMLFonto, XMLSenco, XMLDerivaĵo, XMLBildo, SncŜablono } from './sxabloniloj';

import { show_error_status } from './ui_err.js';
//import { xpress } from './jquery_ext';

type NovaArt = { dos: string, rad: string, fin: string, dif: string };
//type ShargArt = { dosiero: string };

/**
 * Preparas ĉiujn dialogojn
 */
export default function() {
    console.debug("Instalante la dialogfunkciojn...");
    let klv: Element|null;
    
    //>>>>>>>> dialogo: Nova artikolo
    new Dialog("#krei_dlg", {
        kampoj: {
            dos: "#krei_dos",
            rad: "#krei_rad",
            fin: "#krei_fin",
            dif: "#krei_dif"    
        },
        butonoj: { 
            "Krei": function() { 
                const dlg = Dialog.dialog("#krei_dlg");
                if (dlg) {
                    const art = <NovaArt>(dlg.valoroj());
                    Artikolo.artikolo("#xml_text")?.nova(art);
                    DOM.al_v("#re_radiko",art.rad);
                    DOM.al_t("#dock_eraroj",'');
                    DOM.al_t("#dock_avertoj",'');
                    dlg.fermu();    
                }
            },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            // ĉar tiu change_count ankaŭ sen vera ŝanĝo altiĝas, 
            // ni permesu ĝis 2 lastajn ŝanĝojn sen averti
            const cc = Artikolo.artikolo("#xml_text")?.ŝanĝnombro;
            if ( cc && cc > 2 ) {
                DOM.al_html("#krei_error","Averto: ankoraŭ ne senditaj ŝanĝoj en la nuna artikolo perdiĝos kreante novan.")
                DOM.kaŝu("#krei_error",false);
            } else {
                DOM.kaŝu("#krei_error");
            }
        }
    });

    klv = DOM.e("#krei_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#krei_butonoj","krei_dlg",
            // reĝimpremo: blankigo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#krei_dlg input");
                    DOM.malplenigu("#krei_dif");
                }
            }) // neniu postenmeto
        .elemento_klavoj();
    };
    /// DOM.klavpremo("#krei_rad",xpress);
    /// DOM.klavpremo("#krei_dif",xpress);

    xtajpo.aldonu("krei_rad");
    xtajpo.aldonu("krei_dif");

    //>>>>>>>> dialogo: Artikolon ŝargi
    new Dialog("#shargi_dlg", {
        kampoj: {
            dosiero: "#shargi_dosiero"
        },
        butonoj: {
            "Ŝargi": function(event) { 
                event.preventDefault();
                if (! Valid.valida("#shargi_dosiero")) return;
                const values = Dialog.dialog("#shargi_dlg")?.valoroj();
                download_art(values.dosiero,"#shargi_error","#shargi_dlg");
                DOM.al_t("#dock_eraroj",'');
                DOM.al_t("#dock_avertoj",'');
                //this.fermu() 
            },
            "\u2718": function() { this.fermu(); } 
        },
        malfermu: function() {
            // ĉar tiu change_count ankaŭ sen vera ŝanĝo altiĝas, 
            // ni permesu ĝis 2 lastajn ŝanĝojn sen averti
            const cc = Artikolo.artikolo("#xml_text")?.ŝanĝnombro || 0; 
            if (DOM.v("#xml_text") && cc > 2) {
                DOM.al_html("#shargi_error","Averto: ankoraŭ ne senditaj ŝanĝoj en la nuna artikolo perdiĝos kreante novan.")
                DOM.kaŝu("#shargi_error",false);
            } else {
                DOM.kaŝu("#shargi_error");
            }

            DOM.elektu("#shargi_sercho");
        }
    });
    /// DOM.klavpremo("#shargi_sercho",xpress);
    xtajpo.aldonu("shargi_sercho");
    new Propon("#shargi_sercho", {
        source: shargo_dlg_serĉo,
        select: function(event: Event, ui) { 
            DOM.al_v("#shargi_dosiero",ui.art+'.xml'); 
        }   
    });
    Valid.aldonu("#shargi_sercho", {
        pattern: {
            regex: /^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ-]+$/,
            message: "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketo kaj spacsignoj. "+
                     "Interpunkcioj kaj apostrofo ne estas permesitaj."
        },
        err_to: "#shargi_error"
    });
    Valid.aldonu("#shargi_dosiero", {
        pattern: {
            message: "La dosiernomo (krom xml-finaĵo) konsistu el almenaŭ unu litero kaj eble pliaj: " +
                     "simplaj literoj kaj ciferoj",
            regex: /^[a-zA-Z][0-9_a-zA-Z]*(\.xml)?$/
        },
        err_to: "#shargi_error"
    });

    //>>>>>>>> dialogo: Lastaj redaktoj
    new Dialog("#lastaj_dlg", {
        kampoj: {
            dosiero: "#lastaj_mesagho",
        },
        position: { my: "top", at: "top+10", of: window },
        butonoj: [
            { 
                text: "Reredakti",
                id: "lastaj_reredakti",
                disabled: true,
                click: function(event) {  
                    event.preventDefault();
                    if (! Valid.valida("#lastaj_dosiero")) return;
                    if (DOM.datum("#lastaj_dosiero","rezulto") != "eraro") {
                        DOM.al_t("#lastaj_error","Vi povas reredakti nur artikolojn, ĉe kiuj "
                        + "troviĝis eraro dum traktado de la redaktoservo.");
                        DOM.kaŝu("#lastaj_error",false);
                        return;
                    } else {
                        var url = DOM.datum("#lastaj_dosiero","url");
                        var dos = DOM.v("#lastaj_dosiero");
                        download_url(url,dos,"#lastaj_error","#lastaj_dlg");
                        DOM.al_t("#dock_eraroj",'');
                        DOM.al_t("#dock_avertoj",'');
                        //this.fermu() 
                    }
                }
            },
            {
                text: "\u25f1",
                click: function() { this.refaldu(); }
            },
            {
                text: "\u2718",
                click: function() { this.fermu(); }
            }
        ], 
        malfermu: function() {
            //this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...
            Dialog.dialog("#lastaj_dlg")?.faldu(false);
            plenigu_lastaj_liston();            
            DOM.kaŝu("#lastaj_error",false);
        }
    });    
    Valid.aldonu("#lastaj_dosiero", {
        pattern: {
            message: "Bonvolu elekti artikolon en la listo por malfermi.",
            regex: /^[a-zA-Z][0-9_a-zA-Z]*(\.xml)?$/
        },
        err_to: "#lastaj_error"
    });
    new List("#lastaj_tabelo");
    DOM.klak("#lastaj_tabelo",lastaj_tabelo_premo);
    DOM.klak("#lastaj_rigardu",
        function(event) {
            event.preventDefault();
            if (event.target instanceof HTMLElement) {
                const url = DOM.datum(event.target,"url");
                window.open(url);    
            }
        });


    //>>>>>>>> dialogo: Artikolon sendi tra servilo
    new Dialog("#sendiservile_dlg", {
        butonoj: { 
            "Submeti": sendi_artikolon_servile,
            "(Sendi)": sendi_artikolon_servile,
            "\u2718": function() { this.fermu(); }
        }, 
        malfermu: function() {
            DOM.kaŝu("#sendiservile_error");
            const art = Artikolo.artikolo("#xml_text");
            const komt = DOM.i("#sendiservile_komento");
            if (komt) {
                if (art?.opcioj["reĝimo"] == "aldono") {
                    komt.value = DOM.v("#krei_dos") || '';
                    komt.disabled = true;
                } else {
                    komt.value = '';
                    komt.disabled = false;
                }            
            }
        }
    });
    Valid.aldonu("#sendiservile_komento", {
        nonemtpy: "Necesas doni mallongan priskribon de viaj ŝanĝoj. Kion vi redaktis?",
        pattern: {
            regex: /^[\x20-\x7E\xC0-\xFF\u0100-\u017F]+$/,
            message: "En la priskribo nur latinaj signoj estas permesitaj."
        },
        err_to: "#sendiservile_error"
    });   
   
    ///>>>>>>>> dialogo: Enmeti referencon
    new Dialog("#referenco_dlg", {
        kampoj: {
            tip: "#referenco_tipo",
            grp: "#referenco_grp",
            cel: "#referenco_celo",
            lst: "#referenco_listo",
            enh: "#referenco_enhavo"
        },
        butonoj: { 
            "Enmeti la referencon": referenco_enmeti,
            "\u25f1": function() { this.refaldu() ;},
            "\u2718": function() { this.fermu(); }
        }, 
        malfermu: function() {
            DOM.kaŝu("#referenco_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...
            // se io estas elektita, jam serĉu
            var sel = Artikolo.artikolo("#xml_text")?.elekto;
            if (sel) {
                DOM.al_v("#referenco_celo",'');
                DOM.al_v("#referenco_enhavo",'');
                DOM.al_v("#referenco_sercho",sel);
                // trovu proponojn por la teksto en serĉkampo
                Propon.propon("#referenco_sercho")?.proponu();
            }
        }
    }); 
    /// DOM.klavpremo("#referenco_listo",xpress);
    /// DOM.klavpremo("#referenco_sercho",xpress);
    /// DOM.klavpremo("#referenco_enhavo",xpress);

    xtajpo.aldonu("referenco_listo");
    xtajpo.aldonu("referenco_sercho");
    xtajpo.aldonu("referenco_enhavo");

    Valid.aldonu("#referenco_sercho", {
        err_to: "#referenco_error",
        pattern: {
            regex: /^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ\-]+$/,
            message: "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketoj kaj spacsignoj. " +
                     "Interpunkcioj kaj apostrofo ne estas permesitaj."
        }
    });
    const ref_lst = DOM.i("#referenco_listo");

    if (ref_lst) ref_lst.disabled = ( DOM.v("#referenco_tipo") != 'lst');
    DOM.ŝanĝo( "#referenco_tipo",function() {
        if (ref_lst) {
            if (DOM.v("#referenco_tipo") == 'lst') {
                ref_lst.disabled = false;
            } else {
                DOM.al_v("#referenco_listo",'');
                ref_lst.disabled = true;
            }    
        }
    });    
    referenco_dlg_preparu();
    new Propon( "#referenco_sercho", {
        source: referenco_dlg_serĉo,
        select: function(event,ui) {
            var enhavo = ui.num == "" ? ui.kap : ui.kap + "<sncref/>";
            DOM.al_v("#referenco_celo",ui.mrk);
            DOM.al_v("#referenco_enhavo",enhavo);
        }   
    });
      
    //>>>>>>>> dialogo: Enmeti ekzemplon
    new Dialog("#ekzemplo_dlg", {
        kampoj: {
            frazo: "#ekzemplo_frazo",
            bib: "#ekzemplo_bib",
            vrk: "#ekzemplo_vrk",
            aut: "#ekzemplo_aut",
            url: "#ekzemplo_url",
            lok: "#ekzemplo_lok"
        },
        butonoj: {   
            "Enmeti la ekzemplon": function(event: Event) { ekzemplo_enmeti(event,false); },
            "... nur la fonton": function(event: Event) { ekzemplo_enmeti(event,true); },
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#ekzemplo_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...
            // difinu tildo-tekston
            x.XKlavaro.tildo("#ekzemplo_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');
        }
    });  
    ekzemplo_dlg_preparo();

    klv = DOM.e("#ekzemplo_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#ekzemplo_butonoj","ekzemplo_dlg",
            // reĝimpremo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#ekzemplo_dlg input");
                    DOM.malplenigu("#ekzemplo_frazo");
                }
            } // neniupostenmeto
        ).elemento_klavoj();
    }

    DOM.klak("#ekzemplo_amp",(ev) => {
        ev.preventDefault();
        const url = DOM.v("#ekzemplo_url"); 
        if (url) DOM.al_v("#ekzemplo_url",x.amp_url(url));
    });

    /// DOM.klavpremo("#ekzemplo_frazo",xpress);
    /// DOM.klavpremo("#ekzemplo_bib",xpress);
    /// DOM.klavpremo("#ekzemplo_vrk",xpress);
    /// DOM.klavpremo("#ekzemplo_aut",xpress);
    /// DOM.klavpremo("#ekzemplo_lok",xpress);

    xtajpo.aldonu("ekzemplo_frazo");
    xtajpo.aldonu("ekzemplo_bib");
    xtajpo.aldonu("ekzemplo_vrk");
    xtajpo.aldonu("ekzemplo_aut");
    xtajpo.aldonu("ekzemplo_lok");
    
    //>>>>>>>> dialogo: Enmeti bildon
    new Dialog("#bildo_dlg", { 
        kampoj: {
            url: "#bildo_url",
            aut: "#bildo_aut",
            prm: "#bildo_prm",
            fnt: "#bildo_fnt",
            fmt: "#bildo_fmt",
            frazo: "#bildo_frazo"
        },
        butonoj: {   
            "Enmeti la bildon": function(event) { bildo_enmeti(event,false); },
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#bildo_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...

            // difinu tildo-tekston
            x.XKlavaro.tildo("#bildo_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');

            if (parseFloat(DOM.v("#bildo_fmt")||'') > 1) {
                bildo_larĝecoj([640,320],640); // eble ankaŭ 800?
            } else {
                bildo_larĝecoj([576,360,180],360); // eble ankaŭ 450, 768?
            }
            //Elektil.refreŝigu("#bildo_lrg input");
        },
        valorŝanĝo: function() {
            if (parseFloat(DOM.v("#bildo_fmt")||'') > 1) {
                bildo_larĝecoj([640,320],640); // eble ankaŭ 800?
            } else {
                bildo_larĝecoj([576,360,180],360); // eble ankaŭ 450, 768?
            }
            //Elektil.refreŝigu("#bildo_lrg input");
        }
    });

    Elektil.kreu("#bildo_lrg input");
    new Grup("#bildo_lrg");

    klv = DOM.e("#bildo_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#bildo_butonoj","bildo_dlg",
            // reĝimpremo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#bildo_frazo");
                    DOM.malplenigu("#bildo_dlg input[type!='radio']");
                }
            } // neniu postenmeto
        ).elemento_klavoj();
    }
    /// DOM.klavpremo("#bildo_frazo",xpress);
    xtajpo.aldonu("bildo_frazo");

    ///>>>>>>>> dialogo: Enmeti derivaĵon
    new Dialog("#derivajho_dlg", {
        kampoj: {
            kap: "#derivajho_kap",
            dif: "#derivajho_dif",
            loko: "#derivajho_listo"
        },
        butonoj: {   
            "Enmeti la derivaĵon": derivajho_enmeti, 
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            plenigu_derivajxojn();
            DOM.kaŝu("#derivajho_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...

            // difinu tildo-tekston
            x.XKlavaro.tildo("#derivajho_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');            
        }
    });

    klv = DOM.e("#derivajho_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#derivajho_butonoj","derivajho_dlg", 
            // reĝimpremo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#derivajho_dlg input");
                    DOM.malplenigu("#derivajho_dif");
                }
            } // neniu postenmeto
        ).elemento_klavoj();
    }
    /// DOM.klavpremo("#derivajho_kap",xpress);
    /// DOM.klavpremo("#derivajho_dif",xpress);

    xtajpo.aldonu("derivajho_kap");
    xtajpo.aldonu("derivajho_dif");

    //>>>>>>>> dialogo: Enmeti sencon
    new Dialog("#senco_dlg", {
        kampoj: {
            mrk: "#senco_mrk",
            dif: "#senco_dif"
        },
        butonoj: {   
            "Enmeti la sencon": senco_enmeti,
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#senco_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...

            // difinu tildo-tekston
            x.XKlavaro.tildo("#senco_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');            
        }
    });

    klv = DOM.e("#senco_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#senco_butonoj","senco_dlg", 
            // reĝimpremo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#senco_dlg input");
                    DOM.malplenigu("#senco_dif");
                }
            } // neniu postenmeto
        ).elemento_klavoj();
    }
    /// DOM.klavpremo("#senco_dif",xpress);
    xtajpo.aldonu("senco_dif");

    //>>>>>>>> dialogo: Enmeti tradukojn
    traduko_dlg_preparo();
    new Dialog("#traduko_dlg", {
        position: { my: "top", at: "top+10", of: window },
        butonoj: {   
            "Enmeti la tradukojn": function(event) { tradukojn_enmeti(event); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#traduko_error");
            //$("#traduko_tradukoj").data("trd_shanghoj",{});
            traduko_dlg_art_lingvoj();
            Menu.refreŝigu("#traduko_menuo");

            // difinu tildo-tekston
            x.XKlavaro.tildo("#traduko_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');

            // jam difinita en ui_kreo... var preflng = pref_lngoj? pref_lngoj[0] : 'en'; // globala variablo
            const preflng = u.agordo.preflng;
            traduko_dlg_plenigu_trd(preflng,DOM.t("#trd_pref_"+preflng));
            // adaptu altecon de la tabelo
            const view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            const dlg = DOM.e("#traduko_dlg")?.parentElement;
            if (dlg) {
                const tbar_h = +(dlg.querySelector("h2") as HTMLElement).style.height|| 0;
                const pane_h = +(dlg.querySelector("form") as HTMLElement).style.height|| 0;
                const tab_h = (view_h * 0.80) - tbar_h - pane_h;
                const tab_div = DOM.e(".dlg_tab_div") as HTMLElement;
                tab_div.style.height = ""+tab_h;            
            }
        }
    }); 
    new Menu("#traduko_menuo", {
        eroj: ":scope>li",
        reago: shanghu_trd_lingvon
    });  

    klv = DOM.e("#traduko_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#traduko_butonoj","traduko_dlg",
            undefined, // neniu reĝimŝanĝo
            // postenmeto
            function() { 
                const k = x.XKlavaro.klavaro("#traduko_butonoj");
                if (k) {
                    trd_input_shanghita(k.celo);
                }
            }
        ).elemento_klavoj();
        //DOM.ido_reago("#traduko_tabelo","blur","input",traduko_memoru_fokuson.bind(xklv));
        //DOM.ido_reago("#traduko_butonoj","click","div",traduko_butono_premo.bind(xklv));
    }

    //>>>>>>>> dialogo: Enmeti per ŝablono
    sxablono_dlg_preparo();
    new Dialog("#sxablono_dlg", {
        butonoj: {   
            "Enmeti la tekston": sxablono_enmeti,
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#sxablono_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...

            // difinu tildo-tekston
            x.XKlavaro.tildo("#sxablono_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');            
        }
    });
    /*
    new x.XFormularKlavaro("#sxablono_butonoj","sxablono_dlg");
    $( "#sxablono_butonoj").Klavaro({
        artikolo: $("#xml_text"),
        posedanto: "#sxablono_dlg",
        akampo: ""
    });
    */
    DOM.ŝanĝo("#sxablono_elekto",kiam_elektis_sxablonon);     
    new Grup(".controlgroup-vertical", { "direction": "vertical" });

    //>>>>>>>> dialogo: Enmeti rimarkon
    new Dialog("#rimarko_dlg", {
        kampoj: {
            aut: "#rimarko_aut",
            rim: "#rimarko_rim",
            adm: "#rimarko_adm"
        },
        butonoj: {   
            "Enmeti la rimarkon": function(event: Event) { 
                event.preventDefault();
                const indent=2;
                var rim = Dialog.valoroj("#rimarko_dlg");
                rim.rim = x.linirompo(rim.rim.replace(/~/g,'<tld/>'),indent);
                rim.elm = rim.adm ? 'adm' : 'rim';                   
                var rimstr = new XMLRimarko(rim,rim.elm).xml(indent*2);
                Artikolo.artikolo("#xml_text")?.insert(rimstr);
                Dialog.fermu("#rimarko_dlg");
                this.fermu();
            },
            "\u25f1": function() { this.refaldu(); },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: function() {
            DOM.kaŝu("#rimarko_error");
            this.faldu(false); // necesas, se la dialogo estis fermita en faldita stato...
            // difinu tildo-tekston
            x.XKlavaro.tildo("#rimarko_butonoj", Artikolo.artikolo("#xml_text")?.radiko||'');
        }
    });

    klv = DOM.e("#rimarko_butonoj");
    if (klv) {
        new x.XFormularKlavaro("#rimarko_butonoj","rimarko_dlg",
            // reĝimpremo
            function(event,ui) {
                if (ui.cmd == "blankigo") {
                    DOM.malplenigu("#rimarko_dlg input");
                    DOM.malplenigu("#rimarko_rim");
                }
            } // neniu postenmeto
        ).elemento_klavoj();
    }
    /// DOM.klavpremo("#rimarko_rim",xpress);
    xtajpo.aldonu("rimarko_rim");

    //>>>>>>>> eraro-dialogo
    new Dialog("#error_dlg", {
        butonoj: { 
            "Resaluti": function() { location.href='../auth/logout'; },
            "\u2718": function() { this.fermu(); }
        },
        malfermu: () => { DOM.kaŝu("#error_msg",false); }
    });

    //>>>>>>>> surmetitta dialogo ekz. por deklaro pri datumprotekto, klarigoj/helpo ks
    new Dialog("#surmetita_dlg", {
        position: { my: "left top", at: "left+20 top+20", of: window },
        // @ts-ignore maxWidth estas deklarita kiel /number/ - ignoru tion aŭ redeklaru ie...
        maxWidth: "90%" 
    });
}  


//*********************************************************************************************
//* Helpfunkcioj por dialogoj 
//*********************************************************************************************



export function shargo_dlg_serĉo(request,response) {
    DOM.al_v("#shargi_dosiero",'');
    if (! Valid.valida("#shargi_sercho")) return;
/*    
      if (! validate_pattern(/^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ]+$/,$("#shargi_sercho"),$("#shargi_error"),
                             "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj kaj spacsignoj. Interpunkcioj kaj apostrofo ne estas permesitaj.")) {
          return;
      }
      */
    
      var sercho = request.term; //$("#referenco_secho").val();
      var results: Array<any> = [];
    
  //    $("body").css("cursor", "progress");
      //$.post(
        u.HTTPRequest('post',"revo_sercho", 
            { 
                sercho: sercho,
                lng: "eo" 
            }, 
            function(xhr: XMLHttpRequest, data: string) {   
                if (xhr.status == 302) {
                    // FIXME: When session ended the OpenID redirect 302 is handled behind the scenes and here we get openid/login with status 200
                    show_xhr_error(this,"Via seanco finiĝis. Bonvolu resaluti!");
                } else {
                    const json = JSON.parse(data);
                    json.forEach((d) => {
                       var label = (d.num != "")? d.kap + " " + d.num : d.kap;
                       results.push({ 
                           value: label, 
                           art: d.art
                       }); 
                    });
                }
                // se estas nur unu rezulto ni tuj plenigas la dosiernomon
                if (results.length == 1) {
                    DOM.al_v("#shargi_dosiero",results[0].art);
                }
                // redonu la liston por montrado
                response(results);
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            show_xhr_error //"#shargi_error")
            );
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

export function show_xhr_error(xhr: XMLHttpRequest, msg_prefix="Eraro:",msg_suffix='') {
    const msg_infix = xhr.status + " " + xhr.statusText + 
        (xhr.responseText? " " + xhr.responseText.substring(0,100) : "");
    console.error(msg_infix);
    // alert(xhr.status + " " + xhr.statusText); 
    const msg = "Ho ve, okazis eraro: " 
     + xhr.status + " " + xhr.statusText + " " + xhr.responseText;
    DOM.al_html("#error_msg", msg_prefix +  "<br/>" + msg_infix + "<br/>" +  msg_suffix);
    Dialog.dialog("#error_dlg")?.malfermu();    
}


function download_art(dosiero,err_to,dlg_id,do_close=true) {
    
    var fin = dosiero.slice(-4);
    if (fin == '.xml') {
        dosiero = dosiero.slice(0,-4);
    }

    u.HTTPRequest('post',"revo_artikolo", { art: dosiero },
        function(data: string) {   
            if (data.slice(0,5) == '<?xml') {
                const art = Artikolo.artikolo("#xml_text");
                const xmlarea = Artikolo.artikolo("#xml_text");
                art?.load(dosiero,data);
                DOM.al_v("#re_radiko",xmlarea?.radiko||'');
                // $("#collapse_outline").accordion("option","active",0);
                DOM.kaŝu(err_to);
                Slipar.montru("#tabs",0);
                
                if (do_close) {
                    Dialog.fermu(dlg_id);
                } else {
                    Dialog.dialog(dlg_id)?.faldu();
                }
            } else {
                Eraro.al(err_to,"Okazis eraro, supozeble necesas resaluti.");
            }
        },
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        (xhr: XMLHttpRequest) => Eraro.http(err_to,xhr)
    );
}

function download_url(url,dosiero,err_to,dlg_id,do_close=true) {
    
    u.HTTPRequest('get', url, {}, 
        function(data) {   
            if (data.slice(0,5) == '<?xml') {
                const art = Artikolo.artikolo("#xml_text");
                if (art) art.load(dosiero,data);
                // $("#collapse_outline").accordion("option","active",0);
                DOM.kaŝu(err_to);
                Slipar.montru("#tabs", 0);

                if (do_close) {
                    Dialog.fermu(dlg_id);
                } else {
                    Dialog.dialog(dlg_id)?.faldu();
                }
            } else {
                var msg = "Okazis neatendita eraro: ";
                Eraro.al(err_to,"Okazis eraro, supozeble necesas resaluti.");
            }
        },
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        (xhr: XMLHttpRequest) => Eraro.http(err_to,xhr)
    );
}


function sendi_artikolon_servile(event: Event) {
    event.preventDefault();
    // $("#sendiservile_error").hide();
    const trg = event.target;
    const metodo = DOM.t(event.target) == 'Submeti'? 'api' : 'email';
    
    // aldono (t.e. nova artikolo) aŭ redakto (t.e. ŝanĝo)
    const reĝimo = Artikolo.artikolo("#xml_text")?.opcioj["reĝimo"];
    const art_mrk = Artikolo.artikolo("#xml_text")?.dosiero;

    // ĉe novaj artikoloj komento entenas la dosiernomon
    if (! Valid.valida("#sendiservile_komento")) return;

    const komento = DOM.v("#sendiservile_komento") || '';
    const dosiero = (reĝimo == 'aldono')? komento : art_mrk; //$("#xml_text").Artikolo("art_drv_mrk"); 
    const xmlarea = Artikolo.artikolo("#xml_text");

    if (xmlarea) {

        u.HTTPRequest('post', "revo_sendo", {
                xml: xmlarea.normalizedXml(),
                shangho: komento,
                redakto: reĝimo||'',
                metodo: metodo,
                dosiero: dosiero||''
            },
            function(data: string) {   
                // Montru sukceson...
                const art = Artikolo.artikolo("#xml_text");
                if (art) {
                    const dosiero = art.opcioj["dosiero"];
                    /// art._change_count = 0;    
                    
                    const url = data.html_url;
                    const msg = "<b>'" + dosiero  + "'</b> sendita. " +
                    (metodo == 'api'
                    ? "Kelkajn tagojn vi trovas vian redakton <a target='_new' href='"+url+"'>tie ĉi ĉe Github</a> kaj sub 'Lastaj...'."
                    : "Bv. kontroli ĉu vi ricevis kopion de la retpoŝto.\n(En tre esceptaj okazoj la spam-filtrilo povus bloki ĝin...)"
                    );
                    Erarolisto.aldonu("#dock_eraroj", {
                        id: "art_sendita_msg",
                        cls: "status_ok",
                        msg: msg
                    });
                    //alert("Sendita. Bv. kontroli ĉu vi ricevis kopion de la retpoŝto.\n(En tre esceptaj okazoj la spam-filtrilo povus bloki ĝin...)");
                    Dialog.fermu("#sendiservile_dlg");
                    //$("#xml_text").val('');
                    xmlarea.teksto = '';
                    DOM.al_v("#shargi_dlg input","");
                }
            },
            undefined,
            undefined,
            (xhr: XMLHttpRequest) => Eraro.http("#sendiservile_error",xhr)
        );
    }
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


function referenco_dlg_preparu() {
    //$("body").css("cursor", "progress");
    //$.get('../voko/klasoj.xml')
    u.HTTPRequest('get','../voko/klasoj.xml',{},
            function(data: string) {  
                var seen = {}; // evitu duoblaĵojn
                new Propon("#referenco_listo", {
                    source: Array.from(x.xml_filtro(data,"kls")).map(
                        (e) => {
                            //console.log(this + " "+i+" "+e);
                            //console.log($(this).attr("nom"));
                            let nom = e.getAttribute("nom")?.split('#')[1];
                            let mrk = e.getAttribute("mrk");
                            let kap = e.getAttribute("kap");
                            if (nom) {                                
                                if (seen[nom]) {
                                    return false;
                                } else {
                                    seen[nom] = true;
                                    if (mrk) mrk = mrk.split('#')[1];
                                    return {value: nom, mrk: mrk, kap: kap};
                                }
                            }
                        }),
                    select: referenco_listo_elekto
                });
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            (xhr: XMLHttpRequest) => Eraro.http("#referenco_error",xhr)
    );
}

function referenco_listo_elekto(event,ui) {
    // forigu sufikson de la listonomo
    const lst = DOM.v("#referenco_listo")?.trim()||'';
    DOM.al_v("#referenco_listo",lst);
    if (ui.mrk) {
        DOM.al_v("#referenco_sercho",'');
        DOM.al_v("#referenco_celo",ui.mrk);
    }
    if (ui.kap) DOM.al_v("#referenco_enhavo",ui.kap);
}

function referenco_dlg_serĉo(request,response) {
    /*
      $("#referenco_error").hide();
    
      if (! validate_pattern(/^[a-zA-Z 0-9ĉĝĥĵŝŭĈĜĤĴŜŬ\-]+$/,$("#referenco_sercho"),$("#referenco_error"),
                             "La serĉesprimo konsistu nur el esperantaj literoj, ciferoj, streketoj kaj spacsignoj. Interpunkcioj kaj apostrofo ne estas permesitaj.")) {
          return;
      }
      */
      if (! Valid.valida("#referenco_sercho")) return; //Checks("check")) return;
    
      var sercho = request.term; //$("#referenco_secho").val();
      var results = Array();
    
      u.HTTPRequest('post', "revo_sercho", { sercho: sercho, lng: "eo" },
            function(data) {
                const json = JSON.parse(data);
                // kap+num -> enhavo
                // mrk -> celo
                //var enhavo = (data.num != "")? data.kap + "<sncref/>" : data.kap;
                for (let i=0; i<json.length; i++) {
                   var d = json[i];
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
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            (xhr: XMLHttpRequest) => {
                Eraro.http("#referenco_error", xhr);
                response(undefined);
            }     
        );
}


function referenco_enmeti(event: Event) {
    event.preventDefault();
    DOM.kaŝu("#referenco_error");
    //var refgrp = $( "#referenco_grp" ).is(':checked');
    var ref = Dialog.valoroj("#referenco_dlg");

    var refstr = '';

    if (ref.grp) {
        refstr = new XMLReferencGrupo(ref).xml();
    } else {
        refstr = new XMLReferenco(ref).xml();
    }
    
    var enmetu_en = Dialog.dialog("#referenco_dlg")?.opcioj['enmetu_en'] || "xml_text";
    if (enmetu_en == "xml_text") {
        Artikolo.artikolo("#xml_text")?.insert(refstr);
        //$("#"+enmetu_en).insert(refstr);
    } else {
        DOM.al_t("#"+enmetu_en,refstr.trim());
    }
    DOM.evento("#"+enmetu_en,"change");
      
    // post refgrp venos nuda referenco sekvafoje...
    const dlg = Dialog.dialog("#referenco_dlg");
    if (dlg) {
        if (ref.grp) {
            dlg.al_valoroj({grp: false, tip: "nuda"});
            DOM.al_v("#referenco_listo",'');
            const ref_lst = DOM.i("#referenco_listo")
            if (ref_lst) ref_lst.disabled = true;
            //$( "#referenco_grp" ).prop("checked",false);
            //$( "#referenco_tipo" ).val("nuda");
        };
        dlg.fermu();
    }
}

function ekzemplo_dlg_preparo() {
    function trim(e: Element, kampo: string): string {
        const v = e.querySelector(kampo)?.textContent||'';
        return v.trim();
    }

    //$("body").css("cursor", "progress");
    u.HTTPRequest('get','../voko/biblist.xml',{},
            function(data: string) {  
                new Propon("#ekzemplo_bib", {
                    source: Array.from(x.xml_filtro(data,"vrk")).map(
                        (e: Element) => {
                            //console.log(this + " "+i+" "+e);
                            //console.debug($(this).children("bib").text() +  ": " + $(this).children("text").text());
                            const bib = trim(e,"bib")

                            return {
                                bib: bib,
                                value: bib + ": " + trim(e, "text"),
                                url: trim(e,"url")
                            };
                        }),
                });
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            (xhr: XMLHttpRequest) => Eraro.http("#ekzemplo_error",xhr)
        );
}


function ekzemplo_enmeti(event, nur_fnt) {
    event.preventDefault();
    DOM.kaŝu("#ekzemplo_error");

    var values = Dialog.valoroj("#ekzemplo_dlg");
    var xmlstr = '';

    values.bib = values.bib.split(':')[0]|| '';

    if (nur_fnt) {
        const indent=8;
        xmlstr = new XMLFonto(values).xml(indent);
    } else {
        const indent=2;
        values.frazo = x.linirompo(values.frazo,indent);
        xmlstr = new XMLEkzemplo(values).xml(indent+4);
    }
   
    // de kie vokiĝis la dialogo tien remetu la rezulton
    var enmetu_en = Dialog.dialog("#ekzemplo_dlg")?.opcioj['enmetu_en'] || "xml_text";
    if (enmetu_en == "xml_text") {
        Artikolo.artikolo("#xml_text")?.insert(xmlstr);
        // $("#"+enmetu_en).insert(xmlstr);
    } else {
        DOM.al_t("#"+enmetu_en,xmlstr.trim());
    }
    DOM.evento("#"+enmetu_en,"change");

    Dialog.fermu("#ekzemplo_dlg");
}


function bildo_enmeti(event, nur_fnt) {
    event.preventDefault();
    DOM.kaŝu("#bildo_error");

    let bld = Dialog.valoroj("#bildo_dlg");
    bld.lrg = DOM.v("#bildo_lrg input:checked") || 360;
    bld.fnt_dec = bld.fnt;
    bld.fnt = encodeURI(bld.fnt);
    // ne kodigu duoble, ekz. % al %25: bld.url = encodeURI(bld.url);
    const indent = 4;
    bld.frazo = x.linirompo(bld.frazo,indent);

    var bldstr = new XMLBildo(bld).xml(indent);
    const art = Artikolo.artikolo("#xml_text");
    if (art) art.insert(bldstr);
    //$("#xml_text").insert(bldstr);    
    //$("#xml_text").change();
    Dialog.fermu("#bildo_dlg");
}

function bildo_larĝecoj(lrg,chk) {
    DOM.ej("#bildo_lrg input").forEach((e) => {
        if (e instanceof HTMLInputElement) {
            e.checked = false;
            let l = parseInt(e.getAttribute("value")||'');
            const lbl = DOM.e("#bildo_lrg label[for='bildo_lrg_" + l + "']");
            if (lbl) {
                if (lrg.indexOf(l) >= 0) {
                    DOM.kaŝu(lbl.parentElement as Element,false);
                    if (l == chk) {
                        e.checked = true;
                    }
                } else {
                    DOM.kaŝu(lbl.parentElement as Element,true);
                }
            }
        }
    });
}

/**************** helpfunkcioj por derivajho-dialogo **********/

function plenigu_derivajxojn() {
    let drv_list = '';
    const xmlarea = Artikolo.artikolo("#xml_text");

    if (xmlarea) xmlarea.subtekst_apliku((ero) => {
        if (ero.el == 'drv') {
            const drv = (ero as any).dsc.split(' ').slice(2).join(' ') || (ero as any).dsc;
            drv_list += '<option value="'+ero.id+'">' + drv + '</option>';
        }
    });
    DOM.ej("#derivajho_listo option+option").forEach((o) => o.remove());
    DOM.e("#derivajho_listo")?.insertAdjacentHTML("beforeend",drv_list);
}

function derivajho_enmeti(event) {
    event.preventDefault();
    DOM.kaŝu("#derivajho_error");

    const xmlarea = Artikolo.artikolo("#xml_text");    
        if (xmlarea) {
        // sinkronigu unue por certe ne perdi antaŭe faritajn ŝanĝojn
        xmlarea.sinkronigu();
        
        let values = Dialog.valoroj("#derivajho_dlg");
        //values.mrk = xmlArtDrvMrk($("#xml_text").val()); 
        const indent = 2;
        values.dif = x.linirompo(values.dif,indent);
        values.mrk = xmlarea.dosiero; 

        const drv = new XMLDerivaĵo(values);
        const art = Artikolo.artikolo("#xml_text");
        if (art) {
            if (values.loko == 'kursoro') {
                // enŝovu ĉe kursoro
                art.insert(drv.xml(),true);
            } else {
                // enŝovu post donita drv 
                art.enŝovu_post(drv.xml(),values.loko);
            }
        }
        
        // ekredaktu la novan derivaĵon
        const mrk = drv.drv.mrk;    
        const s_id = xmlarea.ekredaktu(mrk,false); // false: ne denove sinkronigu, 
                // kio povus perdigi ĵus aldonitan drv!
    }

    Dialog.fermu("#derivajho_dlg");
}

function senco_enmeti(event: Event) {
    event.preventDefault();
    DOM.kaŝu("#senco_error");

    var snc = Dialog.valoroj("#senco_dlg");
    const indent=2;
    snc.dif = x.linirompo(snc.dif,indent);

    try{
        snc.drvmrk = Artikolo.artikolo("#xml_text")?.drv_before_cursor().mrk;
    } catch(e) {
          // donu aprioran valoron al mrk en kazo, ke la XML ne estas valida...
          snc.drvmrk = 'XXXXXXX.YYY';
          // avertu pri la eraro
          show_error_status(e);
    }
    const sncxml = new XMLSenco(snc).xml();
    
    Artikolo.artikolo("#xml_text")?.insert(sncxml,true);
    // $("#xml_text").insert(sncxml);
    // $("#xml_text").change();
    Dialog.fermu("#senco_dlg");
}


/***************** traduk-dialogo ********************************************************************/


// aldonu kompletan lingvoliston kaj preferatajn lingvojn al traduko-dialogo
function traduko_dlg_preparo() {

    new Promise((resolve1) => { 
        // alfabetaj listoj
        const m_a_b = new List("#traduko_chiuj_a_b");
        const m_c_g = new List("#traduko_chiuj_c_g");
        const m_h_j = new List("#traduko_chiuj_h_j");
        const m_k_l = new List("#traduko_chiuj_k_l");
        const m_m_o = new List("#traduko_chiuj_m_o");
        const m_p_s = new List("#traduko_chiuj_p_s");
        const m_t_z = new List("#traduko_chiuj_t_z");

        revo_listoj.lingvoj.load(resolve1(true),(kodo: string, nomo: string) => {
            const komenca = nomo.charAt(0);
            const lng = u.ht_html(`<li id="trd_chiuj_${kodo}" value="${nomo}">${nomo}</li>`);

            if (lng && kodo != 'eo') {
                if (komenca >= 'a' && komenca <= 'b')
                    m_a_b.aldonu(nomo,lng);
                else if (komenca >= 'c' && komenca <= 'g' || komenca == 'ĉ' || komenca == 'ĝ')
                    m_c_g.aldonu(nomo,lng);
                else if (komenca >= 'h' && komenca <= 'j' || komenca == 'ĥ' || komenca == 'ĵ')
                    m_h_j.aldonu(nomo,lng);
                else if (komenca >= 'k' && komenca <= 'l')
                    m_k_l.aldonu(nomo,lng);
                else if (komenca >= 'm' && komenca <= 'o')
                    m_m_o.aldonu(nomo,lng);
                else if (komenca >= 'p' && komenca <= 's' || komenca == 'ŝ')
                    m_p_s.aldonu(nomo,lng);
                else if (komenca >= 't' && komenca <= 'z' || komenca == 'ŭ')
                    m_t_z.aldonu(nomo,lng);
            }
        });
    })
    .then(() => {
        new Promise((resolve2) => {
        u.HTTPRequest('get','revo_preflng',{},
            function(data: string) {
                const pref_lngoj = JSON.parse(data);
                u.agordo.preflng = pref_lngoj[0] || 'en'; // malloka variablo (ui_kreo)
                
                const trd_aliaj = DOM.e("#traduko_aliaj");

                pref_lngoj.forEach(     //.sort(jsort_lng).forEach(
                    function(lng) {
                        if (lng != 'eo') {
                            const nomo = revo_listoj.lingvoj.codes[lng];
                            const lng_html = `<li id="trd_pref_${lng}">${nomo}</li>`;
                            trd_aliaj?.insertAdjacentHTML("beforebegin",lng_html);  
                        }
                    }
                );
            
                resolve2(true);
            },
            () => document.body.style.cursor = 'wait',
            () => document.body.style.cursor = 'auto',
            (xhr: XMLHttpRequest) =>  Eraro.http("#traduko_error",xhr)
        )})
    })
    .then(() => {
        // se ambaŭ lingvolistoj (preferataj kaj alfabetaj)
        // estas fintraktitaj ni ankoraŭ refreŝigu la menuon
        Menu.refreŝigu("#traduko_menuo");
    });    
}

// aldonu la traduk-lingojn de la ŝargita artikolo al la traduko-dialogo (lingvo-elekto)
function traduko_dlg_art_lingvoj() {
    const xmlarea = Artikolo.artikolo("#xml_text");
    const trd_art = new List("#traduko_artikolaj");

    if (xmlarea && trd_art) {
        DOM.malplenigu("#traduko_artikolaj");

        const xml = xmlarea.teksto || '';
        const traduk_lingvoj = x.traduk_lingvoj(xml);

        if (traduk_lingvoj) {
            // ŝargu, se ne jam ŝargita kaj trakuru la lingvoliston
            revo_listoj.lingvoj.load(()=>Menu.refreŝigu("#traduko_menuo"),
                (kodo: string, nomo: string) => {
                    if (kodo in traduk_lingvoj) {
                        const lingvo = u.ht_html(`<li id="trd_art_${kodo}" value="${nomo}">${nomo}</li>`);
                        if (lingvo) trd_art.aldonu(nomo,lingvo);
                    }
                }
            );
        }
    }
}

/*
function traduko_memoru_fokuson(event) {
    //DOM.al_datum("#traduko_dlg","last-focus",this.id);
    const id = event.currentTarget.id;
    this.lasta_fokuso = id;
}
*/

/*
function traduko_butono_premo(event) {
    ////var text = $(this).attr("data-btn");
    var cmd = event.target.getAttribute("data-cmd");
    //var form_element = $( document.activeElement );
    var form_element_id = DOM.datum("#traduko_dlg","last-focus")
        .replace(/\./g,'\\\.')
        .replace(/\:/g,'\\\:') || '';

    if ( form_element_id ) {
        const el = DOM.e("#" + form_element_id);
        if (el instanceof HTMLInputElement) {
            // var form_element = $("#ekzemplo_form input:focus");
        //    if (text) {
        //        element.insert(text);
        //    } else 
            var sel = DOM.elekto(el); // el.textarea_selection();
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

            DOM.enigu(el,s_);
            
            trd_input_shanghita(el[0]);
        }
    }
}
*/

/*
// lingvoj - sort function callback for jQuery
function jsort_lng(a, b){
    var at = a.textContent||'';
    var bt = b.textContent||'';
    var pos = 0,
        min = Math.min(at.length, bt.length);
    // ne perfekte sed pli bone ol ĉ, ĝ ... tute ĉe la fino...
    var alphabet = 'AaBbCĈcĉDdEeFfGĜgĝHĤhĥIiJĴjĵKkLlMmNnOoPpRrSŜsŝTtUŬuŭVvZz';

    while(at.charAt(pos) === bt.charAt(pos) && pos < min) { pos++; }
    return alphabet.indexOf(at.charAt(pos)) > alphabet.indexOf(bt.charAt(pos)) ?
        1 : -1;
}
*/

/*
// lingvoj - sort function callback for normal strings
function sort_lng(at, bt){
    var pos = 0,
        min = Math.min(at.length, bt.length);
    // ne perfekte sed pli bone ol ĉ, ĝ ... tute ĉe la fino...
    var alphabet = 'AaBbCĈcĉDdEeFfGĜgĝHĤhĥIiJĴjĵKkLlMmNnOoPpRrSŜsŝTtUŬuŭVvZz';

    while(at.charAt(pos) === bt.charAt(pos) && pos < min) { pos++; }
    return alphabet.indexOf(at.charAt(pos)) > alphabet.indexOf(bt.charAt(pos)) ?
        1 : -1;
}
*/

function traduko_dlg_plenigu_trd(lng: string, lingvo_nomo: string) {
    // forigu antaŭajn eventojn por ne multobligi ilin...
    DOM.malreago("#traduko_tradukoj","click");
    DOM.malreago("#traduko_tradukoj","change");
    
    // ĉar la tradukdialogo montras samtempe ĉiam nur tradukojn de unu lingvo
    // ni kunfandas tiujn el la artikolo, kaj tiujn, kiuj jam estas
    // aldonitaj aŭ ŝanĝitaj en la dialogo
    // var trdoj = $("#xml_text").Artikolo("tradukoj",lng); 
    const xmlarea = Artikolo.artikolo("#xml_text");
    if (xmlarea) {
        const xmltrad = xmlarea.xmltrad;
        xmltrad.preparu();
        xmltrad.kolektu_tute_malprofunde(lng);    
        //const trd_shanghoj = $("#traduko_tradukoj").data("trd_shanghoj") || {};

        let tableCnt = '';

        //if (trdoj) {

        // La uzo de semantikaj id-atributoj ne estas tro eleganta.
        // Pli bone kreu propran tradukoj-objekton kun insert, update ktp
        // kiu transprentas la administradon kaj aktualigadon...
        // ŝangojn oni devus skribi tiam nur se oni ŝanĝas lingvon aŭ enmetas tradukojn
        // en la dialogon ĝin fermante...
        xmlarea.subtekst_apliku((s) => {
            if (['drv','subdrv','snc','subsnc'].indexOf(s.el) > -1) {
                const parts = (s as any).dsc.split(':');
                let dsc = parts[1] || parts[0];
                if (s.el == 'snc' || s.el == 'subsnc' && parts[1]) {
                    const p = dsc.indexOf('.');
                    if (p>-1) dsc = dsc.slice(p);
                }
                if (s.el == 'drv') dsc = '<b>'+dsc+'</b>';
                tableCnt += '<tr class="tr_' + s.el + '"><td>' + dsc + '</td><td>';
            
                const trd = xmltrad.trd_subteksto(lng,s.id);
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
                        tableCnt += traduko_input_field(s.id,j,x.quoteattr(trd[j]));
                        tableCnt += "<br/>";
                    }
                } else {
                   tableCnt += traduko_input_field(s.id,0,'') + '<br/>';  
                }
                tableCnt += '</td>';
                tableCnt += '<td>' + traduko_add_btn(s.id) + '</td>';
                tableCnt += '</tr>';
            } // if drv..subsnc
        }); // for s...
    //} // if trdj

        DOM.al_t("#traduko_lingvo",lingvo_nomo +" ["+lng+"]");
        DOM.al_datum("#traduko_dlg","lng",lng);
        DOM.al_t("#traduko_tradukoj",'');

        // enigu traduko-kampojn
        DOM.al_html("#traduko_tradukoj",tableCnt);

        // aldonu reagon por +-butonoj
        document.querySelectorAll("#traduko_tradukoj button").forEach((b) => {
            b.addEventListener("click", (event) => {
                const trg = event.currentTarget;
                if (trg instanceof HTMLElement) {
                    const i_ref = trg.getAttribute("formaction")?.substring(1)+":0";
                    const first_input_of_mrk = document.getElementById(i_ref);
                    if (first_input_of_mrk) {
                        const last_input_of_mrk = first_input_of_mrk?.parentElement
                            ?.querySelector("input:last-of-type");

                        if (last_input_of_mrk) {
                            const parts = last_input_of_mrk.id.split(':');
                            const next_id = parts[0] + ':' + parts[1] + ':' + (parseInt(parts[2]) + 1);
                            last_input_of_mrk.insertAdjacentHTML("afterend",'<br/><input id="' + next_id 
                                + '" type="text" name="' + next_id + '" size="30" value=""/>');

                            // reago al ŝanĝo de enhavo
                            const aldonita = document.getElementById(next_id);
                            if (aldonita) {
                                DOM.reago(aldonita, "change", trd_shanghita);
                            }
                        }

                    } // else: estu ĉiam almenaŭ unu eĉ se malplena kampo....
                }
            });
        });         
    }
    
    // rimarku ĉiujn ŝanĝojn de unuopaj elementoj
    DOM.ido_reago("#traduko_tradukoj","change","input", trd_shanghita);
    //DOM.ido_reago("#traduko_tabelo","blur","input",traduko_memoru_fokuson.bind(xklv));
}

function trd_shanghita() {
    trd_input_shanghita(this);
}

function trd_input_shanghita(element) {
    const sid = element.id.split(':')[1];
    const lng = DOM.datum("#traduko_dlg","lng");

    const xmlarea = Artikolo.artikolo("#xml_text");
    const xmltrad = xmlarea?.xmltrad;   

    // prenu ĉiujn tradukojn kun tiu marko, ne nur la ĵus ŝanĝitane
    DOM.ej("#traduko_tradukoj input[id^='trd\\:" + sid + "\\:']").forEach( (e) => {
        var nro = e.id.split(':')[2];
        xmltrad?.adaptu_trd_subteksto(sid,lng,+nro,(e as HTMLInputElement).value);                               
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
    const id = mrk; //.replace(/\./g,'\\\\.');
    return `<button formaction="#trd:${id}" class="ui-button ui-widget ui-corner-all" title="Aldonu"><b>+</b></button>`;
}

/**
 * Se la traduk-lingvo ŝanĝiĝis ni devos replenigi la kampojn kun la tradukoj
 * de la nova lingvo.
 */
function shanghu_trd_lingvon(event: Event, ui) {
    var id = ui.menuero.id;
    if (id && id.slice(0,4) == "trd_") {
        var lng= id.split('_')[2];
        var lingvo_nomo = ui.menuero.textContent;
        //alert($("#traduko_lingvoj").val())
        traduko_dlg_plenigu_trd(lng,lingvo_nomo);
    }
    /// DOM.al_datum("#traduko_dlg","last-focus",'');
}

// enmetu ŝanĝitajn kaj aldonitajn tradukojn en la XML-artikolon
function tradukojn_enmeti(event) {
    // prenu la shanghitajn tradukojn
    //var trd_shanghoj = $("#traduko_tradukoj").data("trd_shanghoj"); 
    const art = Artikolo.artikolo("#xml_text");
    const trd_dlg = Dialog.dialog("#traduko_dlg")
    try {
        art?.enmetu_tradukojn(); //,trd_shanghoj);
        trd_dlg?.fermu();
    } catch (e) {
        Eraro.al("#traduko_error",e.toString());
    }
}

/***************** ŝablono-dialogo ********************************************************************/

function sxablono_dlg_preparo() {
    var sxbl_list = '';
    for (let nomo in sbl.snc_sxablonoj) {
        sxbl_list += '<option>' + nomo + '</option>';
    }
    DOM.al_html("#sxablono_elekto",sxbl_list);
}

function kiam_elektis_sxablonon(event: Event) {
    var sxbl = DOM.v("#sxablono_elekto");
    DOM.al_t("#sxablono_xml",'');
    DOM.malreago("#sxablono_xml","keypress");
    DOM.malreago("#sxablono_xml","click");
    DOM.al_html("#sxablono_xml", new SncŜablono(sxbl as string).html());
    /*
    var lines = new SncŜablono(sxbl).form().split('\n');
    for (var i=0; i<lines.length; i++) {
        $("#sxablono_xml").append('<tr><td><b class="sxbl">&ndash;</b></td><td><pre class="line">'+lines[i]+'</pre></td></tr>');
    }
    */
    DOM.klak("#sxablono_xml button",sxablono_button_click);
    //$("#sxablono_xml input[type='checkbox']").click(sxablono_checkbox_click);
    DOM.klak("#sxablono_xml b.sxbl",sxablono_strike_click);
    DOM.klak("#sxablono_xml span.sxbl",sxablono_span_click);
    ///DOM.klavpremo("#sxablono_xml input",xpress);
    document.querySelectorAll("#sxablono_xml input").forEach((i) => xtajpo.aldonu(<HTMLInputElement>i));
}

function sxablono_button_click(event: Event) {
    event.preventDefault(); 
    const text_span = event.target.closest("button").previousElementSibling; //("span");    
    const ref_dlg = Dialog.dialog("#referenco_dlg");
    const ekz_dlg = Dialog.dialog("#ekzemplo_dlg");

    if (text_span.tagName != "SPAN") throw new Error("Eraro en ŝablono: atendis SPAN!");

    if (text_span && ref_dlg) {
        if (text_span.innerHTML.startsWith('&lt;ref')) {
            ref_dlg.malfermu();
            ref_dlg.opcioj["enmetu_en"] = text_span.id;
            //referenco_dialogo(text_span[0].id);
        } else if (text_span.innerHTML.startsWith('&lt;ekz') && ekz_dlg) {
            ekz_dlg.opcioj["enmetu_en"] = text_span.id;
            ekz_dlg.malfermu();
            //ekzemplo_dialogo(text_span[0].id);
        }
    }
}


function sxablono_strike_click(event: Event) {
    const text_line = event.target.closest("tr").querySelector("pre");
    const style = text_line.style["text-decoration-line"];
    text_line.style['text-decoration-line'] = (style == "none"?"line-through":"none");
}

function sxablono_span_click(event) {
  const text_span_id = event.target.id;
  const ref_dlg = Dialog.dialog("#referenco_dlg");
  const ekz_dlg = Dialog.dialog("#ekzemplo_dlg");

 // if (text_span_id.startsWith('o_')) {
//      var checkbox = $("#"+text_span_id).next("input[type='checkbox']");
//      checkbox.prop('checked',function(i,val){return !val});
//      $("#"+text_span_id).css("text-decoration-line",checkbox.prop('checked')?"none":"line-through"); 
//  } else 
  if (text_span_id.startsWith('r_') && ref_dlg) {
      //referenco_dialogo(text_span_id);
      ref_dlg.opcioj["enmetu_en"] = text_span_id;
      ref_dlg.malfermu();
  } else if (text_span_id.startsWith('e_') && ekz_dlg) {
      //ekzemplo_dialogo(text_span_id);
      ekz_dlg.opcioj["enmetu_en"] = text_span_id;
      ekz_dlg.malfermu();
    }
}

function sxablono_enmeti(event) {
    //$("#xml_text").insert($("#sxablono_xml").val());

    function form_text(e): string {
        var all_text = '';
        e.childNodes.forEach((c) => {
            if ( c.nodeType === 3 ) {
               all_text += this.textContent;
            } else if ( c instanceof HTMLInputElement && c.tagName == 'INPUT' ) {
               all_text += c.value;
            } else if ( c.nodeType === 1 ) {
               all_text += form_text(c);
            }
        });
        return all_text;
    }

    let text = '';
    DOM.ej("#sxablono_xml pre").forEach( (pre) => {
        //var cb = $(this).children("input[type='checkbox']");
        //if (cb.length == 0 || cb.prop('checked'))
        if ((pre as HTMLElement).style["text-decoration-line"] != "line-through") {
            text += form_text(pre) + "\n";
        }
    });

    const art = Artikolo.artikolo("#xml_text");
    art?.insert(text,true);
    // $("#xml_text").insert(text);
    // $("#xml_text").change();
    Dialog.fermu("#sxablono_dlg");
}

function plenigu_lastaj_liston() {
    u.HTTPRequest('get',"revo_lastaj_redaktoj",{},
        function(xhr: XMLHttpRequest, data: string) {   
            if (this.status == 302) {
                // FIXME: When session ended the OpenID redirect 302 is handled 
                // behind the scenes and here we get openid/login with status 200
                show_xhr_error(xhr,"Via seanco finiĝis. Bonvolu resaluti!");
            } else {
                const json = JSON.parse(data);
                let listo = '';
                // let previous = null; //{kap: '', art1: '', art2: ''};
                
                for (let h=0; h < json.length; h++) {
                    var entry = json[h];
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
                
                DOM.al_html("#lastaj_listo",listo);
                DOM.al_datum("#lastaj_listo","detaloj",json);
            }

            // adaptu altecon de la dialogo, por ke la listo ruliĝu sed la titolo kaj reir-butono montriĝu...
            //var dlg = $("#lastaj_dlg").parent();
            //var view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            //var decl_h = (view_h * .70) - dlg.children(".ui-dialog-titlebar").height(); // - dlg.children(".ui-dialog-buttonpane").height();
            //$("#lastaj_tabelo").height(decl_h);
        },
        () => document.body.style.cursor = 'wait',
        () => document.body.style.cursor = 'auto',
        show_xhr_error
    );
}


function lastaj_tabelo_premo(event: Event) {
    event.preventDefault();
    const trg = event.target;
    const id = trg.closest("tr").id;
    const dtl = DOM.datum("#lastaj_listo","detaloj");
    let entry = dtl.filter(function(e) { if (e.id == id) return e; });
    if (entry) {
        entry = entry[0];
        DOM.al_v("#lastaj_dosiero",entry.name);
        DOM.al_datum("#lastaj_dosiero","url",entry.xml_url);
        DOM.al_datum("#lastaj_rigardu","url",entry.html_url);
        DOM.al_datum("#lastaj_dosiero","rezulto",entry.rezulto);
        if (entry.rezulto == 'eraro') {
            Buton.aktiva("#lastaj_reredakti",true);
        } else {
            Buton.aktiva("#lastaj_reredakti",false);
        }
        DOM.al_v("#lastaj_mesagho",'');
        if (entry.rez_url) {
            u.HTTPRequest('get',entry.rez_url,{},
                function(data: string) {  
                    var rez = JSON.parse(data); 
                    if (rez && rez.mesagho) {
                        var msg = rez.mesagho.replace(/\|\| */g,"\n").replace('[m ','[');
                        DOM.al_v("#lastaj_mesagho",msg);
                    }
                });
        } else if (! entry.rezulto) {
            DOM.al_v("#lastaj_mesagho",'Atendante traktadon...');
        }
    }
}

