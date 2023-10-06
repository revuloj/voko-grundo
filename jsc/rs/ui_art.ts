
/* 
 (c) 2018 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/


import * as x from '../x';
import { XmlRedakt } from '../x';
import { DOM } from '../ui';

import { preferoj } from '../a/preferoj';
import { Valoroj, XMLArtikolo } from './sxabloniloj';

console.debug("Instalante la artikolfunkciojn...");

// PLIBONIGU: laŭeble ŝovu ĉiujn restintojn funkciojn al XmlRedakt
// kaj forigu la klason Artikolo poste

export class Artikolo extends XmlRedakt {

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
            /// dragover: this._dragOver,
            /// drop: this._drop,
            keydown: this._keydown // traktu TAB por enŝovoj
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
        preferoj.relegu();
    };

    nova(art: Valoroj) {
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
    load(dosiero: string, data: string) {
        /// const xmlarea = this.opcioj.xmlarea;
        ///this.teksto = data;
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
    insert(xmlstr: string, sync=false) {
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


    /**
     * PLIBONIGU: tion povus fari la klaso XmlRedakt mem, ĉu?
     * 
     */
    _keydown(event: KeyboardEvent) {
        const keycode = event.keyCode || event.which;
   
        if (keycode == 93 || keycode == 77 && event.ctrlKey) {
            const menu = DOM.e("#kontroli_menu_item");
            if (menu instanceof HTMLElement) {
                event.preventDefault();
                menu.focus();
            }
        }
    };

}
