/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';
import {XmlRedakt} from '../x';

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


export function xml_nova(art: string): string {
  return `<?xml version="1.0"?>\n<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">\n<vortaro>\n<art mrk="\$Id\$">\n<kap>\n    <rad>${art}</rad>/o <fnt><bib>FNT</bib></fnt>\n</kap>\n<drv mrk="${art}.0o">\n  <kap><tld/>o</kap>\n  <snc mrk="${art}.0o.SNC">\n    <uzo tip="fak"></uzo>\n    <dif>\n      <tld/>o estas:\n      <ekz>\n        ...\n        <fnt><bib></bib>, <lok></lok></fnt>\n      </ekz>\n    </dif>\n  </snc>\n  <trd lng=""></trd>\n</drv>\n</art>\n</vortaro>\n`;
}

/**
 * Enmetas XML-tekston per aplikata ŝablono.
 * 
 * @memberof redaktilo
 * @inner
 * @param {string} shabl - la nomo de la XML-ŝablono
 */
export function insert_xml(shabl: string, xmlarea: XmlRedakt) {
  //var txtarea = document.getElementById('r:xmltxt');
  //var selText;

  const pos = xmlarea.rulpozicio;
  const selText = xmlarea.elekto||'';
  var [text,p_kursoro,p_lines] = shablono(shabl,selText);
  const indent = xmlarea.enŝovo||'';
  // se $_ aperas ie, ni devos
  // addicii indent.length * (#linioj ĝis $_ -1)
  xmlarea.elektenmeto(
    text.replace(/\n/g,"\n"+indent),
    p_kursoro + p_lines*indent.length);
  if (pos) xmlarea.rulpozicio = pos;
}

  