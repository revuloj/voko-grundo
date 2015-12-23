  
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

    $("#__article__").load( prefix + url.filename+url.hash, function(responseText, textStatus, XMLHttpRequest) {

      // Get the page we are going to dump our content into.
      var $page = $( "#__legado__" );

      // Get the header for the page.
      $header = $page.children( ":jqmData(role=header)" );

      // remove style sheet
      $("[href='../stl/artikolo.css']").remove();
 //     var $trd_ref = $(".trd_ref");
 //     $trd_ref.remove();

    // except internal links from Ajax hijacking
      $("#__article__ a[href^='#']").attr("data-ajax","false");

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

 //***************** logiko por ona ŝargado de paĝoj **************

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

  //**************************** serĉo **********************

  $("#__sercho__").live('keyup', function() {
    var $serchajho = $("#__serchajho__");
    var t = $serchajho.val();

    if ( $("#__cx__").attr("checked") ) {
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

      if (t != $serchajho.val()) {
        $serchajho.val(t);
      }
    }
  });
 
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
     var jqxhr = $.post('/cgi-bin/sercxu-json.pl',
     {sercxata: serchajho, cx: cx },
       function(data) {
         //alert("Data Loaded: " + data);
         injectSearchResult(data);
       });
       //jqxhr.success( function() { alert("second success"); })
       jqxhr.error( function(jqXHR, errorMsg, thrownError) {
          alert("Eraro dum serĉo:" +  thrownError);
       })
       //jqxhr.complete( function() { alert("complete"); });
  }
//);

$("#__trovu__").live('click',submitSearchForm);
$("#__serchajho__").live('keydown', function(event) {
     if (event.which == 13) {
	//event.preventDefault();
        submitSearchForm(event);
     }
  });
