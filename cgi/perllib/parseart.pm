#!/usr/bin/perl

#
# parseart.pm
# 
# 2006-09-__ Wieland Pusch
#

use strict;


package parseart;

use DBI();
use CGI qw(:standard);
use revodb;
use eosort;
use Encode;

my $enc = "utf-8";

######################################################################
sub trunc {
  my $dbh = shift @_;

  $dbh->do("TRUNCATE TABLE art") or die "truncate art ne funkciis";
  $dbh->do("TRUNCATE TABLE drv") or die "truncate drv ne funkciis";
  $dbh->do("TRUNCATE TABLE var") or die "truncate var ne funkciis";
  $dbh->do("TRUNCATE TABLE snc") or die "truncate snc ne funkciis";
  $dbh->do("TRUNCATE TABLE trd") or die "truncate trd ne funkciis";
  $dbh->do("TRUNCATE TABLE rim") or die "truncate rim ne funkciis";
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
  my $sorter = new eosort();

  my $xsldir = $xmldir;
  $xsldir =~ s/revo\/xml/xsl/;

  #print "<PRE>\n";
  while (<$xmldir/$art.xml>) {
    s/$xmldir\/([^\/]+)\.xml$/\1/;
    push @art, $_;
  #  print "art: $_\n";
  }
  #print "</PRE>\n";
  $art_count = $#art + 1;
#  print pre("Anzahl: $art_count\n");

  if ($verbose == 2 && $art_count > 1) {
    $verbose = 0;
  }

  while (my $art = shift @art) {
    # Kie mi trovas la XML-arkivon
    my $pado = "$xmldir/$art.xml";
    print h2("pado = $pado") if $verbose;
    print h2("xsl = $xsldir/sercho.xsl") if $verbose;

    my $ret;
    $_ = `xalan -XSL $xsldir/sercho.xsl <$pado`;
    $_ = Encode::decode($enc, $_);

    print pre(escapeHTML("co:\n$_\nend co.\n")) if $verbose;

    my ($amrk, $arad, $akap);

    # elprenu la markon
    if (s/^.*<art mrk\="([a-zA-Z0-9]+)">//si) { 
      $amrk = $1; 
      print "marko: $amrk\n" if $verbose;
    } else {
      die "ne trovis markon";  
    }

    # Now retrieve data from the table.
    my $sth = $dbh->prepare("SELECT art_id FROM art WHERE art_amrk = ?");
    $sth->execute($amrk);
    my $ref = $sth->fetchrow_hashref();
    my $aid = $ref->{'art_id'};
    $sth->finish();

    print "aid = $aid\n" if $verbose;
  
    if ($aid) {
      print "delete\n" if $verbose;
      print h2("Dauxro: ".(time() - $start_time)." sekundoj por $art_count artikoloj.") if $verbose;
      $dbh->do("DELETE FROM art WHERE art_id = ?", undef, $aid) or die "delete ne funkciis";
      print h2("Dauxro delete art: ".(time() - $start_time)." sekundoj.") if $verbose;

      $dbh->do("DELETE FROM rim WHERE rim_art_id = ?", undef, $aid) or die "delete rim ne funkciis";
      print h2("Dauxro delete rim: ".(time() - $start_time)." sekundoj.") if $verbose;

      $sth = $dbh->prepare("SELECT drv_id FROM drv WHERE drv_art_id = ?");
      $sth->execute($aid);
      my @did;
      while (my $ref = $sth->fetchrow_hashref()) {
        print "did = ".$ref->{'drv_id'}."\n" if $verbose;
        push @did, $ref->{'drv_id'};
      }
      $sth->finish();
      print h2("Dauxro select drv: ".(time() - $start_time)." sekundoj por $art_count artikoloj.") if $verbose;

      my @sid;
      foreach (@did) {
        $dbh->do("DELETE FROM drv WHERE drv_id = ?", undef, $_) or die "delete drv ne funkciis";
        $dbh->do("DELETE FROM var WHERE var_drv_id = ?", undef, $_) or die "delete var ne funkciis";
        $sth = $dbh->prepare("SELECT snc_id FROM snc WHERE snc_drv_id = ?");
        $sth->execute($_);
        while (my $ref = $sth->fetchrow_hashref()) {
          print "sid = ".$ref->{'snc_id'}."\n" if $verbose;
          push @sid, $ref->{'snc_id'};
        }
        $sth->finish();
      }
      print h2("Dauxro delete drv: ".(time() - $start_time)." sekundoj por $#did drv.") if $verbose;

      foreach (@sid) {
        $dbh->do("DELETE FROM snc WHERE snc_id = ?", undef, $_) or die "delete ne funkciis";
      }
      print h2("Dauxro delete snc: ".(time() - $start_time)." sekundoj por $#sid snc.") if $verbose;

      foreach (@sid) {
        $dbh->do("DELETE FROM trd WHERE trd_snc_id = ?", undef, $_) or die "delete ne funkciis";
      }
      print h2("Dauxro delete trd: ".(time() - $start_time)." sekundoj por $#sid snc.") if $verbose;
    }
  
    # forigu cxion post la artikolo
    if (s/<\/art>.*//si) { 
    } else {
      print "ne trovis finon de artikolo\n";
    }
    
    print pre(escapeHTML("parse kap:\n$_")) if $verbose;
    # legu la kapvorton
    if (s/\s*<kap[^>]*>(.*?)\n*\s*<\/kap\s*>//si) { 
      $arad = $1;
      $arad =~ s/<ofc>(.*)<\/ofc>//sg;
      $arad =~ s/<fnt>(.*)<\/fnt>//sg;
      $akap = $arad;
      $arad =~ s/.*<rad>(.*)<\/rad>.*/\1/sg;
      $arad =~ s/<[^<]*>//sg;
      $arad =~ s/\s+Z?$//;
      $arad =~ s/\s+/ /sg;
      $arad =~ s/^\s+//;
      $arad =~ s/^\n+//;
      $akap =~ s/<[^<]*>//sg;
      $akap =~ s/\s+Z?$//;
      $akap =~ s/\s+/ /sg;
      $akap =~ s/^\s+//;
      $akap =~ s/\///;
      $akap =~ s/^\n+//;
      print pre("rad: $arad\n") if $verbose;
      print pre("kap: $akap\n") if $verbose;
    };

    $dbh->do("INSERT INTO art (art_id, art_amrk, art_ts, art_kap) VALUES (?,?,sysdate(),?)", undef, $aid, $amrk, $akap) or die "insert ne funkciis";
    $aid = $dbh->{'mysql_insertid'} unless defined($aid);
    print "aid = $aid\n" if $verbose;

    # tildojn anstataýigu per la radiko
#      print pre(escapeHTML("lit:\n$_\n"));# if $verbose;
    { my $subst_arad = substr($arad,1);   # anstatauxigu unuan literon
      s/<tld lit="([^"]+)"\/?>/\1$subst_arad/sig;
      s/<tld[^>]*\/?>/$arad/sig;
      print pre(escapeHTML("lit:\n$_\n")) if $verbose;
    }

    # traktu snc sen drv, kiel drv kun kap el art
    if (/^(.*?)<drv/si) {
      my $predrv = $1;
      print pre(escapeHTML("predrv:\n$predrv\nend predrv.\n")) if $verbose;
      if ($predrv =~ /<snc/) {
        s/^(.*?)(<drv)/<drv mrk="$amrk"><kap>$arad<\/kap>\1<\/drv>\2/si;
      }
    }

    # forigu ekzemploj gxis kiam mi bone traktas ili
    {
      my $nova_drv;
      while (s/<ekz>\s*(.*?)\s*<\/ekz>//si) {
        my $ekz = $1;
        print pre(escapeHTML("ekz: $1")) if $verbose;
        while ($ekz =~ s/\s*<ind>(.*?)<\/ind>//si) { 
          my $ind = $1;
          $nova_drv .= "<drv mrk=\"\"><kap>$ind</kap>";
          print pre(escapeHTML("ind: $ind")) if $verbose;
          while ($ekz =~ s/\s*<trd\s+lng="([^"]+)"\s*>(.*?)<\/trd>//si) { 
            print pre(escapeHTML("ind = $ind lng = $1 trd = $2")) if $verbose;
            print pre(escapeHTML("rest = $ekz")) if $verbose;
	    $nova_drv .= "<trd lng=\"$1\">$2</trd>";
          }          
          $nova_drv .= "</drv>";
        }
      }
      print pre(escapeHTML("nova drv:\n$nova_drv")) if $verbose;
#      $_ = $nova_drv . $_;

#      foreach (@ekz) {
#          my $ind = $1;
#          $_ = substr $_, length($&);
##          print pre(escapeHTML("ind: $ind len=".length($ind))) if $verbose;
##          print pre(escapeHTML("rest: $_")) if $verbose;
#          while (/^\s*<trd\s+lng="([^"]+)"\s*>(.*?)<\/trd>/si) { 
#            print pre(escapeHTML("ind = $ind lng = $1 trd = $2")) if $verbose;
#	    $nova_drv .= "<trd lng=\"$1\">$2</trd>";
##            print pre(escapeHTML("*: $& len=".length($&))) if $verbose;
#            $_ = substr $_, length($&);
##            print pre(escapeHTML("rest: $_")) if $verbose;
#          }
#          $nova_drv .= "</drv>";
#        }
#      }
#      print pre(escapeHTML("nova drv:\n$nova_drv")) if $verbose;
#      $_ = $nova_drv . $_;
    }

    print pre(escapeHTML("parse drv:\n$_")) if $verbose;
    while (/<drv\s+mrk="([^"]+)"\s*>\n*(.*?)<\/drv\s*>\n*/sig) {
      my $mrk = $1;
      my $drv = $2;
      my $kap;
  
      print pre(escapeHTML("drv $mrk:\n$drv")) if $verbose;
      if ($drv =~ s/\s*<kap[^>]*>(.*?)\n*\s*<\/kap\s*>\s*\n*//si) {
        $kap = $1;
        $kap =~ s/<ofc>(.*)<\/ofc>//sg;
        $kap =~ s/<var>//g;
        $kap =~ s/<kap>//g;
        $kap =~ s/[\t\n]+/ /g;
        $kap =~ s/ +/ /g;
        $kap =~ s/^ //;
        $kap =~ s/ $//;
        $kap =~ s/ ,/,/g;
        print pre("kap: $kap.")."\n" if $verbose;
      }

      my $fak;
      my $stl;
      # legu la uzo indikon
      {
        my %fak;
        my %stl;
        while ($drv =~ s/\s*<uzo\s+tip="([^"]*)">(.*?)\n*\s*<\/uzo\s*>//si) { 
          print pre("uzo: $1 = $2") if $verbose;
          $fak{$2} = 1 if $1 eq "fak";
          $stl{$2} = 1 if $1 eq "stl";
        }
        $fak = "_".join("_", keys %fak)."_";
        $stl = "_".join("_", keys %stl)."_";
      }
      $fak = undef if $fak eq "__";
      $stl = undef if $stl eq "__";

      print pre("fak = $fak") if $verbose;
      print pre("stl = $stl") if $verbose;

      my @var;
      my $var_org = $kap;
      if ($kap =~ /, / or $kap =~ /\(/) {
        @var = split / *, +/, $kap;
        my $offset = 0;
        foreach (@var) {
          if (/\(([^,]+)\)/) {
             if ($` or $') {
              print "prekrampoj = $`\n" if $verbose;
              print "krampoj = $1\n" if $verbose;
              print "postkrampoj = $'\n" if $verbose;
              splice (@var, $offset, 1, ("$`$1$'", "$`$'"));
              $offset++;
            }
          }
          $offset++;
        }
        $kap = shift @var;
        print pre("kap: $kap.")."\n" if $verbose;
        print pre("var: ".join(",", @var))."\n" if $verbose;
      }
    
      my $kap_ci = $sorter->remap_ci($kap);

      $dbh->do("INSERT INTO drv (drv_art_id, drv_mrk, drv_teksto, drv_teksto_ci, drv_fak, drv_stl) VALUES (?,?,?,?,?,?)", undef, $aid, $mrk, $kap, $kap_ci, $fak, $stl) or die "insert ne funkciis";
      my $did = $dbh->{'mysql_insertid'};
      print "did = $did\n" if $verbose;

      foreach (@var) {
        my $kap_ci = $sorter->remap_ci($_);
        print pre("insert var $_, $kap_ci")."\n" if $verbose;
        $dbh->do("INSERT INTO var (var_drv_id, var_teksto, var_teksto_ci, var_org) VALUES (?,?,?,?)",
		undef, $did, $_, $kap_ci, $var_org) or die "insert var ne funkciis";
      }
    
      my $snccnt = 1;
      while ($drv =~ s/<snc(?:\s+mrk="([^"]+)"\s*)?>(.*?)<\/snc\s*>\n*//si) {
        print pre(escapeHTML("snc $snccnt:\n$2")) if $verbose;
        do_snc($dbh, $sorter, $did, $1, $snccnt++, $2, $verbose);
      };
      while ($drv =~ s/<snc(?:\s+mrk="([^"]+)"\s*)?\/>\n*//si) {
        print pre(escapeHTML("snc $snccnt :\n$2")) if $verbose;
        do_snc($dbh, $sorter, $did, $1, $snccnt++, "", $verbose);
      };
      print pre(escapeHTML("snc:\n$drv")) if $verbose;
      do_snc($dbh, $sorter, $did, "", undef, $drv, $verbose);
    };
	
	{
	  open IN, "<", $pado;
	  my $xml = join('', <IN>);
	  close IN;
#      print pre(escapeHTML("xml:\n$xml")) if $verbose;
      while ($xml =~ /<rim\s+mrk="([^"]+)"/sgi) {
	    print pre("rim mrk=$1")."\n";
        $dbh->do("INSERT INTO rim (rim_art_id, rim_mrk) VALUES (?,?)",
		undef, $aid, $1) or die "insert rim ne funkciis";
	  }
	}
    
    #print "$_";
    
    #print pre(escapeHTML($_));
  }
  print h2("Dauxro: ".(time() - $start_time)." sekundoj por $art_count artikoloj.") if $verbose;
  return $art_count;
}
    
######################################################################
sub do_snc {
  my ($dbh, $sorter, $did, $smrk, $snccnt, $snc, $verbose) = @_;

#  print "$arad, $kap, $mrk, $lng - $trd\n";
#  print "snc $snccnt: $smrk -> $snc\n";

  $dbh->do("INSERT INTO snc (snc_drv_id, snc_mrk, snc_numero) VALUES (?,?,?)", undef, $did, $smrk, $snccnt) or die "insert ne funkciis";
  my $sid = $dbh->{'mysql_insertid'};
  print "sid = $sid, smrk = $smrk\n" if $verbose;

  while ($snc =~ /<trd\s+lng="([^"]+)"\s*>(.*?)<\/trd\s*>/sig) {
    my ($lng, $trd) = ($1, $2);

    if ($trd =~ / *\[([^,]+)\]/) {
      if ($`) {
        print "prekrampoj = $`\n" if $verbose;
        print "krampoj = $1\n" if $verbose;
        print "postkrampoj = $'\n" if $verbose;
        do_trd($dbh, $sorter, $sid, $lng, $`, $verbose);
      }
      do_trd($dbh, $sorter, $sid, $lng, $1, $verbose);
    } else {
      do_trd($dbh, $sorter, $sid, $lng, $trd, $verbose);
    }
  };
#  while ($snc =~ /<trdgrp\s+lng="([^"]+)"\s*>(.*?)<\/trdgrp\s*>/sig) {
#    my $lng = $1;
#    my $trd = $2;
#    while ($trd =~ /<trd\s*>(.*?)<\/trd\s*>/sig) {
#      do_trd($dbh, $sorter, $sid, $lng, $1, $verbose);
#    };
#  };
}
######################################################################
sub do_trd {
  my ($dbh, $sorter, $sid, $lng, $trd, $verbose) = @_;
  my $klr;

  print pre(escapeHTML("trd=$trd")) if $verbose;
  if ($trd =~ s/<klr[^>]*>([^<]+)<\/klr>//i) {
    $klr = $1;
    print pre(escapeHTML("klr=$klr")) if $verbose;
  }
  $trd =~ s/<klr[^>]*>//sig;
  $trd =~ s/<\/klr>//sig;
  $trd =~ s/\n+/ /g;
  $trd =~ s/ +/ /g;
  $trd =~ s/^ //;
  $trd =~ s/ $//;

  $trd =~ s/<\/ind>//;
  my $trd_ind;
  if ($trd =~ /^(.*)<ind>(.*)$/) {
    $trd = "$1$2";
    $trd_ind = "$2$1";
  }

  my $trd_ci = $sorter->remap_ci($trd);
  print pre(escapeHTML("trd_ci=$trd_ci")) if $verbose;
  $dbh->do("INSERT INTO trd (trd_snc_id, trd_lng, trd_teksto, trd_teksto_ci, trd_ind, trd_klr) VALUES (?,?,?,?,?,?)", undef, $sid, $lng, $trd, $trd_ci, $trd_ind, $klr) or die "insert ne funkciis";
  my $tid = $dbh->{'mysql_insertid'};
  print "tid = $tid\n" if $verbose;
}
######################################################################

1;

