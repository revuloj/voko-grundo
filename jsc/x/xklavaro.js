
/* jshint esversion: 6 */

// (c) 2016 - 2021 - Wolfram Diestel
// laŭ GPL 2.0
console.debug("Instalante la klavarfunkciojn...");

/*
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
    */

/**
 * Kreas XML-ekran-klavaron. La klavaro efikas ene de kadra dialogo. Fokusŝanĝoj pri enhavataj input- kaj textarea-elementoj
 * estas memorataj. Se la lasta fokuso ne kuŝis en tia tekst-elemento la klavoj efikas al la donita apriora elemento.
 * la HTML-enhavo de klavaro povas esti plej simple io kiel 'ĉ ĝ ĥ ĵ ŝ ŭ'...
 * @param {*} klavaro - la elemento enhavante la klavaron kiel HTML-elementoj
 * @param {*} dialogo - la kadra dialogo (kadra HTML-elemento) en kiu efiku la klavaro, forlasebla se vi havas nur 'apriora_kampo'
 * @param {*} apriora_kampo - la apriora teksto-elementon (input/textarea), al kiu efiku la klavoj
 * @param {*} reĝimpremo - revokfunkcio, vokata kiam reĝimklavo estas premata
 * @param {*} postenmeto - revokfunkcio, vokata post kiam tekstenmeta klavo estis premita
 */
function XKlavaro(klavaro, dialogo, apriora_kampo, reĝimpremo, postenmeto) {
    this.klavaro = klavaro;
    this.dialogo = dialogo;
    this.apriora_akmpo = apriora_kampo;
    this.reĝimpremo = reĝimpremo;
    this.postenmeto = postenmeto;
    this.lasta_fokuso = this.apriora_kampo;
    
    // registru klak-reagon
    this.klavaro.addEventListener("click", this.premo);

    // certigu, ke fokus-ŝanĝoj en la posedanto (ekz. dialogo) memoriĝas
    if (this.dialogo) {
        for (let e of this.dialogo.querySelectorAll("textarea,input")) {
            e.addEventListener("blur", function(event) {
                this.lasta_fokuso = event.target.id;
            });
        }    
    }

    // kreu la klavojn
    const klavoj = this.klavaro.textContent
        .trim().split(/[ \n\r\t\f\v]+/);

    let html='';

    for (let i=0; i<klavoj.length; i++) {
        let klv = klavoj[i];
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
    this.klavaro.innerHTML = html;
}

XKlavaro.prototype.celo = function() {
    let el = this.apriora_kampo;
    const form_element_id = this.lasta_fokuso;
    if (this.lasta_fokuso) {
        el = this.dialogo.getElementById(this.lasta_fokuso);
    } 
    return el;
};

XKlavaro.prototype.premo = function(event) {
    const btn = event.currentTarget;
    const text = btn.getAttribute("data-btn");
    const cmd = btn.getAttribute("data-cmd");
    const element = this.klavaro;

    // MANKAS ankoraŭ...
    const radiko =  this.artikolo.Artikolo("radiko");

    if (btn.classList.contains("reghim_btn")) {
        this.reĝimpremo(event,{cmd: cmd});

    } else if (cmd == "tld") { // anstataŭigo de tildo
        const elektita = this.leketo(); 
        if (elektita == "~" || elektita == "") {
            this.enmeto("<tld/>");
        } else {
            //var radiko = xmlGetRad($("#xml_text").val());
            // traktu ankaŭ majusklan / minusklan formon de la radiko
            let first = radiko.charAt(0);
            first = (first == first.toUpperCase() ? first.toLowerCase() : first.toUpperCase());
            const radiko2 = first + radiko.substr(1);
                    
            if ( radiko ) {
                const newtext = elektita.replace(radiko,'<tld/>').replace(radiko2,'<tld lit="'+first+'"/>');
                this.enmeto(newtext); 
            }
        }

        this.postenmeto(event,{cmd: cmd});

    // majusklaj komencliteroj de vortoj
    } else if (cmd == "kamelo"){
        const sel = this.elekto();
        //var rad = sel.includes('<tld')? xmlGetRad($("#xml_text").val()) : '';
        const rad = sel.includes('<tld')? radiko : '';
        this.enmeto(kameligo(sel,rad));    
        this.postenmeto(event,{cmd: cmd});

    // minuskligo
    } else if (cmd == "minuskloj"){
        const sel = this.elekto();
        this.enmeto(minuskligo(sel,radiko));
        this.postenmeto(event,{cmd: cmd});

    // aliajn kazojn traktu per _ekran_klavo...
    } else {
        const sel = this.elekto();
        this.enmeto(this.ekran_klavo(text,cmd,sel));
        this.postenmeto(event,{cmd: cmd});
    }
};

XKlavaro.prototype.ekran_klavo = function(text,cmd,sel) {
    let s_ = '';
    // simbol-klavo redonu la tekston
    if (text) {
        return text;
    // citiloj
    } else if (cmd == "\u201e\u201c" || cmd =="\u201a\u2018") {
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
};

/**
 * Redonas la elektitan tekston de la lasta tekstelemento (input,textarea) kiu havis la fokuson
 * @returns la elektitan tekston
 */
XKlavaro.prototype.elekto = function() {
    const element = this.celo;
    /*
    if ('selection' in document) {
        // Internet Explorer
        element.focus();
        const sel = document.selection.createRange();
        return sel.text;
      }
      else if ('selectionStart' in el) { */
        // other, e.g. Webkit based
        return element.value.substring(element.selectionStart, element.selectionEnd);
        /*
      } else {
          console.error("selection (preni markitan tekston) ne subtenita por tiu krozilo");
      }*/
};


    
/**
 * Enmetas tekston ĉe la pozicio de kursoro, resp. anstataŭigas la nunan elekton per nova teksto.
 * @param {*} val - teksto por enmeti
 */
XKlavaro.prototype.enmeto = function(val) {
    const element = this.celo;

    if (document.selection && document.selection.createRange) { // IE/Opera
        element.focus();
        let sel = document.selection.createRange();
        sel.text = val;
        element.focus();

    } else if (element.selectionStart || element.selectionStart == '0') {
        // Firefox and Webkit based
        const startPos = this.selectionStart;
        const endPos = this.selectionEnd;
        const scrollTop = this.scrollTop;
        element.value = element.value.substring(0, startPos)
          + val
          + element.value.substring(endPos, element.value.length);
        element.focus();
        element.selectionStart = startPos + val.length;
        element.selectionEnd = startPos + val.length;
        element.scrollTop = scrollTop;

    } else {
        element.value += val;
        element.focus();
    }
};

