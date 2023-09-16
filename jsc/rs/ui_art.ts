
/* 
 (c) 2018 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/


import * as x from '../x';
import { XmlRedakt } from '../x';
import { DOM } from '../ui';

import { preferoj } from '../a/preferoj';
import { XMLArtikolo } from './sxabloniloj';

console.debug("Instalante la artikolfunkciojn...");

export class Artikolo extends XmlRedakt {

    static regex_mrk = {
        _rad: new RegExp('<rad>([^<]+)</rad>',''),
        _dos: new RegExp('<art\\s+mrk="\\$Id:\\s+([^\\.]+)\\.xml|<drv\\s+mrk="([^\\.]+)\\.',''),
        _mrk: new RegExp('\\smrk\\s*=\\s*"([^"]+)"','g'),
        _snc: new RegExp('<snc\\s*>\\s*(?:<[^>]+>\\s*){1,2}([^\\s\\.,;:?!()]+)','g')
    };


    static regex_klr = {
        _klr: new RegExp('<klr>\\.{3}</klr>','g')
    };

    static regex_drv = {
        _lbr: new RegExp('\n','g'),
        _mrk: new RegExp('<drv\\s+mrk\\s*=\\s*"([^"]+)"', ''),
        _kap: new RegExp('<drv[^>]+>\\s*<kap>([^]*)</kap>', ''),
        _var: new RegExp('<var>[^]*</var>','g'),
        _ofc: new RegExp('<ofc>[^]*</ofc>','g'),
        _fnt: new RegExp('<fnt>[^]*</fnt>','g'),
        _tl1: new RegExp('<tld\\s+lit="(.)"[^>]*>','g'),
        _tl2: new RegExp('<tld[^>]*>','g')
    };

    
///    static regex_txt = {
///        _tl0: new RegExp('<tld\\s*\\/>','g'),
///        _tld: new RegExp('<tld\\s+lit="([^"]+)"\\s*/>','g'),
///        _comment: new RegExp('\\s*<!--[^]*?-->[ \\t]*','g'),
///        _trdgrp: new RegExp('\\s*<trdgrp[^>]*>[^]*?</trdgrp\\s*>[ \\t]*','g'),
///        _trd: new RegExp('\\s*<trd[^>]*>[^]*?</trd\\s*>[ \\t]*','g'),
///        _fnt: new RegExp('\\s*<fnt[^>]*>[^]*?</fnt\\s*>[ \\t]*','g'),
///        _ofc: new RegExp('\\s*<ofc[^>]*>[^]*?</ofc\\s*>[ \\t]*','g'),
///        _gra: new RegExp('\\s*<gra[^>]*>[^]*?</gra\\s*>[ \\t]*','g'),
///        _uzo: new RegExp('\\s*<uzo[^>]*>[^]*?</uzo\\s*>[ \\t]*','g'),
///        _mlg: new RegExp('\\s*<mlg[^>]*>[^]*?</mlg\\s*>[ \\t]*','g'),
///        _frm: new RegExp('<frm[^>]*>[^]*?</frm\\s*>','g'),
///        _adm: new RegExp('\\s*<adm[^>]*>[^]*?</adm\\s*>[ ,\t]*','g'),
///        _aut: new RegExp('\\s*<aut[^>]*>[^]*?</aut\\s*>[ ,\t]*','g'),
///        _xmltag: new RegExp('<[^>]+>','g'),
///        _lineno: new RegExp('^(?:\\[\\d+\\])+(?=\\[\\d+\\])','mg'),
///        _nom: new RegExp('<nom[^>]*>[^]*?</nom\\s*>','g'),
///        _nac: new RegExp('<nac[^>]*>[^]*?</nac\\s*>','g'),
///        _esc: new RegExp('<esc[^>]*>[^]*?</esc\\s*>','g')
///    };

    static regex_xml = {
        _spc: new RegExp('\\s+/>','g'),
        _amp: new RegExp('&amp;','g'),
        _ent: new RegExp('&([a-zA-Z0-9_]+);','g')
    };

    /*
    public opcioj: {
        xmlarea: XmlRedakt,
        dosiero: string,
        reĝimo: 'redakto'|'aldono', // ĉe novaj artikoloj 'aldono'   
        poziciŝanĝo: Function, // evento
        tekstŝanĝo: Function // evento
    };
    */

    /*
    static art_aprioraj = {
        //xmlarea: undefined, // 'undefined' ne superŝargiĝos en UIElement.fandu, ĉu ni ŝanĝu tie?
        dosiero: '',
        reĝimo: 'redakto', 
        poziciŝanĝo: null, 
        tekstŝanĝo: null 
    }*/

    /// _change_count = 0

    static artikolo(element: HTMLElement|string) {        
        let a = super.obj(element);
        if (a instanceof Artikolo) return a;
    };

    /*
    static xmlarea(element: HTMLElement|string) { 
        const art = Artikolo.artikolo(element);
        if (art) return art.opcioj.xmlarea;
    }*/

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj.post_aldono, opcioj.subtekst_elekto,
            opcioj.poziciŝanĝo, opcioj.tekstŝanĝo); //, Artikolo.art_aprioraj);

        this.restore();
        /// this._change_count = 0;

        this._on({
            dragover: this._dragOver,
            drop: this._drop,
            keydown: this._keydown, // traktu TAB por enŝovoj
            //keypress: this._keypress, // traktu linirompon
            /// keyup: this._keyup, // traktu tekstŝanĝojn
            /// focus: function(event) { this._trigger("poziciŝanĝo",event,null); }, 
            /// click: function(event) { this._trigger("poziciŝanĝo",event,null); }, 
            /// change: this._change        
        }); // dum musalŝovo
    };


    // restarigi el loka krozil-memoro
    restore() {
        /*
        var str = window.localStorage.getItem("red_artikolo");
        var art = (str? JSON.parse(str) : null);
        */
        /// const xmlarea = this.opcioj.xmlarea;

        const art = this.relegu("red_artikolo","xml");

        if (art && art.xml) {
            /// xmlarea.setText(art.xml);

            this.opcioj.reĝimo = art.red;
            // ni povus alternaitve demandi xmlarea.getDosiero(), 
            // se ni certas, ke enestas mrk
            this.opcioj.dosiero = art.nom;
            //this._setRadiko();
        }

        // preferataj lingvoj
        preferoj.restore();
    };

    nova(art) {
        const nova_art = new XMLArtikolo(art).xml();
        //this.element.val();
        /// const xmlarea = this.opcioj.xmlarea;
        this.teksto = nova_art;
        /// this._change_count = 0;

        // notu, ke temas pri nova artikolo (aldono),
        // tion ni bezonas scii ĉe forsendo poste
        this.opcioj['reĝimo'] = 'aldono';
        this.opcioj['dosiero'] = art.dos;
    };

    // aktualigu artikolon el data
    load(dosiero,data) {
        /// const xmlarea = this.opcioj.xmlarea;
        this.teksto = data;

        //var e = this.element;
        //e.val(data);
        
        //this.element.change();
        this._trigger("change");
        /// this._change_count = 0;
        this.opcioj["reĝimo"] = 'redakto';
        this.opcioj["dosiero"] = dosiero;
    };


    /* PLIBONIGU: ĉu ni plu bezonas insert(), aŭ ĉu ni lasu
    rekte voki al uzantaj funkcioj xmlarea.selection...?
    */
    insert(xmlstr, sync=false) {
        const e = this.element;
        //e.insert(xmlstr);
        /// const xmlarea = this.opcioj.xmlarea;
        this.elektenmeto(xmlstr);
        
        /// xmlarea.selection(xmlstr);
        // se postulate, tuj sinkronigu, eventuale rekreante la strukturon
        if (sync) this.sinkronigu();
        //e.change();
        this._trigger("change");
    };

    /*
    // enŝovu novan tekston post elemento s_id
    insert_post(xmlstr,s_id) {
        /// const xmlarea = this.opcioj.xmlarea;
        /// xmlarea.xmlstruct.insertAfterId(s_id,xmlstr);
        this.enŝovu_post(s_id,xmlstr);

        //e.change();
        this._trigger("change");
    };*/

    _dragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    };

    // legu artikolon el muse alŝovita teksto
    _drop(event) {
        const el = this.element; //$(event.target);
        const art = this;

        event.stopPropagation();
        event.preventDefault();
        var file = event.originalEvent.dataTransfer.files[0]; // first of Array of all files
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
     * PLIBONIGU: tion povus fari la klaso XmlRedakt mem, ĉu?
     * 
     */
    _keydown(event) {
        const keycode = event.keyCode || event.which;
   
        // traktu TAB por ŝovi dekstren aŭ maldekstren plurajn liniojn
        // nun en  klaso ui.Tekst
        /*
        const xmlarea = this.opcioj.xmlarea; 
        if (keycode == 9) {  // TAB
           event.preventDefault(); 

           var elekto = this.elekto()||'';

           // se pluraj linioj estas elektitaj
           if (elekto.indexOf('\n') > -1) {
                // indent
                if (event.shiftKey == false)
                    //this.element.indent(2);
                    xmlarea.indent(2);
                else
                    //this.element.indent(-2);
                    xmlarea.indent(-2);
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
            if (this.elekto() == '') { // nur se nenio estas elektita!
                var spaces = this.chars_before_pos();
                if (spaces.length > 0 && x.all_spaces(spaces) && 0 == spaces.length % 2) { // forigu du anstataŭ nur unu spacon
                    event.preventDefault(); 
    
                    var el = this.element as HTMLInputElement;
                    var pos = xmlarea.positionNo(); // el.getCursorPosition();
                    //el.selectRange(pos-2, pos);
                    //el.insert(''); 
                    el.selectionStart = pos-2;
                    el.selectionEnd = pos;
                    xmlarea.selection('');
                }    
            }
        } else */
        if (keycode == 93 || keycode == 77 && event.ctrlKey) {
            const menu = DOM.e("#kontroli_menu_item");
            if (menu instanceof HTMLElement) {
                event.preventDefault();
                menu.focus();
            }
        }
    };

/*
    _keyup(event) {
        this._trigger("poziciŝanĝo",event,{});
        
        var keycode = event.keyCode || event.which; 
        // klavoj, kiuj efektive ŝanĝas la tekston: notu tian ŝangon...
        if ( keycode < 16 
            || keycode == 32 
            || (keycode > 40 && keycode < 91) 
            || (keycode > 93 && keycode < 111) 
            || keycode > 145 ) {

            this._trigger("tekstŝanĝo",event,{});
            this._change_count++; 
            // se tio daŭras tro longe, t.e. konfuzas la tajpadon de la uzanto
            // alternative ni povas fari nur if(!this._change_count)this._change_count=1;
            if (0 == this._change_count % 20) this.backup();        
        }
    };*/

    /*
    _change(event) {
        this._trigger("poziciŝanĝo",event,{});
        this._trigger("tekstŝanĝo",event,{});

        // de tempo al tempo sekurigu la tekston
        this._change_count++; 
        if (0 == this._change_count % 20) this.backup();        
        
        
    };

    change_count() {
        return this._change_count;
    };
    */

    /*
    // redonas la radikon de la artikolo
    radiko() {
        //return this._radiko;
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.radiko; 
    };*/

    /*
    // redonas aŭ anstataŭigas la elektitan tekston
    elekto(insertion?,elektita?) {
        const xmlarea = this.opcioj.xmlarea;
        // redonu la elektitan tekston 
        if (insertion === undefined) {
            return xmlarea.selection();
        // enŝovu la tekston anstataŭ la elektita 
        } else {
            // se necese, kontrolu, ĉu elektita teksto kongruas kun parametro <elektita> 
            if (elektita == xmlarea.selection() || !elektita)
                xmlarea.selection(insertion);
            else
                console.warn("Ne estas la teksto '" + elektita +"' ĉe la elektita loko! Do ĝi ne estas anstatŭigata.");
        }
    };*/

    /*
    // eltrovu la enŝovon de la linio antaŭ la nuna pozicio
    current_indent(shift = 0) {
        const xmlarea = this.opcioj.xmlarea;
        const pos = xmlarea.positionNo();
        var text = (this.element as HTMLInputElement).value;
        return x.enshovo_antaua_linio(text,pos + shift);
    };*/

    /*
    // eltrovu la signon antaŭ la nuna pozicio
    char_before_pos() {
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.charBefore();
    };*/

    /*
    // eltrovu la signojn antaŭ la nuna pozicio (ĝis la linikomenco)
    chars_before_pos() {
        //var el = this.element;
        // var pos = el.getCursorPosition();
        // var val = this.element.val();
        const xmlarea = this.opcioj.xmlarea;
        const pos = xmlarea.positionNo();
        const val = (this.element as HTMLInputElement).value;
        var p = pos;
        while (p > 0 && val[p] != '\n') p--;
        return val.substring(p+1,pos);
    };*/

    /*
    // redonu dosieronomon trovante ĝin en art-mrk aŭ drv-mrk
    art_drv_mrk() {
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.getDosiero();
    };*/

    // eltrovas la markojn (mrk=) de derivaĵoj, la korespondajn kapvortojn kaj liniojn
    // PLIBONIGU: ni povus preni tion supozeble nun rekte el la xmlarea-strukturo
    // kontrolu, kie ni fakte uzas drv_markoj...
    drv_markoj() {
        /// const xmlarea = this.opcioj.xmlarea;
        var xmlStr = this.teksto; //this.element.val();
        var drvoj: Array<any> = [], pos = 0, line = 0;

        if (xmlStr) {
            var drv = xmlStr.split('</drv>');
            var rx = Artikolo.regex_drv;
            
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
    // PLIBONIGU: elprenu el xmlarea anstatataŭe
    markoj() {
        /// const xmlarea = this.opcioj.xmlarea;
        var xmlStr = this.teksto; //this.element.val();
        var mrkoj = {};

        if (xmlStr) {
            const rx = Artikolo.regex_mrk;
            let m;
            while ((m = rx._mrk.exec(xmlStr)) !== null) {
                //var matches = xmlStr.match(rx._mrk);
                let m1 = m[1];
                if (mrkoj[m1]) mrkoj[m1] = m.index; else mrkoj[m1] = 1;
            }
        }
        return mrkoj;
    }; 
    
    // PLIBONIGU: ŝovu tiun funkcion al xmlarea
    snc_sen_mrk() {
        /// const xmlarea = this.opcioj.xmlarea;
        var xmlStr = this.teksto; //this.element.val();
        var sncoj = {};

        if (xmlStr) {
            const rx = Artikolo.regex_mrk;
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

    // PLIBONIGU: ŝovu tiun funkcion al x/xmlarea.ts
    // klarigoj el tri punktoj kie mankas []
    klr_ppp() {
        /// const xmlarea = this.opcioj.xmlarea;
        var xmlStr = this.teksto; //this.element.val();
        var klroj = {};

        if (xmlStr) {
            const rx = Artikolo.regex_klr;
            let m;
            while ((m = rx._klr.exec(xmlStr)) !== null) {
                var klr = m[1];
                klroj[m.index] = klr;
            }
        }
        return klroj;
    };

    // elprenas la tradukojn de certa lingvo el XML-artikolo
    // PLIBONIGU: uzu xmlarea por tiu funkcio!
    /*
    collectAllTrd2(lng) {
        const rx = Artikolo.regex_xml;
        /// const xmlarea = this.opcioj.xmlarea;

        let tradukoj: Array<any> = [];        
        let xml = this.teksto //this.element.val();
            .replace(rx._ent,'?'); // entities cannot be resolved...       
        let artikolo: Element|null;

        try {
            // artikolo = $("vortaro",$.parseXML(xml));
            const parser = new DOMParser();
            const doc = parser.parseFromString(xml,"text/xml");
            artikolo = doc.querySelector("vortaro");    
        } catch(e) {
            console.error("Pro nevalida XML ne eblas trovi tradukojn.");
            //console.error(e);
            return;
        }
        
        if (artikolo) {
            artikolo.querySelectorAll("[mrk]").forEach((e) => {
                var mrk = e.getAttribute("mrk");
                
                // ignori artikolon kaj rimarkojn, kiuj povas havi mrk
                if (e.tagName == "rim" || e.tagName == "art") return;

                // el artikolo-Id uzu ekstraktu la dosiernomon
                //if (mrk.startsWith('$')) mrk = mrk.split(' ',2)[1].split('.')[0];
                
                // enshovi sencojn por pli facile legi la tabelon poste..
                //if (this.tagName == "snc" || this.tagName == "subsnc" || this.tagName == "rim") mrk = "&nbsp;&nbsp;&nbsp;"+mrk;
                
                var kap = '';
                //var trd = '';
                e.querySelectorAll("kap").forEach((k) => {
                    k.childNodes
                    .forEach((c) => {
                        if ( c.nodeType === 1 && (c as Element).tagName == "tld" )
                            kap += '~';
                        else if ( c.nodeType === 3 ) {
                            kap += c.textContent?.replace(',',',.. ');
                        }
                    });
                });

                let trdj: Array<string> = [];
                e.querySelectorAll("trd[lng='"+lng+"']").forEach( (c) => {                    
                        trdj.push(c.innerHTML);
                });

                e.querySelectorAll("trdgrp[lng='"+lng+"']").forEach((t) => {
                    t.querySelectorAll("trd").forEach((t1) => {
                        trdj.push(t1.innerHTML);
                    });
                    tradukoj.push({mrk: mrk, kap: kap, trd: trdj});
                });
            });
        }

        return tradukoj;
    };*/

    enmetu_tradukojn() {
        /// const xmlarea = this.opcioj.xmlarea;
        const xmltrad = this.xmltrad;

        this.subtekst_apliku((s) => {
            const s_t = xmltrad.shanghitaj(s.id);
            for (let lng of Object.keys(s_t)) {
                const trd = s_t[lng];
                this.replaceTrd(s.id,lng,trd);
            }
        });

        this.sinkrona = false; // normale tio devus okazi per evento "change",
                 // set foriginte jquery, tio ne plu funkcias kiel antaŭe, ĉar
                 // _trigger ne kreas realan retumilan eventon, sed nur reagon laŭ opcioj.
        
        //this.element.change();
        this._trigger("change");
    };

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

}
