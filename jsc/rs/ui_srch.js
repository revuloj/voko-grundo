
/* jshint esversion: 6 */

// (c) 2018 - Wolfram Diestel
// laŭ GPL 2.0

//var sercho_focused_button = null;
console.debug("Instalante la serĉfunkciojn...");

/**
 * Preparas la serĉon, kontrolante, ĉu estas valida serĉesprimo, malplenigante
 * la trovokampon.
 */
function _serĉo_preparo() {
    if (! $("#sercho_sercho").validate()) return;

    $("#sercho_trovoj").html('');
    $("#sercho_trovoj button").off("click");

    return true;
}

/**
 * Preparas afiksojn laŭ la vortspecoj (i,a,o), al
 * kiuj ili estas aplikeblaj kaj kiu vortspeco povas
 * rezulti, ekz-e "o-a", signifas aplikebla al substantivo kaj
 * rezultanta al adjektivo, "?" signifas ciuj tri vortspecoj...
 * Alternativoj estas apartigitaj per '|', ekz-e "o-a|a-a"
 * 
 * @returns {{prefiksoj:{a,i,o},sufiksoj:{a,i,o,n}}}
 */
const afiksoj = function() {

    // redonu sufiksojn aplikeblajn 
    // al radikkaraktero rk kun rezulta vortspeco vs
    const _sufiksoj = {
        "[aio]n?t": "i-u|i-a",
        "aĉ": "?-?",
        "ad": "i-?",
        "aĵ": "?-o",
        "an": "o-u",
        "ar": "o-o",
        "ebl": "i-a",
        "ec": "a-o|o-o",
        "eg": "?-?",
        "ej": "?-o",
        "em": "i-a|a-a|i-o|a-o",
        "end": "i-a",
        "er": "o-o",
        "estr": "o-u",
        "et": "?-?",
        "id": "u-u|o-o",
        "i[gĝ]": "i-?|n-i",
        "il": "i-o",
        "in": "u-u|u-a",
        "[ei]nd": "i-a|i-o",
        "ing": "o-o",
        "ism": "o-o|o-a",
        "ist": "o-u|o-a",
        "obl": "n-o|n-a",
        "o[np]": "n-o|n-a",
        "uj": "o-o",
        "ul": "?-u",
        "um": "?-?",
    };
    
    const _prefiksoj = {
        // bazaj prefiksoj
        "bo": "u-u|u-a",
        "ĉef": "o-o|o-a",
        "dis": "i-?",
        "ek": "i-?",
        "eks": "o-o|o-a",
        "fi": "?-?",
        "ge": "u-u|u-a",
        "mal": "?-?",
        "mis": "i-?",
        "pra": "o-o|o-a",
        "pseŭdo": "?-?",
        "re": "i-?",

        // prepozicioj kiel prefiksoj aŭ kunderivado
        "al": "i-?",
        "antaŭ": "i-?|o-a",
        "apud": "i-?|o-a",
        "ĉe": "i-?|o-a",
        "ĉirkaŭ": "i-?|o-a",        
        "de": "i-?",
        "dum": "i-a|o-a",
        "ekster": "a-a|o-a",
        "el": "i-?",
        "en": "i-?|o-a",
        "ĝis": "i-?",
        "inter": "i-?|o-a|o-o",
        "kontraŭ": "i-?|o-a",
        "krom": "i-?|o-o",
        "kun": "i-?",
        "laŭ": "i-?|?-a",
        "per": "i-?|o-a",
        "por": "i-?",
        "post": "i-?",
        "preter": "i-?",
        "pri": "i-?|o-a",
        "pro": "i-?",
        "sen": "?-a",
        "sub": "o-o|o-a|i-?",
        "super": "o-o|o-a|a-a|i-?",
        "sur": "i-?|o-a",
        "tra": "i-?|o-a",
        "trans": "i-?|o-a",        

        // adverboj kiel prefiksoj aŭ en kunderivado
        "ambaŭ": "o-a|i-a",
        "ĉi": "a-a",
        "ĉiam": "a-a",
        "pli": "a-a",
        "plu": "i-?",
        "for": "i-?",
        "ne": "a-a|o-a",
        "tiel": "a-a",
        "nun": "o-o|o-a",
        "mem": "i-?",
        "kvazaŭ": "?-?",
        "tro": "a-?",

        // tabelvortoj uzataj en kunderivado        
        "[ĉtk]?iu": "o-a",
        "neniu": "o-a",
        "[ĉtk]?ia": "o-a",
        "nenia": "o-a"
    };

    function _preparo(afiksoj) {

        let r = {
          "?":{"?":[],a:[],i:[],o:[]},
            a:{"?":[],a:[],i:[],o:[]},
            i:{"?":[],a:[],i:[],o:[]},
            o:{"?":[],a:[],i:[],o:[]},
            u:{"?":[],a:[],i:[],o:[]},
            n:{"?":[],a:[],i:[],o:[]}};

        const push_no_dup = (el,arr) => 
            { if (arr.indexOf(el)==-1) arr.push(el);};            

        // alpendigas afikson af al listoj de objekto obj laŭ
        // celvortspeco al 
        /*
        function push(af,al,obj) {
            if (al == '?') {
                push_no_dup(af,obj.a);
                push_no_dup(af,obj.i);
                push_no_dup(af,obj.o);
            } else {
                push_no_dup(af,obj[al]);
            }
        }*/

        for (const [affix,sk] of Object.entries(afiksoj)) {
            const skemoj = sk.split('|');
            for (const s of skemoj) {
                const de = s[0];
                const al = (s[2]=='u'? 'o' : s[2]); // la celon ulo ni bildigas al -o
                                // dumlonge ni ne uzas duŝtupan aplikadon pref/ul...
                push_no_dup(affix,r[de][al]);
            }
        }

        return r;
    }

    return {
        sufiksoj: _preparo(_sufiksoj),
        prefiksoj: _preparo(_prefiksoj)
    }
}(); // tuj preparu!


/**
 * Vokas la serĉon en Vikipedio kaj prezentas la rezultojn
 * @param {Event} event
 */
export function vikiSerĉo(event) {
    event.preventDefault();

    if (! _serĉo_preparo()) return;

    $.alportu(
        'citajho_sercho',
        {   
            sercho: $("#sercho_sercho").val(),
            kie: 'vikipedio'
        }, 
        '#sercho_error')
    .done(
        function(data) {   
            
            if (data.query && data.query.pages) {
                var pages = data.query.pages;
                var ŝablono = new HTMLTrovoDt();

                for (let p in pages) {
                    var page = pages[p];
                    var url = 'https://eo.wikipedia.org/?curid=' + page.pageid;

                    $("#sercho_trovoj").append('<dd id="trv_' + page.pageid + '">');
                    $("#trv_"  + page.pageid).Trovo(
                        {
                            ŝablono: ŝablono,
                            valoroj: {
                                url: url,
                                title: page.title,
                                descr: page.extract,
                                data: page
                            }
                        }
                    );
                }
            } else {
                    $("#sercho_trovoj")
                        .append("<p>&nbsp;&nbsp;Neniuj trovoj.</p>");
            }
        });
}

/**
 * Redonas la URL-on, kiu apartenas al bibliografiero.
 * @param {Array<{label,value}>} source - la bibliografia listo 
 * @param {string} bib - la mallongigo de la serĉata bibliografiero
 * @returns la URL 
 */
function _bib_url(source,bib) {
    for (var entry of source) {
        if (entry.value == bib) {
            return entry.url;
        }
    }
}

/**
 * Vokas la citaĵo-serĉon kaj prezentas la trovojn en la trovo-kampo.
 * @param {Event} event
 */
export function citaĵoSerĉo(event) {
    event.preventDefault();
    const vlist = event.data;

    if (! _serĉo_preparo()) return;

    // serĉesprimo: ŝablone kreita regulesprimo aŭ tajpita serĉvorto...?
    const esprimo = $("#re_esprimo").text() || $("#sercho_sercho").val();

    // eltrovu ĉu la verko-listo estas limigita
    const vrkj = elektitajVerkoj(vlist).join(',');

    $.alportu(
        'citajho_sercho',
        { 
            sercho: esprimo,
            kie: vlist,
            vrk: vrkj
        }, 
        '#sercho_error')
    .done(
        function(data) {   
            var bib_src = $( "#ekzemplo_bib" ).autocomplete( "option", "source" );
            var htmlFnt = new HTMLFonto(bib_src);
            var ŝablono = new HTMLTrovoDt();

            if (data.length && data[0].cit) {
                for (var i=0; i<data.length; i++) {
                    var trovo = data[i], fnt = trovo.cit.fnt;
                    let url = ( fnt.url ? fnt.url : ( fnt.bib ? _bib_url(bib_src,fnt.bib) : '') );
                    var perc = make_percent_bar(trovo.sim*100, bar_styles[12], 20, 20);
                    $("#sercho_trovoj").append('<dd id="trv_' + i + '">');
                    $("#trv_"  + i).Trovo(
                        {
                            ŝablono: ŝablono,
                            valoroj: {
                                prompt: '&nbsp;&nbsp;<span class="perc_bar">' + perc.str + '</span>&nbsp;&nbsp;',
                                url: url,
                                title: '(' + (i+1) + ') ' + htmlFnt.html(fnt),
                                descr: trovo.cit.ekz,
                                data: trovo
                            }
                        }
                    );

                    // sercho_rigardu_btn_reaction(i,url);
                    // sercho_enmetu_btn_reaction(i,trovo);
                }
            } else {
                    $("#sercho_trovoj")
                        .append("<p>&nbsp;&nbsp;Neniuj trovoj.</p>");
            }
        }
    );
}

/**
 * Almetas regulesprimon al la serĉvorto
 * @param {Event} event
 */
export function regulEsprimo(event) {

    // eble traktu la helpopeton en aparta metodo!
    const re = event.target.id;
    if (re == "re_helpo") {
        window.open(globalThis.help_base_url + globalThis.help_regulesp);
        return;
    }

    // redonu prefiksoj aŭ sufiksojn aplikeblajn 
    // al radikkaraktero rkar kun rezulta vortspeco vspec
    // se ankoraŭ ne elektiĝis rkar/vspec ni povas
    // elekti afiksojn kun '?'...
    function re_afx(pref_suf,rkar,vspec) {
        const vs = (vspec?(vspec=='e'?'a':vspec):'?');
        const rk = (rkar?rkar:'?');

        function concat_no_dup(a,b) {
            return (a.concat(b))
                .filter((i,p,self)=>self.indexOf(i)===p);
        }

        let afxj = afiksoj[pref_suf]['?']['?'];

        if (vs != '?')
            afxj = concat_no_dup(afxj,afiksoj[pref_suf]['?'][vs]);
        if (rk != '?')
            afxj = concat_no_dup(afxj,afiksoj[pref_suf][rk]['?']);
        if (rk != '?' && vs != '?')
            afxj = concat_no_dup(afxj,afiksoj[pref_suf][rk][vs]);

        // se rkar = 'u' ni ankaŭ inkluzivas 'o', ĉar
        // afiksoj aplikeblaj al ulo, ankaŭ estas al aĵo
        if (rk == 'u') {
            afxj = concat_no_dup(afxj,afiksoj[pref_suf]['o'][vs]);
        }

        // se vs = 'u' ni ankaŭ inkluzivas 'o', ĉar
        // o-finaĵo same bone aplikiĝas al uloj kiel al aĵoj
        // if (vs == 'u')
        //    afxj = afxj.concat(afiksoj[pref_suf][rk]['o']);
        // PRIPENSU: ĉu ni devas ankaŭ testi, ĉu ambaŭ rkar, vs = 'u'
        // kaj tiam inkluzivi o-o por tiuj (?)

        if (afxj.length) return '(' + afxj.join('|') + ')';        
        else return '';
    }

    const srch = $("#sercho_sercho");
    const v = srch.val();
    const sele = srch[0].selectionEnd;

    // kiu radikkaraktero estis elektita?
    const rk = $("#regexes input[name='re_rk']:checked").val();
    // kiun vortspecon ni sercu?
    const vs = $("#regexes input[name='re_vs']:checked").val();

    // vortkomenco?
    const vk = $("#re_b:checked").val();
    // ĉu prefikso/sufikso estu aplikataj
    const prf = $("#re_pref").prop("checked");
    const suf = $("#re_suf").prop("checked");
    
    const prfj = prf? re_afx('prefiksoj',rk,vs)+"<br>" : '';
    // PLIBONIGU: ni elektas tie ĉi la sufiksojn laŭ radikkaraktero,
    // sed eble ni devus uzi ĉiujn, kiuj rezultas el prefiksa apliko
    // aliflanke ne klaras ĉu unue la prefikso aŭ la sufikso aplikiĝas
    // al la radiko, sed verŝajne pli kutime unue la prefikso...
    const sufj = suf? re_afx('sufiksoj',rk,vs)+"<br>" : '';

    const fin = vs? {
        o: "oj?n?\\b", 
        a: "aj?n?\\b", 
        e: "en?\\b", 
        i: "([ao]s|[ui]s?)\\b"
    }[vs] : '';

    $("#re_radiko").html("<b>" + v +"</b>");
    $("#re_esprimo").html(
        (vk?'\\b':'')
        + prfj + "<b>" + v + "</b><br>" + sufj + fin);

/*
    const re = event.target.id;
    if (re == "re_helpo") {
        window.open(globalThis.help_base_url + globalThis.help_regulesp);
    } else if (re == "re_b") {
        srch.val("\\b"+v);
    } else if ( re == "re_pref") {
        const x = {
            re_opref: "(ambaŭ|bo|ĉef|eks|ekster|en|fi|ge|kvazaŭ|mal|ne|pra|sub|super)",
            re_ipref: "(al|antaŭ|apud|ĉe|ĉirkaŭ|dis|de|ek|e[ln]|for|ĝis|inter|kontraŭ|krom|kun|kvazaŭ"
                +"|laŭ|mal|mem|mis|re|per|plu|por|post|preter|pr[io]|sub|super|tra|trans)",
            re_apref: "(ekster|kvazaŭ|ne|pli|sub|super|tro)"}[re];
        srch.val(v.startsWith("\\b")? 
            "\\b"+x+v.substring(2) 
            : x+v);
    } else {
        const pos = (sele == v.length || v[sele] == " ")? sele : v.length;
        const x = {
            re_isuf: "(a[dĉĵ]|e[jgtm]|[aio]n?t|ebl|[ie]nd|i[lgĝ]|u[lm])",
            re_asuf: "(e[cgtjm]|u[lm]|a[ĵĉ]|estr|i[gĝ])",
            re_osuf: "(a[nĉĵ]|e[rcgjt]|i[ndgĝ]|ind|is[mt]|u[jlm])",
            re_nsuf: "(o[np]|obl)",
            re_o: "oj?n?\\b", 
            re_a: "aj?n?\\b", 
            re_e: "en?\\b", 
            re_i: "([ao]s|[ui]s?|[aoi]n?taj?n?)\\b"
        }[re];
        srch.val(v.substring(0,pos)+x+v.slice(pos));
    }
    */
}

export function verkoPeriodo(periodilo,montrilo) {
    const min = periodilo.attr("data-min");
    const max = periodilo.attr("data-max");
    const val = periodilo.attr("data-val");
    const values = val.split('-').map((x)=>+x); // "min-max" kiel dunombra listo
    const handle1 = $( "#periodilo_manilo_1" );
    const handle2 = $( "#periodilo_manilo_2" );
    periodilo.slider({
        range: true,
        min: +min,
        max: +max,
        values: values, 
        create: function() {
           handle1.text( values[0] );
           handle2.text( values[1] );
        },
        slide: function(event, ui) {
            // aktualigu la montratan periodon
            handle1.text( ui.values[0] );
            handle2.text( ui.values[1] );
            //montrilo.val( ui.values[0] + " - " + +ui.values[1] );
            // aktualigu la videblon de verkoj
            //...
        }
    });
    // komence montru la tutan periodon
    //montrilo.val( val );
};

/**
 * Vokas la verko-liston kaj prezentas ĝin por limigeblo de posta citaĵo-serĉo.
 * @param {Event} event
 */
export function verkoListo(event) {
    event.preventDefault();
    const vlist = event.data;
    const vdiv = $("#sercho_"+vlist);
    const vl = $("#sercho_"+vlist+"_vl");

    if (vl.children().length) {
        // listo jam plenigita, ni nur devas remontri ĝin
        vdiv.removeClass('kasxita');
    } else {
        // ni ŝargas la verkoliston...
        $.alportu(
            'verkaro',
            { 
                kiu: 'chiuj' //vlist
            }, 
            '#sercho_error')
        .done(
            function(data) {
                if (data.length && data[0].vrk) {
                    const vrkj = data.sort((a,b)=>(a.jar-b.jar||0))
                    for (const v of vrkj) {
                        const id = "vl_"+v.vrk;
                        let txt = v.aut? v.aut+': ':'';
                        txt += v.tit? v.tit : v.nom;
                        txt += v.jar? ' ('+v.jar+')' : '';
                        vl.append('<div><label for="'+ id + '">' + txt + '</label>'
                            + '<input id="'+ id +'" type="checkbox" checked '
                            + 'name="cvl_' + vlist + '" value="' + v.vrk + '"></input></div>')
                    }
                    vl.find("input").checkboxradio();
                    vdiv.removeClass('kasxita');
                }
            }
        );
    }
}

/**
 * Elektas/malektas verkojn en la verko-listo.
 * Per butono "preta" la elekto kaŝiĝas.
 * @param {Event} event
 */
export function verkElekto(event) {
    const btn = event.target;
    const kadr = $(btn).parent();
    const val = btn.value;
    const id = btn.id;

    function check_uncheck(v) {
        // (mal)elektu ĉiujn
        const inputs = kadr.find("input");
        inputs.prop("checked",v);
        inputs.checkboxradio("refresh");
    }

    if (val == "1") {
        // elektu ĉiujn
        check_uncheck(true);
    } else if (val == "0") {
        // elektu ĉiujn
        check_uncheck(false);
    } else if (val == "preta") {
        // kaŝu la liston
        kadr.addClass("kasxita");
    }
}

/**
 * Eltrovas, kiuj verkoj estas elektitaj
 * @param {string} vlist - 'klasikaj' au 'postaj'
 * @returns liston de verkoj (ties identigiloj)
 */
export function elektitajVerkoj(vlist) {
    let vl = [];
    if (vlist == 'klasikaj' || vlist == 'postaj') {
        const vdiv = $("#sercho_"+vlist);
        vdiv.find(":checked").each((i,e) => {
            const v = e.value;
            vl.push(v)
        });
    }
    return vl;
}

/**
 * Vokas la TTT-serĉon kaj prezentas la trovojn
 * @param {Event} event
 */
export function retoSerĉo(event) {
    event.preventDefault();
    if (! _serĉo_preparo()) return;

    const rx_img_link = /<(?:img|link)\b[^>]*>/ig;

    $.alportu(
        'citajho_sercho',
        { 
            sercho: $("#sercho_sercho").val(),
            kie: 'anaso'
        }, 
        '#sercho_error')
    .done(
        function(data) {   
    
        let last_link = '', last_title = '';
        let n = 0;
        const first_word = $("#sercho_sercho").val().split(' ')[0];
        // forigu bildojn (img) kaj <link...> el la HTML, por ke ili ne automate elshutighu...
        data = data.replace(rx_img_link, '');
        const ŝablono = new HTMLTrovoDt();
        
        $(data).find(".result-link,.result-snippet").filter(function() {
            var self = $(this);

            // memoru la url kiel last_link
            if ( self.is(".result-link") )   {
                const href = self.attr("href");
                const hpos = href.search('http');
                last_link = hpos>=0? decodeURIComponent(href.slice(hpos)) : href;
                last_title = self.text();

            // kreu trov-eron
            } else if ( self.is(".result-snippet") ) {
                const snippet = self.text();
                if ( last_title.search(first_word) >= 0 || snippet.search(first_word) >= 0 ) {

                    $("#sercho_trovoj").append('<dd id="trv_' + n + '">');
                    // DuckDuckGo alpendigas ĝenan parametron &rut
                    let url = last_link.replace(/&rut=[a-f0-9]+/,'');        

                    $("#trv_"  + n).Trovo(
                        {
                            ŝablono: ŝablono,
                            valoroj: {
                                url: url,
                                title: last_title,
                                descr: snippet,
                                data: {url: url, title: last_title, snip: snippet}
                            }
                        }
                    );

                    n++;
                }
            }
        });
        
        if ( n == 0 ) {
            $("#sercho_trovoj")
                    .append("<p>&nbsp;&nbsp;Neniuj trovoj.</p>");
        }
    });
}

/**
 * Vokas la bildo-serĉon (en Wikimedia) kaj prezentas la rezultojn.
 * @param {Event} event
 */
export function bildoSerĉo(event) {
    event.preventDefault();

    // /w/api.php?action=query&format=json&list=search&srsearch=korvo&srnamespace=0%7C-2&srlimit=20&srinfo=totalhits%7Csuggestion%7Crewrittenquery&srprop=size%7Cwordcount%7Ctimestamp%7Csnippet
    // /w/api.php?action=query&format=json&prop=imageinfo%7Cpageimages&pageids=513470%7C513472&iiprop=user%7Ccomment%7Cparsedcomment%7Ccanonicaltitle%7Ccommonmetadata%7Cextmetadata&piprop=thumbnail%7Cname%7Coriginal

    if (! _serĉo_preparo()) return;

    var pageids = "";

    $.alportu(
        'bildo_sercho',
        { 
            sercho: $("#sercho_sercho").val(),
            kie: 'vikimedio'
        },
        '#sercho_error')
    .done(
        function(data) {         
            var pageids = [];
            
            if (data.query && data.query.search 
                && data.query.search.length) {
                var results = data.query.search;


                var ŝablono = new HTMLTrovoDt();
                var bld_ŝablono = new HTMLTrovoDdBld();

                for (let p in results) {
                    var res =results[p];
                    //pageids += res.pageid + "|";
                    pageids.push(res.pageid);      
                    

                    $("#sercho_trovoj").append('<dd id="trv_' + res.pageid + '">');
                    $("#trv_"  + res.pageid).Trovo(
                        {
                            type: "bildo",
                            ŝablono: ŝablono,
                            bld_ŝablono: bld_ŝablono,
                            valoroj: {
                                //url: '' + res.pageid,
                                title: res.title,
                                descr: res.snippet
                            }
                        }
                    );                       

                }
            } else {
                $("#sercho_trovoj")
                    .append("<p>&nbsp;&nbsp;Neniuj trovoj.</p>");
            }
            // bildo_info(pageids.slice(0,-1));

            var chunk_size = 5;

            while (pageids.length) {
                _bildo_info(pageids.slice(0,chunk_size));
                pageids = pageids.slice(chunk_size);
            }            
        }
    );
}

/**
 * Akiras la informojn pri bildoj el Wikimedia laŭ ties paĝ-indentigiloj
 * kaj prezentas enŝovas la rezultojn en la bildoprezento.
 * @param {Array<string>} pageids
 */
function _bildo_info(pageids) {

    const ids = pageids.join('|');

    // alert(pageids);
    $.alportu(
        'bildo_info',
        { 
            paghoj: ids,
            kie: 'vikimedio'
        },
        '#sercho_error')
    .done(
        function(datalist) {   
        //$("#sercho_trovoj").html('');
            for (let d=0; d<datalist.length; d++) {          
                const data = datalist[d];
        
                if (data.query && data.query.pages) {
                let results = data.query.pages;

                for (var p in results) {
                        let res = results[p];
                        let trv = $("#trv_" + res.pageid);
                        let dosieroj = trv.Trovo("bildinfo",res,d==0,
                            function(event,data) {
                                if (data) {                       
                                    _bildo_info_2(data.title);
                                }
                                // montru enmeto-dialogon
                                $("#bildo_dlg").dialog("open");
                                $("#tabs").tabs( "option", "active", 0);
                            });
                        // ni bezonas ankaŭ bildetojn por montri ilin, necesas aparte demandi tiujn...
                        if (dosieroj.length) _bildeto_info(dosieroj);
                    }
                }
            }
        });
}



/**
 * Akiras bildeto-informojn (antaŭrigardoj de la bildoj)
 * @param {Array<string>} paghoj
 */
function _bildeto_info(paghoj) {
    const ps = paghoj.join('|');

    // alert(pageids);
    $.alportu(
        'bildeto_info',
        { 
            dosieroj: ps,
            kie: 'vikimedio'
        },
        '#sercho_error')
    .done(
        function(data) {   
        //$("#sercho_trovoj").html('');
            //for (var d=0; d<datalist.length; d++) {          
            //    data = datalist[d];
        
            if (data.query && data.query.pages) {
                var results = data.query.pages;

                for (let p in results) {
                    const res = results[p];
                    const pageid = res.pageid;

                    if (res.thumbnail)
                        $('#sercho_trovoj div.bildstriero a[href$="' + quoteattr(res.title) + '"]')
                            .html('<img src="'+res.thumbnail.source+'"/>');

                }                  
        //      } 
            }
        });
}

/** 
 * Akiras aldonajn informojn pri bildo (aŭtoro/fonto, permesilo ks)
 * @param {string} dosiero
 */
function _bildo_info_2(dosiero) {

    $.alportu(
    'bildo_info_2',
        { 
            dosiero: dosiero,
            kie: 'vikimedio'
        },
        '#sercho_error')
    .done(
        function(data) {   
        //$("#sercho_trovoj").html('');
        
            if (data.query && data.query.pages) {
                const results = data.query.pages;

                for (var p in results) {
                    const res = results[p];
                    const pageid = res.pageid;

                    if (res.thumbnail) {
                        $('#bildo_eta').attr("src",res.thumbnail.source);
                    }

                    let desc = res.title, aut = '', prm = '';

                    if (res.imageinfo && res.imageinfo.length) {
                        let md = res.imageinfo[0].extmetadata;
                        aut = md.Attribution ? md.Attribution.value : (md.Artist ? md.Artist.value : '');
                        if (md.Credit) { aut += ', ' + md.Credit.value.replace('Own work','propra verko'); }
                        if ( md.ImageDescription ) desc = md.ImageDescription.value;
                        prm = md.LicenseShortName.value;
                    } else {
                        aut = '<meta-informoj mankas...>';
                        prm = '<meta-informoj mankas...>';
                    }

                    let values = {};
                    values.url = decodeURI(res.original ? res.original.source : res.canonicalurl);
                    values.fmt = res.original ? res.original.width / res.original.height : 0;
                    values.aut = forigu_markup(aut);
                    values.prm = prm;
                    values.fnt = decodeURI(res.canonicalurl);
                    values.frazo = forigu_markup(desc);

                    $("#bildo_dlg input[type!='radio']").val("");
                    $("#bildo_dlg").dialog("valoroj",values);
                    $("#bildeto_url").attr("href",values.fnt);
                }
            }
    });
}

/**
 * Difinas jqueryui-elementon por prezenti unuopan trovon.
 */
$.widget( "redaktilo.Trovo", {
    options: {
        type: "teksto",
        ŝablono: new HTMLTrovoDt(),
        bld_ŝablonono: null,
        valoroj: {
            prompt: "&nbsp;&nbsp;&#x25B6;&#xFE0E;",
            url: null,
            title: '',
            descr: '',
            data: {},
            enm_btn: true
        }
    },

    _create: function() {
        this._super();

        var o = this.options;
        var v = o.valoroj;
        v.id = this.element.attr("id");
        var htmlstr = o.ŝablono.html(v);
        /*
            '<dt>' + o.prompt + ' ' + '<span class = "trovo_titolo">'
                +  ( o.url ? 
                        '<a href="' + o.url + '" target="_new" ' + '>' + o.title + '</a>'
                        : o.title 
                    )
                + '</span> '
                + '<button id="r_' + id + '"/> '
                + ( o.enm_btn ? '<button id="e_' + id + '"/> ' : '' )
            + '</dt>\n';
            */
        this.element.before(htmlstr);
        if (v.descr) this.element.text(v.descr);

        if (o.type == "teksto") {
            $("#r_" + v.id).RigardoBtn({url: v.url});
            $("#e_" + v.id).EkzemploBtn({
                data: v.data,
                enmetu: function(event,values) {
                    // montru enmeto-dialogon
                    $("#ekzemplo_dlg input").val("");
                    $("#ekzemplo_dlg").dialog("valoroj",values);
                    $("#ekzemplo_dlg").dialog("open");
                    $("#tabs").tabs( "option", "active", 0);
                }
            });
        }
    },

    bildinfo: function(res, first, enmetu) {
        var o = this.options;
        var v = o.valoroj;
        var pageid = res.pageid;

        v.data = res;
        v.url = res.canonicalurl;

        if (v.url) { // eble rezulto dividiĝas al pluraj respondoj... tiel ke mankas canonicalurl...

            // aldonu URL en la trov-alineo kaj aktivigu la butonojn Rigardu kaj Enmetu

            $("#r_trv_" + pageid).RigardoBtn({url: v.url});
            $("#e_trv_" + pageid).BildoBtn({
                data: v.data,
                enmetu: enmetu // reago-funkcio por enmeto...
            });
    
            let a = $("#sercho_trovoj a[href='" + pageid +"']");
            a.attr("href",v.url);
            //a.after(rigardu.html(),' ',enmetu.html());
        }

        // se ekzistas bildeto aldonu ĝin ankaŭ
        if (res.thumbnail) {

/*
            let dd = '<table><tr><td><a href="' + res.original.source + '" target="_new">' +
            "<img src='" + res.thumbnail.source + "'/>" + "</a></td><td>" + 
            $("#trv_" + pageid).html() + "</td></tr></table>";
            $("#trv_" + pageid).html(dd);
            */
           $("#trv_" + pageid).html(
               o.bld_ŝablono.html({
                  original: res.original.source,
                  thumbnail: res.thumbnail.source,
                  t_html: $("#trv_" + pageid).html()
            }));

            if (first && res.ns == 0)
                $("#trv_" + pageid).append('<div class="bildstrio"></div>');
        }

        // se la trovita paĝo enhavas plurajn bildojn aldonu ilin tabele
        var dosieroj = Array();

        if (res.images) {
            for (var i in res.images) {
                let img = res.images[i];
                let ext = img.title.slice(-4).toLowerCase();

                if (ext == '.jpg' || ext == '.png') {
                    let iurl= "https://commons.wikimedia.org/wiki/" + quoteattr(img.title);
                    let title = img.title.slice(5,-4); // forigu File: kaj .xxx eble pli inteligente uzu Regex...
                    let li_item_id = res.pageid + "_" + img.title.hashFnv32a(true);

                    $("#trv_" + pageid + " > div").append(
                        "<div class='bildstriero'><p class='butonoj'>" 
                        + "<button id='r_" + li_item_id + "'></button> "
                        + "<button id='e_" + li_item_id + "'></button>" 
                        + "</p><a target='_new' href='" + iurl + "'>" + title 
                        + "</a></div>");

                    $("#r_" + li_item_id).RigardoBtn({url: iurl});
                    $("#e_" + li_item_id).BildoBtn({
                        data: img,
                        enmetu: enmetu
                        /*
                        enmetu: function(event,values) {
                            // montru enmeto-dialogon
                            $("#bildo_dlg").dialog("valoroj",values);
                            $("#bildo_dlg").dialog("open");
                            $("#tabs").tabs( "option", "active", 0);
                        } */
                    });
                    
                    dosieroj.push(img.title);
                }
            }
        }
        // ni bezonas ankaŭ bildetojn por montri ilin, necesas aparte demandi tiujn...
        return dosieroj;
    }
});


/**
 * Difinas jqueryui-elementon por la butono de fonto-rigardo.
 */
$.widget( "redaktilo.RigardoBtn", {
    options: {
        url: null
    },

    _create: function() {
        this._super();

        var e = this.element;
        e.attr("style","visibility: hidden");
        e.attr("type","button");
        e.attr("title","sur aparta paĝo");
        e.html("Rigardu");

        this._on({
            click: function(event) {
                if (this.options.url) {
                    event.preventDefault();
                    window.open(this.options.url);
                    //console.debug("malfermas: "+url);
                } else {
                    throw nedifinita_url;
                }
            }
        });
    }
});



/**
 * Difinas jqueryui-elementon por lanĉi ekzemplo-dialogon
 * kiu helpas al uzanto enmeti la trovaĵon en la XML-artikolon.
 */
$.widget( "redaktilo.EkzemploBtn", {
    options: {
        data: null,
        enmetu: null //event
    },

    _create: function() {
        this._super();

        var e = this.element;
        e.attr("style","visibility: hidden");
        e.attr("type","button");
        e.attr("title","en la XML-tekston");
        e.html("Enmetu");

        this._on({
            click: function(event) {
                var values = {};
                var data = this.options.data;

                // rezulto de Tekstaro-serĉo
                if (data.cit) {
                    values = data.cit.fnt;
                    values.frazo = data.cit.ekz;

                // rezulto de Vikipedio-serĉo
                } else if(data.pageid) {
                    values.url = 'https://eo.wikipedia.org/?curid=' + data.pageid;
                    values.bib = 'Viki';
                    values.lok = data.title;
                    values.frazo = data.title;

                // rezulto de Anaso-serĉo
                } else if (data.snip) {
                    values.frazo = data.snip;
                    values.url = data.url;        
                    values.vrk = data.title;
                }

                this._trigger("enmetu",event,values);
            }
        });
    }
});



/**
 * Difinas jqueryui-elementon por lanĉi bildo-dialogon
 * kiu helpas al uzanto enmeti la trovaĵon en la XML-artikolon.
 */
$.widget( "redaktilo.BildoBtn", {
    options: {
        data: null,
        enmetu: null //event
    },

    _create: function() {
        this._super();

        var e = this.element;
        e.attr("style","visibility: hidden");
        e.attr("type","button");
        e.attr("title","en la XML-tekston");
        e.html("Enmetu");

        this._on({
            click: function(event) {
                this._trigger("enmetu",event,this.options.data);
            }
        });
    }

});
            
