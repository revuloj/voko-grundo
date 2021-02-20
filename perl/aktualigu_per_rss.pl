#!/usr/bin/perl

$debug = 1;
$wget = '/usr/bin/wget';
$revo_url = 'http://retavortaro.de/revo/xml';
$xml_dir = $ENV{REVO}."/xml";


`$wget -nv http://www.reta-vortaro.de/sxangxoj.rdf -O sxangxoj.rdf`;

open IN,'sxangxoj.rdf'
    or die "Ne povis malfermi 'sxangxoj.rdf'-on: $!\n";

while (<IN>) {
# match    <description>&#x3C;a href=&#x22;http://www.reta-vortaro.de/cgi-bin/historio.pl?art=front&#x26;amp;r1=1.21&#x26;amp;r2=1.22

# nova: <description>&#x3C;a href=&#x22;http://www.reta-vortaro.de/cgi-bin/historio.pl?art=stret&#x26;amp;r=1.1&#x22;&#x3E;2015-03-07 10:10:16&#x3C;/a&#x3E;&#x3C;br /&#x3E;Wolfram Diestel: nova artikolo</description>


    ## print if ($debug);

    if (m/<description>.*art=(.*?)&.*r2?=([\d\.]+)/) {
	my ($art,$rev) = ($1,$2);
	
	$xmlfile = "$xml_dir/$art.xml";
	if (-e $xmlfile) {
	  $local_rev = get_art_version($xmlfile);
	} else {
	  $local_rev = '0';
	}	

	if ($debug) {
	    print "$art: $local_rev -> $rev\n";
	}
	
	if ($local_rev ne $rev) {
	    $remote_file = "$revo_url/$art.xml";
	   # `$wget -nv -nd -P $xml_dir -p $remote_file`;
	    `$wget -nv $remote_file -O $xmlfile`;
        }
    }
}

close IN;



sub get_art_version {
    my $xmlfile = shift;
    
    open XML, $xmlfile
	or die "Ne povis malfermi '$xmlfile'-on: $!\n";

    while (<XML>) {
        # <art mrk="$Id: drent.xml,v 1.6 2014/01/07 10:10:13 revo Exp $">
	if (m/\$Id:.*v\s([\d\.]+)\s/) {
	    close XML;
	    return $1;
	}
    }

    # se Id ne trovighis
    close XML;
    return;
}

