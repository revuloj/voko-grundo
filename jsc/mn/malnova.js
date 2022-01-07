
/* jshint esversion: 6 */

// (c) 2020, 2021 Wolfram Diestel


var index_malnova_url = "/revo/index-malnova.html"; // poste index-malnova.html aŭ inx/_plena.html

/**
 * Testas, ĉu la retumilo estas 'Internet Explorer'
 * @returns true: IE
 */
function isIE() {
    var ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    var is_ie = ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1;
    
    return is_ie; 
}
  
/**
 * Testas, ĉu la retumilo baziĝas sur KHTML
 * @returns true: KHTMLEdge-retumilo
 */
function isKHTMLEdge() {
    var ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    var is_ek = ua.indexOf("KHTML") > -1 && ua.indexOf("Edge/") > -1;
    
    return is_ek; 
}

/**
 * Malnova IE ne estas subtenita, iru tuj al malnova fasado.
 * Malnova Edge kun KTHML ne subtenas kelkajn HTML5-aferojn kiel
 * summary/details - do ankaŭ ĝi ricevos la malnovan paĝaron!
 */
if (isIE() || isKHTMLEdge()) {
    location.href=index_malnova_url;   
}
