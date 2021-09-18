function Xmlarea(ta_id, onAddSub) {
    this.txtarea = document.getElementById(ta_id);
    //this.structure_selection = document.getElementById(struc_sel);
    this.xmlteksto = ''; // la tuta teksto
    this.xml_elekto = undefined; // aktuale redaktata subteksto
    this.strukturo = []; // la listo de subtekstoj [komenco,fino,nomo]
    this.onaddsub = onAddSub;
    this.synced = true;

    this.re_stru = {
      _elm: /[ \t]*<((?:sub)?(?:art|drv|snc))[>\s]/g,
      _eoe: />[ \t]*\n?/g,
      _mrk: /mrk\s*=\s*"([^>"]*?)"/g,
      _kap: /<kap>([^]*)<\/kap>/,
      _var: /<var>[^]*<\/var>/g,
      _ofc: /<ofc>[^]*<\/ofc>/g,
      _fnt: /<fnt>[^]*<\/fnt>/g,
      _tl1: /<tld\s+lit="(.)"[^>]*>/g,
      _tl2: /<tld[^>]*>/g
    }

    this.indents = {
      art: "", subart: "\u00a0", drv: "\u22ef ", subdrv: "\u22ef\u22ef ", 
      snc: "\u22ef\u22ef\u22ef ", subsnc: "\u22ef\u22ef\u22ef\u22ef "
    }
};

Xmlarea.prototype.setText = function(xml) {
  this.xmlteksto = xml;  
  //this.txtarea.value = xml;
  // kreu strukturliston
  this.structure();      
  // elektu la unuan (art)
  this.xml_elekto = this.strukturo[0];
  this.txtarea.value = this.xmlteksto.slice(this.xml_elekto.de,this.xml_elekto.al);
  this.resetCursor();   
}

// ekstraktas strukturon de art/subart/drv/subdrv/snc/subsnc el la artikolo
Xmlarea.prototype.structure = function(selected = undefined) {
  const re_stru = this.re_stru;
  const xmlteksto = this.xmlteksto;

  function mrk(elm,de,ghis) {
    re_stru._mrk.lastIndex = de;
    const mrk = re_stru._mrk.exec(xmlteksto);
    if (mrk && mrk.index < ghis) {          
      return (elm != 'art'? 
        mrk[1].substring(mrk[1].indexOf('.')+1) 
        : (mrk[1].slice(mrk[1].indexOf(':')+2,-20)) || '<nova>')
    }
  }

  function kap(elm,de,ghis) {
    if (elm == 'drv') {
      // find kap
      const drv = xmlteksto.substring(de,ghis);
      const mk = drv.match(re_stru._kap); 
      //re_stru._kap.lastIndex = de;
      if (mk) {
        const kap = mk[1]
        .replace(re_stru._var,'')
        .replace(re_stru._ofc,'')
        .replace(re_stru._fnt,'')
        .replace(re_stru._tl1,'$1~')
        .replace(re_stru._tl2,'~')
        .replace(/\s+/,' ')
        .replace(',',',..')
        .trim();  // [^] = [.\r\n]

        return kap;
      }
    };
  }

  function id(subt) {
    const rx = /[^A-Za-z]/g;
    const key = [111,222,33,44]; // ne tro gravas...
    var xor_str = function(str)
    { 
        var c = key;
        for(i=0; i<str.length; i++) { 
            c[i%key.length] ^= str.charCodeAt(i);
        }
        return c.join('.');
    }

    if (subt.mrk) {
      return xor_str(subt.mrk)
    } else {
      return xor_str(xmlteksto.substr(subt.de,120).replace(rx,''))
    }
  }


  function al(elm,de) {
    // trovu la finon de elemento 'elm'
    var fin = xmlteksto.indexOf('</'+elm, de);
    // trovu avance >..\n?
    re_stru._eoe.lastIndex = fin;
    const eoe = re_stru._eoe.exec(xmlteksto);
    if (eoe && eoe.index) fin = eoe.index + eoe[0].length;

    return fin;
  }

  this.strukturo = [];
  while (m = re_stru._elm.exec(xmlteksto)) {
    var subt = {de: m.index};
    // kiom da linioj antaŭ tio?
    subt.el = m[1];
    subt.ln = count_char(xmlteksto,'\n',0,m.index);
    subt.al = al(subt.el,m.index+5);

    subt.mrk = mrk(subt.el,subt.de,subt.al);
    subt.kap = kap(subt.el,subt.de,subt.al);
    subt.id = id(subt);

    //const id = el_id(m[1], m.index+5, fino);
    const suff = subt.kap ? subt.kap : subt.mrk||'';
    subt.dsc = this.indents[subt.el] + (
      subt.el!='art'? 
        subt.el+ (suff?':'+suff:'') 
        : suff);

    // console.debug(subt.de + '-' + subt.al + ': ' + subt.id + ':' + subt.dsc);

    if (this.onaddsub) this.onaddsub(subt,this.strukturo.length,subt.id == selected);
    this.strukturo.push(subt);
    //sel_stru.append(make_element('option',{value: strukturo.length-1},item));
  }

  // aldonu ankoraŭ elektilon por la tuta XML
  const tuto = {de: 0, ln: 0, al: xmlteksto.length, id: "x.m.l", dsc: 'tuta xml-fonto'};
  if (this.onaddsub) this.onaddsub(tuto,this.strukturo.length,tuto.id == selected);
  this.strukturo.push(tuto);
}

// aktualigas la tekstbufron per la redaktata subteksto kaj
// la struktur-liston
Xmlarea.prototype.sync = function(select = undefined) {
  if (this.xml_elekto) {
    const old_id = this.xml_elekto.id;
    const nstru = this.strukturo.length;

    console.debug("SYNC "+this.xml_elekto.id+": "+this.xml_elekto.de+"-"+this.xml_elekto.al
      +"("+(this.xml_elekto.al-this.xml_elekto.de)+") <- "+this.txtarea.value.length);
      /*
    console.debug("Sd:"+this.xmlteksto.substr(this.xml_elekto.de-20,20));
    console.debug("Sa:"+this.xmlteksto.substr(this.xml_elekto.al,20));
    */

    this.xmlteksto = 
      (this.xmlteksto.substring(0, this.xml_elekto.de) 
      + this.txtarea.value 
      + this.xmlteksto.substring(this.xml_elekto.al));
    // rekalkulu la strukturon pro ŝovitaj pozicioj...
    this.structure(select);

    // aktualigu la elekton 
    this.xml_elekto = this.strukturo[0]; // fallback
    for (e of this.strukturo) {
      if (e.id == select) {
        this.xml_elekto = e;
        break;
      }
    }

    // se ni ne retrovas la antaŭan id, ekz. ĉar @mrk ŝanĝiĝis aŭ snc aldoniĝis....
    // ni devos aktualigi XML en la redaktilo per la nuna id (ekz-e <art>...</art>)
    if (old_id != this.xml_elekto.id || nstru != this.strukturo.length)
      // nun ni montras la celatan XML-parton por redaktado
      this.txtarea.value = this.xmlteksto.slice(this.xml_elekto.de,this.xml_elekto.al);

    this.synced = true;
  }
}

// redonu la markon de la aktuala subteksto, aŭ la markon de parenco, se ĝi ne havas mem
Xmlarea.prototype.getCurrentMrk = function() {
  if (this.xml_elekto.mrk) {
    return this.xml_elekto.mrk;
  } else {
    // trovu la elektitan subtekston en la strukturlisto
    const s = this.strukturo;
    for (i in s) {
      if (s[i].id == this.xml_elekto.id) {
        // iru la liston supren kaj trovu plej proksiman derivaĵon 
        // (kiu devige havas markon)
        for (j=i-1; j>0; j--) {
          if (s[j].el == 'drv') return s[j].mrk
        }
        // ni estas ĉe la 0-a elemento (art), sed ŝajne ne trovis derivaĵon, 
        // tio povas okazi ekz-e ĉe subart
        return ''; 
      }
    }
  }
}

Xmlarea.prototype.syncedXml = function() {
  if (! this.synced) this.sync(this.xml_elekto.id); 
  return this.xmlteksto;
}

// elektas parton de la XML-teksto por redakti nur tiun
//  laŭbezone sekurigas la nune redaktatan parton...
Xmlarea.prototype.changeSubtext = function(id) {
  if (id) {
    // ni unue sekurigu la aktuale redaktatan parton...
    this.sync(id); // ni transdonas ankaŭ la elektotan id por navigi tien en la elekto-listo
    
    // ni trovu la celatan subtekston per ĝia nomo, ĉar eble la numeroj ŝanĝiĝis...
    this.xml_elekto = this.strukturo[0]; // se ni ne trovos la celatan, ekz-e ĉar marko aŭ enhavo snc-aldono...) ŝanĝiĝis
        // ni montro simple la unua subtekston, t.e. la artikolon
    
    // nun serĉu...
    for (e of this.strukturo) {
      if (e.id == id) {
        this.xml_elekto = e;
        break;
      }
    }

    // komparu kun SYNC...
    console.debug("CHNG "+this.xml_elekto.id+": "+this.xml_elekto.de+"-"+this.xml_elekto.al
      +"("+(this.xml_elekto.al-this.xml_elekto.de)+")");

    // nun ni montras la celatan XML-parton por redaktado
    this.txtarea.value = this.xmlteksto.slice(this.xml_elekto.de,this.xml_elekto.al);
    // iru al la komenco!
    this.resetCursor();
    this.scrollPos(0);
  }
}

Xmlarea.prototype.scrollPos =  function(pos) {
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
    else /*if (document.body)*/
      return document.body.scrollTop;
  }
},

Xmlarea.prototype.position = function() {
  const loff = this.xml_elekto? this.xml_elekto.ln : 0;

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
    return({line: loff+lines, pos: pos});
  }

  //...
  var pos;
  var txtarea = this.txtarea;
  if('selectionStart' in txtarea) {
    pos = txtarea.selectionStart;
  } else if('selection' in document) {
    txtarea.focus();
    var sel = document.selection.createRange();
    var selLength = document.selection.createRange().text.length;
    sel.moveStart('character', -txtarea.value.length);
    pos = sel.text.length - selLength;
  }
  return get_line_pos(pos,txtarea.value);
};


Xmlarea.prototype.selection = function(insertion,p_kursoro=0) {
  //var txtarea = document.getElementById('r:xmltxt');
  var txtarea = this.txtarea;
  var range;
  var startPos;
  txtarea.focus();

  if (typeof insertion == "string") { // enmetu tekston ĉe la markita loko
    if (document.selection && document.selection.createRange) { // IE/Opera
      range = document.selection.createRange();
      range.text = insertion;  
      range.select();   
    } else {
      startPos = txtarea.selectionStart;
      txtarea.value = 
        txtarea.value.substring(0, startPos) +
        insertion +
        txtarea.value.substring(txtarea.selectionEnd, txtarea.value.length);
      if (p_kursoro>-1) {
        // movu la kursoron al startPost+p_kursoro
        txtarea.selectionStart = startPos + p_kursoro;
        txtarea.selectionEnd = txtarea.selectionStart;
      } else {
        // movu la kursoron post la aldonita teksto
        txtarea.selectionStart = startPos + insertion.length;
        txtarea.selectionEnd = txtarea.selectionStart;
      }
    }
    // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
    // se la klavaro ne estas tuŝita...:
    this.synced = false;

  } else { // redonu la markitan tekston
    if (document.selection && document.selection.createRange) { // IE/Opera
      range = document.selection.createRange();
      return range.text;  
    } else { // Mozilla
      startPos = txtarea.selectionStart;
      var endPos = txtarea.selectionEnd;
      return txtarea.value.substring(startPos, endPos); 
    }
  }
},

Xmlarea.prototype.indent = function(indent) {
  //var txtarea = document.getElementById('r:xmltxt');
  var txtarea = this.txtarea;
  var selText;
  var startPos;

  if (typeof indent == "number") { // enŝovu

    if (document.selection  && document.selection.createRange) { // IE/Opera
      alert("enŝovado por malnova retumilo IE aŭ Opera ne funkcias.");
    } else if (txtarea.selectionStart || txtarea.selectionStart==0) { // Mozilla

      //save textarea scroll position
      var scrollPos = this.scrollPos();

      //get current selection
      txtarea.focus();
      startPos = txtarea.selectionStart;
      //if (startPos > 0) {
      //  startPos--;
      //}
      var endPos = txtarea.selectionEnd;
      //if (endPos > 0) {
      //  endPos--;
      //}
      selText = txtarea.value.substring(startPos, endPos);
      if (selText=="") {
        alert("Marku kion vi volas en-/elŝovi.");
      } else {
        var nt;
        if (indent == 2)
          nt = selText.replace(/\n/g, "\n  ");
        else 
          nt = selText.replace(/\n  /g, "\n");

        this.selection(nt);
        // txtarea.value = txtarea.value.substring(0, startPos)
        //       + nt
        //       + txtarea.value.substring(endPos, txtarea.value.length);
        // txtarea.selectionStart = startPos+1;
        // txtarea.selectionEnd = startPos + nt.length+1;

        //restore textarea scroll position
        this.scrollPos(scrollPos);
      }
    } 
    // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
    // se la klavaro ne estas tuŝita...:
    this.synced = false;

  } else { // eltrovu la nunan enŝovon
    indent = 0;
    var linestart;

    if (document.selection  && document.selection.createRange) { // IE/Opera
      var range = document.selection.createRange();
      range.moveStart('character', - 200); 
      selText = range.text;
      linestart = selText.lastIndexOf("\n");
      while (selText.charCodeAt(linestart+1+indent) == 32) {indent++;}
    } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
      startPos = txtarea.selectionStart;
      linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
      while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+indent) == 32) {indent++;}
    }
    return (str_repeat(" ", indent));  
  }
},

Xmlarea.prototype.charBefore = function() {
  //var txtarea = document.getElementById('r:xmltxt');
  var txtarea = this.txtarea;
  if (document.selection  && document.selection.createRange) { // IE/Opera  
    txtarea.focus();
    var range = document.selection.createRange();
    range.moveStart('character', - 1); 
    return range.text;
  } else {
    var startPos = txtarea.selectionStart;
    txtarea.setSelectionRange(startPos-1,startPos);
    return txtarea.value.substring(startPos - 1, startPos);
  }
},

// iru al la komenco de la redaktejo kaj fokusu ĝin.
Xmlarea.prototype.resetCursor = function() { 
  var txtarea = this.txtarea;
  if (txtarea.setSelectionRange) { 
      txtarea.focus(); 
      //txtarea.setSelectionRange(0, 0); // problemo en Chrome?
      txtarea.selectionStart = 0;
      txtarea.selectionEnd = 0;
  } else if (txtarea.createTextRange) { 
      var range = txtarea.createTextRange();  
      range.moveStart('character', 0); 
      range.select(); 
  } 
  txtarea.focus();
};