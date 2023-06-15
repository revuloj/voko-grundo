
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
      var self = this;
  
      // unuafoje ŝargu la tutan liston el XML-dosiero
      if (! Object.keys(self.codes).length) {
        var codes = {};
  
        HTTPRequest('GET', this.url, {},
          function() {
              // Success!
              var parser = new DOMParser();
              var doc = parser.parseFromString(this.response,"text/xml");
        
              for (var e of Array.from(doc.getElementsByTagName(self.xmlTag))) {
                  var c = e.attributes['kodo']; // jshint ignore:line
                  //console.log(c);
                  codes[c.value] = e.textContent;
              } 
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