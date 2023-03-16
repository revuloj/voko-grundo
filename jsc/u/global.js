/**
 * Por eviti problemojn kun enpakado de moduloj (konkrete en google-closure-compiler)
 * ni kreas tie ĉi centre globajn variablojn. Vi povas aldoni pliajn kaj aliri ilin 
 * per globalThis.mia_variablo.
 * 
 * vd. ekz-e https://www.contentful.com/blog/2017/01/17/the-globalThis-object-in-javascript/
 */


// rigardataj kiel konstantoj:
globalThis.eldono = "2g";
globalThis.debug = false;

// agordoj pri reta-vortaro.de
globalThis.revo_url = "reta-vortaro.de";
globalThis.revo_prefix = "/revo/";
globalThis.art_prefix = "/revo/art/";
globalThis.tez_prefix = "/revo/tez/";
globalThis.dlg_prefix = "/revo/dlg/";
globalThis.sercho_url = "/cgi-bin/sercxu-json-" + globalThis.eldono + ".pl";
globalThis.trad_uwn_url = "/cgi-bin/traduku-uwn.pl";
globalThis.titolo_url = "titolo-"+ globalThis.eldono +".html";
globalThis.redaktilo_url = "redaktilo-"+ globalThis.eldono +".html";
globalThis.redaktmenu_url = "redaktmenu-"+ globalThis.eldono +".html";
globalThis.inx_eo_url = "/revo/inx/_plena.html";
globalThis.mx_trd_url = "/cgi-bin/mx_trd.pl";
globalThis.nombroj_url = "/cgi-bin/nombroj.pl";
globalThis.mrk_eraro_url = "/cgi-bin/mrk_eraroj.pl";
globalThis.http_404_url = "/revo/dlg/404.html";
globalThis.sercho_videblaj = 7;

// aliaj agordoj...
globalThis.help_base_url = 'https://revuloj.github.io/temoj/';
globalThis.help_regulesp = 'sercho#ser%C4%89i-per-regulesprimoj';

globalThis.lingvoj_xml = "../cfg/lingvoj.xml";
// en Cetonio: '../voko/lingvoj.xml'

    // const hazarda_url = "/cgi-bin/hazarda_art.pl";
    //const inx_eo_url = "/revo/inx/_eo.html";

// rigardata kiel variablo
globalThis.preflng = 'en';
