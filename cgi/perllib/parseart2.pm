#!/usr/bin/perl

#
# parseart2.pm
# 
# 2008-03-24 Wieland Pusch
#

use strict;


package parseart2;

use DBI();
use CGI qw(:standard);
use IPC::Open3;
use revodb;
use revo::eosort;
use Encode;
use DateTime;

my $enc = "utf-8";

######################################################################
sub trunc {
  my $dbh = shift @_;

  $dbh->do("TRUNCATE TABLE r2_indekso") or die "truncate r2_indekso ne funkciis";
  $dbh->do("TRUNCATE TABLE r2_stat") or die "truncate r2_stat ne funkciis";
  $dbh->do("TRUNCATE TABLE r2_stlng") or die "truncate r2_stlng ne funkciis";
  $dbh->do("TRUNCATE TABLE r2_tezauro") or die "truncate r2_tezauro ne funkciis";
}

######################################################################
sub connect {
  # Connect to the database.
  return revodb::connect();
}

######################################################################
sub parse {
  my $dbh = shift @_;
  my $art = shift @_;
  my $xmldir = shift @_;
  my $verbose = shift @_;
  my @art;
  my $art_count;
  my $start_time = time();
  my $sorter = new revo::eosort();

  my $xsldir = $xmldir;
  $xsldir =~ s/xml/xsl/;

  my $homedir = $xmldir;
  $homedir =~ s#/html/revo/xml##;

  my $cvsdir = "$homedir/files/CVS";

  while (<$xmldir/$art.xml>) {
    s/$xmldir\/([^\/]+)\.xml$/\1/;
    push @art, $_;
  }
  $art_count = $#art + 1;
#  print pre("Anzahl: $art_count\n");

  if ($verbose == 2 && $art_count > 1) {
    $verbose = 0;
  }

  my $count;
  my $qry_mod = $dbh->prepare('SELECT now() - date_add(ind_dato, INTERVAL ? * 24 * 3600 SECOND) FROM r2_indekso WHERE ind_kapvorto = ? limit 0,1') or die "parse qry_mod";
  my $prgsxangxo = -M "$homedir/files/perllib/parseart2.info";

  $ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin" unless $ENV{'PATH'} =~ m#:$homedir/files/bin$#;

  while (my $art = shift @art) {
    # Kie mi trovas la XML-arkivon
    my $pado = "$xmldir/$art.xml";
    my $minsxangxo = -M $pado;
    $minsxangxo = $prgsxangxo if $prgsxangxo < $minsxangxo;
    print h2("pado = $pado M=$minsxangxo art=$art") if $verbose;
#    print h2("xsl = $xsldir/inx_kategorioj.xsl") if $verbose;
    $qry_mod->execute($minsxangxo, $art) or die "execute qry_mod";
    my ($dbmod) = $qry_mod->fetchrow_array();
    print h2("dbmod = $dbmod") if $verbose;
    next if $dbmod < 0;
    last if time - $^T >= 300;
    $count++;

    my $ret;
    my $eltiro = `xalan -XSL $xsldir/inx_eltiro.xsl <$pado`;
#    print pre(escapeHTML("eltiro:\n$eltiro\n\n")) if $verbose;
    my $pid = IPC::Open3::open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR,
		    "xalan -XSL $xsldir/inx_kategorioj.xsl");
#    print "cvs pid = $pid\n";
    print CHLD_IN $eltiro;
    close CHLD_IN;
    $_ = join('',<CHLD_OUT>);
    close CHLD_OUT;
    my $err = join('', <CHLD_ERR>);
#    print "err=$err\n";
    close CHLD_ERR;

    $_ = Encode::decode($enc, $_);

#    print pre(escapeHTML("co:\n$_\nend co.\n")) if $verbose;

    s/^<\?xml version="1.0" encoding="utf-8"\?>\s*<indekso>\s*//sm;
    s/<\/indekso>\s*$//sm;

    $dbh->do("DELETE FROM r2_indekso WHERE ind_kapvorto = ?", undef, $art) or die "delete indekso ne funkciis";
    $dbh->do("DELETE FROM r2_stat WHERE sta_kapvorto = ?", undef, $art) or die "delete stat ne funkciis";
    $dbh->do("DELETE FROM r2_stlng WHERE stl_kapvorto = ?", undef, $art) or die "delete stlng ne funkciis";

    ######### Kapvortoj #############
    while (m/<kap-oj lng="(.*?)">(.*?)<\/kap-oj>\s*/smg) {
      my ($lng, $kapoj) = ($1, $2);
#      print pre(escapeHTML("kap-oj lng=$lng, kapoj=$kapoj\n"));
      s///;

      $kapoj =~ s/\s*<tez\/>\s*//sm;		# was soll ich damit machen?

      if ($kapoj =~ s/<tez>\s*<v mrk="(.*?)">\s*(.*?)<\/v>\s*<\/tez>//smg) {
        my ($mrk, $v) = ($1, $2);
        $mrk =~ tr/./_/;
#        print pre("tez: $mrk, $v\n");
        my ($kap_ci) = $sorter->remap_ci_lng('eo', $v);
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $v, undef, 'LNG', 'eo', "tez/tz_$mrk.html", $kap_ci, ' ', undef) or die "insert ne funkciis";
      }

      while ($kapoj =~ m/<v mrk="(.*?)">\s*(?:<r>(.*?)<\/r>)?\s*<k>(.*?)<\/k>\s*(?:<k1>(.*?)<\/k1>)?(.*?)<\/v>\s*([^<]*)/smg) {
        my ($mrk, $rev, $k, $k1, $v, $poste) = ($1, $2, $3, $4, $5, $6);
        $kapoj =~ s///;
        $k =~ s/[ ,]+$//;  # Bugfix por VAR
        $v =~ s/[\n]+$//;
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
#        print pre(escapeHTML("v art=$art, mrk=$mrk, rev=$rev, k=$k, k1=$k1, v=$v, poste=$poste\n"));
#        print pre(escapeHTML("k=$k\n"));
        my ($kap_ci, $unua) = $sorter->remap_ci_lng('eo', $k);
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $k, undef, 'LNG', 'eo', "art/$art.html$mrk", $kap_ci, $unua, undef) or die "insert ne funkciis";
        if ($rev) {
#          print pre(escapeHTML("rev=$rev\n"));
          my ($kap_ci, $unua) = $sorter->remap_ci_lng('eo', $rev);
          $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $k1, undef, 'INV', 'eo', "art/$art.html", $kap_ci, $unua, undef) or die "insert ne funkciis";
        }
      }
      print pre(escapeHTML("resto kapoj $art = $kapoj\n")) if $kapoj =~ /\S/;
    }


    ######### Fakoj #############
    while (m/<fako fak="(.*?)" n="(.*?)">(.*?)<\/fako>\s*/smg) {
      my ($fak, $fak_n, $fako) = ($1, $2, $3);
#      print pre(escapeHTML("fako fak=$fak, n=$fak_n, fako=$fako\n"));
      s///;
    
      $fako =~ s/\s*<tez\/>\s*//sm;		# was soll ich damit machen?
    
      while ($fako =~ m/<tez>\s*<v mrk="(.*?)">\s*(.*?)<\/v>\s*<\/tez>\s*/smg) {
        my ($mrk, $v) = ($1, $2);
        $fako =~ s///;
        $mrk =~ tr/./_/;
#        print pre(escapeHTML("faktez mrk=$mrk v=$v\n"));
        my ($kap_ci, $unua) = $sorter->remap_ci_lng('eo', $v);
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $v, undef, 'FTZ', $fak, "tez/tz_$mrk.html", $kap_ci, $unua, undef) or die "insert ne funkciis";
      }

      while ($fako =~ m/<v mrk="(.*?)">\s*(.*?)<\/v>\s*/smg) {
        my ($mrk, $v) = ($1, $2);
        $fako =~ s///;
        $v =~ s/[ ,]+$//;  # Bugfix por VAR
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
#        print pre(escapeHTML("v mrk=$mrk v=$v\n"));
        my ($kap_ci, $unua) = $sorter->remap_ci_lng('eo', $v);
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $v, undef, 'FAK', $fak, "art/$art.html$mrk", $kap_ci, $unua, undef) or die "insert ne funkciis";
      }
      print pre(escapeHTML("resto fako $art = $fako\n")) if $fako =~ /\S/;
    }

    ######### Tradukoj #############
    s/<trd-snc p=".*?"\/>\s*//;

    while (m/<trd-oj lng="(.*?)" n="(.*?)" p="(.*?)">(.*?)<\/trd-oj>\s*/smg) {
      my ($lng, $trd_n, $trd_p, $trdoj) = ($1, $2, $3, $4);
#      print pre(escapeHTML("trdoj lng=$lng, n=$trd_n, p=$trd_p, trdoj=$trdoj\n"));
      s///;

      $dbh->do("INSERT INTO r2_stlng (stl_kapvorto, stl_lng, stl_n, stl_p) VALUES (?,?,?,?)",
		 undef, $art, $lng, $trd_n, $trd_p) or die "insert ne funkciis";

      while ($trdoj =~ m/<v mrk="(.*?)">\s*(?:<t>(.*?)<\/t>)?\s*(?:<t1>(.*?)<\/t1>)?\s*<k>(.*?)<\/k>(.*?)<\/v>\s*/smg) {
        my ($mrk, $t, $t1, $k, $v) = ($1, $2, $3, $4, $5);
        $trdoj =~ s///;
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
        $k =~ s/[ ,]+$//;  # Bugfix por VARiantoj
        $t1 =~ s/[\n]+$//;
#        print pre(escapeHTML("v mrk=$mrk t=$t t1=$t1 k=$k v=$v\n"));
        my $t2 = $t;
        my $trdgrp;
        $t2 =~ s/['[(\/].*$//;
        $trdgrp = $t unless $t1 or $t2 eq $t;
        $t2 =~ s/[-]//g;
        $t1 = $t unless $t1 or $t2 eq $t;
#        print pre(escapeHTML("v mrk=$mrk t=$t t1=$t1 t2=$t2 k=$k v=$v\n"));
        my ($kap_ci, $unua) = $sorter->remap_ci_lng($lng, $t2);
        my ($sub_ci) = $sorter->remap_ci_lng($lng, $t1);
        my ($ord2_ci) = $sorter->remap_ci_lng('eo', $k);
        ($t, $t1) = ($t1, $t) if $t1;
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_trdgrp, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord, ind_ord2) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
		 undef, $art, $k, $t, $trdgrp, 'LNG', $lng, "art/$art.html$mrk", $kap_ci, $unua, $sub_ci, $ord2_ci) or die "insert ne funkciis";
      }
      print pre(escapeHTML("resto trdoj $art = $trdoj\n")) if $trdoj =~ /\S/;
    }

    ######### Mankantaj tradukoj #############
    while (m/<mankoj lng="([^"]+)"\/>\s*/smg) {		# se ne mankas tradukoj, faru nenion
#      my ($lng) = ($1);
      s///;
    }

    while (m/<mankoj lng="([^"]+)">\s*(.*?)<\/mankoj>/smg) {
      my ($lng, $mankoj) = ($1, $2);
      s///;

      while ($mankoj =~ m/<v mrk="(.*?)"(?: n="(.*?)")?>\s*(.*?)<\/v>\s*/smg) {
        my ($mrk, $mnk_n, $v) = ($1, $2, $3);
        $mankoj =~ s///;
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
        my ($kap_ci, $unua) = $sorter->remap_ci_lng($lng, $v);
#        print pre(escapeHTML("v mrk=$mrk mnk_n=$mnk_n, lng=$lng, v=$v, kap_ci=$kap_ci\n"));
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_kaplit, ind_subord) VALUES (?,?,?,?,?,?,?,?,?)",
		 undef, $art, $v, undef, 'MLN', $lng, "art/$art.html$mrk", $kap_ci, $unua, undef) or die "insert ne funkciis";
      }
      print pre(escapeHTML("resto mankoj $art = $mankoj\n")) if $mankoj =~ /\S/;
    }

    ######### Bildoj     ###########
    while (m/<bld-oj>(.*?)<\/bld-oj>\s*/smg) {
      my ($bldoj) = ($1);
#      print pre(escapeHTML("bld-oj bldoj=$bldoj\n"));
      s///;

      while ($bldoj =~ m/<v mrk="(.*?)">\s*(?:<t\/>)?(?:<t>\s*(.*?)<\/t>)?\s*<k>(.*?)<\/k>\s*(.*?)<\/v>\s*/smg) {
        my ($mrk, $t, $k, $v) = ($1, $2, $3, $4, $5);
        $bldoj =~ s///;
        $t =~ s/(\S)\s+$/\1/;
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
        my ($kap_ci) = $sorter->remap_ci_lng('eo', $k);
        my ($t_ci) = $sorter->remap_ci_lng('eo', $t);
#        print pre(escapeHTML("v mrk=$mrk t=$t k=$k v=$v\n"));
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_subord) VALUES (?,?,?,?,?,?,?,?)",
		 undef, $art, $k, $t, 'BLD', 'BLD', "art/$art.html$mrk", $kap_ci, $t_ci) or die "insert ne funkciis";
      }
      print pre(escapeHTML("resto bldoj $art = $bldoj\n")) if $bldoj =~ /\S/;
    }

    ######### Malongigoj ###########
    while (m/<mlg-oj>(.*?)<\/mlg-oj>\s*/smg) {
      my ($mlgoj) = ($1);
#      print pre(escapeHTML("mlg-oj mlgoj=$mlgoj\n"));
      s///;

      while ($mlgoj =~ m/<v mrk="(.*?)">\s*<t>\s*(.*?)<\/t>\s*<k>(.*?)<\/k>\s*(.*?)<\/v>\s*/smg) {
        my ($mrk, $t, $k, $v) = ($1, $2, $3, $4, $5);
        $mlgoj =~ s///;
        $t =~ s/(\S)\s+$/\1/;
        if ($mrk eq $art) {
          $mrk = "";
        } else {
          $mrk = "#$mrk";
        }
        my ($kap_ci) = $sorter->remap_ci_lng('eo', $k);
        my ($t_ci) = $sorter->remap_ci_lng('eo', $t);
#        print pre(escapeHTML("v mrk=$mrk t=$t k=$k v=$v\n"));
        $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_kat, ind_subkat, ind_celref, ind_ord, ind_subord) VALUES (?,?,?,?,?,?,?,?)",
		 undef, $art, $t, $k, 'MLG', 'MLG', "art/$art.html$mrk", $t_ci, $kap_ci) or die "insert ne funkciis";
      }
      print pre(escapeHTML("resto mlgoj $art = $mlgoj\n")) if $mlgoj =~ /\S/;
    }

    ######### Statistiko ###########
    if (s/<stat>\s*<ero t="artikoloj" n="1"\/>\s*<ero t="deriva.oj" n="(.*?)"\/>\s*<ero t="sencoj" n="(.*?)"\/>\s*<ero t="bildoj" n="(.*?)"\/>\s*<ero t="mallongigoj" n="(.*?)"\/>\s*<\/stat>\s*//sm) {
      my ($drv, $snc, $bld, $mlg) = ($1, $2, $3, $4);
#      print pre(escapeHTML("stat drv=$drv, snc=$snc, bld=$bld, mlg=$mlg\n"));
      $dbh->do("INSERT INTO r2_stat (sta_kapvorto, sta_drv, sta_snc, sta_bld, sta_mlg) VALUES (?,?,?,?,?)",
		 undef, $art, $drv, $snc, $bld, $mlg) or die "insert ne funkciis";
    }

    print pre(escapeHTML("resto $art = \n$_\nEOD")) if /\S/;


    ######### Tezauro ###############################
    my $pid = IPC::Open3::open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR,
		    "xalan -XSL $xsldir/tez_retigo.xsl");
#    print "cvs pid = $pid\n";
    print CHLD_IN $eltiro;
    close CHLD_IN;
    $_ = join('',<CHLD_OUT>);
    close CHLD_OUT;
    my $err = join('', <CHLD_ERR>);
#    print "err=$err\n";
    close CHLD_ERR;

    $_ = Encode::decode($enc, $_);

    s/^<\?xml version="1.0" encoding="utf-8"\?>\s*<tez>\s*//sm;
    s/<\/tez>\s*$//sm;

    $dbh->do("DELETE FROM r2_tezauro WHERE tez_kapvorto = ?", undef, $art) or die "delete tezauro ne funkciis";

    print pre(escapeHTML("tez:\n$_\nend.\n")) if $verbose;

    ########### unua prilaboro: nodoj ####################
    my %markoj;
    while (m/<nod mrk="([^"]+)"(?:\s+mrk2="([^"]+)")?>\s*(.*?)<\/nod>/smg) {
      my ($mrk, $mrk2, $nod) = ($1, $2, $3);
      if (!$mrk2 and $mrk =~ m/^(.*)\.[A-Z]+$/) {
        $mrk2 = $1 unless $markoj{$1};
      }
#      print pre(escapeHTML("1nod-oj mrk=$mrk mrk2=$mrk2\n$nod\nEOD\n"));
      my ($k, $k_n);
      if ($nod =~ s/<k(?:\s+n="(.*?)")?>(.*?)<\/k>//smg) {
        ($k, $k_n) = ($2, $1);
#        print pre(escapeHTML("1mrk=$mrk, k=$k, k_n=$k_n"));
        $markoj{$mrk} = [$k, $k_n];
      }
    }

    ########### dua prilaboro: ####################
    ########### nodoj ####################
    while (m/<nod mrk="([^"]+)"(?:\s+mrk2="([^"]+)")?>\s*(.*?)<\/nod>/smg) {
      my ($mrk, $mrk2, $nod) = ($1, $2, $3);
      s///;
#      print pre(escapeHTML("nod-oj mrk=$mrk mrk2=$mrk2\n$nod\nEOD\n"));

      my ($k, $k_n);
      if ($nod =~ s/<k(?:\s+n="(.*?)")?>(.*?)<\/k>//smg) {
        ($k, $k_n) = ($2, $1);
#        print pre(escapeHTML("k=$k, k_n=$k_n"));
      }

      my ($uzo);
      while ($nod =~ m/<uzo>(.*?)<\/uzo>/smg) {
        $nod =~ s///;
        ($uzo) = ($1);
#        print pre(escapeHTML("uzo=$uzo"));

        $dbh->do("INSERT INTO r2_tezauro (tez_kapvorto, tez_fontteksto, tez_fontref, tez_fontn, tez_fako) VALUES (?,?,?,?,?)",
  		  undef, $art, $k, 
		  $mrk, $k_n, $uzo) or die "insert ne funkciis";
        if ($mrk2) {
          $dbh->do("INSERT INTO r2_tezauro (tez_kapvorto, tez_fontteksto, tez_fontref, tez_fontn, tez_fako) VALUES (?,?,?,?,?)",
  	 	    undef, $art, $k, 
		    $mrk2, $k_n, $uzo) or die "insert ne funkciis";
        }
      }

      $nod =~ s/\s*<((?:super)|(?:sub)|(?:dif)|(?:sin)|(?:vid)|(?:ant)|(?:malprt)|(?:prt)|(?:ekz)|(?:lst))\/>\s*//smg;

      while ($nod =~ m/<((?:super)|(?:sub)|(?:dif)|(?:sin)|(?:vid)|(?:ant)|(?:ekz)|(?:lst))>(.*?)\s*<\/\1>\s*/smg) {
		# |(?:malprt)|(?:prt)
        my ($tipo, $resto) = ($1, $2);
#        print pre(escapeHTML("tipo $tipo, $resto"));
        $nod =~ s///;

        while ($resto =~ m/<r c="([^"]+)"\/>\s*/smg) {
          $resto =~ s///;
          my ($celo) = ($1);
          my $celart = $celo;
	  $celart =~ s/\..*$//;
#          my $fako;
#          if ($celo =~ m/\.([A-Z]+)$/) {
#            $fako = $1;
##          } else {
##            $fako = $uzo;
#          }
#          print pre(escapeHTML("tipo=$tipo, celo=$celo, celart=$celart"));

          my ($fontteksto, $fontn);
          if ($markoj{$celo}) {
            ($fontteksto, $fontn) = @{$markoj{$celo}};
            print pre(escapeHTML("celo=$celo, fontteksto=$fontteksto, fontn=$fontn")); 
          } else {
            my $sth = $dbh->prepare("SELECT tez_fontteksto, tez_fontn FROM r2_tezauro where tez_fontref = ? limit 0,1");
            $sth->execute($celo);
            my $ref = $sth->fetchrow_hashref();
#            print "celteksto = $ref->{'tez_fontteksto'}, n = $ref->{'tez_fontn'}\n";
            $fontteksto = $ref->{'tez_fontteksto'};
            $fontn = $ref->{'tez_fontn'};
            unless ($fontteksto) {
              my $sth = $dbh->prepare("SELECT ind_teksto FROM r2_indekso where ind_celref = ? limit 0,1");
              $sth->execute("art/$celart.html#$celo");
              my $ref = $sth->fetchrow_hashref();
#              print "celteksto = ".$ref->{'ind_teksto'}."\n";
              $fontteksto = $ref->{'ind_teksto'};
            }
          }
          $fontteksto = "???" unless $fontteksto;

          $dbh->do("INSERT INTO r2_tezauro (tez_kapvorto, tez_fontteksto, tez_fontref, tez_fontn, tez_celteksto, tez_celref, tez_celn, tez_tipo) VALUES (?,?,?,?,?,?,?,?)",
    		    undef, $art, $k, 
		    $mrk, #"art/$art.html#$mrk", 
		    $k_n, $fontteksto, 
		    $celo, #"art/$celart.html#$celo", 
                    $fontn,
		    $tipo) or die "insert ne funkciis";

          if ($mrk2) {
            $dbh->do("INSERT INTO r2_tezauro (tez_kapvorto, tez_fontteksto, tez_fontref, tez_fontn, tez_celteksto, tez_celref, tez_celn, tez_tipo) VALUES (?,?,?,?,?,?,?,?)",
    		      undef, $art, $k, 
		      $mrk2, #"art/$art.html#$mrk2", 
		      $k_n, $fontteksto, 
		      $celo, #"art/$celart.html#$celo", 
                      $fontn,
		      $tipo) or die "insert ne funkciis";
          }
        }
      }
      $nod =~ s/^[ \n]+//;
      $nod =~ s/[ \n]+$//;
      print pre(escapeHTML("rest nod=$nod\nEOD")) if $nod;
    }

    print h2("PATH=$ENV{'PATH'}") if $verbose;
    print h2("pfad = $pado");
    print h2("homedir=$homedir") if $verbose;
    print h2("cvsdir=$cvsdir") if $verbose;
    print h2("xmldir=$xmldir") if $verbose;

    my $pado = "$cvsdir/$art.xml,v";
    print h2("pfad = $pado") if $verbose;

    # Prenu listo de la versioj
    $ret = `rlog $pado 2>&1`;
    # Forigu ======= cxe la fino
    $ret =~ s/=*$//;
    # ISO->UTF8
    $ret =~ s/\xfd/\xc5\xad/g;  # ux
    $ret =~ s/\xb6/\xc4\xa5/g;  # hx
    # Kreu tabelo kun la unuopaj informoj. La unua estas pri la arkivo. 
    # La aliaj pri la versioj
    my @aret = split /\n----------------------------\n/, $ret;
    # Fojetu la informojn pri la arkivo
    shift @aret;

    my $limdato = DateTime->today()->add(days => -20)->ymd('-');;

    print p("Numero ".@aret." limdato=$limdato") if $verbose;

#    my @a = ("SXA", $aret[0], "NOV", $aret[$#aret]);
    for my $i (0 .. $#aret) {
      my $log = $aret[$i];
      my $tipo = $i == $#aret ? 'NOV' : 'SXA';
      $log =~ s/\n+$//;
      print p("$i. $tipo: $log") if $verbose;
      if ($log =~ m/revision [0-9.]+\ndate: (\d\d\d\d)\/(\d\d)\/(\d\d) (\d\d):(\d\d):(\d\d);.*\n([^:]*):?(.*?)$/) {
        my ($j, $m, $t, $h, $mi, $s, $autoro, $teksto) = ($1, $2, $3, $4, $5, $6, $7, $8);
        $teksto =~ s/^ +//;
        my $dato = "$j-$m-$t";
        print pre("$tipo: $log dato=$dato $h:$mi:$s autoro=$autoro teksto=$teksto") if $verbose;
        if ($dato >= $limdato) {
          $dbh->do("INSERT INTO r2_indekso (ind_kapvorto, ind_teksto, ind_traduko, ind_trdgrp, ind_kat, ind_subkat, ind_celref) VALUES (?,?,?,?,?,?,?)",
  		   undef, $art, "$j-$m-$t", $teksto, $autoro, $tipo, $tipo, "art/$art.html") or die "insert ne funkciis";
        }
      }
    }
  }


  print h2("Dauxro: ".(time() - $start_time)." sekundoj por $count el $art_count artikoloj.");# if $verbose;
  return $art_count;
}
    
1;

