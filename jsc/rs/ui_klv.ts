
/* 
 (c) 2016 - 2023 ĉe Wolfram Diestel
 laŭ GPL 2.0
*/

/// <reference types="@types/jqueryui/index.d.ts" />

import * as x from '../x';

export type KlavarSpec = {
    artikolo: JQuery<HTMLElement>, // Artikolo al kiu apartenu la klavaro
    posedanto: string, // HTML id de enhava dialogo/panelo
    akampo: string, // HTML id de la apriora kampo
    reĝimpremo?: (e: Event, ui: any) => void // reago al premo de reĝimklavo   
    postenmeto?: (e: Event, ui: any) => void // aldona tasko post enmeto   
}

declare global {
    interface JQuery {
        Klavaro(spec: KlavarSpec);
    }
}

console.debug("Instalante la klavarfunkciojn...");
$.widget( "redaktilo.Klavaro", {

    // Default options.
    options: {
            klavoj: '', // povas esti String, ekz 'ĉ ĝ ĥ ĵ ŝ ŭ',
               // se malplena ĝi estas prenita el la klavaro-elemento:
               // <div id="klavoj">ĉ ĝ ĥ ĵ ŝ ŭ Ĉ Ĝ Ĥ Ĵ Ŝ Ŭ</div>
            artikolo: {},
            posedanto: '', // dialogo, en kiu troviĝas
            akampo: '', // apriora kampo, al kiu klavoj efikas
            reĝimpremo: null, // evento kiam reĝimbuton premiĝis (fermu, indiko, serĉo)
            postenmeto: null // evento, vokita post kiam enmeto okazis
    },

    _create: function() {
        this._super();

        var klavaro = this.element;
        this._akampo_el = $(this.options.akampo);
        // registru klak-reagon
        this._on({"click div": this._premo});
        // certigu, ke fokus-ŝanĝoj en la posedanto (ekz. dialogo) memoriĝas
        this._posedanto_el = $(this.options.posedanto);
        this._posedanto_el.on("blur","textarea,input",
            function(event) {
                klavaro.data("last-focus",event.target.id);
            });

        // kreu la klavojn
        var klavoj = this.options.klavoj;
        if (! klavoj) klavoj = klavaro.text().trim();
        var klvj = klavoj.split(/[ \n\r\t\f\v]+/); // 
                        // \f\n\r\t\v
                        // nerompebla (protektita) spaco: ​\u00a0
                        // Ogham spac-streko: \u1680​
                        // mongola intervokala spaco: \u180e
                        // duon- kaj kadrat-distanco: \u2000​\u2001
                        // duon- kaj kadrat-spaco: \u2002​\u2003
                        // trion- kaj kvaron-kadrat-speco: \u2004 \u2005
                        // seson-kadrat-spaco\u2006
                        // cifer-larĝa spaco: ​\u2007
                        // punkt-larĝa spaco: \u2008
                        // mallarĝa spaco: ​\u2009
                        // har-spaco: \u200a​
                        // lini-dividilo: \u2028
                        // aline-dividilo: \u2029
                        // mallarĝa protektita spaco: ​​\u202f
                        // meza matematika spaco: \u205f
                        //​ ideografa spaco: \u3000
        var html='';

        for (let i=0; i<klvj.length; i++) {
            let klv = klvj[i];
            // unuopa signo -> simbolo-klavo
            if (klv.length == 1) {
                switch (klv) {
                    case '\xa0':
                        html += '<div data-btn="&nbsp;" title="spaco nerompebla">]&nbsp;[</div>';
                        break;
                    case '\u202f':
                        html += '<div data-btn="&#x202f;" title="spaceto nerompebla">][</div>';
                        break;
                    default:
                        html += '<div data-btn="' + klv + '">' + klv + '</div>';
                } 
            // duopa signo -> enkrampiga
            } else if (klv.length == 2) {
                html += '<div class="elm_btn" data-cmd="'+klv+'">' + klv[0] + '&hellip;' + klv[1] +'</div>';
            // pli longaj estas elemento-butonoj k.s.
            } else {
                var elmj = {
                    ctl: "citilo-elemento",
                    mis: "misstilo-elemento",
                    nom: "nomo (ne-e-a)",
                    nac: "nacilingva vorto",
                    esc: "escepta vorto",
                    ind: "indeksero",   
                    var: "variaĵo de kapvorto",
                    frm: "formulo"                    
                };
                if (klv in elmj) {
                  html += '<div class="elm_btn" data-cmd="' + klv + '" title="' + elmj[klv] + '">' + klv + '</div>';
                } else {
                  switch (klv) {
                      /*
                    case '[fermu]':
                        html += '<div class="reghim_btn" data-cmd="fermu" title="kaŝu la klavaron">&#x2b07;&#xFE0E;</div>';
                        break;
                        */
                    case '[indiko]':
                        html += '<div class="reghim_btn" data-cmd="indiko" title="indiko-klavaro">&#x2605;&#xFE0E;</div>';
                        break;
                    case '[serĉo]':
                        html += '<div class="reghim_btn" data-cmd="sercho" title="Serĉi la elektitan tekston">&#x1F50D;&#xFE0E;</div>';
                        break;
                    case '[blank]':
                        html += '<div class="reghim_btn" data-cmd="blankigo" title="Blankigu la kampojn">&#x232b;</div>';
                        break;
                    case 'tld': 
                        html += '<div class="elm_btn" data-cmd="tld" title="tildo/tildigo">~</div>';
                        break;
                    case 'grase':
                        html += '<div class="elm_btn" data-cmd="g" title="grase"><b>g</b></div>';
                        break;
                    case 'kursive':
                        html += '<div class="elm_btn" data-cmd="k" title="kursive"><i>k</i></div>';
                        break;
                    case 'emfaze':
                        html += '<div class="elm_btn" data-cmd="em" title="emfazo"><strong>em</strong></div>';
                        break;
                    case 'strekite':
                        html += '<div class="klv elm_btn" data-cmd="ts" title="trastreko"><del>ts</del></div>';
                        break;                        
                    case 'sup':
                        html += '<div class="elm_btn" data-cmd="sup" title="suprigite" ' +
                                'style="padding-top:0.25em; padding-bottom:0.35em ">a<sup>s</sup></div>';
                        break;
                    case 'sub':
                        html += '<div class="elm_btn" data-cmd="sub" title="subigite">a<sub>s</sub></div>';
                        break;
                    case 'minuskloj':
                        html += '<div class="elm_btn" data-cmd="minuskloj" title="minuskligo">A&#x2192;a</div>';
                        break;
                    case 'kamelo':
                        html += '<div class="elm_btn" data-cmd="kamelo" title="komenc-majuskloj">&#x2192;Ab</div>';
                        break;
                    default:
                        html += '<div class="elm_btn" data-cmd="' + klv + '">' + klv + '</div>';
                  }
                }
            }
        }
        klavaro.html(html);
    },

    _target: function() {
        var el = this._akampo_el; // default
        var form_element_id = this.element.data("last-focus");
        if (form_element_id) {
            el = $("#" + form_element_id);
        } 
        return el;
    },

    _premo: function(event) {
            var btn = $(event.currentTarget);
            var text = btn.attr("data-btn");
            var cmd = btn.attr("data-cmd");
            var element = this._target();
            var radiko =  this.options.artikolo.Artikolo("radiko");

            if (btn.hasClass("reghim_btn")) {
                this._trigger("reĝimpremo",event,{cmd: cmd});

            } else if (cmd == "tld") { // anstataŭigo de tildo
                var elektita = element.textarea_selection();
                if (elektita == "~" || elektita == "") {
                    element.insert("<tld/>");
                } else {
                    //var radiko = xmlGetRad($("#xml_text").val());
                    // traktu ankaŭ majusklan / minusklan formon de la radiko
                    var first = radiko.charAt(0);
                    first = (first == first.toUpperCase() ? first.toLowerCase() : first.toUpperCase());
                    var radiko2 = first + radiko.slice(1);
                            
                    if ( radiko ) {
                        var newtext = elektita.replace(radiko,'<tld/>').replace(radiko2,'<tld lit="'+first+'"/>');
                        element.insert(newtext); 
                    }
                }

                this._trigger("postenmeto",event,{cmd: cmd});

            // majusklaj komencliteroj de vortoj
            } else if (cmd == "kamelo"){
                const sel = element.textarea_selection();
                //var rad = sel.includes('<tld')? xmlGetRad($("#xml_text").val()) : '';
                var rad = sel.includes('<tld')? radiko : '';
                element.insert(x.kameligo(sel,rad));
            
                this._trigger("postenmeto",event,{cmd: cmd});

            // minuskligo
            } else if (cmd == "minuskloj"){
                const sel = element.textarea_selection();
                element.insert(x.minuskligo(sel,radiko));

                this._trigger("postenmeto",event,{cmd: cmd});

            // aliajn kazojn traktu per _ekran_klavo...
            } else {
                const sel = element.textarea_selection();
                element.insert(this._ekran_klavo(text,cmd,sel));

                this._trigger("postenmeto",event,{cmd: cmd});
            }
    },

    _ekran_klavo: function(text,cmd,sel) {
        var s_ = '';
        // simbol-klavo redonu la tekston
        if (text) {
            return text;
        // citiloj
        } else if (cmd == "\u201e\u201c" || cmd =="\u201a\u2018" || cmd == "\u29da\u29db") {
            s_ = sel || "\u2026";
            return (cmd[0] + s_ + cmd[1]);
        // klarigoj en krampoj
        } else if (cmd == "[]" || cmd == "()") {
            s_ = sel || "\u2026";
            return ('<klr>' + ( sel[0] != cmd[0]? cmd[0]:"" ) 
                           + s_ + ( sel[sel.length-1] != cmd[1]? cmd[1]:"" ) +  '</klr>');
        // variaĵo
        } else if (cmd == "var"){
            s_ = sel || "\u2026";
            return ('<var><kap>' + s_.replace('~','<tld/>') + '</kap></var>');
        // elemento-klavo
        } else {
            s_ = sel || "\u2026";
            return ('<' + cmd + '>' + s_ + '</' + cmd + '>');
        } 
    }
});
