
/**
 * @license (c) 2016 - 2023 Wolfram Diestel
 * lau GPL 2.0
 */

/// <reference types="@types/jqueryui/index.d.ts" />

import menu_init from './ui_menu.js';
import dlg_init from './ui_dlg.js';
import tabl_init from './ui_tabl.js';


//*********************************************************************************************
//* Preparoj 
//*********************************************************************************************

// ŝovita al global.js
// var preflng='en';

console.debug("Instalante la enirfunkcion...");
$(document).ready(function () {
       
    // prepari la redaktilo-aranĝon
    $(function () {
      console.debug("Preparante la redaktilon...");
      tabl_init();
      menu_init();
      dlg_init();

      // mus-notoj
      $( document ).tooltip();
      console.debug("La redaktilo estas laborpreta!");   
    });
});


