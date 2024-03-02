/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0

 Konservo kaj relego de preferoj de redaktado.
 (preferdialog por agordi lingvojn troviĝas en a/preferoj)
*/

import {DOM} from '../ui';

/**
   * Konservas la valorojn de kelkaj kampoj (redaktanto, traduklingvo kc) 
   * en la loka memoro de la retumilo.
   * @memberof redaktilo
   */
export function store_preferences() {
    var prefs: {[key: string]: any} = {};
    for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo','r:xklvr']) {
      const el = document.getElementById(key) as HTMLInputElement;
      if (el) prefs[key] = el.value;
    }
    window.localStorage.setItem("redaktilo_preferoj",JSON.stringify(prefs));  
  }

  /**
   * Legas la memorigitajn valorojn de kelkaj kampoj en la redaktilo-menuo (maldekstra naviga parto)
   * el la loka memoro de la retumilo kaj metas ilin en la respektivajn kampojn de la redaktilo.
   * @memberof redaktilo
   * @inner
   */
export function restore_preferences() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
      for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo']) {
        const e = document.getElementById(key) as HTMLInputElement;
        if (prefs[key]) e.value = prefs[key];
      }
    }
  }

  /**
   * Legas unuopan valoron el la el la loka memoro de la retumilo.
   * @memberof redaktilo
   * @param key - la ŝlosilo de la legenda valoro.
   * @returns la valoro el preferoj
   */
export function get_preference(key: string): any {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
        return prefs[key];
    }
  }

  /**
   * Legas valorojn de preferoj por la dekstra XML-parto de la redaktilo 
   * el la loka memoro de la retumilo. Momente tio estas la stato de la cx-ŝaltilo
   * kaj de la kromklavaro.
   * @memberof redaktilo
   * @inner
   */
export function restore_preferences_xml() {
    const str = window.localStorage.getItem("redaktilo_preferoj");
    const prefs = (str? JSON.parse(str) : {});
    /// const cx = document.getElementById('r:cx') as HTMLInputElement;
    const xklvr = document.getElementById('r:xklvr') as HTMLInputElement;
    /// cx.value = prefs['r:cx'] || 0;
    if (prefs['r:xklvr']) {
      xklvr.value = "1";
      DOM.malkaŝu("#r\\:klavaro");
    } else {
      xklvr.value = "0";
      DOM.kaŝu("#r\\:klavaro");
    }
  }