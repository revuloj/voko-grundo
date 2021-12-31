
/* jshint esversion: 6 */

/**
 * @license (c) 2008 - 2021 Wolfram Diestel, Wieland Pusch, Bart Demeyere & al.
 * lau GPL 2.0
 */

console.debug("Etendante jQuery per kelkaj utilfunkcioj...");
jQuery.extend({

    ricevu: function(url,error_to) {
        if (error_to && typeof error_to == "string") $(error_to).hide();
        $("body").css("cursor", "progress");
    
        return (
            this.get(url)
            .fail (
              function(xhr) {
                  console.error(xhr.status + " " + xhr.statusText);
                  if (error_to && typeof error_to == "string") {
                      var msg = "Pardonu, okazis neatandita eraro: ";
                          $(error_to).html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                          $(error_to).show();
                  } else if (typeof error_to == "function") {
                      error_to(xhr,"Okazis eraro dum ŝargo.");
                  }
              })
            .always(
              function() {
                  $("body").css("cursor", "default");
              })
          );
    },

    alportu: function(url,params,error_to) {
      if (error_to && typeof error_to == "string") $(error_to).hide();
      $("body").css("cursor", "progress");
  
      return (
          this.post(url,params)
          .fail (
            function(xhr) {
                console.error(xhr.status + " " + xhr.statusText);
                if (error_to && typeof error_to == "string") {
                    var msg = "Pardonu, okazis netandita eraro: ";
                        $(error_to).html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                        $(error_to).show();                  
                } else if (typeof error_to == "function") {
                    error_to(xhr,"Okazis eraro dum ŝargo.");
                }
            })
          .always(
            function() {
                $("body").css("cursor", "default");
            })
        );
    },

    alportu2: function(settings,error_to) {
        if (error_to && typeof error_to == "string") $(error_to).hide();
        $("body").css("cursor", "progress");
    
        return (
            this.post(settings)
            .fail (
              function(xhr) {
                  console.error(xhr.status + " " + xhr.statusText); 
                  if (error_to && typeof error_to == "string") {
                    if (xhr.status == 404) {
                        const msg = "Pardonu, la dosiero ne troviĝis sur la servilo: ";
                        $(error_to).html( msg + JSON.stringify(settings.data).replace(/"/g,''));
                    } else {
                      const msg = "Pardonu, okazis netandita eraro: ";
                      $(error_to).html( msg + xhr.status + " " + xhr.statusText + xhr.responseText);
                    }
                    $(error_to).show();                      
                } else if (typeof error_to == "function") {
                    error_to(xhr,"Okazis eraro dum ŝargo.");
                }                  
              })
            .always(
              function() {
                  $("body").css("cursor", "default");
              })
          );
      }
  
});
  
  

jQuery.fn.extend({

    // ricevu markitan (elektitan) tekston de elemento
    selection: function() {
        var el = this.get(0);
        if (window.getSelection) {
            // Firefox
            return window.getSelection().toString();
        } else if (document.getSelection) {
            // IE?
            return document.getSelection().toString();
        }
    },

    // redonu nune markitan tekston el tekstareo
    textarea_selection: function() {
        var el = this.get(0);
        if ('selection' in document) {
            // Internet Explorer
            el.focus();
            var sel = document.selection.createRange();
            return sel.text;
          }
          else if ('selectionStart' in el) {
            // other, e.g. Webkit based
            var startPos = el.selectionStart;
            var endPos = el.selectionEnd;
            return el.value.substring(startPos, endPos);
          } else {
              console.error("selection (preni markitan tekston) ne subtenita por tiu krozilo");
          }
    },
    
    // enmetu tekston ĉe la pozicio de kursoro, resp. anstataŭigu la nuna elekton per nova teksto
    insert: function(myValue){
      var is_chrome = ((navigator.userAgent.toLowerCase().indexOf('chrome') > -1) &&
                       (navigator.vendor.toLowerCase().indexOf("google") > -1));        
        
      return this.each(function(i) {
        // provu unue per insertText-komando, Chrome nur tiel memoras por malfari per Stir+Z
        if (is_chrome) {
            //var tmp = this.value;
            this.focus();
            scrollPos = $(this).scrollTop();
            ///var charBefore = this.value.charCodeAt(this.selectionStart-1);
            // en Chrome enmetaĵo foje shovighas unu signon tro frue, t.e. linirompo estos malantaŭ
            // la enmetaĵo anstataŭ antaŭ. Provu kompensi tiun problemon paŝante unu signon pli antaŭen...
            ///if (myValue.match(/^\s+</) && charBefore != 10 && charBefore != 111) {
            ///    this.selectionStart++;
            ///}
            //var chr = this.value.charCodeAt(this.selectionStart);
            //console.log("insert at "+chr+': '+myValue.charCodeAt(0)+'['+myValue.slice(0,10)+"]");
            // enmetu la tekston
            /* execCommand estas malanoncita, vd
            https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
            https://stackoverflow.com/questions/12251629/is-there-something-better-than-document-execcommand
            https://trix-editor.org/
            k.a.
            */ 
            document.execCommand("insertText", false, myValue);
            $(this).scrollTop(scrollPos);
        } else if (document.selection) {
          // Internet Explorer
          this.focus();
          var sel = document.selection.createRange();
          sel.text = myValue;
          this.focus();
        }
        else if (this.selectionStart || this.selectionStart == '0') {
          // Firefox and Webkit based
          var startPos = this.selectionStart;
          var endPos = this.selectionEnd;
          var scrollTop = this.scrollTop;
          this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
          this.focus();
          this.selectionStart = startPos + myValue.length;
          this.selectionEnd = startPos + myValue.length;
          this.scrollTop = scrollTop;
        } else {
          this.value += myValue;
          this.focus();
        }
      });
    },
  
    // kalkulu, je kiom da spacoj la markita linio estas enŝovita    
    get_indent: function () {
        var txtarea = this.get(0);
        var indent = 0;
        if (document.selection && document.selection.createRange) { // IE/Opera
              var range = document.selection.createRange();
              range.moveStart('character', - 200); 
              var selText = range.text;
              const linestart = selText.lastIndexOf("\n");
              while (selText.charCodeAt(linestart+1+indent) == 32) {indent++;}
        } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
              var startPos = txtarea.selectionStart;
              const linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
              while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+indent) == 32) {indent++;}
        }
        return (str_repeat(" ", indent));
    },

    // enŝovu markitan liniaron je pliaj du spacoj 
    indent: function(offset) {
        var txtarea = this.get(0);
        var selText, isSample=false;
  
        if (document.selection && document.selection.createRange) { // IE/Opera
          alert("tio ankoraux ne funkcias.");
        } else if (txtarea.selectionStart || txtarea.selectionStart==0) { // Mozilla
  
          //save textarea scroll position
          var textScroll = txtarea.scrollTop;
          //get current selection
          txtarea.focus();
          var startPos = txtarea.selectionStart;
              if (startPos > 0) {
                startPos--;
              }
          var endPos = txtarea.selectionEnd;
              if (endPos > 0) {
                endPos--;
              }
          selText = txtarea.value.substring(startPos, endPos);
          if (selText=="") {
            alert("Marku kion vi volas en-/elsxovi.");
          } else {
            var nt;
            if (offset == 2)
              nt = selText.replace(/\n/g, "\n  ");
            else 
              nt = selText.replace(/\n  /g, "\n");
            txtarea.value = txtarea.value.substring(0, startPos)
                              + nt
                              + txtarea.value.substring(endPos, txtarea.value.length);
            txtarea.selectionStart = startPos+1;
            txtarea.selectionEnd = startPos + nt.length+1;
  
            //restore textarea scroll position
            txtarea.scrollTop = textScroll;
          }
        } 
    },
    
    /* uzu xmlarea.position()!
    // pozicio de kursoro en elemento, ekz. textarea - n-ro de signo
    getCursorPosition: function() {
        var el = this.get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    },
    */
    
    // redonu la linion kaj pozicion ene de linio el absoluta pozicio (index -> line:pos)
    getCursorLinePos: function() {
       var pos = this.getCursorPosition();
       var text = this.val();
       return get_line_pos(pos,text);
    },

    // redonu la linion kaj pozicion ene de linio el absoluta pozicio (index -> line:pos)
    getCharBeforeCursor: function() {
        var pos = this.getCursorPosition();
        return this.val().slice(pos-1,pos);
    },

    xklavo: function(key) {

        const cx1 = {
            s: '\u015D',
            S: '\u015C',
            c: '\u0109',
            C: '\u0108',
            h: '\u0125',
            H: '\u0124',
            g: '\u011D',
            G: '\u011C',
            u: '\u016D',
            U: '\u016C',
            j: '\u0135',
            J: '\u0134'
        };

        const cx2 = {
            '\u015D': 's',
            '\u015C': 'S',
            '\u0109': 'c',
            '\u0108': 'C',
            '\u0125': 'h',
            '\u0124': 'H',
            '\u011D': 'g',
            '\u011C': 'G',
            '\u016D': 'u',
            '\u016C': 'U',
            '\u0135': 'j',
            '\u0134': 'J'
        };
        
        function cxigi(b, key) {
            var k=key; //String.fromCharCode(key);
            return (cx1[b] || (cx2[b] ? cx2[b] + k : ''));
        }

        var el = this.get(0);
        if (document.selection && document.selection.createRange) { // IE/Opera
            /* /save window scroll position
            if (document.documentElement && document.documentElement.scrollTop)
                var winScroll = document.documentElement.scrollTop
            else if (document.body)
                var winScroll = document.body.scrollTop;
                */
            //get current selection  
            el.focus();
            var range = document.selection.createRange();
            if (range.text != "") return true;
            range.moveStart('character', -1); 
            const nova = cxigi(range.text, key);
            if (nova != "") {
                range.text = nova;
                return false;
            }
        } else if (el.selectionStart || el.selectionStart == '0') { // Mozilla
            var start = el.selectionStart;
            var end = el.selectionEnd;
            if (start != end || start == 0) return true; 

            const nova = cxigi(el.value.substring(start-1, start), key);
            if (nova != "") {
                //save textarea scroll position
                var textScroll = el.scrollTop;
                var val = el.value;
                el.value = val.substring(0,start-1) + nova + val.substring(end,val.length);
                el.selectionStart = start + nova.length-1;
                el.selectionEnd = el.selectionStart;
                //restore textarea scroll position
                el.scrollTop = textScroll;
                return false;
            }
        }
    },

    // elektu la tutan tekston de elemento
    selectAll: function(){
        return this.each(function(i) {
            if ('selectionStart' in this) {
                this.selectionStart=0;
                this.selectionEnd = this.value.length;
            }
            else if (this.select) {
            // Internet Explorer & al.
            this.focus();
            this.select();
            }
            // Safari
            else if (this.selectionRange) {
            this.setSelectionRange(0, this.value.length);
            this.focus();
            }
        });
    },
     
    // elektu regionon en Textarea
    selectRange: function(start, end) {
        if(end === undefined) {
            end = start;
        }
        return this.each(function() {
            //this.focus();
            if('selectionStart' in this) {
                this.selectionStart = start;
                this.selectionEnd = end;
            } else if(this.setSelectionRange) {
                this.setSelectionRange(start, end);
            } else if(this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
            this.blur();
            this.focus();
            
            // almenaŭ en IE necesas ruli al la ĝusta linio ankoraŭ, por ke ĝi estu videbla
            var text = $(this).val();
            var scroll_to_line = Math.max(get_line_pos(start,text).line - 5, 0);
            var last_line = get_line_pos(text.length-1,text).line;
            this.scrollTop = this.scrollHeight * scroll_to_line / last_line;
        });
    },

    form_text: function() {
        var all_text = '';
        this.contents().each(function() {
            if ( this.nodeType === 3 ) {
               all_text += this.textContent;
            } else if ( this.tagName == 'INPUT' ) {
               all_text += $(this).val();
            } else if ( this.nodeType === 1 ) {
               all_text += $(this).form_text();
            }
        });
        return all_text;
    },

    validate: function() {
        var valid = true;
        this.each(function(i) {
            var e = $(this);
            if (e.Checks("instance")) {
                if (! e.Checks("check")) valid=false;
            }
        });
        return valid;
    }
});

function xpress(event) {
    var key = event.key;
    if (key == 'x' || key == 'X') {   // X or x
        return $(this).xklavo(key);
    }
}
