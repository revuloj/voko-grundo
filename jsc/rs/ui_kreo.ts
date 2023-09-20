
/**
 * @license (c) 2016 - 2023 Wolfram Diestel
 * lau GPL 2.0
 */

//x/ <reference types="@types/jqueryui/index.d.ts" />
import { DOM, Musnot } from '../ui';

import menu_init from './ui_menu.js';
import dlg_init from './ui_dlg.js';
import tabl_init from './ui_tabl.js';


//*********************************************************************************************
//* Preparoj 
//*********************************************************************************************

// ŝovita al global.js
// var preflng='en';


DOM.dok_post_lego(function () {
    console.debug("Instalante la enirfunkcion...");
       
    // prepari la redaktilo-aranĝon
    console.debug("Preparante la redaktilon...");
    tabl_init();
    menu_init();
    dlg_init();

    // mus-notoj
    new Musnot(document);
    console.debug("La redaktilo estas laborpreta!");   
});


