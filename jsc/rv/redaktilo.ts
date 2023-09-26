/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import * as x from '../x';
import {DOM, Dialog} from '../ui';

import '../x/tekstiloj';
import '../x/voko_entities';
import {SDet} from '../x/xmlstrukt';
import {XmlRedakt} from '../x/xmlredakt';
import {TradukDialog} from '../x/xmltrad';

import {insert_xml, xml_nova} from './redk_shabl';
import {restore_preferences,restore_preferences_xml} from './redk_pref';
import * as trad from './redk_trad';
import * as submeto from './redk_submeto';

import {revo_listoj} from './shargo';

/**
 * La nomspaco 'redaktilo' kunigas ĉiujn variablojn kaj funkciojn bezonataj
 * aparte por la redaktado en la retpaĝo de Reta Vortaro.
 * @namespace {Function} redaktilo
 */
// difinu ĉion sub nomprefikso "redaktilo"
export namespace redaktilo {

  let xmlarea: XmlRedakt;  
  let xklavaro: x.XRedaktKlavaro;

  const tez_url = '/revo/tez/';
  const xml_url = '/revo/xml/';

  const re_mrk_split = /^([a-z0-9]+)(\..*)$/;

  const re_hex = /^#x[\da-f]+$/;
  const re_dec = /^#\d\d+$/;

  /**
   * Saltigas la kursoron al la sekva komenco de XML-elemento 'tag'
   * @memberof redaktilo
   * @inner
   * @param tag - la nomo de la serĉata XML-elemento
   * @param dir - la direkto: &gt;=0 antaŭen, &lt;0 malantaŭen
   */
  function nextTag(tag: string, dir: number) {
        
      function lines(str: string): number|undefined {
        try { 
          return(str.match(/[^\n]*\n[^\n]*/gi)?.length);
        } catch(e) { 
          return 0; 
        }        
      }

      var txtarea = document.getElementById('r:xmltxt') as HTMLInputElement;

      if (txtarea.selectionStart || txtarea.selectionStart === 0) { 
        let startPos = txtarea.selectionStart;
        let t: string;
        let pos: number = -1;

        // serĉu "tag" malantaŭ la nuna pozicio
        if (dir >= 0) {
          t = txtarea.value.substring(startPos+1);
          pos = startPos + 1 + t.indexOf(tag);
        } 
        // serĉu "tag" antaŭ la nuna pozicio
        else if (dir < 0) {
          t = txtarea.value.substring(0, startPos);
          pos = t.lastIndexOf(tag);    
        }

        if (pos >= 0) {
          txtarea.selectionStart = pos;
          txtarea.selectionEnd = pos;
          txtarea.focus();

          // rulu al pozicio laŭble dek linioj antaŭ la trov-loko 
          var line = lines(txtarea.value.substring(0,pos))||0 - 10;
          var lastline = lines(txtarea.value.substring(pos))||0 + line + 10;
          if (line < 0) line = 0;
          if (line > lastline) line = lastline;

          xmlarea.rulpozicio = txtarea.scrollHeight * line / lastline;
        }
      }
  }


  /** Konservas la nomon kaj la XML-tekston de la aktuale redaktata artikolo
   * en la loka memoro de la retumilo. 
   * @memberof redaktilo
   */
  export function store_art() {
    const nom = document.getElementById("r:art") as HTMLInputElement;

    if(xmlarea && nom)
      xmlarea.konservu("red_artikolo",{nom: nom.value},'xml');
    /*
    window.localStorage.setItem("red_artikolo",
      JSON.stringify({
        'xml': xmlarea.teksto,
        'nom': nom.value
        //'red': nova/redakti...
      })
    );
    */
  }

  
  /**
   * Restarigas XML-tekston kaj la artikolnomon el loka retumila memoro.
   * @memberof redaktilo
   * @inner
   */
  function restore_art() {
    const art = xmlarea.relegu("red_artikolo","xml");
    /*
    const str = window.localStorage.getItem("red_artikolo");
    const art = (str? JSON.parse(str) : null);
    */
    if (art) {
      //xmlarea.setText(art.xml); // document.getElementById("r:xmltxt").value = art.xml;
      //  document.getElementById("...").value = art.red;
      const nom = document.getElementById("r:art") as HTMLInputElement;
      nom.value = art.nom;
      //document.getElementById("r:art_titolo").textContent = art.nom; 
    }
  }

  /**
   * Iras al alia panelo de la redaktomenuo (referencoj, tradukoj, difinoj...preta)
   * @memberof redaktilo
   * @param id - la HTML-id de la panelo
   */
  export function fs_toggle(id: string) {
    var el = document.getElementById(id);
    var fs_id: string;
    if (el && ! el.classList.contains('aktiva')) {

      const parent = el.parentElement;
      if (parent) for (var ch of Array.from(parent.children)) {
        ch.classList.remove('aktiva');
        fs_id = 'r:fs_'+ch.id.substring(2);

        // fermu ĉiujn videblajn tabuletojn
        if (id != "r:chiuj" && ch.id != "r:chiuj") {
          document.getElementById(fs_id)?.classList.add('collapsed');
        
        } else { // malfermu ĉiujn krom "novaj"
          if ( ch.id == "r:nov" )
            document.getElementById(fs_id)?.classList.add('collapsed');
          else if ( ch.id != "r:chiuj")
            document.getElementById(fs_id)?.classList.remove('collapsed');
        }
      }
      el.classList.add('aktiva');
      if ( id != "r:chiuj" ) {
        fs_id = 'r:fs_'+id.substring(2);
        document.getElementById(fs_id)?.classList.remove('collapsed');
      }
    }
  }


  /*********************************************************
    FUNKCIOJ POR EKREDAKTO DE ARTIKOLO
  **********************************************************/

    
    /**
     * Kreas novan XML-artikolon
     * @memberof redaktilo
     * @inner
     */
    function kreu_novan() {
      const r_nova = document.getElementById("r:nova_art") as HTMLInputElement;
      const art = r_nova.value;
      //var ta = document.getElementById("r:xmltxt");
      (document.getElementById("r:art") as HTMLInputElement).value = art;
      //document.getElementById("r:art_titolo").textContent = art;
      submeto.redakto('aldono');
      var shg = document.getElementById("r:sxangxo") as HTMLInputElement;
      shg.value = art; shg.setAttribute("readonly","readonly");
      xmlarea.teksto = xml_nova(art);
    }

    /**
     * Plenigas kaj montras la traduk-dialogon
     */
    function traduk_dialogo(lng: string) {
      /*
      const dlg = document.getElementById("r:traduko_dlg");
      if (dlg instanceof HTMLDialogElement) {
        dlg.show();
      }*/

      const dlg = TradukDialog.dialog("#r\\:traduko_dlg");
      if (dlg) {
        const lnomo = revo_listoj.lingvoj.codes[lng];
        dlg.xmlarea = xmlarea;
        dlg.plenigu(lng,lnomo);
        dlg.malfermu();
      }
    }
  
  /**
   * Ŝargas XML-artikolon por redaktado de la servilo
   * @memberof redaktilo
   * @inner
   * @param params - HTTP-parametroj, ni ekstraktas parametron 'art', kiu donas la dosiernomon de la artikolo
   */
  function ŝargu_xml(params: string) {
    var art = x.getParamValue("art",params) || x.getParamValue("r",params);

    function replace_entities(data: string) {
        return data.replace(/&[^;\s]+;/g, function (ent) {
          const key = ent.slice(1,-1);
          if (key.match(re_hex)) {
            return String.fromCharCode(parseInt(key.substring(2),16));
          } else if (key.match(re_dec)) {
            return String.fromCharCode(parseInt(key.substring(1),10));
          } else {
            // @ts-ignore
            const val = x.voko_entities[key];
            return (val && val.length == 1)? val : ent;
          }
        }); 
    }

    if (art) {

      u.HTTPRequest('GET',xml_url+art+'.xml',{},
      function(data: string) {
          // Sukceso!
          const xmlteksto = replace_entities(data);
          if (art) (document.getElementById("r:art") as HTMLInputElement).value = art;
          xmlarea.teksto = xmlteksto;
        });
    } else {
      // se ne estas donita artikolo kiel parametro, ni provu legi
      // lastan artikol-tekston el retumila memoro
      restore_art();
    }
  }

  /**
   * Reagas al ekstraktado de la XML-strukturo: ĉiam kiam troviĝas subteksto ni
   * ricevas en ĉi tiu revokfunkcio la koncernajn informojn kaj povas aldoni listeron
   * en la elekto de subtekstoj, kiu troviĝas super la XML-redaktilo.
   * @memberof redaktilo
   * @inner
   * @param subt - la informoj pri la subteksto
   * @param index - la nombro de la subteksto (0-art, 1..n-1 - drv/snc..., n - tuta XML)
   * @param kiel_aktiva - true: temas pri la aktive redaktata subteksto, ni elektu gin en la listo
   */
  function post_aldono(subt: SDet, index: number, kiel_aktiva: boolean) {
    const sel_stru = document.getElementById("r:art_strukturo");
    if (sel_stru) {
      if (index == 0) sel_stru.textContent = ''; // malplenigu la liston ĉe aldono de unua ero...

      if (kiel_aktiva) {
        sel_stru.append(u.ht_element('option',{value: subt.id, class: subt.el, selected: 'selected'},subt.dsc));
      } else {
        sel_stru.append(u.ht_element('option',{value: subt.id, class: subt.el},subt.dsc));
      }
  
    }
  }

  
  /**
   * Reagas al elekto de subteksto en la listo. Ni ekredaktas nun tiun parton.
   * @memberof redaktilo
   * @inner
   * @param event 
   */
  function struktur_elekto(event: Event) {
    const trg = event.target as HTMLInputElement;
    const val = trg.value;

    // tio renovigas la strukturon pro eblaj intertempaj snc-/drv-aldonoj ks...
    // do ni poste rekreos ĝin kaj devos ankaŭ marki la elektitan laŭ _item_
    xmlarea.ekredaktu(val,true);
    montru_pozicion();

    // se montriĝas traduk-proponoj, necesas adapti la hoketojn kaj +-butonoj
    // laŭ la elektita (sub)drv/snc
    trad.trad_ebloj(xmlarea);
  }

  /**
   * Ni notas referencon transprenante ĝin el la trovlisto post serĉo (kiam
   * la uzanto tie premas la sago-butonon)
   * @memberof redaktilo
   * @param refmrk - la marko de la referenco
   * @param refstr - la vorto, al kiu la referenco montras
   */
  export function notu_ref(refmrk: string, refstr: string) {
    const m = re_mrk_split.exec(refmrk);
    if (m) {
      const art = m[1];
      const _mrk = m[2];
      //document.getElementById("r:refmrk").value = refmrk;
      (document.getElementById("r:refstr") as HTMLInputElement).value = refstr;
      ŝargu_ref_sub(art,_mrk); // ŝargu la (sub)sencojn ks por la vorto
    }
    redaktilo.fs_toggle("r:ref");
  }

  /**
   * Tio ŝargas la JSON-strukturon de la artikolo, al kiu montras referenco.
   * Ni elprenas la markojn de (sub)sencoj por povi pli precize referenci.
   * Ili montriĝos en elekto-listo en la redaktomenuo - panelo 'referencoj'
   * @memberof redaktilo
   * @inner
   * @param art - la dosiernomo de la referencata artikolo
   * @param _mrk - la marko de la referencata vorto
   */
  function ŝargu_ref_sub(art: string,_mrk: string) {

    u.HTTPRequest('GET',tez_url+art+'.json',{},
      function (data: string) {
        const json = 
          /** @type { {mrk: Array<Array>} } */
          (JSON.parse(data));

        const mrkj = json[art].mrk;

        if (mrkj) {
          const rm = document.getElementById("r:refmrk");

          if (rm) {
            rm.textContent = '';
    
            // la drv
            rm.append(u.ht_element("option",{},art+_mrk));
            // ĉio ene (snc, subsnc, rim)
            for (const mrk of mrkj) {
              if (mrk[0].startsWith(_mrk+'.')) {
                rm.append(u.ht_element("option",{},art+mrk[0]));
              }
            }
          }
          DOM.malkaŝu("#r\\:refmrk");
        }
      });
  }

  
  /**
   * Metas elekton kaj fokuson ĝuste por ekredakto.
   * @memberof redaktilo
   * @inner
   * @param pos 
   * @param line 
   * @param lastline 
   */
  function redakto_fokuso(pos: number, line: number, lastline: number) {
    document.getElementById("r:xmltxt")?.focus();
    var txtarea = document.getElementById('r:xmltxt') as HTMLInputElement;
    /*
    if (document.selection  && document.selection.createRange) { // IE/Opera
      var range = document.selection.createRange();
      range.moveEnd('character', pos); 
      range.moveStart('character', pos); 
      range.select();
      range.scrollIntoView(true);
    } else*/
    if (txtarea.selectionStart || txtarea.selectionStart === 0) { // Mozilla
      txtarea.selectionStart = pos;
      txtarea.selectionEnd = txtarea.selectionStart;
      var scrollTop = txtarea.scrollHeight * line / lastline;
  //    alert("scrollTop="+scrollTop);
      txtarea.scrollTop = scrollTop;
    }
  }

  /**
   * Montras la pozicion de la kursoro en la malgranda 
   * surmetita kampo
   * @memberof redaktilo
   * @inner
   */
  function montru_pozicion() {
    // aktualigu pozicion
    const pos = xmlarea.pozicio;
    const r_pos = document.getElementById("r:position");
    if (r_pos) r_pos.textContent = (1+pos.lin)+":"+(1+pos.poz);
  }

  /**
   * Preparas la redaktilon en la dekstra kadro: preferojn kaj XML-tekston, 
   * alligas evento-traktilojn
   * @memberof redaktilo
   * @param {string} params - HTTP-parametroj, el kiu ni ekstraktas la parametron 'art' por sargi la XML-fonton
   */
  export function preparu_redaktilon(params: string, xtajpo: x.XTajpo) {

    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    if (document.getElementById("r:xmltxt")) {
      restore_preferences_xml();
      redakto_fokuso(0, 0, 1);
      //if (!xmlarea) 

      // ŝanĝu tekston al lege/skribe
      const xmltxt = document.getElementById("r:xmltxt") as HTMLInputElement;
      xmltxt.removeAttribute("readonly");

      // x-tajpilo
      xtajpo.aldonu("r:xmltxt");

      // ŝaltilo por la ekranklavaro (kun butonoj por apartaj signoj, elementoj, fakoj ktp.)
      const xklvr = document.getElementById("r:xklvr") as HTMLInputElement;
      xklvr.addEventListener("click",
        () => {
          const pressed = ""+(1 - parseInt(xklvr.value));
          xklvr.value = pressed;
          if (pressed == "1") {
            DOM.malkaŝu("#r\\:klavaro");
          } else {
            DOM.kaŝu("#r\\:klavaro");
          }
      });    

      // XML-redakt-kesto
      xmlarea = new XmlRedakt("#r\\:xmltxt",post_aldono,undefined,montru_pozicion);
      submeto.xmlarea(xmlarea);
/*
      const r_xml = document.getElementById("r:xmltxt");
      if (r_xml) {
        xmlarea = new XmlRedakt(r_xml,on_xml_add_sub,undefined,show_pos);
        // T-klavkombinoj permesu aldoni tradukŝablonon rapide
        // ne necesa, dum ni havas atributon 'accesskey' ĉe la redaktbutonoj
        // Klavar.aldonu(r_xml,"KeyT",(event) => {
        //   if (event.ctrlKey || event.altKey) {
        //     event.preventDefault();
        //     insert_xml("trd_lng");
        //   }
        // });  
      }*/

      ŝargu_xml(params); // se doniĝis ?art=xxx ni fone ŝargas tiun artikolon

      // ekranbutonaro por apartaj signoj/elementoj
      const klvr = document.getElementById("r:klavaro");
      if (klvr) xklavaro = new x.XRedaktKlavaro(klvr, xmlarea, 
        // reĝimpremo
        (event: Event, cmd) => { 
          // PLIBONIGU: tion ni povas ankaŭ meti en xklavaro.js!
          if (cmd.cmd == 'indiko') {
            DOM.kaŝu("#r\\:klv_fak");
            DOM.malkaŝu("#r\\:klv_ind");
            DOM.kaŝu("#r\\:klv_elm");
          } else if (cmd.cmd == 'fako') {
            DOM.kaŝu("#r\\:klv_ind");
            DOM.malkaŝu("#r\\:klv_fak");
            DOM.kaŝu("#r\\:klv_elm");
          } else if (cmd.cmd == 'klavaro') {
            DOM.kaŝu("#r\\:klv_fak");
            DOM.malkaŝu("#r\\:klv_elm");
            DOM.kaŝu("#r\\:klv_ind");
          }
        },
        // postenmeto
        () => xmlarea.malsinkrona())
    }
    const klv_ind = document.getElementById("r:klv_ind");
    if (klv_ind) xklavaro.indiko_klavoj(revo_listoj.stiloj, klv_ind);

    const klv_fak = document.getElementById("r:klv_fak");
    if (klv_fak) xklavaro.fako_klavoj(revo_listoj.fakoj, klv_fak);

    const klv_elm = document.getElementById("r:klv_elm");
    if (klv_elm) xklavaro.elemento_klavoj(klv_elm.textContent, klv_elm);

    submeto.redakto('redakto'); // gravas post antaŭa aldono!

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // klav-premoj en XML-redaktilo
    /// document.getElementById("r:xmltxt")
    ///   .addEventListener("keypress",klavo);
    /// document.getElementById("r:xmltxt")
    ///   .addEventListener("keydown",tab_bsp);

    // document.getElementById("r:xmltxt")
    //   //.addEventListener("selectionchange",show_pos); // movado de kursoro, ne kaŭzas input-eventon...!
    //   .addEventListener("keyup",show_pos); // movado de kursoro, ne kaŭzas input-eventon...!

    //ni difinas rekte en xmlarea:...document.getElementById("r:xmltxt")
    //  .addEventListener("input",show_pos);
    document.getElementById("r:xmltxt")
      ?.addEventListener("focus",montru_pozicion);
    document.getElementById("r:xmltxt")
      ?.addEventListener("click",montru_pozicion);

    // strukturlisto
    document.getElementById('r:art_strukturo')
      ?.addEventListener("change",struktur_elekto);

    // traduk-dialogo bezonas xmlarea
    const tdlg = TradukDialog.dialog("#r\\:traduko_dlg");
    if (tdlg) {
      tdlg.xmlarea = xmlarea;

      // ĉu ni jam kreis XKlavaron en la traduko-dialogo?
      let xklv = x.XKlavaro2.klavaro("#traduko_butonoj");
      if (!xklv) {
        // ne? do kreu nun
        xklv = new x.XFormularKlavaro("#traduko_butonoj", "traduko_tabelo", (event: Event) => {
          tdlg.trd_input_shanghita(event);
        });
        xklv.elemento_klavoj();
      }
    }

      /*
    document.getElementById("r:cx")
      .addEventListener("click",function(event) {
        event.preventDefault();
        var cx = event.currentTarget as HTMLInputElement;
        cx.value = ""+(1 - parseInt(cx.value)) || "0"; 
        document.getElementById('r:xmltxt').focus();
    });*/

  }

  /**
   * Preparas la redaktilo-elementojn en la naviga kadro: elekto-listojn (fakoj, stiloj...),
   * evento-traktiloj
   * @memberof redaktilo
   */
  export function preparu_menuon() {

    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    restore_preferences();

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // montru redakto-butonojn en navig-trabo
    //show("x:redakt_btn");
    //show("x:rigardo_btn");

    // butono por kontroli
    document.getElementById("r:kontrolu")
      ?.addEventListener("click",() => submeto.rkontrolo(xmlarea));

    // butono por konservi
    document.getElementById("r:konservu")
      ?.addEventListener("click",() => submeto.rkonservo(xmlarea));

    // salto al eraroj
    document.getElementById("r:eraroj")
      ?.addEventListener("click", function(event) {
        const trg = event.target as Element;
        if (trg.tagName == 'A') {
          event.preventDefault();
          const pos_str = (trg.textContent||'').split(' ')[1];
          xmlarea.iru_al(pos_str);
          montru_pozicion();
        } 
      }
    );

    // remetu ŝanĝo-kampon en difinitan staton (necesa post aldono de nova artikolo)
    const shg = document.getElementById("r:sxangxo");
    if (shg) shg.removeAttribute("readonly");

    // metu buton-surskribon Rezignu kaj malaktivigu la aliajn du
    //document.getElementById("r:rezignu").textContent = "Rezignu"; 
    //document.getElementById("r:kontrolu").removeAttribute("disabled"); 
    //document.getElementById("r:konservu").removeAttribute("disabled");       

    // navigi inter diversaj paneloj kun enmeto-butonoj ktp.
    const fs_t = document.getElementById("r:fs_toggle");
    if (fs_t) {
      fs_t.querySelectorAll("a").forEach(function (a) { 
        a.removeAttribute("onclick");
      });
      fs_t.addEventListener("click", function(event) {
        const trg = event.target as Element;
        const a = trg.closest("a");
        if (a) fs_toggle(a.id);
      });
    }

    // butonoj sur tiuj paneloj por enmeti elementojn
    var v_sets = document.getElementById("r:v_sets");
    if (v_sets) v_sets.querySelectorAll("button").forEach( (b) => {

      if (b.id == "r:create_new_art") { // [kreu]
        b.addEventListener("click", kreu_novan);

      } else if (b.id == "r:trd_dlg") { // traduko-dialogo
        b.addEventListener("click",() => {
          const lng = DOM.v("#r\\:trdlng")
            || navigator.language?.split('-')[0]
            || 'en';
          traduk_dialogo(lng);
        });

      } else if (b.id == "r:trd_sercho") { // traduko-serĉo
        b.addEventListener("click", (event) => trad.trad_uwn(event,xmlarea));

      } else if (b.classList.contains("help_btn")) { // (?) (<>)
        b.addEventListener("click", function(event) {
          const trg = event.currentTarget as Element;
          x.helpo_pagho(trg.getAttribute("value")||'');
        });

      } else { // ŝablon-butonoj
        b.addEventListener("click",function(event) {
          const trg = event.currentTarget as Element;
          const v = trg.getAttribute("value");
          if (v) insert_xml(v, xmlarea);
        });
      }

    });
  }  

};
