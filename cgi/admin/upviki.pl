#!/usr/bin/perl

#use strict;
use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use IO::Handle;
#use Unicode::String qw(utf8);

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");

use revodb;

my $exitcode;

print header(-charset=>'utf-8'),
      start_html('aktualigu viki-ligojn'),
	  h2(scalar(localtime));

sub mylc {	# lower case pro esperantaj signoj
  my $a = shift @_;
  $a =~ s/Ĉ/ĉ/g;
  $a =~ s/Ĵ/ĵ/g;
  $a =~ s/Ĥ/ĥ/g;
  $a =~ s/Ŭ/ŭ/g;
  $a =~ s/Ĝ/ĝ/g;
  $a =~ s/Ŝ/ŝ/g;
  return lc $a;
}

# Connect to the database.
my $dbh = revodb::connect();

if (param("download")) {	# 0 por testi - 1 por vere esxuti aktualan liston
  my $ret = `wget -nv http://download.wikimedia.org/eowiki/latest/eowiki-latest-all-titles-in-ns0.gz -O ../../../files/eoviki.gz 2>&1`;
#  my $ret = `wget -nv http://download.wikimedia.org/eowiki/20090211/eowiki-20090211-all-titles-in-ns0.gz -O ../../../files/eoviki.gz 2>&1`;
  print h2("wget -> $exitcode");
  print pre($ret);
  
  my $sth = $dbh->prepare("TRUNCATE TABLE r2_vikititolo") or die;
  $sth->execute();
}

my %revo;				# unue mi kolektas cxiujn vortojn kun ligoj kiel hash -> array
my %vikihelpo;
#my %viki2revo;

my $sth = $dbh->prepare("SELECT ind_teksto, ind_celref FROM r2_indekso WHERE ind_kat='LNG' and ind_subkat='eo'") or die;
$sth->execute();
while (my ($t, $celref) = $sth->fetchrow_array) {
  print pre("test1: $t -> $celref")."\n" if $t =~ m/^frega/i;
  next if $celref =~ m#^art/tez/#;	# mi ne certas, kial cxi tie povas esti tezauxro ligoj.
  $_ = mylc $t;				# minuskligi
  print pre("test2: $t -> $_  $celref")."\n" if $t =~ m/^frega/;
#  $revo{$_} = [] unless $revo{$_};	# malplena tablo por komenci tion vorton
  push @{$revo{$_}}, $celref;		# aldoni la la ligon por tio vorto
}

my $sth = $dbh->prepare("SELECT vik_celref, vik_artikolo, vik_revo FROM r2_vikicelo") or die;
$sth->execute();
while (my ($celref, $vikart, $revo) = $sth->fetchrow_array) {
  print pre("helpo: $celref => $vikart")."\n";
  $vikihelpo{$celref} = $vikart;
  splice @{$revo{mylc $vikart}}, 0;		# forigu antauxajn
  push @{$revo{mylc $vikart}}, $celref;		# aldoni la la ligon por tio vorto
}

my $sth_insert = $dbh->prepare("INSERT INTO r2_vikititolo (titolo, titolo_lc) VALUES (?,?)") or die;

my %viki;				# nun mi kolektas cxiujn vortojn de vikipedio
					# hash kun artikolo -> hash kun ligo kaj vorto
open IN, "gzip -d <../../../files/eoviki.gz 2>&1 |" or die "ne povas gzip";
<IN>;  # forjxetu unuan linion, estas nur titolo
while (<IN>) {
  chomp;

  my $orgviki = $_;
  print pre("test: $_")."\n" if m/^frega/i;
  next if $orgviki =~ m/["<>]/;		# por sekureco "<> estas malpermesita
  next unless $orgviki =~ m/[a-z]/;		# ne prenu sen unu minuskla litro, cxar estas mallongigo
  $_ = mylc $_;				# minuskligi
  print pre("test: $_")."\n" if m/^frega/i;
  s/_/ /g;				# _ -> spaco
  $sth_insert->execute($orgviki, $_);
  if (my $celrefar = $revo{$_}) {	# cxu tio vorto eksistas en revo?
    print pre("test: trovis en revo $_")."\n" if m/^frega/i;
    foreach my $celref (@$celrefar) {	# cxiuj ligoj de tio vorto
      my $fname = $celref;		# prenu la artikolon kaj la markon el la ligo
      my $mrk;
      print pre("test: fname = $fname $_")."\n" if m/^frega/i;
      $fname =~ s/^art\///;
      if ($fname =~ s/#(.*)$//) {
        $mrk = $1;
      }
      $fname =~ s/\.html$//;
      print pre("html: $_  -  $fname  #  $mrk") if $mrk and $fname =~ /^frega/;

      my %h = (celref => $celref, orgviki => $orgviki);
      $viki{$fname} = [] unless $viki{$fname};
      push @{$viki{$fname}}, \%h;
    }
  }
}
close IN;
$sth_insert->finish();
$dbh->disconnect() or die "DB disconnect ne funkcias";

my $num;
foreach my $fname (<../../revo/art/*.html>) {			# prilaboru cxiujn artikolojn ankaux sen ligo, por forigi la ligojn
  $fname =~ s#^\.\./\.\./revo/art/([^/.]*)\.html$#\1#;		# prenu la artikolon el la dosiernomo
#  print pre("fname = $fname");
#  next unless $fname =~ m#^abel#;				# por testi nur malmulaj artikoloj

  $num++;							# por nombri kiom la artikoloj estas prilaborita
  my $t = "$fname:";						# por poste skribi en html

								# legu la enhavon de la art-dosiero
  open HTML, "<", "../../revo/art/$fname.html" or die "ne povas legi ../../revo/art/$fname.html";
  my $html = join '', <HTML>;
  close HTML;
#  $t .= "\n\thtml=".escapeHTML($html);				# nur por testi

								# forigo de la ligoj, eble en du formatoj, se mi sxangxis la formaton
#  $html =~ s# <a href="http://eo.wikipedia.org/wiki/[^"]*" target="_new"><img src="../smb/vikio.png" alt="VIKI" title="al la vikio" border="0"></a>##smg;
  $html =~ s# <a href="http://eo.wikipedia.org/wiki/[^"]*" target="_new"><img src="../smb/vikio.png" alt="Vikipedio" title="Al Vikipedio" border="0"></a>##smg;
#  $t .= "\n\n\thtml=".escapeHTML($html);

  my $unua = 1;
  foreach my $h (sort {$b->{orgviki} cmp $a->{orgviki}} @{$viki{$fname}}) {	# cxiuj vikiligoj por tio cxi artikolo
		# mi ordigas inverse laux nomo en vikipedio por ke estu Beko antaux BEKO. Pli minuskla unue
    $t .= "\n\t$$h{celref} - $$h{orgviki}";			# por poste montri

    my $mrk = $$h{celref};
    if ($mrk =~ s/#(.*)$//) {					# se la marko estas en la ligo, bone ...
      $mrk = $1;
      $t .= "\n\tmrk=$mrk";
    } else {							# ... se ne, prenu la unuan markon en la artikolo
      if ($html =~ m/<a name="([^"]+)"><\/a>\n?<h2>/) {
        $mrk = $1;
        $t .= "\n\tmrk=$mrk";
      }
    }

    if ($html =~ m/<a name="$mrk"><\/a>\n?<h2>(.*?)<\/h2>/smg) {	# sercxu la markon kun la vorto
      my $h2 = $1;							# la vortoj kun eble tezauxroligo
      $h2 =~ s/[ \n\t]+$//sm;						# forigu spacoj cxe la fino
      $t .= "\n\ttrovis: $mrk h2=".escapeHTML($h2);
      print pre("vikihelpo1: $$h{celref}");
      if (exists $vikihelpo{$$h{celref}}) {
        print pre("vikihelpo: $$h{celref} $vikihelpo{$$h{celref}}");
        my $vikihelpo = $vikihelpo{$$h{celref}};
        $$h{orgviki} = $vikihelpo;
      }
		
      if ($$h{orgviki}) {							# aldonu vikiligon al h2
        if (1 and $h2 =~ m#eo\.wikipedia\.org/wiki#) {			# 0 cxiuj vikiligoj, 1 nur unu vikiligo
          $t .= "\n\t!!!!!";
          print pre("$fname - $$h{celref} - $$h{orgviki} - $mrk");
        } else {
          print "$fname - ".a({href=>"/revo/$$h{celref}"}, $$h{celref})." - $$h{orgviki} - $mrk".br;
          $h2 .= " <a href=\"http://eo.wikipedia.org/wiki/$$h{orgviki}\" target=\"_new\"><img src=\"../smb/vikio.png\" alt=\"Vikipedio\" title=\"Al Vikipedio\" border=\"0\"></a>";
        }
      }

      $t .= "\n\th2=".escapeHTML($h2);
									# aldonu h2 al artikolo
      $html =~ s/<a name="$mrk"><\/a>\n?<h2>(.*?)<\/h2>/<a name="$mrk"><\/a><h2>$h2<\/h2>/sm;
#      $t .= "\n\n\thtml=".escapeHTML($html);
    }
  }
  print pre($t);						# montru la informojn

								# savu la novan artikolon kun vikiligoj
  open HTML, ">", "../../revo/art/$fname.html" or die "ne povas skribi ../../revo/art/$fname.html";
  print HTML $html;
  close HTML;
#  print pre("	html=".escapeHTML($html));
}

print pre("dauxro: ".(time - $^T)." sekundoj por $num art");	# cxiam estas bone, scii kiom longe dauxris
print end_html;
