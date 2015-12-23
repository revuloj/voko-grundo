#!/usr/bin/perl

#
# sercxu.pl
# 
# 2006-09-__ Wieland Pusch
# 2006-10-__ Bart Demeyere
# 2007-03-__ Wieland Pusch
#

use strict;

use CGI qw(:standard *table);
use CGI::Carp qw(fatalsToBrowser);
use DBI();
use URI::Escape;

$| = 1;
#print "Content-type: text/html\n\n";

#### preparu stirantajn parametrojn  ####

my %unicode = ( cx => "ĉ", gx => "ĝ", hx => "ĥ", jx => "ĵ", sx => "ŝ", ux => "ŭ" );

my $sercxata = param('q2');
$sercxata = param('sercxata') if param('sercxata');
my $cx2cx = param('x');
$cx2cx = "checked" if $cx2cx;
my $neniu_trafo = 1;

my $formato = param('formato');
my $param_lng = param('lng');
$param_lng = '' unless $param_lng;

my $pado = "..";
$pado = "/revo" if param('pado') eq 'revo';

my $kadroj = param('kadroj');

#### serĉformularo aperas en HTML-kadraro ... ####

if ($kadroj) {
  print "Content-type: text/html\n\n";

  $sercxata = uri_escape($sercxata);

  $sercxata .= "&lng=".uri_escape(param('lng')) if param('lng');
  $sercxata .= "&trd=".uri_escape(param('trd')) if param('trd');
  $sercxata .= "&ans=".uri_escape(param('ans')) if param('ans');

  # kopiu index.html  
  open IN, "<../revo/index.html" or die "serĉo en kadroj ne eblas ĉar mankas dosiero 'index.html'";
  while (<IN>) {
    s/src="inx\/_eo.html"/src="sercxu.pl?cx=1&sercxata=$sercxata"/;
    s/src="titolo.html"/src="..\/revo\/titolo.html"/;
    print;
  }
  close IN;
  exit 1;
}

#### Javoskripto por la serĉormularo ####
my $JSCRIPT=<<END;
function xAlUtf8(t, nomo) {
  if (document.getElementById("x").checked) {
    t = t.replace(/c[xX]/g, "\\u0109");
    t = t.replace(/g[xX]/g, "\\u011d");
    t = t.replace(/h[xX]/g, "\\u0125");
    t = t.replace(/j[xX]/g, "\\u0135");
    t = t.replace(/s[xX]/g, "\\u015d");
    t = t.replace(/u[xX]/g, "\\u016d");
    t = t.replace(/C[xX]/g, "\\u0108");
    t = t.replace(/G[xX]/g, "\\u011c");
    t = t.replace(/H[xX]/g, "\\u0124");
    t = t.replace(/J[xX]/g, "\\u0134");
    t = t.replace(/S[xX]/g, "\\u015c");
    t = t.replace(/U[xX]/g, "\\u016c");
    if (t != document.getElementById(nomo).value) {
      document.getElementById(nomo).value = t;
    }
  }
}
function sf(){document.f.sercxata.focus();}
top.document.title = "Reta Vortaro, serĉo de \\\"$sercxata\\\"";
END

#### eltrovu preferatan lingvon de la uzanto laŭ la retumilo ####

#$ENV{HTTP_ACCEPT_LANGUAGE} = ''; # por testi

my $preferata_lingvo;
{
  my @a = split ",", $ENV{HTTP_ACCEPT_LANGUAGE};
  $preferata_lingvo = shift @a;
  $preferata_lingvo = shift @a if $preferata_lingvo =~ /^eo/;
  $preferata_lingvo =~ s/^([^;-]+).*/$1/;
#  $preferata_lingvo = 'nenio' if $preferata_lingvo eq '';
}

###################################################################
#  eligo de la rezulto laŭ diversaj formatoj                      #
###################################################################

#### kaplinioj de la rezultodokumento kaj eble la serĉormularo denove ####

if ($formato eq "txt") {
  print header( -type    => 'text/plain',
				-charset => 'utf-8',
  );
} 

elsif ($formato eq "idx") {

  print header(-charset=>'utf-8');
  my $t = <<EOD;
<html xmlns:xs="http://www.w3.org/2001/XMLSchema"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>esperanta indekso</title><link title="indekso-stilo" type="text/css" rel="stylesheet" href="$pado/stl/indeksoj.css"></head><body><table cellspacing="0"><tr><td class="aktiva"><a href="$pado/inx/_eo.html">Esperanto</a></td><td class="fona"><a href="$pado/inx/_lng.html">Lingvoj</a></td><td class="fona"><a href="../inx/_fak.html">Fakoj</a></td><td class="fona"><a href="../inx/_ktp.html">ktp.</a></td></tr>
EOD
  chomp $t;
  print "$t<tr><td colspan=\"4\" class=\"enhavo\">";
  my $aktiva;
  foreach (qw(a b c cx d e f g gx h hx i j jx k l m n o p r s sx t u v z)) {
    my $code = $_;
    $code = $unicode{$_} if exists $unicode{$_};
#print "code=$code, sercxata=$sercxata, _=$_\n";

    if ($sercxata eq "$code%") {
      print "<b class=\"elektita\">$code</b> ";
      $aktiva = $code;

    } else {
      print "<a href=\"kap_$_.html\">$code</a> " unless param('pado') eq 'revo';
      print "<a href=\"?sercxata=$code%&formato=idx&pado=".param('pado')."\">$code</a> " if param('pado') eq 'revo';
    }
  }

  print "<h1>esperanta $aktiva...</h1>\n";
#  print "</tr>\n";

} else {

  print header(-charset=>'utf-8'),
        start_html(-style=>{-src=>'/revo/stl/indeksoj.css'},
                 -script=>$JSCRIPT,
                 -onLoad=>"sf()"
  );

  print start_table(-cellspacing=>0),
           Tr(
           [
              td({-class=>'aktiva'}, a({-href=>'/revo/inx/_eo.html'}, 'Esperanto')).
              td({-class=>'fona'}, [a({-href=>'/revo/inx/_lng.html'}, 'Lingvoj'),
				    a({-href=>'/revo/inx/_fak.html'}, 'Fakoj'),
				    a({-href=>'/revo/inx/_ktp.html'}, 'ktp.')]),
           ]
           );

  print <<EOD;
<td colspan="4" class="enhavo">
EOD

   if (param('ans')) {
    print "Altnivela serĉo";
  }

  print <<EOD;
<form method="post" action="" target="indekso" name="f">
<input type="text" id="sercxata" name="sercxata"  size="31" maxlength="255" onKeyUp="xAlUtf8(this.value, 'sercxata')" value="$sercxata">
<input type="submit" value="trovu">
<br>
EOD

  if (!param('cx')) {
    print <<EOD;
<script type="text/javascript">
document.write("<input type=\\\"checkbox\\\" id=\\\"x\\\" name=\\\"x\\\" onClick=\\\"xAlUtf8(document.f.sercxata.value,'sercxata')\\\" $cx2cx>anstata&#365;igu cx, gx, ..., ux");</script>
<noscript><input type="hidden" id="cx" name="cx" value="1"></noscript>
EOD
  } else {
    print <<EOD;
<input type="hidden" id="cx" name="cx" value="1">
EOD
 }

if (param('ans')) {
  my %lng;
  open IN, "<../revo/cfg/lingvoj.xml" or die "ne povas malfermi dosieron 'lingvoj.xml'";
  while (<IN>) {
    if (/<lingvo kodo="([^"]+)">([^<]+)<\/lingvo>/) {
#      print "lng $1 -> $2\n";
      $lng{$1} = "$1 - $2";
    }
  }
  close IN;
  my @values = sort keys %lng;

  print br."Lingvo: ",
		hidden('ans', 1),
		popup_menu(-name    => 'lng',
                   -values  => \@values,
				   -labels  => \%lng,
                   -default => $preferata_lingvo);
#		br."Traduko: ",
#		popup_menu('trd',
#                   ['eo', 'de','en','nl'],
#                    'de');
  exit if $sercxata eq "";
}

  print <<EOD;
</p>
</form>
EOD
}

if ($sercxata eq "") {
  print "Bonvolu meti ion, kion serĉi";
  exit;
}

if ($sercxata eq "%") {
  print "Bonvolu ne serĉi \"%\".";
  exit;
}

print <<EOD if $formato ne "txt" and $formato ne "idx";
<script type="text/javascript">
document.write("<div id=\\\"atendu\\\" style=\\\"position:absolute; z-index:1\\\"><br><br><br><big>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Atendu iomete...</big><layer></layer></div>");
</script>
EOD

###################################################################
#  serĉo en datumbazo                                             #
###################################################################


# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use revodb;
use eosort;

my $sercxata_eo = $sercxata;
if (param('cx')) {
  $sercxata_eo =~ s/c[xX]/ĉ/g;
  $sercxata_eo =~ s/g[xX]/ĝ/g;
  $sercxata_eo =~ s/h[xX]/ĥ/g;
  $sercxata_eo =~ s/j[xX]/ĵ/g;
  $sercxata_eo =~ s/s[xX]/ŝ/g;
  $sercxata_eo =~ s/u[xX]/ŭ/g;
  $sercxata_eo =~ s/C[xX]/Ĉ/g;
  $sercxata_eo =~ s/G[xX]/Ĝ/g;
  $sercxata_eo =~ s/H[xX]/Ĥ/g;
  $sercxata_eo =~ s/J[xX]/Ĵ/g;
  $sercxata_eo =~ s/S[xX]/Ŝ/g;
  $sercxata_eo =~ s/U[xX]/Ŭ/g;
}

my $sorter = new eosort;

if ($sercxata_eo eq $sercxata) {
  $sercxata = $sorter->remap_ci($sercxata);
  $sercxata_eo = $sercxata;
} else {
  $sercxata = $sorter->remap_ci($sercxata);
  $sercxata_eo = $sorter->remap_ci($sercxata_eo);
}

# Connect to the database.
my $dbh = revodb::connect();

#$dbh->{'mysql_enable_utf8'}=1;
$dbh->do("set names utf8");

use Time::HiRes qw (gettimeofday tv_interval);
my %trovitajPagxoj;
my $regulira = $sercxata =~ /[.^$\[\(\|+?{\\]/;

if ($regulira) {
#  print "REGEXP<p>\n";
  Sercxu('REGEXP', $sercxata, $sercxata_eo, $preferata_lingvo);
} elsif ($sercxata =~ /[%_]/) {
#  print "LIKE<p>\n";
  Sercxu('LIKE', $sercxata, $sercxata_eo, $preferata_lingvo);
} else {
#  print "=<p>\n";
  Sercxu('=', $sercxata, $sercxata_eo, $preferata_lingvo);
#  print "REGEXP<br>\n";
#  Sercxu('REGEXP', '^' . $sercxata . '[ (.-]|[ -]' . $sercxata . '[ (.-]' . '|[ -]' . $sercxata . '$');
#  print "REGEXP<br>\n";
#  Sercxu('REGEXP', '[:alnum:]' . $sercxata . '|' . $sercxata . '[:alnum:]');
}


# se vi trovis nur unu rezulton, tuj malfermi gxin
if (scalar keys %trovitajPagxoj == 1 and $formato ne "txt") {
  print '<script type="text/javascript">' . "\n";
  print '<!--' . "\n";

  foreach my $pagxo (keys %trovitajPagxoj) {
#    print "open('/revo/art/" . $pagxo
#      . ".html#$trovitajPagxoj{$pagxo}', 'precipa');\n";
#    print "alert(parent.location.href);\n";
#    print "parent.precipa.location.href = parent.location.href + 'art/" . $pagxo
#      . ".html#$trovitajPagxoj{$pagxo}';\n";
    print "parent.precipa.location.href = '/revo/art/" . $pagxo
      . ".html#$trovitajPagxoj{$pagxo}';\n";
    last;
  }
  print '//-->' . "\n";
  print '</script>' . "\n";
}

$dbh->disconnect() or die "Malkonekto de la datumbazo ne funkciis";
  


#print h1("Fino.");
  print "<br>" if $neniu_trafo and $formato ne "txt";
  print "Neniu trafo..." if $neniu_trafo;

  print <<EOD if $formato ne "txt" and $formato ne "idx";

<script type="text/javascript">
<!--
var browserType;

if (document.layers) {browserType = "nn4"};
if (document.all) {browserType = "ie"};
if (window.navigator.userAgent.toLowerCase().match("gecko")) {
   browserType= "gecko";
}
  if (browserType == "gecko" )
     document.poppedLayer = 
         eval('document.getElementById(\\'atendu\\')');
  else if (browserType == "ie")
     document.poppedLayer = 
        eval('document.all[\\'atendu\\']');
  else
     document.poppedLayer =   
        eval('document.layers[\\'`atendu\\']');
  document.poppedLayer.style.visibility = "hidden";
//-->
</script>
EOD

print "</td></tr>", end_table(), end_html() if $formato ne "txt";;

exit;


###################################################################
# helpunkcioj por serĉo                                           #
###################################################################


sub Sercxu
{
  my ($komparo, $sercxata2, $sercxata2_eo, $preferata_lingvo) = @_;
  my $tempo = [gettimeofday];
  my $addqry = "";
  my ($sth, $sth2);

  {
    my @fak = param("fak");
#    print h1("fak = ".join(",", @fak)) if $verbose;
    foreach my $fak (@fak) {
      $addqry .= " and (".join(" or ", map {my $not=" not" if s/^!//; "d.drv_fak$not like '%\_$_\_%'"} split(/,/, $fak)).")";
    }
  }
#  print h1("addqry = $addqry") if $verbose;

  {
    my @stl = param("stl");
#    print h1("stl = ".join(",", @stl)) if $verbose;
    foreach my $stl (@stl) {
      $addqry .= " and (".join(" or ", map {my $not=" not" if s/^!//; "d.drv_stl$not like '%\_$_\_%'"} split(/,/, $stl)).")";
    }
  }
#  print h1("addqry = $addqry") if $verbose;

#  print h2("qry = $addqry") if $verbose;

  if ($param_lng eq 'eo' or $param_lng eq '') {
    $sth2 = $dbh->prepare(
      "SELECT distinct t.trd_teksto
       FROM trd t, snc s
        WHERE s.snc_drv_id = ?
          AND t.trd_snc_id = s.snc_id
          AND t.trd_lng = ?
        ORDER BY t.trd_teksto");
  
    $sth = $dbh->prepare("SELECT d.*, a.*, v.*, d.drv_teksto_ci " . $komparo . " ? drv_match
    FROM art a, drv d LEFT OUTER JOIN var v ON d.drv_id = v.var_drv_id
    WHERE (d.drv_teksto_ci " . $komparo . " ? or v.var_teksto_ci " . $komparo . " ?)
      AND a.art_id = d.drv_art_id$addqry GROUP BY d.drv_id ORDER BY d.drv_teksto_ci, d.drv_teksto desc, a.art_amrk");
    eval {
      $sth->execute($sercxata2_eo, $sercxata2_eo, $sercxata2_eo);
    };

    if ($@) {
      # $sth->err and $DBI::err will be true if error was from DBI
      if ($sth->err == 1139) {	# Got error 'brackets ([ ]) not balanced
        print "Eraro: La rektaj krampoj ([ ]) ne kongruas.<br>\n";
      } else {
        print "Err ".$sth->err." - $@";
      }
    } else {
      MontruRezultojn($sth, 'eo', $preferata_lingvo, $sth2);
    }
  }

  $sth2 = undef;


  if (($formato ne "txt" or $param_lng ne 'eo') and $formato ne "idx") {

    if ($formato ne "idx" and param("trd")) {
      $sth2 = $dbh->prepare(
        "SELECT t.*
         FROM trd t
         WHERE t.trd_lng = ?
		  AND t.trd_snc_id = ?
        ORDER BY t.trd_teksto_ci");
	}

    if ($param_lng) {	# nur unu lingvo
	  $preferata_lingvo = $param_lng;
      $sth = $dbh->prepare(
        "SELECT t.*, s.*, d.*, a.*, l.lng_nomo
         FROM trd t, snc s, drv d, art a, lng l
         WHERE t.trd_teksto_ci " . $komparo . " ?
          AND t.trd_lng = ?
		  AND t.trd_snc_id = s.snc_id
          AND t.trd_lng = l.lng_kodo
          AND d.drv_id = s.snc_drv_id
          AND a.art_id = d.drv_art_id
        ORDER BY l.lng_nomo, t.trd_teksto_ci, d.drv_teksto_ci, s.snc_numero");
	} else {			# cxiuj lingvojn
      $sth = $dbh->prepare(
        "SELECT t.*, s.*, d.*, a.*, l.lng_nomo
         FROM trd t, snc s, drv d, art a, lng l
         WHERE t.trd_teksto_ci " . $komparo . " ?
          AND t.trd_snc_id = s.snc_id
          AND t.trd_lng = l.lng_kodo
          AND d.drv_id = s.snc_drv_id
          AND a.art_id = d.drv_art_id
        ORDER BY abs(strcmp(t.trd_lng, ?)), l.lng_nomo, t.trd_teksto_ci, d.drv_teksto_ci, s.snc_numero");
	}

    eval {
      $sth->execute($sercxata2, $preferata_lingvo);
    };

    if ($@) {
      # $sth->err and $DBI::err will be true if error was from DBI
      if ($sth->err == 1139) {	# Got error 'brackets ([ ]) not balanced
      } else {
        print "Err ".$sth->err." - $@";
      }
    } else {
#      print '<small>query: ' . tv_interval ($tempo) . ' sekundoj</small><p>';
#      $tempo = [gettimeofday];
      MontruRezultojn($sth, $param_lng, $preferata_lingvo, $sth2);
#      print '<small>montrado: ' . tv_interval ($tempo) . ' sekundoj</small><p>';
#      print '<font size=1>&nbsp;<p /></font>' . "\n";
    }
  }
}

sub MontruRezultojn
{
  my ($res, $lng, $preferata_lingvo, $sth2) = @_;
  my $num = 0;
  my $last_lng;

  while (my $ref = $res->fetchrow_hashref()) {
    $num++;

    my $lng_nomo;
    my $trd;
    my $anchor;
    my $klr;

    if ($lng eq 'eo') {
      if ($$ref{'drv_match'}) {
        $trd = $$ref{'drv_teksto'};
      } else {
        $trd = $$ref{'var_teksto'};
      }
      $anchor = $$ref{'drv_mrk'};
      $lng_nomo = "esperante";
      $lng_nomo .= " ($preferata_lingvo)" if $preferata_lingvo;

      if ($formato eq "txt") {
	    foreach (split ",", param("trd")) {
          $klr .= "|";
  	      my $sep;
#		  print "--drv_id=$$ref{'drv_id'}--";
          $sth2->execute($$ref{'drv_id'}, $_);
          while (my $ref2 = $sth2->fetchrow_hashref()) {
            $klr .= $sep.$$ref2{'trd_teksto'};
            $sep = ",";
          }
		}
	  } else {
 	    my $sep = " (<a target=\"precipa\" href=\"/revo/art/$$ref{'art_amrk'}.html#lng_$preferata_lingvo\">";
        $sth2->execute($$ref{'drv_id'}, $preferata_lingvo);
        while (my $ref2 = $sth2->fetchrow_hashref()) {
          $klr .= $sep.$$ref2{'trd_teksto'};
          $sep = ", ";
        }
        $klr .= "</a>)" if $klr;
      }

    } else {
      $trd = $$ref{'trd_teksto'};
      $anchor = $$ref{'drv_mrk'};
      $anchor = $$ref{'snc_mrk'} if $$ref{'snc_numero'}; 
      if ($formato eq "txt") {
	    foreach (split ",", param("trd")) {
          $klr .= "|";
  	      my $sep;
		  if ($_ eq "eo") {
		    $klr .= $$ref{'drv_teksto'};
		  } else {
            $sth2->execute($_, $$ref{'snc_id'});
            while (my $ref2 = $sth2->fetchrow_hashref()) {
              $klr .= $sep.$$ref2{'trd_teksto'};
              $sep = ",";
		    }
	      }
        }
	  } else {
        $klr = " (<a target=\"precipa\" href=\"/revo/art/$$ref{'art_amrk'}.html#$anchor\">$$ref{'drv_teksto'}";
        $klr .= "  <sup><i>$$ref{'snc_numero'}</i></sup>" if $$ref{'snc_numero'};
        $klr .= "</a>)";
        $anchor = "lng_$lng";
	  }
      $lng = $$ref{'trd_lng'};
      $lng_nomo = $$ref{'lng_nomo'};
      $lng_nomo =~ s/a$/e/;
      $lng_nomo .= " (preferata)" if $lng eq $preferata_lingvo;
    }

    $trovitajPagxoj{$$ref{'art_amrk'}} = $anchor if $lng eq 'eo' or $lng eq $preferata_lingvo;
    if ($formato ne "txt" and $formato ne "idx") {
      print "<br>\n" if $lng ne $last_lng;
      print "<h1>$lng_nomo</h1>\n" if $num == 1 or $lng ne $last_lng;
    }
    $last_lng = $lng;

    if ($formato eq "txt") {
#      if ($lng eq 'eo') {
        print "$trd, /revo/art/$$ref{'art_amrk'}.html#$anchor$klr\n";
#      } else {
#	    print "$trd, /revo/art/$$ref{'art_amrk'}.html#$anchor\n";
#	  }
    } elsif ($formato eq "idx") {
      if ($lng eq 'eo') {
        next unless $$ref{'drv_match'};
        my ($a, $b1, $b2) = ("#$anchor", "", "");
        ($a, $b1, $b2) = ("", "<b>", "</b>") if $trd eq $$ref{'art_kap'};
#        print "trd=$trd kap=$$ref{'art_kap'}\n" if $trd ne $$ref{'art_kap'};

#        my $var = $$ref{'var_teksto'};
#        if ($var) {
#          $var = ", $var";
#        } else {
#          $var = "";
#        }
#        print "         <a href=\"../art/$$ref{'art_amrk'}.html$a\" target=\"precipa\">$b1$trd$var$b2</a><br>\n";

        my $var = $$ref{'var_org'};
        $trd = $var if $var;

        print "         <a href=\"$pado/art/$$ref{'art_amrk'}.html$a\" target=\"precipa\">$b1$trd$b2</a><br>\n";
      }
    } else {
      if (!$regulira && $sercxata !~ /[%_]/) {
        $trd =~ s/$sercxata/<b>$sercxata<\/b>/g;
      }
      print a({href=>"/revo/art/$$ref{'art_amrk'}.html#$anchor", target=>"precipa"}, "$trd"), $klr;

      if ($num > 100) {
        print br, "... kaj pli ...", "\n";
        last;
      }
      print br, "\n";
    }
  }
  $res->finish();
      
  $neniu_trafo = 0 if $num;
}

