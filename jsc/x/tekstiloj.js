
/* jshint esversion: 6 */

/*************************************************************************

// (c) 2008 - 2021 Wolfram Diestel, Wieland Pusch, Bart Demeyere & al.
// laŭ GPL 2.0

*****************************************************************************/

var regex_tld = new RegExp('<tld\\s+lit="([^"]+)"\\s*/>','g');
var regex_xmltag = new RegExp('<[^>]+>','g');


/**
 * Kalkulas el la signoindekso la linion kaj la pozicion ene de la linio
 * @param {number} inx - la pozicio en la teksto (sen konsideri liniojn)
 * @param {string} text - la koncerna teksto
 * @returns la pozicion kiel objekto {{line: number, pos: number}}
 */
function get_line_pos(inx,text) {
    var lines = 0;
    var last_pos = 0;
    for (let i=0; i<inx; i++) { 
        if (text[i] == '\n') {
            lines++;
            last_pos = i;
        }
    }
    const pos = (lines == 0)? inx : (inx-last_pos-1);
    return({line: lines, pos: pos});
}

/**
 * Anstataŭigas XML-tildo-elementojn en teksto per donita radiko. Se la
 * tld-elemento enhavas liter-atributon (majusklo-minusklo-ŝanĝo) tio estas konsiderata
 * @param {string} radiko - la radiko (kapvorto sen finaĵo)
 * @param {string} str - la XML-teksto kun elementoj 'tld' anstataŭigendaj
 * @returns la ŝanĝita teksto
 */
function replaceTld(radiko,str) {
    return (str
            .replace(/<tld\/>/g,radiko)
            .replace(regex_tld,'$1'+radiko.substr(1)));
}

/**
 * Elprenas la lingvojn en kiuj ekzistas tradukoj el XML-artikolo
 * @param {string} xmlStr - la XML-teksto
 * @returns la lingvoj kiel objekto
 */
function traduk_lingvoj(xmlStr) {
    const rx_ent = /&[a-zA-Z0-9_]+;/g;
    const xml = xmlStr.replace(rx_ent,'?'); // entities cannot be resolved...

    let lingvoj = {};
    let artikolo;

    try {
        //var artikolo = $("vortaro",$.parseXML(xml));
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml,"text/xml");
        artikolo = doc.querySelector("vortaro");

    } catch(e) {
        console.error("Pro nevalida XML ne eblas trovi traduklingvojn.");
        //console.error(e);
        return;
    }
    
    //artikolo.find("trd[lng],trdgrp[lng]").each(function(index) {
    //    lingvoj[$(this).attr('lng')] = true;
    //});
    for (let t of artikolo.querySelectorAll("trd[lng],trdgrp[lng]")) {
        const lng = t.getAttribute("lng");
        lingvoj[lng] = true;
    }
    
    return lingvoj;
}

/**
 * Redonas la XML-enhavon de XML-nodo, IE rekte subtenas tion kiel atributo de XmlNode,
 * sed por aliaj retumiloj ni devas seriigi ekstrakti la enhavon forigante la elementokomencon kaj finon
 * @param {Node} xmlNode 
 * @returns la XML-enhavo
 */
function innerXML(xmlNode) {
   try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      var str = (new XMLSerializer()).serializeToString(xmlNode);
      // remove element begin and end tag
      return str.replace(/^<[^>]+>/,'').replace(/<\/[^>]+>$/,'');
  }
  catch (e) {
     try {
        // if XMLSerializer is not supported, old Internet Explorer, but innerHTML.
        return xmlNode.innerHTML;
     }
     catch (e) {  
        //Other browsers without XML Serializer
        alert('XmlSerializer not supported');
     }
   }
   return false;
}


/**
 * Redonas la la XML-kodon de elemento. IE rekte subtenas tian atributon ĉe
 * aliaj retumiloj ne devas seriigi la XML-nodon
 * @param {Node} xmlNode 
 * @returns la XML-enahvo kun la elemento mem
 */
function outerXML(xmlNode) {
   try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
     try {
        // if XMLSerializer is not supported, old Internet Explorer, but outerHTML.
        return xmlNode.outerHTML;
     }
     catch (e) {  
        //Other browsers without XML Serializer
        alert('Xmlserializer not supported');
     }
   }
   return false;
}


/**
 * Enŝovas tradukojn de unu lingvo en XML
 * KOREKTU: ĉar tio uzas jQuery - prefere ŝovu tion al iu dosiero rs/jq_util.js
 * @param {Object} element - la elemento (havanta atributon mrk) en kiu enŝovi la tradukojn (ekz. 'drv')
 * @param {string} shov - la linikomenca enŝovo aplikenda
 * @param {string} lng - la lingvokodo
 * @param {Array<string>} tradukoj - la tradukoj por tiu linggvo
 */
function insert_trd_lng(element,shov,lng,tradukoj) {
    // kunmetu la XML por la tradukoj
    var trdXML = trd_xml_dom(lng,shov,tradukoj);
    
    var old_trd = element.querySelectorAll("trd[lng='"+lng+"'],trdgrp[lng='"+lng+"']");
    // se troviĝas jam tradukoj de tiu ĉi lingvo (lng) metu tien la novajn
    if (old_trd.length) {
        //old_trd.replaceWith($(trdXML).find('xml').children);
        replaceChildren(element,old_trd[0],trdXML.childNodes);
        
    // se la tradukoj de tiu ĉi lingvo estas komplete novaj, trovu en kiu loko
    // metu laŭ alfabeto
    } else {
        var lngj = Array();
        for (let e of element.querySelectorAll("trd[lng],trdgrp[lng]")) {
            lngj.push(e.getAttribute("lng"));
        }

        // lingvo_post redonas la pozicion (lingvon) antaŭ kiu meti la tradukojn
        var lpost = lingvo_post(lng,lngj);
        if (lpost) {
            var post_trd = element.querySelectorAll("trd[lng='"+lpost+"'],trdgrp[lng='"+lpost+"']");
            //post_trd.before(trdStr + '\n' + shov)
            //post_trd.before($(trdXML).find('xml').children)
            beforeChildren(element,post_trd[0],trdXML.childNodes,'','\n' + shov);
        } else {
            // se ne estas lpost, metu kiel lasta elemento
            // unua traduko en tiu elemento aŭ "lng" estas lasta lingvo laŭ alfabeto
            shov = shov.substr(2);
            //$(str2xml(shov + trdStr + '\n' + shov)).appendTo(element);
            //element.appendChild(str2xml(shov + trdStr + '\n' + shov));
            //$(element).append($(trdXML).find('xml').children);
            appendChildren(element,trdXML.childNodes,shov,'\n' + shov);
        }
    }
}

/**
 * Anstataŭigas id-elementon per novaj (ni bezonas tion por la tradukenŝovo)
 * @param {Object} element - la patra elemento en kiu anstataŭigi
 * @param {Object} oldChild - la anstataŭigenda ido
 * @param {Array} newChildren - la novaj id-elementoj
 * @param {string} wsBefore - teksto enŝovenda antaŭe
 * @param {string} wsAfter - teksto enŝovenda poste
 */
function replaceChildren(element,oldChild,newChildren,wsBefore=undefined,wsAfter=undefined) {
  if (wsBefore) element.insertBefore(element.ownerDocument.createTextNode(wsBefore),oldChild);
  for (var i=0; i<newChildren.length; i++) {
        element.insertBefore(newChildren[i],oldChild);
  }   
  if (wsAfter) element.insertBefore(element.ownerDocument.createTextNode(wsAfter),oldChild);
  element.removeChild(oldChild);
}

/**
 * Enŝovas novajn idojn antaŭe
 * @param {Object} element - la patra elemento en kiu enŝovi
 * @param {Object} before - la elemento antaŭ kiu enŝovi
 * @param {Array} children - la aldonendaj idoj
 * @param {string} wsBefore - teksto aldonenda antaŭe
 * @param {string} wsAfter - teksto aldonenda poste
 */
function beforeChildren(element,before,children,wsBefore=undefined,wsAfter=undefined) {
    if (wsBefore) element.insertBefore(element.ownerDocument.createTextNode(wsBefore),before);
    for (var i=0; i<children.length; i++) {
        element.insertBefore(children[i],before);
    }  
    if (wsAfter) element.insertBefore(element.ownerDocument.createTextNode(wsAfter),before);
}

/**
 * Alpendigas idojn.
 * @param {Object} element - la patra elemento
 * @param {Array} children - la novaj idoj
 * @param {string} wsBefore - teksto aldonenda antaŭe
 * @param {string} wsAfter - teksto aldonenda poste
 */
function appendChildren(element,children,wsBefore=undefined,wsAfter=undefined) {
    if (wsBefore) element.appendChild(element.ownerDocument.createTextNode(wsBefore));
    for (var i=0; i<children.length; i++) {
        element.appendChild(children[i]);
    }
    if (wsAfter) element.appendChild(element.ownerDocument.createTextNode(wsAfter));
}


/**
 * Aldonas tradukojn de iu lingvo en la XML-DOM
 * @param {string} lng - la lingvokodo
 * @param {string} shov - la linikomenca enŝovo aplikenda
 * @param {Array<string>} tradukoj - la tradukoj
 * @returns la XML-dokumento kun la aldonitaj tradukoj
 */
function trd_xml_dom(lng,shov,tradukoj) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString('<xml></xml>',"text/xml");
    let root = xmlDoc.documentElement;
   // kunmetu la XML por la tradukoj
    if (tradukoj.length == 1 && tradukoj[0]) {
        let trd = root.appendChild(xmlDoc.createElement('trd'));
        trd.setAttribute('lng',lng);
        let nodes = parseTrd(parser,tradukoj[0]);
        for (let t=0; t<nodes.length; t++) {
            const t1 = xmlDoc.importNode(nodes[t],true);
            trd.appendChild(t1);
        }
    } else {
        let trdgrp = xmlDoc.createElement('trdgrp');
        trdgrp.setAttribute('lng',lng);
        trdgrp.appendChild(xmlDoc.createTextNode('\n'));
        for (let i=0; i<tradukoj.length; i++) {
            if (tradukoj[i]) { // evitu malplenajn tradukojn
                let trd = xmlDoc.createElement('trd');
                let nodes = parseTrd(parser,tradukoj[i]);
                for (let t=0; t<nodes.length; t++) {
                    const t1 = xmlDoc.importNode(nodes[t],true);
                    trd.appendChild(t1);
                }
                trdgrp.appendChild(xmlDoc.createTextNode(shov + '  '));
                trdgrp.appendChild(trd);
                const nl = ((i < tradukoj.length-1)? xmlDoc.createTextNode(',\n') : xmlDoc.createTextNode('\n'));
                trdgrp.appendChild(nl);
            }
        }
        if (trdgrp.childNodes.length>1) { 
            trdgrp.appendChild(xmlDoc.createTextNode(shov));
            root.appendChild(trdgrp);
        }
    }
    return root;
}

/**
 * Transformas la traduktekston al XML-strukturo
 * @param {*} parser - XML-analizilo reuzenda
 * @param {string} traduko - la tradukteksto
 * @returns - la kreita XML-strukturo
 */
function parseTrd(parser, traduko) {
    var doc;
    try {
        doc = parser.parseFromString('<xml>'+traduko+'</xml>',"text/xml");
        // che eraro enestas elemento "parseerror"
    } catch (e) {
        // IE ĵetas escepton
        if (e.name == 'SyntaxError') {
            throw "Nevalida XML en traduko: " + quoteattr(traduko);
        }
    }
    // aliaj kroziloj redonas HTML kun elemento "parsererror" ene ie
    if (doc.getElementsByTagName("parsererror").length>0) throw "Nevalida XML en traduko: " + quoteattr(traduko);
    return doc.documentElement.childNodes;
}


/**
 * Trovas la lingvon, post kiu ni aldonas novan
 * @param {string} lng - la aldonenda lingvo
 * @param {Array<string>} lingvoj - la listo de ekzistantaj lingvoj
 * @returns la lingvo, post kiu enŝovi aŭ null, kiam enŝovi en la fino
 */
function lingvo_post(lng,lingvoj) {
    for (var i=0; i<lingvoj.length;i++) {
        if (lingvoj[i] > lng) return lingvoj[i];
    }
    // redonu la lastan lingvon(?)
    // return lingvoj[lingvoj.length-1];
    return null;
}

/**
 * Redonas la spacsignojn en la fino de la teksto (kutime post la lasta linifino) kiel enŝovo
 * @param {string} text - la teksto
 * @returns  la finspacsignoj de enŝovo
 */
function enshovo(text) {
    // redonu la spacsignojn en la fino de text
    var enshovo = '';
    for (var i=text.length-1;i>-1;i--) {
        if (text[i] == ' ') { 
            enshovo += ' ';
        } else {
            return enshovo;
        }
    }
    return enshovo;
}

/**
 * Redonas la spacsignojn de la enŝovo en la antaaŭ linio
 * @param {string} text - la teksto
 * @param {number} pos - la pozicio antaŭ kiu kolekti spacsignojn
 * @returns la kolektitaj spacsignoj kiel enŝovo
 */
function enshovo_antaua_linio(text, pos) {
    // redonu la spacsignojn en la linio antaŭ pos
    // minus la spacsignojn post pos
    var enshovo = '';
    var p=pos;
    while (text[p] == ' ') p++;
    for (var i=pos-1;i>-1;i--) {
        if (text[i] == ' ') { 
            enshovo += ' ';
        } else if (text[i] == '\n') {
            return enshovo.substr(p-pos);
        } else {
            enshovo = '';
        }
    }
    return enshovo.substr(p-pos);
}

/** Kontrolas ĉu teksto konsistas nur el spacsignoj
 * @param {string} spaces - la teksto
 * @returns true, se la teksto enhavas nur spacojn
 */
function all_spaces(spaces) {
    var p = 0;
    while (spaces[p] == ' ' && p<spaces.length) p++;
    return p == spaces.length;
}

/**
 * Majuskligas la unuajn signojn de ĉiu trovita vorto
 * @param {*} str - la teksto de vortoj
 * @param {*} rad - radiko, se donita ni uzas ties komencliteron por majuskligi ankaŭ tld-elementojn
 * @returns la teksto kun majuskligitaj vortkomencoj
 */
function kameligo(str, rad='') {
    var kamelo = '';
    var vortoj = str.split(' ');
    var komenclitero = rad ? rad.substr(0,1).toUpperCase() : '';
    for (var v=0; v<vortoj.length; v++) {
        if (vortoj[v].startsWith('<tld/>')) {
            kamelo += ' <tld lit="'+ komenclitero + '"/>' + vortoj[v].substr(6);
        } else {
            kamelo += ' ' + vortoj[v].substr(0,1).toUpperCase() + vortoj[v].substr(1).toLowerCase();
        }
    }
    return kamelo.substr(1);
}

/**
 * Minuskligas tekston
 * @param {*} str - la teksto kun la vortoj
 * @param {*} rad - radiko, se donita ni uzas ties unuan minuskligitan literon por minuskligi tld-elementojn
 * @returns la minuskligita teksto
 */
function minuskligo(str, rad='') {
    str = str.toLowerCase();
    if (rad && rad[0].toLowerCase() != rad[0])
        str = str.replace(/<tld[^\/>]*\/>/,'<tld lit="'+rad[0].toLowerCase()+'"/>');
    return str;
}

/**
 * Forigas ĉiujn XML-elementoj el teksto kaj lasas nur la nudan enhavon
 * @param {*} xml - la XML-teksto
 * @returns la nuda enhavo send la XML-elementoj
 */
function forigu_markup(xml) {
    var t = xml.replace(regex_xmltag,'');
    return t;
}

/**
 * Rompas tro lingajn liniojn
 * @param {string} str - la traktenda teksto
 * @param {number} indent - se donita, nombro de spacsignoj aldonendaj ĉe ĉiu nova linio
 * @param {number} linirompo - la maksimuma linilongeco, 80 apriore
 * @returns la teksto kun eventuale aldonitaj linirompoj
 */
function linirompo(str, indent=0, linirompo=80) {
    var pos = 0, bpos = 0, lrpos = 0;
    var ispaces = '';
    if (indent) {
        ispaces = ' '.repeat(indent);
    }
    str = str.replace(/[ \t\n]+/g,' ').trim();
    while (pos < str.length) {
        if (pos - lrpos > linirompo && bpos > lrpos) {
            // la linio estas tro longa, ni rompu ĝin ĉe la lasta blanka spaco,
            // kiu ne aperas komence de linio
            //console.debug('linirompo ĉe pos: '+ bpos + ' pos: ' + pos + ' lrpos: ' + lrpos);
            str = str.substring(0,bpos) + '\n' + ispaces + str.substring(bpos+1);
                    // PLIBONIGU: se sekvas plia spacsignoj inkluzivu ilin en indent...
            lrpos = bpos;
            pos += indent;
        } else if (pos > 0 && str[pos] == ' ' 
          && str[pos-1] != ' ' 
          && str[pos-1] != '\n') {
            bpos = pos;
        } else if (str[pos] == '\n') {
            lrpos = pos;                    
        }
        pos++;
    }
    return str;
}
