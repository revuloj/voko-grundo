
// difinu ĉion sub nomprefikso "redaktilo"
var redaktilo = function() {

  var xmlarea = null;

  var revo_codes = {
    lingvoj: new Codelist('lingvo', '/revo/cfg/lingvoj.xml'),
    fakoj: new Codelist('fako','/revo/cfg/fakoj.xml'),
    stiloj: new Codelist('stilo','/revo/cfg/stiloj.xml')
  }
  
  var re_lng = /<(?:trd|trdgrp)\s+lng\s*=\s*"([^]*?)"\s*>/mg; 
  var re_fak = /<uzo\s+tip\s*=\s*"fak"\s*>([^]*?)</mg; 
  var re_stl = /<uzo\s+tip\s*=\s*"stl"\s*>([^]*?)</mg; 
  var re_mrk = /<(drv|snc) mrk="([^]*?)">/mg;

  var re_trdgrp = /<trdgrp\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trdgrp/mg;	
  var re_trd = /<trd\s+lng\s*=\s*"[^"]+"\s*>[^]*?<\/trd/mg;	
  var re_ref = /<ref([^g>]*)>([^]*?)<\/ref/mg;
  var re_refcel = /cel\s*=\s*"([^"]+?)"/m;

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
        "\n  ",["trd"],
        "\n"
      ]],
    klr: ["klr",{},"$_"],
    klr_ronda: ["klr",{},["(","$_",")"]],
    klr_angula: ["klr",{},["[","$_","]"]],
    klr_tip: ["klr",{tip:"$r:klrtip"},["(","$_",")"]],
    klr_ppp: ["klr",{},"[&#x2026;]"],
    ind: ["ind",{},"$_"],
    ref_tip: ["ref",{tip:"$r:reftip",cel:""},"$_"],
    ref: ["ref",{cel:""},"$_"],
    refgrp: ["refgrp",{tip:"$r:reftip"},[
        "\n  ",["ref",{cel:""},"$_"],
        "\n  ",["ref",{cel:""}],
        "\n"
      ]],
    rim: ["rim",{},"$_"],
    ofc: ["ofc",{},["$r:ofc"]],    
    gra: ["gra",{},["$r:gra","$_"]],
    uzo_fak: ["uzo",{tip:"fak"},"$r:sfak"],
    uzo_stl: ["uzo",{tip:"stl"},"$r:sstl"],
    ekz: ["ekz",{},"$_"],
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
  }


  function shablono(name,selection) {    

    //function xmlstr(jlist) {
    return (function xmlstr(jlist) {
      function val(v) {
        return v == "$_"? 
          selection 
          : (v[0] == "$"? 
          document.getElementById(v.substring(1)).value 
          : v)
      }
      if (!jlist) {
        console.error("Nedifinita ŝablono: \""+name+"\"");
        return;
      }
      var xml = "";
      for (var el of jlist) {
        // string content
        if (typeof el == "string") {
          xml += val(el);
        } else {
          // tag name
          xml += "<" + el[0];
          // attributes
          if (el[1]) {
            for (var atr in el[1]) {
              xml += " " + atr + "=\"" + val(el[1][atr]) + "\""
            }
          }
          xml += ">"
          // content
          if (el[2]) {
            if (el[2] instanceof Array) {
              xml += xmlstr(el[2]);
            } else {
              xml += val(el[2]);
            } 
          }
          // closing tag
          if ("/" != el[0].slice(-1)) {
            xml += "</" + el[0] + ">"    
          }
        }  
      }
      return xml;
    }
    // rekte apliku la supran algoritmon al la ŝablono donita per sia nomo...
    ([ xml_shbl[name] ]) // ni transdonas ĝin kiel unu-elementa listo 
  )}; 

  function Codelist(xmlTag,url) {
    this.url = url;
    this.xmlTag = xmlTag;
    this.codes = {};

    this.fill = function(selection) {
      var sel = document.getElementById(selection);
    
      for (item in this.codes) {
        var opt = createTElement("option",item + ' - ' + this.codes[item]);
        addAttribute(opt,"value",item);
        sel.appendChild(opt);
      }
    };

    this.load = function(selection) {
      var self = this;

      // unuafoje ŝargu la tutan liston el XML-dosiero
      if (! self.codes.keys) {
        var codes = {};

        HTTPRequest('GET', this.url, {},
          function() {
              // Success!
              var parser = new DOMParser();
              var doc = parser.parseFromString(this.response,"text/xml");
        
              for (e of doc.getElementsByTagName(self.xmlTag)) {
                  var c = e.attributes["kodo"];
                  //console.log(c);
                  codes[c.value] = e.textContent;
              } 
              self.codes = codes;
  
              if (selection) {
                self.fill.call(self,selection);
              } 
          });

      // se ni jam ŝargis iam antaŭw, ni eble nur devas plenigi la videbalan elektilon
      } else {
        if (selection) {
          self.fill.call(self,selection);
        } 
      }
    };  
  };

  function klavo(event) {
    var key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
    //  alert(key);

    // RET: aldonu enŝovon (spacojn) komence de nova linio
    if (key == 13) {  
      var scrollPos = xmlarea.scrollPos();        
      indent = xmlarea.indent();
      xmlarea.selection("\n"+indent);
      xmlarea.scrollPos(scrollPos);
      event.preventDefault();

    // X aŭ x
    } else if (key == 88 || key == 120) {   
      var cx = document.getElementById("r:cx");
      if (event.altKey) {	// shortcut alt-x  --> toggle cx
        cx.value = 1 - cx.value;
        event.preventDefault();
      }
  
      if (cx.value != "1") return true;

      var txtarea = document.getElementById('r:xmltxt');
      var scrollPos = xmlarea.scrollPos();
      selText = xmlarea.selection();

      if (selText != "") return true;

      var before = xmlarea.charBefore();
      var nova = cxigi(before, key);

      if (nova != "") {
        //range.text = nova;
        xmlarea.selection(nova);
        
        xmlarea.scrollPos(scrollPos);
        event.preventDefault();
      }
      
    // T aŭ t aŭ kir-t aŭ kir-T
    } else if (key == 84 || key == 116 || key == 1090 || key == 1058) {   
      if (event.altKey) {	// shortcut alt-t  --> trd
        insert_xml("trd_lng")
      }
    }
  };


  function insert_xml(shabl) {
    var txtarea = document.getElementById('r:xmltxt');
    var selText;

    var pos = xmlarea.scrollPos();
    selText = xmlarea.selection();
    var text = shablono(shabl,selText).replace(/\n/g,"\n"+xmlarea.indent());
    xmlarea.selection(text);
    xmlarea.scrollPos(pos)
  };

    
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

        xmlarea.scrollPos(txtarea.scrollHeight * line / lastline)
        //txtarea.scrollTop = txtarea.scrollHeight * line / lastline;   
    
    //    alert("tio baldaux funkcias. tag="+tag+" pos="+pos+" line="+line+ " lastline="+lastline);
    //    alert("scrollTop="+txtarea.scrollTop+" scrollHeight="+txtarea.scrollHeight);
      }
  }

  // memoras valorojn de kelkaj kampoj en la loka memoro de la retumilo
  function store_preferences() {
    var prefs = {};
    for (key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo','r:cx']) {
      prefs[key] = document.getElementById(key).value;
    }
    window.localStorage.setItem("redaktilo_preferoj",JSON.stringify(prefs));  
  }

  // reprenas memorigitajn valorojn de kelkaj kampoj el la loka memoro de la retumilo
  function restore_preferences() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : null);
    if (prefs) {
      for (key of ['r:redaktanto','r:trdlng','r:klrtip','r:reftip','r:sxangxo']) {
        document.getElementById(key).value = prefs[key];
      }
    }
  }

  function restore_preferences_xml() {
    var str = window.localStorage.getItem("redaktilo_preferoj");
    var prefs = (str? JSON.parse(str) : null);
    document.getElementById('r:cx').value = prefs['r:cx'];
  }

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

  function fs_toggle(id) {
    var el = document.getElementById(id);
    var fs_id;
    if (! el.classList.contains('aktiva')) {
      for (ch of el.parentElement.children) {
        ch.classList.remove('aktiva')
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

  function createTElement(name,text) {
    var el = document.createElement(name);
    var tx= document.createTextNode(text);
    el.appendChild(tx); return el;
  }

  function addAttribute(node,name,value) {
    var att = document.createAttribute(name);
    att.value = value;
    node.setAttributeNode(att);    
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
    };
    for (e of err) {
      var li = createTElement("li",e);               
      ul.appendChild(li);       
    }
  }

  function add_err_msg(msg, matches) {
    var errors = [];

    for (m of matches) {
      var m = msg+m[1];
      errors.push(m)
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
        errors.push("La marko \"" + mrk + "\" (" + el + ") ne komenciĝas je la dosieronomo (" + art + ".).")
      } else if ( mrk.indexOf('0',art.length) < 0 ) {
        errors.push("La marko \"" + mrk + "\" (" + el + ") ne enhavas \"0\" (por tildo).")
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

    eraroj.textContent='';
    eraroj.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
    eraroj.parentNode.setAttribute("open","open");

    kontrolu_xml_loke(art,xml);
    if (xml.startsWith("<?xml")) {
      vokomailx("nur_kontrolo",art,xml);
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
    var art = document.getElementById("r:art").value;
    var xml = document.getElementById("r:xmltxt").value;

    var eraroj = document.getElementById("r:eraroj");
    eraroj.textContent='';
    eraroj.classList.remove("collapsed"); // ĉu nur kiam certe estas eraroj?
    eraroj.parentNode.setAttribute("open","open");

    // kontrolu loke revenas nur post kontrolo,
    // dum kontrole ene de vokomailx as nesinkrona
    kontrolu_xml_loke(art,xml);

    if (xml.startsWith("<?xml") 
      && document.getElementById("r:eraroj").textContent == '')
        vokomailx("forsendo",art,xml);

  }

  function create_new_art() {
    var art = document.getElementById("r:nova_art").value;
    var ta = document.getElementById("r:xmltxt");
    document.getElementById("r:art").value = art;
    document.getElementById("r:art_titolo").textContent = art;
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
  }

  function vokohtmlx(xml) {
    HTTPRequest('POST','/cgi-bin/vokohtmlx.pl',
    {
      xmlTxt: xml
    },
    function (data) {
      // Success!
      var parser = new DOMParser();
      var doc = parser.parseFromString(data,"text/html");
      var rigardo = document.getElementById("r:tab_trigardo");

      var article = doc.getElementsByTagName("article");
      if (article) {
        rigardo.textContent = '';
        rigardo.append(...article);  
        artikolo.preparu_art();

        // eble tio devas esti en preparu_art?
        // refaru matematikajn formulojn, se estas
        if (typeof(MathJax) != 'undefined' && MathJax.Hub) {
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        }
      
      } else {
        // FARENDA: post kiam ĉiuj artikoloj havos HTML5-strukturon ni povos forigi tion
        var body = doc.body;
        var pied = body.querySelector("span.redakto");
        if (pied) pied.parentElement.removeChild(pied);
    
        rigardo.textContent = '';
        rigardo.append(...body.childNodes);  
      }
    });
  }
    
  function vokomailx(command,art,xml) {

    var red = document.getElementById("r:redaktanto").value;
    var sxg = document.getElementById("r:sxangxo").value;

    // console.log("vokomailx art:"+art);
    // console.log("vokomailx red:"+red);
    // console.log("vokomailx sxg:"+sxg);

    HTTPRequest('POST','/cgi-bin/vokomailx.pl',
      {
        xmlTxt: xml,
        art: art,
        redaktanto: red,
        sxangxo: sxg,
        command: command
      },
      function (data) {
        // Success!
        var parser = new DOMParser();
        var doc = parser.parseFromString(data,"text/html");

        var err_list = document.getElementById("r:eraroj");

        for (div of doc.body.getElementsByClassName("eraroj")) {
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

          // finu redaktadon
          var nb; if (nb = document.getElementById("x:redakt_btn")) {
            nb.classList.add("kasxita");
          }

        } else if (command == "nur_kontrolo" 
          && err_list.textContent.replace(/\s+/,'') == '') {
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
    if (art) {

      HTTPRequest('GET','/revo/xml/'+art+'.xml',{},
      function(data) {
          // Success!
          document.getElementById('r:xmltxt').value = data;
          document.getElementById("r:art").value = art;
          var titolo = document.getElementById("r:art_titolo");
          titolo.textContent = art; 
          titolo.setAttribute("href","/revo/art/"+art+".html");
          xmlarea.resetCursor();     
        });
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
    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    if (document.getElementById("r:xmltxt")) {
      restore_preferences_xml();
      sf(0, 0, 1);
      //if (!xmlarea) 
      xmlarea = new Textarea("r:xmltxt");
      load_xml(params); // se doniĝis ?art=xxx ni fone ŝargas tiun artikolon
    }

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // klav-premoj en XML-redaktilo
    document.getElementById("r:xmltxt")
      .addEventListener("keypress",klavo);

    // butonoj por navigi inter drv kaj en-/elŝovo
    var nav = document.getElementById("r:nav_btn");
    nav.querySelectorAll("button").forEach(function (b) { 
        var val = b.getAttribute("value");
        if (val) {
          var n = parseInt(val.substring(0,2));
          var t = val.substring(2);
          if ( t == "d") {
            b.addEventListener("click", function() { nextTag('<drv',n) })
          } else if (t == "i") {
            b.addEventListener("click", function() { xmlarea.indent(n) })
          }
        }
    });
    document.getElementById("r:cx")
      .addEventListener("click",function(event) {
        event.preventDefault();
        var cx = event.target;
        cx.value = 1 - cx.value; 
        document.getElementById('r:xmltxt').focus()
    });

    // sub-paĝoj "redakti", "antaŭrigardo"
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
  }

  function preparu_menu() {
    // enlegu bezonaĵojn (listojn, XML-artikolon, preferojn)
    restore_preferences();
    revo_codes.lingvoj.load();
    revo_codes.fakoj.load("r:sfak");
    revo_codes.stiloj.load("r:sstl");

    /******************
     *  preparu aktivajn elmentoj / eventojn
     *  **************/

    // montru redakto-butonon en navig-trabo
    var nb; if (nb = document.getElementById("x:redakt_btn")) {
      nb.classList.remove("kasxita");
    }

    // butono por kontroli
    document.getElementById("r:kontrolu")
      .addEventListener("click",rkontrolo);

    // butono por konservi
    document.getElementById("r:konservu")
      .addEventListener("click",rkonservo);

    // navigi inter diversaj paneloj kun enmeto-butonoj ktp.
    var fs_t = document.getElementById("r:fs_toggle");
    fs_t.querySelectorAll("a").forEach(function (a) { 
      a.removeAttribute("onclick") 
    });
    fs_t.addEventListener("click", function(event) {
      var a = event.target.closest("a");
      fs_toggle(a.id);
    });

    // butonoj sur tiuj paneloj por enmeti elementojn
    var v_sets = document.getElementById("r:v_sets");
    for (b of v_sets.querySelectorAll("button")) {
      if (b.id == "r:create_new_art") {
        b.addEventListener("click", create_new_art);
      }
      if (b.classList.contains("help_btn"))
        b.addEventListener("click", function(event) {
          helpo_pagho(event.target.getAttribute("value"))
        })
      else
        b.addEventListener("click",function(event) {
          insert_xml(event.target.getAttribute("value"))
        });
    }
  }  

  when_doc_ready(function() { 
    console.log("redaktilo.when_doc_ready...:" +  location.href);
    window.onbeforeunload = function() {
      if (this.document.getElementById('r:redaktilo'))
        store_preferences();
    }  

  });

  // eksportu publikajn funkction
  return {
    preparu_red: preparu_red,
    preparu_menu: preparu_menu,
    klavo: klavo,
    rantaurigardo: rantaurigardo,
    shablono: shablono
  }
}();