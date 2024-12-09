
/* 
(c) 2023 Wolfram Diestel
*/

import * as u from '../u';
import { quoteattr } from './kodado';
import { XElPos, SDet } from './xmlstrukt';
import { XmlRedakt } from './xmlredakt';
import { Xlist } from './xlisto';
import { DOM, Tekst, Dialog, DialogOpcioj, Menu, List, Tabel, ListRedakt } from '../ui';

/* FARENDA:
 - ebligu administradon de ĉiuj tradukoj de redaktata teksto en XmlTrad, senŝargigante la tradukdialgon de administrado 
 de ŝanĝoj: necesas por tio havi unu instancon en xmlarea aŭ en Artikolo.options
 - ebligu ŝanĝi tradukojn de pluraj lingvoj sen perdi ion kaj aldonu fine ĉiujn ŝanĝitajn lingvoj/tradukojn
 - ebligu aldoni kaj redakti ankaŭ enekzemplajn tradukojn
*/

export type Lingvo = string;
// type sId = string; // la valoro de SId (vd. xmlstruct)

// PLIBONIGU: la strukturo estas iom profunda kaj tial la kodo iom
// malfacile legiĝas. Pli bone uzu unu, du klasojn kun konvenaj metodo-nomoj
// por administri la tradukojn
export type TList = Array<string>;
type Tradukoj = { [s_id: string]: TList } // tradukoj de iu lingvo kaj iu strukturero

export type XPlace = XElPos & {
  grp?: string, trd?: string, itr?: string
}

type TradukDialogOpcioj = DialogOpcioj & { 
  trd_tabelo: HTMLElement|string
};


/**
 * Helpas ekstrakti kaj remeti la tradukojn de la redaktata teksto
 * @constructor
 */
export class XmlTrad {
  //private xmlstruct: XmlStrukt;

  // tradukoj de unu substrukturo/subteksto sed de pluraj lingvoj
  // la atributnomoj en 'tradukoj' estas la lingvoj, kaj la valoroj listoj de tradukoj en tiu lingvo
  public tradukoj: { [lng: string]: TList }; 
  // laŭ lingvo estas objektoj por ĉiu strukturero de xmlstruct
  private tradukoj_strukt: { [lng: string]: Tradukoj };
  private shanghoj_strukt: { [lng: string]: Tradukoj };

  private static re_stru = {
    /*_line: /^.*$/mg,*/
    _trd: /^<trd(grp)?\s+lng\s*=\s*["']([a-z]{2,3})['"]\s*>([^]*?)<\/trd\1\s*>$/,
    _tr1: /<trd\s*>([^]*?)<\/trd\s*>/g,
    _ofc: /<ofc>[^]*<\/ofc>/g,
    _klr: /<klr[^>]*>[^]*<\/klr>/g,
    _ind: /<ind>([^]*)<\/ind>/g,
    _tagend: /[>\s]/
  };  

  constructor(private tekst: Tekst) {
    //this.xmlstruct = null;
    // la atributnomoj en 'tradukoj' estas la lingvoj kaj la vaolroj listoj de tradukoj en tiu lingvo
    this.tradukoj = {}; // tradukoj de unu substrukturo/subteksto sed de pluraj lingvoj
    this.tradukoj_strukt = {}; // laŭ lingvo estas objektoj por ĉiu strukturero de xmlstruct
  };


/**
 * Redonas tradukliston de tradukoj de unu strukturero en unu lingvo
 */
trd_subteksto(lng: Lingvo, s_id: string) {
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
adaptu_trd_subteksto(s_id: string, lng: Lingvo, no: number, trd: string) {
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
shanghitaj(s_id: string) {
    let r: Tradukoj = {};
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
preparu() {
    // this.xmlstruct = xmlstruct;
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
 kolektu_xml(xml: string, shallow: boolean=false, normalize: boolean=false) {
    const re = XmlTrad.re_stru;
    const find_stag = (elm: string, xml: string, from: number) => 
      this.tra_elementoj_retro([elm],false,false,xml,from);  
  
    let find_etag: Function, spos = xml.length;
    if (shallow) {
      // expect
      find_etag = (elist:Array<string>, xml: string, from: number) => 
        this.tra_elementoj_retro(elist,true,true,xml,from);
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
        this.tra_elementoj_retro(elist,true,false,xml,from); 
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
 kolektu_tute_malprofunde(lng: Lingvo) {
    this.tradukoj_strukt[lng] = {}; // se jam ekzistas, tamen malplenigu! 
  
    this.tekst.certigu_sinkronecon();
    this.tekst.subtekst_apliku((s) => {
      if (['drv','subdrv','snc','subsnc'].indexOf(s.el) > -1) {
        // PLIBONIGU: ni unue kolektas en {<lng>: [trdj]} kaj poste kopias
        // eble estonte ni povos eviti la kopiadon
        this.tradukoj = {};
  
        const xml = this.tekst.subteksto(s);
        this.kolektu_xml(xml,true,false); // xml, malprofunde, ne normigu
        this.tradukoj_strukt[lng][s.id] = this.tradukoj[lng];  
      }
    });
  
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
 trovu_trd_lokon(xml: string, lng: Lingvo): XPlace {
    const expect_etag = (elist: Array<string>, xml: string, from?: number) => 
      this.tra_elementoj_retro(elist,true,true,xml,from);
    //expect_stag = (elist,xml,from) => this.travel_tag_bw (elist,false,true,xml,from);
    const find_stag = (elist: Array<string>, xml: string, from?: number) => 
      this.tra_elementoj_retro(elist,false,false,xml,from);
  
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



  /**
   * Trovas la elemento-komencon (end=false) aŭ finon (end=true) en la XML-teksto.
   * La serĉo okazas de la fino!
   * @param elements - listo de interesantaj elementoj
   * @param end - true: ni serĉas elementofinon (&lt;/drv), false: ni serĉas komencon (&lt;drv)
   * @param stop_no_match - se 'true', ni haltas ĉe la unua elemento, kiu ne estas en la listo
   * @param xml - la XML-teksto en kiu ni serĉas
   * @param from - la finpozicio de kiu ni serĉas en alantaŭa direkto, se ne donita serĉe komenciĝas ĉe la fino
   * @returns objekton kun kampoj pos, end, elm
   */
  tra_elementoj_retro(elements: Array<string>, end: boolean, stop_no_match: boolean,
    xml: string, from?: number): XElPos
  {    
    const re_te = XmlTrad.re_stru._tagend;
    const mark = end? '</' : '<';

    // se mankas la lasta argumento, uzu aprioran...
    /*
    if (!xml) {
      xml = this.txtarea.value;
    }
    */
    if (from == undefined) {
      from = xml.length;
    }

      // kontrolu ĉu la trovita elemento estas en la listo
      // de interesantaj elementoj
      function match(p: number) {
        for (let e of elements) {
          if ( xml.substring(p,p+e.length) == e 
            && xml.substring(p+e.length,p+e.length+1).match(re_te) ) return e;
        }
      }

    // trovu krampon < aŭ </
    var pos = xml.lastIndexOf(mark,from-mark.length);

    while (pos > -1 ) {
      const element = match(pos+mark.length);
      if (element) {
        const end = xml.indexOf('>',pos);
        // redonu la trovitan elementon
        return {pos: pos, end: end, elm: element};
      } else {
        if (stop_no_match) return;
      }
      // trovu sekvan krampon < aŭ </
      pos = xml.lastIndexOf(mark,pos-1);
    }
  };

}


/**
 * Servas la tradukdialogon, permesante provizi al ĝi ĉiujn lingvojn kaj tradukojn.
 * Registrante ĉiujn ŝanĝojn kaj fine aktualigante la tradukojn en la artikolo.
 */
export class TradukDialog extends Dialog {

  public xmlarea: XmlRedakt;
  private tabelo: Tabel;

  /*
  static aprioraj: TradukDialogOpcioj = {
      xmlarea: undefined
  };*/


  static dialog(element: HTMLDialogElement|string) {
    let d = super.obj(element);
    if (d instanceof TradukDialog) return d;
  }

  constructor(element: HTMLDialogElement|string, opcioj: TradukDialogOpcioj) {
    super(element,opcioj);
    // this.xmlarea = opcioj.xmlarea;
    this.tabelo = new Tabel(opcioj.trd_tabelo);
  }


  /**
   * Aldonas ĉiujn lingvojn kiel menuo en la dialogo.
   * @param menu_lingvoj la elemento aŭ CSS-elektilo de la lingvo-menuo (enhavantasj la diversajn lingvogrupojn (preferataj, efektivaj, alfabetaj))
   * @param menu_tradukhavaj la menuo, en kiu aperu ĉiuj lingvoj, kiuj aktuale havas tradukojn en la artikolo krom la referataj
   * @param lingvo_listo XList-objekto kiu ŝargas/provizas ĉiujn lhngvojn kun kodo kaj nomo
   * @param lingvo_prefix prefikso por identigiloj de menuoj alfabete ordigitaj lingvoj, la menuoj nomiĝos <lingvo_prefix>_<de litero>_<ĝis litero> kaj la menueroj <lingvo_prefix>_<ISO-kodo>
   * @param pref_lng la listo kun la ISO-kodoj de la preferataj lingvoj
   * @param pref_prefix prefikso por identigiloj de preferataj lingvoj, la menueroj nomiĝos <pref_prefix>_<ISO-kodo>
   */
  lingvo_menuo(menu_lingvoj: HTMLElement|string, menu_tradukhavaj: HTMLElement|string, 
    lingvo_listo: Xlist, lingvo_prefix: string, pref_lng: string[], pref_prefix: string) {

    new Promise((resolve1) => { 
        // alfabetaj listoj
        const m_a_b = new List("#"+lingvo_prefix+"_a_b");
        const m_c_g = new List("#"+lingvo_prefix+"_c_g");
        const m_h_j = new List("#"+lingvo_prefix+"_h_j");
        const m_k_l = new List("#"+lingvo_prefix+"_k_l");
        const m_m_o = new List("#"+lingvo_prefix+"_m_o");
        const m_p_s = new List("#"+lingvo_prefix+"_p_s");
        const m_t_z = new List("#"+lingvo_prefix+"_t_z");

        lingvo_listo.load(resolve1(true),(kodo: string, nomo: string) => {
            const komenca = nomo.charAt(0);
            const lng = u.ht_html(`<li id="${lingvo_prefix}_${kodo}" value="${nomo}">${nomo}</li>`);

            if (lng && kodo != 'eo') {
                if (komenca >= 'a' && komenca <= 'b')
                    m_a_b.aldonu(nomo,lng);
                else if (komenca >= 'c' && komenca <= 'g' || komenca == 'ĉ' || komenca == 'ĝ')
                    m_c_g.aldonu(nomo,lng);
                else if (komenca >= 'h' && komenca <= 'j' || komenca == 'ĥ' || komenca == 'ĵ')
                    m_h_j.aldonu(nomo,lng);
                else if (komenca >= 'k' && komenca <= 'l')
                    m_k_l.aldonu(nomo,lng);
                else if (komenca >= 'm' && komenca <= 'o')
                    m_m_o.aldonu(nomo,lng);
                else if (komenca >= 'p' && komenca <= 's' || komenca == 'ŝ')
                    m_p_s.aldonu(nomo,lng);
                else if (komenca >= 't' && komenca <= 'z' || komenca == 'ŭ')
                    m_t_z.aldonu(nomo,lng);
            }
        });
    })
    .then(() => {
      
      const trd_aliaj = typeof menu_tradukhavaj === "string"? DOM.e(menu_tradukhavaj) : menu_tradukhavaj;

      pref_lng.forEach(     //.sort(jsort_lng).forEach(
          function(lng: string) {
              if (lng != 'eo') {
                // foje kodo ankoraŭ konsistas el lingvo-Lando, tiujn ni ignoras
                // KOREKTU: tio korektiĝu en preferoj...
                if (lng.indexOf('-')<0) {
                  let nomo = lingvo_listo.codes[lng];
                  if (!nomo) {
                    // FIXME: iam ŝajnas ke lingvo_listo.codes ne estas ŝargita
                    // aparte post kiam la seanco longe dormis
                    // do verŝajne pro forvelko de la servila seanco
                    // sed ni devas ankoraŭ eltrovi kiel solvi ĝin ĝuste
                    // provizore ni tiel elturniĝas:
                    console.warn("Ne troviĝis nomo de lingvo: "+lng);
                    nomo = `(${lng})`
                  }
                  const lng_html = `<li id="${pref_prefix}_${lng}">${nomo}</li>`;
                  trd_aliaj?.insertAdjacentHTML("beforebegin",lng_html);    
                }
              }
          }
      );
            
    })
    .then(() => {
        // se ambaŭ lingvolistoj (preferataj kaj alfabetaj)
        // estas fintraktitaj ni ankoraŭ refreŝigu la menuon
        Menu.refreŝigu(menu_lingvoj);
    });    
  }

  /**
   * Plenigas la dialogon kun la tradukoj de elektita lingvo el la XML-teksto (helpe de XmlTrad-objekto)
   * kaj kreante la liston de enigkampoj por redakti la traudkojn de tiu lingvo
   * @param lng 
   * @param lingvo_nomo 
   */
  plenigu(lng: string, lingvo_nomo: string) {
    // forigu antauajn eventojn por ne multobligi ilin...
    DOM.malreago("#traduko_tradukoj","click");
    DOM.malreago("#traduko_tradukoj","change");

    // montru la lingvon en la tabel-titolo
    DOM.al_t("#traduko_lingvo",`${lingvo_nomo} [${lng}]`);
    DOM.al_datum(this.element,"lng",lng);
    
    // ĉar la tradukdialogo montras samtempe ĉiam nur tradukojn de unu lingvo
    // ni kunfandas tiujn el la artikolo, kaj tiujn, kiuj jam estas
    // aldonitaj aŭ ŝanĝitaj en la dialogo
    const xmltrad = this.xmlarea.xmltrad;
    xmltrad.preparu(); // malplenigu de ĉiaj tradukoj, se restis de antaŭa voko...
    xmltrad.kolektu_tute_malprofunde(lng);

    this.tabelo.malplenigu();

    // >>> Trakuru la subtekstojn...

    // PLIBONIGU: La uzo de semantikaj id-atributoj ne estas tro eleganta.
    // Pli bone kreu propran tradukoj-objekton kun insert, update ktp
    // kiu transprentas la administradon kaj aktualigadon...
    // ŝangojn oni devus skribi tiam nur se oni ŝanĝas lingvon aŭ enmetas tradukojn
    // en la dialogon ĝin fermante...
    this.xmlarea.subtekst_apliku((s) => {
      // trakuru la XML-subtekstoj (sub)drv, (sub)snc 
      if (['drv','subdrv','snc','subsnc'].indexOf(s.el) > -1) {
        // ekstraktu la priskribon por nomi la koncernan struktureron        
        let dsc = (s as SDet).mlg;
        // koncizigu la priskribon forigante prefiksan parton
        if (s.el == 'snc' || s.el == 'subsnc') {
          const p = dsc.indexOf('.');
          if (p>-1) dsc = dsc.slice(p);
          dsc = '\u00a0'+dsc;
        } else if (s.el == 'drv' || s.el == 'subdrv') {
          dsc = '<b>'+dsc+'</b>';
        }

        // aldonu novan linion al la tabelo        
        /// tableCnt += '<tr class="tr_' + s.el + '"><td>' + dsc + '</td><td>';
        this.tabelo.aldonu([dsc,`<div id="trd:${s.id}"/>`,
          `<button formaction="#trd:${s.id}" title="Aldonu"><b>+</b></button>`],[s.el]);

        // difinu la mezan ĉelon de la linio kiel redaktebla listo
        const tlst = new ListRedakt(`#trd\\:${s.id}`,{});
    
        // prenu la tradukojn de la subteksto
        const trd = xmltrad.trd_subteksto(lng,s.id);
        
        // se estas tradukoj, aldonu la tradukojn al la listo;
        // se ne, aldonu nur malplenan kampon        
        let n = 0;
        if ( trd && trd.length ) {
          trd.forEach((t) => {
            const id = `trd:${s.id}:${n++}`;
            tlst.aldonu(`<input id="${id}" name="${id}" type="text" size="30" value="${quoteattr(t)}"/>`);
          });
            /*
            for (let j=0; j<trd.length; j++) {
                tableCnt += this.traduko_input_field(s.id,j,x.quoteattr(trd[j]));
                tableCnt += "<br/>";
            }*/
        } else {
          const id = `trd:${s.id}:${n}`;
          tlst.aldonu(`<input id="${id}" name="${id}" type="text" size="30" value=""/>`);
        /*
            tableCnt += this.traduko_input_field(s.id,0,'') + '<br/>';  
          */
        }
        /*
        tableCnt += '</td>';
        tableCnt += '<td>' + this.traduko_add_btn(s.id) + '</td>';
        tableCnt += '</tr>';
        */
      }
    }); // subtekst apliku


    // funkciigu la +-butonojn por aldoni po malplenan kampon
    DOM.ido_reago("#traduko_tradukoj","click","button",(event)=> {
      const trg = event.currentTarget;
      if (trg instanceof HTMLButtonElement) {
        const lrid = trg.getAttribute("formaction")?.substring(1);
        if (lrid) {
          const lrel = document.getElementById(lrid);
          if (lrel) {
            const lr = ListRedakt.list(lrel);
            if (lr) {
              const id = `${lrid}:${lr.nombro}`;
              lr.aldonu(`<input id="${id}" name="${id}" type="text" size="30" value=""/>`)
            }
          }
        }
      }
    });

        
    // rimarku ĉiujn ŝanĝojn de unuopaj elementoj
    DOM.reago("#traduko_tradukoj","change", this.trd_input_shanghita.bind(this));
 
  }

  /**
   * Kiam kampo ŝangiĝas ĉu per redakto ĉu per enigo de XKlavaro, ni
   * registras, ke la tradukoj de la koncerna senco/derivaĵo bezonos adapton.
   * @param event la evento, kiu ekestis pro la ŝanĝo
   * @param kampo la kampo, kiu estas ŝanĝita, se ne donita ni uzu event.target
   */
  trd_input_shanghita(event: Event, kampo?: HTMLElement) {
    const k_el = kampo? kampo : event.target;
    if (DOM.isFormElement(k_el)) {
      // kiu listo enhavas tiun ĉi eron
      const lr = ListRedakt.list_kun_ero(k_el);

      if (lr) {
        // la @id-atributo estas de la formo trd:<subtekst-id>
        const s_id = lr.element.id.split(':').pop();
        const lng = DOM.datum(this.element,"lng");

        // trovu la koncernan traduk-liston kaj anstataŭigu ĝin per
        // la aktuala el la dialogo
        const xmltrad = this.xmlarea.xmltrad;

        if (s_id && lng) {
          lr.valoroj().forEach((val,nro) => {
            // PLIBONIGU: pli simple tuj transdonu la tutan liston anstataŭ eron post ero
            xmltrad.adaptu_trd_subteksto(s_id,lng,nro,val);
          });
        }
      }
    }
  }

  /* momente ni ne ofertas lingvoŝanĝon en la traduk-dialogo de Araneo
   (alie ol Cetonio)
  shanghu_trd_lingvon(event,ui) {
    var id = ui.menuero.id;
    if (id && id.slice(0,4) == "trd_") {
        var lng= id.split('_')[2];
        var lingvo_nomo = ui.menuero.textContent;
        //alert($("#traduko_lingvoj").val())
        traduko_dlg_plenigu_trd(lng,lingvo_nomo);
    }
    DOM.al_datum("#traduko_dlg","last-focus",'');
  }*/


}