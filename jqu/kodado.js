/*************************************************************************

// (c) 2008 - 2018 Wolfram Diestel, Wieland Pusch, Bart Demeyere & al.
// laŭ GPL 2.0


*****************************************************************************/


//*********************************************************************************************
// iloj por signaroj...
//*********************************************************************************************

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };


  /**
   * Calculate a 32 bit FNV-1a hash
   * Found here: https://gist.github.com/vaiorabbit/5657561
   * Ref.: http://isthe.com/chongo/tech/comp/fnv/
   *
   * @param {string} str the input value
   * @param {boolean} [asString=false] set to true to return the hash value as 
   *     8-digit hex string instead of an integer
   * @param {integer} [seed] optionally pass the hash of the previous chunk
   * @returns {integer | string}
   */
  String.prototype.hashFnv32a = function(asString, seed) {
      var str = this;
      /*jshint bitwise:false */
      var i, l,
          hval = (seed === undefined) ? 0x811c9dc5 : seed;
  
      for (i = 0, l = str.length; i < l; i++) {
          hval ^= str.charCodeAt(i);
          hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
      }
      if( asString ){
          // Convert to 8 digit hex string
          return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
      }
      return hval >>> 0;
 }  
function alCx(text) {
    return (
      text.replace('Ĉ','Cx')
          .replace('Ĝ','Gx')
          .replace('Ĥ','Hx')
          .replace('Ĵ','Jx')
          .replace('Ŝ','Sx')
          .replace('Ŭ','Ux')
          .replace('ĉ','cx')
          .replace('ĝ','gx')
          .replace('ĥ','hx')
          .replace('ĵ','jx')
          .replace('ŝ','sx')
          .replace('ŭ','ux'));   
}


// http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values
function quoteattr(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only 
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */ 
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
        ;
}

function formatFloat(x,nbDec) { 
    if (!nbDec) nbDec = 100;
    var a = Math.abs(x);
    var e = Math.floor(a);
    var d = Math.round((a-e)*nbDec); if (d == nbDec) { d=0; e++; }
    var signStr = (x<0) ? "-" : " ";
    var decStr = d.toString(); var tmp = 10; while(tmp<nbDec && d*tmp < nbDec) {decStr = "0"+decStr; tmp*=10;}
    var eStr = e.toString();
    return signStr+eStr+","+decStr;
}

/**
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function encode_utf8(rohtext) {
         // dient der Normalisierung des Zeilenumbruchs
         rohtext = rohtext.replace(/\r\n/g,"\n");
         var utftext = "";
         for(var n=0; n<rohtext.length; n++)
             {
             // ermitteln des Unicodes des  aktuellen Zeichens
             var c=rohtext.charCodeAt(n);
             // alle Zeichen von 0-127 => 1byte
             if (c<128)
                 utftext += String.fromCharCode(c);
             // alle Zeichen von 127 bis 2047 => 2byte
             else if((c>127) && (c<2048)) {
                 utftext += String.fromCharCode((c>>6)|192);
                 utftext += String.fromCharCode((c&63)|128);}
             // alle Zeichen von 2048 bis 66536 => 3byte
             else {
                 utftext += String.fromCharCode((c>>12)|224);
                 utftext += String.fromCharCode(((c>>6)&63)|128);
                 utftext += String.fromCharCode((c&63)|128);}
             }
         return utftext;
     }

function decode_utf8(utftext) {
         var plaintext = ""; var i=0; var c=c1=c2=0;
         // while-Schleife, weil einige Zeichen uebersprungen werden
         while(i<utftext.length)
             {
             c = utftext.charCodeAt(i);
             if (c<128) {
                 plaintext += String.fromCharCode(c);
                 i++;}
             else if((c>191) && (c<224)) {
                 c2 = utftext.charCodeAt(i+1);
                 plaintext += String.fromCharCode(((c&31)<<6) | (c2&63));
                 i+=2;}
             else {
                 c2 = utftext.charCodeAt(i+1); c3 = utftext.charCodeAt(i+2);
                 plaintext += String.fromCharCode(((c&15)<<12) | ((c2&63)<<6) | (c3&63));
                 i+=3;}
             }
         return plaintext;
     }
     
***/

