/**
 * Por eviti problemojn kun enpakado de moduloj (konkrete en google-closure-compiler)
 * ni kreas tie ĉi nomspacon por globaj variabloj. Vi povas aldoni pliajn simple kiel
 * variablo aŭ konstanto kaj aliri ilin per global.mia_variablo
 */

window.global = new Object();

// rigardataj kiel konstantoj:
window.global.eldono = '2b';
window.global.debug = false;
window.global.revo_url = "reta-vortaro.de";
window.global.revo_prefix = "/revo/";
window.global.art_prefix = "/revo/art/";
window.global.tez_prefix = "/revo/tez/";
window.global.dlg_prefix = "/revo/dlg/";
window.global.sercho_url = "/cgi-bin/sercxu-json-" + window.global.eldono + ".pl";
window.global.trad_uwn_url = "/cgi-bin/traduku-uwn.pl";
window.global.titolo_url = "titolo-"+ window.global.eldono +".html";
window.global.redaktilo_url = "redaktilo-"+ window.global.eldono +".html";
window.global.redaktmenu_url = "redaktmenu-"+ window.global.eldono +".html";
window.global.inx_eo_url = "/revo/inx/_plena.html";
window.global.mx_trd_url = "/cgi-bin/mx_trd.pl";
window.global.nombroj_url = "/cgi-bin/nombroj.pl";
window.global.mrk_eraro_url = "/cgi-bin/mrk_eraroj.pl";
window.global.http_404_url = "/revo/dlg/404.html";
window.global.sercho_videblaj = 7;

    // const hazarda_url = "/cgi-bin/hazarda_art.pl";
    //const inx_eo_url = "/revo/inx/_eo.html";

// rigardata kiel variablo
window.global.preflng = 'en';
