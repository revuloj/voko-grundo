
/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import * as x from '../x';

import '../x/tekstiloj';
import '../x/voko_entities';
import {Strukturero} from '../x/xmlstruct';
import {Xmlarea} from '../x/xmlarea';
import {XKlavaro} from '../x/xklavaro';
import {RevoListoj} from '../x/xlisto';

import {artikolo} from '../a/artikolo';
import {preferoj} from '../a/preferoj';
import {t_red, start_wait, stop_wait} from './kadro';
import {Sercho, Lingvo} from './sercho';

// vd. https://mariusschulz.com/blog/declaring-global-variables-in-typescript
// alternative oni povus uzi alnoton ty-ignore ne la malsupraj linioj kiuj uzas MathJax
const MathJax = (window as any).MathJax;

/**
 * La nomspaco 'redaktilo' kunigas ĉiujn variablojn kaj funkciojn bezonataj
 * aparte por la redaktado en la retpaĝo de Reta Vortaro.
 * @namespace {Function} redaktilo
 */
// difinu ĉion sub nomprefikso "redaktilo"
export namespace redaktilo {

  let xmlarea: Xmlarea;  
  let xklavaro: XKlavaro;
  export let revo_listoj: RevoListoj; // ni ricevos la listojn de la kadro

  var redakto = 'redakto'; // 'aldono' por nova artikolo

  const cgi_vokosubmx = '/cgi-bin/vokosubmx.pl';
  const cgi_vokohtmlx = '/cgi-bin/vokohtmlx.pl';
  const cgi_vokosubm_json = '/cgi-bin/vokosubm-json.pl';

  const tez_url = '/revo/tez/';
  const xml_url = '/revo/xml/';

  const uwn_url = 'http://www.lexvo.org/uwn/';

  const re_lng = /<(?:trd|trdgrp)\s+lng\s*=\s*"([^]*?)"\s*>/mg; 
  const re_fak = /<uzo\s+tip\s*=\s*"fak"\s*>([^]*?)</mg; 
  const re_stl = /<uzo\s+tip\s*=\s*"stl"\s*>([^]*?)</mg; 
  const re_mrk = /<(drv|snc) mrk="([^]*?)">/mg;
  const re_mrk_split = /^([a-z0-9]+)(\..*)$/;

  const re_trdgrp = /<trdgrp\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trdgrp/mg;	
  const re_trd = /<trd\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trd/mg;	
  const re_ref = /<ref([^g>]*)>([^]*?)<\/ref/mg;
  const re_refcel = /cel\s*=\s*"([^"]+?)"/m;

  const re_hex = /^#x[\da-f]+$/;
  const re_dec = /^#\d\d+$/;

  /**
   * Utilfunkcio por forigi elementon, kondiĉe ke gi ekzistas.
   * Se ĝi ne ekzistas okazas nenio (do neniu escepto!)
   * @memberof redaktilo
   * @inner
   * @param {Element} element 
   */
  function remove(element: Element) { if (element) element.remove(); }

  /**
   * La XML-ŝablonoj, el kiuj ni elektos laŭ nomo...
   * Ili estas (eble ingitaj) listoj de la formo 
   * [string,Object,Array|string] = [elemento,atributoj,enhavo];
   * $r:... referencas al formular-elemento en la redaktilo (input.value);
   * $_ anstataŭiĝos per la momente elektita teksto aŭ ""
   * @memberof redaktilo
   * @inner
   */
  const xml_shbl: {[key: string]: u.ElementSpec} = {
    trd: ["trd",{},"$_"],
    trd_lng: ["trd",{lng:"$r:trdlng"},"$_"],
    trdgrp: ["trdgrp",{lng:"$r:trdlng"},[
        "\n  ",["trd",{},"$_"],
        ",\n  ",["trd"],
        "\n"
      ]],
    klr: ["klr",{},"$_"],
    klr_ronda: ["klr",{},["(","$_",")"]],
    klr_angula: ["klr",{},["[","$_","]"]],
    klr_tip: ["klr",{tip:"$r:klrtip"},["(","$_",")"]],
    klr_ppp: ["klr",{},"[&#x2026;]"],
    ind: ["ind",{},"$_"],
    ref_tip: ["ref",{tip:"$r:reftip",cel:"$r:refmrk"},"$_|$r:refstr"],
    ref_lst: ["ref",{tip:"lst",lst:"voko:",cel:"$r:refmrk"},"$_|$r:refstr"],
    ref: ["ref",{cel:"$r:refmrk"},"$_|$r:refstr"],
    refgrp: ["refgrp",{tip:"$r:reftip"},[
        "\n  ",["ref",{cel:"$r:refmrk"},"$_|$r:refstr"],
        ",\n  ",["ref",{cel:""}],
        "\n"
      ]],
    rim: ["rim",{},"$_"],
    ekz: ["ekz",{},"$_"],
    nom: ["nom",{},"$_"],
    nac: ["nac",{},"$_"],
    esc: ["esc",{},"$_"],
    tld: ["tld/"],
    fnt: ["fnt",{},[
            "\n  ",["bib"],
            "\n  ",["aut",{},"$_"],
            "\n  ",["vrk",{},[["url",{ref:""}]]],
            "\n  ",["lok"],
            "\n"]
          ],
    drv: ["drv",{mrk:"XXXX.0"},[
            "\n  ",["kap",{},[["tld/"],"..."]],
            "\n  ",["snc",{mrk:"XXXX.0o.YYY"},[
            "\n    ",["dif",{},"$_"],
            "\n  "
            ]],
            "\n"  
    ]],
    snc: ["snc",{mrk:"XXX.0o.YYY"},[
      "\n  ",["dif",{},"$_"],
      "\n"
    ]],  
    dif: ["dif",{},"$_"]       
  };

  /**
   * Kreas XML-tekston el ŝablono, anstataŭigante variablo-lokojn per
   * la valoroj de la respektivaj kampoj
   * @memberof redaktilo
   * @param name - la nomo de la ŝablono
   * @param selection - la momente elektita teksto, gi anstataŭas variablon '$_'
   * @returns Liston kun: 1. la XML-teksto kreita per la ŝablono; 2. la relativa pozicio de la kursoro; 3. la lininombro
   */
  export function shablono(name: string, selection: string): [string,number,number] {    
    let p_kursoro = -1;
    let p_lines = 0;

    //function xmlstr(jlist) {
    return [(function xmlstr(jlist: Array<u.ContentSpec>): string {

      // $_ ni anstataŭigos per la elektita teksto, 
      // $<var> per la valoro de elemento kun id="var"
      // alian tekstenhavon ni redonas nemodifite
      function val(v: string): string {
        const ie = document.getElementById(v.substring(1)) as HTMLInputElement;
        return v == "$_"? selection 
          : (v[0] == "$"? ie.value : v);
      }

      // tradukas esprimon por /string/ al /string/
      function str(s: string): string {
        if (p_kursoro < 0 && s.indexOf("\n")>-1) p_lines++;

        // povas esti alternativo
        const sp = s.split('|');
        for (const s1 of sp) {
          // se la esprimo enhavas la variablon $_,
          // kiu enmetas la aktualan tekston, 
          // ni metas la kursoron tien.
          if (s1 == "$_") p_kursoro = xml.length;
          const v = val(s1);
          if (v) {
            // en alternativo la unua
            // efektiva valoro haltigas la valorigadon!
            xml += v;
            return '';
          }
        };
        return '';
      }

      // traduku ŝablonon al xml-teksto
      if (!jlist || !jlist[0]) {
        console.error("Nedifinita ŝablono: \""+name+"\"");
        return '';
      }
      let xml = "";
      for (const el of jlist) {
        // tekstenhavo
        if (typeof el == "string") {
          str(el);
        } else {
          // elementkomenco
          xml += "<" + el[0];
          // atributoj
          if (el[1]) {
            for (var atr in el[1]) {
              xml += " " + atr + "=\"" + val(el[1][atr]) + "\"";
            }
          }
          xml += ">";
          // elementenhavo
          if (el[2]) {
            if (el[2] instanceof Array) {
              // ni transformas la enhav-liston al XML per rekursiva voko de xmlstr
              const x = xmlstr(el[2]);
              // se tio enhavis variablon $_ la pozicio de la kursoro
              // staras tie kalkulita de la komenco de la enhavo
              // sed ni devas ankoraŭ adicii ĉiujn signojn antaŭ la komenco:
              if (p_kursoro > -1) p_kursoro += xml.length;
              // nun ni kunigas la enhavon kun ĉio antaŭe          
              xml += x;
            } else {
              str(el[2]);
            } 
          }
          // elementfino
          if ("/" != el[0].slice(-1)) {
            xml += "</" + el[0] + ">"; 
          }
        }  
      }
      return xml;
    }
    // rekte apliku la supran algoritmon al la ŝablono donita per sia nomo...
    ([ xml_shbl[name] ]) // ni transdonas ĝin kiel unu-elementa listo 
  ),p_kursoro,p_lines];} 

  /**
   * Traktas klaveventojn en la XML-teksto: RET aldonas spacojn en la komenco de nova linio,
   * Alt+X (mal)ŝaltas la cx-butonon, Alt+T enmetas traduk-ŝablonon en la aktuala lingvo,
   * X/x aplikas kun aktiva cx-ŝaltilo la transformas cx -> ĉ, ĉx -> cx ktp.
   * @memberof redaktilo
   * @param event 
   */

  export function klavo(event: KeyboardEvent) {
    var key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    //  alert(key);
    var scrollPos: number;

    // RET: aldonu enŝovon (spacojn) komence de nova linio
    if (key == 13) {  
      scrollPos = xmlarea.scrollPos();        
      const indent = xmlarea.indent();
      xmlarea.selection("\n"+indent);
      xmlarea.scrollPos(scrollPos);
      event.preventDefault();

    // X aŭ x
    } else if (key == 88 || key == 120) {   
      var cx = document.getElementById("r:cx") as HTMLInputElement;
      if (event.altKey) {	// shortcut alt-x  --> toggle cx
        cx.value = ""+(1-parseInt(cx.value) || 0);
        event.preventDefault();
      }
  
      if (cx.value != "1") return true;

      //var txtarea = document.getElementById('r:xmltxt');
      scrollPos = xmlarea.scrollPos();
      const selText = xmlarea.selection();

      if (selText != "") return true;

      var before = xmlarea.charBefore();
      var nova = x.cxigi(before, key);

      if (nova != "") {
        //range.text = nova;
        xmlarea.selection(nova,-1);
        
        xmlarea.scrollPos(scrollPos);
        event.preventDefault();
      }
      
    // T aŭ t aŭ kir-t aŭ kir-T
    } else if (key == 84 || key == 116 || key == 1090 || key == 1058) {   
      if (event.altKey) {	// shortcut alt-t  --> trd
        insert_xml("trd_lng");
      }
    }
  }

  /**
   * Traktas la TAB- kaj la RETRO-klavojn. La TAB-klavo servas por ŝovi 
   * plurlinian markitaĵon dekstren aŭ maldekstren (je 2 spacoj) kaj la
   * RETRO-klavo en la komenco de linio forigas por 2 spacoj.
   * @memberof redaktilo
   * @inner
   * @param {Event} event 
   */
  function tab_bsp(event: KeyboardEvent) {
    const keycode = event.keyCode || event.which; 

    // traktu TAB por ŝovi dekstren aŭ maldekstren plurajn liniojn
    if (keycode == 9) {  // TAB
      event.preventDefault(); 

      const elekto = xmlarea.selection();

      // se pluraj linioj estas elektitaj
      if (elekto.indexOf('\n') > -1) {
        // indent
        if (event.shiftKey == false)
          xmlarea.indent(2);
        else
          xmlarea.indent(-2);
      
      // elekto nur ene de unu linio
      } else if ( !elekto ) {
        // traktu enŝovojn linikomence...
        const before = xmlarea.charBefore();
        if (before == '\n') {
          const indent = x.get_indent(xmlarea.txtarea,-1) || '  ';
          xmlarea.selection(indent); 
        } else if (before == ' ') {
          const indent = '  ';
          // aldonu du spacojn
          xmlarea.selection(indent);
        }
      }

    } else if (keycode == 8) { // BACKSPACE
      if (xmlarea.selection() == '') { // aparta trakto nur se nenio estas elektita!
        const spaces = xmlarea.charsFromLineStart();
        if (spaces.length > 0 && x.all_spaces(spaces) && 0 == spaces.length % 2) { 
            // forigu du anstataŭ nur unu spacon
            event.preventDefault(); 

            const pos = xmlarea.positionNo();
            xmlarea.select(pos-2,2); //selectRange(xmlarea.txtarea,pos-2, pos);
            xmlarea.selection(''); 
        }
      }
    }
  }

  /**
   * Enmetas XML-tekston per aplikata ŝablono.
   * 
   * @memberof redaktilo
   * @inner
   * @param {string} shabl - la nomo de la XML-ŝablono
   */
  function insert_xml(shabl: string) {
    //var txtarea = document.getElementById('r:xmltxt');
    //var selText;

    const pos = xmlarea.scrollPos();
    const selText = xmlarea.selection();
    var [text,p_kursoro,p_lines] = shablono(shabl,selText);
    const indent = xmlarea.indent();
    // se $_ aperas ie, ni devos
    // addicii indent.length * (#linioj ĝis $_ -1)
    xmlarea.selection(
      text.replace(/\n/g,"\n"+indent),
      p_kursoro + p_lines*indent.length);
    xmlarea.scrollPos(pos);
  }

  /**
   * Saltigas la kursoron al la sekva komenco de XML-elemento 'tag'
   * @memberof redaktilo
   * @inner
   * @param tag - la nomo de la serĉata XML-elemento
   * @param dir - la direkto: &gt;0 antaŭen, &lt;0 malantaŭen
   */
  function nextTag(tag: string, dir: number) {
        
      function lines(str: string) {
        try { 
            return(str.match(/[^\n]*\n[^\n]*/gi)?.length);
        } catch(e) { 
          return 0; 
        }        
      }

      var txtarea = document.getElementById('r:xmltxt') as HTMLInputElement;
/*
      if (document.selection  && document.selection.createRange) { // IE/Opera
        alert("tio ne funkcias por malnova retumilo IE aŭ Opera.");
      } else */
      if (txtarea.selectionStart || txtarea.selectionStart === 0) { // Mozilla
        let startPos = txtarea.selectionStart;
        let t: string;
        let pos: number;
        // serĉu "tag" malantaŭ la nuna pozicio
        if (dir > 0) {
          t = txtarea.value.substring(startPos+1);
          pos = startPos + 1 + t.indexOf(tag);
        }
        // serĉu "tag" antaŭ la nuna pozicio
        if (dir < 0) {
          t = txtarea.value.substring(0, startPos);
          pos = t.lastIndexOf(tag);    
        }
        txtarea.selectionStart = pos;
        txtarea.selectionEnd = pos;
        txtarea.focus();

        // rulu al pozicio laŭble dek linioj antaŭ la trov-loko 
        var line = lines(txtarea.value.substring(0,pos)) - 10;
        var lastline = lines(txtarea.value.substring(pos)) + line + 10;
        if (line < 0) line = 0;
        if (line > lastline) line = lastline;

        xmlarea.scrollPos(txtarea.scrollHeight * line / lastline);
        //txtarea.scrollTop = txtarea.scrollHeight * line / lastline;   
    
    //    alert("tio baldaux funkcias. tag="+tag+" pos="+pos+" line="+line+ " lastline="+lastline);
    //    alert("scrollTop="+txtarea.scrollTop+" scrollHeight="+txtarea.scrollHeight);
      }
  }

  
  /**
   * Konservas la valorojn de kelkaj kampoj (redaktanto, traduklingvo kc) 
   * en la loka memoro de la retumilo.
   * @memberof redaktilo
   */
  export function store_preferences() {
    var prefs: {[key: string]: any} = {};
    for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo','r:cx','r:xklvr']) {
      const el = document.getElementById(key) as HTMLInputElement;
      if (el) prefs[key] = el.value;
    }
    window.localStorage.setItem("redaktilo_preferoj",JSON.stringify(prefs));  
  }

  /**
   * Legas la memorigitajn valorojn de kelkaj kampoj en la redaktilo-menuo (maldekstra naviga parto)
   * el la loka memoro de la retumilo kaj metas ilin en la respektivajn kampojn de la redaktilo.
   * @memberof redaktilo
   * @inner
   */
  function restore_preferences() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
      for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo']) {
        const e = document.getElementById(key) as HTMLInputElement;
        if (prefs[key]) e.value = prefs[key];
      }
    }
  }

  /**
   * Legas unuopan valoron el la el la loka memoro de la retumilo.
   * @memberof redaktilo
   * @param key - la ŝlosilo de la legenda valoro.
   * @returns la valoro el preferoj
   */
  export function get_preference(key: string): any {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
        return prefs[key];
    }
  }

  /**
   * Legas valorojn de preferoj por la dekstra XML-parto de la redaktilo 
   * el la loka memoro de la retumilo. Momente tio estas la stato de la cx-ŝaltilo
   * kaj de la kromklavaro.
   * @memberof redaktilo
   * @inner
   */
  function restore_preferences_xml() {
    const str = window.localStorage.getItem("redaktilo_preferoj");
    const prefs = (str? JSON.parse(str) : {});
    const cx = document.getElementById('r:cx') as HTMLInputElement;
    const xklvr = document.getElementById('r:xklvr') as HTMLInputElement;
    cx.value = prefs['r:cx'] || 0;
    if (prefs['r:cx']) {
      xklvr.value = "1";
      x.show("r:klavaro");
    } else {
      xklvr.value = "0";
      x.hide("r:klavaro");
    }
  }

  /** Konservas la nomon kaj la XML-tekston de la aktuale redaktata artikolo
   * en la loka memoro de la retumilo. 
   * @memberof redaktilo
   */
  export function store_art() {
    const nom = document.getElementById("r:art") as HTMLInputElement;
    window.localStorage.setItem("red_artikolo",
      JSON.stringify({
        'xml': xmlarea.syncedXml(),
        'nom': nom.value
        //'red': nova/redakti...
      })
    );
  }

  
  /**
   * Restarigas XML-tekston kaj la artikolnomon el loka retumila memoro.
   * @memberof redaktilo
   * @inner
   */
  function restore_art() {
    const str = window.localStorage.getItem("red_artikolo");
    const nom = document.getElementById("r:art") as HTMLInputElement;
    const art = (str? JSON.parse(str) : null);
    if (art) {
      xmlarea.setText(art.xml); // document.getElementById("r:xmltxt").value = art.xml;
      //  document.getElementById("...").value = art.red;
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
      for (var ch of Array.from(el.parentElement.children)) {
        ch.classList.remove('aktiva');
        fs_id = 'r:fs_'+ch.id.substring(2);

        // fermu ĉiujn videblajn tabuletojn
        if (id != "r:chiuj" && ch.id != "r:chiuj") {
          document.getElementById(fs_id).classList.add('collapsed');
        
        } else { // malfermu ĉiujn krom "novaj"
          if ( ch.id == "r:nov" )
            document.getElementById(fs_id).classList.add('collapsed');
          else if ( ch.id != "r:chiuj")
            document.getElementById(fs_id).classList.remove('collapsed');
        }
      }
      el.classList.add('aktiva');
      if ( id != "r:chiuj" ) {
        fs_id = 'r:fs_'+id.substring(2);
        document.getElementById(fs_id).classList.remove('collapsed');
      }
    }
  }

  /*************************************************************************
    FUNKCIOJ POR KONTROLADO, ANTAŬRIGARDO KAJ SUBMETO DE REDAKTITA ARTIKOLO
  **************************************************************************/

  /**
   * Metas erarojn liste en la keston por eraroj (sub la redakto-menuo)
   * @memberof redaktilo
   * @inner
   * @param err la listo de eraroj
   */
  function listigu_erarojn(err: Array<string>) {
    const el = document.getElementById("r:eraroj");
    if (el) {      
      let ul = el.querySelector("ul");
      if (! ul) {
        ul = document.createElement("ul");                
        el.appendChild(ul);
      } 
      for (var e of err) {
        var li = u.ht_element("li",{},e); //createTElement("li",e);               
        ul.appendChild(li);       
      }
    }
  }

  /**
   * Tradukas erarojn trovitaj per regulesprimoj al eraro-mesaĝo kaj
   * prezentas ilin liste en la erarokesto al la uzanto
   * @memberof redaktilo
   * @inner
   * @param msg - mesaĝo, kiu montrigu en la komenco de ĉiu unuopa trovo
   * @param matches - la trovoj, la trovita eraro estas la unua elmento de ĉiu trovo
   */
  function add_err_msg(msg: string, matches: Array<Array<any>>) {
    let errors = [];

    if (matches)
      for (const m of matches) {
        errors.push(msg+m[1]);
      };

    if (errors.length)
      listigu_erarojn(errors);
  }


  /**
   * Preparas kontrolon, montras tion al la uzanto
   */
  function kontrolo_start(msg: string) {
    const err = document.getElementById("r:eraroj");
    if (err) {
      err.textContent='';
      err.insertAdjacentHTML("afterbegin",
      `<span id='r:kontrolante' class='animated-nav-font'>${msg}...</span>`);
      err.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
      (err.parentNode as Element).setAttribute("open","open");    
    }
  }

  /**
   * Forigas la atendomesaĝon montratan dum kontrolado
   */
  function kontrolo_halt() {
    document.getElementById("r:kontrolante")?.remove();
  }

  /**
   * Kontrolas en la XML-teksto per regulesprimo, ĉu la uzitaj kodoj (lingvoj, stiloj, fakoj)
   * esas validaj. Uzoj de nevalidaj kodoj estas redonataj kiel rezultoj de la regulesprimo
   * @memberof redaktilo
   * @inner
   * @param clist - la nomo de la kodlisto kontraŭ kiu ni kontrolas
   * @param regex - la regulesprimo per kiu ni serĉas la uzojn
   * @returns la listo de nevalidaj koduzoj - kiel trovoj per regulesprimo
   */
  function kontrolu_kodojn(clist: x.ListNomo, regex: RegExp) {
    const xml = xmlarea.syncedXml(); //document.getElementById("r:xmltxt").value;
    const list = revo_listoj[clist];

    let m: RegExpExecArray; 
    let invalid = [];

    if (! list ) {
      console.error("Kodlisto \"" + clist + "\" estas malplena, ni ne povas kontroli ilin!");
      return;
    }
    
    while ((m = regex.exec(xml))) {
      if ( m[1] && !list.codes[m[1]] ) {
        invalid.push(m);
        console.error("Nevalida kodo \""+m[1]+"\" ĉe: "+m.index);
      }
    }
    return invalid;
  }

  /**
   * Kontrolas per regulesprimo (re_mrk), ĉu la markoj aperantaj en la XML-teksto estas validaj
   * @memberof redaktilo
   * @inner
   * @param {string} art - la nomo de la artikolo, t.e. la unua parto de marko antaŭ la unua punkto
   */
  function kontrolu_mrk(art: string) {
    var xml = xmlarea.syncedXml(); // document.getElementById("r:xmltxt").value;
    var m; 
    var errors = [];
    
    while ((m = re_mrk.exec(xml))) {
      var el = m[1];
      var mrk = m[2];
      if ( mrk.indexOf(art+'.') != 0 ) {
        errors.push("La marko \"" + mrk + "\" (" + el + ") ne komenciĝas je la dosieronomo (" + art + ".).");
      } else if ( mrk.indexOf('0',art.length) < 0 ) {
        errors.push("La marko \"" + mrk + "\" (" + el + ") ne enhavas \"0\" (por tildo).");
      }
    }
    if (errors.length)
      listigu_erarojn(errors); 
  }

  /**
   * Trovas artikolojn sen lingvo en la XML-teksto
   * @memberof redaktilo
   * @inner
   */
  function kontrolu_trd() {
    const xml = xmlarea.syncedXml(); //document.getElementById("r:xmltxt").value;
    let m;
    const re_t2 = /(<trd.*?<\/trd>)/g;
    let errors = [];
    
    // forigu bonajn trdgrp kaj trd FARENDA: tio ne trovas <trd lng="..."> ene de trdgrp!
    const x = xml.replace(re_trdgrp,'').replace(re_trd,'');
    while ((m = re_t2.exec(x))) {
      errors.push("Traduko sen lingvo: "+m[1]);
    }

    if (errors.length)
      listigu_erarojn(errors); 
  }

  /** 
   * Kontrolas per regulesprimo (re_ref) la referencojn en la XML-teksto: 
   * ĉu celo estas donita.
   * @memberof redaktilo
   * @inner
   */
  function kontrolu_ref() {
    var xml = xmlarea.syncedXml(); //document.getElementById("r:xmltxt").value;
    var m; 
    var errors = [];
    
    while ((m = re_ref.exec(xml))) {
      var ref = m[1];
      if (ref.search(re_refcel) < 0)
        errors.push("Mankas celo en referenco <ref" + ref + ">"+ m[2] +"</ref>.");
    }
    if (errors.length)
      listigu_erarojn(errors); 
  }

  /**
   * Kontrolas la XML-tekston kaj trovas eventualajn erarojn. Ĝi aplikas nur la
   * lokan kontrolon (trd, ref, mrk, kodoj...) - La ĝenerala sintakso devas esti
   * kontrolata en la servilo!
   * @memberof redaktilo
   * @inner
   * @param {string} art - la artikolnomo
   * @param {string} xml - la XML-teksto
   */
  function kontrolu_xml_loke(art: string,xml: string) {
    if (xml.startsWith("<?xml")) {
      kontrolu_mrk(art);
      kontrolu_trd();
      kontrolu_ref();

  // kontrolu_fak();
    //kontrolu_stl();
    //...

      add_err_msg("Nekonata lingvo-kodo: ",kontrolu_kodojn("lingvoj",re_lng));
      add_err_msg("Nekonata fako: ",kontrolu_kodojn("fakoj",re_fak));
      add_err_msg("Nekonata stilo: ",kontrolu_kodojn("stiloj",re_stl));
    } else {
      listigu_erarojn(["Averto: Artikolo devas komenciĝi je <?xml !"]);
    }
  }

  /**
   * Petas antaŭrigardon kiel HTML de la servilo. La XML ankaŭ estas kontrolata samtempe
   * kaj trovitaj eraroj prezentataj al la uzanto en la eraro-kesto.
   * @memberof redaktilo
   */
  export function rantaurigardo() {
    let eraroj = document.getElementById("r:eraroj");
    const art = (document.getElementById("r:art") as HTMLInputElement).value;
    const xml = xmlarea.syncedXml();

    // eblas, ke en "nav" montriĝas indekso, ĉar la uzanto foiris de la redaktado tie
    // ni testas do antaŭ kontroli erarojn
    // alternative ni povus renavigi al la navigilo...!?
    kontrolo_start("kontrolante kaj transformante...");

    kontrolu_xml_loke(art,xml);
    if (xml.startsWith("<?xml")) {
      vokomailx("nur_kontrolo",art,xml);
    }    

    if (xml.startsWith("<?xml")) {
      vokohtmlx(xml);
    }
  }

  /**
   * Kontrolas la XML-tekston sen peti antaŭrigardon samtempe.
   * @memberof redaktilo
   * @inner
   */
  function rkontrolo() {
    let eraroj = document.getElementById("r:eraroj");
    const art = (document.getElementById("r:art") as HTMLInputElement).value;
    const xml = xmlarea.syncedXml();

    kontrolo_start("kontrolante...");

    kontrolu_xml_loke(art,xml);
    if (xml.startsWith("<?xml")) {
      vokomailx("nur_kontrolo",art,xml);
    }
  }

  /**
   * Submetas la XML-redakton. Antaŭe la XML-teksto estas kontrolata. Se troviĝas eraroj
   * ili estas montrataj kaj la artikolo ne estas submetata.
   * @memberof redaktilo
   * @inner
   */
  function rkonservo() {
    // PLIBONIGU: estas ioma risko ke tiel oni retrovas unuon en la ŝlosilnomo de jam anstataŭigita unuo
    // do eble estus plibone trakuri la tekston signon post signo, ignori dume xml-nomoj sed
    // konsideru nur atributojn kaj tekstojn. Kaj se komenco de signovico identas kun unuo-valoro
    // anstataŭigi, sed poste rigardi nur la restantan tekston...
    // Tiam oni povus ankaŭ anstataŭigi unuojn de longeco 1 kaj forigi revo:encode en la servila flanko!
    /* provizore ni rezignas pri tio ĉi kaj anstatŭigas en load_xml nur unuojn de longeco 1...
    function replace_entities(xml) {
      function _repl_ent(key,value,xml) {
        const pos = xml.indexOf(value);
        if (pos>-1) {
          return xml.slice(0,pos) + "&" + key + ";" + _repl_ent(key,value,xml.slice(pos+value.length));
        } else {
          return xml;
        }
      }
      for (const [key, value] of Object.entries(voko_entities)) {
          if (value.length > 1) { // la unuojn de longeco 1 anstataŭigas vokomailx.pl ( revo::encode )
            xml = _repl_ent(key,value,xml);
          }  
      }
      return xml;
    }
    */

    const art = (document.getElementById("r:art") as HTMLInputElement).value;
    const xml = xmlarea.syncedXml();

    kontrolo_start("kontrolante kaj submetante...")

    // kontrolu loke revenas nur post kontrolo,
    // dum kontrole ene de vokomailx as nesinkrona
    kontrolu_xml_loke(art,xml);

    if (xml.startsWith("<?xml") &&
      document.getElementById("r:eraroj")?.textContent == '') {
        const nxml = xmlarea.normalizedXml();
        // forsendu la redaktitan artikolon
        vokomailx("forsendo",art,nxml);
        // memoru enhavon de kelkaj kampoj
        store_preferences();
    } else {
      kontrolo_halt();
    }
  }

  /**
   * Vokas la servilan skripton vokohtmlx.pl por ricevi antaŭrigardon de la artikolo.
   * @param {string} xml - la sendota XML-teksto
   */
  function vokohtmlx(xml: string) {
    u.HTTPRequest('POST',cgi_vokohtmlx,
    {
      xmlTxt: xml
    },
    function (data: string) {
      // Success!
      var parser = new DOMParser();
      var doc = parser.parseFromString(data,"text/html");
      var rigardo = document.getElementById("r:tab_trigardo");

      var article = doc.getElementsByTagName("article")[0];
      if (article) {
        // anstataŭigu GIF per SVG  
        x.fix_img_svg(article);
        x.fix_art_href(article);

        // enmetu la artikolan HTML je la antaŭrigardo
        rigardo.textContent = '';
        rigardo.append(article);  

        // ekipu ĝin per faldiloj ktp., se ne estas 'aldono' ni transdonos
        // ankaŭ la artikolnomon el la kampo #r:art (por tezaŭro kaj piedlinio)
        const r_art = document.getElementById("r:art") as HTMLInputElement;
        const art = redakto=='redakto'? r_art.value : null;
        artikolo.preparu_art(art);

        // saltu en la artikolo al la redaktata parto
        xmlarea.saltu();


        // eble tio devas esti en preparu_art?
        // refaru matematikajn formulojn, se estas
        if (typeof(MathJax) != 'undefined' && MathJax.Hub) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
      
      } /*
      else {
        // FARENDA: post kiam ĉiuj artikoloj havos HTML5-strukturon ni povos forigi tion
        var body = doc.body;
        var pied = body.querySelector("span.redakto");
        if (pied) pied.parentElement.removeChild(pied);
    
        rigardo.textContent = '';
        rigardo.append(...body.childNodes);  
      }
      */
    });
  }

  /**
   * Vokas la servilan skripton vokomailx.pl por kontroli sintakson kaj eventuale submeti
   * la redakton.
   * @memberof redaktilo
   * @inner
   * @param {string} command - parametro 'command' por la skripto
   * @param {string} art - la artikonomo (dosiernomo)
   * @param {string} xml - la XML-teksto
   */
  function vokomailx(command: string,art: string,xml: string) {

    var red = (document.getElementById("r:redaktanto") as HTMLInputElement).value;
    var sxg = (document.getElementById("r:sxangxo") as HTMLInputElement).value;
    var nova = (redakto == 'aldono')? "1" : "0";

    // console.log("vokomailx art:"+art);
    // console.log("vokomailx red:"+red);
    // console.log("vokomailx sxg:"+sxg);

    u.HTTPRequest('POST',cgi_vokosubmx,
      {
        xmlTxt: xml,
        art: art,
        redaktanto: red,
        sxangxo: sxg,
        nova: nova,
        command: command
      },
      function (data: string) {
        const re_pos = /(pozicio\s+[\d:]+)/g;
        const re_enk = /(Atentu|Averto|Eraro):/g;
        // Success!
        const parser = new DOMParser();
        const doc = parser.parseFromString(data,"text/html");

        kontrolo_halt();

        const err_list = document.getElementById("r:eraroj");
        if (err_list) {
          //for (div of doc.body.getElementsByClassName("eraroj")) {
          doc.body.querySelectorAll(".eraroj").forEach((div) => {
            // debugging...
            console.log("div id=" + div.id);
            div.innerHTML = div.innerHTML
              .replace(re_enk,'<span class="$1">$1</span>:')
              .replace(re_pos,'<a href="#">$1</a>');
            err_list.appendChild(div);
          });

          const konfirmo = doc.getElementById("konfirmo");
          if (konfirmo) {
            // debugging...
            console.log("div id=" + konfirmo.id);
            err_list.appendChild(konfirmo);
            err_list.classList.add("konfirmo");
        
            // adaptu staton kaj rilatajn butonojn...
            // tio pli bone estu en kadro.js(?)
            t_red.transiro("sendita");

            // finu redaktadon
            //hide("x:redakt_btn");
            //hide("x:rigardo_btn");

          } else if (command == "nur_kontrolo" &&
            err_list.textContent.replace(/\s+/,'') == '') {
            // nur kontrolo kaj neniu eraro
            err_list.appendChild(
              document.createTextNode("Bone! Neniu eraro troviĝis."));
            err_list.classList.add("konfirmo");
          } else {
            err_list.classList.remove("konfirmo");
          }
        }
      });
  }



  /**
   * Petas la staton de submetoj de la servilo.
   * Submetitaj redaktoj estas en datumbazo, la stato indikas ĉu ili
   * jam estas traktitaj de la redaktoservo kaj ĉu sukcese aŭ kun eraro.
   * CGI-skripto redonas la liston de submetoj kun stato de la personaj redaktoj
   * @memberof redaktilo
   * @param {Function} subm_callback 
   * @param {Function} onstart 
   * @param {Function} onstop 
   */
  export function submetoj_stato(subm_callback: Function,onstart: Function,onstop: Function) {
    const red = get_preference('r:redaktanto');
    if (!red) return;

    u.HTTPRequest('POST',cgi_vokosubm_json,
    {
      email: red
    },
    function (data: string) {
      // Success!
      if (data) {
        var json = JSON.parse(data);
        //for (subm of json) {
        //  console.info("id:"+subm.id+" art:"+subm.fname+" stato:"+subm.state);
        //}  
        subm_callback(json);
      }
    },
    onstart,
    onstop);
  }
    

  /*********************************************************
    FUNKCIOJ POR EKREDAKTO DE ARTIKOLO
  **********************************************************/

    
    /**
     * Kreas novan XML-artikolon
     * @memberof redaktilo
     * @inner
     */
    function create_new_art() {
      const r_nova = document.getElementById("r:nova_art") as HTMLInputElement;
      const art = r_nova.value;
      //var ta = document.getElementById("r:xmltxt");
      (document.getElementById("r:art") as HTMLInputElement).value = art;
      //document.getElementById("r:art_titolo").textContent = art;
      redakto = 'aldono';
      var shg = document.getElementById("r:sxangxo") as HTMLInputElement;
      shg.value = art; shg.setAttribute("readonly","readonly");
      /* jshint ignore:start */
      //ta.value = 
      xmlarea.setText(
          '<?xml version="1.0"?>\n'
        + '<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">\n'
        + '<vortaro>\n'
        + '<art mrk="\$Id\$">\n'
        + '<kap>\n'
        + '    <rad>' + art + '</rad>/o <fnt><bib>FNT</bib></fnt>\n'
        + '</kap>\n'
        + '<drv mrk="' + art + '.0o">\n'
        + '  <kap><tld/>o</kap>\n'
        + '  <snc mrk="' + art + '.0o.SNC">\n'
        + '    <uzo tip="fak"></uzo>\n'
        + '    <dif>\n'
        + '      <tld/>o estas:\n'
        + '      <ekz>\n'
        + '        ...\n'
        + '        <fnt><bib></bib>, <lok></lok></fnt>\n'
        + '      </ekz>\n'
        + '    </dif>\n'
        + '  </snc>\n'
        + '  <trd lng=""></trd>\n'
        + '</drv>\n'
        + '</art>\n'
        + '</vortaro>\n');
      /* jshint ignore:end */
    }


  
  /**
   * Ŝargas XML-artikolon por redaktado de la servilo
   * @memberof redaktilo
   * @inner
   * @param params - HTTP-parametroj, ni ekstraktas parametron 'art', kiu donas la dosiernomon de la artikolo
   */
  function load_xml(params: string) {
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
          (document.getElementById("r:art") as HTMLInputElement).value = art;
          xmlarea.setText(xmlteksto);
        });
    } else {
      // se ne estas donita artikolo kiel parametro, ni provu legi
      // lastan artikol-tekston el retumila memoro
      restore_art();
    }
  }

  /**
   * Reagas al ekstraktado de la XML-strukturo: ĉiam kiam troviĝas subteksto ni
   * ricevas en ci tiu revokfunkcio la koncernajn informojn kaj povas aldoni listeron
   * en la elekto de subtekstoj, kiu troviĝas super la XML-redaktilo.
   * @memberof redaktilo
   * @inner
   * @param subt - la informoj pri la subteksto
   * @param index - la nombro de la subteksto (0-art, 1..n-1 - drv/snc..., n - tuta XML)
   * @param selected - true: temas pri la aktive redaktata subteksto, ni elektu gin en la listo
   */
  function on_xml_add_sub(subt: Strukturero,index: number,selected: boolean) {
    const sel_stru = document.getElementById("r:art_strukturo");
    if (index == 0) sel_stru.textContent = ''; // malplenigu la liston ĉe aldono de unua ero...

    if (selected) {
      sel_stru.append(u.ht_element('option',{value: subt.id, class: subt.el, selected: 'selected'},subt.dsc));
    } else {
      sel_stru.append(u.ht_element('option',{value: subt.id, class: subt.el},subt.dsc));
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
    xmlarea.changeSubtext(val,true);
    show_pos();

    // se montriĝas traduk-proponoj, necesas adapti la hoketojn kaj +-butonoj
    // laŭ la elektita (sub)drv/snc
    trad_ebloj();
  }

  /**
   * Ni notas referencon transprenante gin el la trovlisto post serĉo (kiam
   * la uzanto tie premas la sago-butonon)
   * @memberof redaktilo
   * @param refmrk - la marko de la referenco
   * @param refstr - la vorto, al kiu la referenco montras
   */
  export function load_ref(refmrk: string, refstr: string) {
    const m = re_mrk_split.exec(refmrk);
    if (m) {
      const art = m[1];
      const _mrk = m[2];
      //document.getElementById("r:refmrk").value = refmrk;
      (document.getElementById("r:refstr") as HTMLInputElement).value = refstr;
      load_ref_sub(art,_mrk); // ŝargu la (sub)sencojn ks por la vorto
    }
    redaktilo.fs_toggle("r:ref");
  }

  /**
   * Ŝargas la JSON-strukturon de la artikolo, al kiu montras referenco.
   * Ni elprenas la markojn de (sub)sencoj por povi pli precize referenci.
   * Ili montrigos en elekto-listo en la redaktomenuo - panelo 'referencoj'
   * @memberof redaktilo
   * @inner
   * @param art - la dosiernomo de la referencata artikolo
   * @param _mrk - la marko de la referencata vorto
   */
  function load_ref_sub(art: string,_mrk: string) {

    u.HTTPRequest('GET',tez_url+art+'.json',{},
      function (data: string) {
        const json = 
          /** @type { {mrk: Array<Array>} } */
          (JSON.parse(data));

        const mrkj = json[art].mrk;

        if (mrkj) {
          const rm = document.getElementById("r:refmrk");
          rm.textContent = '';
  
          // la drv
          rm.append(u.ht_element("option",{},art+_mrk));
          // ĉio ene (snc, subsnc, rim)
          for (const mrk of mrkj) {
            if (mrk[0].startsWith(_mrk+'.')) {
              rm.append(u.ht_element("option",{},art+mrk[0]));
            }
          }

          x.show("r:refmrk");
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
  function sf(pos: number, line: number, lastline: number) {
    document.getElementById("r:xmltxt").focus();
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
  function show_pos() {
    // aktualigu pozicion
    const pos = xmlarea.position();
    document.getElementById("r:position").textContent=(1+pos.line)+":"+(1+pos.pos);
  }

  /**
   * Preparas la redaktilon en la dekstra kadro: preferojn kaj XML-tekston, 
   * alligas evento-traktilojn
   * @memberof redaktilo
   * @param {string} params - HTTP-parametroj, el kiu ni ekstraktas la parametron 'art' por sargi la XML-fonton
   */
  export function preparu_red(params: string) {

    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    if (document.getElementById("r:xmltxt")) {
      restore_preferences_xml();
      sf(0, 0, 1);
      //if (!xmlarea) 

      // ŝanĝu tekston al nurlege
      const xmltxt = document.getElementById("r:xmltxt") as HTMLInputElement;
      xmltxt.removeAttribute("readonly");

      const xklvr = document.getElementById("r:xklvr") as HTMLInputElement;

      xklvr.addEventListener("click",
        () => {
          const pressed = ""+(1 - parseInt(xklvr.value));
          xklvr.value = pressed;
          if (pressed) {
            x.show("r:klavaro");
          } else {
            x.hide("r:klavaro");
          }
      });    


      xmlarea = new Xmlarea("r:xmltxt",on_xml_add_sub);
      load_xml(params); // se doniĝis ?art=xxx ni fone ŝargas tiun artikolon

      const klvr = document.getElementById("r:klavaro");
      xklavaro = new XKlavaro(klvr, null, xmltxt,
        () => xmlarea.getRadiko(),
        (event: Event, cmd) => { 
          // PLIBONIGU: tion ni povas ankaŭ meti en xklavaro.js!
          if (cmd.cmd == 'indiko') {
            x.hide("r:klv_fak");
            x.show("r:klv_ind");
            x.hide("r:klv_elm");
          } else if (cmd.cmd == 'fako') {
            x.hide("r:klv_ind");
            x.show("r:klv_fak");
            x.hide("r:klv_elm");
          } else if (cmd.cmd == 'klavaro') {
            x.hide("r:klv_fak");
            x.show("r:klv_elm");
            x.hide("r:klv_ind");
          }
        },
        () => xmlarea.setUnsynced())
    }
    xklavaro.indiko_klavoj(document.getElementById("r:klv_ind"), revo_listoj.stiloj);
    xklavaro.fako_klavoj(document.getElementById("r:klv_fak"), revo_listoj.fakoj);
    const klv_elm = document.getElementById("r:klv_elm");
    xklavaro.elemento_klavoj(klv_elm,klv_elm.textContent);

    redakto = 'redakto'; // gravas post antaŭa aldono!

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // klav-premoj en XML-redaktilo
    document.getElementById("r:xmltxt")
      .addEventListener("keypress",klavo);
    document.getElementById("r:xmltxt")
      .addEventListener("keydown",tab_bsp);

    document.getElementById("r:xmltxt")
      //.addEventListener("selectionchange",show_pos); // movado de kursoro, ne kaŭzas input-eventon...!
      .addEventListener("keyup",show_pos); // movado de kursoro, ne kaŭzas input-eventon...!
    //ni difinas rekte en xmlarea:...document.getElementById("r:xmltxt")
    //  .addEventListener("input",show_pos);
    document.getElementById("r:xmltxt")
      .addEventListener("focus",show_pos);
    document.getElementById("r:xmltxt")
      .addEventListener("click",show_pos);

    // strukturlisto
    document.getElementById('r:art_strukturo')
      .addEventListener("change",struktur_elekto);

    document.getElementById("r:cx")
      .addEventListener("click",function(event) {
        event.preventDefault();
        var cx = event.currentTarget as HTMLInputElement;
        cx.value = ""+(1 - parseInt(cx.value)) || "0"; 
        document.getElementById('r:xmltxt').focus();
    });

  }

  /**
   * Preparas la redaktilo-elementojn en la naviga kadro: elekto-listojn (fakoj, stiloj...),
   * evento-traktiloj
   * @memberof redaktilo
   */
  export function preparu_menu() {

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
      .addEventListener("click",rkontrolo);

    // butono por konservi
    document.getElementById("r:konservu")
      .addEventListener("click",rkonservo);

    // salto al eraroj
    document.getElementById("r:eraroj").addEventListener("click", function(event) {
      const trg = event.target as Element;
      if (trg.tagName == 'A') {
        event.preventDefault();
        const pos_str = trg.textContent.split(' ')[1];
        xmlarea.goto(pos_str);
        show_pos();
      } 
    });

    // remetu ŝanĝo-kampon en difinitan staton (necesa post aldono de nova artikolo)
    var shg = document.getElementById("r:sxangxo");
    shg.removeAttribute("readonly");

    // metu buton-surskribon Rezignu kaj malaktivigu la aliajn du
    //document.getElementById("r:rezignu").textContent = "Rezignu"; 
    //document.getElementById("r:kontrolu").removeAttribute("disabled"); 
    //document.getElementById("r:konservu").removeAttribute("disabled");       

    // navigi inter diversaj paneloj kun enmeto-butonoj ktp.
    var fs_t = document.getElementById("r:fs_toggle");
    fs_t.querySelectorAll("a").forEach(function (a) { 
      a.removeAttribute("onclick");
    });
    fs_t.addEventListener("click", function(event) {
      const trg = event.target as Element;
      const a = trg.closest("a");
      fs_toggle(a.id);
    });

    // butonoj sur tiuj paneloj por enmeti elementojn
    var v_sets = document.getElementById("r:v_sets");
    v_sets.querySelectorAll("button").forEach( (b) => {

      if (b.id == "r:create_new_art") { // [kreu]
        b.addEventListener("click", create_new_art);

      } else if (b.id == "r:trd_sercho") { // traduko-serĉo
        b.addEventListener("click", trad_uwn);

      } else if (b.classList.contains("help_btn")) { // (?) (<>)
        b.addEventListener("click", function(event) {
          const trg = event.currentTarget as Element;
          x.helpo_pagho(trg.getAttribute("value"));
        });

      } else { // ŝablon-butonoj
        b.addEventListener("click",function(event) {
          const trg = event.currentTarget as Element;
          const v = trg.getAttribute("value");
          insert_xml(v);
        });
      }

    });
  }  

  /**
   * Ŝargas tradukproponojn el Universala Vort-Reto (UWN)
   * @param {Event} event 
   */
  function trad_uwn(event: Event) {
    event.preventDefault();
    const s_trd = document.getElementById('r:trd_elekto');
    s_trd.textContent = '';

    const sercho = xmlarea.getCurrentKap(); //'hundo';

    // prezento de traduklisto kiel HTML-dd-elemento
    // enhavanta la tradukojn kiel ul-listo
    function dl_dd(lng: Lingvo, trd: string[]): Element {
      return <Element>u.ht_list(trd,'ul',{}, function(t: string) {
          //var t = s; // la traduko
          const li = u.ht_element('li');
          if (t.slice(0,2) == '?;') {
            li.append(u.ht_element('span',{class: 'dubinda'},'?'));
            t = t.slice(2);
          }
          li.append(u.ht_element('span',{class: 'trd'},t));
          return li;
      });
    } 

    const srch = new Sercho();
    srch.serchu_uwn(sercho, function(json: any) {
      if (json) {
          // butonojn por aldoni ni montras nur, se (sub)drv|(sub)snc estas
          // elektita en la redaktilo...
          s_trd.prepend('El ',u.ht_element('a',{href: uwn_url},'Universala Vortreto'),
            ', kontrolu ĝustecon antaŭ aldoni!');          

          for (let t in json) {
              const tv = json[t];
              // montru serĉ-rezultojn kiel html summary/details 
              const details = u.ht_details(
                tv.trd.eo.map((s: string) => s.replace(/\?;/,'?:\u00a0'))
                  .join(', ')||t, '',
                function(d: Element) {
                  // esp-a difino
                  const eo = (tv.dif && tv.dif.length)? tv.dif : ['-/-'];
                  const pe = u.ht_elements([
                      ['p',{},[
                          ['em',{},'eo: '],
                          ...eo
                      ]]
                  ]);
                  if (pe) d.append(...pe);

                  // angla difino
                  const en = tv.dsc? tv.dsc : ['-/-'];
                  const pa = u.ht_elements([
                      ['p',{},[
                        ['em',{},'en: '], 
                        en ]]
                  ]);
                  if (pa) d.append(...pa);

                  // tradukojn prezentu kiel difinlisto (dl)
                  var nkasxitaj = 0;
                  const dl = <Element>u.ht_dl(
                    tv.trd,

                    // tiu funkci revokiĝas por ĉiu trovita en la json-listo lingvo 
                    // kun listo de tradukoj
                    function(lng: Lingvo, trd: string[], dt: Element, dd: Element) {
                      // lingvonomo
                      const ln = revo_listoj.lingvoj.codes[lng];

                      // ni ne montras nekonatajn lingvojn, ĉar enmeto
                      // en la artikolon ne havas sencon aktuale...
                      if (ln && lng != 'eo') {
                        // atributoj (class, style...)
                        // ne montru e-ajn tradukojn en la listo (ili estas jam en summary)
                        // komence kaŝu ĉiujn krom la preferataj lingvoj
                        var cls = [];
                        if (preferoj.languages().indexOf(lng) < 0) {
                          cls.push('kasxita');
                          nkasxitaj++;
                        }

                        // se jam ekzistas tradukoj por tiu lingvo montru tion
                        // per CSS
                        //if (has_trd(lng)) cls.push('tradukita');

                        var atr: u.AtributSpec = {};
                        if (cls.length) atr = {class: cls.join(' ')};

                        // DT
                        u.ht_attributes(dt,atr);
                        dt.append('['+lng+'] ' +ln);

                        // DD: tradukoj estas listo, kiun ni aldonas en dd
                        atr.lang = lng; 
                        u.ht_attributes(dd,atr);

                        dd.append(dl_dd(lng,trd));
                      } // ...if ln                      
                    }, // u.ht_dl callback
                    true); // true = sorted (keys=lng)

                    // aldonu eventon por reagi al +-butonoj
                    dl.addEventListener('click', function(event) {
                      const trg = event.target as HTMLInputElement;
                      if (trg.value == 'plus') {
                        const dd = trg.closest('dd');
                        // la traduko troivĝas rekte antaŭ la butono!
                        const sp = trg.previousSibling;
                        const lng = dd.getAttribute('lang');
                        console.log('aldonu ['+lng+'] '+sp.textContent);
                        xmlarea.addTrd(lng,sp.textContent);

                        // montru per hoketo, ke ni nun havas la tradukon en XML
                        const li = trg.closest('li');
                        li.classList.remove('aldonebla');
                        li.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
                        remove(li.querySelector('button'));
                      }
                    });
                    
                    // aldonu (+nn) - por videbligi la kasxitajn tradukojn
                    if (nkasxitaj) {
                      const pli = u.ht_pli(nkasxitaj);
                      if (pli) dl.append(...pli);  
                    }

                    d.append(dl);
                }
              ); // u.ht_details
              if (details) s_trd.append(details);

          }  // for t in json

          // aldonu hoketojn kaj +-butonojn...
          trad_ebloj();
          
          //t_red.transiro("tradukante");
          x.show("r:tab_tradukoj",'collapsed');    
      } else {
        s_trd.append("Nenio troviĝis.");
        x.show("r:tab_tradukoj",'collapsed');    
      }
    },
    start_wait,
    stop_wait
    );
  }

  /**
   * Montras depende de elektita (sub)drv|(sub)snc la jam ekzistantajn
   * tradukojn kaj +-butonojn por eblaj aldonoj
   * @memberof redaktilo
   * @inner
   */
  function trad_ebloj() {
    const elekto = document.getElementById('r:trd_elekto');
    if (!elekto) return;

    const _ele_ = xmlarea.elekto;
    const drv_snc = (_ele_ && _ele_.el && (_ele_.el == 'snc' || _ele_.el == 'drv'));
    //const drv_snc = ('drv|snc'.indexOf(_ele_?.el.slice(-3)) > -1);

    // se iu (sub)drv|(sub)snc estas elektita ni montras +-butonojn kaj hoketojn...
    if (elekto.querySelector('details')) {
      if ( drv_snc ) {
        // forigu la noton pri drv/snc-elekto...
        const noto = elekto.querySelector('p.noto');
        if (noto) noto.remove();

        // eltrovu kiujn tradukojn ni havas en la aktuala teksto
        xmlarea.collectTrdAll();

        elekto.querySelectorAll('dd').forEach( (dd) => {
          const lng = dd.getAttribute('lang');

          dd.querySelectorAll('li').forEach( (li) => {
            const trd = li.querySelector('.trd');
            const t = (trd)? trd.textContent : undefined;
            // se drv/snc estas elektita kaj la traduko ankoraŭ 
            // ne troviĝas tie, ni permesu aldoni ĝin
            if ( ! xmlarea.tradukoj()[lng] 
              || ! xmlarea.tradukoj()[lng].find((e: string) => u.compareXMLStr(e,t) )
              ) {
              // d.push('\u00a0'); // nbsp
              li.classList.add('aldonebla');

              if (!li.querySelector('button')) {
                li.append(u.ht_element('button',{
                  value: 'plus', 
                  title: 'aldonu al XML-(sub)drv/snc'},
                  '+'));    
              }
              remove(li.querySelector('span.ekzistas'));

            } else {
              // montru per hoketo, ke ni jam havas la tradukon en XML
              li.classList.remove('aldonebla');
              if (! li.querySelector('span.ekzistas')) {
                li.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
              }
              remove(li.querySelector('button'));
            }

          }); // forEach li...

          // krome ni elstarigu lingvojn, kiuj jam havas tradukon por
          // eviti tro facilan aldonon!
          const dt = dd.previousSibling;
          if (dt instanceof Element) {
            const e = dt as Element;
            if (xmlarea.tradukoj()[lng]) {
              e.classList.add('ekzistas');
              remove(dt.querySelector('span.aldonebla'));
              if (! dt.querySelector('span.ekzistas'))
                e.append(u.ht_element('span',{class: 'ekzistas'},'\u2713'));
            } else {
              e.classList.remove('ekzistas');
              remove(e.querySelector('span.ekzistas'));
              if (! e.querySelector('span.aldonebla'))
                e.append(u.ht_element('span',{class: 'aldonebla'},'\u2026'));
            }
          }
     
        }); // forEach dd..

      // ĉe elekto de (sub)art|xml ni montras nur la tradukojn..., t.e. ni
      // forigas ilin, se ili restis de antaŭa elekto
      } else {

        elekto.prepend(u.ht_element('p',{class: 'noto'},'Elektu (sub)derivaĵon aŭ (sub)sencon '
          + 'en la redaktilo, poste vi povas aldoni tie novajn tradukojn el la '
          + 'malsupraj faldlistoj per la +-butonoj.'));

        elekto.querySelectorAll('dd li').forEach( (li) => {
          remove(li.querySelector('.ekzistas'));
          remove(li.querySelector('button'));
        });

        elekto.querySelectorAll('dt').forEach( (dt) => {
          dt.classList.remove('ekzistas');
          remove(dt.querySelector('span.ekzistas'));
          remove(dt.querySelector('span.aldonebla'));
        });

      } // if drv_snc
    } // if.. details..else..

  }

  /* 
  when_doc_ready(function() { 
    console.log("redaktilo.when_doc_ready...:" +  location.href);
    window.onbeforeunload = function() {
      // tro malfrue uzante Ajax!
      if (this.document.getElementById('r:redaktilo'))
        store_preferences();
    }  
  });
  */
/*
  // eksportu publikajn funkction
  return {
    preparu_red: preparu_red,
    preparu_menu: preparu_menu,
    get_preference: get_preference,
    submetoj_stato: submetoj_stato,
    klavo: klavo,
    load_ref: load_ref,
    fs_toggle: fs_toggle,
    rantaurigardo: rantaurigardo,
    shablono: shablono,
    store_preferences: store_preferences,
    store_art: store_art
  };*/
};
