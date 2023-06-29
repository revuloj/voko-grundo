/*
  (c) 2019-2023 ĉe Wolfram Diestel
  laŭ GPL 2.0
*/

import * as u from '../u';

export type ListNomo = "lingvoj" | "fakoj" | "stiloj";


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
    this.fill = function(aldonilo: Function) {   
      for (const [kod, nom] of Object.entries(this.codes))
        aldonilo(kod,nom);
    };
  
    /**
     * Ŝargas la kodliston de la donita URL.
     * @param {Function} aldonilo - se donita, revokfuncio ald(kodo,nomo) aldonante unuopan listeron al io
     */
    this.load = function(aldonilo?: Function) {
      let self = this;
  
      // unuafoje ŝargu la tutan liston el XML-dosiero
      if (! Object.keys(self.codes).length) {
        let codes: {[code: string]: string} = {};
  
        u.HTTPRequest('GET', this.url, {},
          function(request: XMLHttpRequest) {
              // Success!
              //var parser = new DOMParser();
              //var doc = parser.parseFromString(request.response,"text/xml");
        
              //for (var e of Array.from(doc.getElementsByTagName(self.xmlTag))) {
              xml_filtro(request.response,self.xmlTag).forEach((e) => {
                  const c = e.attributes.getNamedItem('kodo'); // jshint ignore:line
                  if (c)
                    //console.log(c);
                    codes[c.value] = e.textContent||'';
              });
              self.codes = codes;
  
              if (aldonilo) {
                self.fill.call(self,aldonilo);
              } 
          });
  
      // se ni jam ŝargis iam antaŭw, ni eble nur devas plenigi la videbalan elektilon
      } else {
        if (aldonilo) {
          self.fill.call(self,aldonilo);
        } 
      }
    };  
  }
  
}