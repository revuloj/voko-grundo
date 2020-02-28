
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

function setCookieConsent() {
    var CookieDate = new Date;
    var ExpireDate = new Date; ExpireDate.setFullYear(CookieDate.getFullYear() + 50);
    document.cookie = 'revo-konsento=jes+' + CookieDate.toISOString() +'; expires=' + ExpireDate.toUTCString() + '; path=/;';
    document.getElementById('kuketoaverto').style.display = 'none'; 
}    
