
/* jshint esversion: 6 */

// (c) 2023 Wolfram Diestel

/* FARENDA:
 - ebligu administradon de ĉiuj tradukoj de redaktata teksto en XmlTrad, senŝargigante la tradukdialgon de administrado 
 de ŝanĝoj: necesas por tio havi unu instancon en xmlarea aŭ en Artikolo.options
 - ebligu ŝanĝi tradukojn de pluraj lingvoj sen perdi ion kaj aldonu fine ĉiujn ŝanĝitajn lingvoj/tradukojn
 - ebligu aldoni kaj redakti ankaŭ enekzemplajn tradukojn
*/


/**
 * Helpas ekstrakti kaj remeti la tradukojn de la redaktata teksto
 * @constructor
 */
function XmlTrad() {
    this.xmlstruct = null;
    // la atributnomoj en 'tradukoj' estas la lingvoj kaj la vaolroj listoj de tradukoj en tiu lingvo
    this.tradukoj = {}; // tradukoj de unu substrukturo/subteksto sed de pluraj lingvoj
    this.tradukoj_strukt = {}; // laŭ lingvo estas objektoj por ĉiu strukturero de xmlstruct

    this.re_stru = {
        /*_line: /^.*$/mg,*/
        _trd: /^<trd(grp)?\s+lng\s*=\s*["']([a-z]{2,3})['"]\s*>([^]*?)<\/trd\1\s*>$/,
        _tr1: /<trd\s*>([^]*?)<\/trd\s*>/g,
        _ofc: /<ofc>[^]*<\/ofc>/g,
        _klr: /<klr[^>]*>[^]*<\/klr>/g,
        _ind: /<ind>([^]*)<\/ind>/g
    };  
};

/**
 * Redonas tradukliston de tradukoj de unu strukturero en unu lingvo
 */
XmlTrad.prototype.getStruct = function(lng, s_id) {
    return this.tradukoj_strukt[lng][s_id];
};

XmlTrad.prototype.preparu = function(xmlstruct) {
    this.xmlstruct = xmlstruct;
    this.tradukoj = {};
    this.tradukoj_strukt = {};
}


/**
 * Kolektas ĉiujn tradukojn en donita XML-teksto
 * @param {string} xml - la XML-teksto
 * @param {boolean} shallow - true: ni serĉas nur en la unua strukturnivelo, false: ni serĉas profunde tra la tuta arba strukturo
 * @param {boolean} normalize - true: ni forigas ofc, klr, ind el la traduko, false: ni ne tuŝas ĝian strukturon
 */
 XmlTrad.prototype.collectXml = function(xml, shallow=false, normalize=false) {
    const re = this.re_stru;
    const find_stag = (elm,xml,from) => this.xmlstruct.travel_tag_bw([elm],false,false,xml,from);  
  
    let find_etag, spos = xml.length;
    if (shallow) {
      // expect
      find_etag = (elist,xml,from) => this.xmlstruct.travel_tag_bw(elist,true,true,xml,from);
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
      find_etag = (elist,xml,from) => this.xmlstruct.travel_tag_bw(elist,true,false,xml,from); 
      spos = xml.length;
    }
  
    var ta, te = find_etag(['trd','trdgrp','adm','rim'],xml,spos);
  
      // nudigas la tradukon je ofc, klr ktp.
      function trd_norm(t) {
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
 * @param {string} lng - la lingvo por kiu kolekti tradukojn
 */
 XmlTrad.prototype.collectTrdAllStruct = function(lng) {
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
 * @param {!string} xml - la XML-teksto
 * @param {string} lng - la lingvokodo
 * @returns objekto kun la kampoj pos - la komenco de trd(grp)-elemento kaj elm - elemento (snc, drv, trd, trdgrp k.a.)
 *       Se jam troviĝas traduko tie krome redoniĝas kampoj grp: 'grp' aŭ '', trd: - la kompleta traduko aŭ grupo, 
 *       itr: la kompleta enhavo de la traduko aŭ tradukgrupo
 */
 XmlTrad.prototype.findTrdPlace = function(xml,lng) {
    const expect_etag = (elist,xml,from=undefined) => this.xmlstruct.travel_tag_bw(elist,true,true,xml,from);
    //expect_stag = (elist,xml,from) => this.travel_tag_bw (elist,false,true,xml,from);
    const find_stag = (elist,xml,from=undefined) => this.xmlstruct.travel_tag_bw(elist,false,false,xml,from);
  
    // trovu unue la pozicion de la fina elemento de la nuna strukturo
    let p = expect_etag(['snc','subsnc','drv','subdrv','art','subart'],xml);
    let q,t,lpos,lelm;
  
    if (p) {
      lpos = p.pos;
      lelm = p.elm;
      //while (xml[lpos-1] == ' ') lpos--;
      t = {pos: lpos};
  
      do {
        q = expect_etag(['trd','trdgrp','adm','rim'],xml,t.pos);
  
        if (q && (q.elm == 'trd' || q.elm == 'trdgrp')) {
          // se ni trovis finon de trd/trdgrp ni serĉu ĝian komencon
          t = find_stag([q.elm],xml,q.pos);
          if (t) {
            // ni rigardu pri kiu lingvo temas...
            const m = this.re_stru._trd.exec(xml.substring(t.pos,q.end+1));
            if (m) {
              const l = m[2];
              if (l == lng) {
                // ni trovis jaman tradukon en la koncerna lingvo, redonu la lokon!
                return {pos: t.pos, grp: m[1], trd: m[0], itr: m[3], elm: q.elm};
              } else if (l > lng) {
                // ni supozas ke la lingvoj estas ordigitaj, kaj se
                // ni ne trovos la koncernan lingvon jam inter la tradukoj ni enŝovos
                // ĝin laŭ alfabeto
                lpos = t.pos;
              } else {
                // ni trovis la alfabetan lokon po enŝovi 
                // (traduko kun lingvo antaŭ la koncerna):
                return {pos: lpos, elm: lelm};
              }
            }
          }
        } else if (!q || (q && q.elm != 'rim' && q.elm != 'adm')) {
          // ni alvenis supre ĉe 'haltiga' elemento kiel dif/ekz/bld 
          // sen trovi laŭalfabetan enŝovejon,
          // ni redonos la lastan kovnenan lokon (supran trd-on)
          return {pos: lpos, elm: lelm};
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
      return {pos: (t.pos>-1? t.pos : p.pos), elm: lelm};
    }
  };  