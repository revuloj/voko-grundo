/**
 * Mallokaj variabloj. Vi povas aldoni pliajn kaj aliri ilin 
 * per u.agordo.xxx 
 */

export type StrObj = { [key: string]: string };
export type BoolObj = { [key: string]: boolean };


// vd. https://mariusschulz.com/blog/declaring-global-variables-in-typescript
// alternative oni povus uzi alnoton ty-ignore en la malsupraj linioj kiuj uzas MathJax
/// tio ne funkcias: const MathJax = (window as any).MathJax;
declare global {
  const MathJax: any; 
}

export namespace agordo {

// rigardataj kiel konstantoj:
  export const eldono = "2n";
  export const debug = false;

// agordoj pri reta-vortaro.de
  export const revo_url = "reta-vortaro.de";
  export const revo_prefix = "/revo/";
  export const art_prefix = "/revo/art/";
  export const tez_prefix = "/revo/tez/";
  export const dlg_prefix = "/revo/dlg/";
  export const sercho_url = "/cgi-bin/sercxu-json-" + eldono + ".pl";
  export const trad_uwn_url = "/cgi-bin/traduku-uwn.pl";
  export const titolo_url = "titolo-"+ eldono +".html";
  export const redaktilo_url = "redaktilo-"+ eldono +".html";
  export const redaktmenu_url = "redaktmenu-"+   eldono +".html";
  export const inx_eo_url = "/revo/inx/_plena.html";
  export const mx_trd_url = "/cgi-bin/mx_trd.pl";
  export const nombroj_url = "/cgi-bin/nombroj.pl";
  export const mrk_eraro_url = "/cgi-bin/mrk_eraroj.pl";
  export const bib_json_url = "/revo/dok/bibliogr.json";
  export const http_404_url = "/revo/dlg/404.html";
  export const sercho_videblaj = 7;

// aliaj agordoj...
  export const help_base_url = 'https://revuloj.github.io/temoj/';
  export const help_regulesp = 'sercho#ser%C4%89i-per-regulesprimoj';

  export const uwn_url = 'http://www.lexvo.org/uwn/';


// en Cetonio: '../voko/lingvoj.xml'

    // export const hazarda_url = "/cgi-bin/hazarda_art.pl";
    //export const inx_eo_url = "/revo/inx/_eo.html";

// rigardataj kiel variabloj
  export let lingvoj_xml = "../cfg/lingvoj.xml";
  export let preflng = 'en';

}
