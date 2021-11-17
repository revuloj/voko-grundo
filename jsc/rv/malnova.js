var index_malnova_url = "/revo/index-malnova.html"; // poste index-malnova.html aŭ inx/_plena.html

function isIE() {
    ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    var is_ie = ua.indexOf("MSIE") > -1 || ua.indexOf("Trident/") > -1;
    
    return is_ie; 
}
  
function isKHTMLEdge() {
    ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    var is_ek = ua.indexOf("KHTML") > -1 && ua.indexOf("Edge/") > -1;
    
    return is_ek; 
}

// malnova IE ne estas subtenita, iru tuj al manlnova fasado
// malnova Edge kun KTHML ne subtenas kelkajn HTML5-aferojn kiel
// summary/details - do provizore ankaŭ ĝi ricevos la malnovan paĝaron!
if (isIE() || isKHTMLEdge()) {
    location.href=index_malnova_url;   
}
