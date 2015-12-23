#!/usr/bin/perl

#
# mx_trd.pl
# 
# 2007-04-__ Wieland Pusch
#

use strict;

use CGI qw(:standard *table);
use CGI::Carp qw(fatalsToBrowser);
use DBI();
use URI::Escape;

$| = 1;

#my $sercxata = param('q2');

my $lng = param('lng');
my $titolo = "mankantaj tradukoj";
$titolo .= " en lingvo $lng" if $lng;
print header(-charset=>'utf-8'),
      start_html( -title=>$titolo,
		  -style=>{-src=>'/revo/stl/indeksoj.css'},
);

unless ($lng) {
  my %lng;
  print h2("Elektu la lingvon:");
  open IN, "<../revo/cfg/lingvoj.xml" or die "ne povas malfermi lingvoj.xml";
  while (<IN>) {
    if (/<lingvo kodo="([^"]+)">([^<]+)<\/lingvo>/) {
#      print "lng $1 -> $2".br."\n";
      $lng{$2} = $1 if $1 ne "eo";
    }
  }
  close IN;
  my $i;
  foreach (sort keys %lng) {
    $i++;
    print a({href=>"?lng=$lng{$_}"}, "$i. $_").br."\n";
  }
  exit 0;
}

$lng =~ /^[a-z]+$/ or die "Ne valida lingvo $lng";

print start_table(-cellspacing=>0),
	   h2("mankantaj tradukoj en lingvo $lng"),
#           Tr(
#           [
#              td('xxx'),
#           ]
#           )
;


# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use revodb;
#use eosort;

# Connect to the database.
my $dbh = revodb::connect();

#$dbh->do("set names utf8");

my $limit = param('limit');
$limit = "0,30" unless $limit;
$limit =~ /^(\d+),(\d+)$/ or die "Ne valida limit $limit";
my $limit_de = $1;
my $limit_kvanto = $2;

my $start_id = param('start');
$start_id = 0 unless $start_id;

my $limit_de_antauxe = $limit_de - $limit_kvanto;
$limit_de_antauxe = 0 if $limit_de_antauxe < 0;
my $limit_de_poste = $limit_de + $limit_kvanto;

my $kap = param('kap');
my $kapsql;
if ($kap !~ /^[a-z]x?$/) {
  $kap = "";
  $kapsql = "";
} else {
  $kapsql = " and a.art_amrk > '$kap'";
}

print a({href=>"?lng=$lng&limit=$limit_de_antauxe,$limit_kvanto&start=$start_id&kap=$kap"}, '<<<'), ' ',
      a({href=>"?lng=$lng&limit=$limit_de_poste,$limit_kvanto&start=$start_id&kap=$kap"}, '>>>'), ' ';

my @a = ("a", 0, "b", 0, "c", 0, "cx", "&#265;", "d", 0, "e", 0, "f", 0, "g", 0, "gx", "&#285;", "h", 0, "hx", "&#293;", "i", 0,
	 "j", 0, "jx", "&#309;", "k", 0, "l", 0, "m", 0, "n", 0, "o", 0, "p", 0,  "r", 0, "s", 0, "sx", "&#349;", "t", 0,
	 "u", 0, "v", 0, "z", 0);
while ($#a >= 0) {
  my $lit = shift @a;
  my $utf = shift @a;
  $utf = $lit unless $utf;
  print <<"EOD";
<a href=\"?lng=$lng&kap=$lit\">$utf</a> 
EOD
}

print br;

my $sth = $dbh->prepare("select t.trd_snc_id, a.art_amrk, d.drv_mrk, d.drv_teksto, s.snc_mrk, s.snc_numero from trd t, snc s, drv d, art a where a.art_id = d.drv_art_id and s.snc_drv_id = d.drv_id and t.trd_snc_id = s.snc_id and t.trd_snc_id > ? and t.trd_lng <> 'la' $kapsql group by t.trd_snc_id
having min(if (t.trd_lng = ?, 1, 2)) = 2 and count(*) > 1 order by a.art_amrk, d.drv_teksto, s.snc_numero limit $limit") or die "prepare sth";
$sth->execute($start_id, $lng);

my $num;
my $last_amrk;
while (my $ref = $sth->fetchrow_hashref()) {
  $num++;
  print "$num. ";
  my $mrk = $$ref{drv_mrk};
  $mrk = $$ref{snc_mrk} if $$ref{snc_mrk};
  my $numero = "";
  $numero = sup(i($$ref{snc_numero})) if $$ref{snc_numero};
  print a({href => "/revo/art/$$ref{art_amrk}.html#$mrk"}, $$ref{drv_teksto}.$numero);
  my $art = "";
  $art = " ".a({href => "/revo/xml/$$ref{art_amrk}.xml"}, "$$ref{art_amrk}.xml") if $last_amrk ne $$ref{art_amrk};
  print "&nbsp; ".a({target=>"_blank", href=>"/cgi-bin/vokomail.pl?art=$$ref{art_amrk}&mrk=$mrk"}, "[traduki]")
	.$art.br."\n";
  $last_amrk = $$ref{art_amrk};
}

$dbh->disconnect() or die "DB disconnect ne funkcias";
  
print a({href=>"?lng=$lng&limit=$limit_de_antauxe,$limit_kvanto&start=$start_id&kap=$kap"}, '<<<'), ' ',
      a({href=>"?lng=$lng&limit=$limit_de_poste,$limit_kvanto&start=$start_id&kap=$kap"}, '>>>'),
      br;

print end_table();

print end_html();


