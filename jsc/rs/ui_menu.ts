
/* 
  (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

/*import { krei_dialogo, shargi_dialogo, sendi_dialogo, derivajho_dialogo, senco_dialogo, 
        traduko_dialogo, ekzemplo_dialogo, bildo_dialogo, referenco_dialogo, sxablono_dialogo, 
        rimarko_dialogo, homonimo_dialogo, datumprotekto_dialogo } from './ui_dlg.js';
        */

import { Menu } from '../ui';

import { kontroli_artikolon, montri_indikojn } from './ui_tabl.js';
import { surmetita_dialogo } from './ui_err.js';

console.debug("Instalante la menuon...");

export default function() {
      // menuo
    new Menu("#menu", {
          items: "> :not(.ui-widget-header)",
          select: menu_selected
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


function menu_selected(event, ui) {
    var id = ui.item.attr('id');
    switch (id) {
        case "nova_menu_item":
            $("#krei_dlg").dialog("open");
            break;            
        case "shargi_menu_item":
            $("#shargi_dlg").dialog("open");
            break;
        case "lastaj_menu_item":
            $("#lastaj_dlg").dialog("open");
            break;
        case "sendiservile_menu_item":
            $("#sendiservile_dlg").dialog("open");
            break;
        case "kontroli_menu_item":
            kontroli_artikolon();
            break;
        case "referenco_menu_item":
            $("#referenco_dlg").dialog("option","enmetu_en",'xml_text');
            $("#referenco_dlg").dialog("open");
            break;
        case "ekzemplo_menu_item":
            $("#ekzemplo_dlg").dialog("option","enmetu_en",'xml_text');
            $("#ekzemplo_dlg").dialog("open");
            break;      
        case "bildo_menu_item":
            $("#bildo_dlg").dialog("open");
            break;      
        case "derivajho_menu_item":
            $("#derivajho_dlg").dialog("open");
            break;                 
        case "senco_menu_item":
            $("#senco_dlg").dialog("open");
            break;                 
       case "tradukoj_menu_item":
            $("#traduko_dlg").dialog("open");
            break;            
        case "sxablono_menu_item":
            $("#sxablono_dlg").dialog("open");
            break;                 
        case "rimarko_menu_item":
            $("#rimarko_dlg").dialog("open");
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

