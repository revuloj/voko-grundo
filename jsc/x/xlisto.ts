/*
  (c) 2019-2023 ĉe Wolfram Diestel
  laŭ GPL 2.0
*/

import * as u from '../u';

export type ListNomo = "lingvoj" | "fakoj" | "stiloj";
export type ListAldono = (kod: string, nom: string) => {};
export type ListFino = () => {};
/**
 * Kodlistoj agorditaj por Reta Vortaro: lingvoj, fakoj, stiloj
 */
export class RevoListoj {
  public lingvoj: Xlist;
  public fakoj: Xlist;
  public stiloj: Xlist;

  constructor(url_path: string = '/revo/cfg') {
    this.lingvoj = new Xlist('lingvo', url_path + '/lingvoj.xml'),
    this.fakoj = new Xlist('fako',url_path + '/fakoj.xml'),
    this.stiloj = new Xlist('stilo',url_path + '/stiloj.xml')

    // antaŭŝargu
    this.lingvoj.load();  
  }
}

/**
 * Transformas la xml-tekston en dokumentstrukturon kaj
 * elfiltras per elektilo la interesajn elementojn
 */
export function xml_filtro(xml: string, elektilo: string): NodeListOf<Element> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml,"text/xml");
  return doc.querySelectorAll(elektilo);
}

/**
 * Legas Revo-liston kiel lingvoj, fakoj, stiloj por montri 
 * elektilojn en la redaktilo kaj traduki lingvojn en la
 * serĉilo
 */
export class Xlist {
  public codes: { [s: string]: string };
  public load: Function;
  public fill: Function;

 /**
 * @constructor
 * @param {string} xmlTag - la XML-elemento de listero, ĝi havu atributon 'kodo'
 * @param {string} url  - la URL de kie ŝargi la XML-liston
 */
  constructor(public xmlTag: string, public url: string) {
    this.codes = {};
  
    /**
     * Plenigas ion per la kodlisto, vokante 'aldonilo' por ĉiu paro kodo-nomo
     * @param aldonilo - 'id' de HTML-elemento plenigenda per 'option'-elementoj 
     */
    this.fill = function(fine?: ListFino, aldone?: ListAldono) {      
      for (const [kod, nom] of Object.entries(this.codes))
        if (typeof nom == 'string' && aldone)
          aldone(kod,nom);
    };
  
    /**
     * Ŝargas la kodliston de la donita URL.
     * @param {Function} aldonilo - se donita, revokfuncio ald(kodo,nomo) aldonante unuopan listeron al io
     */
    this.load = function(fine?: ListFino, aldone?: ListAldono) {
      let self = this;
      let ŝargante = false;
  
      // unuafoje ŝargu la tutan liston el XML-dosiero
      if (! Object.keys(self.codes).length && !ŝargante) {
        ŝargante = true;
        let codes: {[code: string]: string} = {};
  
        u.HTTPRequest('GET', this.url, {},
          function(xmldata: string) {
              // Success!
              //var parser = new DOMParser();
              //var doc = parser.parseFromString(request.response,"text/xml");
        
              //for (var e of Array.from(doc.getElementsByTagName(self.xmlTag))) {
              xml_filtro(xmldata,self.xmlTag).forEach((e) => {
                  const c = e.attributes.getNamedItem('kodo'); // jshint ignore:line
                  if (c)
                    //console.log(c);
                    codes[c.value] = e.textContent||'';
              });
              self.codes = codes;
              ŝargante = false;
  
              if (aldone) {
                self.fill.call(self,fine,aldone);
              } 
          });
  
      // se ni jam ŝargis iam antaŭe, ni eble nur devas plenigi la videbalan elektilon
      } else if (!ŝargante) {
        if (aldone) {
          self.fill.call(self,fine,aldone);
        } 
      } else {
        throw new Error("Du ŝargoj samtempe ne devas okazi. Necesas adapti la kodon, kiu ŝargigas la liston!");
        // mi evitas ankoraŭ uzi Promise-objekton en la komuna kodo, por subteni ankaŭ
        // iom malnovajn retumilojn en reta-vortaro. Uzante liston en Cetonio ni povas
        // ĝin envolvi en Promise-objekton.
      }
    };  
  }
  
}