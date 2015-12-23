#!/usr/bin/perl

#
# revorss.pm
# 
# 2008-02-09 Wieland Pusch
#

use strict;
use utf8;

package revorss;

use CGI qw(:standard);
use XML::RSS;

######################################################################
sub write {
  my $tar = shift @_;
  my $htmldir = shift @_;
  my $maxnum = shift @_;
  my $nowrite = shift @_;

  $maxnum = 200 if $maxnum < 0;

  print pre("aktualigo de RSS...");

  my $rss = new XML::RSS;

  $rss->parsefile("$htmldir/sxangxoj.rdf");

  pop(@{$rss->{'items'}}) while (@{$rss->{'items'}} > $maxnum);

  while ($tar =~ m,revo/art/([^.]+)\.html\n,smg) {
    my ($art) = ($1);
#    print pre("art = $art");

    open IN, "<", "$htmldir/revo/xml/$art.xml" or warn "error open xml/$art.xml";
    my $xml = join '', <IN>;
    close IN;

    if ($xml =~ m!<\!--\n+ *\$Log: [^,]+,v \$\n *Revision ([0-9.]+)  ([0-9/]+) ([0-9:]+)  revo\n *([^\n]*)\n!) {
      my ($rev, $dato, $tempo, $sxangxo) = ($1, $2, $3, $4);
#      print pre("rev = $rev, dato = $dato $tempo, log = $sxangxo");
      $dato =~ s,/,-,g;
      my $prevrev = "1.1";
      if ($rev =~ /^(\d+)\.(\d+)$/) {
        $prevrev = "$1.".($2 - 1);
      }
      my $hrefdiff = "http://www.reta-vortaro.de/cgi-bin/historio.pl?art=$art&";
      my $subject;
      if ($rev eq "1.1") {
        $hrefdiff .= "r=$rev";
        $subject = "nova";
      } else {
        $hrefdiff .= "r1=$prevrev&r2=$rev";
        $subject = "ŝanĝo";
      }

      $rss->add_item(title => "$art",
                     link  => "http://www.reta-vortaro.de/revo/art/$art.html",
                     description => a({href=>$hrefdiff}, "$dato $tempo").br."$sxangxo", 
                     dc => { subject=>$subject,
	  	             creator=>"ReVo", 
		             rights=>"GPL",
                             date=>"$dato\T$tempo+01:00",
	             },
		     mode  => 'insert',
    );
    } else {
      print pre("eraro en art = $art\n".escapeHTML("xml = $xml"));
    }
  }

  $rss->save("$htmldir/sxangxoj.rdf") unless $nowrite;
  print pre("fino de aktualigo de RSS");
}
    
######################################################################

1;

