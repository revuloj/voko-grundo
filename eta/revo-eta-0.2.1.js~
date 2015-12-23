 
var resultCount=0;


//************* universalaj agordoj **************************

$(document).bind( 'mobileinit', function() {
  $.mobile.loader.prototype.options.html = '<img src="hotu.gif" alt="rezonanta..."/>';
});

//******************** manipuli literchenojn *********************************
  
 String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {       
      var reg = new RegExp("\\{" + i + "\\}", "gm");             
      s = s.replace(reg, arguments[i + 1]);
    }

    return s;
  }

  String.prototype.endsWith = function (suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
  }

  String.prototype.startsWith = function(prefix) {
    return (this.substr(0, prefix.length) === prefix);
  }

  // traduki markon el ontologio al URL de artikolo
  function translateMrk(mrk) {
    var reg1 = new RegExp("([^\#]+)\#([^_]+)_(.*)");
    var reg2 = new RegExp("_","g");
    var html = mrk.replace(reg1,"$1/$2.html#$2.$3"); 
    return html.replace(reg2,".");
  }

  function rezonoLigo(about) {
      return "<input type='image' src='../smb/tezauro.png' alt='REZ' value='"+about+"'/>";

//"<a href='#"+about+"'>"+
//	  "<img border='0' id='__rezonsigno__' title='rezoni' alt='REZ' src='../smb/tezauro.png'/>"+
//	  "</a>";

  }


  //********************** traktado de artikoloj/lego-paĝo *********************
  // Load the data based on the URL passed in and inject it into an embedded page, and then make
  // that page the current active page.
  function loadArticle( urlObj, options )
  {

    //var parts = urlObj.hash.substr(1).split(".")
    //var file = parts[0]+".html";

    // absolute URLs doesn't work, we have to use relative URLs from /eta/
    var prefix = '../art/';
    var url = $.mobile.path.parseUrl(options.link[0].href);

    $("#__article__").load( prefix + url.filename + url.hash, 
      function(responseText, textStatus, XMLHttpRequest) 
    {

      // Get the page we are going to dump our content into.
      var $page = $( "#__legado__" );

      // Get the header for the page.
      $header = $page.children( ":jqmData(role=header)" );

      // remove style sheet
      $("[href='../stl/artikolo.css']").remove();
 //     var $trd_ref = $(".trd_ref");
 //     $trd_ref.remove();

      // except internal links (starting with '#') from Ajax hijacking
      $("#__article__ a[href^='#']").attr("data-ajax","false");

      // anstatauigu referencojn al tezauro per referenco al rezonado
//      $tezref = $("#__article__ a[href^='../tez/tz_']");
//      $tezref.attr("href","#__rezonado__");
//      $tezref.attr("target","");
      $("#__article__ dt > a[href^='../tez/tz_']").remove();
      $("#__article__ a[href^='../tez/tz_']").replaceWith(function() {
         //var mrk = $(this).attr("href").substr(10);
         var kap = $(this).parent().text();
         var reg = new RegExp("[^\\w\\u00C0-\\u1FFF\\u2C00-\\uD7FF]","gm");
         var kap = kap.replace(reg,"");
         return rezonoLigo(kap);
       });
      

      // move title into the header
      var $title = $("#__article__ > h1")
      $title.detach()
      $header.find("h1").html($title.html());

      // Pages are lazily enhanced. We call page() on the page
      // element to make sure it is always enhanced before we
      // attempt to enhance the markup we just injected.
      // Subsequent calls to page() are ignored since a page/widget
      // can only be enhanced once.
      $page.page();

      // We don't want the data-url of the page we just modified
      // to be the url that shows up in the browser's location field,
      // so set the dataUrl option to the URL for the category
      // we just loaded.
      options.dataUrl = '#__legado__'; //+url.hash; //urlObj.href;

      // Now call changePage() and tell it to switch to
      // the page we just modified.
      $.mobile.changePage( $page, options );
    });
  }

  // ***************** montri Revo-redaktilon sur paĝo, ne funkcias ankoraŭ.... 
  function loadEditor(urlObj, options) {
    //var parts = urlObj.hash.substr(1).split(".")
    //var file = parts[0]+".html";

    $("#__editor__").load( "/cgi-bin/vokomail.pl?art=", function(responseText, textStatus, XMLHttpRequest) {

      // Get the page we are going to dump our content into.
      var $page = $( "#__redakti__" );

      // Get the header for the page.
      $header = $page.children( ":jqmData(role=header)" );

      // remove style sheet
      $("[href='../stl/artikolo.css']").remove();
 //     $trd_ref.remove();

      // except internal links from Ajax hijacking
      $("#__editor__ a[href^='#']").attr("rel","external");

      // move title into the header
      var $title = $("#article > h1")
      $title.detach()
      $header.find("h1").html($title.html());


      // Pages are lazily enhanced. We call page() on the page
      // element to make sure it is always enhanced before we
      // attempt to enhance the listview markup we just injected.
      // Subsequent calls to page() are ignored since a page/widget
      // can only be enhanced once.
      $page.page();

      // We don't want the data-url of the page we just modified
      // to be the url that shows up in the browser's location field,
      // so set the dataUrl option to the URL for the category
      // we just loaded.
      options.dataUrl = urlObj.href;

      // Now call changePage() and tell it to switch to
      // the page we just modified.
      $.mobile.changePage( $page, options );
    });
  }

 //***************** logiko por fona ŝargado de paĝoj **************

 // Listen for any attempts to call changePage().
 $(document).bind( "pagebeforechange", 
   function( e, data ) {

    // We only want to handle changePage() calls where the caller is
    // asking us to load a page by URL.
    if ( typeof data.toPage === "string" && data.options.link ) {

      // We are being asked to load a page by URL, but we only
      // want to handle URLs that request the data for a specific
      // category.
      var u = $.mobile.path.parseUrl( data.toPage );
    
      if ( u.hash.substr(0,3) != '#__' )  {
        loadArticle( u, data.options );
        // Make sure to tell changePage() we've handled this call so it doesn't
        // have to do anything.
        e.preventDefault();
      } else if (u.hash == '#__redakti__' ) {
	loadEditor(u, data.options);
        // Make sure to tell changePage() we've handled this call so it doesn't
        // have to do anything.
        e.preventDefault();
      }
    }
  });

  //**************************** anstatauigo de cx,gx, ktp. **********************

  function replaceX(event) {
    var $field = $(event.target);
    var t = $field.val();
    var $checkbox = $field.id = "__serchajho__" ? $("#__cx__") : $("#__cx2__");

    if ( $checkbox.attr("checked") ) {
      t = t.replace(/c[xX]/g, "ĉ");
      t = t.replace(/g[xX]/g, "ĝ");
      t = t.replace(/h[xX]/g, "ĥ");
      t = t.replace(/j[xX]/g, "ĵ");
      t = t.replace(/s[xX]/g, "ŝ");
      t = t.replace(/u[xX]/g, "ŭ");
      t = t.replace(/C[xX]/g, "Ĉ");
      t = t.replace(/G[xX]/g, "Ĝ");
      t = t.replace(/H[xX]/g, "Ĥ");
      t = t.replace(/J[xX]/g, "Ĵ");
      t = t.replace(/S[xX]/g, "Ŝ");
      t = t.replace(/U[xX]/g, "Ŭ");

      if (t != $field.val()) {
        $field.val(t);
      }
    }
  }



 
 //**************************** serĉo **********************

  // montri serĉrezulon
  function injectSearchResult(data) {
    var $page = $( "#__sercho__" );

    var markup = '<div data-role="collapsible-set">';
    for ( var i=0; i<data.length; i++) {
       var lingvo = data[i];
       markup += "<div data-role='collapsible'" + ( lingvo.lng1 == "eo" ? " data-collapsed='false'" : "" ) + ">";
       markup += "<h2 class='ui-body-b ui-corner-all'>"+lingvo.titolo+"</h2><ul class='ui-body-c ui-corner-all'>";

       for (var j=0; j<lingvo.trovoj.length; j++) {
         var trovo = lingvo.trovoj[j];
         markup += "<li>";
         if ( trovo.mrk1.indexOf(".") <0 ) trovo.mrk1 = trovo.art + "." + trovo.mrk1;
         markup += "<a href='../art/"+trovo.art+".html#"+trovo.mrk1+"'>"+trovo.vrt1+"</a> ";
         if (trovo.mrk2) {
           if ( trovo.mrk2.indexOf(".") <0 ) trovo.mrk2= trovo.art + "." + trovo.mrk2;
           markup += "(<a href='../art/"+trovo.art+".html#"+trovo.mrk2+"'>"+trovo.vrt2+"</a>)";
         };
         markup += "</li>";
       };
    
       markup += "</ul></div>";
    };
  
    markup += "</div>";
    
    $("#__trovoj__").html(markup);

    $page.page();

    // Get the content area element for the page.
//    $content = $page.children( ":jqmData(role=content)" ),

    // Enhance the listviews we just injected.
//    $content.find( ":jqmData(role=collapsible-set)" ).collapsibleset("reresh");

    $.mobile.changePage($page);
    $.mobile.loading('hide');
  }


  /* attach a submit handler to the form */
//  $("#__serchFormularo__").submit(

  function submitSearchForm(event) {

     /* stop form from submitting normally */
     event.preventDefault();

     /* get some values from elements on the page: */
     var $form = $("#__serchFormularo__"),

     serchajho = $form.find('input[name="__serchajho__"]').val(),
     cx = $form.find('input[name="__cx__"]').val();

     /* Send the data using post and inject the results into the page */
     $.mobile.loading('show');

     var jqxhr = $.post('/cgi-bin/sercxu-json.pl',
     {sercxata: serchajho, cx: cx },
       function(data) {
         //alert("Data Loaded: " + data);
         injectSearchResult(data);
       });
       //jqxhr.success( function() { alert("second success"); })
       jqxhr.error( function(jqXHR, errorMsg, thrownError) {
          alert("Eraro dum serĉo:" +  thrownError);
          $.mobile.loading('hide');
       })
       //jqxhr.complete( function() { alert("complete"); });
  }
//);




//**************************** rezonado **********************  

  // kreu arban strukturon (indeksigitan) el la rezultolisto,
  // indeksiloj estas inx1 kaj inx2 - do la arbo havas du tavolojn sub radiko "root"
  function groupReasonResult(data, inx1, inx2) {
     var root = new Object();

     for (var i=0; i<data.length; i++) {
        var rec = data[i];

        // trovu ghustan branchon inx1,inx2 en la arbo
        var node1 = root[rec[inx1].value];
        if (! node1) {
          node1 = {
             length: 0,
             entries: {},
             get_any: function () {
               for (var any in this.entries) { 
                   if (this.entries[any] instanceof Array) { return this.entries[any][0]; } 
               }
             }
          }
          root[rec[inx1].value] = node1;
        }

        var node2 = node1.entries[rec[inx2].value];
        if (! node2) {
          node2 = new Array();
          node1.entries[rec[inx2].value] = node2;
          node1.length++;
        }
        
        // pendigu la datumobjekton tie
        node2.push(rec);
     }

     return root;
  }


  // montri rezonrezulton
  function injectReasoningResult(query,data) {
    var $page = $( "#__rezonado__" );

    var markup = '<div>';
//    var results = data.results.bindings;

    var result_empty = ! (data.results.bindings && data.results.bindings.length);
 
    if (! result_empty) {
        var grouped = groupReasonResult(data.results.bindings, "s", query=="trd"?"t":"ok");

	switch(query) {
	  case "sin":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> nomiĝas ankaŭ " +
		"<a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> nomiĝas ankaŭ ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "ant":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> estas malo de <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> estas malo de ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "vid":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> rilatas al <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> rilatas al ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "super":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> estas <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> estas ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "malprt":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> apartenas al <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> apartenas al ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "ekz":
	    sentence_1 = "Ekzemplo de <a href='{0}'><em>{1}</em>{2}</a> estas <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "Ekzemploj de <a href='{0}'><em>{1}</em>{2}</a> estas: ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "sub":
	    sentence_1 = "Speco de <a href='{0}'><em>{1}</em>{2}</a> estas <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "Specoj de <a href='{0}'><em>{1}</em>{2}</a> estas: ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "prt":
	    sentence_1 = "Al <a href='{0}'><em>{1}</em>{2}</a> apartenas <a href='{3}'><em>{4}</em>{5}</a>{6}. ";
	    sentence_n_s = "Al <a href='{0}'><em>{1}</em>{2}</a> apartenas: ";
	    sentence_n_o = "<a href='{0}'><em>{1}</em>{2}</a>{3}";
	    break;
	  case "trd":
	    sentence_1 = "<a href='{0}'><em>{1}</em>{2}</a> en aliaj lingvoj nomiĝas <em>{3}</em> ({4})</a>. ";
	    sentence_n_s = "<a href='{0}'><em>{1}</em>{2}</a> en aliaj lingvoj nomiĝas: ";
	    sentence_n_o = "<em>{0}</em> ({1})";
	    break;
        }
 
        $.each(grouped, function(s,snc) {
	    var rec = snc.get_any();
            var kap = rec.k.value;

	    if (snc.length == 1) {
		//rec = snc.get_any();
		//kap = rec.k.value;
		markup += String.format(sentence_1,
	
		   translateMrk(rec.s.value), 
		   (query=="sub"||query=="ekz"||query=="prt"? 
		      kap : kap.substr(0,1).toUpperCase() + kap.substr(1)),
		   (rec.sn? "<sup>"+rec.sn.value+"</sup>" : ""),
	
		   (query=="trd"? rec.t.value : translateMrk(rec.o.value)),
		   (query=="trd"? rec.l.value : rec.ok.value),
		   (rec.on? "<sup>"+rec.on.value+"</sup>" : ""),
	
		   (query=="trd"? "" : rezonoLigo(rec.ok.value))
		);
	    }
	    else {

		//rec = snc.get_any();
		//kap = rec.k.value;
	
		markup += String.format(sentence_n_s,
	
		   translateMrk(rec.s.value), 
		   (query=="sub"||query=="ekz"||query=="prt"? 
		      kap : kap.substr(0,1).toUpperCase() + kap.substr(1)),
		   (rec.sn? "<sup>"+rec.sn.value+"</sup>" : "")
		);

	        // TODO: metu plurajn referencojn kun sama kapvorto en elekton (menusimile)
	        // anstatau unu post la alia, char tio mirigos
	        // en la elekto krome estu ero "rezonu pri ..."

              $.each(snc.entries, function(v,vrt) {

	        for ( var i=0; i<vrt.length; i++) {
	  	  rec = vrt[i];
		  kap = rec.k.value;
		  markup += String.format(sentence_n_o,
	
		     (query=="trd"? rec.t.value : translateMrk(rec.o.value)),
		     (query=="trd"? rec.l.value : rec.ok.value),
		     (rec.on? "<sup>"+rec.on.value+"</sup>" : ""),
	
		     (query=="trd"? "" : rezonoLigo(rec.ok.value))
		  );
		  markup += (i < vrt.length-1 ? "/" : ", ");
	        } // for every "rec"
              }); // for every "v=vrt"
              // anstatauigu lastan komon per punkto
              markup = markup.substr(0,markup.length-2) + ". ";
            } // else
            markup += "<br/>";
        }); // for every "snc"
    } else {  // malplena rezulto
      
      resultCount = resultCount - 1;

      if (resultCount == 0) {
        var sentence_0 = ["Ĝi estas 42.","42","Kvardek du.", "Sepoble ses.","Sesoble sep.",
          "Ĝi estas nenio.","Ĝi estas ne tre interesa.",
          "Mi laciĝas.","Mi enuas.","Mi ne scias multe.",
          "Hieraŭ mi sciis ankoraŭ, kio ĝi estas, sed momente mi ne havas ideon.",
          "Demandu min alian fojon, kio ĝi estas.",
          "Demandu ĉe la forumo revuloj@yahoogroups.com, kio ĝi estas.",
          "Mi pensas, ke vi scias, kio ĝi estas. Kial vi do demandas min?",
          "Redemandu alian fojon, kio ĝi estas.", "Bela vetero hodiaŭ, ĉu ne?",
          "Se vi volas scii, kio ĝi estas, aĉetu PIVon, -- aŭ ĉeĥan bieron.",
          "Vi amuziĝas pri mi, ĉu?", "Vi opinias, ke mi estas stulta, ĉu ne?",
          "Kiel plaĉas al vi mia robo?","Mi estas virino.",
          "Mi scias pli da vortoj ol Zamĉjo.",
          "Mi scias pli da vortoj ol Mazi manĝas horloĝojn!",
          "Diable, mi ne scias ĉion!","Ĝi estas si mem.","Ĝi estas, kion vi tajpis.",
          "Ĝi estas koncepto, eble.","Ĝi estas kelkaj literoj.",
          "Ĝi estas serio de literoj.","Ĝi estas esprimo."]
        var n = Math.floor(Math.random()*sentence_0.length);
        markup += sentence_0[n];
      }
    }
  
    markup += "</div>";
    
    $("#__rezonoj__"+query+"__").html(markup);

    $page.page();

    // Get the content area element for the page.
//    $content = $page.children( ":jqmData(role=content)" ),

    // Enhance the listviews we just injected.
//    $content.find( ":jqmData(role=collapsible-set)" ).collapsibleset("reresh");

/////tio havas strangan paghflagran efikon:    $.mobile.changePage($page);
    $.mobile.loading('hide');
  }

  function reason(query,about) {
     $("#__rezonoj__"+query+"__").html("");

     /* Send the data using post and inject the results into the page */
     var jqxhr = $.post('/cgi-bin/revo-rezono.pl',
     { q: query, kap: about },
       function(data) {
         //alert("Data Loaded: " + data);
         injectReasoningResult(query,data);
       });

       //jqxhr.success( function() { alert("second success"); })
       // TODO: skribu erarojn rekte sur la pagho eble...
//       jqxhr.error( function(jqXHR, errorMsg, thrownError) {
//          alert("Eraro dum rezonado:" +  thrownError);
 //      })

  }


  function submitReasoningForm(event) {

     /* stop form from submitting normally */
     event.preventDefault();

     /* get some values from elements on the page: */
     var $form = $("#__rezonoFormularo__");

     rezonajho = $form.find('input[name="__rezonajho__"]').val();
//     cx = $form.find('input[name="__cx2__"]').val();
     if (rezonajho) {
       resultCount = 9;
       $.mobile.loading('show');
       reason("sin",rezonajho);
       reason("super",rezonajho);
       reason("malprt",rezonajho);
       reason("sub",rezonajho);
       reason("sub",rezonajho);
       reason("prt",rezonajho);
       reason("trd",rezonajho);
       reason("ant",rezonajho);
       reason("vid",rezonajho);
     }
  }

  function reasonAbout(event) {
     /* stop form from handling link normally */
     event.preventDefault();

     var $icon = $(event.target);
     var about = $icon.val();   

     var $form = $("#__rezonoFormularo__");
     rezonajho = $form.find('input[name="__rezonajho__"]').val(about);

     // TODO it's not the right event, but should work nevertheless
     submitReasoningForm(event);
     /// $("#__rezonu__").click();
  }


// ***************** reagoj al eventoj... ***********
$(document).on('keyup', "#__sercho__", replaceX);
$(document).on('keyup', "#__rezonado__", replaceX);

$(document).on('click', "#__rezonu__", submitReasoningForm);
$(document).on('keydown', "#__rezonajho__", function(event) {
     if (event.which == 13) {
	//event.preventDefault();
        submitReasoningForm(event);
     }
  });



$(document).on('click',"#__article__ input[alt='REZ']", function() {
	  var $page = $( "#__rezonado__" );
          // $page.page();
          //options.dataUrl = '#__rezonado__';
          $.mobile.changePage( $page ); //, options );
       });  
$(document).on('click', "input[alt='REZ']", reasonAbout);

$(document).on('click', "#__trovu__", submitSearchForm);
$(document).on('keydown', "#__serchajho__", function(event) {
     if (event.which == 13) {
	//event.preventDefault();
        submitSearchForm(event);
     }
  });
