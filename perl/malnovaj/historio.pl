#!/usr/bin/perl

#
# historio.pl
# Kreu liston de la historio (versioj), montru malnovan version kaj montru sxangxoj
# 2006-09-18 Wieland Pusch
#

use CGI qw(:standard start_ul end_ul);

print header(-charset=>'utf-8'),
      start_html(-title => 'Montru historion de '.param('art').".xml",
                 -style=>{'src'=>'/stl/diff.css'},
      ),
      h1('Historio de '.param('art').".xml");

my $homedir = "/var/www/web277";
my $cvsdir = "$homedir/files/CVS";

$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");

use Text::Diff;

#
# Uzu:
# 1) url?art=<art>
#    Montri liston de la historiaj versioj
# 2) url?art=<art>&r=<rev>
#    Montri la version <rev>
# 3) url?art=<art>&r1=<rev1>&r2=<rev2>
#    Montru la sxangxojn de version <rev> al versio <rev2>
#    Aldone "&context=n" por nombro de linioj de kunteksto
#
# Aldone "&debug=1" pro pli da informoj
#

# Kie mi trovas la CSV/RCS-arkivon
my $pado = "$cvsdir/".param('art').".xml,v";
#print h1("pado = $pado");

######################
# Cxu uzo 2) ?
######################
if (param('r')) {
  my $rev = param('r');
  print h2("abel.xml:$rev"); # if param('debug');
  my $ret;
  $ret = `co -p$rev $pado`;
  print pre(escapeHTML($ret));
}
######################
# Cxu uzo 3) ?
######################
elsif (param('r1')) {
  my $rev1 = param('r1');
  my $rev2 = param('r2');
  print h2("abel.xml:$rev1 - $rev2");

  # Prenu la du versioj de la arkivo
  my $rev1teksto = `co -p$rev1 $pado`;
  my $rev2teksto = `co -p$rev2 $pado`;

  # Cxu DOS aux Unikso? Forrigu \r por havi la saman formaton
  $rev1teksto =~ s/\r//g;
  $rev2teksto =~ s/\r//g;

  # Forigu blankajn signojn cxe la fino de la linio
  $rev1teksto =~ s/[ \t]*(\n)/\1/g;
  $rev2teksto =~ s/[ \t]*(\n)/\1/g;

  # Kreu sxangxoj en XHTML
  my $conteksto = param('context');
  $conteksto = 9999 unless $conteksto;
  my $html = diff \$rev1teksto, \$rev2teksto,
                  { STYLE   => 'Text::Diff::HTML',
                    CONTEXT => $conteksto };

  if ($conteksto == 9999) {
    $html =~ s/<span class="hunkheader">\@\@ -1,(\d+) \+1,(\d+) \@\@/<span class="hunkheader">\@\@ linioj \1 -> \2 \@\@/;
  }

  $html =~ s,(class="ctx">),\1<pre>,g;

  # Presentu al la uzanto
  print $html;
}
######################
# Tiam uzo 1)
######################
else {
  my $ret;
  print h2("rlog abel.xml") if param('debug');

  # Prenu listo de la versioj
  $ret = `rlog $pado 2>&1`;
  # Forigu ======= cxe la fino
  $ret =~ s/=*$//;
  # Kreu tabelo kun la unuopaj informoj. La unua estas pri la arkivo. 
  # La aliaj pri la versioj
  my @aret = split /\n----------------------------\n/, $ret;
  print p("Numero ".@aret) if param('debug');
  print pre("header: $aret[0]") if param('debug');

  # Fojetu la informojn pri la arkivo
  shift @aret;

  # Komencu listoj de la versioj
  print "\n".start_ul(id=>'historio');

  # Kreu tabelo kun hashrefs kun informoj pri la versioj
  my @revs;
  foreach (@aret) {
    my %h = ();
    $h{source} = $_;
    if (s/^revision (.*)\ndate: (.*);  author: (.*);  state: (.*);//) {
      $h{rev} = $1;
      $h{dato} = $2;
      $h{autoro} = $3;
      $h{stato} = $4;
      if (s/^ +lines: (.*)\n//) {
        $h{linioj} = $1;
      }
      if (s/^\nbranches: (.*);\n//) {
        $h{brancxo} = $1;
      }
      $h{sxangxo} = $_;
    }
    push @revs, \%h;
  }
  print p("Numero revs ".@revs) if param('debug');

  # Prezentu la liston de la versioj
  foreach my $i (0 .. @revs - 1) {
    my $href = $revs[$i];
    if ($$href{rev}) {
      my $antauxa = "&#349;an&#285;oj";
      # Ligo al antauxa versio se ne estas la unua versio
      if ($i < @revs - 1) {
        my $href_ant = $revs[$i + 1];
        $antauxa = a({href=>"?art=".param('art')."&r1=$$href_ant{rev}&r2=$$href{rev}"}, $antauxa);
      }
      print li(a({href=>"?art=".param('art')."&r=$$href{rev}"}, $$href{rev})." $antauxa $$href{dato} $$href{sxangxo}")."\n";
    } else {
      # Kaze de eraro montu ion
      print li("$i $$href{source}");
    }
  }
  print end_ul;
}

print end_html();

1;
