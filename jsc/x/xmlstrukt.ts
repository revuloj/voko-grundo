
/*
 (c) 2021-2023 ĉe Wolfram Diestel
*/

import { count_char } from './util';
import { Tekst, TParto } from '../ui';

/*
  PLIBONIGU: ĉar 'id' baziĝas sur la rdaktata testo, en iuj okazoj ĝi ne estas unika kaŭzanta problemojn.
  Alternative ni povus generi unikajn id-ojn aŭtomate kaj aldoni kiel atributo @id aŭ kiel komentoj 
  #>>> UUID
  ...
  #<<<
  en la XML. Tamen kiel fari tion, ke la reaktanto nek ĝeniĝas nek povas fuŝi tiujn?
*/

/*
export interface SId {
  id: string, // unika ŝlosilo kalkulita (el mrk aŭ tekstkomenco+-fino) por la subteksto
  el?: string, // la elemento (art, subart, drv, ...subsnc)
  ln?: number // la komenca linio ene de la tuta XML
}*/

type XEl = "xml"|"art"|"subart"|"drv"|"subdrv"|"snc"|"subsnc";

export interface SDet extends TParto {
  /*
  el: XEl, // la elemento (art, subart, drv, ...subsnc)
  no: number, // la numero de la subteksto en la listo
  de: number, // la indekso de la komenca signo subteksta en la tuta XML
  al: number, // la indekso de la lasta signo subteksta en la tuta XML
  ln: number, // la komenca linio ene de la tuta XML
  lc?: number, // la nombro de linioj (ĉu ni havu ĉiam, momente ne por XML-tuto...!?)
  */
  mrk?: string, // la XML-atributo mrk, se la elemento ĝin havas
  kap?: string, // la kapvorto, se la elemento ĝin havas
  mlg: string, // konciza priskribo
  dsc: string // konciza priskribo prefiksata de hierakia elementindiko
}

// export type Strukturero = SId & SDet;

export type XElPos = { pos: number, end: number, elm: string };

/**
 * Administras XML-tekston kiel strukturo de subtekstojTiel eblas reagi ekzemple plenigante liston per la trovitaj subtekstoj (art, drv, snc...) 
 */

  // regulesprimoj bezonataj por analizi la XML-strukturon
  const re_stru = {
    _elm: /[ \t]*<((?:sub)?(?:art|drv|snc))[>\s]/g,
    _eoe: />[ \t]*\n?/g,
    _mrk: /(?:\s*ref\s*=\s*['"][^>"']*['"])?\s*mrk\s*=\s*(['"])([^>"']*?)\1/g,
    _kap: /<kap>([^]*)<\/kap>/,
    /// _rad: /<rad>([^<]+)<\/rad>/,
    /// _dos: /<art\s+mrk="\$Id:\s+([^\.]+)\.xml|<drv\s+mrk="([^\.]+)\./,
    _var: /<var>[^]*<\/var>/g,
    _ofc: /<ofc>[^]*<\/ofc>/g,
    _klr: /<klr[^>]*>[^]*<\/klr>/g,
    _ind: /<ind>([^]*)<\/ind>/g,
    _fnt: /<fnt>[^]*<\/fnt>/g,
    _tl1: /<tld\s+lit="(.)"[^>]*>/g,
    _tl2: /<tld[^>]*>/g
  };

  // enŝovoj por montri la elementojn laŭ tipo en hieraĥio
  const indents: {[el in XEl]: string} = {
    xml: "", art: "", subart: "\u25b8\u00a0", drv: "\u2014 ", subdrv: "\u00a0\u2014 ", 
    snc: "\u00a0\u00a0\u00a0\u22ef ", subsnc: "\u00a0\u00a0\u00a0\u22ef\u22ef "
  };


  // signoj por koncize reprezenti la elementojn en elekto-listo
  const elements: {[el in XEl]: string}  = {
    art: "", xml: "", subart: "\u24d0",
    drv: "\u24b9", subdrv: "\u24d3", snc: "\u24c8", subsnc: "\u24e2"
  }

  /**
   * Ekstraktas strukturon de art/subart/drv/subdrv/snc/subsnc el la artikolo. 
   * Tio estas listo de (ingigitaj) subtekstoj por ĉiu el kiuj la listo enhavos objekton 
   * @param elektenda - se donita tio estas la elektita subteksto kaj estos markita en la revokfunkcio onaddsub (4-a argumento: true)
   */
  export function struktur_analizo(tekst: Tekst, elektenda?: string) {
      // sinkrohigo ofte kaŭzas strukturanalizon, do evitu ciklon legante la tekston
      const xmlteksto = tekst.teksto_sensinkronigo; 
  
      /**
       * Ekstraktu la XML-atributon 'mrk' el la subteksto
       * @param elm - la elemento de la subteksto (art,subart,drv,...,subsnc)
       * @param de - la komenco de la subteksto en la tuta XML
       * @returns la atributon 'mrk'
       */
      function _mrk(elm: XEl, de: number) {
        let i_start = xmlteksto.indexOf('<',de);
        if (i_start > -1) {
          i_start += 1 + elm.length + 1; // de:"<elm " 
          re_stru._mrk.lastIndex = i_start;
          const m = re_stru._mrk.exec(xmlteksto);
          if (m && m.index == i_start) { 
            const mrk = m[2];
            return (elm != 'art'? 
              mrk.substring(mrk.indexOf('.')+1) 
              : (mrk.slice(mrk.indexOf(':')+2,-20)) || '<nova>');
          }  
        }
      }
      
      // trovas la kapvorton de elemento
      function _kap(elm: XEl, de: number, ghis: number) {
        if (elm == 'drv') {
          // find kap
          const drv = xmlteksto.substring(de,ghis);
          const mk = drv.match(re_stru._kap); 
          //re_stru._kap.lastIndex = de;
          if (mk) {
            const kap = mk[1]
            .replace(re_stru._var,'')
            .replace(re_stru._ofc,'')
            .replace(re_stru._fnt,'')
            .replace(re_stru._tl1,'$1~')
            .replace(re_stru._tl2,'~')
            .replace(/\s+/,' ')
            .replace(',',',..')
            .trim();  // [^] = [.\r\n]
  
            return kap;
          }
        }
      }
      // kreas identigilon el marko resp. enhavkomenco kaj -fino
      function _id(subt: SDet) {
        const rx = /[^A-Za-z]/g;
        const key = [123,45,67,89,102,43,69]; // enhavo ne tro gravas sed estu ne tro mallonga...
  
        // kondensigi signoĉenon al identigilo
        const hash_str = (str: string) => 
          { 
              var c = key;
              for(let i=0; i<str.length; i++) { 
                  c[i%key.length] ^= str.charCodeAt(i);
              }
              //return c.join('.');
              return c.map(v=>(v%36).toString(36)).join('')
          };
        if (subt.mrk) {
          // se la elemento havas markon, tio estas la plej bona identigilo
          return hash_str(subt.mrk);
        } else {
          if ((subt.al - subt.de) < 120) {
            // KOREKTU: se tiu eraro foje okazas, ni povus mallongigi la uzatajn signojn
            // por tiu konkreta subteksto al la efektive enhavataj, ĉu?
            console.error('subteksto tro mallonga, ni atendas almenaŭ 120 signojn')
          }
          // se ne, ni uzas la numeron kaj la unuajn kaj lastajn aperantajn latinajn literojn por
          // identigi, ja konsciante, ke tiuj povos ŝanĝiĝi, sed tiam
          // ni rekalkulas la strukturon kaj akceptas, ke ni ne
          // retrovas la antaŭan elekton...
          return hash_str('_'+subt.no
            + '_' + xmlteksto.substring(subt.de,subt.de+120).replace(rx,'')
            + '_' + xmlteksto.substring(subt.al-120,subt.al-1).replace(rx,'')
          );
        }
      }
      // trovas la finon de elemento 'elm'
      function _al(elm: XEl, de: number) {
        var fin = xmlteksto.indexOf('</'+elm, de);
        // trovu avance >..\n?
        re_stru._eoe.lastIndex = fin;
        const eoe = re_stru._eoe.exec(xmlteksto);
        if (eoe && eoe.index) fin = eoe.index + eoe[0].length;
  
        return fin;
      }
  
      //this.strukturo = [];
      // super.purigu();
  
      // la regulestrimo trovas ĉiujn art, drv, snc kaj subart, subdrv, subsnc en la XML
      let m = re_stru._elm.exec(xmlteksto);
  
      // por ĉiu trovo ni ekstraktas la informojn bezonatajn por
      // ĵongli la unuopaj pecojn en la redaktilo
      while (m) {
        const elm = m[1] as XEl; // la elemento (art,drv,snc...)
        const de = m.index; // komenca signo
        const al = _al(elm, m.index+5); // fina signo
  
        let subt: SDet = {
          el: elm, 
          de: de, 
          ln: count_char(xmlteksto,'\n',0,m.index), // komenca linio
          al: al, 
          lc: count_char(xmlteksto,'\n',m.index,al), // lininombro
          mrk: _mrk(elm,de), // la marko de la elemento, se estas
          kap: _kap(elm,de,al), // la kapvorto
          //no: this.strukturo.length,
          mlg: "<tbd>",
          dsc: "<tbd>",
          id: "<tbd>"
        }
        subt.id = _id(subt); // identigilo por la peco
        
        // kunmetu etikedon por la peco el elementnomo kaj sufikso
        const suff = subt.kap ? subt.kap : subt.mrk||'';
        subt.mlg = suff? suff : '('+subt.el+')';
        subt.dsc = indents[subt.el as XEl] + (
          subt.el!='art'? 
            elements[subt.el as XEl] + ' ' + subt.mlg 
            : suff);
  
        // ĉe la kapvorto de la artikolo ekstraktu la radikon
        //if (subt.el == 'art') this.radiko = _rad(subt.de,subt.al);
  
        // console.debug(subt.de + '-' + subt.al + ': ' + subt.id + ':' + subt.dsc);
  
        /// if (this.onaddsub) this.onaddsub(subt,this.strukturo.length,subt.id == selected);
  
        tekst.aldonu(subt, subt.id == elektenda);
        //this.strukturo.push(subt);
        //sel_stru.append(ht_element('option',{value: strukturo.length-1},item));
  
        m = re_stru._elm.exec(xmlteksto);
      }
  
      // en la fino de la listo aldonu ankoraŭ elektilon por la tuta XML
      const tuto: SDet = {el: "xml", de: 0, ln: 0, al: xmlteksto.length, 
        id: "x.m.l", mlg: 'tuta', dsc: 'tuta xml-fonto'}; //, no: this.strukturo.length};
      /// if (this.onaddsub) this.onaddsub(tuto,this.strukturo.length,tuto.id == selected);
  
      tekst.aldonu(tuto, tuto.id == elektenda);
      //this.strukturo.push(tuto);
    };

