
/* 
 * (c) 2021-2023 ĉe Wolfram Diestel
 *
 * Provizas metodojn por redakti la XML-dokumenton de Revo-artikolo, inkl. kontrolo,
 * navigado al eraraj linioj ks
 */

/// import {str_repeat, type LinePos} from './util';
/// import {indent,get_indent,get_line_pos} from './tekstiloj';
// import { XmlStrukt, SDet } from './xmlstrukt';
import * as u from '../u';
import * as xs from './xmlstrukt';
import { SDet } from './xmlstrukt';
import { XmlTrad, TList, Lingvo, XPlace } from './xmltrad';
import { Tekst, Klavar } from '../ui';

/**
 * Administras la redaktatan tekston tiel, ke eblas redakti nur parton de ĝi, t.e. unuopan derivaĵon, sencon ktp.
 */
export class XmlRedakt extends Tekst {

  /**
   * Retrovas XmlRedakt-objekton alkroĉitan al elemento
   * @param element la elemento aŭ ties CSS-elektilo
   * @returns 
   */
  static xmlredakt(element: HTMLElement|string) {
    let x = super.obj(element);
    if (x instanceof XmlRedakt) return x;
  }

  public radiko: string;

  /// public xmlstruct: XmlStrukt; // la tuta teksto
  //public aktiva: Strukturero; // aktuale redaktata subteksto

  //public txtarea: HTMLInputElement; // la <textarea> kun la momente redaktata teksto
  public xmltrad: XmlTrad; // por redaktado de tradukoj
  private onaddsub: Function;
  private post_subtekst_elekto: Function;

  protected _ŝanĝnombro: number; // nombro de tekstŝanĝoj, post certa nombro da ŝanĝoj ni povas aŭtomate konservi
  private fonkonservo: number; // aŭtomata fona konservo post tiom da ŝanĝoj; <=0: neniam
  //private synced: boolean; // por scii, ĉu ni devos konservi la videblan (redaktatan) tekstparton
  public antaŭrigardo_sinkrona: boolean; // por scii, ĉu la lasta antaŭrigardo estas aktuala

  // bezonataj regulesprimoj
  private static re_xml = {
    finspacoj: /[ \t]+\n/g,
    trolinioj: /\n\n\n+/g,
    _rad: /<rad>([^<]+)<\/rad>/,
    _dos: /<art\s+mrk="\$Id:\s+([^\.]+)\.xml|<drv\s+mrk="([^\.]+)\./,
  };
  
  private static re_txt = {
    _tl0: new RegExp('<tld\\s*\\/>','g'),
    _tld: new RegExp('<tld\\s+lit="([^"]+)"\\s*/>','g'),
    _comment: new RegExp('\\s*<!--[^]*?-->[ \\t]*','g'),
    _trdgrp: new RegExp('\\s*<trdgrp[^>]*>[^]*?</trdgrp\\s*>[ \\t]*','g'),
    _trd: new RegExp('\\s*<trd[^>]*>[^]*?</trd\\s*>[ \\t]*','g'),
    _fnt: new RegExp('\\s*<fnt[^>]*>[^]*?</fnt\\s*>[ \\t]*','g'),
    _ofc: new RegExp('\\s*<ofc[^>]*>[^]*?</ofc\\s*>[ \\t]*','g'),
    _gra: new RegExp('\\s*<gra[^>]*>[^]*?</gra\\s*>[ \\t]*','g'),
    _uzo: new RegExp('\\s*<uzo[^>]*>[^]*?</uzo\\s*>[ \\t]*','g'),
    _mlg: new RegExp('\\s*<mlg[^>]*>[^]*?</mlg\\s*>[ \\t]*','g'),
    _frm: new RegExp('<frm[^>]*>[^]*?</frm\\s*>','g'),
    _adm: new RegExp('\\s*<adm[^>]*>[^]*?</adm\\s*>[ ,\t]*','g'),
    _aut: new RegExp('\\s*<aut[^>]*>[^]*?</aut\\s*>[ ,\t]*','g'),
    _xmltag: new RegExp('<[^>]+>','g'),
    _lineno: new RegExp('^(?:\\[\\d+\\])+(?=\\[\\d+\\])','mg'),
    _nom: new RegExp('<nom[^>]*>[^]*?</nom\\s*>','g'),
    _nac: new RegExp('<nac[^>]*>[^]*?</nac\\s*>','g'),
    _esc: new RegExp('<esc[^>]*>[^]*?</esc\\s*>','g')
  };

  static re_drv = {
    _lbr: new RegExp('\n','g'),
    _mrk: new RegExp('<drv\\s+mrk\\s*=\\s*"([^"]+)"', ''),
    _kap: new RegExp('<drv[^>]+>\\s*<kap>([^]*)</kap>', ''),
    _var: new RegExp('<var>[^]*</var>','g'),
    _ofc: new RegExp('<ofc>[^]*</ofc>','g'),
    _fnt: new RegExp('<fnt>[^]*</fnt>','g'),
    _tl1: new RegExp('<tld\\s+lit="(.)"[^>]*>','g'),
    _tl2: new RegExp('<tld[^>]*>','g')
  };

  static re_mrk = {
    _rad: new RegExp('<rad>([^<]+)</rad>',''),
    _dos: new RegExp('<art\\s+mrk="\\$Id:\\s+([^\\.]+)\\.xml|<drv\\s+mrk="([^\\.]+)\\.',''),
    _mrk: new RegExp('\\smrk\\s*=\\s*"([^"]+)"','g'),
    _snc: new RegExp('<snc\\s*>\\s*(?:<[^>]+>\\s*){1,2}([^\\s\\.,;:?!()]+)','g')
  };

  static re_klr = {
    _klr: new RegExp('<klr>\\.{3}</klr>','g')
  };

  

/**
 * @param ta_id - La HTML-Id de la koncerna textarea-elemento en la HTML-paĝo
 * @param post_aldono - Revokfunkcio, vokata dum analizo de la strukturo ĉiam, kiam troviĝas subteksto.  Tiel eblas reagi ekzemple plenigante liston per la trovitaj subtekstoj (art, drv, snc...)
 * @param post_subtekst_elekto - Revokfunkcio, vokata dum interne kaŭzia elekto de alia subteksto. Ekz-e aldono de nova <drv> 
 */  
  constructor(textarea: HTMLElement|string, 
    post_aldono?: (s: SDet, index: number, kiel_aktiva: boolean) => void, 
    post_subtekst_elekto?: (s: SDet) => void,
    poziciŝanĝo?: (e: Event) => void,
    tekstŝanĝo?: (e: Event) => void,
    fonkonservo = 20) 
    {
    super(textarea,{
      analizo: xs.struktur_analizo,
      post_aldono: post_aldono,
      poziciŝanĝo: poziciŝanĝo,
      tekstŝanĝo: tekstŝanĝo
    })
    /* this.txtarea = document.getElementById(ta_id) as HTMLInputElement;
     this.txtarea.addEventListener("input",() => { this.setUnsynced(); });
     this.txtarea.addEventListener("change",() => { this.setUnsynced(); });
    */

    // superŝargu tekstŝanĝo
    /*
    if (tekstŝanĝo instanceof Function)
        this.opcioj.tekstŝanĝo = (event: Event) => {
            this._ŝanĝo(event);
            tekstŝanĝo(event);
        };
    else 
        this.opcioj.tekstŝanĝo = (event: Event) => {
            this._ŝanĝo(event);
        };   
        */

    this.fonkonservo = fonkonservo; 

    // registru reagojn klavojn Tab, Retro, X
    this.klavreagoj();

    // permesi alŝovon de XML-teksto el dosiero
    this._on({
      dragover: this._dragOver,
      drop: this._drop
    });

    //this.structure_selection = document.getElementById(struc_sel);
    //this.xmlstruct = new XmlStrukt('',post_aldono); // la tuta teksto
    this.xmltrad = new XmlTrad(this); // por redaktado de tradukoj

    /*
    this.aktiva = undefined; // aktuale redaktata subteksto
    this.onaddsub = post_aldono;
    */
    this.post_subtekst_elekto = post_subtekst_elekto;
    /// this.synced = true;
    this.antaŭrigardo_sinkrona = false; // por scii, ĉu la lasta antaŭrigardo estas aktuala...
  }


  /**
   * Redonas kompletan XML-tekston post eventuala sikronigo
   */
  get teksto(): string {
    /// super set/get ne funkcias en ES5 kun TypeScript:
    /// return super.teksto;
    // ni helpas nin provizore per rekta akiro de 'get teksto' el la prototipo de Tekst:
    const super_teksto = Object.getOwnPropertyDescriptors(Tekst.prototype).teksto.get;
    if (super_teksto) return super_teksto.call(this);
    else throw "Grava programeraro. Ni ne povas ricevi tekston en XmlRedakt!";
  }

  /**
   * Metas la kompletan XML-tekston laŭ la argumento 'xml' kaj aktualigas la strukturon el ĝi
   * @param xml 
   */
  set teksto(xml: string) {
    /// this.xmlstruct = new XmlStrukt(xml,this.onaddsub);  
    function trovu_radikon(): string|undefined {
      const mr = xml.match(XmlRedakt.re_xml._rad);

      if (mr) {
        const rad = mr[1]
        .replace(/\s+/,' ')
        .trim();  // [^] = [.\r\n]
    
        return rad;
      }  
    }
    
    /// super set/get ne funkcias en ES5 kun TypeScript:
    /// super.teksto = xml;
    // ni helpas nin provizore per rekta akiro de 'set teksto' el la prototipo de Tekst:
    const super_teksto = Object.getOwnPropertyDescriptors(Tekst.prototype).teksto.set;
    if (super_teksto) super_teksto.call(this,xml);
    else throw "Grava programeraro. Ni ne povas meti tekston en XmlRedakt!";

    this.radiko = trovu_radikon()||''; /// xs.radiko(this);
    // elektu la unuan (art)
    // this.elekto = this.xmlstruct.strukturo[0];
    // this.txtarea.value = this.xmlstruct.getSubtext(this.elekto);
    this.antaŭrigardo_sinkrona = false;
    this.kursoro_supren();  

    this._ŝanĝnombro = 0;
  };


  /**
   * La radiko de la kapvorto, kiel eltrovita dum strukturanalizo.
   * @returns Redonas la radikon de la artikolo (t.e. la kapvorto sen finaĵo)
   */
  /*
  getRadiko(): string {
    return this.xmlstruct.radiko;
  };
  */


  _dragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    event./*originalEvent.*/dataTransfer.dropEffect = 'copy';
  };

  // legu artikolon el muse alŝovita teksto
  _drop(event: DragEvent) {
      const el = this.element; //$(event.target);
      const art = this;

      event.stopPropagation();
      event.preventDefault();
      var file = event./*originalEvent.*/dataTransfer?.files[0]; // first of Array of all files
      if ( file && file.type.match(/.xml/) ) {
          var reader = new FileReader();
          reader.onload = function(ev) { 
              // when finished reading file data.
              const xml: string = ev.target?.result as string;
              // el.val(xml);
              /// const xmlarea = art.opcioj.xmlarea;
              art.teksto = xml;
              art.opcioj.reĝimo = 'redakto';
          };
          // start reading the file data.
          reader.readAsText(file); 
      }       
  };

  /**
   * Redonas la dosiernomon ekstraktitan el mrk-atributo de art- aŭ drv-elemento
   * @returns la dosiernomo
   */
  get dosiero(): string|undefined {
    /// return xs.art_drv_mrk(this);
    var match = this.teksto.match(XmlRedakt.re_xml._dos);
    if (match) return (match[1]? match[1] : match[2]);
  };

  /**
   * Saltas al la aktuala derivaĵo (laŭ mrk) en la antaŭrigardo (#...)
   */
  saltu() {
    // const mrk = this.xmlstruct.getMrk(this);
    const mrkhava = this.subteksto_havanta('mrk') as SDet;
    if (mrkhava && mrkhava.el != 'art') {
      const mrk = mrkhava.mrk;
      if (mrk && mrk.indexOf(',v') == -1) {
        window.location.hash = this.dosiero+'.'+mrk;
      } else {
        window.location.hash = '';
        // tio lasas malplenan '#', se ni volus forigi tion ankaŭ ni povus uzi
        // history.pushState("", document.title, window.location.pathname);
      }
    }
  }; 

  /**
   * Aktualigas la tekstbufron per la redaktata subteksto, ankaŭ aktualigas la struktur-liston
   * @param select - se donita, la strukturelemento kun 
   * tiu .id estos poste la elektita, se ĝi aldone havas .ln, .el tiuj povus esti
   * uzataj por retrovi subtekston, kies .id ŝanĝiĝis, ekz-e pro aldono/ŝanĝo de mrk...
   */
  /*
  sync(select?: SId) {
    if (this.elekto) {
      console.debug("<<< sinkronigo <<<");
      // try {
      //   console.debug(new Error().stack.split("\n")[2]);
      // } catch(e) { };

      const old_s = this.elekto;    
      const nstru = this.xmlstruct.strukturo.length;

      if (!select) select = this.elekto;

      // unue ni legas la aktuale redaktatan subtekston kaj enŝovas en la kompletan
      // tio ankaŭ rekreas la strukturon de subtekstoj!
      // ni memoras la longecon de la nova subteksto, ĉar se ĝi entenas pli ol la ĉefan elementon, ekz-e finan
      // komenton, ni devas evit duobliĝon per aktualigo ankaŭ de la montrata subteksto
      const xml =  this.txtarea.value;
      const len = xml.length;
      this.xmlstruct.replaceSubtext(this.elekto,xml,select.id);

      // nun retrovu la elektendan subtekston en la rekreita strukturo

      // trovu laŭ id (tbs = to be selected)
      let tbs = this.xmlstruct.getStructById(select.id);

      if (tbs) {
        this.elekto = tbs;
      // se ni ne trovis la subtekston per sia id, sed ĝi estas la
      // sama, kiun ni ĵus redaktis, eble la marko ŝanĝiĝis
      // aŭ aldoniĝis snc/drv, ni provu trovi do per .ln kaj .el
      } else if (select.id == old_s.id) {
        tbs = this.xmlstruct.findStruct(select);
        if (tbs) this.elekto = tbs;
      };
      
      // se tute ne retrovita, ni elektas la unuan subtekston (art)
      if (!tbs) {
        this.elekto = this.xmlstruct.strukturo[0]; 
      }

      // se ni transiris al alia subteksto, aŭ aldoniĝis io post ĝi, aŭ eĉ tuta strukturero, 
      // ni devos ankoraŭ montri la novelektitan/ŝanĝitan subtekston en Textarea
      if (old_s.id != this.elekto.id 
        || old_s.ln != this.elekto.ln
        || len != (this.elekto.al - this.elekto.de)
        || old_s.el != this.elekto.el
        || nstru != this.xmlstruct.strukturo.length) {
        // nun ni montras la celatan XML-parton por redaktado
        this.txtarea.value = this.xmlstruct.getSubtext(this.elekto);
      }
      this.synced = true;
    }
  };
  */


  /**
   * Redonas la tutan XML-tekston post eventuala sinkronigo kun la aktuala redakto
   * @returns la tuta sinkronigita XML-teksto
   */
  /*
  syncedXml(): string {
    if (! this.synced) this.sync(this.elekto); 
    return this.xmlstruct.xmlteksto;
  };
  */

  /**
   * Redonas la tutan XML-tekston post eventuala sinkronigo kaj iom
   * da normaligo, forigi troajn malplenajn liniojn kaj spacsignojn en linifinoj...
   */
  normalizedXml(): string {
    return (this.teksto
      .replace(XmlRedakt.re_xml.finspacoj,"\n")
      .replace(XmlRedakt.re_xml.trolinioj,"\n\n"));
  }


  /**
   * Malvalidigas la sinkron-flagon por signi, ke venontfoje necesas sinkronigo de Xml 
   * resp. rekrei antaŭrigardon
   */
  malsinkrona() {
    this.sinkrona = false;
    this.antaŭrigardo_sinkrona = false;
  }


  /**
   * Elektas (alian) parton de la XML-teksto por redakti nur tiun.
   * Laŭbezone sekurigas la nune redaktatan parton...
   * @param id - la identigilo de la subteksto
   */
  /*
  changeSubtext(id: string, sync=true) {
    if (id) {
      console.debug("<<< ŝanĝu subtekston "+id+" <<<");

      // ni unue sekurigu la aktuale redaktatan parton...
      if (sync) this.sync({id:id}); // ni transdonas ankaŭ la elektotan id por navigi tien en la elekto-listo
      
      //// ni trovu la celatan subtekston per ĝia id... 

      // apriore, por la kazo, ke ni ne trovos la celatan, ekz-e ĉar marko aŭ enhavo snc-aldono...) ŝanĝiĝis,
      // ni antaŭelektas al la unuan (art)
      this.elekto = this.xmlstruct.strukturo[0]; 
          // ni montro simple la unua subtekston, t.e. la artikolon
      
      // nun serĉu...
      const tbs = this.xmlstruct.getStructById(id);
      if (tbs) {
        this.elekto = tbs;
      }

      // komparu kun SYNC...
      //console.debug("CHNG "+this.xml_elekto.id+": "+this.xml_elekto.de+"-"+this.xml_elekto.al
      //  +"("+(this.xml_elekto.al-this.xml_elekto.de)+")");

      // nun ni montras la celatan XML-parton por redaktado
      this.txtarea.value = this.xmlstruct.getSubtext(this.elekto);
      // iru al la komenco!
      this.resetCursor();
      this.scrollPos(0);

      if (this.onselectsub) this.onselectsub(this.elekto);
    }
  };
  */


  /**
   * Iras al pozicio indikita per "<line>:[<lpos>]"
   * kaj informas la elektilon, ke eble la subteksto ŝanĝiĝis
   * @param line_pos - linio kaj eventuala pozicio en la linio kiel teksto
   * @param len - se donita, tiom da signoj ĉe la indikita poizico estos markitaj,
   *                  se ne donita unu signo estos elektita
   */
  iru_al(line_pos: string, len:number = 1) {
    const akt = this.aktiva.id;
    super.iru_al(line_pos,len);

    if (akt != this.aktiva.id && this.post_subtekst_elekto)
      this.post_subtekst_elekto(this.aktiva);
  }

  /**
   * Elektas la parton identigeblan per 'mrk' por redaktado.
   * Laŭbezone antaŭe sekurigas la nune redaktatan parton...
   * @param mrk 
   * @param sync 
   */
  ekredaktu_subtekst_mrk(mrk: string, sync=true) {
    /// const s = this.xmlstruct.getStructByMrk(mrk);

    // forigu prefikson de mrk kaj poste serĉu la koncernan subtekston
    const p = mrk.indexOf('.');
    if (p) {
      const ms = mrk.slice(p+1);
      const s = this.trovu_subtekst_info((t) => (t as SDet).mrk == ms);
      if (s) {
        this.ekredaktu(s.id,sync);
        if (this.post_subtekst_elekto) this.post_subtekst_elekto(this.aktiva);
      }
    }
  }


  /**
   * registra klavreagojn
   */
  klavreagoj() {
    const klv = new Klavar(this.element);

    // TAB
    klv.aldonu("Tab",(event) => {
      event.preventDefault(); 

      const elekto = this.elekto||'';

      // se pluraj linioj estas elektitaj
      if (elekto.indexOf('\n') > -1) {
          // enŝovo
          if (event.shiftKey == false)
              this.enŝovo = 2;
          else
              this.enŝovo = -2;
      
      // elekto nur ene de unu linio
      } else if ( !elekto ) {
          // traktu enŝovojn linikomence...
          const before = this.signo_antaŭ();
          if (before == '\n') {
              const indent = this.enŝovo_antaŭ(-1) || '  ';
              this.elektenmeto(indent); 
          } else if (before == ' ') {
              const indent = '  ';
              // aldonu du spacojn
              this.elektenmeto(indent);
          }
      }
    });

    // RETRO
    klv.aldonu("Backspace",(event) => {
      if (! this.elekto) { // aparta trakto nur se nenio estas elektita!
        const spacoj = this.linisignoj_antaŭ();
        if (spacoj && spacoj.length > 0 && Tekst.nur_spacoj(spacoj) && 0 == spacoj.length % 2) { 
            // forigu du anstataŭ nur unu spacon
            event.preventDefault(); 

            const pos = this.signo();
            if (pos) {
                this.elektu(pos-2,2); //selectRange(xmlarea.txtarea,pos-2, pos);
                this.elektenmeto('');     
            }
        }
      }
    });

    // RET: aldonu enŝovon (spacojn) komence de nova linio
    klv.aldonu("Enter",(event) => {
      const scrollPos = this.rulpozicio;        
      const indent = this.enŝovo;
      this.elektenmeto("\n"+indent);
      if (scrollPos) this.rulpozicio = scrollPos;
      event.preventDefault();
    });

    // X aŭ x --- uzu xklavar/XTajpo!
    /*
    klv.aldonu("KeyX",(event) => {
      // PLIBONIGU: tion movu al reaktilo.ts, ĉar xmlRedakt ne sciu
      // pri la butono r:cx; aŭ aldonu ŝaltilon "boolean" tie ĉi
      // kaj permesu interligi ĝin per butono (revokfunkcie)
      var cx = document.getElementById("r:cx") as HTMLInputElement;
      if (event.altKey) {	// shortcut alt-x  --> toggle cx
        cx.value = ""+(1-parseInt(cx.value) || 0);
        console.log("cx "+cx.value);
        event.preventDefault();

      } else if (!event.ctrlKey && !event.metaKey) {
  
        if (cx.value != "1") return true;

        //var txtarea = document.getElementById('r:xmltxt');
        const scrollPos = this.rulpozicio;
        const selText = this.elekto;

        if (selText != "") return true;

        var before = this.signo_antaŭ()||'';
        var nova = cxigi(before, event.keyCode);

        if (nova != "") {
          //range.text = nova;
          this.elektenmeto(nova,-1);
          
          if (scrollPos) this.rulpozicio = scrollPos;
          event.preventDefault();
        }          
      }
    });*/

  }


  /**
   * Iras al pozicio indikita per "<line>:[<lpos>]"
   * @param line_pos - linio kaj eventuala pozicio en la linio kiel teksto
   * @param len - se donita, tiom da signoj ĉe la indikita poizico estos markitaj,
   *                  se ne donita unu signo estos elektita
   */
  /*
  goto(line_pos: string, len:number = 1) {
    //const re_line = this.re_stru._line;
    
      // kalkulu la signoindekson por certa linio
      function pos_of_line(xml: string, line: number): number {
        let pos = 0;
        let lin = 0;

        while (lin < line) {
          pos = xml.indexOf('\n',pos)+1;
          lin++;
        }

        return pos;
      };

    const p = line_pos.split(":");
    const line = +p[0] || 1;
    const lpos = +p[1] || 1;

    if (! this.synced) this.sync(this.elekto); 
    const sub = this.xmlstruct.getLastStructWithLine(line);

    const xml = this.xmlstruct.getSubtext(sub);
    const pos = pos_of_line(xml,line-sub.ln-1) + ( lpos>0 ? lpos-1 : 0 );

    this.changeSubtext(sub.id,true);
    this.select(pos,0); // rulu al la pozicio
    this.select(pos,len); // nur nun marku <len> signojn por pli bona videbleco
  };
  */

  /**
   * Redonas la aktualan kapvorton, se ene de drv t.e. ties kapvorton, alie la kapvorton de la unua drv
   * en la artikolo
   * @returns la kapvorton, tildo estas anstataŭigita per la radiko, variaĵoj post komo forbalaita
   */
  get aktuala_kap(): string|undefined {
    //return this.xmlstruct.getClosestKap(this.aktiva)
    const rad = this.radiko;

    function kap(e: SDet) {
      return (e.kap||'')
        .replace('~',rad)
        .replace(/[,.*]/,'');
    }

    const kaphava = this.subteksto_havanta('kap') as SDet;
    if (kaphava.el != 'art' && kaphava.id != "x.m.l") {
        return kap(kaphava);
    } else { // prenu kapvorton de unua drv
      for (let s of this._partoj) {
        if (s["el"] == 'drv') {
          return (kap(<SDet>s));
        }
      }
    }
  };


  /**
   * Redonas kolektitajn tradukojn el this.xmltrad
   */
  tradukoj(): { [lng: string]: TList } {
    return this.xmltrad.tradukoj;
  }

  /**
   * Kolektas ĉiujn tradukojn en donita XML-teksto
   * @param xml - la XML-teksto
   * @param shallow - true: ni serĉas nur en la unua strukturnivelo, false: ni serĉas
   * @param normalize - true: ni forigas ofc, klr, ind el la traduko, false: ni ne tuŝas ĝian strukturon
   */
  kolektu_tradukojn_xml(xml: string, shallow: boolean=false, normalize: boolean=false) {
    if (!xml) {
      xml = this.redakt_teksto||'';
      // KOREKTU: fakte ni nun kolektas en {<lng>: [trdj]}
      // do ĝuste estus this.tradukoj = {} aŭ this.tradukoj[lng] = [] !?
    }

    this.xmltrad.kolektu_xml(xml,shallow,normalize);
  };


  /**
   * Kolektas ĉiujn tradukojn en la aktuale redaktata XML-subteksto.
   * La rezulto estos poste en la listo xmltrad.tradukoj[lng]
   */
  kolektu_ĉiujn_tradukojn() {
    let xml = this.redakt_teksto;
  
    // kolektu unue la tradukojn profunde en la aktuala subteksto
    this.xmltrad.preparu();
    this.xmltrad.kolektu_xml(xml,false,true); // profunde, normigu

    // se temas pri subdrv, snc, subsnc ni kolektu ankaŭ de la parencoj,
    // ĉar ekz-e la traduko de drv validas ankaŭ por ĉiu ena snc...
    let p = this.patro(this.aktiva);
    while ( ['snc','subdrv','drv'].indexOf(p["el"])>-1 ) {
      xml = this.subteksto(p);
      this.xmltrad.kolektu_xml(xml,true,true); // malprofunde, normigu
      p = this.patro(p);
    }
  };


  /**
   * Aldonas al la momente aktiva subteksto tradukon de donita lingvo en la konvena loko 
   * (alfabete inter la aliaj tradukoj kaj etendante tradukgrupojn se jam ekzistas traduko(j) 
   * de tiu lingvo en la teksto)
   * @param lng - la lingvokodo
   * @param trd - la aldonenda traduko
   */
  aldonu_trad_lng(lng: Lingvo, trd: string) {
    //if (! this.synced) this.sync(this.elekto); 

    const xml = this.redakt_teksto;

    const place = this.xmltrad.trovu_trd_lokon(xml,lng); // this.getCurrentLastTrd(lng);
    if (place) {
      // se jam estas .trd, ni anstataŭigu ĝin per la etendita trdgrp...,
      // alie ni enmetos novan trd (len=0)
      const len = place.trd? place.trd.length : 0;
      this.elektu(place.pos, len);
      const ind = this.enŝovo;

      // jam estas trdgrp?
      if (place.grp && place.trd) {
        // aldonu novan tradukon antaŭ '</trdgrp'
        const pos = place.trd.indexOf('</trdgrp');
        const nov = place.trd.substring(0,pos) + ',\n'
          + ind + '  <trd>' + trd +'</trd>'
          + place.trd.substring(pos+1);
        console.debug(' --> '+nov);
        this.elektenmeto(nov);
      } else if (place.trd) {
        // ni havas ĝis nun nur unu trd, kaj devas krei trdgrp nun
        const nov = 
          '<trdgrp lng="'+lng+'">\n'
          + ind + '  <trd>' + place.itr + '</trd>,\n'
          + ind + '  <trd>' + trd + '</trd>\n'
          + ind + '</trdgrp>';
        console.debug(' --> '+nov);
        this.elektenmeto(nov);
      } else {
        // antaŭ elementoj (sub)drv/snc ni aldonas du spacojn...
        const iplus = place.elm[0] == 's' || place.elm[0] == 'd' ? '  ' : '';
        // ankoraŭ neniu traduko, aldonu la unuan nun
        const nov = iplus + '<trd lng="' + lng +'">' + trd + '</trd>\n' + ind;
        console.debug(' --> '+nov);
        this.elektenmeto(nov);
      }
    }
  };

  /**
   * Anstataŭigas aŭ aldonas (se ne jam estas iuj) la tradukojn de unu lingvo en subteksto 
   * @param id - .id de la subteksto
   * @param lng - la lingvo
   * @param trdj - listo de novaj tradukoj
   */
  anstataŭigu_trad_lng(id: string, lng: Lingvo, trdj: TList) {
    if (! this.sinkrona) this.sinkronigu(this.aktiva); 
    let xml = this.subteksto({id:id});

    function _indent_at(pos: number): string {
      let ls = xml.lastIndexOf('\n',pos);
      let ind = "";
      if (ls != -1) {
        while (xml[++ls] == " " && ls < pos) ind += " ";
      }
      return ind;
    }

    function _duobla_linirompo_for(pos: number) {
      let p = pos;
      // forigu spacojn antaŭe...
      while ("\t ".indexOf(xml[--p]) >=0) {};
      xml = xml.substring(0,p) + xml.substring(pos);
      
      // forigu spacojn kaj linirompon malantaŭe
      while ("\n\t ".indexOf(xml[++p]) >=0) {
        if (xml[p] == "\n") {
          xml = xml.substring(0,pos) + xml.substring(p+1);
          break;
        }
      }
    }

    const place: XPlace = this.xmltrad.trovu_trd_lokon(xml,lng); // this.getCurrentLastTrd(lng);
    if (place) {
      const len = place.trd? place.trd.length : 0;
      //this.select(place.pos, len);
      const ind = _indent_at(place.pos);
      let nov: string;

      const tf = trdj.filter(t => t.length>0);
      // se estas neniu traduko temas pri forigo
      if (tf.length == 0) {
        nov = '';
        console.debug(' --> FORIGO');

      // se estas unuopa traduko ni metas kiel <trd..>
      } else if (tf.length == 1) {
        nov = '<trd lng="'+lng+'">' + tf[0] +'</trd>' 
          + (!len? '\n'+ind : ''); // alpendigu linirompon kaj enŝovon se antaŭe estis neniu trd
        console.debug(' --> '+nov);
        //this.selection(nov);

      // se estas pluraj ni kreu <trdgrp...>
      } else if (tf.length > 1) {
        nov = '<trdgrp lng="'+lng+'">\n' + ind + '  <trd>';
        nov += tf
          .join('</trd>,\n' + ind + '  <trd>');
        nov += '</trd>\n' + ind + '</trdgrp>'
          + (!len? '\n'+ind : ''); // alpendigu linirompon kaj enŝovon se antaŭe estis neniu trd;
        console.debug(' --> '+nov);
        //this.selection(nov);
      } 

      //if (nov) {
        // anstataŭigi malnovan traduko(j)n per nova(j)
        xml = xml.substring(0,place.pos) + nov + xml.substring(place.pos+len);
        
        // se temas pri tuta forigo, restas du linirompoj, unu antaŭe unu poste
        // ni do testas ĉu post place.pos aperas \n
        // eventuale kun antaŭaj spacsignoj kaj tiam forigas ĝin,
        // same spacsignojn antaŭe place.pos
        if (len && !nov) {
          _duobla_linirompo_for(place.pos);
        }

        // enŝovu la ŝanĝitan subtekston en la kompletan XML-tekston
        // PLIBONIGU: ni ĉiufoje rekalkulas la strukturon post tio,
        // do se ni aldonas tradukojn en pluraj sekcioj ni haltigu
        // la aktualigadon ĝis la lasta...
        /*
        this.xmlstruct.replaceSubtext({id:id},xml,this.aktiva.id);
        */
        this.anstataŭigu(id,xml,this.aktiva.id)
        // aktualigu ankaŭ txtarea, ĉar eble ni aldonis en tiu tradukojn
        // PLIBONIGU: pli bone faru tion nur se montriĝas ĉirkaŭa subteksto
        // aŭ fine, post aldoni ĉiujn tradukojn...
        this.redakt_teksto = this.subteksto(this.aktiva);
      //}
    }
  };

  enmetu_tradukojn() {
    /// const xmlarea = this.opcioj.xmlarea;
    const xmltrad = this.xmltrad;

    this.subtekst_apliku((s) => {
        const s_t = xmltrad.shanghitaj(s.id);
        for (let lng of Object.keys(s_t)) {
            const trd = s_t[lng];
            this.anstataŭigu_trad_lng(s.id,lng,trd);
        }
    });

    this.malsinkrona();
    //this.sinkrona = false; // normale tio devus okazi per evento "change",
             // set foriginte jquery, tio ne plu funkcias kiel antaŭe, ĉar
             // _trigger ne kreas realan retumilan eventon, sed nur reagon laŭ opcioj.    
    //this.element.change();
    this._trigger("change");
  };

  /**
   * Redonas la nmbron de ŝanĝoj faritaj per redaktoj de la teksto
   */
  get ŝanĝnombro() {
      return this._ŝanĝnombro;
  }

  /**
   * Altigas la nombron de ŝanĝoj kaj eventuala fonkonservas la tekston
   */
  _ŝanĝ_kremento() {
      this.sinkrona = false;
      this._ŝanĝnombro++; 

      if (this.opcioj.fonkonservo > 0 
          && 0 == this._ŝanĝnombro % this.opcioj.fonkonservo) 
          this._konservu_fone();   
  }

  /**
   * Konservas la tekston por travivigi la redaktatan tekston 
   * eventualajn kraŝojn aŭ akcidentajn fermojn de la retumilo.
   */
  _konservu_fone() {
    /// const xmlarea = this.opcioj.xmlarea;
    this.konservu("red_artikolo",{
        'nom': this.opcioj.dosiero,
        'red': this.opcioj.reĝimo
        }, "xml");
        /*
    const xml = xmlarea.syncedXml();
    window.localStorage.setItem("red_artikolo",JSON.stringify({
        'xml': xml, //this.element.val(), 
        'nom': this.opcioj.dosiero,
        'red': this.opcioj.reĝimo
    }));*/
  };  

  _tekstŝanĝo(event: Event) {
      this._ŝanĝ_kremento();
      this._trigger("tekstŝanĝo",event,{});
  }

  /**
   * Redonas aŭ metas la aktualan y-koordinaton de la videbla parto de this.xmlarea
   * @param pos - se donita rulas al tiu y-koordinato, se mankas redonu la aktualan
   * @returns la aktuala y-koordinato
   */
  /*
  scrollPos(pos?: number): number {
    var txtarea = this.txtarea;
    if (typeof pos == "number") {
      // set scroll pos
      if (typeof txtarea.scrollTop == "number")  // Mozilla & Co
        txtarea.scrollTop = pos;
      else if (document.documentElement && document.documentElement.scrollTop)
        document.documentElement.scrollTop = pos;
      else if (document.body)
        document.body.scrollTop = pos;
    } else {
      // get scroll pos
      if (txtarea.scrollTop)  // Mozilla
        return txtarea.scrollTop;
      else if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
      else 
        return document.body.scrollTop;
    }
  };
*/

  /**
   * Redonas la aktualan pozicion de la kursoro kiel linio kaj loko ene de la linio 
   * @returns objekto {{line: number, pos: number}}
   */
  /*
  position() {
    const loff = this.elekto? this.elekto.ln : 0;

      // kalkulu el la signoindekso la linion kaj la pozicion ene de la linio
      function get_line_pos(inx: number, text: string): LinePos {
        var lines = 0;
        var last_pos = 0;
        for (let i=0; i<inx; i++) { 
            if (text[i] == '\n') {
                lines++;
                last_pos = i;
            }
        }
        pos = (lines == 0)? inx : (inx-last_pos-1);
        return({ line: loff+lines, pos: pos });
      }

    //...
    let pos: number;
    let txtarea: HTMLInputElement = this.txtarea;
    if('selectionStart' in txtarea) {
      pos = txtarea.selectionStart;
      return get_line_pos(pos, txtarea.value);
    } else 
      throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
  };
  */


  /**
   * Redonas pozicion de kursoro kiel n-ro de signo
   * @returns - la numero de la signo, kie staras la kursoro
   */
  /*
  positionNo(): number {
      const txtarea = this.txtarea;
      let pos = 0;
      if('selectionStart' in txtarea) {
          return txtarea.selectionStart;
      } else 
        throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
  };
  */

  /**
   * Elektas tekstoparton en la redaktata teksto
   * @param pos - la pozicio ekde kie elekti
   * @param len - la nombro de elektendaj signoj
   */
  /*
  select(pos: number, len: number = 0) {
    const txtarea = this.txtarea;

    // ne plu bezonata por aktualaj retumiloj
    // if (document.selection && document.selection.createRange) { // IE/Opera
    //  range = document.selection.createRange();
    //  range.setStart(...);
    //  range.setEnd(...);
    //  range.select();   
    //} else {
      txtarea.selectionStart = pos;
      txtarea.selectionEnd = pos + len;
    //}

    // necesas ruli al la ĝusta linio ankoraŭ, por ke ĝi estu videbla
    const text = txtarea.value;
    const scroll_to_line = Math.max(get_line_pos(pos,text).line - 5, 0);
    const last_line = get_line_pos(text.length-1,text).line;
    this.scrollPos(txtarea.scrollHeight * scroll_to_line / last_line);  
  };
  */

  /**
   * Legas aŭ anstataŭigas la momente elektitan tekston en la redaktata teksto
   * @param insertion - se donita la enmetenda teksto (ĉe la aktuala pozicio aŭ anstataŭ la aktuala elekto)
   * @param p_kursoro - se negativa tiom da signoj ni moviĝas antaŭen antaŭ enmeti la tekston, se pozitiva, tiom da signoj ni movas antaŭen la kursoron post enmeto (ekz-e tekstenŝovo)
   * @returns la momente elektita teksto, se ne estas donita enmetenda teksto
   */
  /*
  selection(insertion?: string, p_kursoro: number = 0): string {
    //var txtarea = document.getElementById('r:xmltxt');
    const txtarea = this.txtarea;
    let startPos: number;
    txtarea.focus();

    if (typeof insertion == "string") { // enmetu tekston ĉe la markita loko
      startPos = txtarea.selectionStart;
      if (p_kursoro < 0) startPos += p_kursoro; // -1: anstataŭigo kun x-klavo forigu la antaŭan literon!
      txtarea.value = 
        txtarea.value.substring(0, startPos) +
        insertion +
        txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
      if (p_kursoro > 0) { // ni antaŭe havis > -1, sed tio ne funkciis por enŝovoj per spacoj
        // movu la kursoron al startPost+p_kursoro, por
        // ekz-e transsalti tekstenŝovon post enmetita snc/ekz/ref
        // vd. redaktilo.insert_xml
        txtarea.selectionStart = startPos + p_kursoro; 
        txtarea.selectionEnd = txtarea.selectionStart;
      } else {
        // movu la kursoron post la aldonita teksto
        txtarea.selectionStart = startPos + insertion.length;
        txtarea.selectionEnd = txtarea.selectionStart;
      }

      // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
      // se la klavaro ne estas tuŝita...:
      this.setUnsynced();

    } else { // redonu la markitan tekston
      startPos = txtarea.selectionStart;
      var endPos = txtarea.selectionEnd;
      return txtarea.value.substring(startPos, endPos); 
    }
  }
  */


  /**
   * Ŝovas la markitan tekston 'indent' signojn dekstren aŭ maldekstren
   * sen argumento 'indent' ĝi eltrovas la enŝovon en la aktuala linio
   * @param ind - la nombro de ŝovendaj spacoj
   * @returns la enŝovo de la aktuala linio (la spacsignoj en ties komenco)
   */
  /*
  indent(ind?: number): string {
    //var txtarea = document.getElementById('r:xmltxt');
    let txtarea = this.txtarea;
    let selText: string;
    let startPos: number;

    if (typeof ind == "number") { // enŝovu
      txtarea.focus();
      // uzu get_indent / indent el tekstiloj
      const i_ = get_indent(txtarea).length;
      if (i_ % 2 == 1) ind = ind/2; // ŝovu nur ±1 (±2/2) ĉe momente nepara enŝovo!
      indent(txtarea,ind);
      // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
      // se la klavaro ne estas tuŝita...:
      this.setUnsynced();

    } else { // eltrovu la nunan enŝovon
      ind = 0;
      let linestart: number;

      if (txtarea.selectionStart || txtarea.selectionStart === 0) { // Mozilla/Chrome
        startPos = txtarea.selectionStart;
        linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
        while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+ind) == 32) {ind++;}
      }
      return (str_repeat(" ", ind));  
    }
  };
  */


  /**
   * Signo antaŭ kursoro
   * @returns la signon antaŭ la kursoro
   */
  /*
  charBefore(): string {
    //var txtarea = document.getElementById('r:xmltxt');
    var txtarea = this.txtarea;
   // Mozilla/Chrome
    var startPos = txtarea.selectionStart;
    //txtarea.setSelectionRange(startPos-1,startPos);
    return txtarea.value.substring(startPos - 1, startPos);
    //}
  };
  */

  // eltrovu la signojn antaŭ la nuna pozicio (ĝis la linikomenco)
  /*
  charsFromLineStart(): string {
    const txtarea = this.txtarea;
    const pos = this.positionNo();
    const val = txtarea.value;
    let p = pos;
    while (p>0 && val[p] != '\n') p--;
    return val.substring(p+1,pos);
  };*/



  /**
   * Metas la kursoron al la komenco de la redaktejo kaj fokusas ĝin
   */
  /*
  resetCursor() { 
    const txtarea = this.txtarea;
    if (txtarea.setSelectionRange) { 
        txtarea.focus(); 
        //txtarea.setSelectionRange(0, 0); // problemo en Chrome?
        txtarea.selectionStart = 0;
        txtarea.selectionEnd = 0;
    } else 
      throw "Malnovaj retumiloj kiel IE ne plu subtenataj!"
   
    txtarea.focus();
  };
  */

  drv_before_cursor() {
    //var line_pos = this.element.getCursorLinePos();

    /// const xmlarea = this.opcioj.xmlarea;
    const line_pos = this.pozicio;

    const drvoj = this.drv_markoj();
    for(let i=drvoj.length-1; i>=0; i--) {
        const drv = drvoj[i];
        if (drv.line < line_pos.lin) {
            return drv;
        }
    }
    // aliokaze redonu la unuan
    return drvoj[0];  // kaŭzas eraron, se troviĝis neniu!
  };

  /**
   * Eltrovas la markojn (mrk=) de derivaĵoj, la korespondajn kapvortojn kaj liniojn.
   * Ni uzas por kontrolo de markoj (rs/ui_err) kaj enmeto de sencoj (rs/ui_dlg -> drv_before_cursor)
   */
  drv_markoj() {
    /// const xmlarea = this.opcioj.xmlarea;
    var xmlStr = this.teksto; //this.element.val();
    var drvoj: Array<any> = [], pos = 0, line = 0;

    if (xmlStr) {
        var drv = xmlStr.split('</drv>');
        var rx = XmlRedakt.re_drv;
        
        for (var i=0; i<drv.length; i++) {
            var d = drv[i];
            // kiom da linioj aldoniĝas?
            var lmatch = d.match(rx._lbr);
            var lcnt = lmatch? lmatch.length : 0;
            // find mrk
            var match = d.match(rx._mrk); 
            if (match) {
                const mrk = match[1];
                const dpos = match.index;
                // count lines till <cnt
                var lmatch2 = d.slice(0,dpos).match(rx._lbr);
                var dline = lmatch2? lmatch2.length : 0;
                // find kap
                match = d.match(rx._kap); 
                if (match) {
                    const kap = match[1]
                    .replace(rx._var,'')
                    .replace(rx._ofc,'')
                    .replace(rx._fnt,'')
                    .replace(rx._tl1,'$1~')
                    .replace(rx._tl2,'~')
                    .replace(',',',..')
                    .trim();  // [^] = [.\r\n]

                    drvoj.push({line: line+dline, pos: pos+dpos, mrk: mrk, kap: kap});
                }
            }
            line += lcnt;
            pos += d.length + '</drv>'.length;
        }
    }
    return drvoj;
  };

  // eltrovas ĉiujn markojn (mrk=) de derivaĵoj, sencoj ktp.
  markoj() {
      /// const xmlarea = this.opcioj.xmlarea;
      var xmlStr = this.teksto; //this.element.val();
      var mrkoj: any = {};

      if (xmlStr) {
          const rx = XmlRedakt.re_mrk;
          let m;
          while ((m = rx._mrk.exec(xmlStr)) !== null) {
              //var matches = xmlStr.match(rx._mrk);
              let m1 = m[1];
              if (mrkoj[m1]) mrkoj[m1] = m.index; else mrkoj[m1] = 1;
          }
      }
      return mrkoj;
  }; 
  
  /**
   * Sencoj sen atributo mrk
   * @returns 
   */
  snc_sen_mrk() {
      /// const xmlarea = this.opcioj.xmlarea;
      var xmlStr = this.teksto; //this.element.val();
      var sncoj: any = {};

      if (xmlStr) {
          const rx = XmlRedakt.re_mrk;
          let m;
          while ((m = rx._snc.exec(xmlStr)) !== null) {
              var mrk = m[1]; // la unua vorto post <snc>... 
              // se dua estas majusklo ni supozas mallongigon, aliokaze ni minuskligas
              if (mrk.length>1 && mrk[1].toLowerCase() == mrk[1]) mrk = mrk.toLowerCase();
              sncoj[m.index] = mrk;
          }
      }
      return sncoj;
  };

  /**
   * Klarigoj el tri punktoj kie mankas []
   */
  klr_ppp() {
      /// const xmlarea = this.opcioj.xmlarea;
      var xmlStr = this.teksto; //this.element.val();
      var klroj: any = {};

      if (xmlStr) {
          const rx = XmlRedakt.re_klr;
          let m;
          while ((m = rx._klr.exec(xmlStr)) !== null) {
              var klr = m[1];
              klroj[m.index] = klr;
          }
      }
      return klroj;
  };


  /**
   * Forigas XML-strukturon lasante nur la nudan tekston
   * krome aldonas lininumeron en la formo [n] komence
   * de ĉiu linio
   */
  plain_text(line_numbers=false) {
      //var radiko = this._radiko;
      const rx = XmlRedakt.re_txt;

      /// const xmlarea = this.opcioj.xmlarea;
      /// const radiko = xmlarea.getRadiko();
      var t = (this.teksto 
          .replace(rx._tl0,this.radiko)
          .replace(rx._tld,'$1'+this.radiko.slice(1)));

      // line numbers?
      if (line_numbers) {
          const lines = t.split('\n');
          t = '';
          let n = 1;
          for (let i = 0; i<lines.length; i++) {
              t += "[" + n + "]" + lines[i] + '\n';
              n++;
          }
      }
          // forigu komentojn
      t = t.replace(rx._comment,'')
          // forigu traukojn
          .replace(rx._trdgrp,'')
          .replace(rx._trd,'')
          // forigu fnt-indikojn
          .replace(rx._fnt,'')
          .replace(rx._ofc,'')
          // forigu gra, uzo, mlg, frm
          .replace(rx._gra,'')
          .replace(rx._uzo,'')
          .replace(rx._mlg,'')
          .replace(rx._frm,'')
          // forigu adm, aut (rim)
          .replace(rx._adm,'')
          .replace(rx._aut,'')
          // forigu nom, nac, esc
          .replace(rx._nom,'')
          .replace(rx._nac,'')
          .replace(rx._esc,'')
          // forigu ceterajn xml-elementojn
          .replace(rx._xmltag,'');
  
      // forigu pluroblajn lini-numerojn post forigo de elementoj
      if (line_numbers) {
          t = t.replace(rx._lineno,'');
      }
      return t;
  };

  /**
   * Transformas la rezulton de plain_text en objekton,
   * kies ŝlosiloj estas la lininumeroj kaj kies
   * valoroj estas la nudaj tekst-linioj
   * (bezonata por vortkontrolo/analizo)
   */
  lines_as_dict(): u.StrObj {
      var lines = this.plain_text(true).split('\n');
      var result: u.StrObj = {};
      for (let i=0; i<lines.length; i++) {
          var line = lines[i];
          var d = line.indexOf(']');
          var no = line.slice(1,d);
          var text = line.slice(d+1);
          if (text.trim().length > 1) {
              result[no] = text;
          }
      }
      return result;
  };

}