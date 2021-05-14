
/* jshint esversion: 6 */

// difinu ĉion sub nomprefikso "redaktilo"
var redaktilo = function() {

  var xmlarea = null;
  var redakto = 'redakto'; // 'aldono' por nova artikolo
  const cgi_vokomailx = '/cgi-bin/vokosubmx.pl';
  const cgi_vokohtmlx = '/cgi-bin/vokohtmlx.pl';
  const cgi_vokosubm_json = '/cgi-bin/vokosubm-json.pl';
 
  const re_lng = /<(?:trd|trdgrp)\s+lng\s*=\s*"([^]*?)"\s*>/mg; 
  const re_fak = /<uzo\s+tip\s*=\s*"fak"\s*>([^]*?)</mg; 
  const re_stl = /<uzo\s+tip\s*=\s*"stl"\s*>([^]*?)</mg; 
  const re_mrk = /<(drv|snc) mrk="([^]*?)">/mg;

  const re_trdgrp = /<trdgrp\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trdgrp/mg;	
  const re_trd = /<trd\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trd/mg;	
  const re_ref = /<ref([^g>]*)>([^]*?)<\/ref/mg;
  const re_refcel = /cel\s*=\s*"([^"]+?)"/m;

  const re_hex = /^#x[\da-f]+$/;
  const re_dec = /^#\d\d+$/;

  const xml_shbl = {
    // la XML-ŝablonoj, el kiuj ni elektos laŭ nomo...
    // ili estas (eble nestitaj) listoj de la formo 
    // [string,Object,List|string] = [elemento,atributoj,enhavo]
    // $r:... referencas al formular-elemento en la redaktilo (input.value)
    // $_ anstataŭiĝos per la momente elektita teksto aŭ ""
    trd: ["trd",{},"$_"],
    trd_lng: ["trd",{lng:"$r:trdlng"},"$_"],
    trdgrp: ["trdgrp",{lng:"$r:trdlng"},[
        "\n  ",["trd",{},"$_"],
        ",\n  ",["trd"],
        "\n"
      ]],
    klr: ["klr",{},"$_"],
    klr_ronda: ["klr",{},["(","$_",")"]],
    klr_angula: ["klr",{},["[","$_","]"]],
    klr_tip: ["klr",{tip:"$r:klrtip"},["(","$_",")"]],
    klr_ppp: ["klr",{},"[&#x2026;]"],
    ind: ["ind",{},"$_"],
    ref_tip: ["ref",{tip:"$r:reftip",cel:"$r:refmrk"},"$_"],
    ref_lst: ["ref",{tip:"lst",lst:"voko:",cel:"$r:refmrk"},"$_"],
    ref: ["ref",{cel:"$r:refmrk"},"$_"],
    refgrp: ["refgrp",{tip:"$r:reftip"},[
        "\n  ",["ref",{cel:"$r:refmrk"},"$_"],
        ",\n  ",["ref",{cel:""}],
        "\n"
      ]],
    rim: ["rim",{},"$_"],
    ofc: ["ofc",{},["$r:ofc"]],    
    gra: ["gra",{},["$r:gra","$_"]],
    uzo_fak: ["uzo",{tip:"fak"},"$r:sfak"],
    uzo_stl: ["uzo",{tip:"stl"},"$r:sstl"],
    ekz: ["ekz",{},"$_"],
    nom: ["nom",{},"$_"],
    nac: ["nac",{},"$_"],
    esc: ["esc",{},"$_"],
    tld: ["tld/"],
    fnt: ["fnt",{},[
            "\n  ",["bib"],
            "\n  ",["aut",{},"$_"],
            "\n  ",["vrk",{},[["url",{ref:""}]]],
            "\n  ",["lok"],
            "\n"]
          ],
    drv: ["drv",{mrk:"XXXX.0"},[
            "\n  ",["kap",{},[["tld/"],"..."]],
            "\n  ",["snc",{mrk:"XXXX.0o.YYY"},[
            "\n    ",["dif",{},"$_"],
            "\n  "
            ]],
            "\n"  
    ]],
    snc: ["snc",{mrk:"XXX.0o.YYY"},[
      "\n  ",["dif",{},"$_"],
      "\n"
    ]],  
    dif: ["dif",{},"$_"]       
  };

  function shablono(name,selection) {    
    var p_kursoro = -1;
    var p_lines = 0;

    //function xmlstr(jlist) {
    return [(function xmlstr(jlist) {
      // $_ ni anstataŭigos per la elektita teksto, 
      // $<var> per la valoro de elemento kun id="var"
      function val(v) {
        return v == "$_"? 
          selection 
          : (v[0] == "$"? 
          document.getElementById(v.substring(1)).value 
          : v);
      }
      if (!jlist || !jlist[0]) {
        console.error("Nedifinita ŝablono: \""+name+"\"");
        return;
      }
      var xml = "";
      for (var el of jlist) {
        // string content
        if (typeof el == "string") {
          if (p_kursoro < 0 && el.indexOf("\n")>-1) p_lines++;
          if (el == "$_") p_kursoro = xml.length;
          xml += val(el);
        } else {
          // tag name
          xml += "<" + el[0];
          // attributes
          if (el[1]) {
            for (var atr in el[1]) {
              xml += " " + atr + "=\"" + val(el[1][atr]) + "\"";
            }
          }
          xml += ">";
          // content
          if (el[2]) {
            if (el[2] instanceof Array) {
              const x = xmlstr(el[2]);
              if (p_kursoro > -1) p_kursoro += xml.length;
              xml += x;
              
            } else {
              if (el[2] == "$_") p_kursoro = xml.length;
              xml += val(el[2]);
            } 
          }
          // closing tag
          if ("/" != el[0].slice(-1)) {
            //if (p_kursoro < 0) p_kursoro = xml.length;
            xml += "</" + el[0] + ">"; 
          }
        }  
      }
      return xml;
    }
    // rekte apliku la supran algoritmon al la ŝablono donita per sia nomo...
    ([ xml_shbl[name] ]) // ni transdonas ĝin kiel unu-elementa listo 
  ),p_kursoro,p_lines];} 



  function klavo(event) {
    var key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    //  alert(key);
    var scrollPos;

    // RET: aldonu enŝovon (spacojn) komence de nova linio
    if (key == 13) {  
      scrollPos = xmlarea.scrollPos();        
      indent = xmlarea.indent();
      xmlarea.selection("\n"+indent,-1);
      xmlarea.scrollPos(scrollPos);
      event.preventDefault();

    // X aŭ x
    } else if (key == 88 || key == 120) {   
      var cx = document.getElementById("r:cx");
      if (event.altKey) {	// shortcut alt-x  --> toggle cx
        cx.value = 1 - cx.value || 0;
        event.preventDefault();
      }
  
      if (cx.value != "1") return true;

      var txtarea = document.getElementById('r:xmltxt');
      scrollPos = xmlarea.scrollPos();
      selText = xmlarea.selection();

      if (selText != "") return true;

      var before = xmlarea.charBefore();
      var nova = cxigi(before, key);

      if (nova != "") {
        //range.text = nova;
        xmlarea.selection(nova,-1);
        
        xmlarea.scrollPos(scrollPos);
        event.preventDefault();
      }
      
    // T aŭ t aŭ kir-t aŭ kir-T
    } else if (key == 84 || key == 116 || key == 1090 || key == 1058) {   
      if (event.altKey) {	// shortcut alt-t  --> trd
        insert_xml("trd_lng");
      }
    }
  }


  function insert_xml(shabl) {
    //var txtarea = document.getElementById('r:xmltxt');
    //var selText;

    const pos = xmlarea.scrollPos();
    const selText = xmlarea.selection();
    var [text,p_kursoro,p_lines] = shablono(shabl,selText);
    const indent = xmlarea.indent();
    // se $_ aperas ie, ni devos
    // addicii indent.length * (#linioj ĝis $_ -1)
    xmlarea.selection(
      text.replace(/\n/g,"\n"+indent),
      p_kursoro + p_lines*indent.length);
    xmlarea.scrollPos(pos);
  }

    
  function nextTag(tag, dir) {
        
      function lines(str){
        try { return(str.match(/[^\n]*\n[^\n]*/gi).length); } 
        catch(e) { return 0; }
      }

      var txtarea = document.getElementById('r:xmltxt');

      if (document.selection  && document.selection.createRange) { // IE/Opera
        alert("tio ne funkcias por malnova retumilo IE aŭ Opera.");
      } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
        var startPos = txtarea.selectionStart;
        var t;
        var pos;
        // serĉu "tag" malantaŭ la nuna pozicio
        if (dir > 0) {
          t = txtarea.value.substring(startPos+1);
          pos = startPos + 1 + t.indexOf(tag);
        }
        // serĉu "tag" antaŭ la nuna pozicio
        if (dir < 0) {
          t = txtarea.value.substring(0, startPos);
          pos = t.lastIndexOf(tag);    
        }
        txtarea.selectionStart = pos;
        txtarea.selectionEnd = pos;
        txtarea.focus();

        // rulu al pozicio laŭble dek linioj antaŭ la trov-loko 
        var line = lines(txtarea.value.substring(0,pos)) - 10;
        var lastline = lines(txtarea.value.substring(pos)) + line + 10;
        if (line < 0) line = 0;
        if (line > lastline) line = lastline;

        xmlarea.scrollPos(txtarea.scrollHeight * line / lastline);
        //txtarea.scrollTop = txtarea.scrollHeight * line / lastline;   
    
    //    alert("tio baldaux funkcias. tag="+tag+" pos="+pos+" line="+line+ " lastline="+lastline);
    //    alert("scrollTop="+txtarea.scrollTop+" scrollHeight="+txtarea.scrollHeight);
      }
  }

  // memoras valorojn de kelkaj kampoj en la loka memoro de la retumilo
  function store_preferences() {
    var prefs = {};
    for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo','r:cx']) {
      const el = document.getElementById(key);
      if (el) prefs[key] = el.value;
    }
    window.localStorage.setItem("redaktilo_preferoj",JSON.stringify(prefs));  
  }

  // reprenas memorigitajn valorojn de kelkaj kampoj el la loka memoro de la retumilo
  function restore_preferences() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
      for (var key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo']) {
        if (prefs[key]) document.getElementById(key).value = prefs[key];
      }
    }
  }

  function get_preference(key) {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    if (prefs) {
        return prefs[key];
    }
  }

  function restore_preferences_xml() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : {});
    document.getElementById('r:cx').value = prefs['r:cx'] || 0;
  }

  // sekurigi la XML-tekston al loka retumila memoro
  function store_art() {
    window.localStorage.setItem("red_artikolo",JSON.stringify({
      'xml': document.getElementById("r:xmltxt").value,
      'nom': document.getElementById("r:art").value
      //'red': nova/redakti...
    }));
  }

  // restarigi XML-tekston el loka retumila memoro
  function restore_art() {
    var str = window.localStorage.getItem("red_artikolo");
    var art = (str? JSON.parse(str) : null);
    if (art) {
      document.getElementById("r:xmltxt").value = art.xml;
      //  document.getElementById("...").value = art.red;
      document.getElementById("r:art").value = art.nom;
      document.getElementById("r:art_titolo").textContent = art.nom; 
    }
  }

  /*
  function tab_toggle(id) {
    var el = document.getElementById(id);
    var tab_id;
    if (! el.classList.contains('aktiva')) {
      for (ch of el.parentElement.children) {
        ch.classList.remove('aktiva')
        tab_id = 'r:tab_'+ch.id.substring(2);
        document.getElementById(tab_id).classList.add('collapsed');
      }
      el.classList.add('aktiva');
      tab_id = 'r:tab_'+el.id.substring(2);
      document.getElementById(tab_id).classList.remove('collapsed');
    }
    // ni ankaŭ devas kaŝi la butonojn super la redakto-tabulo por la antaŭrigardo...
    if (id == "r:txmltxt") {
      document.getElementById("r:nav_btn").classList.remove('collapsed');
    } else {
      document.getElementById("r:nav_btn").classList.add('collapsed');
    }
  }
  */

  function fs_toggle(id) {
    var el = document.getElementById(id);
    var fs_id;
    if (! el.classList.contains('aktiva')) {
      for (var ch of el.parentElement.children) {
        ch.classList.remove('aktiva');
        fs_id = 'r:fs_'+ch.id.substring(2);

        // fermu ĉiujn videblajn tabuletojn
        if (id != "r:chiuj" && ch.id != "r:chiuj") {
          document.getElementById(fs_id).classList.add('collapsed');
        
        } else { // malfermu ĉiujn krom "novaj"
          if ( ch.id == "r:nov" )
            document.getElementById(fs_id).classList.add('collapsed');
          else if ( ch.id != "r:chiuj")
            document.getElementById(fs_id).classList.remove('collapsed');
        }
      }
      el.classList.add('aktiva');
      if ( id != "r:chiuj" ) {
        fs_id = 'r:fs_'+id.substring(2);
        document.getElementById(fs_id).classList.remove('collapsed');
      }
    }
  }

  function listigu_erarojn(err) {
    var el = document.getElementById("r:eraroj");
    var elch = el.children;
    var ul;
    if (! elch.length) {
      ul = document.createElement("ul");                
      el.appendChild(ul);
    } else {
      ul = elch[0];
    }
    for (var e of err) {
      var li = make_element("li",{},e); //createTElement("li",e);               
      ul.appendChild(li);       
    }
  }

  function add_err_msg(msg, matches) {
    var errors = [];

    for (var m of matches) {
      errors.push(msg+m[1]);
    }
    if (errors.length)
      listigu_erarojn(errors);
  }

  function kontrolu_kodojn(clist,regex) {
    var xml = document.getElementById("r:xmltxt").value;
    var m; var invalid = [];
    var list = revo_codes[clist];

    if (! list ) {
      console.error("Kodlisto \"" + clist + "\" estas malplena, ni ne povas kontroli ilin!");
      return;
    }
    
    while (m = regex.exec(xml)) {
      if ( m[1] && !list.codes[m[1]] ) {
        invalid.push(m);
        console.error("Nevalida kodo \""+m[1]+"\" ĉe: "+m.index);
      }
    }
    return invalid;
  }

  function kontrolu_mrk(art) {
    var xml = document.getElementById("r:xmltxt").value;
    var m; 
    var errors = [];
    
    while (m = re_mrk.exec(xml)) {
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

  // trovu tradukojn sen lingvo
  function kontrolu_trd() {
    var xml = document.getElementById("r:xmltxt").value;
    var m; re_t2 = /(<trd.*?<\/trd>)/g;
    var errors = [];
    
    // forigu bonajn trdgrp kaj trd FARENDA: tio ne trovas <trd lng="..."> ene de trdgrp!
    var x = xml.replace(re_trdgrp,'').replace(re_trd,'');
    while (m = re_t2.exec(x)) {
      errors.push("Traduko sen lingvo: "+m[1]);
    }

    if (errors.length)
      listigu_erarojn(errors); 
  }

  function kontrolu_ref() {
    var xml = document.getElementById("r:xmltxt").value;
    var m; 
    var errors = [];
    
    while (m = re_ref.exec(xml)) {
      var ref = m[1];
      if (ref.search(re_refcel) < 0)
        errors.push("Mankas celo en referenco <ref" + ref + ">"+ m[2] +"</ref>.");
    }
    if (errors.length)
      listigu_erarojn(errors); 
  }

  function kontrolu_xml_loke(art,xml) {
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

  function rantaurigardo() {
    var eraroj = document.getElementById("r:eraroj");
    var art = document.getElementById("r:art").value;
    var xml = document.getElementById("r:xmltxt").value;

    // eblas, ke en "nav" montriĝas indekso, ĉar la uzanto foiris de la redaktado tie
    // ni testas do antaŭ kontroli erarojn
    // alternative ni povus renavigi al la navigilo...!?
    if (eraroj) {
      eraroj.textContent='';
      eraroj.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
      eraroj.parentNode.setAttribute("open","open");  

      kontrolu_xml_loke(art,xml);
      if (xml.startsWith("<?xml")) {
        vokomailx("nur_kontrolo",art,xml);
      }
    }

    if (xml.startsWith("<?xml")) {
      vokohtmlx(xml);
    }
  }

  // kontrolo sen antaurigardo
  function rkontrolo() {
    var eraroj = document.getElementById("r:eraroj");
    var art = document.getElementById("r:art").value;
    var xml = document.getElementById("r:xmltxt").value;

    eraroj.textContent='';
    eraroj.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
    eraroj.parentNode.setAttribute("open","open");

    kontrolu_xml_loke(art,xml);
    if (xml.startsWith("<?xml")) {
      vokomailx("nur_kontrolo",art,xml);
    }
  }

  function rkonservo() {
    // PLIBONIGU: estas ioma risko ke tiel oni retrovas unuon en la ŝlosilnomo de jam anstataŭigita unuo
    // do eble estus plibone trakuri la tekston signon post signo, ignori dume xml-nomoj sed
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

    var art = document.getElementById("r:art").value;
    var xml = document.getElementById("r:xmltxt").value;

    var eraroj = document.getElementById("r:eraroj");
    eraroj.textContent='';
    eraroj.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
    eraroj.parentNode.setAttribute("open","open");

    // kontrolu loke revenas nur post kontrolo,
    // dum kontrole ene de vokomailx as nesinkrona
    kontrolu_xml_loke(art,xml);

    if (xml.startsWith("<?xml") &&
      document.getElementById("r:eraroj").textContent == '') {
        // forsendu la redaktitan artikolon
        vokomailx("forsendo",art,xml);
        // memoru enhavon de kelkaj kampoj
        store_preferences();
      }
  }

  function create_new_art() {
    var art = document.getElementById("r:nova_art").value;
    var ta = document.getElementById("r:xmltxt");
    document.getElementById("r:art").value = art;
    document.getElementById("r:art_titolo").textContent = art;
    redakto = 'aldono';
    var shg = document.getElementById("r:sxangxo");
    shg.value = art; shg.setAttribute("readonly","readonly");
    /* jshint ignore:start */
    ta.value = 
        '<?xml version="1.0"?>\n'
      + '<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">\n'
      + '<vortaro>\n'
      + '<art mrk="\$Id\$">\n'
      + '<kap>\n'
      + '    <rad>' + art + '</rad>/o <fnt><bib>FNT</bib></fnt>\n'
      + '</kap>\n'
      + '<drv mrk="' + art + '.0o">\n'
      + '  <kap><tld/>o</kap>\n'
      + '  <snc mrk="' + art + '.0o.SNC">\n'
      + '    <uzo tip="fak"></uzo>\n'
      + '    <dif>\n'
      + '      <tld/>o estas:\n'
      + '      <ekz>\n'
      + '        ...\n'
      + '        <fnt><bib></bib>, <lok></lok></fnt>\n'
      + '      </ekz>\n'
      + '    </dif>\n'
      + '  </snc>\n'
      + '  <trd lng=""></trd>\n'
      + '</drv>\n'
      + '</art>\n'
      + '</vortaro>\n';
    /* jshint ignore:end */
  }

  function vokohtmlx(xml) {
    HTTPRequest('POST',cgi_vokohtmlx,
    {
      xmlTxt: xml
    },
    function (data) {
      // Success!
      var parser = new DOMParser();
      var doc = parser.parseFromString(data,"text/html");
      var rigardo = document.getElementById("r:tab_trigardo");

      var article = doc.getElementsByTagName("article")[0];
      if (article) {
        // anstataŭigu GIF per SVG  
        fix_img_svg(article);
        fix_art_href(article);

        rigardo.textContent = '';
        rigardo.append(article);  

        const art = redakto=='redakto'? document.getElementById("r:art").value:null;
        artikolo.preparu_art(art);

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

  function submetoj_stato(subm_callback,onstart,onstop) {
    const red = get_preference('r:redaktanto');
    if (!red) return;

    HTTPRequest('POST',cgi_vokosubm_json,
    {
      email: red
    },
    function (data) {
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
    
  function vokomailx(command,art,xml) {

    var red = document.getElementById("r:redaktanto").value;
    var sxg = document.getElementById("r:sxangxo").value;
    var nova = (redakto == 'aldono')? 1:0;

    // console.log("vokomailx art:"+art);
    // console.log("vokomailx red:"+red);
    // console.log("vokomailx sxg:"+sxg);

    HTTPRequest('POST',cgi_vokomailx,
      {
        xmlTxt: xml,
        art: art,
        redaktanto: red,
        sxangxo: sxg,
        nova: nova,
        command: command
      },
      function (data) {
        // Success!
        var parser = new DOMParser();
        var doc = parser.parseFromString(data,"text/html");

        var err_list = document.getElementById("r:eraroj");

        //for (div of doc.body.getElementsByClassName("eraroj")) {
        for (var div of doc.body.querySelectorAll(".eraroj")) {
          // debugging...
          console.log("div id=" + div.id);
          err_list.appendChild(div);
        }
        var konfirmo = doc.getElementById("konfirmo");
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
          err_list.textContent.replace(/\s+/,'') == '') {
          // nur kontrolo kaj neniu eraro
          err_list.appendChild(
            document.createTextNode("Bone! Neniu eraro troviĝis."));
          err_list.classList.add("konfirmo");
        } else {
          err_list.classList.remove("konfirmo");
        }
      });
  }

  function load_xml(params) {
    var art = getParamValue("art",params);

    function replace_entities(data) {
        return data.replace(/&[^;\s]+;/g, function (ent) {
          const key = ent.slice(1,-1);
          if (key.match(re_hex)) {
            return String.fromCharCode(parseInt(key.substring(2),16));
          } else if (key.match(re_dec)) {
            return String.fromCharCode(parseInt(key.substring(1)));
          } else {
            const val = voko_entities[key];
            return (val && val.length == 1)? val : ent;
          }
        }); 
    }

    if (art) {

      HTTPRequest('GET','/revo/xml/'+art+'.xml',{},
      function(data) {
          // Success!
          document.getElementById('r:xmltxt').value = replace_entities(data);
          document.getElementById("r:art").value = art;
          var titolo = document.getElementById("r:art_titolo");
          titolo.textContent = art; 
          titolo.setAttribute("href","/revo/art/"+art+".html");
          xmlarea.resetCursor();     
        });
    } else {
      // se ne estas donita artikolo kiel parametro, ni provu legi
      // lastan artikol-tekston el retumila memoro
      restore_art();
    }
  }

  function sf(pos, line, lastline) {
    document.getElementById("r:xmltxt").focus();
    var txtarea = document.getElementById('r:xmltxt');
    if (document.selection  && document.selection.createRange) { // IE/Opera
      var range = document.selection.createRange();
      range.moveEnd('character', pos); 
      range.moveStart('character', pos); 
      range.select();
      range.scrollIntoView(true);
    } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
      txtarea.selectionStart = pos;
      txtarea.selectionEnd = txtarea.selectionStart;
      var scrollTop = txtarea.scrollHeight * line / lastline;
  //    alert("scrollTop="+scrollTop);
      txtarea.scrollTop = scrollTop;
    }
  }

  function preparu_red(params) {

    function show_pos() {
      // aktualigu pozicion
      const pos = xmlarea.position();
      document.getElementById("r:position").textContent=(1+pos.line)+":"+(1+pos.pos);
    }

    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    if (document.getElementById("r:xmltxt")) {
      restore_preferences_xml();
      sf(0, 0, 1);
      //if (!xmlarea) 

      // ŝanĝu tekston al nurlege
      document.getElementById("r:xmltxt").removeAttribute("readonly");

      xmlarea = new Textarea("r:xmltxt");
      load_xml(params); // se doniĝis ?art=xxx ni fone ŝargas tiun artikolon
    }

    redakto = 'redakto'; // gravas post antaŭa aldono!

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // klav-premoj en XML-redaktilo
    document.getElementById("r:xmltxt")
      .addEventListener("keypress",klavo);

    document.getElementById("r:xmltxt")
      .addEventListener("keyup",show_pos);
    document.getElementById("r:xmltxt")
      .addEventListener("focus",show_pos);
    document.getElementById("r:xmltxt")
      .addEventListener("click",show_pos);


    // butonoj por navigi inter drv kaj en-/elŝovo
    var nav = document.getElementById("r:nav_btn");
    nav.querySelectorAll("button").forEach(function (b) { 
        var val = b.getAttribute("value");
        if (val) {
          var n = parseInt(val.substring(0,2));
          var t = val.substring(2);
          if ( t == "d") {
            b.addEventListener("click", function() { nextTag('<drv',n); });
          } else if (t == "i") {
            b.addEventListener("click", function() { xmlarea.indent(n); });
          }
        }
    });
    document.getElementById("r:cx")
      .addEventListener("click",function(event) {
        event.preventDefault();
        var cx = event.currentTarget;
        cx.value = 1 - cx.value || 0; 
        document.getElementById('r:xmltxt').focus();
    });

    // sub-paĝoj "redakti", "antaŭrigardo"
    /*
    var tabs = document.getElementById("r:tabs");
    tabs.querySelectorAll("a").forEach(function (a) { 
      a.removeAttribute("onclick") 
    });
    tabs.addEventListener("click", function(event) {
      var a = event.target.closest("a");
      tab_toggle(a.id);
      if (a.id == "r:trigardo") {
        rantaurigardo();
      }
    });
    */
  }

  function preparu_menu() {

    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    restore_preferences();
    revo_codes.fakoj.load("r:sfak");
    revo_codes.stiloj.load("r:sstl");

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // montru redakto-butonojn en navig-trabo
    //show("x:redakt_btn");
    //show("x:rigardo_btn");

    // butono por kontroli
    document.getElementById("r:kontrolu")
      .addEventListener("click",rkontrolo);

    // butono por konservi
    document.getElementById("r:konservu")
      .addEventListener("click",rkonservo);

    // remetu ŝanĝo-kampon en difinitan staton (necesa post aldono de nova artikolo)
    var shg = document.getElementById("r:sxangxo");
    shg.removeAttribute("readonly");

    // metu buton-surskribon Rezignu kaj malaktivigu la aliajn du
    //document.getElementById("r:rezignu").textContent = "Rezignu"; 
    //document.getElementById("r:kontrolu").removeAttribute("disabled"); 
    //document.getElementById("r:konservu").removeAttribute("disabled");       

    // navigi inter diversaj paneloj kun enmeto-butonoj ktp.
    var fs_t = document.getElementById("r:fs_toggle");
    fs_t.querySelectorAll("a").forEach(function (a) { 
      a.removeAttribute("onclick");
    });
    fs_t.addEventListener("click", function(event) {
      var a = event.target.closest("a");
      fs_toggle(a.id);
    });

    // butonoj sur tiuj paneloj por enmeti elementojn
    var v_sets = document.getElementById("r:v_sets");
    for (var b of v_sets.querySelectorAll("button")) {

      if (b.id == "r:create_new_art") { // [kreu]
        b.addEventListener("click", create_new_art);

      } else if (b.classList.contains("help_btn")) { // (?) (<>)
        b.addEventListener("click", function(event) {
          helpo_pagho(event.currentTarget.getAttribute("value"));
        });

      } else { // ŝablon-butonoj
        b.addEventListener("click",function(event) {
          const v = event.currentTarget.getAttribute("value");
          insert_xml(v);
        });
      }

    }
  }  

  /* 
  when_doc_ready(function() { 
    console.log("redaktilo.when_doc_ready...:" +  location.href);
    window.onbeforeunload = function() {
      // tro malfrue uzante Ajax!
      if (this.document.getElementById('r:redaktilo'))
        store_preferences();
    }  
  });
  */

  // eksportu publikajn funkction
  return {
    preparu_red: preparu_red,
    preparu_menu: preparu_menu,
    get_preference: get_preference,
    submetoj_stato: submetoj_stato,
    klavo: klavo,
    fs_toggle: fs_toggle,
    rantaurigardo: rantaurigardo,
    shablono: shablono,
    store_preferences: store_preferences,
    store_art: store_art
  };
}();
