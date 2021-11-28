
/* jshint esversion: 6 */

// (c) 2018 - 2019 - Wolfram Diestel
// laŭ GPL 2.0

console.debug("Instalante la artikolfunkciojn...");
$.widget( "redaktilo.Artikolo", {

    options: {
        xmlarea: undefined,
        dosiero: '',
        reĝimo: 'redakto', // ĉe novaj artikoloj 'aldono'   
        poziciŝanĝo: null, // evento
        tekstŝanĝo: null // evento
    },

    _create: function() {
        this._super();

        this._regex_mrk = {
            _rad: new RegExp('<rad>([^<]+)</rad>',''),
            _dos: new RegExp('<art\\s+mrk="\\$Id:\\s+([^\\.]+)\\.xml|<drv\\s+mrk="([^\\.]+)\\.',''),
            _mrk: new RegExp('\\smrk\\s*=\\s*"([^"]+)"','g'),
            _snc: new RegExp('<snc\\s*>\\s*(?:<[^>]+>\\s*){1,2}([^\\s\\.,;:?!()]+)','g')
        };

        this._regex_klr = {
            _klr: new RegExp('<klr>\\.{3}</klr>','g')
        };

        this._regex_drv = {
            _lbr: new RegExp('\n','g'),
            _mrk: new RegExp('<drv\\s+mrk\\s*=\\s*"([^"]+)"', ''),
            _kap: new RegExp('<drv[^>]+>\\s*<kap>([^]*)</kap>', ''),
            _var: new RegExp('<var>[^]*</var>','g'),
            _ofc: new RegExp('<ofc>[^]*</ofc>','g'),
            _fnt: new RegExp('<fnt>[^]*</fnt>','g'),
            _tl1: new RegExp('<tld\\s+lit="(.)"[^>]*>','g'),
            _tl2: new RegExp('<tld[^>]*>','g')
        };

        this._regex_txt = {
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

        this._regex_xml = {
            _spc: new RegExp('\\s+/>','g'),
            _amp: new RegExp('&amp;','g'),
            _ent: new RegExp('&([a-zA-Z0-9_]+);','g')
        };

        this.restore();
        this._change_count = 0;

        this._on({
            dragover: this._dragOver,
            drop: this._drop,
            keydown: this._keydown, // traktu TAB por enŝovoj
            //keypress: this._keypress, // traktu linirompon
            keyup: this._keyup, // traktu tekstŝanĝojn
            focus: function(event) { this._trigger("poziciŝanĝo",event,null); }, 
            click: function(event) { this._trigger("poziciŝanĝo",event,null); }, 
            change:  this._change        
        }); // dum musalŝovo
    },

    backup: function() {
        const xmlarea = this.option("xmlarea");
        const xml = xmlarea.syncedXml();
        window.localStorage.setItem("red_artikolo",JSON.stringify({
            'xml': xml, //this.element.val(), 
            'nom': this.option.dosiero,
            'red': this.option.reĝimo
        }));
    },

    // restarigi el loka krozil-memoro
    restore: function() {
        var str = window.localStorage.getItem("red_artikolo");
        var art = (str? JSON.parse(str) : null);
        if (art && art.xml) {
            //this.element.val(art.xml);
            const xmlarea = this.option("xmlarea");
            xmlarea.setText(art.xml);
            this.option.reĝimo = art.red;
            // ni povus alternaitve demandi xmlarea.getDosiero(), 
            // se ni certas, ke enestas mrk
            this.option.dosiero = art.nom;
            this._setRadiko();
        }
    },

    nova: function(art) {
        const nova_art = new XMLArtikolo(art).xml();
        //this.element.val();
        const xmlarea = this.option("xmlarea");
        xmlarea.setText(nova_art);

        // notu, ke temas pri nova artikolo (aldono),
        // tion ni bezonas scii ĉe forsendo poste
        this._setOption('reĝimo','aldono');
        this._setOption('dosiero',art.dos);
    },

    // aktualigu artikolon el data
    load: function(dosiero,data) {
        const xmlarea = this.option("xmlarea");
        xmlarea.setText(data);
        //var e = this.element;
        //e.val(data);
        this.element.change();
        this._setOption("reĝimo",'redakto');
        this._setOption("dosiero",dosiero);
    },

    goto: function(line_pos,len = 1) {
        var p = line_pos.split(":");
        var line = p[0] || 1;
        var lpos = p[1] || 1;
        var e = this.element;
        var pos = this.pos_of_line(line-1) + ( lpos>0 ? lpos-1 : 0 );
        e.selectRange(pos); // rulu al la pozicio
        e.selectRange(pos,pos+len); // nur nun marku <len> signojn por pli bona videbleco
    },

    insert: function(xmlstr) {
        var e = this.element;
        e.insert(xmlstr);
        e.change();    
    },

    _setOption: function( key, value ) {
        this._super(key,value);
        if (key === "dosiero") {
            this._setRadiko();
        }
    },

    _setRadiko: function() {
        /*
        var xml = this.element.val();
        var m = xml.match(this._regex_mrk._rad);
        this._radiko = m ? m[1] : '';
        */
       const xmlarea = this.option("xmlarea");
       this._radiko = xmlarea.getRadiko();
    },

    _dragOver: function(event) {
        event.stopPropagation();
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    },

    // legu artikolon el muse alŝovita teksto
    _drop: function(event) {
        var el = this.element; //$(event.target);
        var art = this;
        event.stopPropagation();
        event.preventDefault();
        var file = event.originalEvent.dataTransfer.files[0]; // first of Array of all files
        if ( file && file.type.match(/.xml/) ) {
            var reader = new FileReader();
            reader.onload = function(ev) { 
                // when finished reading file data.
                var xml = ev.target.result;
                // el.val(xml);
                const xmlarea = art.option("xmlarea");
                xmlarea.setText(xml);
                art.option.reĝimo = 'redakto';
            };
            // start reading the file data.
            reader.readAsText(file); 
        }       
    },

    _keydown: function(event) {
        var keycode = event.keyCode || event.which; 
   
        // traktu TAB por ŝovi dekstren aŭ maldekstren plurajn liniojn
        if (keycode == 9) {  // TAB
           event.preventDefault(); 

           var elekto = this.elekto();

           // se pluraj linioj estas elektitaj
           if (elekto.indexOf('\n') > -1) {
                // indent
                if (event.shiftKey == false)
                    this.element.indent(2);
                    else
                    this.element.indent(-2);
            } else if ( !elekto ) {
                // traktu enŝovojn linikomence...
                var before = this.char_before_pos();
                if (before == '\n') {
                    var indent = this.current_indent(-1) || '  ';
                    this.elekto(indent); // TODO: kaj ŝoviĝu post tio...
                } else if (before == ' ') {
                    // aldonu du spacojn
                    this.elekto('  ');
                }
            }
        } else if (keycode == 8) { // BACKSPACE
            var spaces = this.chars_before_pos();
            if (spaces.length > 0 && all_spaces(spaces) && 0 == spaces.length % 2) { // forigu du anstataŭ nur unu spacon
                event.preventDefault(); 

                var el = this.element;
                var pos = el.getCursorPosition();
                el.selectRange(pos-2, pos);
                el.insert(''); 
            }
        }
    },

    /*
    _keypress: function(event) {
        var keyCode = event.keyCode || event.which; 

        if (keyCode == 13) {    
            var enshovo = this.current_indent();     
            console.log("nova linio..., enŝovo: "+enshovo.length);
            this.element.insert("\n"+enshovo);
            return false;
        }
    },
    */

    _keyup: function(event) {
        this._trigger("poziciŝanĝo",event,{});
        
        var keycode = event.keyCode || event.which; 
        if ( keycode < 16 
            || keycode == 32 
            || (keycode > 40 && keycode < 91) 
            || (keycode > 93 && keycode < 111) 
            || keycode > 145 ) {

            this._trigger("tekstŝanĝo",event,{});
        }
    },

    _change: function(event) {
        this._trigger("poziciŝanĝo",event,{});
        this._trigger("tekstŝanĝo",event,{});

        // de tempo al tempo sekurigu la tekston
        this._change_count++; 
        if (this._change_count % 20) this.backup();        
        
        /* tie ni uzas eventon "input" rekte en xmlarea mem
        verŝajne ni devos la suprajn liniojn "tekstŝanĝo" pp ankaŭ
        pendigi al "input" anst. "change"!
        const xmlarea = this.option("xmlarea");
        xmlarea.setUnsynced();
        */
        
    },

    // redonas la radikon de la artikolo
    radiko: function() {
        return this._radiko;
    },

    // redonas aŭ anstataŭigas la elektitan tekston
    elekto: function(insertion,elektita) {
        var el = this.element;
        // redonu la elektitan tekston 
        if (insertion === undefined) {
            return el.textarea_selection();
        // enŝovu la tekston anstataŭ la elektita 
        } else {
            // se necese, kontrolu, ĉu elektita teksto kongruas kun parametro <elektita> 
            if (elektita == el.textarea_selection() || !elektita)
                el.insert(insertion);
            else
                console.warn("Ne estas la teksto '" + elektita +"' ĉe la elektita loko! Do ĝi ne estas anstatŭigata.");
        }
    },

    // kalkulu la signoindekson por certa linio
    pos_of_line(line) {
        var lines = this.element.val().split('\n');
        var pos = 0;
        
        for (var i=0; i<line; i++) {
            pos += lines[i].length+1;
        }
        return pos;
    },

    // eltrovu la enŝovon de la linio antaŭ la nuna pozicio
    current_indent(shift = 0) {
        var el = this.element;
        var pos = el.getCursorPosition();
        var text = this.element.val();
        return enshovo_antaua_linio(text,pos + shift);
    },

    // eltrovu la signon antaŭ la nuna pozicio
    char_before_pos() {
        var el = this.element;
        var pos = el.getCursorPosition();
        if (pos > 0)
            return this.element.val()[pos-1];
    },

    // eltrovu la signojn antaŭ la nuna pozicio (ĝis la linikomenco)
    chars_before_pos() {
        var el = this.element;
        var pos = el.getCursorPosition();
        var val = this.element.val();
        var p = pos;
        while (p>0 && val[p] != '\n') p--;
        return val.substring(p+1,pos);
    },    

    /*
    elekto_menuo: function() {
        var ign = this._ignoreSelect
        //console.info("ignoreSelect: "+ign);
        
        if ( ign > 0 ) {
            // la truko ne funkcias en Firefox, ĉar ĝi ĵetas tri "select"-eventojn
            // dum navigado al derivaĵo / linio
            this._ignoreSelect = ign-1;
        } else {
          var elektita = this.elekto();
          if (elektita != "<drv " && elektita != "<" && elektita != "")
            $( "#elekto_menuo").show(); 
        }
    } */

    // redonu dosieronomon trovante ĝin en art-mrk aŭ drv-mrk
    art_drv_mrk: function() {
        const xmlarea = this.option("xmlarea");
        return xmlarea.getDosiero();
    },

    // eltrovas la markojn (mrk=) de derivaĵoj, la korespondajn kapvortojn kaj liniojn
    // PLIBONIGU: ni povus preni tion supozeble nun rekte el la xmlarea-strukturo
    // kontrolu, kie ni fakte uzas drv_markoj...
    drv_markoj: function() {
        const xmlarea = this.option("xmlarea");
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
        var drvoj = [], pos = 0, line = 0;

        if (xmlStr) {
            var drv = xmlStr.split('</drv>');
            var rx = this._regex_drv;
            
            for (var i=0; i<drv.length; i++) {
                var d = drv[i];
                // kiom da linioj aldoniĝas?
                var lmatch = d.match(rx._lbr);
                var lcnt = lmatch? lmatch.length : 0;
                // find mrk
                var match = d.match(rx._mrk); 
                if (match) {
                    mrk = match[1];
                    var dpos = match.index;
                    // count lines till <cnt
                    var lmatch2 = d.substr(0,dpos).match(rx._lbr);
                    var dline = lmatch2? lmatch2.length : 0;
                    // find kap
                    match = d.match(rx._kap); 
                    if (match) {
                        kap = match[1]
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
    },

    // eltrovas ĉiujn markojn (mrk=) de derivaĵoj, sencoj ktp.
    // PLIBONIGU: elprenu el xmlarea anstatataŭe
    markoj: function() {
        const xmlarea = this.option("xmlarea");
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
        var mrkoj = {};

        if (xmlStr) {
            var rx = this._regex_mrk;
            while ((m = rx._mrk.exec(xmlStr)) !== null) {
                //var matches = xmlStr.match(rx._mrk);
                let m1 = m[1];
                if (mrkoj[m1]) mrkoj[m1] = m.index; else mrkoj[m1] = 1;
            }
        }
        return mrkoj;
    },   
    
    // PLIBONIGU: ŝovu tiun funkcion al xmlarea
    snc_sen_mrk: function() {
        const xmlarea = this.option("xmlarea");
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
        var sncoj = {};

        if (xmlStr) {
            var rx = this._regex_mrk;
            while ((m = rx._snc.exec(xmlStr)) !== null) {
                var mrk = m[1]; // la unua vorto post <snc>... 
                // se dua estas majusklo ni supozas mallongigon, aliokaze ni minuskligas
                if (mrk.length>1 && mrk[1].toLowerCase() == mrk[1]) mrk = mrk.toLowerCase();
                sncoj[m.index] = mrk;
            }
        }
        return sncoj;
    },

    // PLIBONIGU: ŝovu al xmlarea
    // klarigoj el tri punktoj kie mankas []
    klr_ppp: function() {
        const xmlarea = this.option("xmlarea");
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
        var klroj = {};

        if (xmlStr) {
            var rx = this._regex_klr;
            while ((m = rx._klr.exec(xmlStr)) !== null) {
                var klr = m[1];
                klroj[m.index] = klr;
            }
        }
        return klroj;
    },    

    // elprenas la tradukojn de certa lingvo el XML-artikolo
    // PLIBONIGU: uzu xmlarea por tiu funkcio!
    tradukoj: function(lng) {
        var tradukoj = [];        
        var rx = this._regex_xml;

        const xmlarea = this.option("xmlarea");
        var xml = xmlarea.syncedXml() //this.element.val();
            .replace(rx._ent,'?'); // entities cannot be resolved...
        
        var artikolo;
        try {
            artikolo = $("vortaro",$.parseXML(xml));
        } catch(e) {
            console.error("Pro nevalida XML ne eblas trovi tradukojn.");
            //console.error(e);
            return;
        }
        
        artikolo.find("[mrk]").each(function(index) {
            var mrk = $(this).attr("mrk");
            
            // ignori artikolon kaj rimarkojn, kiuj povas havi mrk
            if (this.tagName == "rim" || this.tagName == "art") return;

            // el artikolo-Id uzu ekstraktu la dosiernomon
            //if (mrk.startsWith('$')) mrk = mrk.split(' ',2)[1].split('.')[0];
            
            // enshovi sencojn por pli facile legi la tabelon poste..
            //if (this.tagName == "snc" || this.tagName == "subsnc" || this.tagName == "rim") mrk = "&nbsp;&nbsp;&nbsp;"+mrk;
            
            var kap = '';
            //var trd = '';
            $(this).children("kap")
                .contents()  
                .each(function(){
                    if ( this.tagName == "tld" )
                        kap += '~';
                    else if ( this.nodeType === 3 ) {
                        kap += this.textContent.replace(',',',.. ');
                    }
                });

            trdj = [];
            $(this).children("trd[lng='"+lng+"']").each(
                function() {
                    trdj.push(innerXML(this));
                        });
            $(this).children("trdgrp[lng='"+lng+"']").children("trd").each(
                function() {
                    trdj.push(innerXML(this));
                });
            tradukoj.push({mrk: mrk, kap: kap, trd: trdj});
        });
        
        return tradukoj;
    },

    insert_tradukojn: function (tradukoj) {
        // tradukoj estas {mrk1: array(), mrk2: ...}
        //for (trd in tradukoj) {
        var rx = this._regex_xml;

        const xmlarea = this.option("xmlarea");
        var xml = xmlarea.syncedXml() //this.element.val();
            .replace(rx._ent,'&amp;$1;'); // entities cannot be resolved...
        
        var artikolo;
        try {
            artikolo = $("vortaro",$.parseXML(xml));
        } catch(e) {
            console.error("Pro nevalida XML ne eblas enŝovi tradukojn.");
            console.error(e);
            return;
        }
        
        artikolo.find("[mrk]").each(function(index) {
            var mrk = $(this).attr("mrk");
            // kiom da spacsignojn metu komence?
            var shov = enshovo($(this)[0].previousSibling.nodeValue) + "  ";
            // ĉu estas tradukoj por enmeti en tiun elementon (drv/snc) ktp.
            if (tradukoj[mrk]) {
                for (let lng in tradukoj[mrk]) {
                    // $(this).append(tradukoj[mrk][lng][0])
                    insert_trd_lng(this,shov,lng,tradukoj[mrk][lng]);
                    //$(this).each(insert_trd_lng_2,[shov,lng,tradukoj[mrk][lng]])
                }
            }
        });
        
        var prologo = '<?xml version="1.0"?>\n<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">\n\n';
        xml = outerXML(artikolo[0]).replace(rx._amp,'&').replace(rx._spc,'');  // ĉi lasta aparte pro Edge, kiu eligas "<tld />"            
        //if (xml) this.element.val(prologo + xml);
        if (xml) {
            const xmlarea = this.option("xmlarea");
            xmlarea.setText(prologo + xml);
        }
        this.element.change();    
    },

    drv_before_cursor: function() {
        var line_pos = this.element.getCursorLinePos();
        var drvoj = this.drv_markoj();
        for(var i=drvoj.length-1; i>=0; i--) {
            drv = drvoj[i];
            if (drv.line < line_pos.line) {
                return drv;
            }
        }
        // aliokaze redonu la unuan
        return drvoj[0];  // kaŭzas eraron, se troviĝis neniu!
    },

    // forigas XML-strukturon lasante nur la nudan tekston
    // krome aldonas lininumeron en la formo [n] komence
    // de ĉiu linio
    plain_text: function(line_numbers=false) {
        var radiko = this._radiko;
        var rx = this._regex_txt;

        const xmlarea = this.option("xmlarea");
        var t = (xmlarea.syncedXml() //this.element.val()
            .replace(rx._tl0,radiko)
            .replace(rx._tld,'$1'+radiko.substr(1)));

        // line numbers?
        if (line_numbers) {
            var lines = t.split('\n');
            t = ''; n=1;
            for (i = 0; i<lines.length; i++) {
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
    },

    // transformas la rezulton de plain_text en objekton,
    // kies ŝlosiloj estas la lininumeroj kaj kies
    // valoroj estas la nudaj tekst-linioj
    lines_as_dict: function(xml) {
        var lines = this.plain_text(true).split('\n');
        var result = {};
        for (i=0; i<lines.length; i++) {
            var line = lines[i];
            var d = line.indexOf(']');
            var no = line.substr(1,d-1);
            var text = line.substr(d+1);
            if (text.trim().length > 1) {
                result[no] = text;
            }
        }
        return result;
    }
});

