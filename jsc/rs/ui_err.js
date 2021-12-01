
/* jshint esversion: 6 */

// (c) 2016 - 2022 - Wolfram Diestel
// laŭ GPL 2.0

import { show_xhr_error } from './ui_dlg.js';


console.debug("Instalante la erar- kaj kontrolfunkciojn...");
$.widget( "redaktilo.Checks", {

    options: {
        /* e.g.
        nonempty: 'Valoro de X devas ion enhavi',
        pattern: /^...$/ or pattern: { regex: /^...$/, message: "bla bla" },
        err_to: '#my_err' // kie montri la eraron
        */
    },

    _create: function() {
        this._creating = true;
        this._super();
        var id = this.element.attr("id");
        if (this.options.nonempty) {
            this._nonempty = true;
            /*
            var label = $("label[for='"+id+"']").text();
            this._nonempty_msg = label ? 'Necesas doni valoron por ' + label : 'Mankas necesa valoro.';
            */
           this._nonempty_msg = this.options.nonempty;
        }
        //if (typeof this.options.pattern === 'regexp') {
        if (this.options.pattern instanceof RegExp) {
            var label = $("label[for='"+id+"']").text();
            this._pattern  = this.options.pattern;
            this._pattern_msg = label ? 'La donita valoro por ' + label + 'ne estas valida' : 'Nevalida valoro.';
        } else if (typeof this.options.pattern === 'object') {
            this._pattern  = this.options.pattern.regex;
            this._pattern_msg = this.options.pattern.message;  
        }
        this._err_fld = $(this.options.err_to);
    },

    /*
    _init: function() {
        if (this._creating) {
            this._creating = false
        } else {
            return this.check()
        }
    },
    */

    check: function() {
        var e = this.element;
        var err = this._err_fld;
        var ok = true;

        if (this._nonempty && e.val() == '') {          
            err.text(this._nonempty_msg);
            err.show();  
            ok = false;
        } else if (this._pattern && ! e.val().match(this._pattern)) {          
            err.text(this._pattern_msg);
            err.show();  
            ok = false;
        } 
        if (ok) err.hide();  
        return ok;
    }
});

$.widget( "redaktilo.Erarolisto", {

    options: {
        a_click: null
    },

    _create: function() {
        this._super();

        this._on({
            "click li": this._click,
            "click a": function(event) { this._trigger("a_click",event,null); } 
        });
    }, 

    aldonu: function(err) { // err: {line: <l>, pos: <p>, msg: <text>}
        var added = false;
        /*
        var l = err.line || 0; // linio
        var p = err.pos || 0;  // posicio
        var v = l? (p? l+":"+p : l) : "=)"; // atributo value: kombino de linio kaj pozico aŭ ridulo
        var t = v? "linio "+v : ""; // atributo title
        var item =  '<li value="' + v + (t? '" title="' + t :"") + (err.id?' id="'+err.id+'"':'') + '">'  + err.msg  + '</li>';
        */
        var li = new HTMLError().html(err);
        var n_ = parseInt(err.line);
        //$("#kontrolo_list").fadeOut("fast", function() {
            $("li",this.element).each(function(){
                if ($(this).attr("value") > n_) {
                    $(this).before(li);
                // $("#kontrolo_list").fadeIn("fast");
                    added = true;
                    return false;
                }
            });
            if ( !added ) {
                this.element.append(li);
            // $("#kontrolo_list").fadeIn("fast");
            }
        //});
    },

    aldonu_liston: function(entries) {
        for (var i=0; i<entries.length; i++) {
            this.aldonu(entries[i]);
        }
    },

    /*
    forigu: function() {
        this.element.empty();
    },*/
    
    _click: function(event) {
        // la atributo value de li donas la linion en la XML-teksto,
        // la atributo title de li donas line:pos
        if (event.target.localName != "a") {
            const line_pos = $(event.currentTarget).attr("value");
            const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
            xmlarea.goto(line_pos);
            // okazigu eventon poziciŝanĝo ĉe Artikolo...
            $("#xml_text").Artikolo("option","poziciŝanĝo")(); 
        }
    }

});

export function xmlkontrolo() {
    const xmlarea = $("#xml_text").Artikolo("option","xmlarea");
    const xml_text = xmlarea.syncedXml(); //$("#xml_text").val();

  
    if (! xml_text ) {
        alert('Vi ankoraŭ ne ŝargis artikolon por kontroli!');
        return;
    }
 
    $("body").css("cursor", "progress");
    $.post(
          "revo_kontrolo", 
          //{ art: $("shargi_dosiero").val() },
          { xml: xml_text })
      .done(
          function(data) { 
              data = data.length? data : [{ msg: "XML estas en ordo (sintakso).", cls: "status_ok" }];
              $("#dock_eraroj").Erarolisto("aldonu_liston",
                data.map(err => 
                    {
                        err.msg = quoteattr(err.msg); 
                        return err;
                    })
                );
          })
      .fail (
          function(xhr) {
              console.error(xhr.status + " " + xhr.statusText);
              if (xhr.status == 400) {
                   alert("Eraro dum kontrolado: " + xhr.responseText);
              } else {
                  show_xhr_error(xhr,"Ho ve, okazis eraro:",
                    "Supozeble via seanco forpasis kaj vi devas resaluti.");
              }
      })
      .always(
             function() {
                 $("body").css("cursor", "default");
      });

    // povas okazi dum atendi la rezulton de XML-kontrolo
    mrkkontrolo();
}


export function mrkkontrolo() {
    const art = $("#xml_text");
    const xmlarea = art.Artikolo("option","xmlarea");
    const xml = xmlarea.syncedXml(); //$("#xml_text").val();

    var mrkoj = art.Artikolo("markoj");
    for (let mrk in mrkoj) {
        if (mrkoj[mrk] > 1) {
            //alert("" + mrkoj[mrk] + "-obla marko: "+ mrk);
            var err = get_line_pos(mrkoj[mrk],xml);
            err.line++; err.pos+=2;
            err.msg = "marko aperas plurfoje: "+ mrk;
            $("#dock_eraroj").Erarolisto("aldonu",err);
        }
    }
    var sncoj = art.Artikolo("snc_sen_mrk");

    if (sncoj) {
        var avt = $("#dock_avertoj");
        var drvoj = art.Artikolo("drv_markoj");
        var dmrk = 'xxx.0';

        for (let inx in sncoj) {
            let snc = get_line_pos(inx,xml);

            // trovu derivaĵon antaŭ tiu senco
            for(var i=drvoj.length-1; i>=0; i--) {
                let drv = drvoj[i];
                if (drv.line < snc.line) {
                    dmrk = drv.mrk;
                    break;
                }
            }
    
            snc.line++; snc.pos++;
            snc.msg = "senco sen marko, <span class='snc_mrk' title='aldonu'>aldonebla kiel: <a>"
                     + dmrk + "." + sncoj[inx] + "</a></span>";
            avt.Erarolisto("aldonu",snc);
        }
    }
}


export function klrkontrolo() {
    const art = $("#xml_text");
    const xmlarea = art.Artikolo("option","xmlarea");
    const xml = xmlarea.syncedXml(); //$("#xml_text").val();
    const klroj = art.Artikolo("klr_ppp");

    if (klroj) {
        var avt = $("#dock_avertoj");

        for (let pos in klroj) {
            let klr = get_line_pos(pos,xml);
   
            klr.line++; klr.pos++;
            klr.msg = "klarigo sen krampoj, <span class='klr_ppp' title='anstataŭigu'>anstataŭigebla per: <a>" +
                "&lt;klr&gt;[…]&lt;/klr&gt;</a></span>";
            avt.Erarolisto("aldonu",klr);
        }
    }
}


export function vortokontrolo() {

    var lines = $("#xml_text").Artikolo("lines_as_dict");

    var chunk_size = 20;
    var i = 0;
    var l_ = {};

    for (let n in lines) {
        l_[n]  = lines[n];
        i++;

        if (i == chunk_size) {
            kontrolu_liniojn(l_);
            i = 0; l_ = {};
        }
        //kontrolu_linion(parseInt(n),lines[n]);
    }
    // kontrolu eblan reston
    if (i < chunk_size) {
        kontrolu_liniojn(l_);
    }
}

function kontrolu_liniojn(lines) {   
    $("body").css("cursor", "progress");
    var k = Object.keys(lines);
    var id = "vktrl_"+k[0];
    // montru linion dum atendado...
    $("#dock_avertoj").Erarolisto("aldonu",{
        id: id, 
        line: k[0],
        msg: "<span class=\"animated-dock-font\">kontrolante vortojn de linioj " + k[0] + ".." + k[k.length-1] + " ...</span>"
    });

    // redonu nur kontrolendajn analiz-rezultojn    
    lines.moduso = "kontrolendaj"; 
    $.alportu2(
        {
            url: "analinioj",
            //{ art: $("shargi_dosiero").val() },
            data: JSON.stringify(lines),
            contentType: 'application/json'
        })
      .done(
          function(data) {  
             //var html = n + ": " + data;
             // $("#kontrolo_ana").append(html);
             //var str = data.replace('---','\u2014');
             $("#"+id).remove();
             $("#dock_avertoj").Erarolisto("aldonu_liston",
                Object.keys(data).map(_ana2txt,data));

             /*
             for (n in data) {
                vrtkontrolo_aldonu_linion(n,data[n]); 
             }
             */
          })
       .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                $("#"+id).html("Okazis erraro dum kontrolo: " + xhr.statusText);
          });
}

export function surmetita_dialogo(url,root_el,loc) {
    
    $("body").css("cursor", "progress");
    $.get(
          url, 
          {})
      .done(
          function(data, status, xhr) {   
              if (xhr.status == 302) {
                  // FIXME: When session ended the OpenID redirect 302 is handled behind the scenes and here we get openid/login with status 200
                show_xhr_error(xhr,"Via seanco finiĝis. Bonvolu resaluti!");
              } else {
                  $("#surmetita").html(data);
                  $("#surmetita_dlg").dialog("option", "title", $("#surmetita h1").text());
                  $("#surmetita h1").remove("h1");
              }
              // adaptu altecon de la dialogo, por ke la deklaro ruliĝu sed la titolo kaj reir-butono montriĝu...
              var dlg = $("#surmetita_dlg").parent();
              var view_h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
              var decl_h = (view_h * 0.70) - dlg.children(".ui-dialog-titlebar").height(); // - dlg.children(".ui-dialog-buttonpane").height();
              $("#"+root_el).height(decl_h);

              $("#surmetita_dlg").dialog("open");

              window.location.hash=loc;
          })
      .fail (
          function(xhr) {
              console.error(xhr.status + " " + xhr.statusText);
              if (xhr.status == 400) {
                  $("#surmetita_error").html('Pardonu, okazis eraro dum ŝargo de la dokumento.');
              } else {
                  var msg = "Pardonu, okazis netandita eraro: ";
                  $("#surmetita_error").html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
              }
              $("#surmetita_error").show(); 
      })
      .always(
             function() {
                 $("body").css("cursor", "default");
             });

  //$("#surmetita_dlg").dialog("open");
}

export function show_error_status(error) {
    plenigu_xmleraro_liston([{"line": "nekonata", "msg": error.toString().substr(0,256)+'...'}]);
    $("#elekto_indikoj").hide();
    $("#dock_klavaro").show();
    $("#dock_kontrolo").show();
}

function _ana2txt(line) {
    var ana_arr = this[line]; 
    var txt = '';
    for(let i = 0; i<ana_arr.length; i++) {
        if (i>0) txt += "; ";
        const ana = ana_arr[i];
        txt += "<span class='" + ana.takso + "'>";
        txt += ana.analizo || ana.vorto;
        txt += "</span>";
        txt += " - kontrolinda ĉar <span class='ana_klarigo' data-takso='" + ana.takso + "'>";
        txt += ana.takso + " <a>\u24D8</a></span>";
    }
    return {line: line, msg: txt};
}
