
/* jshint esversion: 6 */

// (c) 2023 Wolfram Diestel

/* FARENDA:
 - ebligu administradon de ĉiuj tradukoj de redaktata teksto en XmlTrad, senŝargigante la tradukdialgon de administrado 
 de ŝanĝoj: necesas por tio havi unu instancon en xmlarea aŭ en Artikolo.options
 - ebligu ŝanĝi tradukojn de pluraj lingvoj sen perdi ion kaj aldonu fine ĉiujn ŝanĝitajn lingvoj/tradukojn
 - ebligu aldoni kaj redakti ankaŭ enekzemplajn tradukojn
*/

type Lingvo = string;
type sId = string; // la valoro de SId (vd. xmlstruct)
type TList = Array<string>;
type Tradukoj = { [s_id: sId]: TList } // tradukoj de iu lingvo kaj iu strukturero

type XPlace = XElPos & {
  grp?: string, trd?: string, itr?: string
}

/**
 * Helpas ekstrakti kaj remeti la tradukojn de la redaktata teksto
 * @constructor
 */
class XmlTrad{
  private xmlstruct: XmlStruct;

  // tradukoj de unu substrukturo/subteksto sed de pluraj lingvoj
  // la atributnomoj en 'tradukoj' estas la lingvoj, kaj la valoroj listoj de tradukoj en tiu lingvo
  private tradukoj: { [lng: Lingvo]: TList }; 
  // laŭ lingvo estas objektoj por ĉiu strukturero de xmlstruct
  private tradukoj_strukt: { [lng: Lingvo]: Tradukoj };
  private shanghoj_strukt: { [lng: Lingvo]: Tradukoj };

  private static re_stru = {
    /*_line: /^.*$/mg,*/
    _trd: /^<trd(grp)?\s+lng\s*=\s*["']([a-z]{2,3})['"]\s*>([^]*?)<\/trd\1\s*>$/,
    _tr1: /<trd\s*>([^]*?)<\/trd\s*>/g,
    _ofc: /<ofc>[^]*<\/ofc>/g,
    _klr: /<klr[^>]*>[^]*<\/klr>/g,
    _ind: /<ind>([^]*)<\/ind>/g
  };  

  constructor() {
    this.xmlstruct = null;
    // la atributnomoj en 'tradukoj' estas la lingvoj kaj la vaolroj listoj de tradukoj en tiu lingvo
    this.tradukoj = {}; // tradukoj de unu substrukturo/subteksto sed de pluraj lingvoj
    this.tradukoj_strukt = {}; // laŭ lingvo estas objektoj por ĉiu strukturero de xmlstruct
  };


/**
 * Redonas tradukliston de tradukoj de unu strukturero en unu lingvo
 */
getStruct(lng: Lingvo, s_id: sId) {
    let trd: TList;

    try {
        // preferu jam ŝanĝitajn tradukojn
        trd = this.shanghoj_strukt[lng][s_id];
    } catch (e) {
        // se ŝanĝoj ne ekzistas prenu la originalajn el la netuŝita artikolo
        trd = this.tradukoj_strukt[lng][s_id];
    }    
    return trd;
};

/**
 * Aldonas ŝanĝon al tradukoj
 * @param s_id - la identigilo de la strukturo (drv, snc...)
 * @param lng - la lingvo
 * @param no - la pozicio de la tradukoj en tiu strukturo kaj lingvo
 * @param trd - la tradukteksto
 */
putStruct(s_id: sId, lng: Lingvo, no: number, trd: string) {
    // PLIBONIGU: verŝajne estas pli efike meti aldonojn kaj ŝanĝojn 
    // al Xmlarea.tradukoj nun anstataŭ en aparta dlg-alpendo trd_shanghoj...
    if (! this.shanghoj_strukt[lng]) this.shanghoj_strukt[lng] = {};
    // se ankoraŭ malplena, transprenu ĉiujn originajn tradukoj de s_id
    if (! this.shanghoj_strukt[lng][s_id]) 
      this.shanghoj_strukt[lng][s_id] = this.tradukoj_strukt[lng][s_id] || [];
    // ŝanĝu la traduktekston kun la indikita n-ro
    this.shanghoj_strukt[lng][s_id][no] = trd;
}

/**
 * Redonas ĉiujn ŝanĝojn por s_id estas (ĉiuj ŝanĝitaj lingvoj kun tradukoj)
 */
shanghitaj(s_id: sId) {
    let r = {};
    for (let l of Object.keys(this.shanghoj_strukt)) {
        const s = this.shanghoj_strukt[l][s_id];
        if (s) {
            r[l] = s;
        }
    }
    return r;
}

/**
 * Preaparas kolekton de tradukoj metante la aktualan Xml-strukturdifinon
 * kaj maplenigante la tradukobjektojn
 * @param xmlstruct 
 */
preparu(xmlstruct: XmlStruct) {
    this.xmlstruct = xmlstruct;
    this.tradukoj = {};
    this.tradukoj_strukt = {};
    this.shanghoj_strukt = {};
}


/**
 * Kolektas ĉiujn tradukojn en donita XML-teksto
 * @param xml - la XML-teksto
 * @param shallow - true: ni serĉas nur en la unua strukturnivelo, false: ni serĉas profunde tra la tuta arba strukturo
 * @param normalize - true: ni forigas ofc, klr, ind el la traduko, false: ni ne tuŝas ĝian strukturon
 */
 collectXml(xml: string, shallow: boolean=false, normalize: boolean=false) {
    const re = XmlTrad.re_stru;
    const find_stag = (elm: string, xml: string, from: number) => 
      this.xmlstruct.travel_tag_bw([elm],false,false,xml,from);  
  
    let find_etag: Function, spos = xml.length;
    if (shallow) {
      // expect
      find_etag = (elist:Array<string>, xml: string, from: number) => 
        this.xmlstruct.travel_tag_bw(elist,true,true,xml,from);
      // ĉar ni ne ignoras aliajn elementojn ol trd/trgrp ni unue devas aliri
      // la kadran elementon
      const kadr = find_etag(['drv','subdrv','snc','subsnc'],xml,xml.length);
      if (kadr) {
        spos = kadr.pos;
      } else {
        throw("La subteksto ne finiĝas per </drv>, </subdrv>, </snc> aŭ </subsnc>!");
      }
    } else {
      // find
      find_etag = (elist: Array<string>, xml: string, from: number) => 
        this.xmlstruct.travel_tag_bw(elist,true,false,xml,from); 
      spos = xml.length;
    }
  
    let ta: XElPos; // ni serĉos elementojn de la fino!
    let te: XElPos = find_etag(['trd','trdgrp','adm','rim'],xml,spos);
  
      // nudigas la tradukon je ofc, klr ktp.
      function trd_norm(t: string) {
        if (!normalize) { return t.trim(); }
        else {
          return (t.replace(re._ofc,'')
          .replace(re._klr,'')
          .replace(re._ind,'$1')
          .replace(/\s+/,' ')
          .trim()); 
        }
      }
  
    while (te) {    
      // trovu la komencon ta de la elemento finiĝanta je te
      ta = find_stag(te.elm,xml,te.pos);
  
      // se temas pri trd/trdgrp...
      if (te.elm.indexOf('trd') == 0) {
        // ni ekstraktu lingvon kaj enhavon...
        const m = re._trd.exec(xml.substring(ta.pos,te.end+1));
        if (m && m[2]) {
          const lng = m[2]; if (!this.tradukoj[lng]) this.tradukoj[lng] = [];
          const grp = m[1];
          const trd = m[3];
          if (!grp) {
            // unuopa traduko
            this.tradukoj[lng].push(trd_norm(trd));
          } else {
            // grupigitaj tradukoj
            var t = re._tr1.exec(trd);
            while (t) {
              this.tradukoj[lng].push(trd_norm(t[1]));
              t = re._tr1.exec(trd);
            }
          }
        }
      }
  
      te = find_etag(['trd','trdgrp','adm','rim'],xml,ta.pos);
    }
  };

/**
 * Kolektas tradukojn de unu lingvo malprofunde por ĉiu unuopa
 * subteksto laŭ la strukturo. Do por 'drv' enestas nur la rektaj tradukoj
 * dum la tradukoj de enhavataj 'snc' aperas por la sekvaj snc-subtekstoj
 * @param lng - la lingvo por kiu kolekti tradukojn
 */
 collectTrdAllStruct(lng: Lingvo) {
    this.tradukoj_strukt[lng] = {}; // se jam ekzistas, tamen malplenigu! 
  
    for (let s of this.xmlstruct.strukturo) {
      if (['drv','subdrv','snc','subsnc'].indexOf(s.el) > -1) {
        // PLIBONIGU: ni unue kolektas en {<lng>: [trdj]} kaj poste kopias
        // eble estonte ni povos eviti la kopiadon
        this.tradukoj = {};
  
        const xml = this.xmlstruct.getSubtext(s);
        this.collectXml(xml,true,false); // xml, malprofunde, ne normigu
        this.tradukoj_strukt[lng][s.id] = this.tradukoj[lng];  
      }
    }
  
    //return this.tradukoj_strukt[lng];
  };



/**
 * Trovas la lokon kie enmeti tradukon de certa lingvo en la donita xml-subteksto
 * @param xml - la XML-teksto
 * @param lng - la lingvokodo
 * @returns objekto kun la kampoj pos - la komenco de trd(grp)-elemento kaj elm - elemento (snc, drv, trd, trdgrp k.a.)
 *       Se jam troviĝas traduko tie krome redoniĝas kampoj grp: 'grp' aŭ '', trd: - la kompleta traduko aŭ grupo, 
 *       itr: la kompleta enhavo de la traduko aŭ tradukgrupo
 */
 findTrdPlace(xml: string, lng: Lingvo): XPlace {
    const expect_etag = (elist: Array<string>, xml: string, from?: number) => 
      this.xmlstruct.travel_tag_bw(elist,true,true,xml,from);
    //expect_stag = (elist,xml,from) => this.travel_tag_bw (elist,false,true,xml,from);
    const find_stag = (elist: Array<string>, xml: string, from?: number) => 
      this.xmlstruct.travel_tag_bw(elist,false,false,xml,from);
  
    // trovu unue la pozicion de la fina elemento de la nuna strukturo
    let p: XElPos = expect_etag(['snc','subsnc','drv','subdrv','art','subart'],xml);
    let q: XElPos, t: XElPos, lpos: number, lelm: string;
  
    if (p) {
      lpos = p.pos;
      lelm = p.elm;
      //while (xml[lpos-1] == ' ') lpos--;
      t = {pos: lpos, end: -1, elm: undefined};
  
      do {
        q = expect_etag(['trd','trdgrp','adm','rim'],xml,t.pos);
  
        if (q && (q.elm == 'trd' || q.elm == 'trdgrp')) {
          // se ni trovis finon de trd/trdgrp ni serĉu ĝian komencon
          t = find_stag([q.elm],xml,q.pos);
          if (t) {
            // ni rigardu pri kiu lingvo temas...
            const m = XmlTrad.re_stru._trd.exec(xml.substring(t.pos,q.end+1));
            if (m) {
              const l = m[2];
              if (l == lng) {
                // ni trovis jaman tradukon en la koncerna lingvo, redonu la lokon!
                return {
                  pos: t.pos, end: t.pos, elm: q.elm,
                  grp: m[1], trd: m[0], itr: m[3]
                };
              } else if (l > lng) {
                // ni supozas ke la lingvoj estas ordigitaj, kaj se
                // ni ne trovos la koncernan lingvon jam inter la tradukoj ni enŝovos
                // ĝin laŭ alfabeto
                lpos = t.pos;
              } else {
                // ni trovis la alfabetan lokon por enŝovi 
                // (traduko kun lingvo antaŭ la koncerna):
                return {pos: lpos, end: lpos, elm: lelm};
              }
            }
          }
        } else if (!q || (q && q.elm != 'rim' && q.elm != 'adm')) {
          // ni alvenis supre ĉe 'haltiga' elemento kiel dif/ekz/bld 
          // sen trovi laŭalfabetan enŝovejon,
          // ni redonos la lastan kovnenan lokon (supran trd-on)
          return {pos: lpos, end: lpos, elm: lelm};
        } else {
          // se temas pri rimarko ni iru al ties komenco kaj de
          // tie plu serĉu tradukojn...
          t = find_stag([q.elm],xml,q.pos);
        }
  
        lelm = q.elm;
  
        // se trd(grp) ne estas valida aŭ se temas 
        // pri 'haltiga' elemento kiel ekz/dif/bld ni finu la serĉadon
        // - ni interesiĝas nur pri tradukoj ekster ekz/dif/bld!
      } while (t && t.elm);
  
      // ni ĝis nun ne trovis tradukojn, ĉe aŭ post kiu enmeti, do enmetu ĉe la lasta trovita pozicio
      const pos = (t.pos>-1? t.pos : p.pos);
      return {pos: pos, end: pos, elm: lelm};
    }
  };

}