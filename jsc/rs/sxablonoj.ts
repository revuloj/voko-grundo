
// (c) 2017  - 2023 ĉe Wolfram Diestel
// laŭ GPL 2.0

import * as u from '../u';

/**
 * Ŝablonoj por enmeti dialogenhavon en XML
 */
export const xml_sxablonoj: u.StrObj = {
  art:
  ':<?xml version="1.0"?>\n' +
  ':<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">\n\n' +
  ':<vortaro>\n' +
  ':  <art mrk="$Id$">\n' +
  ':    <kap>\n' +
  ':      <rad>{rad}</rad>/{fin}\n' +
  ':    </kap>\n'+
  ':\n' +
  ':<drv mrk="{dos}.0{fin}">\n'+
  ':  <kap><tld/>{fin}</kap>\n' +
  ':  <snc>\n' +
  ':    <dif>\n'+
  ':      {dif}:\n' + 
  ':      <ekz>!!!ekzemplo kun fonto!!!</ekz>\n' + 
  ':    </dif>\n' + 
  ':    <trd lng="de">??? germana traduko ???</trd>\n' + 
  ':    <trd lng="en">??? angla traduko ???</trd>\n' + 
  ':    <trd lng="fr">??? franca traduko ???</trd>\n' + 
  ':  </snc>\n' +        
  ':</drv>\n' +
  ':\n' +
  ':  </art>\n'+
  ':</vortaro>\n',

  drv:
  ':<drv mrk="{mrk}">\n' +
  ':  <kap>\n' +
  ':    {kap}\n' +
  ':  </kap>\n' +
  ':  <snc>\n' +
  ':    <dif>\n' +
  ':      {dif}:\n' +
  ':      <ekz>!!!ekzemplo kun fonto!!!</ekz>\n' +
  ':    </dif>\n' +
  ':  </snc>\n' +
  ':  <trd lng="de">??? germana traduko ???</trd>\n' +
  ':  <trd lng="en">??? angla traduko ???</trd>\n' +
  ':  <trd lng="fr">??? franca traduko ???</trd>\n' +
  ':</drv>\n' +
  ':\n',

  snc:
  ':<snc mrk="{mrk}">\n' +
  ':  <dif>\n' +
  ':    {dif}:\n' +
  ':    <ekz>!!!ekzemplo kun fonto!!!</ekz>\n' +
  ':  </dif>\n' +
  ':  <trd lng="de">??? germana traduko ???</trd>\n' +
  ':  <trd lng="en">??? angla traduko ???</trd>\n' +
  ':  <trd lng="fr">??? franca traduko ???</trd>\n' +
  ':</snc>\n',

  ref:
  '!tip        :<ref cel="{cel}">{enh}</ref>\n' +
  'tip && !lst :<ref tip="{tip}" cel="{cel}">{enh}</ref>\n' +
  'lst         :<ref tip="{tip}" lst="voko:{lst}" cel="{cel}">{enh}</ref>\n',

  refgrp:
  '    :<refgrp tip="{tip}">\n' +
  'lst :  <ref lst="voko:{lst}" cel="{cel}">{enh}</ref>,\n' +
  '!lst:  <ref cel="{cel}">{enh}</ref>,\n' +
  '    :</refgrp>\n'  ,

  fnt:
  '                   :<fnt>\n' +
  'bib                :  <bib>{bib}</bib>\n' +
  'aut                :  <aut>{aut}</aut>\n' +
  'vrk && url         :  <vrk><url ref="{url}"\n' +
  'vrk && url         :      >{vrk}</url></vrk>\n' +
  'vrk && !url        :  <vrk>{vrk}</vrk>\n' +
  '!vrk && lok && url :  <lok><url ref="{url}"\n' +
  '!vrk && lok && url :      >{lok}</url></lok>\n' +
  '!vrk && !lok && url:  <lok><url ref="{url}"\n' +
  '!vrk && !lok && url:      >{url}</url></lok>\n' +
  'lok && !url        :  <lok>{lok}</lok>\n' +
  'lok && vrk && url  :  <lok>{lok}</lok>\n' +
  '                   :</fnt>;\n',

  ekz:
  ':<ekz>\n' +
  ':  {frazo}\n' +
  ':  {fnt}\n' +
  ':</ekz>\n',

  rim:
  '   :<rim>\n' +
  '   :  {rim}\n' +
  'aut:  <aut>{aut}</aut>\n' +
  '   :</rim>\n',

  adm:
  '   :<adm>\n' +
  '   :  {rim}\n' +
  'aut:  <aut>{aut}</aut>\n' +
  '   :</adm>\n',

  bld:
  '        :<bld\n' +
  'url     :  lok="{url}"\n' +
  'prm     :  prm="{prm}"\n' +
  'lrg     :  lrg="{lrg}"\n' +
  '        :  >{frazo}\n' +
  'aut||fnt:    <fnt>\n' +
  'aut     :      <aut>{aut}</aut>\n' +
  'fnt     :      <lok><url ref="{fnt}"\n' +
  'fnt     :          >{fnt_dec}</url></lok>\n' +
  'aut||fnt:    </fnt>\n' +
  '        :</bld>\n'
};

export const html_sxablonoj = {
  vrk:
  'vrk && url : <a href="{url}" target="_new">{vrk}</a>\n' +
  'vrk && !url: {vrk}\n',
  
  bib:
  'bib && url : <a href="{url}" target="_new">{bib}</a>\n' +
  'bib && !url: {bib}\n',

  vrk_title:
  'aut        : {aut}:\n' +
  'vrk && lok : {vrk},\n' +
  'vrk && !lok: {vrk}\n' +
  'lok        : {lok}\n',

  bib_title:
  'bib && vrk : {bib}, {vrk}\n' +
  'bib && !vrk : {bib}, {bib_text}\n',

  dt_trovo:
  '       :<dt>{prompt} <span class="trovo_titolo">\n' +
  'url    :  <a href="{url}" target="_new" >{title}</a>\n' +
  '!url   :  {title}\n' +
  '       :  </span>\n' +
  '       :  <button id="k_{id}"/>\n' +
  '       :  <button id="r_{id}"/>\n' +
  'enm_btn:  <button id="e_{id}"/>\n' +
  '       :</dt>\n',

  dt_trovo_cit:
  '       :<dt>{prompt} <span class="trovo_titolo">\n' +
  '       :  {title}\n' +
  '       :  </span>\n' +
  '       :  <button id="k_{id}"/>\n' +
  '       :  <button id="r_{id}"/>\n' +
  'enm_btn:  <button id="e_{id}"/>\n' +
  '       :</dt>\n',

  dd_trovo_bld:
  ':<table><tr><td>\n' +
  ':  <a href="{original}" target="_new"><img src="{thumbnail}"/></a>\n' +
  ':</td><td>{t_html}</td></tr></table>\n',

  err_msg:
  '             :<li\n' +
  'id           :id="{id}"\n' +
  'cls          :class="{cls}"\n' +
  'line && pos  :value="{line}:{pos}"\n' +
  'line && !pos :value="{line}"\n' +
  '!line && !pos:value="=)"\n' +
  'line         :title="linio {line}"\n' +
  '             :>{msg}</li>'
};

/*
if (bib) {
  if (vrk||fnt.aut||fnt.lok) {
    var result =
     bib + ', ' + (fnt.aut? fnt.aut +': ' : '') + vrk + (fnt.lok? ', ' + fnt.lok : '');
  } else {
    //var bib_src = $( "#ekzemplo_bib" ).autocomplete( "option", "source" );
    var result = bib + ', ' +  bib_text(bib_src,fnt.bib);
  }
} else {
  var result =
  (fnt.aut? fnt.aut +': ' : '') + vrk + (fnt.lok? ', ' + fnt.lok : '');       
}
*/


// ŝablonoj por novaj sencoj
export const snc_sxablonoj: u.StrObj =
{
ĉefurbo: 
`  <snc mrk="xxx.B0o.cxefurbo">
    <uzo tip="fak">GEOG</uzo>
    <uzo tip="fak">POL</uzo>
    <dif>
      <ref tip="lst" cel="urb.cxef0o" lst="voko:ĉefurboj">Ĉefurbo</ref> 
      kaj la plej granda urbo 
      de {r:<ref tip="malprt" cel="x.X0ujo">X-ujo</ref>}
      {s:(99˚99'E, 55˚55'N)}; 
      ĉe la bordoj de la riverego {r:<ref cel="r.R0o">Rivero</ref>}:
      {e:<ekz>...</ekz>}
    </dif>
  </snc>`,

lando:
`  <snc mrk="xxx.B0ujo.lando">
    <uzo tip="fak">GEOG</uzo>
    <uzo tip="fak">POL</uzo>
    <dif>
      <ref tip="lst" lst="voko:ŝtatoj" cel="sxtat.0o">Ŝtato</ref> situanta en
      {s:okcidenta} {r:<ref tip="malprt" cel="euxrop1.E0o">Eŭropo</ref>}
      kun ĉefurbo {r:<ref tip="prt" cel="brusel.B0o.urb">Bruselo</ref>}
      kaj limanta 
      norde al {r:<ref tip="vid" cel="nederl.N0o">Nederlando</ref>}, 
      oriente al {r:<ref tip="vid" cel="german1.G0ujo">Germanujo</ref>}, 
      sude al {r:<ref tip="vid" cel="franc.F0ujo">Francujo</ref>}
      kaj okcidente al {r:<ref tip="vid" cel="mar.Norda_M0o">Norda Maro</ref>}.
      </dif>
      {r:<ref tip="sin" cel="belgi.B0o">Belgio</ref>}
  </snc>`,

persono:    
`  <snc mrk="xxx.P0o.persono">
    <uzo tip="fak">PERS</uzo>
    <dif>
      Nacilingve: <trd lng="xx">{s:Pasteur}
      <klr tip="ind">({s:Louis})</klr></trd>, 
      {s:1822-1895};
      {s:franca sciencisto, fondinto} de
      {r:<ref tip="vid" cel="mikrob1.0o">mikrobiologio</ref>},
      kaj {s:inventinta/proponinta/... metodon de}
      {r:<ref tip="vid" cel="pasteuxriz.0o">pasteŭrizo</ref>}:
      {e:<ekz>...</ekz>}
    </dif>
  </snc>`,

rivero:    
`  <snc>
    <uzo tip="fak">GEOG</uzo>
    <dif>
      {r:<ref tip="malprt" cel="azi.OkcidentaA0o">Okcident-Azia</ref>}
      <ref tip="lst" cel="river.0o" lst="voko:riveroj">rivero</ref>,
      fluanta el {s:Turkujo}
      tra {s:Irako} 
      en {s:la Persan Golfon}:
      {e:<ekz>...</ekz>}
    </dif>
  </snc>`,

urbo: 
`  <snc mrk="xxx.B0o.urbo">
    <uzo tip="fak">GEOG</uzo>
    <dif>
      {s:X-landa}
      <ref tip="lst" cel="urb.0o" lst="voko:urboj">urbo</ref>
      en {s:la ...subŝtato/regiono...} {r:<ref tip="malprt" cel="r.R0ujo">Regujo</ref>},
      {s:grava foira urbo jam de la 12a jc}:
      {e:<ekz>...</ekz>}
    </dif>
  </snc>`,

vegetaĵo:    
`  <snc mrk="krizan.0o.BOT">
    <uzo tip="fak">BOT</uzo>
    <dif>
      {r:<ref tip="lst" cel="genr.0o.BIO" lst="voko:botanikaj_genroj">Genro</ref>}
      el familio de {r:<ref tip="lst" lst="voko:asteroparencoj" cel="astera.0oj">asteracoj</ref>},
      (<trd lng="la">{s:Chrysanthemum}</trd>),
      {s: botanika priskribo ...., ĝardene kultivata ktp}:
      {e:<ekz>...</ekz>}
    </dif>
  </snc>`
};
