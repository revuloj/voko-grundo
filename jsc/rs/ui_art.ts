
/* 
 (c) 2018 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

//x/ <reference types="@types/jqueryui/index.d.ts" />

/*
declare global {
    interface JQuery {
        Artikolo(opcioj?: any);
        Artikolo(methodName: "nova", opcioj?: any): JQuery;
        Artikolo(methodName: "load", dosiero: string, data: string): JQuery;
        Artikolo(methodName: "change_count", count?: number): number;
        Artikolo(methodName: "option", opcio: string): any;
        Artikolo(methodName: "insert", xmlstr: string, sync?: boolean);
        Artikolo(methodName: "insert_post", xmlstr: string, s_id: string);
        Artikolo(methodName: "tradukoj", lng: string);
        Artikolo(methodName: "enmetu_tradukojn");
        Artikolo(methodName: "art_drv_mrk");
        Artikolo(methodName: "drv_before_cursor");
        Artikolo(methodName: "drv_markoj");
        Artikolo(methodName: "snc_sen_mrk");
        Artikolo(methodName: "klr_ppp"): {[pos: number]: string};
        Artikolo(methodName: "markoj");
        Artikolo(methodName: "backup");
        Artikolo(methodName: "restore");
        Artikolo(methodName: "plain_text", line_numbers: boolean);
        Artikolo(methodName: "lines_as_dict", xml?: string):  {[lin: number]: string};
        Artikolo(methodName: "goto");
        Artikolo(methodName: "elekto", ins: string, elektita: string);
        Artikolo(methodName: "elekto_menuo");

    }
}
*/

import * as x from '../x';
import { Xmlarea } from '../x';
import { UIElement } from '../ui';

import { preferoj } from '../a/preferoj';
import { XMLArtikolo } from './sxabloniloj';

console.debug("Instalante la artikolfunkciojn...");

export class Artikolo extends UIElement {

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

    static regex_txt = {
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

    static regex_xml = {
        _spc: new RegExp('\\s+/>','g'),
        _amp: new RegExp('&amp;','g'),
        _ent: new RegExp('&([a-zA-Z0-9_]+);','g')
    };

    opcioj: {
        xmlarea: Xmlarea,
        dosiero: '',
        reĝimo: 'redakto'|'aldono', // ĉe novaj artikoloj 'aldono'   
        poziciŝanĝo: null, // evento
        tekstŝanĝo: null // evento
    };

    _change_count = 0

    static artikolo(element: HTMLElement|string) {        
        let a = super.obj(element);
        if (a instanceof Artikolo) return a;
    };

    static xmlarea(element: HTMLElement|string) { 
        const art = Artikolo.artikolo(element);
        if (art) return art.opcioj.xmlarea;
    }

    constructor(element: HTMLElement|string, opcioj: any) {
        super(element, opcioj);

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
    };

    backup() {
        const xmlarea = this.opcioj.xmlarea;
        const xml = xmlarea.syncedXml();
        window.localStorage.setItem("red_artikolo",JSON.stringify({
            'xml': xml, //this.element.val(), 
            'nom': this.opcioj.dosiero,
            'red': this.opcioj.reĝimo
        }));
    };

    // restarigi el loka krozil-memoro
    restore() {
        var str = window.localStorage.getItem("red_artikolo");
        var art = (str? JSON.parse(str) : null);
        if (art && art.xml) {
            //this.element.val(art.xml);
            const xmlarea = this.opcioj.xmlarea;
            xmlarea.setText(art.xml);
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
        const xmlarea = this.opcioj.xmlarea;
        xmlarea.setText(nova_art);
        this._change_count = 0;

        // notu, ke temas pri nova artikolo (aldono),
        // tion ni bezonas scii ĉe forsendo poste
        this.opcioj['reĝimo'] = 'aldono';
        this.opcioj['dosiero'] = art.dos;
    };

    // aktualigu artikolon el data
    load(dosiero,data) {
        const xmlarea = this.opcioj.xmlarea;
        xmlarea.setText(data);

        //var e = this.element;
        //e.val(data);
        
        //this.element.change();
        this._trigger("change");
        this._change_count = 0;
        this.opcioj["reĝimo"] = 'redakto';
        this.opcioj["dosiero"] = dosiero;
    };


    /* PLIBONIGU: ĉu ni plu bezonas insert(), aŭ ĉu ni lasu
    rekte voki al uzantaj funkcioj xmlarea.selection...?
    */
    insert(xmlstr,sync=false) {
        const e = this.element;
        //e.insert(xmlstr);
        const xmlarea = this.opcioj.xmlarea;
        xmlarea.selection(xmlstr);
        // se postulate, tuj sinkronigu, eventuale rekreante la strukturon
        if (sync) xmlarea.sync();
        //e.change();
        this._trigger("change");
    };

    // enŝovu novan tekston post elemento s_id
    insert_post(xmlstr,s_id) {
        const e = this.element;
        //e.insert(xmlstr);
        const xmlarea = this.opcioj.xmlarea;
        xmlarea.xmlstruct.insertAfterId(s_id,xmlstr);

        //e.change();
        this._trigger("change");
    };



    _dragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
    };

    // legu artikolon el muse alŝovita teksto
    _drop(event) {
        var el = this.element; //$(event.target);
        var art = this;
        event.stopPropagation();
        event.preventDefault();
        var file = event.originalEvent.dataTransfer.files[0]; // first of Array of all files
        if ( file && file.type.match(/.xml/) ) {
            var reader = new FileReader();
            reader.onload = function(ev) { 
                // when finished reading file data.
                const xml: string = ev.target?.result as string;
                // el.val(xml);
                const xmlarea = art.opcioj.xmlarea;
                xmlarea.setText(xml);
                art.opcioj.reĝimo = 'redakto';
            };
            // start reading the file data.
            reader.readAsText(file); 
        }       
    };

    _keydown(event) {
        const keycode = event.keyCode || event.which;
        const xmlarea = this.opcioj.xmlarea; 
   
        // traktu TAB por ŝovi dekstren aŭ maldekstren plurajn liniojn
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
        }
    };


    _keyup(event) {
        this._trigger("poziciŝanĝo",event,{});
        
        var keycode = event.keyCode || event.which; 
        // klavoj, kiuj efektive ŝanĝas la tekston notu tian ŝangon...
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
    };

    _change(event) {
        this._trigger("poziciŝanĝo",event,{});
        this._trigger("tekstŝanĝo",event,{});

        // de tempo al tempo sekurigu la tekston
        this._change_count++; 
        if (0 == this._change_count % 20) this.backup();        
        
        /* tie ni uzas eventon "input" rekte en xmlarea mem
        verŝajne ni devos la suprajn liniojn "tekstŝanĝo" pp ankaŭ
        pendigi al "input" anst. "change"!
        const xmlarea = this.opcioj.xmlarea;
        xmlarea.setUnsynced();
        */
        
    };

    change_count() {
        return this._change_count;
    };

    // redonas la radikon de la artikolo
    radiko() {
        //return this._radiko;
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.getRadiko(); 
    };

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
    };

    // eltrovu la enŝovon de la linio antaŭ la nuna pozicio
    current_indent(shift = 0) {
        const xmlarea = this.opcioj.xmlarea;
        const pos = xmlarea.positionNo();
        var text = (this.element as HTMLInputElement).value;
        return x.enshovo_antaua_linio(text,pos + shift);
    };

    // eltrovu la signon antaŭ la nuna pozicio
    char_before_pos() {
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.charBefore();
        /*
        var el = this.element;
        var pos = el.getCursorPosition();
        if (pos > 0)
            return this.element.val()[pos-1];
            */
    };

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
    };

    // redonu dosieronomon trovante ĝin en art-mrk aŭ drv-mrk
    art_drv_mrk() {
        const xmlarea = this.opcioj.xmlarea;
        return xmlarea.getDosiero();
    };

    // eltrovas la markojn (mrk=) de derivaĵoj, la korespondajn kapvortojn kaj liniojn
    // PLIBONIGU: ni povus preni tion supozeble nun rekte el la xmlarea-strukturo
    // kontrolu, kie ni fakte uzas drv_markoj...
    drv_markoj() {
        const xmlarea = this.opcioj.xmlarea;
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
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
                    var dpos = match.index;
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
        const xmlarea = this.opcioj.xmlarea;
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
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
        const xmlarea = this.opcioj.xmlarea;
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
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
        const xmlarea = this.opcioj.xmlarea;
        var xmlStr = xmlarea.syncedXml(); //this.element.val();
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
    tradukoj(lng) {
        const rx = Artikolo.regex_xml;
        const xmlarea = this.opcioj.xmlarea;

        let tradukoj: Array<any> = [];        
        let xml = xmlarea.syncedXml() //this.element.val();
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
    };

    enmetu_tradukojn() {
        const xmlarea = this.opcioj.xmlarea;
        const xmltrad = xmlarea.xmltrad;

        for (let s of xmlarea.xmlstruct.strukturo) {
            const s_t = xmltrad.shanghitaj(s.id);
            for (let lng of Object.keys(s_t)) {
                const trd = s_t[lng];
                xmlarea.replaceTrd(s.id,lng,trd);
            }
        }
        
        //this.element.change();
        this._trigger("change");
    };

    drv_before_cursor() {
        //var line_pos = this.element.getCursorLinePos();

        const xmlarea = this.opcioj.xmlarea;
        const line_pos = xmlarea.position();

        const drvoj = this.drv_markoj();
        for(let i=drvoj.length-1; i>=0; i--) {
            const drv = drvoj[i];
            if (drv.line < line_pos.line) {
                return drv;
            }
        }
        // aliokaze redonu la unuan
        return drvoj[0];  // kaŭzas eraron, se troviĝis neniu!
    };

    // forigas XML-strukturon lasante nur la nudan tekston
    // krome aldonas lininumeron en la formo [n] komence
    // de ĉiu linio
    plain_text(line_numbers=false) {
        //var radiko = this._radiko;
        const rx = Artikolo.regex_txt;

        const xmlarea = this.opcioj.xmlarea;
        const radiko = xmlarea.getRadiko();
        var t = (xmlarea.syncedXml() //this.element.val()
            .replace(rx._tl0,radiko)
            .replace(rx._tld,'$1'+radiko.slice(1)));

        // line numbers?
        if (line_numbers) {
            const lines = t.split('\n');
            t = '';
            let n = 1;
            for (let i = 0; i<lines.length; i++) {
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
    };

    // transformas la rezulton de plain_text en objekton,
    // kies ŝlosiloj estas la lininumeroj kaj kies
    // valoroj estas la nudaj tekst-linioj
    // (bezonata por vortkontrolo/analizo)
    lines_as_dict() {
        var lines = this.plain_text(true).split('\n');
        var result = {};
        for (let i=0; i<lines.length; i++) {
            var line = lines[i];
            var d = line.indexOf(']');
            var no = line.slice(1,d);
            var text = line.slice(d+1);
            if (text.trim().length > 1) {
                result[no] = text;
            }
        }
        return result;
    };

}
