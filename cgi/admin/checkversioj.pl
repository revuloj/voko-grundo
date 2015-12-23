#!/usr/bin/perl

#
# parseart2.pl
# 
# 2008-03-24 Wieland Pusch
#

use strict;

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use DBI();

print header(-charset=>'utf-8'),
      start_html(-title => 'Enhavo de '.param('art').".xml");

if (param('arts')) {
  param('art', join('#', split /\r*\n/,param('arts')));
} elsif (!param('art')) {
  print h1('arts = '.param('arts'));
  print h2('arts = '.join('#', split /\r*\n/,param('arts')));
  print start_form();
  print textarea(-name=>'arts',
                 -rows=>10,
                 -columns=>50),
        hidden(-name=>'verbose',
               -default=>param('verbose'));
  print br, submit(-name=>'button');
  print endform;
  print end_html();
  exit 1;
}

print h1('Enhavo de '.param('art').".xml");

my $homedir = "/var/www/web277";
print h1("homedir = $homedir");

my $start_time = time();

my $xmldir = "$homedir/html/revo/xml";
my $htmldir = "$homedir/html/revo/art";
my $cvsdir = "$homedir/files/CVS";

$ENV{'LD_LIBRARY_PATH'} = "$homedir/files/lib";
#print h1("LD_LIBRARY_PATH = ".$ENV{'LD_LIBRARY_PATH'});
$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";
#print h1("PATH = ".$ENV{'PATH'});

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use revo::encode;
use revo::decode;

my @arts;
if (param('arts')) {
  @arts = sort split /\r*\n/,param('arts');
} else {
  push @arts, param('art');
}

my $verbose = param('verbose');
#$verbose = 0 unless $verbose;

my $art_count;
my $last_art;
foreach my $art (@arts) {
  if ($art && $art ne $last_art) {
    $art_count += checkencode($art, $xmldir);
    $last_art = $art;
  }
}
  
print h2("Tuta dauxro: ".(time() - $start_time)." sekundoj por $art_count artikoloj.");
print h1("Fino.");

print end_html();

sub checkencode {
  my ($art, $xmldir) = @_;
  my $num;
  my %v;
  my $a;
  print "art=$art xmldir=$xmldir<br>\n";

  foreach my $fname (<$xmldir/$art.xml>) {
#    print "fname = $fname<br>\n";
    if ($fname =~ m#^$xmldir/([^.]+)\.xml$#) { $a=$1; }
    $num++;

    open IN, "<", $fname or die "open";
    my $xml = join('', <IN>);
    close IN;
    
    my $vers;
    if ($xml =~ m#<art mrk=\s*"\$Id: [^ ]+ ([0-9.]+) ([0-9/]+) ([0-9:]+) [^\$]+ \$">#sm) {
#        print "xml versio: $1 $2 $3".br."\n";
        $vers = "$1 $2 $3";
    } else {
        print "ne trovis markon en $fname".br."\n";
        $vers = "???";
    }
    $v{$a} = {} unless $v{$a};
    $v{$a}->{xml} = $vers;
#      print pre(escapeHTML("$fname:\n$xml[$i]\n$xml3[$i]\n$xml2[$i]\n")) if $xml[$i] ne $xml3[$i];
  }

  foreach my $fname (<$htmldir/$art.html>) {
#    print "fname = $fname<br>\n";
    if ($fname =~ m#^$htmldir/([^.]+)\.html$#) { $a=$1; }
    $num++;

    open IN, "<", $fname or die "open";
    my $html = join('', <IN>);
    close IN;
    
    my $vers;
    if ($html =~ m#artikolversio</a>:\s+([0-9.]+) ([0-9/]+) ([0-9:]+) \]#sm) {
#        print "html versio: $1 $2 $3".br."\n";
        $vers = "$1 $2 $3";
    } else {
        print "ne trovis markon en $fname".br."\n";
        $vers = "???";
    }
    $v{$a} = {} unless $v{$a};
    $v{$a}->{html} = $vers;
  }

  foreach my $fname (<$cvsdir/$art.xml,v>) {
#    print "fname = $fname<br>\n";
    if ($fname =~ m#^$cvsdir/([^.]+)\.xml,v$#) { $a=$1; }
    my $ret = `rlog -r $fname 2>&1`;
    my $vers;
    if ($ret =~ m#\nrevision ([0-9.]+)\s+date: ([0-9/]+) ([0-9:]+);#sm) {
#        print "cvs versio: $1 $2 $3".br."\n";
        $vers = "$1 $2 $3";
    } else {
        print "ne trovis markon en $fname".br."\n";
        $vers = "???";
    }
    $v{$a} = {} unless $v{$a};
    $v{$a}->{cvs} = $vers;
#    print pre("ret=$ret");
  }

  my $xml_mankas;
  my $html_mankas;
  my $cvs_mankas;
  foreach my $a (sort keys %v) {
#      print "a=$a".br."\n";
      print "xml mankas $a".br."\n" if !exists $v{$a}->{xml};
      print "html mankas $a".br."\n" if !exists $v{$a}->{html};
      print "cvs mankas $a".br."\n" if !exists $v{$a}->{cvs};
      
	  $v{$a}->{xml} =~ s/^1\.//;
	  $v{$a}->{html} =~ s/^1\.//;
	  $v{$a}->{cvs} =~ s/^1\.//;
      if ($v{$a}->{cvs} ne $v{$a}->{html}
          or $v{$a}->{cvs} ne $v{$a}->{xml}) {
              print "versioj malsamas $a".br."\nxml $v{$a}->{xml}"
              .br."\nhtml $v{$a}->{html}".br."\ncvs $v{$a}->{cvs}".br;
      }
	  my $max = $v{$a}->{xml} + 0;
#	  print "max=$max".br;
	  $max = $v{$a}->{html} + 0 if $v{$a}->{html} + 0 > $max;
#	  print "max=$max cvs=".($v{$a}->{cvs} + 0).br;
	  $max = $v{$a}->{cvs} + 0 if $v{$a}->{cvs} + 0 > $max;
#	  print "max=$max".br;
      if ($v{$a}->{xml} != $max) {
        print "xml mankas $a.xml".br;
        $xml_mankas .= "xml/$a.xml".br;
      }
      if ($v{$a}->{html} != $max) {
        print "html mankas $a.html".br;
        $html_mankas .= "art/$a.html".br;
      }
      if ($v{$a}->{cvs} != $max) {
        print "cvs mankas $a.xml,v".br;
        $cvs_mankas .= "CVS/$a.xml,v".br;
      }
  }
  print br.$xml_mankas;
  print $html_mankas;
  print $cvs_mankas;

  return $num;
};

1;
