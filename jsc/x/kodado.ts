/*************************************************************************
// (c) 2008-2023 Wolfram Diestel, Wieland Pusch, Bart Demeyere & al.
// laŭ GPL 2.0
*****************************************************************************/

//*********************************************************************************************
// iloj por signaroj...
//*********************************************************************************************

import { voko_entities } from './voko_entities';

declare global {
    interface String {
        hashFnv32a(asString: boolean, seed?: number): number|string;
    }
}


/**
 * Haketo kreita el teksto. Ni etendas la String.objekton tiel
 * @returns la haketo de la teksto
 */
/*
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
*/

/**
 * Kalkulas 32bit FNV-1a-haketon
 * trovita ĉi tie: https://gist.github.com/vaiorabbit/5657561
 * ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param asString se true: redonu la haketon kiel 8-ciferan hex-signaron anstataŭ kiel nombron
 * @param seed opcie pasas la haketon de la antaŭa porcio kiel semon
 * @returns 
 */
String.prototype.hashFnv32a = function(asString: boolean=false, seed?: number): number | string {
    const str = this;
    /*jshint bitwise:false */
    const l = str.length;
    let hval = (seed === undefined) ? 0x811c9dc5 : seed;
  
    for (let i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    
    if (asString) {
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).slice(-8);
    }

    return hval >>> 0;
};

/**
 * Tradukas en teksto supersignajn literojn laŭ la x-formo, do Ĉ al Cx ktp. ... ŭ al ux 
 * @param text 
 * @returns la teksto kun la askiigitaj supersignoj
 */ 
export function alCx(text: any) {
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


/**
 * Tradukas la specialajn XML-signojn al unuoj por protekti ilin de interpreto kiel XML-sintakso
 * vd http://stackoverflow.com/questions/7753448/how-do-i-escape-quotes-in-html-attribute-values
 * @param s 
 * @param preserveCR 
 * @returns la tradukita teksto
 */
export function quoteattr(s: string, preserveCR: boolean=false) {
    const CR = preserveCR ? '&#13;' : '\n';
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
        .replace(/\r\n/g, CR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, CR);
}

/**
 * Prezentas glitpunktan nombron kiel teksto
 * @param x 
 * @param nbDec 
 * @returns la teksta prezento de la nombro
 * 
 */
export function formatFloat(x: number, nbDec: number) { 
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
 * Anstataŭigas & per &amp; en URL-oj post '?'
 */
export function amp_url(str: string): string {
    // anstataŭigu & post ? per &amp;
    const d = str.indexOf('?');
    if (d > 1) {
        return str.substring(0,d) + str.substring(d).replace(/&/g,'&amp;');
    }
    return str;
}


/**
 * Anstataŭigas DTD-mallongigojn el vokourl.dtd
 */
export function dtd_url(str: string): string|undefined {
    // anstataŭigu URL-ojn per mallongigoj el vokourl.dtd
    for (const [mlg,val] of Object.entries(voko_entities)) {
        if (val.startsWith("http") && str.indexOf(val) > -1) {
            return str.replace(val,`&${mlg};`);
        }
    }
}

