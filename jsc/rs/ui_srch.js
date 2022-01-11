
/* jshint esversion: 6 */

// (c) 2018 - Wolfram Diestel
// laŭ GPL 2.0

//var sercho_focused_button = null;
console.debug("Instalante la serĉfunkciojn...");

function _serĉo_preparo() {
    if (! $("#sercho_sercho").validate()) return;

    $("#sercho_trovoj").html('');
    $("#sercho_trovoj button").off("click");

    return true;
}

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

function _bib_url(source,bib) {
    for (var entry of source) {
        if (entry.value == bib) {
            return entry.url;
        }
    }
}

export function citaĵoSerĉo(event) {
    event.preventDefault();

    if (! _serĉo_preparo()) return;

    $.alportu(
        'citajho_sercho',
        { 
            sercho: $("#sercho_sercho").val(),
            kie: event.data
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
            
