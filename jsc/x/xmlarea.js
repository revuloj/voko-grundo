
/* jshint esversion: 6 */

// (c) 2021 Wolfram Diestel

/**
 * Administras la redaktatan tekston tiel, ke eblas redakti nur parton de ĝi, t.e. unuopan derivaĵon, sencon ktp.
 * @constructor
 * @param {string} ta_id - La HTML-Id de la koncerna textarea-elemento en la HTML-paĝo
 * @param {Function} onAddSub - Revokfunkcio, vokata dum analizo de la strukturo ĉiam, kiam troviĝas subteksto. Tiel eblas reagi ekzemple plenigante liston per la trovitaj subtekstoj (art, drv, snc...) 
 */
function Xmlarea(ta_id, onAddSub) {
    this.txtarea = document.getElementById(ta_id);
    this.txtarea.addEventListener("input",() => { this.setUnsynced(); });
    this.txtarea.addEventListener("change",() => { this.setUnsynced(); });

    //this.structure_selection = document.getElementById(struc_sel);
    this.xmlstruct = new XmlStruct('',onAddSub); // la tuta teksto
    this.xmltrad = new XmlTrad(this.xmlstruct); // por redaktaado de tradukoj

    this.elekto = undefined; // aktuale redaktata subteksto
    //this.tradukoj = {}; // tradukoj trovitaj en la aktuala redaktata subteksto
    //this.radiko = '';
    this.onaddsub = onAddSub;
    this.synced = true;
    this.ar_in_sync = false; // por scii, ĉu la lasta antaŭrigardo estas aktuala...

    this.tradukoj = {}; // tradukoj kolektitaj profunde/kunparence por aktuale elektita subteksto, ŝlosilo estas lng
    this.tradukoj_strukt = {}; // tradukoj kolektitaj (malprofunde) por ĉiu subteksto, ŝlosilo estas .id
                        // valoro estas objekto {<lng>:[<trdj>]}
}

/**
 * Metas la kompletan XML-tekston laŭ la argumento 'xml' kaj aktualigas la strukturon el ĝi
 * @param {string} xml 
 */
Xmlarea.prototype.setText = function(xml) {
  this.xmlstruct = new XmlStruct(xml,this.onaddsub);  
  // elektu la unuan (art)
  this.elekto = this.xmlstruct.strukturo[0];
  this.txtarea.value = this.xmlstruct.getSubtext(this.elekto);
  this.resetCursor();   
};

/**
 * La radiko de la kapvorto, kiel eltrovita dum strukturanalizo.
 * @returns Redonas la radikon de la artikolo (t.e. la kapvorto sen finaĵo)
 */
Xmlarea.prototype.getRadiko = function() {
  return this.xmlstruct.radiko;
};

/**
 * Redonas la dosiernomon ekstraktitan el mrk-atributo de art- aŭ drv-elemento
 * @returns la dosiernomo
 */
Xmlarea.prototype.getDosiero = function() {
  return this.xmlstruct.art_drv_mrk();
};

/**
 * Saltas al la aktuala derivaĵo (laŭ mrk) en la antaŭrigardo (#...)
 */
Xmlarea.prototype.saltu = function() {
  const mrk = this.xmlstruct.getMrk(this.elekto);
  if (mrk != '' && mrk.indexOf(',v') == -1) {
    window.location.hash = this.getDosiero()+'.'+mrk;
  } else {
    window.location.hash = '';
    // tio lasas malplenan '#', se ni volus forigi tion ankaŭ ni povus uzi
    // history.pushState("", document.title, window.location.pathname);
  }
}; 

/**
 * Aktualigas la tekstbufron per la redaktata subteksto, ankaŭ aktualigas la struktur-liston
 * @param {{id:string}} select - se donita, la strukturelemento kun 
 * tiu .id estos poste la elektita, se ĝi aldone havas .ln, .el tiuj povus esti
 * uzataj por retrovi subtekston, kies .id ŝanĝiĝis, ekz-e pro aldono/ŝanĝo de mrk...
 */
Xmlarea.prototype.sync = function(select = undefined) {
  if (this.elekto) {
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


/**
 * Redonas la tutan XML-tekston post eventuala sinkronigo kun la aktuala redakto
 * @returns la tuta sinkronigita XML-teksto
 */
Xmlarea.prototype.syncedXml = function() {
  if (! this.synced) this.sync(this.elekto); 
  return this.xmlstruct.xmlteksto;
};


/**
 * Malvalidigas la sinkron-flagon por signi, ke venontfoje necesas sinkronigo de Xml 
 * resp. rekrei antaŭrigardon
 */
Xmlarea.prototype.setUnsynced = function() {
  this.synced = false;
  this.ar_in_sync = false;
}


/**
 * Elektas (alian) parton de la XML-teksto por redakti nur tiun.
 * Laŭbezone sekurigas la nune redaktatan parton...
 * @param {string} id - la identigilo de la subteksto
 */
Xmlarea.prototype.changeSubtext = function(id,sync=true) {
  if (id) {
    // ni unue sekurigu la aktuale redaktatan parton...
    if (sync) this.sync({id:id}); // ni transdonas ankaŭ la elektotan id por navigi tien en la elekto-listo
    
    /* ni trovu la celatan subtekston per ĝia id... */

    // se ni ne trovos la celatan, ekz-e ĉar marko aŭ enhavo snc-aldono...) ŝanĝiĝis,
    // ni elektos al la unuan (art)
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
  }
};


/**
 * Iras al pozicio indikita per "<line>:[<lpos>]"
 * @param {string} line_pos - linio kaj eventuala pozicio en la linio kiel teksto
 * @param {number} len - se donita, tiom da signoj ĉe la indikita poizico estos markitaj,
 *                  se ne donita unu signo estos elektita
 */
Xmlarea.prototype.goto = function(line_pos,len = 1) {
  //const re_line = this.re_stru._line;
  
    // kalkulu la signoindekson por certa linio
    function pos_of_line(xml,line) {
      let pos = 0;
      let lin = 0;

      while (lin < line) {
        pos = xml.indexOf('\n',pos)+1;
        lin++;
      }
      /*
      var lines = this.element.val().split('\n');
      var pos = 0;
      
      for (var i=0; i<line; i++) {
          pos += lines[i].length+1;
      }*/
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

/**
 * Redonas la aktualan kapvorton, se ene de drv t.e. ties kapvorton, alie la kapvorton de la unua drv
 * en la artikolo
 * @returns la kapvorton, tildo estas anstataŭigita per la radiko, variaĵoj post komo forbalaita
 */
 Xmlarea.prototype.getCurrentKap = function() {
   return this.xmlstruct.getClosestKap(this.elekto)
 }

/******
 * PLIBONIGU: administrado de tradukoj estas sufiĉe defia por meriti apartigon
 * en propra objekto...
 */


/**
 * Kolektas ĉiujn tradukojn en donita XML-teksto
 * @param {string} xml - la XML-teksto
 * @param {boolean} shallow - true: ni serĉas nur en la unua strukturnivelo, false: ni serĉas
 * @param {boolean} normalize - true: ni forigas ofc, klr, ind el la traduko, false: ni ne tuŝas ĝian strukturon
 */
Xmlarea.prototype.collectTrd = function(xml, shallow=false, normalize=false) {
  const re = this.re_stru;
  if (!xml) {
    xml = this.txtarea.value;
    // KOREKTU: fakte ni nun kolektas en {<lng>: [trdj]}
    // do ĝuste estus this.tradukoj = {} aŭ this.tradukoj[lng] = [] !?
  }

  this.xmltrad.collectXml(xml,shallow,normalize);
};


/**
 * Kolektas ĉiujn tradukojn en la aktuale redaktata XML-subteksto.
 * La rezulto estos poste en la listo xmltrad.tradukoj[lng]
 */
Xmlarea.prototype.collectTrdAll = function() {
  let xml = this.txtarea.value;
  
  // kolektu unue la tradukojn profunde en la aktuala subteksto
  this.xmltrad.preparu(this.xmlstruct);
  this.xmltrad.collectXml(xml,false,true); // profunde, normigu

  // se temas pri subdrv, snc, subsnc ni kolektu ankaŭ de la parencoj,
  // ĉar ekz-e la traduko de drv validas ankaŭ por ĉiu ena snc...
  let p = this.xmlstruct.getParent(this.elekto);
  while ( ['snc','subdrv','drv'].indexOf(p.el)>-1 ) {
    xml = this.xmlstruct.getSubtext(p);
    this.xmltrad.collectXml(xml,true,true); // malprofunde, normigu
    p = this.xmlstruct.getParent(p);
  }
};


/**
 * Aldonas al la momente aktiva subteksto tradukon de donita lingvo en la konvena loko 
 * (alfabete inter la aliaj tradukoj kaj etendante tradukgrupojn se jam ekzistas traduko(j) 
 * de tiu lingvo en la teksto)
 * @param {string} lng - la lingvokodo
 * @param {string} trd - la aldonenda traduko
 */
Xmlarea.prototype.addTrd = function(lng,trd) {
  //if (! this.synced) this.sync(this.elekto); 
  const xml = this.txtarea.value;

  const place = this.xmltrad.findTrdPlace(xml,lng); // this.getCurrentLastTrd(lng);
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
};

/**
 * Anstataŭigas aŭ aldonas (se ne jam estas iuj) la tradukojn de unu lingvo en subteksto 
 * @param {!string} id - .id de la subteksto
 * @param {!string} lng - la lingvo
 * @param {!Array<string>} trdj - listo de novaj tradukoj
 */
Xmlarea.prototype.replaceTrd = function(id,lng,trdj) {
  if (! this.synced) this.sync(this.elekto); 
  let xml = this.xmlstruct.getSubtext({id:id});

  function _indent_at(pos) {
    let ls = xml.lastIndexOf('\n',pos);
    let ind = "";
    if (ls != -1) {
      while (xml[++ls] == " " && ls < pos) ind += " ";
    }
    return ind;
  }

  function _duobla_linirompo_for(pos) {
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

  const place = this.xmltrad.findTrdPlace(xml,lng); // this.getCurrentLastTrd(lng);
  if (place) {
    const len = place.trd? place.trd.length : 0;
    //this.select(place.pos, len);
    const ind = _indent_at(place.pos);
    let nov;

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
      this.xmlstruct.replaceSubtext({id:id},xml,this.elekto.id);
      // aktualigu ankaŭ txtarea, ĉar eble ni aldonis en tiu tradukojn
      // PLIBONIGU: pli bone faru tion nur se montriĝas ĉirkaŭa subteksto
      // aŭ fine, post aldoni ĉiujn tradukojn...
      this.txtarea.value = this.xmlstruct.getSubtext(this.elekto);
    //}
  }
};

/**
 * Redonas aŭ metas la aktualan y-koordinaton de la videbla parto de this.xmlarea
 * @param {number} pos - se donita rulas al tiu y-koordinato, se mankas redonu la aktualan
 * @returns la aktuala y-koordinato
 */
Xmlarea.prototype.scrollPos = function(pos=undefined) {
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
};


/**
 * Redonas la aktualan pozicion de la kursoro kiel linio kaj loko ene de la linio 
 * @returns objekto {{line: number, pos: number}}
 */
Xmlarea.prototype.position = function() {
  const loff = this.elekto? this.elekto.ln : 0;

    // kalkulu el la signoindekso la linion kaj la pozicion ene de la linio
    function get_line_pos(inx,text) {
      var lines = 0;
      var last_pos = 0;
      for (let i=0; i<inx; i++) { 
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


/**
 * Redonas pozicion de kursoro kiel n-ro de signo
 * @returns - la numero de la signo, kie staras la kursoro
 */
Xmlarea.prototype.positionNo = function() {
    const txtarea = this.txtarea;
    let pos = 0;
    if('selectionStart' in txtarea) {
        pos = txtarea.selectionStart;
    } else if('selection' in document) {
      txtarea.focus();
      const sel = document.selection.createRange();
      const selLength = document.selection.createRange().text.length;
      sel.moveStart('character', -txtarea.value.length);
      pos = sel.text.length - selLength;
    }
    return pos;
};

/**
 * Elektas tekstoparton en la redaktata teksto
 * @param {number} pos - la pozicio ekde kie elekti
 * @param {number} len - la nombro de elektendaj signoj
 */
Xmlarea.prototype.select = function(pos,len=0) {
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

/**
 * Legas aŭ anstataŭigas la momente elektitan tekston en la redaktata teksto
 * @param {string} insertion - se donita la enmetenda teksto (ĉe la aktuala pozicio aŭ anstataŭ la aktuala elekto)
 * @param {number} p_kursoro - se negativa tiom da signoj ni moviĝas antaŭen antaŭ enmeti la tekston, se pozitiva, tiom da signoj ni movas antaŭen la kursoron post enmeto (ekz-e tekstenŝovo)
 * @returns la momente elektita teksto, se ne estas donita enmetenda teksto
 */
Xmlarea.prototype.selection = function(insertion=undefined, p_kursoro=0) {
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
    }

    // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
    // se la klavaro ne estas tuŝita...:
    this.setUnsynced();

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
};


/**
 * Ŝovas la markitan tekston 'indent' signojn dekstren aŭ maldekstren
 * sen argumento 'indent' ĝi eltrovas la enŝovon en la aktuala linio
 * @param {number} ind - la nombro de ŝovendaj spacoj
 * @returns - la enŝovo de la aktuala linio (la spacsignoj en ties komenco)
 */
Xmlarea.prototype.indent = function(ind=undefined) {
  //var txtarea = document.getElementById('r:xmltxt');
  var txtarea = this.txtarea;
  var selText;
  var startPos;

  if (typeof ind == "number") { // enŝovu
    txtarea.focus();
    // uzu get_indent / indent el tekstiloj
    const i_ = get_indent(txtarea);
    if (i_ % 2 == 1) ind = ind/2; // ŝovu nur ±1 (±2/2) ĉe momente nepara enŝovo!
    indent(txtarea,ind);
    // ni ŝangis la tekston, sed la evento "input" ne en ciu retumilo lanciĝas
    // se la klavaro ne estas tuŝita...:
    this.setUnsynced();

  } else { // eltrovu la nunan enŝovon
    ind = 0;
    var linestart;

    if (document.selection  && document.selection.createRange) { // IE/Opera
      var range = document.selection.createRange();
      range.moveStart('character', - 200); 
      selText = range.text;
      linestart = selText.lastIndexOf("\n");
      while (selText.charCodeAt(linestart+1+ind) == 32) {ind++;}
    } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
      startPos = txtarea.selectionStart;
      linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
      while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+ind) == 32) {ind++;}
    }
    return (str_repeat(" ", ind));  
  }
};


/**
 * Signo antaŭ kursoro
 * @returns la signon antaŭ la kursoro
 */
Xmlarea.prototype.charBefore = function() {
  //var txtarea = document.getElementById('r:xmltxt');
  var txtarea = this.txtarea;
  if (document.selection && document.selection.createRange) { // IE/Opera  
    txtarea.focus();
    var range = document.selection.createRange();
    range.moveStart('character', - 1); 
    return range.text;
  } else {
    var startPos = txtarea.selectionStart;
    //txtarea.setSelectionRange(startPos-1,startPos);
    return txtarea.value.substring(startPos - 1, startPos);
  }
};

   // eltrovu la signojn antaŭ la nuna pozicio (ĝis la linikomenco)
Xmlarea.prototype.charsFromLineStart = function() {
  const txtarea = this.txtarea;
  const pos = this.positionNo();
  const val = txtarea.value;
  let p = pos;
  while (p>0 && val[p] != '\n') p--;
  return val.substring(p+1,pos);
};



/**
 * Metas la kursoron al la komenco de la redaktejo kaj fokusas ĝin
 */
Xmlarea.prototype.resetCursor = function() { 
  const txtarea = this.txtarea;
  if (txtarea.setSelectionRange) { 
      txtarea.focus(); 
      //txtarea.setSelectionRange(0, 0); // problemo en Chrome?
      txtarea.selectionStart = 0;
      txtarea.selectionEnd = 0;
  } else if (txtarea.createTextRange) { 
      const range = txtarea.createTextRange();  
      range.moveStart('character', 0); 
      range.select(); 
  } 
  txtarea.focus();
};