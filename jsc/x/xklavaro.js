
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
 * @constructor
 * @param {Element} klavaro - la elemento enhavante la klavaron kiel HTML-elementoj
 * @param {Element} dialogo - la kadra dialogo (kadra HTML-elemento) en kiu efiku la klavaro, forlasebla se vi havas nur 'apriora_kampo'
 * @param {Element} apriora_kampo - la apriora teksto-elementon (input/textarea), al kiu efiku la klavoj
 * @param {Function} kiuradiko - revokfunkcio, vokata por eltrovi la radikon de la artikolo
 * @param {Function} reĝimpremo - revokfunkcio, vokata kiam reĝimklavo estas premata
 * @param {Function} postenmeto - revokfunkcio, vokata post kiam tekstenmeta klavo estis premita
 */
function XKlavaro(klavaro, dialogo, apriora_kampo, kiuradiko, reĝimpremo, postenmeto) {
    this.klavaro = klavaro;
    this.dialogo = dialogo;
    this.apriora_kampo = apriora_kampo;
    this.kiuradiko = kiuradiko;
    this.reĝimpremo = reĝimpremo;
    this.postenmeto = postenmeto;
    this.lasta_fokuso = this.apriora_kampo.id;
    this.klavoj = this.klavaro.textContent;
    
    // kreu la klavojn
    //if (this.klavoj)
    //    this.elemento_klavoj(this.klavoj);

    // registru klak-reagon
    // vd. https://stackoverflow.com/questions/1338599/the-value-of-this-within-the-handler-using-addeventlistener
    this.klavaro.addEventListener("click", (event) => this.premo(event));

    // certigu, ke fokus-ŝanĝoj en la posedanto (ekz. dialogo) memoriĝas
    if (this.dialogo) {
        for (let e of this.dialogo.querySelectorAll("textarea,input")) {
            e.addEventListener("blur", function(event) {
                this.lasta_fokuso = event.target.id;
            });
        }    
    }
}

/**
 * Kreas elemento-klavojn laŭ tekstra priskribo. Ekz-e
 * [indiko] &#x2015; &middot; &nbsp; &#x202f;
 * tld [] () &#x201e;&#x201c; &sbquo;&#x2018; 
 * ctl nom nac esc ind var frm
 * grase kursive emfaze sup sub minuskloj kamelo
 * @param {Element} klvrElm - elemento en kiun aranĝi la fakoklavojn
 * @param {string} klavstr klavaro-specifo kiel teksto
 */
XKlavaro.prototype.elemento_klavoj = function(klvrElm, klavstr = null) {
    let html='';
    const klavoj = (klavstr?klavstr:this.klavoj)
        .trim().split(/[ \n\r\t\f\v]+/);

    for (let i=0; i<klavoj.length; i++) {
        let klv = klavoj[i];
        // unuopa signo -> simbolo-klavo
        if (klv.length == 1) {
            switch (klv) {
                case '\xa0':
                    html += '<div class="klv" data-btn="&nbsp;" title="spaco nerompebla">]&nbsp;[</div>';
                    break;
                case '\u202f':
                    html += '<div class="klv" data-btn="&#x202f;" title="spaceto nerompebla">][</div>';
                    break;
                default:
                    html += '<div class="klv" data-btn="' + klv + '">' + klv + '</div>';
            } 
        // duopa signo -> enkrampiga
        } else if (klv.length == 2) {
            html += '<div class="klv elm_btn" data-cmd="'+klv+'">' + klv[0] + '&hellip;' + klv[1] +'</div>';
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
                html += '<div class="klv elm_btn" data-cmd="' + klv + '" title="' + elmj[klv] + '">' + klv + '</div>';
            } else {
                switch (klv) {
                    /*
                case '[fermu]':
                    html += '<div class="reghim_btn" data-cmd="fermu" title="kaŝu la klavaron">&#x2b07;&#xFE0E;</div>';
                    break;
                    */
                case '[elemento]':
                    html += "<div class='klv reghim_btn' data-cmd='klavaro' title='krom-klavaro'><span>&lt;&hellip;&gt;</span></div>"                   
                    break;
                case '[indiko]':
                    html += '<div class="klv reghim_btn" data-cmd="indiko" title="indiko-klavaro">&#x2605;&#xFE0E;</div>';
                    break;
                case '[fako]':
                    html += '<div class="klv reghim_btn" data-cmd="fako" title="fako-klavaro">&#x26CF;&#xFE0E;</div>';
                    break;
                case '[serĉo]':
                    html += '<div class="klv reghim_btn" data-cmd="sercho" title="Serĉi la elektitan tekston">&#x1F50D;&#xFE0E;</div>';
                    break;
                case '[blank]':
                    html += '<div class="klv reghim_btn" data-cmd="blankigo" title="Blankigu la kampojn">&#x232b;</div>';
                    break;
                case 'tld': 
                    html += '<div class="klv elm_btn" data-cmd="tld" title="tildo/tildigo">~</div>';
                    break;
                case 'grase':
                    html += '<div class="klv elm_btn" data-cmd="g" title="grase"><b>g</b></div>';
                    break;
                case 'kursive':
                    html += '<div class="klv elm_btn" data-cmd="k" title="kursive"><i>k</i></div>';
                    break;
                case 'emfaze':
                    html += '<div class="klv elm_btn" data-cmd="em" title="emfazo"><strong>em</strong></div>';
                    break;
                case 'sup':
                    html += '<div class="klv elm_btn" data-cmd="sup" title="suprigite" ' +
                            'style="padding-top:0.25em; padding-bottom:0.35em ">a<sup>s</sup></div>';
                    break;
                case 'sub':
                    html += '<div class="klv elm_btn" data-cmd="sub" title="subigite">a<sub>s</sub></div>';
                    break;
                case 'minuskle':
                    html += '<div class="klv elm_btn" data-cmd="minuskloj" title="minuskligo">A&#x2192;a</div>';
                    break;
                case 'kamele':
                    html += '<div class="klv elm_btn" data-cmd="kamelo" title="komenc-majuskloj">&#x2192;Ab</div>';
                    break;
                case 'dekstren':
                    html += '<button value="+2i" class="klv tab_btn" title="Ŝovu la markitan tekston dekstren.">&#x21E5;</button>';
                    break;
                case 'maldekstren':
                    html += '<button value="-2i" class="klv tab_btn" title="Ŝovu la markitan tekston maldekstren.">&#x21E4;</button>';
                    break;
                default:
                    html += '<div class="klv elm_btn" data-cmd="' + klv + '">' + klv + '</div>';
                }
            }
        }
    }
    klvrElm.innerHTML = html;
}


/**
 * Kreas butonojn por stiloj, fakoj, gramatikaj indikoj
 * @param {Element} klvrElm - elemento en kiun aranĝi la fakoklavojn
 * @param {Object} stlList - Xlist kun stiloj
 */
XKlavaro.prototype.indiko_klavoj = function (klvrElm,stlList) {
   
    this.elemento_klavoj(klvrElm,klvrElm.textContent);
    const pos = klvrElm.children.length; // tie ni poste enŝovos la stilbutonojn!

    let indikoj = "<div class='klv ofc' data-ofc='*' title='fundamenta (*)'><span>funda-<br/>menta</span></div>";
    for (var i=1; i<10; i++) {
        indikoj += "<div class='klv ofc' data-ofc='" + i + "' title='" + i + "a oficiala aldono'><span><b>" + i + "a</b> aldono" + "</span></div>";
    }
    
    indikoj += "<div class='klv gra' data-vspec='tr' title='vortspeco: transitiva verbo'><span>tr.<br/>verbo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='ntr' title='vortspeco: netransitiva verbo'><span>netr.<br/>verbo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='x' title='vortspeco: verbo (x)'><span>tr./ntr.<br/>verbo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='abs.' title='vortspeco: absoluta, senkomplementa verbo'><span>abs.<br/>verbo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='subst.' title='vortspeco: substantivo'><span>subs- tantivo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='adj.' title='vortspeco: substantivo'><span>adjek- tivo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='adv.' title='vortspeco: substantivo'><span>adver- bo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='artikolo' title='vortspeco: artikolo'><span>arti-<br/>kolo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='determinilo' title='vortspeco: determinilo'><span>deter- minilo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='interjekcio' title='vortspeco: interjekcio'><span>inter- jekcio</span></div>";
    indikoj += "<div class='klv gra' data-vspec='konjunkcio' title='vortspeco: konjunkcio'><span>konjunk- cio</span></div>";
    indikoj += "<div class='klv gra' data-vspec='prefikso' title='vortspeco: prefikso'><span>pre- fikso</span></div>";
    indikoj += "<div class='klv gra' data-vspec='sufikso' title='vortspeco: sufikso'><span>su-<br/>fikso</span></div>";
    indikoj += "<div class='klv gra' data-vspec='prepozicio' title='vortspeco: prepozicio'><span>prepo- zicio</span></div>";
    indikoj += "<div class='klv gra' data-vspec='prepoziciaĵo' title='vortspeco: prepoziciaĵo'><span>prepo- ziciaĵo</span></div>";
    indikoj += "<div class='klv gra' data-vspec='pronomo' title='vortspeco: pronomo'><span>pro- nomo</span></div>";
    
    klvrElm.innerHTML += indikoj;

    function stilKlavoHtml(kod,nom) {
        const btn = ht_elements([
            ['div',{
                class: 'klv stl', 
                'data-stl': kod,
                title: 'stilo: ' + nom},
                [['span',{},[nom,['br'],kod]]]
            ]
        ]);
        klvrElm.children[pos-1]
            .insertAdjacentElement('afterend',btn[0]);
    }
    
    stlList.load(stilKlavoHtml);
};

/**
 * Kreas butonojn por fakoj
 * @param {Element} klvrElm - elemento en kiun aranĝi la fakoklavojn
 * @param {Object} fakList - Xlist kun fakoj
 */
 XKlavaro.prototype.fako_klavoj = function (klvrElm,fakList) {
   
    function fakoKlavoHtml(kod,nom) {
        const btn = ht_elements([
            ['div',{
                class: 'klv fak', 
                'data-fak': kod,
                title: 'fako: ' + nom},
                [['img',{
                    src: '../smb/' + kod + '.png',
                    alt: kod}],
                ['br'],kod]
            ]
        ]);
        klvrElm.append(...btn);
    }            

    this.elemento_klavoj(klvrElm,klvrElm.textContent);
    fakList.load(fakoKlavoHtml);
};

/**
 * Redonas la HTML-kampon, al kiu ni tajpas
 * @returns la kampon, kiu laste havis la fokuson aŭ la aprioran kampon
 */
XKlavaro.prototype.celo = function() {
    if (this.lasta_fokuso) {
        return document.getElementById(this.lasta_fokuso);
    } 
    return this.apriora_kampo;
};

/**
 * Reago al premo de X-klavo
 * @param {Object} event 
 */
XKlavaro.prototype.premo = function(event) {
    event.stopPropagation();
    const btn = event.target.closest(".klv");
    const text = btn.getAttribute("data-btn");
    const cmd = btn.getAttribute("data-cmd");
    const element = this.klavaro;

    // MANKAS ankoraŭ...
    const radiko =  this.kiuradiko();

    if (btn.classList.contains("reghim_btn")) {
        this.reĝimpremo(event,{cmd: cmd});

    } else if (btn.classList.contains("stl")) {
        const stl = btn.getAttribute("data-stl");
        this.enmeto('<uzo tip="stl">' + stl + '</uzo>');
        this.postenmeto(event);
    } else if (btn.classList.contains("fak")) {
        const fak = btn.getAttribute("data-fak");
        this.enmeto('<uzo tip="fak">' + fak + '</uzo>');
        this.postenmeto(event);
    } else if (btn.classList.contains("ofc")) {
        const ofc = btn.getAttribute("data-ofc");
        this.enmeto('<ofc>' + ofc + '</ofc>');
        this.postenmeto(event);
    } else if (btn.classList.contains("gra")) {
        const vspec = btn.getAttribute("data-vspec");
        this.enmeto('<gra><vspec>' + vspec + '</vspec></gra>');
        this.postenmeto(event);

    } else if (cmd == "tld") { // anstataŭigo de tildo
        const elektita = this.elekto(); 
        if (elektita == "~" || elektita == "") {
            this.enmeto("<tld/>");
        } else {
            //var radiko = xmlGetRad($("#xml_text").val());
            // traktu ankaŭ majusklan / minusklan formon de la radiko
            let first = radiko.charAt(0);
            first = (first == first.toUpperCase() ? first.toLowerCase() : first.toUpperCase());
            const radiko2 = first + radiko.slice(1);
                    
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
    const element = this.celo();
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
    const element = this.celo();

    if (document.selection && document.selection.createRange) { // IE/Opera
        element.focus();
        let sel = document.selection.createRange();
        sel.text = val;
        element.focus();

    } else if (element.selectionStart || element.selectionStart == '0') {
        // Firefox and Webkit based
        const startPos = element.selectionStart;
        const endPos = element.selectionEnd;
        const scrollTop = element.scrollTop;
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

