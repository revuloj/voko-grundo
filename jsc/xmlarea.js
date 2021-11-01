function Xmlarea(ta_id, onAddSub) {
    this.txtarea = document.getElementById(ta_id);
    //this.structure_selection = document.getElementById(struc_sel);
    this.xmlteksto = ''; // la tuta teksto
    this.xml_elekto = undefined; // aktuale redaktata subteksto
    this.strukturo = []; // la listo de subtekstoj [komenco,fino,nomo]
    this.tradukoj = {}; // tradukoj trovitaj en la aktuala redaktata subteksto
    this.radiko = '';
    this.onaddsub = onAddSub;
    this.synced = true;

    this.re_stru = {
      _elm: /[ \t]*<((?:sub)?(?:art|drv|snc))[>\s]/g,
      _eoe: />[ \t]*\n?/g,
      _mrk: /mrk\s*=\s*"([^>"]*?)"/g,
      _kap: /<kap>([^]*)<\/kap>/,
      _rad: /<rad>([^<]+)<\/rad>/,
      _var: /<var>[^]*<\/var>/g,
      _ofc: /<ofc>[^]*<\/ofc>/g,
      _klr: /<klr[^>]*>[^]*<\/klr>/g,
      _ind: /<ind>([^]*)<\/ind>/g,
      _fnt: /<fnt>[^]*<\/fnt>/g,
      _tl1: /<tld\s+lit="(.)"[^>]*>/g,
      _tl2: /<tld[^>]*>/g,
      _trd: /^<trd(grp)?\s+lng\s*=\s*["']([a-z]{2,3})['"]\s*>([^]*?)<\/trd\1\s*>$/,
      _tr1: /<trd\s*>([^]*?)<\/trd\s*>/g,
      _tagend: /[>\s]/
    }

    this.indents = {
      art: "", subart: "\u00a0", drv: "\u22ef ", subdrv: "\u22ef\u22ef ", 
      snc: "\u22ef\u22ef\u22ef ", subsnc: "\u22ef\u22ef\u22ef\u22ef "
    }
};

// metas la kompletan XML-tekston laŭ la argumento xml
// kaj aktualigas la strukturon el ĝi
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
  function rad(de,ghis) {
    const art = xmlteksto.substring(de,ghis);
    const mr = art.match(re_stru._rad);

    if (mr) {
      const rad = mr[1]
      .replace(/\s+/,' ')
      .trim();  // [^] = [.\r\n]

      return rad;
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
    subt.no = this.strukturo.length;

    //const id = el_id(m[1], m.index+5, fino);
    const suff = subt.kap ? subt.kap : subt.mrk||'';
    subt.dsc = this.indents[subt.el] + (
      subt.el!='art'? 
        subt.el+ (suff?':'+suff:'') 
        : suff);

    // ĉe la kapvorto de la artikolo ekstraktu la radikon
    if (subt.el == 'art') this.radiko = rad(subt.de,subt.al);

    // console.debug(subt.de + '-' + subt.al + ': ' + subt.id + ':' + subt.dsc);

    if (this.onaddsub) this.onaddsub(subt,this.strukturo.length,subt.id == selected);
    this.strukturo.push(subt);
    //sel_stru.append(ht_element('option',{value: strukturo.length-1},item));

  }

  // en la fino aldonu ankoraŭ elektilon por la tuta XML
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

Xmlarea.prototype.getStructById = function(id) {
  for (let s of this.strukturo) {
    if (s.id == id) return s;
  }
}

Xmlarea.prototype.getSubtextById = function(id) {
  const s = this.getStructById(id);
  return this.xmlteksto.slice(s.de,s.al);
}

// ni trovos la parencon de la struktur-elemento donita per id
Xmlarea.prototype.getParent = function(id) {
  const s = this.getStructById(id);
  // parenco venas antaŭ la nuna kaj enhavas ĝin (subteksto al..de)
  for (var n = s.no-1; n>=0; n--) {
    const p = this.strukturo[n];
    if (p.de < s.de && p.al > s.al ) return p;  
  }
}

Xmlarea.prototype.getClosestWithMrk = function() {
  if (this.xml_elekto.mrk) {
    return this.xml_elekto;
  } else {
    var p = this.getParent(this.xml_elekto.id);
    while (p && p.no > 0) { // ni ne redonos art@mrk (0-a elemento)
      if (p.mrk) return p;
      p = this.getParent(p.id);
    }
  }
}

// redonu la XML-markon (atributo @mrk) de la aktuala subteksto, 
// aŭ la markon de parenco, se ĝi ne havas mem
Xmlarea.prototype.getCurrentMrk = function() {
  const c = this.getClosestWithMrk();
  if (c) return c.mrk;
  return '';
}

// redonu la aktualan kapvorton, se ene de drv t.e. ties kapvorton, 
// alie la kapvorton de la unua drv
Xmlarea.prototype.getCurrentKap = function() {
    function kap(e) {
      return e.kap.replace('~',rad);
    }

  const rad = this.radiko;
  const elekto = this.xml_elekto;
  
  if (elekto.el != 'art' && elekto.id != "x.m.l") {

    if (elekto.kap) {
      return kap(elekto);
    } else {
      var p = this.getParent(elekto.id);
      while (p && p.no > 0) { // ni ne redonos art@mrk (0-a elemento)
        if (p.kap) return kap(p);
        p = this.getParent(p.id);
      }
    }

  } else { // prenu kapvorton de unua drv
    for (s of this.strukturo) {
      if (s.el == 'drv') {
        return (kap(s))
      }
    }
  }
}

// trovas la elemento-komencon (end=false) aŭ finon (end=true) en this.xmlarea
// la unua argumento estas listo de interesantaj elementoj
// se stop_no_match = true, ni haltas ĉe la unua elemento, 
// kiu ne estas en la listo
// La serĉo okazas de la fino!

Xmlarea.prototype.travel_tag_bw = function(elements,end=false,stop_no_match=false,xml,from) {    
  const re_te = this.re_stru._tagend;
  const mark = end? '</' : '<';

  // se mankas unu el la du lastaj argumentoj, uzu apriorajn...
  if (!xml) {
    xml = this.txtarea.value;
  }
  if (from == undefined) {
    from = xml.length;
  }

    // kontrolu ĉu la trovita elemento estas en la listo
    // de interesantaj elementoj
    function match(p) {
      for (e of elements) {
        if ( xml.substr(p,e.length) == e 
          && xml.substr(p+e.length,1).match(re_te) ) return e;
      }
    }

  // trovu krampon < aŭ </
  var pos = xml.lastIndexOf(mark,from-mark.length);

  while (pos > -1 ) {
    const element = match(pos+mark.length);
    if (element) {
      const end = xml.indexOf('>',pos);
      // redonu la trovitan elementon
      return {pos: pos, end: end, elm: element};
    } else {
      if (stop_no_match) return;
    }
    // trovu sekvan krampon < aŭ </
    pos = xml.lastIndexOf(mark,pos-1);
  }
}


/*
// elprenu el la aktuale redaktata subteksto la
// lastan tradukon de 'lng'
Xmlarea.prototype.getCurrentLastTrd = function(lng) {
  const xml = this.txtarea.value;
  const re_trd = this.re_stru._trd;

  var m = re_trd.exec(xml);
  var lastpos = -1; 
  var trd_str = '';
  var trd_grp = false;

  while (m) {
    if (m[2] == lng) {
      lastpos = m.index;
      trd_str = m[0];
      trd_grp = (m[1] == 'grp');  
      
      console.debug(lastpos + ": " + m.join(', '));
    } else if (m[2] < lng) {
      lastpos = m.index + m[0].length
    }
    // serĉu plu
    m = re_trd.exec(xml);
  }

  if (lastpos > -1) return {pos: lastpos, grp: trd_grp, trd: trd_str};

  /// PLIBONIGU:
    oni per regulesprimo povas serĉi nur antaŭen. Eblecoj por plirapidigi la kazon, ke
    la koncerna lingvo jam havas tradukon:
    -> aldonu la lingvon en la regulesprimon por trovi nur tiujn de la koncerna lingvo
    -> serĉu unue nur "<lng>" de malantaŭe en la teksto kaj poste kontrolu, ĉu estas traduko de tiu lingvo (iom malfacile programebla, sed supozeble la plej rapida):
    const pos = Math.max(
      lastIndexOf('"'+lng+'"'),
      lastIndexOf("'"+lng+"'"));
    if (pos > -1) {
      //const sub = xml.substr(pos-12);
      //lookbehind ~: sub.find(/<trd(grp)?\s+lng\s*=\s*["']([a-z]{2,3})["']/)
    }
  ///
}
*/

Xmlarea.prototype.collectTrd = function(lng, xml, shallow=false) {
  const re = this.re_stru;
  if (!xml) {
    xml = this.txtarea.value;
    this.tradukoj = [];
  }
  
  const find_stag = (elm,xml,from) => this.travel_tag_bw([elm],false,false,xml,from);  

  var find_etag, spos = xml.length;
  if (shallow) {
    // expect
    find_etag = (elist,xml,from) => this.travel_tag_bw(elist,true,true,xml,from);
    // ĉar ni ne ignoras aliajn elementojn ol trd/trgrp ni unue devas aliri
    // la kadran elementon
    const kadr = find_etag(['drv','subdrv','snc','subsnc'],xml,xml.length);
    if (kadr) {
      spos = kadr.pos;
    } else {
      throw("La subteksto ne finiĝas per </drv>, </subdrv>, </snc> aŭ </subsnc>!")
    }
  } else {
    // find
    find_etag = (elist,xml,from) => this.travel_tag_bw(elist,true,false,xml,from); 
    spos = xml.length;
  }

  var ta, te = find_etag(['trd','trdgrp','adm','rim'],xml,spos);

    // nudigas la tradukon je ofc, klr ktp.
    function trd_norm(t) {
      return (t.replace(re._ofc,'')
       .replace(re._klr,'')
       .replace(re._ind,'$1')
       .replace(/\s+/,' ')
       .trim());
    }

  while (te) {    
    // trovu la komencon ta de la elemento finiĝanta je te
    ta = find_stag(te.elm,xml,te.pos);

    // se temas pri trd/trdgrp...
    if (te.elm.indexOf('trd') == 0) {
      // ni ekstraktu lingvon kaj enhavon...
      const m = re._trd.exec(xml.substring(ta.pos,te.end+1));
      if (m && m[2]) {
        const lng = m[2]; if (!this.tradukoj[lng]) this.tradukoj[lng] = [];
        const grp = m[1];
        const trd = m[3];
        if (!grp) {
          // unuopa traduko
          this.tradukoj[lng].push(trd_norm(trd));
        } else {
          // grupigitaj tradukoj
          var t = re._tr1.exec(trd);
          while (t) {
            this.tradukoj[lng].push(trd_norm(t[1]));
            t = re._tr1.exec(trd);
          }
        }
      }
    }

    te = find_etag(['trd','trdgrp','adm','rim'],xml,ta.pos);
  };
}

Xmlarea.prototype.collectTrdAll = function(lng) {
  var xml = this.txtarea.value;
  this.tradukoj = [];

  // kolektu unue la tradukojn en la aktuala subteksto
  this.collectTrd(lng,xml,false);

  // se ne temas subdrv, snc, subsnc ni kolektu ankaŭ de la parencaj...
  var p = this.getParent(this.xml_elekto.id);

  while ( ['snc','subdrv','drv'].indexOf(p.el)>-1 ) {
    xml = this.getSubtextById(p.id);
    this.collectTrd(lng,xml,true);
    p = this.getParent(p.id);
  }
}


// trovas la lokon kie enmeti tradukon
Xmlarea.prototype.findTrdPlace = function(lng) {
  const xml = this.txtarea.value;

  const expect_etag = (elist,xml,from) => this.travel_tag_bw (elist,true,true,xml,from);
  //expect_stag = (elist,xml,from) => this.travel_tag_bw (elist,false,true,xml,from);
  const find_stag = (elist,xml,from) => this.travel_tag_bw (elist,false,false,xml,from);

  // trovu unue la pozicion de la fina elemento de la nuna strukturo
  var p = expect_etag(['snc','subsnc','drv','subdrv','art','subart'],xml);
  var q,t,lpos,lelm;

  if (p) {
    lpos = p.pos;
    lelm = p.elm;
    //while (xml[lpos-1] == ' ') lpos--;
    t = {pos: lpos};

    do {
      q = expect_etag(['trd','trdgrp','adm','rim'],xml,t.pos);

      if (q && (q.elm == 'trd' || q.elm == 'trdgrp')) {
        // se ni trovis finon de trd/trdgrp ni serĉu ĝian komencon
        t = find_stag([q.elm],xml,q.pos);
        if (t) {
          // ni rigardu pri kiu lingvo temas...
          const m = this.re_stru._trd.exec(xml.substring(t.pos,q.end+1));
          if (m) {
            const l = m[2];
            if (l == lng) {
              // ni trovis jaman tradukon en la koncerna lingvo, redonu la lokon!
              return {pos: t.pos, grp: m[1], trd: m[0], itr: m[3], elm: q.elm}
            } else if (l > lng) {
              // ni supozas ke la lingvoj estas ordigitaj, kaj se
              // ni ne trovos la koncernan lingvon jam inter la tradukoj ni enŝovos
              // ĝin laŭ alfabeto
              lpos = t.pos
            } else {
              // ni trovis la alfabetan lokon po enŝovi 
              // (traduko kun lingvo antaŭ la koncerna):
              return {pos: lpos, elm: lelm}
            }
          }
        }
      } else {
        // ni alvenis supre ĉe 'haltiga' elemento kiel dif/ekz/bld 
        // sen trovi laŭalfabetan enŝovejon,
        // ni redonos la lastan kovnenan lokon (supran trd-on)
        return {pos: lpos, elm: lelm}
      }

      lelm = q.elm;

      // se trd(grp) ne estas valida aŭ se temas 
      // pri 'haltiga' elemento kiel ekz/dif/bld ni finu la serĉadon
      // - ni interesiĝas nur pri tradukoj ekster ekz/dif/bld!
    } while (t && t.elm);

    // ni ĝis nun ne trovis tradukojn, ĉe aŭ post kiu enmeti, do enmetu ĉe la lasta trovita pozicio
    return {pos: (t.pos>-1? t.pos : p.pos), elm: lelm}
  }
}


Xmlarea.prototype.addTrd = function(lng,trd) {
  const place = this.findTrdPlace(lng); // this.getCurrentLastTrd(lng);
  if (place) {
    // se jam estas .trd, ni anstataŭigu ĝin per la etendita trdgrp...,
    // alie ni enmetos novan trd (len=0)
    const len = place.trd? place.trd.length : 0;
    this.select(place.pos, len);
    const ind = this.indent();

    // jam estas trdgrp?
    if (place.grp) {
      // aldonu novan tradukon antaŭ '</trdgrp'
      const pos = place.trd.indexOf('</trdgrp');
      const nov = place.trd.substring(0,pos) + ',\n'
        + ind + '  <trd>' + trd +'</trd>'
        + place.trd.substring(pos+1);
      console.debug(' --> '+nov);
      this.selection(nov);
    } else if (place.trd) {
      // ni havas ĝis nun nur unu trd, kaj devas krei trdgrp nun
      const nov = 
        '<trdgrp lng="'+lng+'">\n'
        + ind + '  <trd>' + place.itr + '</trd>,\n'
        + ind + '  <trd>' + trd + '</trd>\n'
        + ind + '</trdgrp>';
      console.debug(' --> '+nov);
      this.selection(nov);
    } else {
      // antaŭ elementoj (sub)drv/snc ni aldonas du spacojn...
      const iplus = place.elm[0] == 's' || place.elm[0] == 'd' ? '  ' : '';
      // ankoraŭ neniu traduko, aldonu la unuan nun
      const nov = iplus + '<trd lng="' + lng +'">' + trd + '</trd>\n' + ind;
      console.debug(' --> '+nov);
      this.selection(nov);
    }
  }
}


// eventuale aktualigas la XML-tekston kun la parto el this.xmlarea
// kaj redonas la kompletan tekston
Xmlarea.prototype.syncedXml = function() {
  if (! this.synced) this.sync(this.xml_elekto.id); 
  return this.xmlteksto;
}

// elektas parton de la XML-teksto por redakti nur tiun
// laŭbezone sekurigas la nune redaktatan parton...
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

// redonas la aktualan y-koordinaton de la videbla parto de this.xmlarea
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

// redonas la aktualan pozicion de la kursoro kiel linio + loko ene de la linio
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

Xmlarea.prototype.select = function(pos,len) {
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
}

// legas aŭ anstataŭigas la momente elektitan tekston de this.txtarea
Xmlarea.prototype.selection = function(insertion,p_kursoro=0) {
  //var txtarea = document.getElementById('r:xmltxt');
  const txtarea = this.txtarea;
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

// ŝovas la markitan tekston *indent* signojn destren aŭ maldekstren
// sen argumento *indent* gi eltrovas la enŝovon en la aktuala linio
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

// redonas la signon antaŭ la kursoro
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