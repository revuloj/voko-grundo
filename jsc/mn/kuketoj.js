/* jshint esversion: 6 */

// (c) 2020, 2021 Wolfram Diestel

/**
 * Kontrolas la konsenton de la uzanto pri kuketoj. Tio
 * siavice memoriĝas en la retumilo kiel kuketo 'revo-konsento'
 */
function checkCookieConsent() {
    var cookies = document.cookie;
    console.log(cookies);
    var found = cookies.indexOf('revo-konsento=jes');
    if (found >= 0) {
	document.getElementById('kuketoaverto').style.display = 'none'; 
    } else {
	document.getElementById('kuketoaverto').style.display = 'block'; 
    }
}

/**
 * Notas la konsenton pri kuketoj kreante kuketon 'revo-konsento=jes'+ aktuala dato.
 */
function setCookieConsent() {
    var CookieDate = new Date();
    var ExpireDate = new Date(); ExpireDate.setFullYear(CookieDate.getFullYear() + 50);
    document.cookie = 'revo-konsento=jes+' + CookieDate.toISOString() +'; expires=' + ExpireDate.toUTCString() + '; path=/;';
    document.getElementById('kuketoaverto').style.display = 'none'; 
}    
