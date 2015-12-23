#!/usr/bin/perl

#
# indeks.pl
# 
# 2008-04-21 Wieland Pusch
#

use strict;

use CGI qw(:standard start_table end_table -no_xhtml);
use CGI::Carp qw(fatalsToBrowser);
use DBI();

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
#use CGI::WebGzip;
use revodb;
use revo::eosort;

my $sorter = revo::eosort->new();

# Connect to the database.
my $dbh = revodb::connect;
print header(-charset=>'utf-8');

#############################################################################
sub ligo {
  my ($kat, $subkat, $kap, $idoj, $dato) = @_;
  my $ksk = "$kat$subkat$kap";
  my $test = "2";

  my $l = "/revo/inx/";
  
  if ($kat eq "LNG") {
    if ($subkat eq "eo") {
      if ($kap eq "") {
        $l .= "_eo";
      } else {
        $l .= "kap_$kap";
      }
    } elsif ($subkat eq "") {
      $l .= "_lng";
    } else {
      $l .= "lx_${subkat}_$kap";
    }
  } elsif ($ksk eq "FAK") {
    $l .= "_fak";
  } elsif ($ksk eq "KTP") {
    $l .= "_ktp";
  } else {
    $l .= "??$ksk";
  }

  # "?kat=LNG&subkat=la&kap=a"
  $l .= "$test.html";

  my $mtime = (stat("/var/www/web277/html$l"))[9];
  my @t = localtime($mtime);
  $_ = sprintf("%02.2d", $_) foreach @t[0..4];
  $t[5]+=1900; $t[4]+=1;
  $mtime = "$t[5]-$t[4]-$t[3] $t[2]:$t[1]:$t[0]";
  push @{$idoj}, {kat=>$kat, subkat=>$subkat, kap=>$kap, dato=>$dato, fname=>$l, mtime=>$mtime} if $idoj;# and $mtime lt $dato;

  return $l;
}

#############################################################################
sub indeks {
my ($kat, $subkat, $kap, $idoj) = @_;

my $fname = ligo($kat, $subkat, $kap);
my ($titolo, $subtitolo, $presubtitolo2, $subtitolo2);
my $katsubkat="$kat$subkat";
$kap = ' ' unless $kap;
if ($kat eq "LNG") {
#  print pre("kat=LNG");
  if ($subkat eq "eo") {
    if ($kap ne " ") {
      $titolo = "esperanta indekso";
      $subtitolo2 = sub { "esperanta $_[0]..." };
    } else {
      $titolo = "ReVo-indekso: Esperanto";
      $subtitolo = "alfabeta indekso";
      $presubtitolo2 = a({-href => "/revo/inx/mallong.html"}, b("mallongigoj"));
      $subtitolo2 = sub { "ĉefaj nocioj" };
    }
  } elsif (!$subkat) {
    print pre("kat=LNG subkat=");
    $titolo = "ReVo-indekso: Lingvoj";
    $subtitolo = "nacilingvaj indeksoj";
    $presubtitolo2 = p(a({-href => ligo("LNG", "la", "a", $idoj)
                         }, b("latina/scienca")));
  } else {
    my $lingvo;
    my $sth = $dbh->prepare("SELECT kat_nomo FROM r2_kat WHERE kat_tipo = ? AND kat_kat = ?") or die ;
    $sth->execute($kat, $subkat);
    if (my $ref = $sth->fetchrow_arrayref()) {
#      print pre("lingvonomo = $ref->[0]");
      $lingvo = $ref->[0];
    }
    $sth->finish;

    $titolo = "$lingvo indekso";
    $subtitolo2 = sub { "$lingvo $_[0]..." };
  }
} elsif ($kat eq "INV") {
  $subkat = 'eo';
  $kap = "a" if $kap eq " ";
  $titolo = "inversa indekso";
  $subtitolo2 = sub { "inversa $_[0]..." };
} elsif ($kat eq "KTP") {
  if ($subkat eq "STA") {
    $titolo = "statistiko";
    $subtitolo = "statistiko";
  } elsif ($subkat eq "MTR") {
    $titolo = "-indekso: mankantaj tradukoj";
    $subtitolo = "listoj de mankantaj tradukoj";
  } elsif (!defined($subkat)) {
    $titolo = "ReVo-indekso: ktp.";
    $subtitolo = "gravaj paĝoj";
  } else {
    $titolo = "??? kat=$kat subkat=$subkat";
  }
} elsif ($kat eq "FAK") {
  if ($subkat) {
    $titolo = "fakindekso:";
  } else {
    $titolo = "ReVo-indekso: Fakoj";
  }
} elsif ($kat eq "BLD") {
  $titolo = "bildo-indekso";
  $subtitolo = "bildoj";
} elsif ($kat eq "MLG") {
  $titolo = "mallongigo-indekso";
  $subtitolo = "mallongigoj";
} elsif ($kat eq "NOV") {
  $titolo = "novaj artikoloj";
  $subtitolo = "novaj artikoloj";
} elsif ($kat eq "SXA") {
  $titolo = "mallongigo-indekso";
  $subtitolo = "laste ŝanĝitaj";
} else {
  $titolo = "???";
}

my $html = <<"EOD";
<html xmlns:xs="http://www.w3.org/2001/XMLSchema"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>$titolo</title><link title="indekso-stilo" type="text/css" rel="stylesheet" href="/revo/stl/indeksoj.css"></head><body>
EOD

my @kaplit;
if (($kat eq "LNG" and $subkat) or ($kat eq "INV")) {
#  print pre("kaplit");
  my $sth = $dbh->prepare("SELECT ind_kaplit, max(ind_dato) ind_dato FROM r2_indekso WHERE ind_kaplit <> ' ' and ind_kat = ? AND ind_subkat = ? GROUP BY ind_kaplit ORDER BY ind_kaplit") or die;
  $sth->execute($kat, $subkat);
  while (my $ref = $sth->fetchrow_arrayref()) {
#    print pre("lit = $ref->[0], dato=$ref->[1]");
    my ($utf, $name) = $sorter->ord2utf8($subkat, $ref->[0]);
#    print pre("utf = $utf, name = $name\n");
    push @kaplit, [$utf, $name, , $ref->[1]];
  }
}

$html .= start_table({-cellspacing => 0});

sub formato {
  my ($bool, $freft, $arg1t, $arg2t, $freff, $arg1f, $arg2f) = @_;

#  print pre("formato $bool $freft, $arg1t, $arg2t, $freff, $arg1f, $arg2f");
  if ($bool) {
    &$freft($arg1t, $arg2t);
  } else {
    &$freff($arg1f, $arg2f);
  }
}

my $kap_utf8 = "";

$html .= Tr(   formato("$kat$subkat" eq "LNGeo", 
		\&td, {-class => "aktiva"}, a({-href => ligo("LNG", "eo", "")}, "Esperanto"),
		\&td, {-class => "fona"},   a({-href => ligo("LNG", "eo", "")}, "Esperanto")),
            formato(($kat eq "LNG" and $subkat ne "eo"),
		\&td, {-class => "aktiva"}, a({-href => ligo("LNG", "", "")}, "Lingvoj"),
		\&td, {-class => "fona"},   a({-href => ligo("LNG", "", "")}, "Lingvoj")),
            formato($kat eq "FAK",
		\&td, {-class => "aktiva"}, a({-href => ligo("FAK", "", "")}, "Fakoj"),
		\&td, {-class => "fona"},   a({-href => ligo("FAK", "", "")}, "Fakoj")),
            formato($kat eq "KTP",
		\&td, {-class => "aktiva"}, a({-href => ligo("KTP", "", "")}, "ktp."),
		\&td, {-class => "fona"},   a({-href => ligo("KTP", "", "")}, "ktp.")),
        );

if ($kat eq "LNG") {
  my $listo;
  if ($subkat) {
    my ($utf, $kap_kodo) = $sorter->name2utf8($subkat, $kap);
    $kap_kodo = ' ' if $kap eq ' ';
    print pre("ind: kat=$kat, subkat=$subkat, kap=$kap, kodo=$kap_kodo-");
    my $sth_ind = $dbh->prepare("SELECT ind_teksto, ind_traduko, ind_trdgrp, ind_celref, ind_ord FROM r2_indekso WHERE ind_kat = ? AND ind_subkat = ? and ind_kaplit = ? ORDER BY ind_ord, ind_subord, ind_ord2, ind_celref desc") or die;
    $sth_ind->execute($kat, $subkat, $kap_kodo);
    if ($subkat eq 'eo') {
      while (my $ref = $sth_ind->fetchrow_hashref()) {
        $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
        $listo .= $ref->{ind_traduko}.a({-href => "/revo/$ref->{ind_celref}", -target => "precipa"},
  	  ( $ref->{ind_celref} =~ /\#/ ? $ref->{ind_teksto} : b($ref->{ind_teksto}) )).br."\n";
      }
    } else {
      my ($last_celref, $last_teksto, $last_traduko, $last_trdgrp, $grupo);
      my $ref = $sth_ind->fetchrow_hashref();
      my $nextref;
      while ($ref) {
        $nextref = $sth_ind->fetchrow_hashref();
#        print pre("ind: ref->{ind_traduko}=$ref->{ind_traduko}-");
#        print pre("ind: nextref=$nextref");
        $ref->{ind_traduko} =~ s/^\n+//;
        $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
#        print pre("ind8: nextref=$nextref");
        if ($last_traduko and $ref->{ind_trdgrp} and $last_trdgrp ne $ref->{ind_trdgrp} and $ref->{ind_trdgrp} ne $last_traduko
            and $nextref and $nextref->{ind_trdgrp} eq $ref->{ind_trdgrp}) {
#         print pre("ind9: nextref=$nextref");
         $grupo = "$ref->{ind_trdgrp}:".br."\n&nbsp;&nbsp;&nbsp;";
        }
#        print pre("ind6: nextref=$nextref");
#        print pre("ind2: ref->{ind_celref}=$ref->{ind_celref}-");
        $ref->{ind_trdgrp} = $ref->{ind_traduko} unless $ref->{ind_trdgrp};
        if ($ref->{ind_traduko} eq $last_traduko) {
#          print pre("ind3: ref->{ind_teksto}=$ref->{ind_teksto}-");
          goto NEXT if $ref->{ind_teksto} eq $last_teksto;
          $listo .= ", ";
        } else {
#          print pre("ind4: ref->{ind_teksto}=$ref->{ind_teksto}-");
          $listo .= br."\n".$grupo if $last_traduko;
          $listo .= "&nbsp;&nbsp;&nbsp;" if $last_trdgrp and $ref->{ind_trdgrp} eq $last_trdgrp;
          $grupo = "";
          $listo .= "$ref->{ind_traduko}: ";
        }
#        print pre("ind7: nextref=$nextref");
        $listo .= a({-href => "/revo/$ref->{ind_celref}", -target => "precipa"},
                    ( ($ref->{ind_celref} =~ /\#/ or $subkat ne "eo") ? $ref->{ind_teksto} : b($ref->{ind_teksto}) ));
        ($last_celref, $last_teksto, $last_traduko, $last_trdgrp) = ($ref->{ind_celref}, $ref->{ind_teksto}, $ref->{ind_traduko}, $ref->{ind_trdgrp});
NEXT:
#        print pre("ind5: next ref=$ref nextref=$nextref-");
        $ref = $nextref;
      }
      $listo .= br."\n";
    }
  } else {
    my %lng_num;
    my $sth = $dbh->prepare("SELECT ind_subkat, min(ind_kaplit), count(*) FROM r2_indekso WHERE ind_kat = 'LNG' GROUP BY ind_subkat");
    $sth->execute();
    while (my $ref = $sth->fetchrow_arrayref()) {
#      print pre("lng_num: $ref->[0], $ref->[1], $ref->[2]");
      $lng_num{$ref->[0]} = [$ref->[1], $ref->[2]];
    }

#SELECT min(ind_kaplit) FROM r2_indekso WHERE ind_kat = 'LNG' AND `ind_subkat` = 'af'
    my $sth = $dbh->prepare("SELECT kat_kat, kat_nomo, min(ind_kaplit) lit FROM r2_kat, r2_indekso WHERE kat_tipo = 'LNG' AND kat_tipo = ind_kat AND ind_subkat = kat_kat AND kat_kat <> 'la' AND kat_kat <> 'eo' GROUP BY kat_kat, kat_nomo ORDER BY kat_nomo") or die;
#SELECT kat_kat, kat_nomo FROM r2_kat WHERE kat_tipo = 'LNG' AND kat_kat <> 'la' AND kat_kat <> 'eo' order by kat_nomo
    $sth->execute();
    while (my $ref = $sth->fetchrow_hashref()) {
      my $num = $lng_num{$ref->{kat_kat}}->[1];
#      print pre("lng = ".$ref->{kat_kat}.", num=$num");
      my ($utf, $kap_kodo) = $sorter->ord2utf8($ref->{kat_kat}, $ref->{lit});

      if ($num > 0) {
        my $kat_form = $ref->{kat_nomo};
        $kat_form = b($kat_form) if $num >= 1000;
        $listo .= a({-href => ligo("LNG", $ref->{kat_kat}, $kap_kodo, $idoj)}, $kat_form).br."\n";
      }
    }
    $listo = p($listo);
  }
#  print pre("kap=$kap-");
  my $kaplit = join(' ', map({formato($kap eq $_->[1] ? $kap_utf8 = $_->[0] : 0,
                           \&b, {-class => "elektita"}, $_->[0],
			   \&a, {-href => ligo($kat, $subkat, $_->[1], $idoj, $_->[2])}, $_->[0]) } @kaplit));
#  print pre("kaplit=$kaplit");
  $kaplit = '<p style="font-size: 120%"><b>'.$kaplit.'</b></p>' if $kaplit and $kap eq ' ';
  
#  print pre("listo=$listo");
  $html .= Tr( [ td( {-colspan => "4", -class => "enhavo"},
  		    ($kap eq ' ' ? "<h1>$subtitolo".'</h1>' : '').
                    $kaplit,
              $presubtitolo2,
              $subtitolo2 ? h1(&$subtitolo2($kap_utf8))."\n" : "",
              $listo
            ),
          ] );
} elsif ($kat eq "INV") {
  my $listo;

  my ($utf, $kap_kodo) = $sorter->name2utf8($subkat, $kap);
#  print pre("ind: lng=$subkat, kat=$kat, subkat=$subkat, kap=$kap, kodo=$kap_kodo-");
  my $sth_ind = $dbh->prepare("SELECT ind_teksto, ind_traduko, ind_trdgrp, ind_celref, ind_ord FROM r2_indekso WHERE ind_kat = ? AND ind_subkat = ? and ind_kaplit = ? ORDER BY ind_ord, ind_celref, ind_teksto") or die;
  $sth_ind->execute($kat, $subkat, $kap_kodo);
  while (my $ref = $sth_ind->fetchrow_hashref()) {
#        $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
        $listo .= $ref->{ind_traduko}.a({-href => "/revo/$ref->{ind_celref}", -target => "precipa"},
  	  $ref->{ind_teksto} ).br."\n";
  }
#.-.

#  print pre("kap=$kap");
  my $kaplit = "";
  $kaplit = join(' ', map({formato($kap eq $_->[1] ? $kap_utf8 = $_->[0] : 0,
                           \&b, {-class => "elektita"}, $_->[0],
			   \&a, {-href => "?kat=$kat&subkat=$subkat&kap=$_->[1]"}, $_->[0]
							   ) }
                                           @kaplit));
  $kaplit = '<p style="font-size: 120%"><b>'.$kaplit.'</b></p>' if $kaplit and $kap eq ' ';

#.-.

  $html .= Tr( [ td( {-colspan => "4", -class => "enhavo"},
  		    ($kap eq ' ' ? "<h1>$subtitolo".'</h1>' : '').
                    $kaplit,
              $presubtitolo2,
              $subtitolo2 ? h1(&$subtitolo2($kap_utf8))."\n" : "",
              $listo
            ),
          ] );
} elsif ($kat eq "KTP") {
  my $listo;
  if ($subkat eq "STA") {
    my @listo;
    my $sth = $dbh->prepare("SELECT count(*) art, sum(sta_drv) drv, sum(sta_snc) snc, sum(sta_bld) bld, sum(sta_mlg) mlg FROM r2_stat") or die ;
    my $ref_stat;
    $sth->execute();
    if ($ref_stat = $sth->fetchrow_hashref()) {
      push @listo, td( {width=>"20%"}, "artikoloj: " ).td({width=>"40%"}).td({width=>"20%", align=>"right"}, $ref_stat->{art}).td({width=>"20%"});
      push @listo, td( "derivaĝoj: " ).td().td({align=>"right"}, $ref_stat->{drv});
      push @listo, td( "sencoj: " ).td().td({align=>"right"}, $ref_stat->{snc});
      push @listo, td( "bildoj: " ).td().td({align=>"right"}, $ref_stat->{bld});
      push @listo, td( "mallongigoj: " ).td().td({align=>"right"}, $ref_stat->{mlg});

    }
    push @listo, td( h2("tradukoj" ) );
    my $sth = $dbh->prepare("SELECT kat.kat_nomo lng, sum( stl_n ) n, sum( stl_p ) p FROM r2_stlng stl, r2_kat kat WHERE stl.stl_lng = kat.kat_kat AND kat.kat_tipo = 'LNG' GROUP BY stl_lng ORDER BY 2 DESC") or die ;
    $sth->execute();
    while (my $ref = $sth->fetchrow_hashref()) {
      my $prozento = sprintf("~%2.1f%%", $ref->{p} / $ref_stat->{snc} * 100);
      $prozento =~ s/\.?0+%$/%/;
      push @listo, td( "$ref->{lng}:" ).td({align=>"right"}, $ref->{n}).td({align=>"right"}, $prozento);
    }
    push @listo, td( {-colspan => 4}, "(la procentoj rezultas el nombro de tradukitaj sencoj je la nombro de tradukendaj sencoj)" );
    push @listo, td( h2("Fakoj") );

    my $sth = $dbh->prepare("SELECT k.kat_kat, k.kat_nomo, count(*) n FROM r2_indekso i, r2_kat k WHERE k.kat_tipo = 'FAK' and i.ind_kat = k.kat_tipo AND i.ind_subkat = k.kat_kat group by k.kat_kat, k.kat_nomo order by 3 desc") or die ;
    $sth->execute();
    while (my $ref = $sth->fetchrow_hashref()) {
      push @listo, td(img {src=>"/revo/smb/$ref->{kat_kat}.gif", alt=>$ref->{kat_kat}} ).td("$ref->{kat_nomo}:").td({align=>"right"}, $ref->{n});
    }
    $listo = h2("kapvortoj k.a.").table( Tr( \@listo ) );
  } elsif ($subkat eq "MTR") {
    my %lng_num;
    my $sth = $dbh->prepare("SELECT ind_subkat, min(ind_kaplit), count(*) FROM r2_indekso WHERE ind_kat = 'LNG' GROUP BY ind_subkat");
    $sth->execute();
    while (my $ref = $sth->fetchrow_arrayref()) {
      $lng_num{$ref->[0]} = [$ref->[1], $ref->[2]];
    }

    my $sth = $dbh->prepare("SELECT kat_kat, kat_nomo, min(ind_kaplit) lit FROM r2_kat, r2_indekso WHERE kat_tipo = 'LNG' AND kat_tipo = ind_kat AND ind_subkat = kat_kat AND kat_kat <> 'la' AND kat_kat <> 'eo' GROUP BY kat_kat, kat_nomo ORDER BY kat_nomo") or die;
    $sth->execute();
    while (my $ref = $sth->fetchrow_hashref()) {
      my $num = $lng_num{$ref->{kat_kat}}->[1];
      my ($utf, $kap_kodo) = $sorter->ord2utf8($ref->{kat_kat}, $ref->{lit});

      if ($num > 1000) {
        my $kat_form = $ref->{kat_nomo};
        $listo .= a({-href => "/cgi-bin/mx_trd.pl?lng=$ref->{kat_kat}"}, $kat_form).br."\n";
      }
    }
    $listo = p($listo);
  } else {
    $listo .= a({-href => "/revo/titolo.html"}, "titolpaĝo").br."\n";
    $listo .= a({-href => "/cgi-bin/hazarda_art.pl?senkadroj=2"}, "iu ajn artikolo").br."\n";
    $listo .= a({-href => "/revo/dok/copying.txt", -target=>"precipa"}, "permesilo").br."\n";
    $listo .= a({-href => "/tgz/index.html", -target=>"_new"}, "elŝuti").br."\n";
    $listo .= h1('diversaj indeksoj');
    $listo .= a({-href => "?kat=BLD"}, "listo de bildoj").br."\n";
    $listo .= a({-href => "?kat=MLG"}, "listo de mallongigoj").br."\n";
    $listo .= a({-href => "?kat=INV"}, "inversa indekso").br."\n";
    $listo .= a({-href => "?kat=NOV"}, "novaj artikoloj").br."\n";
    $listo .= a({-href => "?kat=SXA"}, "ŝanĝitaj artikoloj").br."\n";
    $listo .= a({-href => "/revo/inx/eraroj.html"}, "eraro-raporto").br."\n";
    $listo .= a({-href => "?kat=KTP&subkat=STA"}, "statistiko").br."\n";
    $listo .= a({-href => "?kat=KTP&subkat=MTR"}, "mankantaj tradukoj").br."\n";
    $listo .= a({-href => "/revo/dok/mallongigoj.html"}, "vortaraj mallongigoj").br."\n";
    $listo .= a({-href => "/revo/dok/bibliogr.html"}, "bibliografio laŭ mallongigoj").br."\n";
    $listo .= a({-href => "/revo/dok/biblaut.html"}, "bibliografio laŭ aÃ…Â­toroj").br."\n";
    $listo .= a({-href => "/revo/dok/bibltit.html"}, "bibliografio laŭ titoloj").br."\n";
    
    $listo .= h1("redaktado")."\n";
    $listo .= a({-href => "/revo/dok/redinfo.html"}, "fariĝi redaktanto").br."\n";
    $listo .= a({-href => "/revo/dok/revolist.html"}, "dissendolisto").br."\n";
    $listo .= a({-href => "/revo/dok/revoserv.html"}, "redaktoservo").br."\n";
    $listo .= a({-href => "/revo/dok/lingva_manlibro.html"}, "lingva manlibro").br."\n";
    $listo .= a({-href => "/revo/dok/manlibro.html"}, "teĥnika manlibro").br."\n";
    $listo .= a({-href => "/revo/dok/vindoza_manlibro.html"}, "manlibro por Vindozo").br."\n";
    $listo .= a({-href => "/revo/dok/dtd.html"}, "dokumenttipdifino").br."\n";
    $listo .= a({-href => "/revo/dok/ordigo.html"}, "alfabetoj").br."\n";
    $listo .= a({-href => "/revo/dok/fakoj.html"}, "mll. de fakoj").br."\n";
    $listo .= a({-href => "/revo/dok/lingvoj.html"}, "mll. de lingvoj").br."\n";
    $listo .= a({-href => "/revo/dok/stiloj.html"}, "mll. de stiloj").br."\n";
    $listo .= a({-href => "/revo/dok/sxablono.txt"}, "ŝablono").br."\n";
  }
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).$listo) ] );
} elsif ($kat eq "FAK") {
  my $listo;
  if ($subkat) {
    my $fak_nomo;
    my $sth = $dbh->prepare("SELECT kat_nomo FROM r2_kat WHERE kat_tipo = 'FAK' and kat_kat = ?") or die ;
    $sth->execute($subkat);
    ($fak_nomo) = $sth->fetchrow_array;
    $subtitolo = "$fak_nomo";

    my $sth = $dbh->prepare("SELECT ind_teksto, ind_traduko, ind_celref FROM r2_indekso WHERE ind_kat = ? AND ind_subkat = ? ORDER BY ind_ord") or die;
    $sth->execute('FTZ', $subkat);
    while (my $ref = $sth->fetchrow_hashref()) {
      $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
      $listo .= h2("ĉefaj nocioj")."<p>" unless $listo;
      $listo .= $ref->{ind_traduko}.a({-href => "/revo/$ref->{ind_celref}", -style => "font-weight: bold"}, $ref->{ind_teksto} ).br."\n";
    }
    $listo .= "</p>".h2("nocioj alfabete");
    $sth->execute('FAK', $subkat);
    my $l;
    while (my $ref = $sth->fetchrow_hashref()) {
      $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
      $l .= $ref->{ind_traduko}.a({-href => "/revo/$ref->{ind_celref}", -target => "precipa"}, $ref->{ind_teksto}).br."\n";
    }
    $listo .= $l if $l;
  } else {
    $subtitolo = "fakindeksoj";
    my $sth = $dbh->prepare("SELECT k.kat_kat, k.kat_nomo FROM r2_kat k WHERE k.kat_tipo = 'FAK' order by 2") or die ;
    $sth->execute();
    while (my $ref = $sth->fetchrow_hashref()) {
      $listo .= img({src=>"/revo/smb/$ref->{kat_kat}.gif", alt=>$ref->{kat_kat}, align=>"middle"}) ."&nbsp;".a({-href => "?kat=FAK&subkat=$ref->{kat_kat}"}, $ref->{kat_nomo}).br."\n";
    }
  }
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).$listo) ] );
} elsif ($kat eq "BLD") {
  my $listo;
  my $sth = $dbh->prepare("SELECT ind_teksto, ind_traduko, ind_celref FROM r2_indekso WHERE ind_kat = ? ORDER BY ind_ord, ind_subord") or die;
  $sth->execute('BLD');
#  $listo .= h2("bildoj").br;
  while (my $ref = $sth->fetchrow_hashref()) {
#    $ref->{ind_celref} =~ s/([^-.\/_#A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
    $listo .= dt(a({-href => "/revo/$ref->{ind_celref}", -target => "precipa" }, $ref->{ind_teksto} )).dd($ref->{ind_traduko})."\n";
  }
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).dl($listo)) ] );
} elsif ($kat eq "MLG") {
  my $listo;
  my $sth = $dbh->prepare("SELECT ind_teksto, ind_traduko, ind_celref FROM r2_indekso WHERE ind_kat = ? ORDER BY ind_ord, ind_subord") or die;
  $sth->execute('MLG');
  while (my $ref = $sth->fetchrow_hashref()) {
    $listo .= dt(b(a({-href => "/revo/$ref->{ind_celref}", -target => "precipa" }, $ref->{ind_teksto} ))).dd($ref->{ind_traduko})."\n";
  }
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).dl($listo)) ] );
} elsif ($kat eq "NOV") {
  my $listo;
  my $sth = $dbh->prepare("SELECT ind_kapvorto, ind_teksto, ind_trdgrp, ind_celref FROM r2_indekso WHERE ind_teksto > DATE_SUB(CURDATE(), INTERVAL 11 DAY) and ind_kat = 'NOV' order by ind_teksto desc, ind_kapvorto") or die;
  $sth->execute();
  while (my $ref = $sth->fetchrow_hashref()) {
    $listo .= dt(a({-href => "/revo/$ref->{ind_celref}", -target => "precipa" }, b($ref->{ind_kapvorto}))." ".span({class=>'dato'}).$ref->{ind_teksto}).dd("de $ref->{ind_trdgrp}")."\n";
  }
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).dl($listo)) ] );
} elsif ($kat eq "SXA") {
  my ($listo, $enhavo, $last_trdgrp);
  my $sth = $dbh->prepare("SELECT ind_kapvorto, ind_teksto, ind_trdgrp, ind_traduko, ind_celref FROM r2_indekso WHERE ind_teksto > DATE_SUB(CURDATE(), INTERVAL 16 DAY) and (ind_kat = 'SXA' or ind_kat = 'NOV') order by ind_trdgrp, ind_teksto desc, ind_kapvorto") or die;
  $sth->execute();
  while (my $ref = $sth->fetchrow_hashref()) {
    if ($last_trdgrp ne $ref->{ind_trdgrp}) {
      $listo .= "</dl>" if $last_trdgrp;
      my $mrk = $ref->{ind_trdgrp};
      $mrk =~ s/ /_/g;
      $enhavo .= li(a({href=>"#$mrk"}, $ref->{ind_trdgrp}));
      $listo .= hr.a({name=>$mrk},"").h2($ref->{ind_trdgrp})."<dl>";
    }
    $listo .= dt(a({-href => "/revo/$ref->{ind_celref}", -target => "precipa" }, b($ref->{ind_kapvorto} ))." ".span({class=>'dato'}, $ref->{ind_teksto})).dd($ref->{ind_traduko})."\n";
    $last_trdgrp = $ref->{ind_trdgrp};
  }
  $listo .= "</dl>";
  $html .= Tr( [ td( {-class => "enhavo", -colspan => 4}, h1($subtitolo).ul($enhavo).$listo) ] );
} 

$html .= end_table();

$html .= end_html();

print pre("fname=$fname");
if ($fname) {
  $fname = "/var/www/web277/html$fname";
  open OUT, ">", $fname or die "open $fname";
  print OUT $html;
  close OUT;
}
return $html;
}

my @idoj;
if (0) {
my $html = indeks('LNG', 'eo', "b");
print $html;
} else {
print start_html.h2("test");

#indeks('LNG', 'eo', "", \@idoj);
#print pre("idoj LNG, eo:\n".(join "\n", map {"kat=$_->{kat}, subkat=$_->{subkat}, kap=$_->{kap}, dato=$_->{dato}, fname=$_->{fname}, mtime=$_->{mtime}"} @idoj)."\n");

#my @idoj2;
#@idoj = ();
#indeks('LNG', "", "", \@idoj);
#print pre("idoj LNG:\n".(join "\n", map {"kat=$_->{kat}, subkat=$_->{subkat}, kap=$_->{kap}, dato=$_->{dato}, fname=$_->{fname}, mtime=$_->{mtime}"} @idoj)."\n");
#foreach (@idoj) {
#  indeks($_->{kat}, $_->{subkat}, $_->{kap}, \@idoj2);
#}

if (0) {
indeks('LNG', 'eo', "");
indeks('LNG', '', "");
my $sth = $dbh->prepare("SELECT ind_kaplit, max(ind_dato), ind_subkat ind_dato FROM r2_indekso WHERE ind_kaplit <> ' ' and ind_kat = ? GROUP BY ind_kaplit, ind_subkat ORDER BY ind_subkat, ind_kaplit") or die;
$sth->execute("LNG");
while (my $ref = $sth->fetchrow_arrayref()) {
  my ($utf, $name) = $sorter->ord2utf8($ref->[2], $ref->[0]);
  my $url = ligo('LNG', $ref->[2], $name);
  print pre("lit = $ref->[0], subkat = $ref->[2], dato=$ref->[1], utf = $utf, name = $name, url=$url\n");
  indeks('LNG', $ref->[2], $name);
}
} else {
#  indeks('LNG', 'de', "u");
  indeks('LNG', 'be', "a");
}

print pre("dauxro: ".(time - $^T)." sekundoj");	# cxiam estas bone, scii kiom longe dauxris
print end_html;
}

$dbh->disconnect() or die "DB disconnect ne funkcias";

1;
