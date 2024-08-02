
/* 
 (c) 2020 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

import * as u from '../u';

import * as x from '../x';
import {XmlRedakt} from '../x';

import {revo_listoj} from './shargo';

import {artikolo} from '../a/artikolo';
import {t_red} from './stato';

import {store_preferences,get_preference} from './redk_pref';


  /*************************************************************************
    FUNKCIOJ POR KONTROLADO, ANTAŬRIGARDO KAJ SUBMETO DE REDAKTITA ARTIKOLO
  **************************************************************************/

var _redakto = 'redakto'; // 'aldono' por nova artikolo
export function redakto(rdkt: string) {
    _redakto = rdkt;
}

var _xmlarea: XmlRedakt;
export function xmlarea(xa: XmlRedakt) {
    _xmlarea = xa;
}

const cgi_vokosubmx = '/cgi-bin/vokosubmx.pl';
const cgi_vokohtmlx = '/cgi-bin/vokohtmlx.pl';
const cgi_vokosubm_json = '/cgi-bin/vokosubm-json.pl';
  
const re_lng = /<(?:trd|trdgrp)\s+lng\s*=\s*"([^"]*?)"\s*>/mg; 
const re_fak = /<uzo\s+tip\s*=\s*"fak"\s*>([^]*?)</mg; 
const re_stl = /<uzo\s+tip\s*=\s*"stl"\s*>([^]*?)</mg; 
const re_mrk = /<(drv|snc) mrk="([^]*?)">/mg;

const re_trdgrp = /<trdgrp\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trdgrp/mg;	
const re_trd = /<trd\s+lng\s*=\s*"[^"]+"(?:\s+(?:kod|fnt)\s*=\s*"[^"]+")?\s*>[^]*?<\/trd/mg;	
const re_ref = /<ref([^g>]*)>([^]*?)<\/ref/mg;
const re_refcel = /cel\s*=\s*"([^"]+?)"/m;

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
  function add_err_msg(msg: string, matches?: RegExpExecArray[]) {
    let errors: string[] = [];

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
   * estas validaj. Uzoj de nevalidaj kodoj estas redonataj kiel rezultoj de la regulesprimo
   * @memberof redaktilo
   * @inner
   * @param clist - la nomo de la kodlisto kontraŭ kiu ni kontrolas
   * @param regex - la regulesprimo per kiu ni serĉas la uzojn
   * @returns la listo de nevalidaj koduzoj - kiel trovoj per regulesprimo
   */
  function kontrolu_kodojn(clist: x.ListNomo, regex: RegExp): RegExpExecArray[]|undefined {
    const xml = _xmlarea.teksto; //document.getElementById("r:xmltxt").value;
    const list = revo_listoj[clist];

    let m: RegExpExecArray|null; 
    let invalid: RegExpExecArray[] = [];

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
    var xml = _xmlarea.teksto; // document.getElementById("r:xmltxt").value;
    var m; 
    var errors: string[] = [];
    
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
    const xml = _xmlarea.teksto; //document.getElementById("r:xmltxt").value;
    let m;
    const re_t2 = /(<trd.*?<\/trd>)/g;
    let errors: string[] = [];
    
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
    var xml = _xmlarea.teksto; //document.getElementById("r:xmltxt").value;
    var m; 
    var errors: string[] = [];
    
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
    const xml = _xmlarea.teksto;

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
export function rkontrolo(xmlarea: XmlRedakt) {
    let eraroj = document.getElementById("r:eraroj");
    const art = (document.getElementById("r:art") as HTMLInputElement).value;
    const xml = xmlarea.teksto;

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
export function rkonservo(xmlarea: XmlRedakt) {
    // PLIBONIGU: estas ioma risko ke tiel oni retrovas unuon en la ŝlosilnomo de jam anstataŭigita unuo
    // do eble estus plibone trakuri la tekston signon post signo, ignori dume xml-nomojn sed
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
    const xml = xmlarea.teksto;

    kontrolo_start("kontrolante kaj submetante...")

    // kontrolu loke revenas nur post kontrolo,
    // dum kontrole ene de vokomailx as nesinkrona
    kontrolu_xml_loke(art,xml);

    if (xml.startsWith("<?xml") &&
      // PLIBONIGU: tio estas iom malbela por testi, ĉu estis eraroj
      // enestas ankoraŭ la atendomesaĝo. Do:
      // eble apartigu la atendomesaĝon de la eraroj pli klare
      // uzu abstahitan listo-objekton por eraroj, kiun ni povas demandi pri
      // sia kategoria enhavo
      ! document.getElementById("r:eraroj")?.querySelector("ul")) {
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
        if (rigardo) {
          rigardo.textContent = '';
          rigardo.append(article); 
        }

        // ekipu ĝin per faldiloj ktp., se ne estas 'aldono' ni transdonos
        // ankaŭ la artikolnomon el la kampo #r:art (por tezaŭro kaj piedlinio)
        const r_art = document.getElementById("r:art") as HTMLInputElement;
        const art = _redakto=='redakto'? r_art.value : undefined;
        artikolo.preparu_art(art);

        // saltu en la artikolo al la redaktata parto
        _xmlarea.saltu();


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
    var nova = (_redakto == 'aldono')? "1" : "0";

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
            err_list.textContent?.replace(/\s+/,'') == '') {
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
    