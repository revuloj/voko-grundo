#!/usr/bin/perl

#
# redaktu.pl
# 
# 2008-10-30 Wieland Pusch
#

use strict;
use utf8;

use CGI qw(:standard *table);
use CGI::Carp qw(fatalsToBrowser);
use DBI();
use IPC::Open3;
use Encode;
use Text::Tabs;
use POSIX qw(strftime);

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use revo::decode;
use revo::encode;
use revo::xml2html;
use revo::wrap;
use revodb;
use XML::RSS;

$| = 1;

my $homedir = "/var/www/web277";
my $htmldir    = "$homedir/html";
my $revo_base    = "$homedir/html/revo";

$ENV{'LD_LIBRARY_PATH'} = '/var/www/web277/files/lib';
$ENV{'PATH'} = "$ENV{'PATH'}:/var/www/web277/files/bin";
$ENV{'LOCPATH'} = "$homedir/files/locale";
autoEscape(0);

my $JSCRIPT=<<'END';
function str_repeat(rStr, rNum) {
 var nStr="";
 for (var x=1;x<=rNum;x++) {nStr+=rStr;}
 return nStr;
} 

function showhide(id){
  if (document.getElementById){
    obj = document.getElementById(id);
    objb = document.getElementById(id+"b");
    if (obj.style.display == "none"){
      obj.style.display = "";
      objb.style.display = "none";
    } else {
      obj.style.display = "none";
      objb.style.display = "";
    }
  }
} 

function get_ta() {
  var txtarea;
  if (document.f) {
    txtarea = document.f.xmlTxt;
  } else {
	// some alternate form? take the first one we can find
	var areas = document.getElementsByTagName('textarea');
	txtarea = areas[0];
  }
  return txtarea;
}

function str_indent() {
  var txtarea = get_ta();
  var indent = 0;
  if (document.selection  && document.selection.createRange) { // IE/Opera
	var range = document.selection.createRange();
	range.moveStart('character', - 200); 
	var selText = range.text;
	var linestart = selText.lastIndexOf("\n");
	while (selText.charCodeAt(linestart+1+indent) == 32) {indent++;}
  } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
	var startPos = txtarea.selectionStart;
	var linestart = txtarea.value.substring(0, startPos).lastIndexOf("\n");
	while (txtarea.value.substring(0, startPos).charCodeAt(linestart+1+indent) == 32) {indent++;}
  }
  return (str_repeat(" ", indent));
}

function cxigi(b, key) {
  var n="";
  var k=String.fromCharCode(key);

       if (b=='s'     ) n='\u015D';
  else if (b=='\u015D') n='s'+k;
  else if (b=='S'     ) n='\u015C';
  else if (b=='\u015C') n='S'+k;

  else if (b=='c'     ) n='\u0109';
  else if (b=='\u0109') n='c'+k;
  else if (b=='C'     ) n='\u0108';
  else if (b=='\u0108') n='C'+k;

  else if (b=='h'     ) n='\u0125';
  else if (b=='\u0125') n='h'+k;
  else if (b=='H'     ) n='\u0124';
  else if (b=='\u0124') n='H'+k;

  else if (b=='g'     ) n='\u011D';
  else if (b=='\u011D') n='g'+k;
  else if (b=='G'     ) n='\u011C';
  else if (b=='\u011C') n='G'+k;

  else if (b=='u'     ) n='\u016D';
  else if (b=='\u016D') n='u'+k;
  else if (b=='U'     ) n='\u016C';
  else if (b=='\u016C') n='U'+k;

  else if (b=='j'     ) n='\u0135';
  else if (b=='\u0135') n='j'+k;
  else if (b=='J'     ) n='\u0134';
  else if (b=='\u0134') n='J'+k;

  return n;
}

function klavo(event) {
  var key = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
//  alert(key);
  if (key == 13) {
    var txtarea = get_ta();
    var selText, isSample = false;

    if (document.selection  && document.selection.createRange) { // IE/Opera
      //save window scroll position
      if (document.documentElement && document.documentElement.scrollTop)
	var winScroll = document.documentElement.scrollTop
      else if (document.body)
	var winScroll = document.body.scrollTop;
      //get current selection  
      txtarea.focus();
      var range = document.selection.createRange();
      selText = range.text;

      range.text = "\n" + str_indent();
      //mark sample text as selected
      range.select();   
      //restore window scroll position
      if (document.documentElement && document.documentElement.scrollTop)
	document.documentElement.scrollTop = winScroll
      else if (document.body)
	document.body.scrollTop = winScroll;
      return false;
    } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
      //save textarea scroll position
      var textScroll = txtarea.scrollTop;
      //get current selection
      txtarea.focus();
      var startPos = txtarea.selectionStart;
      var endPos = txtarea.selectionEnd;
      var tmpstr = "\n" + str_indent();
      txtarea.value = txtarea.value.substring(0, startPos)
			+ tmpstr
			+ txtarea.value.substring(endPos, txtarea.value.length);
      txtarea.selectionStart = startPos + tmpstr.length;
      txtarea.selectionEnd = txtarea.selectionStart;
      //restore textarea scroll position
      txtarea.scrollTop = textScroll;
      return false;
    }
  } else if (key == 88 || key == 120) {   // X or x
    if (event.altKey) {	// shortcut alt-x  --> toggle cx
      document.f.cx.checked = !document.f.cx.checked;
      return false;
    }

    if (!document.f.cx.checked) return true;
    var txtarea = get_ta();
    if (document.selection  && document.selection.createRange) { // IE/Opera
      //save window scroll position
      if (document.documentElement && document.documentElement.scrollTop)
	var winScroll = document.documentElement.scrollTop
      else if (document.body)
	var winScroll = document.body.scrollTop;
      //get current selection  
      txtarea.focus();
      var range = document.selection.createRange();
      var selText = range.text;
      if (selText != "") return true;
      range.moveStart('character', - 1); 
      var before = range.text;
      var nova = cxigi(before, key);
      if (nova != "") {
        range.text = nova;
        return false;
      }
    } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
      var startPos = txtarea.selectionStart;
      var endPos = txtarea.selectionEnd;
      if (startPos != endPos || startPos == 0) { return true; }
      var before = txtarea.value.substring(startPos - 1, startPos);
      var nova = cxigi(before, key);
      if (nova != "") {
	//save textarea scroll position
	var textScroll = txtarea.scrollTop;
	txtarea.value = txtarea.value.substring(0, startPos - 1)
		+ nova
		+ txtarea.value.substring(endPos, txtarea.value.length);
	txtarea.selectionStart = startPos + nova.length - 1;
	txtarea.selectionEnd = txtarea.selectionStart;
	//restore textarea scroll position
	txtarea.scrollTop = textScroll;
        return false;
      }
    }
  } else if (key == 84 || key == 116 || key == 1090 || key == 1058) {   // T or t or kir-t or kir-T
    if (event.altKey) {	// shortcut alt-t  --> trd
      insertTags2('<trd lng="',document.getElementById('trdlng').value,'">','</trd>','');
    }
  }
}

function insertTags2(tagOpen, tagAttr, tagEndOpen, tagClose, sampleText) {
  if (tagAttr == "") {
    insertTags(tagOpen, tagEndOpen+tagClose, sampleText)
  } else {
    insertTags(tagOpen+tagAttr+tagEndOpen, tagClose, sampleText)
  }
}

function indent(offset) {
  var txtarea = get_ta();
  var selText, isSample=false;

  if (document.selection  && document.selection.createRange) { // IE/Opera
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
}

// apply tagOpen/tagClose to selection in textarea,
// use sampleText instead of selection if there is none
function insertTags(tagOpen, tagClose, sampleText) {
  var txtarea = get_ta();
  var selText, isSample=false;

  if (document.selection  && document.selection.createRange) { // IE/Opera
    //save window scroll position
    if (document.documentElement && document.documentElement.scrollTop)
      var winScroll = document.documentElement.scrollTop
    else if (document.body)
      var winScroll = document.body.scrollTop;
    //get current selection  
    txtarea.focus();
    var range = document.selection.createRange();
    selText = range.text;
    //insert tags
    checkSelectedText();
    range.text = tagOpen + selText + tagClose;
    //mark sample text as selected
    if (isSample && range.moveStart) {
      if (window.opera)
	tagClose = tagClose.replace(/\n/g,'');
	range.moveStart('character', - tagClose.length - selText.length); 
	range.moveEnd('character', - tagClose.length); 
      }
      range.select();   
      //restore window scroll position
      if (document.documentElement && document.documentElement.scrollTop)
	document.documentElement.scrollTop = winScroll
      else if (document.body)
	document.body.scrollTop = winScroll;

  } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla

    //save textarea scroll position
    var textScroll = txtarea.scrollTop;
    //get current selection
    txtarea.focus();
    var startPos = txtarea.selectionStart;
    var endPos = txtarea.selectionEnd;
    selText = txtarea.value.substring(startPos, endPos);
    //insert tags
    checkSelectedText();
    txtarea.value = txtarea.value.substring(0, startPos)
			+ tagOpen + selText + tagClose
			+ txtarea.value.substring(endPos, txtarea.value.length);
    //set new selection
    if (isSample) {
      txtarea.selectionStart = startPos + tagOpen.length;
      txtarea.selectionEnd = startPos + tagOpen.length + selText.length;
    } else {
      txtarea.selectionStart = startPos + tagOpen.length + selText.length + tagClose.length;
      txtarea.selectionEnd = txtarea.selectionStart;
    }
    //restore textarea scroll position
    txtarea.scrollTop = textScroll;
  } 

  function checkSelectedText(){
    if (!selText) {
      selText = sampleText;
      isSample = true;
    } else if (selText.charAt(selText.length - 1) == ' ') { //exclude ending space char
      selText = selText.substring(0, selText.length - 1);
      tagClose += ' '
    } 
  }
}

function lines(str){try {return((str.match(/[^\n]*\n[^\n]*/gi).length));} catch(e) {return 0;}}

function nextTag(tag, dir) {
  var txtarea = get_ta();
  if (document.selection  && document.selection.createRange) { // IE/Opera
    alert("tio ankoraux ne funkcias.");
  } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
    var startPos = txtarea.selectionStart;
    var t;
    var pos;
    if (dir > 0) {
      t = txtarea.value.substring(startPos+1);
      pos = startPos + 1 + t.indexOf(tag);
    }
    if (dir < 0) {
      t = txtarea.value.substring(0, startPos);
      pos = t.lastIndexOf(tag);    
    }
    txtarea.selectionStart = pos;
    txtarea.selectionEnd = pos;
    txtarea.focus();
    var line = lines(txtarea.value.substring(0,pos))-10;
    var lastline = lines(txtarea.value.substring(pos))+line+10;
    if (line < 0) line = 0;
    if (line > lastline) line = lastline;
    txtarea.scrollTop = txtarea.scrollHeight * line / lastline;   

//    alert("tio baldaux funkcias. tag="+tag+" pos="+pos+" line="+line+ " lastline="+lastline);
//    alert("scrollTop="+txtarea.scrollTop+" scrollHeight="+txtarea.scrollHeight);
  }
}

function sf(pos, line, lastline) {
  document.f.xmlTxt.focus();
  var txtarea = get_ta();
  if (document.selection  && document.selection.createRange) { // IE/Opera
    var range = document.selection.createRange();
    range.moveEnd('character', pos); 
    range.moveStart('character', pos); 
    range.select();
    range.scrollIntoView(true);
  } else if (txtarea.selectionStart || txtarea.selectionStart == '0') { // Mozilla
    txtarea.selectionStart = pos;
    txtarea.selectionEnd = txtarea.selectionStart;
    var scrollTop = txtarea.scrollHeight * line / lastline;
//    alert("scrollTop="+scrollTop);
    txtarea.scrollTop = scrollTop;
  }
}
END

my $enc = "utf-8";

my @cookies;
push @cookies, cookie(-name=>'redaktanto', -value => param('redaktanto')) if param('redaktanto');
push @cookies, cookie(-name=>'trdlng',     -value => param('trdlng'))     if param('trdlng');
push @cookies, cookie(-name=>'klrtip',     -value => param('klrtip'))     if param('klrtip');
push @cookies, cookie(-name=>'reftip',     -value => param('reftip'))     if param('reftip');
push @cookies, cookie(-name=>'sxangxo',    -value => param('sxangxo'))    if param('sxangxo');
push @cookies, cookie(-name=>'cx',         -value => param('cx') || 0 );

my $debugmsg;
my $art = param('art');
#$debugmsg .= "art = $art\n";
my $xml;
my $xmlTxt = param('xmlTxt');
if ($xmlTxt) {
  $xmlTxt = Encode::decode($enc, $xmlTxt);
  $xmlTxt =~ s/\r\n/\n/g;
  $debugmsg .= "vor wrap -> $xmlTxt\n <- end wrap\n";
  my $id;
  if ($xmlTxt =~ s/"\$(Id: .*?)\$"/"\$Id:\$"/) {
    $debugmsg .= "ID: $1-\n";
    $id = $1;
  }
  $xmlTxt = revo::wrap::wrap($xmlTxt);
  $xmlTxt =~ s/"\$Id:\$"/"\$$id\$"/ if $id;
#  $debugmsg .= "wrap -> $xmlTxt\n <- end wrap\n";
}
my $xml2 = revo::encode::encode2($xmlTxt, 20) if $xmlTxt;
#$xml2 = Encode::decode($enc, $xml2);
my $redaktanto = param('redaktanto') || cookie(-name=>'redaktanto') || 'via registrita retpo&#349;ta adreso';
my $debug = $redaktanto eq 'Wieland@wielandpusch.de';

#$debugmsg .= "xmlTxt = $xmlTxt\n";

if ($xml2) {
  $xml = $xmlTxt;
#  $debugmsg .= "1 xml=\n$xml" if $debug;
} elsif (param('button') eq 'kreu') {
  $xml = <<"EOD";
<?xml version="1.0"?>
<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd">

<vortaro>
<art mrk="\$Id\$">
<kap>
    <rad>$art</rad>/o <fnt><bib>PIV1</bib></fnt>
</kap>
<drv mrk="$art.0o">
  <kap><tld/>o</kap>
  <snc mrk="$art.0o.SNC">
    <uzo tip="fak"></uzo>
    <dif>
      <tld/>o estas:
      <ekz>
        ...
        <fnt><bib></bib>, <lok></lok></fnt>
      </ekz>
    </dif>
  </snc>
  <trd lng=""></trd>
</drv>
</art>
</vortaro>
EOD
  $xml2 = revo::encode::encode2($xml, 20);
} elsif ($art) {
#  $debugmsg .= "open\n";
  open IN, "<", "$homedir/html/revo/xml/$art.xml" or die "open";
  $xml = join '', <IN>;
  close IN;

#  $debugmsg .= "xml=\n$xml" if $debug;
#  $xml = Encode::decode($enc, $xml);
#  $debugmsg .= "xml=\n$xml" if $debug;
  $xml = revo::decode::rvdecode($xml);
  $xml = Encode::decode($enc, $xml);
#  $xml = Encode::decode($enc, $xml);
#  $xml = Encode::encode($enc, $xml);
#  $debugmsg .= "xml=\n$xml" if $debug;
}
my $sxangxo = Encode::decode($enc, param('sxangxo'));
$debugmsg .= "sxangxo=$sxangxo" if $debug;
my $mrk = param('mrk');
my ($pos, $line, $lastline) = (0, 0, 1);
my ($prelines, $postlines);

my ($checklng, $checkxml, $errline, $errchar);
($checkxml, $errline, $errchar) = checkxml($xml2) if $xml2;
#$debugmsg .= "errline = $errline\n";

my $ne_konservu;

if ($errline) {
  $errline--;
  $errchar--;
  if ($xml =~ m/^([^\n]*\n){$errline}[^\n]{$errchar}/smg) {
    my @prelines = split "\n", $&;
    $postlines = split "\n", $';

    my @pre = Text::Tabs::expand(@prelines);
    $pos = length(join "\n", @pre);
    $prelines = $#prelines;

    $line = $prelines - 10;
    $lastline = $prelines + $postlines + 30 - 25;
  } else {
#    $debugmsg .= "Ne trovis linio/pos $errline/$errchar\n";
    $line = $lastline = 100;
    my @prelines = split "\n", $xml;
    my @pre = Text::Tabs::expand(@prelines);
    $pos = length(join "\n", @pre);
  }
} else {
  my %lng;
  open IN, "<$revo_base/cfg/lingvoj.xml" or die "ne povas malfermi lingvoj.xml";
  while (<IN>) {
    if (/<lingvo kodo="([^"]+)">([^<]+)<\/lingvo>/) {
#      $debugmsg .= "lng $1 -> $2\n";
      $lng{$1} = 1;
    }
  }
  close IN;

  while ($xml =~ m/(<(?:trd|trdgrp) lng=")(.*?)">/smg) {
    if (!exists($lng{$2})) {
      $checklng = "Nekonata lingvo $2.";
      $ne_konservu = 10;
#      $debugmsg .= "lng = $2\n";
      my @prelines = split "\n", "$`$1$2";
      $postlines = split "\n", $';

      my @pre = Text::Tabs::expand(@prelines);
      $pos = length(join "\n", @pre);
      $prelines = $#prelines;
      $line = $prelines - 20;
      $lastline = $prelines + $postlines + 20 - 25;
      last;
    }
  }

  if (!$pos and $xml =~ m/<(snc|drv)( mrk="$mrk".*?)(\n?\s*<\/\1>)/smg) {
    my @prelines = split "\n", "$`$1$2";
    $postlines = split "\n", "$3$'";

    my @pre = Text::Tabs::expand(@prelines);
    $pos = length(join "\n", @pre);
    $prelines = $#prelines;
#    $debugmsg .= "prelines = $prelines\n";

    $pos++;
    $line = $prelines - 20;
    $lastline = $prelines + $postlines + 20 - 25;
  }

}
$line = 0 if $line < 0;
$line = $lastline if $line > $lastline;
$lastline = 1 unless $lastline;
#$debugmsg .= "line = $line\n";

my $mycss = <<EOD;

a.butono1 {
  background-color: LightGray;
  font-family: monospace;
  font-size: 90%;
  letter-spacing: -0,1pt;
  padding: 0px 1px 0px 1px;
}
a.butono1:link, a.butono1:visited {
  border: 1px outset black;
  line-height:150%;
  color: #000;
  text-decoration: none;
  text-align: center;
}
a.butono1:hover {
 border-color: red;
 color: red;
}
.averto {
  border: 2px solid #E0E0A0;
  font-style: italic;
  padding: 0.3em 0.5em;
  width: 66%;
}
input {
  margin: 3px 1px 0px 1px;
}
.rubriko {
  text-align: right;
}
textarea {
  margin: 3px 1px 0px 1px;
}
EOD

binmode STDOUT, ":utf8";
print header(-charset=>'utf-8',
			 -pragma => 'no-cache',
            '-cache-control' =>  'no-cache',
			 -cookie=>\@cookies),
      start_html(-style=>{-src=>'/revo/stl/indeksoj.css',
                          -code=>$mycss},
                 -title=>"redakti $art",
				 -lang=>'eo', #'de',
				 -encoding => 'UTF-8',
				 -head => [ '<meta http-equiv="Cache-Control" content="no-cache">',
						  ],
                 -script=>$JSCRIPT,
                 -onLoad=>"sf($pos, $line, $lastline)"
);

if ($art) {
  print h1("Redakti ".a({href=>"/revo/art/$art.html"}, $art));
}
#my $referer =$ENV{HTTP_REFERER};
#print pre("pos=$pos, referer=$referer\n") if $debug;
#print pre("pre=".escapeHTML($prelines)."  post=".escapeHTML($postlines)."  lines=".($prelines + $postlines));
#print pre("pre=".escapeHTML($line)."  post=".escapeHTML($lastline)."  div=".($line / $lastline));

if ($debug and $debugmsg) {
  autoEscape(1);
#  $debugmsg .= "4 xml=\n$xml";
  print pre(escapeHTML($debugmsg));
  autoEscape(0);
}

print <<'EOD' if 0;
<div class="borderc8 backgroundc1" style="border-style: solid; border-width: medium; padding: 0.3em 0.5em;">
<p><span style="color: rgb(207, 118, 6); font-size: 140%;"><b>Provversio</b></span></p>
<p>Momente tio pagxo estas nur por elprovi</p>
<p><i>Viaj &#349;angxoj momente estas sendata al vi kaj al la auxtoro (sendepende de la subaj butonoj) !</i></p>
</div><br>
EOD

my (%fak, %stl);
if ($art) {
  %fak = ('' => '');
  open IN, "<$revo_base/cfg/fakoj.xml" or die "ne povas malfermi fakoj.xml";
  while (<IN>) {
    if (/<fako kodo="([^"]+)"[^>]*>([^<]+)<\/fako>/i) {
#      $debugmsg .= "fak $1 -> $2\n";
#      print "fak $1 $2<br>\n";
      $fak{$1} = Encode::decode($enc, "$1-$2");
    }
  }
  close IN;

  %stl = ('' => '');
  open IN, "<$revo_base/cfg/stiloj.xml" or die "ne povas malfermi stiloj.xml";
  while (<IN>) {
    if (/<stilo kodo="([^"]+)"[^>]*>([^<]+)<\/stilo>/i) {
#      $debugmsg .= "stl $1 -> $2\n";
#      print "stl $1 $2<br>\n";
      $stl{$1} = Encode::decode($enc, "$1-$2");
    }
  }
  close IN;
}

# Connect to the database.
my $dbh = revodb::connect();

#print pre('dbconnect'." size=".length($xml2)) if $debug;

print pre('button='.Encode::decode($enc, param('button'))."   ".(Encode::is_utf8(param('button')))."-".(Encode::is_utf8("antaŭrigardu"))) if $debug;
if (Encode::decode($enc, param('button')) eq "antaŭrigardu" or param('button') eq 'konservu') {

print <<'EOD';
<div class="borderc8 backgroundc1" style="border-style: solid; border-width: medium; padding: 0.3em 0.5em;">
<p><span style="color: rgb(207, 118, 6); font-size: 140%;"><b>Anta&#365;rigardo</b></span></p>
EOD
#  if ($debug) {
#    print pre('open xalan');
#    autoEscape(1);
#    print pre(escapeHTML("xml2=\n$xml2"));
#    autoEscape(0);
#  }
  chdir($revo_base."/xml") or die "chdir";
  
  my ($html, $err);
  revo::xml2html::konv($dbh, \$xml2, \$html, \$err, $debug);
#  $html = Encode::decode($enc, $html);
  if ($html and $debug) {
    open HTML, ">:utf8", "../art2/$art.html" or die "open write html";
	print HTML $html;
    close HTML;
  }

  $html =~ s#href="../stl/#href="/revo/stl/#smg;
  $html =~ s#src="../smb/#src="/revo/smb/#smg;
  $html =~ s#src="../bld/#src="/revo/bld/#smg;
  $html =~ s#<span class="redakto">.*$##sm;
  $html =~ s#href="(?!http://)([a-z])#href="/revo/art/\1#smg;

  print $html;
#  print pre('close xalan') if $debug;

print <<'EOD';
</div><br>
EOD


print <<'EOD';
<div class="borderc8 backgroundc1" style="border-style: solid; border-width: medium; padding: 0.3em 0.5em;">
<p><span style="color: rgb(207, 118, 6); font-size: 140%;"><b>
EOD
  print $checkxml.br."\n";

  print $checklng.br.br."\n" if $checklng;

  { my $x = $xml2;		# cxu cxio trd havas lng aux estas en trdgrp kun lng?
    autoEscape(1);
#    print pre(escapeHTML("x=$x\n"));
    $x =~ s/<trdgrp\s+lng\s*=.*?<\/trdgrp>\s*//smig;	# forigo de bonaj trdgrpoj
    $x =~ s/<trd\s+lng\s*=.*?<\/trd>\s*//smig;		    # forigo de bonaj trdoj
#    print pre(escapeHTML("x=$x\n"));
	if ($x =~ /(<trd.*?<\/trd>)/) {					# se restas trd, estas malbona
	  print escapeHTML("Traduko $1")." ne havas lingvon.<br>\n";
      $ne_konservu = 11;
	}
    autoEscape(0);
  }
  
  while ($xml2 =~ /<ref([^g>][^>]*)>/gi) {
    my $ref = $1;
#    print "ref = $ref<br>\n" if $debug;
    if ($ref !~ /cel\s*=\s*"([^"]+?)"/i) {
      autoEscape(1);
      print escapeHTML("Referenco <ref$ref>")." ne havas cel a&#365; la celo estas malplena.<br>\n";
      autoEscape(0);
#      print "ref = $ref<br>\n";
#      $ne_konservu = 9;
    }
  }

  my $sth = $dbh->prepare("SELECT count(*) FROM art WHERE art_amrk = ?");
  my $sth2 = $dbh->prepare("SELECT drv_mrk FROM drv WHERE drv_mrk = ? union SELECT snc_mrk FROM snc WHERE snc_mrk = ? union SELECT rim_mrk FROM rim WHERE rim_mrk = ?");
  while ($xml2 =~ /<ref [^>]*?cel="([^".]*)(\.)([^"]*?)">/gi) {
    my ($art, $mrk) = ($1, "$1$2$3");
    $sth->execute($art);
    my ($art_ekzistas) = $sth->fetchrow_array();
    if (!$art_ekzistas) {
#      print "ref = $1-$2 $art-$mrk<br>\n" if $debug;
      print "Referenco celas al dosiero \"$art.xml\", kiu ne ekzistas.<br>\n";
#      $ne_konservu = 7;
    } elsif ($2) {
      $sth2->execute($mrk, $mrk, $mrk);
      my ($mrk_ekzistas) = $sth2->fetchrow_array();
      if (!$mrk_ekzistas) {
#        print "ref: art=$art mrk=$mrk<br>\n" if $debug;
        # eble temas pri marko de subsenco?
        open IN, "<", "$homedir/html/revo/xml/$art.xml";
        my $celxml = join '', <IN>;
        close IN;
        if ($celxml !~ /<subsnc\s+mrk="$mrk">/) {
          print "Referenco celas al \"$mrk\", kiu ne ekzistas en dosiero \"".a({href=>"?art=$art"}, "$art.xml")."\".<br>\n";
#          $ne_konservu = 8;
        }
      }
    }
  }
  $sth->finish;

  while ($xml2 =~ /<uzo tip="fak">(.*?)<\/uzo>/gi) {
    my $fako = $1;
    if (! exists($fak{$fako})) {
      print "Fako $fako estas nekonata.<br>\n";
      $ne_konservu = 6;
    }
  }

  while ($xml2 =~ /<(drv|snc) mrk="(.*?)">/gi) {
    my $mrk = $2;
    if ($mrk !~ /^$art\.[^.0]*0/) {
      print "La marko \"$mrk\" ne komenciĝas per \"$art.\" a&#365; poste ne havas 0.<br>\n";
      $ne_konservu = 5;
    }
  }

  my $flag = 0;
  $flag = $sxangxo =~ s/\x{0109}/cx/g || $flag;
  $flag = $sxangxo =~ s/\x{0108}/Cx/g || $flag;
  $flag = $sxangxo =~ s/\x{0135}/jx/g || $flag;
  $flag = $sxangxo =~ s/\x{0134}/Jx/g || $flag;
  $flag = $sxangxo =~ s/\x{0125}/hx/g || $flag;
  $flag = $sxangxo =~ s/\x{0124}/Hx/g || $flag;
  $flag = $sxangxo =~ s/\x{016D}/ux/g || $flag;
  $flag = $sxangxo =~ s/\x{016C}/Ux/g || $flag;
  $flag = $sxangxo =~ s/\x{015D}/sx/g || $flag;
  $flag = $sxangxo =~ s/\x{015C}/Sx/g || $flag;
  $flag = $sxangxo =~ s/\x{011D}/gx/g || $flag;
  $flag = $sxangxo =~ s/\x{011C}/Gx/g || $flag;
  if ($flag) {
    print "Esperantaj signoj en ŝanĝoteksto malunikoditaj.<br>\n";
  }
  if ($sxangxo =~ s/([\x{80}-\x{10FFFF}]+)/<span style="color:red">$1<\/span>/g) { # forigu ne-askiajn signojn
    print "Eraro: La ŝanĝoteksto enhavas ne-askiajn signojn: $sxangxo".br."\n";
    $ne_konservu = 3;
  } elsif ($sxangxo =~ s/(--)/<span style="color:red">$1<\/span>/g) { # forigu '--'
    print "Eraro: '--' estas malpermesita en komento: $sxangxo".br."\n";
    $ne_konservu = 3;
  } elsif (!param('nova')) {
    if ($sxangxo and $sxangxo ne "klarigo de la sxangxo") {
      print "Ŝanĝoteksto en ordo: $sxangxo".br."\n";
    } else {
      print "Eraro: ŝanĝoteksto mankas: $sxangxo".br."\n";
      $ne_konservu = 4;
    }
  }
print <<'EOD';
</div><br>
EOD
}

if ($redaktanto) {
  # cxu unu redaktanto havas tion retadreson? Kiu?
  my $sth = $dbh->prepare("SELECT count(*), min(ema_red_id) FROM email WHERE LOWER(ema_email) = LOWER(?)");
  $sth->execute($redaktanto);
  my ($permeso, $red_id) = $sth->fetchrow_array();
  $sth->finish;
  # Kiel nomigxas la redaktanto?
  my $sth = $dbh->prepare("SELECT red_nomo FROM redaktanto WHERE red_id = ?");
  $sth->execute($red_id);
  my ($red_nomo) = $sth->fetchrow_array();
#  print "red_nomo=$red_nomo\n";
  $sth->finish;

  if (!$permeso) {
    $ne_konservu = 2;

    print <<"EOD";
<div class="averto">
Vi ($redaktanto) ne estas registrita kiel redaktanto !<br>
Legu <a href="http://www.reta-vortaro.de/revo/dok/redinfo.html">&#265;i tie</a> kaj 
  <a href="http://www.reta-vortaro.de/revo/dok/revoserv.html">&#265;i tie</a> kiel registri&#285;i.<br>
Sen tio viaj &#349;an&#285;oj ne estos konservitaj !
</div><br>
EOD
  }

  if (param('button') eq 'konservu') {
    print <<'EOD';
<div class="borderc8 backgroundc1" style="border-style: solid; border-width: medium; padding: 0.3em 0.5em;">
<p><span style="color: rgb(207, 118, 6); font-size: 140%;"><b>
EOD
    print "Konservo</b></span></p>\n";
    # $xml2
    if ($ne_konservu) {
      print "ne konservita";
    } else {
      my $from    = $redaktanto;
      my $name    = "Revo redaktu.pl";
      my (@to, $sxangxo2);
      push @to, $redaktanto; # if param('sendu_al_tio');
      push @to, 'revo@retavortaro.de'; # if not $debug or param('sendu_al_revo');
#      push @to, 'wieland@wielandpusch.de'; # if param('sendu_al_admin');  # revodb::mail_to
      if (param('nova')) {
        $sxangxo2 = "aldono: $art";
      } else {
        $sxangxo2 = "redakto: $sxangxo";
      }
      if (my $to = join(', ', @to)) {
        my $subject = "Revo redaktu.pl $art";
		my $smlog = "sendmail.log";

        # konektu al retposxtservilo
        open SENDMAIL, "| /usr/sbin/sendmail -t 2>&1 >$smlog" or print LOG "ne povas sendmail\n";
        print SENDMAIL <<End_of_Mail;
From: $name <$from>
To: $to
Reply-To: $from
Subject: $subject
X-retadreso: $ENV{REMOTE_ADDR}

$sxangxo2

$xml2
End_of_Mail
        close SENDMAIL;

        print "sendita al $to";
		
		if (-s $smlog) {
		  open L, "<", $smlog;
		  my $ltxt = join "", <L>;
		  close L;
		  print pre("sendmail.log: $ltxt");
		}
		
#		my $maxnum = 200;
#	    my $rss = new XML::RSS;
#        $rss->parsefile("$htmldir/sendita.rdf");
##		my $rss = XML::RSS->new(version => '1.0');
##		$rss->channel(
##		   title        => "retavortaro: sendita",
##		   link         => "http://reta-vortaro.de",
##		   description  => "Senditaj sxangxoj de la redaktilo por ReVo",
##		   dc => {
##			 date       => '2010-02-23T07:00+00:00',
##			 subject    => "ReVo",
##			 creator    => 'wieland@wielandpusch.de',
##			 publisher  => 'wieland@wielandpusch.de',
##			 rights     => 'Copyright 2010, GPL',
##			 language   => 'eo',
##		   },
##		   syn => {
##			 updatePeriod     => "hourly",
##			 updateFrequency  => "1",
##			 updateBase       => "1901-01-01T00:00+00:00",
##		   },
##		);
#        pop(@{$rss->{'items'}}) while (@{$rss->{'items'}} > $maxnum);
#
#        my $fname = "sendita/".(strftime "%Y%d%m%H%M%S", gmtime)."_$art.txt";
#
#        open F, ">", "$htmldir/$fname" or print pre("ne povas skribi sendita/$fname");
#		print F "$sxangxo2\n\n$xml2";
#		close F;
#        
#        my $dato = strftime "%Y/%d/%m", gmtime;		
#        my $tempo = strftime "%H:%M:%S", gmtime;		
##		my $dato = "2010/02/22";
##		my $tempo = "17:30:22";
#
#		$sxangxo2 = "ReVo: $sxangxo2" if param('sendu_al_revo');
#	    $rss->add_item(title => "$red_nomo $subject",
#			 link  => "http://www.reta-vortaro.de/revo/art/$art.html",
#			 description => a({href=>"/$fname"}, $sxangxo2),
#			 dc => { subject=>$subject,
#					 creator=>"ReVo", 
#					 rights=>"GPL",
#					 date=>"$dato\T$tempo+00:00",
#		     },
#	         mode  => 'insert',
#        );
#		$rss->save("$htmldir/sendita.rdf");
      } else {
        print "ne sendita, elektu adreson sube";
      }
    }
    print <<'EOD';
</div><br>
EOD
  }
}

$dbh->disconnect() if $dbh;

# por ke la formulara ne konvertas &lt; al < ktp.
$xml =~ s/&lt;/&amp;lt;/g;
$xml =~ s/&gt;/&amp;gt;/g;

#$xml = Encode::encode($enc, $xml) if $xml2;
if (param('xmlTxt')) {
  param(-name=>'xmlTxt', -value => $xml);
}
param(-name=>'sxangxo', -value => $sxangxo);

#if ($debug) {
#  autoEscape(1);
#  print pre(escapeHTML("6 xml=\n$xml"));
#  autoEscape(0);
#}

print start_form(-id => "f", -name => "f");

my @fakoj = sort keys %fak;
my @stiloj = sort keys %stl;
print "\n&nbsp;prilabori:\n".
      " <a class=\"butono1\" onclick=\"indent(2);return false\" href=\"#\" title=\"Ŝovu la markitan tekston dekstren.\">&gt;&gt;</a>\n".
      " <a class=\"butono1\" onclick=\"indent(-2);return false\" href=\"#\" title=\"Ŝovu la markitan tekston maldekstren.\">&lt;&lt;</a>\n".
      "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ".
      checkbox(-name      => 'cx',
               -checked   => defined(cookie(-name=>'cx')) ? cookie(-name=>'cx') : 1,
               -value     => '1',
               -accesskey => "x",
               -onClick   => "document.f.xmlTxt.focus()",
               -label     => 'anstata&#365;igu&nbsp; c<u>x</u>,&nbsp;gx,&nbsp;...,&nbsp;ux').
      br."\n".
      "<div id=\"ajxb\" style=\"display:\">".
      "\n&nbsp;navigadi:\n".
      " <a class=\"butono1\" onclick=\"nextTag(&#39;<drv&#39,-1);return false\" href=\"#\" title=\"Serĉu antaŭan derivaĵon.\">drv</a>".
      "-<a class=\"butono1\" onclick=\"nextTag(&#39;<drv&#39,1);return false\" href=\"#\" href=\"#\" title=\"Serĉu sekvan derivaĵon.\">drv</a>\n".
      "&nbsp;&nbsp;<a onclick=\"showhide(&#39;ajx&#39;);return false\" href=\"#\">montru pli</a><br>\n</div>".
      "<div id=\"ajx\" style=\"display: none;\">\n".
      "\n&nbsp;navigadi:\n".
      " <a class=\"butono1\" onclick=\"nextTag(&#39;<drv&#39,-1);return false\" href=\"#\">drv</a>".
      "-<a class=\"butono1\" onclick=\"nextTag(&#39;<drv&#39,1);return false\" href=\"#\">drv</a>\n".
      "&nbsp;&nbsp;<a onclick=\"showhide(&#39;ajx&#39;);return false\" href=\"#\">montru malpli</a><br>\n".
      "\n&nbsp;aldoni:\n".
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<drv mrk=\\&#34;$art.&#39;,&#39;\\&#34;>\\n&#39;+i+&#39;  <kap><tld/>...</kap>\\n&#39;+i+&#39;  <snc mrk=\\&#34;$art.\\&#34;>\\n&#39;+i+&#39;    <dif>\\n&#39;+i+&#39;      \\n&#39;+i+&#39;    </dif>\\n&#39;+i+&#39;  </snc>\\n&#39;+i+&#39;</drv>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu novan derivaĵon.\">drv</a>\n",
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<dif>\\n&#39;+i+&#39;  &#39;,&#39;\\n&#39;+i+&#39;</dif>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu novan difinon.\">dif</a>\n",
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<snc mrk=\\&#34;$art.&#39;,&#39;\\&#34;>\\n&#39;+i+&#39;  <dif>\\n&#39;+i+&#39;    \\n&#39;+i+&#39;  </dif>\\n&#39;+i+&#39;</snc>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu novan sencon.\">snc</a>\n",
      " <a class=\"butono1\" onclick=\"insertTags2(&#39;<ofc>&#39;,document.getElementById(&#34;ofc&#34;).value,&#39;</ofc>&#39;,&#39;&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu indikon pri oficialeco.\">ofc</a>",
      "=".popup_menu(-id=>'ofc',
		    -name    => 'ofc',
 			-title   => "Elektu indikon pri oficialeco.",
            -values  => ['', '*', 1 .. 9],
		    -default => '',
      )."\n ",
      " <a class=\"butono1\" onclick=\"insertTags2(&#39;<gra>&#39;,document.getElementById(&#34;gra&#34;).value,&#39;</gra>&#39;,&#39;&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu indikon pri gramatiko.\">gra</a>",
      "=".popup_menu(-id=>'gra',
		    -name    => 'gra',
 			-title   => "Elektu indikon pri gramatiko.",
            -values  => ['<vspec>tr</vspec>', '<vspec>ntr</vspec>'],
		    -default => '',
		    -labels  => {'<vspec>tr</vspec>' => 'v tr', '<vspec>ntr</vspec>' => 'v ntr'},
      )."\n ",
#      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<refgrp cel=\\&#34;\\&#34;>&#39;,&#39;\\n&#39;+i+&#39;  <ref>&#39;,&#39;</ref>,\\n&#39;+i+&#39;  <ref></ref>\\n&#39;+i+&#39;</refgrp>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu grupon de refencoj.\">[refgrp tip]</a> ",
      " <a class=\"butono1\" onclick=\"insertTags2(&#39;<ref tip=\\&#34;&#39;,document.getElementById(&#34;reftip&#34;).value,&#39;\\&#34; cel=\\&#34;\\&#34;>&#39;,&#39;</ref>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu unu referencon.\">ref tip</a> ",
       " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<refgrp tip=\\&#34;&#39;+document.getElementById(&#34;reftip&#34;).value+&#39;\\&#34;>\\n&#39;+i+&#39;  <ref cel=\\&#34;\\&#34;>&#39;,&#39;</ref>\\n&#39;+i+&#39;</refgrp>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu grupon de refencoj.\">refgrp tip</a> ",
      "\n tip=".popup_menu(-id=>'reftip',
		    -name   => 'reftip',
 			-title  => "Elektu tipon de referenco.",
            -values => ['', qw/vid hom dif sin ant super sub prt malprt ekz/],
		    -default=> '',
		    -labels =>{'vid'=>'vid-u',
                      'hom'=>'hom-onima',
                      'dif'=>'dif-ina',
                      'sin'=>'sin-onimo',
                      'ant'=>'ant-onimo',
                      'super'=>'super-nocio',
                      'sub'=>'sub-nocio',
                      'prt'=>'part-o',
                      'malprt'=>'malpart-o',
                      'ekz'=>'ekz-emplo',
		    },
#                    -size => 2,2
#                    -maxlength => 3,
#                    -value=> cookie(-name=>'reftip') || '',
      )."\n ",
      " <a class=\"butono1\" onclick=\"insertTags(&#39;<ref cel=\\&#34;\\&#34;>&#39;,&#39;</ref>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu unu referencon al grupo (sen tipo).\">ref</a> ",
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<rim>\\n&#39;+i+&#39;  &#39;,&#39;\\n&#39;+i+&#39;</rim>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu rimarkon.\">rim</a>\n",
      "&nbsp; &nbsp; ".a({target=>"_new", href=>'/revo/dok/manlibro.html#drv'}, "helpo")."\n ".
      a({target=>"_new", href=>'/revo/dok/dtd.html#drv'}, "dtd")."\n".
      br.
      "\n&nbsp;uzo:\n".
      " <a class=\"butono1\" onclick=\"insertTags2(&#39;<uzo tip=\\&#34;fak\\&#34;>&#39;,document.getElementById(&#34;uzofak&#34;).value,&#39;</uzo>&#39;,&#39;&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu fakon (elektu dekstre).\">fak</a>",
      "=".popup_menu(-id=>'uzofak',
		    -name    => 'uzofak',
  			-title   => "Elektu uzofakon.",
            -values  => \@fakoj,
		    -default => '',
		    -labels  => \%fak,
      )."\n ",
      " <a class=\"butono1\" onclick=\"insertTags2(&#39;<uzo tip=\\&#34;stl\\&#34;>&#39;,document.getElementById(&#34;uzostl&#34;).value,&#39;</uzo>&#39;,&#39;&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu stilon (elektu dekstre).\">stl</a>",
      "=".popup_menu(-id=>'uzostl',
		    -name    => 'uzostl',
  			-title   => "Elektu uzostilon.",
            -values  => \@stiloj,
		    -default => '',
		    -labels  => \%stl,
      )."\n ",
      "&nbsp; &nbsp; ".a({target=>"_new", href=>'/revo/dok/manlibro.html#uzo'}, "helpo")."\n ".
      a({target=>"_new", href=>'/revo/dok/dtd.html#uzo'}, "dtd")."\n".
      br.
      "\n&nbsp;ekzemplo:\n".
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<ekz>\\n&#39;+i+&#39;  &#39;,&#39;\\n&#39;+i+&#39;</ekz>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu ekzemplon.\">ekz</a>\n",
      " <a class=\"butono1\" onclick=\"insertTags(&#39;<tld/>&#39;,&#39;&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu tildon (anstataŭigas la radikon).\">tld</a>\n",
      " <a class=\"butono1\" onclick=\"var i=str_indent();insertTags(&#39;<fnt>\\n&#39;+i+&#39;  <aut>&#39;,&#39;</aut>,\\n&#39;+i+&#39;  <vrk><url ref=\\&#34;\\&#34;></url></vrk>,\\n&#39;+i+&#39;  <bib></bib>,\\n&#39;+i+&#39;  <lok></lok>\\n&#39;+i+&#39;</fnt>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu fonton (kun kelkaj informoj).\">fnt</a>\n ",
      "&nbsp; &nbsp; ".a({target=>"_new", href=>'/revo/dok/manlibro.html#ekz'}, "helpo")."\n ".
      a({target=>"_new", href=>'/revo/dok/dtd.html#ekz'}, "dtd")."\n".
      br.
      "</div>".
      "\n&nbsp;traduki: <a class=\"butono1\" accesskey=\"t\" onclick=\"insertTags2(&#39;<trd lng=\\&#34;&#39;,document.getElementById(&#34;trdlng&#34;).value,&#39;\\&#34;>&#39;,&#39;</trd>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu unu tradukon.\"><u>t</u>rd lng</a> ",
#      "\n&nbsp;<a onclick=\"var i=str_indent();insertTags(&#39;<trdgrp>\\n&#39;+i+&#39;  <trd>&#39;,&#39;</trd>\\n&#39;+i+&#39;</trdgrp>&#39;,&#39;&#39;);return false\" href=\"#\">[trdgrp]</a> ",
      "\n&nbsp;<a class=\"butono1\" onclick=\"var i=str_indent();insertTags2(&#39;<trdgrp lng=\\&#34;&#39;,document.getElementById(&#34;trdlng&#34;).value,&#39;\\&#34;>\\n&#39;+i+&#39;  <trd>&#39;,&#39;</trd>,\\n&#39;+i+&#39;  <trd></trd>\\n&#39;+i+&#39;</trdgrp>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu grupon de tradukoj.\">trdgrp lng</a> ",
      "\n lng=".textfield(-id=>'trdlng',
		    -name=>'trdlng',
 			-title=> "Tajpu la lingvokodon por tradukoj ĉi tie.",
            -size => 2,
            -maxlength => 3,
            -value=> cookie(-name=>'trdlng') || '',
      ),
      "\n&nbsp;<a class=\"butono1\" onclick=\"insertTags(&#39;<trd>&#39;,&#39;</trd>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu unu tradukon al grupo (sen lingvo).\">trd</a> ",
      "\n&nbsp;<a class=\"butono1\" onclick=\"insertTags(&#39;<klr>&#39;,&#39;</klr>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu klarigon sen tipo.\">klr</a> ",
      "\n&nbsp;<a class=\"butono1\" onclick=\"insertTags2(&#39;<klr tip=\\&#34;&#39;,document.getElementById(&#34;klrtip&#34;).value,&#39;\\&#34;>&#39;,&#39;</klr>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu klarigon kun tipo.\">klr tip</a> ",
      "\n tip=".popup_menu(-id=>'klrtip',
		    -name=>'klrtip',
 			-title=> "Elektu la tipon de la klarigo.",
            -values=>['', qw/ind amb/],
		    -default=> cookie(-name=>'klrtip') || 'amb',
		    -labels=>{'ind'=>'ind-ekso',
                              'amb'=>'amb-aux',
		    },
      )."\n ",
      "\n&nbsp;<a class=\"butono1\" onclick=\"insertTags(&#39;<ind>&#39;,&#39;</ind>&#39;,&#39;&#39;);return false\" href=\"#\" title=\"Aldonu indikon por la indekso.\">ind</a> ",
      "&nbsp; &nbsp; ".a({target=>"_new", href=>'/revo/dok/manlibro.html#trd'}, "helpo").
      a({target=>"_new", href=>'/revo/dok/dtd.html#trd'}, "dtd").
      br."\n",
      hidden(-name=>'art', -default=>param('art')),
      hidden(-name=>'mrk', -default=>param('mrk')),
      "&nbsp;".textarea(-id    => 'xmlTxt', -name    => 'xmlTxt',
               -rows    => 25,
               -columns => 80,
	           -default => $xml,
               -onkeypress => "return klavo(event)",
      ) if $art;
if (param('nova') or param('button') eq 'kreu') {
  print hidden(-name=>'nova', -default=>1);
} else {
  print br."\n&nbsp;&#348;an&#285;o: ".textfield(-name=>'sxangxo',
                    -value=>Encode::decode($enc, cookie(-name=>'sxangxo')) || 'klarigo de la &#349;an&#285;o',
					-title     => "Klarigu la ŝanĝon ĉi tie.",
                    -size=>70,
                    -maxlength=>80);
}
print br."\n&nbsp;Retpo&#349;ta adreso:".textfield(-name=>'redaktanto',
                    -size      => 70,
                    -maxlength => 80,
					-title     => "Skribu vian registritan retpoŝtan adreson ĉi tie.",
                    -value     => (cookie(-name=>'redaktanto') || 'via retpo&#349;ta adreso')
      ),
      br."\n",
      submit(-name => 'button', -label => 'antaŭrigardu'),
      submit(-name => 'button', -label => 'konservu') if $art;
print checkbox(-name    => 'sendu_al_revo',
               -checked => 1,
               -value   => '1',
               -label   => 'sendu al ReVo') if $art and $debug and 0;
print endform if $art;

print start_form(-id => "n", -name => "n");
print "&nbsp;Preparu novan artikolon: ".textfield(-name=>'art', -size=>20, -maxlength=>20)."&nbsp;";
print submit(-name => 'button', -label => 'kreu')."&nbsp; &nbsp; ".a({target=>"_new", href=>'/revo/dok/revoserv.html'}, "[helpo]")."\n";
print endform;

print <<"EOD" if $art;
<h1>Klarigoj:</h1>
<div class="averto">
Se vi permesas kuketojn, vi ne da&#365;re devas entajpi vian retadreson kaj lingvon.<br>
klavo kontrolo-Z malfaras la lastan &#349;an&#285;on<br>
klavo kontrolo-Y refaras la lastan &#349;an&#285;on<br>
klavo kontrolo-F ebligas ser&#265;i<br>
via retadreso estas $ENV{REMOTE_ADDR}<br>
</div>
EOD

print p('<!-- svn versio: $Id: vokomail.pl 614 2013-08-26 17:04:08Z wielandp $'.br.
	'hg versio: $HgId: vokomail.pl 62:d81c22cbe76e 2010/04/21 17:24:51 Wieland $ -->');

print end_html();

sub checkxml {
    my $teksto = shift;
    my ($err, $konteksto, $line, $char);

#    # enmetu Log se ankorau mankas...
#    unless ($teksto =~ /<!--\s+\044Log/s) {
#	$teksto =~ s/(<\/vortaro>)/\n<!--\n\044Log\044\n-->\n$1/s;
#    }
#
#    # mallongigu Log al 20 linioj
#    $teksto =~ s/(<!--\s+\044Log(?:[^\n]*\n){20})(?:[^\n]*\n)*(-->)/$1$2/s;

    chdir($revo_base."/xml") or die "chdir";
#    $debugmsg .= "checkxml: teksto = $teksto\n";
    my $pid = IPC::Open3::open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR,
                    'rxp -Vs >/dev/null');
    print CHLD_IN $teksto;
    close CHLD_IN;
    my $err = join('', <CHLD_ERR>);
#    $debugmsg .= "checkxml: err = $err\n";
    close CHLD_ERR;
    close CHLD_OUT;

    # legu la erarojn
#    open ERR,"$tmp/xml.err";
#    $err=join('',<ERR>);
#    close ERR;
#    unlink("$tmp/xml.err");

    if ($err) {
      $ne_konservu = 1;
      my $ret = "XML kontrolo malsukcesis - Eraro";

      $err =~ s/^Warning: /Atentu: /smg;
      $err =~ s/^Error: /Eraro: /smg;
      $err =~ s/ of <stdin>$//smg;
      $err =~ s/^ in unnamed entity//smg;
      $err =~ s/Start tag for undeclared element ([^\n]*)/Ne konata komencokodero $1/smg;
      $err =~ s/Content model for ([^ \n]*) does not allow element ([^ \n]*) here$/Reguloj por $1 malpermesas $2 cxi tie/smg;
      $err =~ s/Mismatched end tag: expected ([^,\n]*), got ([^ \n]*)$/Malkongrua finokodero: atendis $1, trovis $2/smg;
      $err =~ s/^ at line (\d+) char (\d+)$/ cxe linio $1 pozicio $2/smg;
      $err =~ s/Document contains multiple elements/Artikolo enhavas pli ol unu elemento (kaj tio devas esti <vortaro>)/smg;
      $err =~ s/Root element is ([^ ,\n]*), should be ([^ \n]*)/Radika elemento estas $1, devus esti $2/smg;
      $err =~ s/Content model for ([^ \n]*) does not allow PCDATA/Enhavo de elemento $1 estas malpermesita/smg;
      $err =~ s/The attribute ([^ \n]*) of element ([^ \n]*) is declared as ENUMERATION but is empty/La atributo $1 de la kodero $2 mankas/smg;
      $err =~ s/In the attribute ([^ \n]*) of element ([^ \n]*), ([^ \n]*) is not one of the allowed values/Cxe la atributo $1 de la kodero $2, $3 ne estas permesata./smg;
      $err =~ s/Document ends too soon/Dokumento finis, sed mankis finkodero/smg;
      $err =~ s/Value of attribute is unquoted/Mankas citiloj por la valoro de la atributo/smg;
      $err =~ s/Illegal character ([^ \n]*) in attribute value/Malpermesita signo $1 en atributa valoro/smg;
      $err =~ s/Expected whitespace or tag end in start tag/Atendas spacon aux koderfinon en komencokodero/smg;
      $err =~ s/Expected name, but got ([^ \n]*) for attribute/Atendas nomon, sed trovis $1 kiel atributo/smg;
      $err =~ s/The attribute ([^ \n]*) of element ([^ \n]*) is declared as ID but contains a character which is not a name character/La atributo $1 de la kodero $2 enhavas malpermesitan karakteron./smg;


      autoEscape(1);
      ($konteksto, $line, $char) = xml_context($err, $teksto);
      $err .= "kunteksto de unua eraro:\n$konteksto";
      $ret .= pre(escapeHTML("XML-eraroj:\n$err\n")); # if ($verbose);
      autoEscape(0);
      $ret .= "&nbsp;&nbsp;&nbsp;&nbsp; * se vi trovas anglan mesagxon aux malbonan erarmesagxon, skribu al wieland(cxe)wielandpusch.de";
      $err = $ret;
    } else {
      $err = "XML en ordo</b></span></p>\n";
    }
    return ("Kontrolo</b></span></p>\n$err", $line, $char);
}


sub xml_context {
    my ($err, $teksto) = @_;
    my ($line, $char, $result, $n, $txt);

    if ($err =~ /linio\s+([0-9]+)\s+pozicio\s+([0-9]+)\s+/s) {
      $line = $1;
      $char = $2;
#      $debugmsg .= "context: line = $line, char = $char, err = $err\n";

      my @a = split "\n", $teksto;

      # la linio antaux la eraro
      if ($line > 1) {
          $result .= ($line-1).": $a[$line - 2]\n";
      }
      $result .= "$line: $a[$line - 1]\n";
      $result .= "-" x ($char + length($line) + 1) . "^\n";

      if (exists($a[$line])) {
          $result .= ($line+1).": $a[$line]";
      }

      return ($result, $line, $char);
    }

    return ('', 0, 0);
}

