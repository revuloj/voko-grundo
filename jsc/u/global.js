/**
 * Por eviti problemojn kun enpakado de moduloj (konkrete en google-closure-compiler)
 * ni kreas tie ĉi nomspacon por globaj variabloj. Vi povas aldoni pliajn simple kiel
 * variablo aŭ konstanto kaj aliri ilin per global.mia_variablo
 */
var global = (function() {
    const eldono = '2b';
    return {
        eldono: eldono,
        debug: false,
        revo_url: "reta-vortaro.de",
        revo_prefix: "/revo/",
        art_prefix: "/revo/art/",
        tez_prefix: "/revo/tez/",
        dlg_prefix: "/revo/dlg/",
        sercho_url: "/cgi-bin/sercxu-json-" + eldono + ".pl",
        trad_uwn_url: "/cgi-bin/traduku-uwn.pl",
        // hazarda_url: "/cgi-bin/hazarda_art.pl",
        titolo_url: "titolo-"+ eldono +".html",
        redaktilo_url: "redaktilo-"+ eldono +".html",
        redaktmenu_url: "redaktmenu-"+ eldono +".html",
        // inx_eo_url: "/revo/inx/_eo.html",
        inx_eo_url: "/revo/inx/_plena.html",
        mx_trd_url: "/cgi-bin/mx_trd.pl",
        nombroj_url: "/cgi-bin/nombroj.pl",
        mrk_eraro_url: "/cgi-bin/mrk_eraroj.pl",
        http_404_url: "/revo/dlg/404.html",
        sercho_videblaj: 7,

        preflng: 'en'
    };
})();