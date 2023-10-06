
/* 
  (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

/*import { krei_dialogo, shargi_dialogo, sendi_dialogo, derivajho_dialogo, senco_dialogo, 
        traduko_dialogo, ekzemplo_dialogo, bildo_dialogo, referenco_dialogo, sxablono_dialogo, 
        rimarko_dialogo, homonimo_dialogo, datumprotekto_dialogo } from './ui_dlg.js';
        */

import { Menu, Dialog } from '../ui';

import { kontroli_artikolon, montri_indikojn } from './ui_tabl.js';
import { surmetita_dialogo } from './ui_err.js';


export default function() {
    console.debug("Instalante la menuon...");

    // menuo
    new Menu("#menu", {
          eroj: ":scope>li:not(.ui-widget-header)",
          reago: menu_selected
      });
        
      // loka menuo
    /**
      $( "#local_menu" ).menu({
          //items: "> :not(.ui-widget-header)",
          select: localmenu_selected
      });
      $( "#elekto_menuo").hide();
      **/
}


//*********************************************************************************************
//* Traktado de menuelektoj 
//*********************************************************************************************


function menu_selected(event: Event) {
    const menuero = event.currentTarget;
    if (menuero instanceof Element) {

        const id = menuero.id;
        let dlg: Dialog|undefined;

        switch (id) {
        case "nova_menu_item":
            Dialog.malfermu("#krei_dlg");
            break;            
        case "shargi_menu_item":
            Dialog.malfermu("#shargi_dlg");
            break;
        case "lastaj_menu_item":
            Dialog.malfermu("#lastaj_dlg");
            break;
        case "sendiservile_menu_item":
            Dialog.malfermu("#sendiservile_dlg");
            break;
        case "kontroli_menu_item":
            kontroli_artikolon();
            break;
        case "referenco_menu_item":
            dlg = Dialog.dialog("#referenco_dlg");
            if (dlg) dlg.opcioj["enmetu_en"]='xml_text';
            Dialog.malfermu("#referenco_dlg");
            break;
        case "ekzemplo_menu_item":
            dlg = Dialog.dialog("#ekzemplo_dlg");
            if (dlg) dlg.opcioj["enmetu_en"]='xml_text';
            Dialog.malfermu("#ekzemplo_dlg");
            break;      
        case "bildo_menu_item":
            Dialog.malfermu("#bildo_dlg");
            break;      
        case "derivajho_menu_item":
            Dialog.malfermu("#derivajho_dlg");
            break;                 
        case "senco_menu_item":
            Dialog.malfermu("#senco_dlg");
            break;                 
        case "tradukoj_menu_item":
            Dialog.malfermu("#traduko_dlg");
            break;            
        case "sxablono_menu_item":
            Dialog.malfermu("#sxablono_dlg");
            break;                 
        case "rimarko_menu_item":
            Dialog.malfermu("#rimarko_dlg");
            break;
        case "indiko_menu_item":
            montri_indikojn();
            break;
/*   nun en ĉefa Revo...         
        case "homonimoj_menu_item":
            $("#homonimo_dlg").dialog("open");
            break;
            */
        case "datumprotekto_menu_item":
            surmetita_dialogo("static/datumprotekto.html","deklaro_teksto");
            //datumprotekto_dialogo();
            break;
        default:
            alert('Neniu ago difinita por menuero '+id);
        }
    }
}

