
/*
 (c) 2021-2023 ĉe Wolfram Diestel
*/

import { count_char } from './util';
import { Tekst, TParto } from '../ui';
/*
export interface SId {
  id: string, // unika ŝlosilo kalkulita (el mrk + evtl. tekstkomenco) por la subteksto
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
  dsc: string // konciza pris
}

// export type Strukturero = SId & SDet;

export type XElPos = { pos: number, end: number, elm: string };

/**
 * Administras XML-tekston kiel strukturo de subtekstojTiel eblas reagi ekzemple plenigante liston per la trovitaj subtekstoj (art, drv, snc...) 
 */
/// export class XmlStrukt {

  // public xmlteksto:string; // la tuta teksto
  // public strukturo:Array<Strukturero>; // la listo de subtekstoj [komenco,fino,nomo]
  //public radiko:string;

  /// private onaddsub:Function;

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
      // trovas la radikon de artikolo
      /*
      function _rad(de: number, ghis: number) {
        const art = xmlteksto.substring(de,ghis);
        const mr = art.match(re_stru._rad);
  
        if (mr) {
          const rad = mr[1]
          .replace(/\s+/,' ')
          .trim();  // [^] = [.\r\n]
  
          return rad;
        }
      }
      */
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
      // kreas identigilon el marko resp. enhavkomenco
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
          // se ne, ni uzas la numeron kaj la unuajn aperantajn latinajn literojn por
          // identigi, ja konsciante, ke tiuj povos ŝanĝiĝi, sed tiam
          // ni rekalkulas la strukturon kaj akceptas, ke ni ne
          // retrovas la antaŭan elekton...
          return hash_str('_'+subt.no+'_'+xmlteksto.substring(subt.de,subt.de+120).replace(rx,''));
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
          dsc: "<tbd>",
          id: "<tbd>"
        }
        subt.id = _id(subt); // identigilo por la peco
        
        // kunmetu etikedon por la peco el elementnomo kaj sufikso
        const suff = subt.kap ? subt.kap : subt.mrk||'';
        subt.dsc = indents[subt.el as XEl] + (
          subt.el!='art'? 
            elements[subt.el as XEl]+ (suff?' '+suff:' ('+subt.el+')') 
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
        id: "x.m.l", dsc: 'tuta xml-fonto'}; //, no: this.strukturo.length};
      /// if (this.onaddsub) this.onaddsub(tuto,this.strukturo.length,tuto.id == selected);
  
      tekst.aldonu(tuto, tuto.id == elektenda);
      //this.strukturo.push(tuto);
    };

    /**
     * Trovas la radikon de artikolo
     * @param tekst 
     */
    /*
    export function radiko(tekst: Tekst): string|undefined {
      const mr = tekst.teksto.match(re_stru._rad);

      if (mr) {
        const rad = mr[1]
        .replace(/\s+/,' ')
        .trim();  // [^] = [.\r\n]

        return rad;
      }
    }*/


  /**
   * Redonas dosieronomon trovante ĝin en art-mrk aŭ drv-mrk
   * @returns La dosiernomon ekstraktitan el la trovita mrk-atributo
   */
  /*
  export function art_drv_mrk(tekst: Tekst): string|undefined {
    var match = tekst.teksto.match(re_stru._dos);
    if (match) return (match[1]? match[1] : match[2]);
  };
  */
  
  /**
     * 
   * @constructor
   * @param xml - la XML-teksto
   * @param onAddSub - Revokfunkcio, vokata dum analizo de la strukturo ĉiam, kiam troviĝas subteksto. 
   */
  /*
  constructor(xml: string, onAddSub?: Function) {
    super(null, {
      strukturo: XmlStrukt.struktur_analizo,
      post_aldono: onAddSub
    });

    this.teksto = xml;
    // this.xmlteksto = xml; // la tuta teksto

    //this.strukturo = []; // la listo de subtekstoj [komenco,fino,nomo]

    //this.radiko = '';
    //this.onaddsub = onAddSub;

    // analizu la strukturon
    //this.structure();
}*/


  /**
   * Metas la kompletan XML-tekston laŭ la argumento 'xml' kaj aktualigas la strukturon el ĝi
   * @param xml 
   */
  /*
  setText(xml: string) {
    this.xmlteksto = xml;  
    this.structure();      
  };*/





  /**
   * Anstataŭigas donitan subtekston per nova, ankaŭ aktualigas la struktur-liston
   * @param sd - la anstataŭigenda subteksto
   * @param xml - la nova subteksto
   * @param select - se donita, la strukturelemento kun tiu .id estos poste la elektita
   */
///  replaceSubtext(sd: SId, xml: string, select?: string) {
///      super.anstataŭigu(sd,xml);
///      /*
///      const elekto = this.getStructById(sd.id);
///
///      this.xmlteksto = 
///        (this.xmlteksto.substring(0, elekto.de) 
///        + xml
///        + this.xmlteksto.substring(elekto.al));
///        */
///      // rekalkulu la strukturon pro ŝovitaj pozicioj...
///      this.structure(select);
///  };

  /**
   * Enŝovas novan subtekston post la subtekston kun 's_id'
   * Ĝi atentas, ke rekte post tiu povas okazi sub-subtekstoj,
   * ekzemple enmetante derivaĵon oni devas ignori ties sencojn.
   */
  /*
  insertAfterId(s_id: string, xml: string) {
    // trovu la subtekston laŭ mrk
    const s = this.getStructById(s_id);
    if (!s) throw "Subteksto kun id "+s_id+" ne trovita!"
    // enŝovu la novan subtekston post tiu
    this.setText(
      this.xmlteksto.substring(0,s.al) 
      + "\n"+ xml 
      + this.xmlteksto.substring(s.al));
  }*/

  /**
   * Trovu la informojn de subteksto 'id' en la strukturlisto 
   * @param id 
   * @returns la detalojn kiel objekto
   */
  /*
  getStructById(id: string): Strukturero {
    for (let s of this.strukturo) {
      if (s.id == id) return s;
    }
  };*/

  /**
   * Trovas la subtekston kun 'mrk' en la strukturlisto kaj redonas ties informojn
   * @param mrk 
   */
  /*
  getStructByMrk(mrk: string): Strukturero {
    const p = mrk.indexOf('.');
    if (p) {
      const ms = mrk.slice(p+1);
      for (let s of this.struktur_analizo) {
        if (s.mrk == ms) return s;
      }  
    }
  }*/

  /**
   * Trovas la informon de subteksto: aŭ identigante ĝin per sia .id aŭ
   * per sama elemento kaj komenco devianta maksimume je unu linio
   * @param sd 
   * @returns la informoj pri la subteksto kiel objekto
   */
  /*
  findSubtextId(sd: SId): Strukturero {
    let s = super.subtekst_info(sd.id);

    if(s) { return s; }
    else if (sd.el && sd.ln) {
      for (s of this.strukturo) {
        if ( ( s.el == sd.el )  && ( Math.abs(s.ln-sd.ln) <= 1 ) ) {
          return s;
        }
      }
    }
  }*/


  /**
   * Trovas subtekston en la strukturlisto
   * @param sd - objekto kun .id kaj eventuala pliaj informoj .ln, .el por identigi la subtekston
   * @returns la konernan XML-tekston
   */
  /*
  getSubtext(sd: SId): string {
    const s = this.getStructById(sd.id);
    if (s) return this.xmlteksto.slice(s.de,s.al);
  };
  */


  /**
   * Trovos la parencon de la struktur-elemento, ekzemple ĉe senco tio estas la enhavanta derivaĵo.
   * @param sd - objekto kun .id kaj eventuale pliaj informoj .ln, .el por identigi la subtekston
   * @returns la detalojn de la parenco kiel objekto
   */
  /*
  getParent(sd: SId): Strukturero {
    const s = this.getStructById(sd.id);
    // parenco venas antaŭ la nuna kaj enhavas ĝin (subteksto al..de)
    for (var n = s.no-1; n>=0; n--) {
      const p = this.strukturo[n];
      if (p.de < s.de && p.al > s.al ) return p;  
    }
  };*/

  /**
   * Trovas la plej proksiman parencon de la aktuale elektita subteksto, kiu havas XML-atributon 'mrk'
   * @param sd - objekto kun .id por identigi la subtekston
   * @returns la detalojn de la parenco kiel objekto
   */
  /*
  static getClosestWithMrk(tekst: Tekst): Strukturero {
    const aktiva = tekst.aktiva;
    if (aktiva.mrk) {
      return aktiva;
    } else {
      var p = tekst.patro(sd);
      while (p && p.no > 0) { // ni ne redonos art@mrk (0-a elemento)
        if (p.mrk) return p;
        p = tekst.patro(p);
      }
    }
  };*/


  /**
   * Redonas la XML-atributon 'mrk' de la aktuala subteksto, aŭ tiun de parenco, se ĝi ne havas mem
   * @param sd - objekto kun .id por identigi la subtekston
   * @returns la XML-atributon 'mrk'
   */
  /*
  static getMrk(tekst: Tekst): string {
    const sd = tekst.aktiva;
    const c = this.getClosestWithMrk(sd);
    if (c) return c.mrk;
    return '';
  };*/


  /**
   * Redonas kapvorton, se ene de drv t.e. ties kapvorton, alie la kapvorton de la unua drv
   * en la artikolo
   * @param sd - objekto kun .id por identigi la subtekston
   * @returns la kapvorton, tildo estas anstataŭigita per la radiko, variaĵoj post komo forbalaita
   */
  /*
  getClosestKap(sd: SId): string {
      function kap(e: Strukturero) {
        return e.kap
          .replace('~',rad)
          .replace(/,*./,'');
      }

    const rad = this.radiko;
    const aktiva = super.subtekst_info(sd.id);
    
    if (aktiva.el != 'art' && aktiva.id != "x.m.l") {

      if (aktiva.kap) {
        return kap(aktiva);
      } else {
        var p = super.patro(aktiva);
        while (p && p.no > 0) { // ni ne redonos art@mrk (0-a elemento)
          if (p.kap) return kap(p);
          p = super.patro(p);
        }
      }

    } else { // prenu kapvorton de unua drv
      for (let s of this.struktur_analizo) {
        if (s.el == 'drv') {
          return (kap(s));
        }
      }
    }
  };*/

  /**
   * Redonas la informojn pri la lasta subteksto, kiu enhavas linion
   * @param line - la koncerna linio
   * @returns - la serĉataj detaloj, undefined - se neniu enhavas la linion
   */
  /*
  getLastStructWithLine(line: number): Strukturero {
    for (let n = this.strukturo.length-2; n>=0; n--) {
      const s = this.strukturo[n];
      if (s.ln <= line && s.ln+s.lc >= line) {
        return s;
      }
    } 

    // ankoraŭ ne trovita? do redonu XML-tuta...
    return this.strukturo[this.strukturo.length-1]
  }*/


/// }
