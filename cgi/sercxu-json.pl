#!/usr/bin/perl

#
# sercxu.pl
# 
# 2006-09-__ Wieland Pusch
# 2006-10-__ Bart Demeyere
# 2007-03-__ Wieland Pusch
# 2012-13 __ Wolfram Diestel

use strict;

use CGI qw(:standard *table);
use CGI::Carp qw(fatalsToBrowser);
use DBI();
use URI::Escape;

$| = 1;

my $debug = 0;

#print "Content-type: text/html\n\n";

# testu ekz. per:
# perl sercxu-json.pl "sercxata=test%&cx=1&moktesto=0"


my $MOCK = param("moktesto");

if ($MOCK) {

print <<EOT;
Content-type: application/json

[ 
  {
  "lng1": "eo",
  "lng2": "de",
  "titolo": "esperante (de)",
  "trovoj": [
    { "art": "artifi",
      "mrk1": "artifi.0i",
      "vrt1": "artifiki"
    },
    { "art": "artik",
      "mrk1": "artik.0o",
      "vrt1": "artiko",
      "mrk2": "lng_de",
      "vrt2": "Gelenk"
    },
    { "art": "artikl",
      "mrk1": "artikl.0o",
      "vrt1": "artiklo",
      "mrk2": "lng_de",
      "vrt2": "Artikel, Ware"
    }
  ]
 },
 {
  "lng1": "de",
  "lng2": "eo",
  "titolo": "germane (preferata)",
  "trovoj": [
    { "art": "artikl",
      "mrk1": "lng_de",
      "vrt1": "Artikel",
      "mrk2": "artikl.0o",
      "vrt2": "artiklo"
    },
    { "art": "artiko",
      "mrk1": "lng_de",
      "vrt1": "Artikel",
      "mrk2": "artiko.0o",
      "vrt2": "artikolo"
    },
    { "art": "artik",
      "mrk1": "lng_de",
      "vrt1": "artikulieren",
      "mrk2": "artik.0igi.FON",
      "vrt2": "artikigi",
      "snc2": "2"
    }
  ]
 }
]

EOT

exit;
} # if $MOCK
else {

# komenco
print <<EOT;
Content-type: application/json

[
EOT
}

#### preparu stirantajn parametrojn  ####

### my %unicode = ( cx => "ĉ", gx => "ĝ", hx => "ĥ", jx => "ĵ", sx => "ŝ", ux => "ŭ" );

my $max_entries = 100;
my $neniu_trafo = 1;
my $formato = "json";

# kion serĉi
my $sercxata = param('q2');
$sercxata = param('sercxata') if param('sercxata');

# ĉu traduki cx al ĉ ktp.
my $cx2cx = param('cx');
#$cx2cx = "checked" if $cx2cx;

# ĉu serĉi en nur unu lingvo?
my $param_lng = param('lng');
$param_lng = '' unless $param_lng;

# pado al Revo-artikoloj
my $pado = "..";
$pado = "/revo" if param('pado') eq 'revo';


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
#  serĉo en datumbazo                                             #
###################################################################


# propraj perl moduloj estas en:
use lib ("./perllib");
use lib("/var/www/web277/files/perllib");
use revodb;
use eosort;

# serĉo en la datumbazo
my $dbh = revodb::connect();
$dbh->do("set names utf8");
use Time::HiRes qw (gettimeofday tv_interval);
Sercxu($sercxata, $preferata_lingvo);
$dbh->disconnect() or die "Malkonekto de la datumbazo ne funkciis";

# fino
print "\n]\n";
exit;


###################################################################
# funkcioj por serĉo                                              #
###################################################################


sub Sercxu
{
  my ($sercxata, $preferata_lingvo) = @_;
  my $tempo = [gettimeofday];
  my ($sth, $sth2);

  # $komparo estas unu el: =, LIKE, REGEXP
  my $komparo = '=';
  if ($sercxata =~ /[.^$\[\(\|+?{\\]/) {
    $komparo = 'REGEXP'
  } elsif ($sercxata =~ /[%_]/) {
    $komparo = 'LIKE';
  };

  # pro ricevi ĝustan ordigadon en diversaj lingvoj ni
  # uzas normigitan askiigitan formon (_ci) por serĉi en la datumbazo
  my ($sercxata2,$sercxata2_eo) = normiguSercxon($sercxata);

  # serĉo en Esperanto aŭ sen difinita lingvo
  if ($param_lng eq 'eo' or $param_lng eq '') {

    my $QUERY_eo =  
      "SELECT d.drv_mrk, d.drv_teksto, d.drv_id, a.art_amrk, v.var_teksto, 
        d.drv_teksto_ci " . $komparo . " ? AS drv_match
       FROM art a, drv d
       LEFT OUTER JOIN var v ON d.drv_id = v.var_drv_id 
       WHERE (d.drv_teksto_ci " . $komparo . " ? or v.var_teksto_ci " . $komparo . " ?)
       AND a.art_id = d.drv_art_id 
       GROUP BY d.drv_id 
       ORDER BY d.drv_teksto_ci, d.drv_teksto desc, a.art_amrk";
    my $QUERY_eo_trd = 
      "SELECT distinct t.trd_teksto
       FROM trd t, snc s
       WHERE s.snc_drv_id = ?
          AND t.trd_snc_id = s.snc_id
          AND t.trd_lng = ?
       ORDER BY t.trd_teksto";

    $sth2 = $dbh->prepare($QUERY_eo_trd);
    $sth = $dbh->prepare($QUERY_eo);

    eval {
      print "$QUERY_eo\n" if ($debug);
      print "serĉu: $sercxata2_eo\n" if ($debug);
      $sth->execute($sercxata2_eo, $sercxata2_eo, $sercxata2_eo);
      ###exit;
    };

    # kontrolu kaj eldonu erarojn, aliokaze la rezultojn
    # TODO: necesas adapti por json
    if ($@) {
      if ($sth->err == 1139) {	# Got error 'brackets ([ ]) not balanced
        print "Eraro: La rektaj krampoj ([ ]) ne kongruas.<br>\n";
      } else {
        print "Err ".$sth->err." - $@";
      }
    } else {
      MontruRezultojn($sth, 'eo', $preferata_lingvo, $sth2);
    }
  }

  # serĉo en aliaj lingvoj ol Esperanto
##  } else 

  {
    
    $sth2 = undef;
    if (param("trd")) {
      my $QUERY_lng_trd =
	"SELECT t.*
         FROM trd t
         WHERE t.trd_lng = ?
	   AND t.trd_snc_id = ?
         ORDER BY t.trd_teksto_ci";
	  
      $sth2 = $dbh->prepare($QUERY_lng_trd);
    }

    my $QUERY_lng = 
      "SELECT t.trd_lng, t.trd_teksto, s.snc_mrk, s.snc_numero, 
                d.drv_mrk, d.drv_teksto, a.art_amrk, l.lng_nomo
      FROM trd t
      LEFT JOIN snc s ON t.trd_snc_id = s.snc_id
      LEFT JOIN drv d ON d.drv_id = s.snc_drv_id
      LEFT JOIN art a ON a.art_id = d.drv_art_id
      LEFT JOIN lng l ON t.trd_lng = l.lng_kodo ";

    if ($param_lng) { # nur unu lingvo
      $preferata_lingvo = $param_lng;
      $QUERY_lng .=
	"WHERE t.trd_teksto_ci " . $komparo . " ?
          AND t.trd_lng = ?
        ORDER BY l.lng_nomo, t.trd_teksto_ci, 
        d.drv_teksto_ci, s.snc_numero";

    } else { # cxiuj lingvojn, sed preferata unue
      $QUERY_lng.=
        "WHERE t.trd_teksto_ci " . $komparo . " ?
        ORDER BY abs(strcmp(t.trd_lng, ?)), l.lng_nomo, 
      t.trd_teksto_ci, d.drv_teksto_ci, s.snc_numero";
    }

    $sth = $dbh->prepare($QUERY_lng);
    eval {
      print "$QUERY_lng\n" if ($debug);
      print "serĉu: $sercxata2\n" if ($debug);
      $sth->execute($sercxata2, $preferata_lingvo);
    };

    # TODO: eligon de eraro adaptu por JSON
    if ($@) {
      # $sth->err and $DBI::err will be true if error was from DBI
      if ($sth->err == 1139) {	# Got error 'brackets ([ ]) not balanced
      } else {
        print "Err ".$sth->err." - $@";
      }

    } else {
      MontruRezultojn($sth, $param_lng, $preferata_lingvo, $sth2);
    }
  }
}

sub normiguSercxon {
  my $sercxata = shift @_;
  my $sercxata_eo = $sercxata;

  if ($cx2cx) {
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

  return ($sercxata,$sercxata_eo);
}


###################################################################
# funkcioj por eldono                                             #
###################################################################

sub MontruRezultojn
{
  my ($res, $lng, $preferata_lingvo, $sth2) = @_;
  my $num = 0;
  my $last_lng;

  # trakuru ĉiujn DB-serĉrezultojn...
  while (my $ref = $res->fetchrow_hashref()) {

    $num++;

    # lng=eo
    if ($lng eq 'eo') {

      if ($num == 1) {
	#print " ]\n },\n {" unless ($num==1);
	print " {\n";
	attribute("lng1",'eo');
	attribute("lng2",$preferata_lingvo);
	attribute("titolo",'esperante'.($preferata_lingvo?" (de)":""));
	print " \"trovoj\": [\n";
	$last_lng = $lng;
      } else {
	print ",\n";
      }

      print "  {";
      attribute("art",$$ref{'art_amrk'});
      attribute("mrk1",$$ref{'drv_mrk'});
      attribute("vrt1",$$ref{'drv_match'}?$$ref{'drv_teksto'}:$$ref{'var_teksto'});
      if ($preferata_lingvo) {
	# aldonu tradukojn en preferata lingvo
	$sth2->execute($$ref{'drv_id'}, $preferata_lingvo);
	my $tradukoj=''; my $sep='';
	while (my $ref2 = $sth2->fetchrow_hashref()) {
	  $tradukoj .= $sep.$$ref2{'trd_teksto'};
	  $sep = ", ";
	}
        attribute("mrk2","lng_".$preferata_lingvo);
        attribute("vrt2",$tradukoj,1);
      }
      print "}";

    # lng != eo
    } else {


      if ($num == 1 or $$ref{'trd_lng'} ne $last_lng) {

	if ($num == 1) { 
	  print ",\n" unless ($lng eq 'eo' or $neniu_trafo);
	  print " {\n" 
	}
	else { 
	  print " ]\n },\n {" 
	}; 

	attribute("lng1",$$ref{'trd_lng'});
	attribute("lng2",'eo');
	attribute("titolo",$$ref{'lng_nomo'}.
		  ($preferata_lingvo eq  $$ref{'trd_lng'}?" (preferata)":""));
	print " \"trovoj\": [\n";
	$last_lng = $$ref{'trd_lng'};
      } else {
	print ",\n";
      }

      print "  {";
      attribute("art",$$ref{'art_amrk'});
      attribute("mrk1",'lng_'.$$ref{'trd_lng'});
      attribute("vrt1",$$ref{'trd_teksto'});
      attribute("mrk2",$$ref{'drv_mrk'});
      attribute("vrt2",$$ref{'drv_teksto'},1);
    
      print "}";
    }
  }
  $res->finish();
    
  if ($num) {
    $neniu_trafo = 0;
    print " ]\n }";
  }
}


sub attribute {
  my ($name,$value,$last) = @_;
  print "\"$name\":\"$value\"";
  print "," unless ($last);
}

