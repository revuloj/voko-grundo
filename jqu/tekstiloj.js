
/* jshint esversion: 6 */

/*************************************************************************

// (c) 2008 - 2018 Wolfram Diestel, Wieland Pusch, Bart Demeyere & al.
// laŭ GPL 2.0

*****************************************************************************/

var regex_tld = new RegExp('<tld\\s+lit="([^"]+)"\\s*/>','g');
var regex_xmltag = new RegExp('<[^>]+>','g');

// kalkulu el la signoindekso la linion kaj la pozicion ene de la linio
function get_line_pos(inx,text) {
    var lines = 0;
    var last_pos = 0;
    for (i=0; i<inx; i++) { 
        if (text[i] == '\n') {
            lines++;
            last_pos = i;
        }
    }
    pos = (lines == 0)? inx : (inx-last_pos-1);
    return({line: lines, pos: pos})
}

function replaceTld(radiko,str) {
    return (str
            .replace(/<tld\/>/g,radiko)
            .replace(regex_tld,'$1'+radiko.substr(1)));
}

// elprenu la lingvojn en kiuj ekzistas tradukoj el XML-artikolo
function traduk_lingvoj(xmlStr) {
    var lingvoj = {};
    var xml = xmlStr.replace(/&[a-zA-Z0-9_]+;/g,'?'); // entities cannot be resolved...
    
    try {
        var artikolo = $("vortaro",$.parseXML(xml));
    } catch(e) {
        console.error("Pro nevalida XML ne eblas trovi traduklingvojn.");
        //console.error(e);
        return;
    }
    
    artikolo.find("trd[lng],trdgrp[lng]").each(function(index) {
        lingvoj[$(this).attr('lng')] = true;
    });
    
    return lingvoj;
}

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

function outerXML(xmlNode) {
   try {
      // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
      return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
     try {
        // if XMLSerializer is not supported, old Internet Explorer, but innerHTML.
        return xmlNode.outerHTML;
     }
     catch (e) {  
        //Other browsers without XML Serializer
        alert('Xmlserializer not supported');
     }
   }
   return false;
}


function insert_trd_lng(element,shov,lng,tradukoj) {
    // kunmetu la XML por la tradukoj
    var trdXML = trd_xml_dom(lng,shov,tradukoj);
    
    var old_trd = $(element).children("trd[lng='"+lng+"'],trdgrp[lng='"+lng+"']");
    // se troviĝas jam tradukoj de tiu ĉi lingvo (lng) metu tien la novajn
    if (old_trd.length) {
        //old_trd.replaceWith($(trdXML).find('xml').children);
        replaceChildren(element,old_trd[0],trdXML.childNodes);
        
    // se la tradukoj de tiu ĉi lingvo estas komplete novaj, trovu en kiu loko
    // metu laŭ alfabeto
    } else {
        var lngj = Array();
        $(element).children("trd[lng],trdgrp[lng]").each(function(i,e) {
            lngj.push($(this).attr("lng"))
        });

        // lingvo_post redonas la pozicion (lingvon) antaŭ kiu meti la tradukojn
        var lpost = lingvo_post(lng,lngj);
        if (lpost) {
            var post_trd = $(element).children("trd[lng='"+lpost+"'],trdgrp[lng='"+lpost+"']");
            //post_trd.before(trdStr + '\n' + shov)
            //post_trd.before($(trdXML).find('xml').children)
            beforeChildren(element,post_trd[0],trdXML.childNodes,'','\n' + shov)
        } else {
            // se ne estas lpost, metu kiel lasta elemento
            // unua traduko en tiu elemento aŭ "lng" estas lasta lingvo laŭ alfabeto
            shov = shov.substr(2)
            //$(str2xml(shov + trdStr + '\n' + shov)).appendTo(element);
            //element.appendChild(str2xml(shov + trdStr + '\n' + shov));
            //$(element).append($(trdXML).find('xml').children);
            appendChildren(element,trdXML.childNodes,shov,'\n' + shov);
        }
    }
}

function replaceChildren(element,oldChild,newChildren,wsBefore,wsAfter) {
  if (wsBefore) element.insertBefore(element.ownerDocument.createTextNode(wsBefore),before);
  for (var i=0; i<newChildren.length; i++) {
        element.insertBefore(newChildren[i],oldChild)
  }   
  if (wsAfter) element.insertBefore(element.ownerDocument.createTextNode(wsAfter),before);
  element.removeChild(oldChild);
}

function beforeChildren(element,before,children,wsBefore,wsAfter) {
    if (wsBefore) element.insertBefore(element.ownerDocument.createTextNode(wsBefore),before);
    for (var i=0; i<children.length; i++) {
        element.insertBefore(children[i],before)
    }  
    if (wsAfter) element.insertBefore(element.ownerDocument.createTextNode(wsAfter),before);
}

function appendChildren(element,children,wsBefore,wsAfter) {
    if (wsBefore) element.appendChild(element.ownerDocument.createTextNode(wsBefore));
    for (var i=0; i<children.length; i++) {
        element.appendChild(children[i])
    }
    if (wsAfter) element.appendChild(element.ownerDocument.createTextNode(wsAfter));
}


function trd_xml_dom(lng,shov,tradukoj) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString('<xml></xml>',"text/xml");
    var root = xmlDoc.documentElement;
   // kunmetu la XML por la tradukoj
    if (tradukoj.length == 1 && tradukoj[0]) {
        var trd = root.appendChild(xmlDoc.createElement('trd'));
        trd.setAttribute('lng',lng);
        var nodes = parseTrd(parser,tradukoj[0]);
        for (var t=0; t<nodes.length; t++) {
            var t1 = xmlDoc.importNode(nodes[t],true);
            trd.appendChild(t1)
        }
    } else {
        var trdgrp = xmlDoc.createElement('trdgrp');
        trdgrp.setAttribute('lng',lng);
        trdgrp.appendChild(xmlDoc.createTextNode('\n'));
        for (var i=0; i<tradukoj.length; i++) {
            if (tradukoj[i]) { // evitu malplenajn tradukojn
                var trd = xmlDoc.createElement('trd');
                var nodes = parseTrd(parser,tradukoj[i]);
                for (var t=0; t<nodes.length; t++) {
                    var t1 = xmlDoc.importNode(nodes[t],true);
                    trd.appendChild(t1)
                }
                trdgrp.appendChild(xmlDoc.createTextNode(shov + '  '));
                trdgrp.appendChild(trd);
                var nl = ((i < tradukoj.length-1)? xmlDoc.createTextNode(',\n') : xmlDoc.createTextNode('\n'));
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

function parseTrd(parser, traduko) {
    try {
        var doc = parser.parseFromString('<xml>'+traduko+'</xml>',"text/xml");
        // che eraro enestas elemento "parseerror"
    } catch (e) {
        // IE ĵetas escepton
        if (e.name = 'SyntaxError') {
            throw "Nevalida XML en traduko: " + quoteattr(traduko);
        }
    }
    // aliaj kroziloj redonas HTML kun elemento "parsererror" ene ie
    if (doc.getElementsByTagName("parsererror").length>0) throw "Nevalida XML en traduko: " + quoteattr(traduko);
    return doc.documentElement.childNodes;
}

function lingvo_post(lng,lingvoj) {
    for (var i=0; i<lingvoj.length;i++) {
        if (lingvoj[i] > lng) return lingvoj[i];
    }
    // redonu la lastan lingvon(?)
    // return lingvoj[lingvoj.length-1];
    return null;
}

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
            enshovo = ''
        }
    }
    return enshovo.substr(p-pos);
}

function all_spaces(spaces) {
    var p = 0;
    while (spaces[p] == ' ' && p<spaces.length) p++;
    return p == spaces.length;
}

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

function minuskligo(str, rad='') {
    var str = str.toLowerCase();
    if (rad && rad[0].toLowerCase() != rad[0])
        str = str.replace(/<tld[^\/>]*\/>/,'<tld lit="'+rad[0].toLowerCase()+'"/>');
    return str;
}

function forigu_markup(xml) {
    var t = xml.replace(regex_xmltag,'');
    return t;
}

function linirompo(str, indent=0, linirompo=80) {
    var pos = 0, bpos = 0, lrpos = 0;
    if (indent) {
        ispaces = ' '.repeat(indent);
    } else {
        ispaces =''
    };
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



