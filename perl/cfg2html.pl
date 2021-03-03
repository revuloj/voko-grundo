#!/usr/bin/perl

use lib "$ENV{'VOKO'}/bin";
use vokolib;
use nls; read_nls_cfg("$ENV{'VOKO'}/cfg/nls.cfg");

$file = shift @ARGV;

# legu la dosieron
%entries = read_cfg($file,1); # 1 = stir-informoj

# analizu la stirinformojn
if ($entries{'_#!_'}) {
    foreach $entry (split(/\s*;\s*/,$entries{'_#!_'})) {
	$entry =~ s/^\s+//; $entry =~ s/\s+$//;
	($key,$value) = split (/\s*=\s*/,$entry);
	$stir{$key}=$value;
	delete $entries{'_#!_'}
    }
} 

# eligu HTML-dosieron de la bibliografio
index_header($stir{'titolo'});
index_buttons('ktp') if ($stir{'butonoj'} eq 'jes');
print "<h1>$stir{'titolo'}</h1>\n";

if ($stir{'listo'} eq 'dl') {
    print "<dl compact>\n";
    foreach $key (sort  { cmp_nls($a,$b,'eox') } keys %entries) {
	print "<a name=\"$key\"></a>";
	print "<dt>$key</dt>\n";
	print "<dd>$entries{$key}</dd>\n";
    }
    print "</dl>\n";
} else {
    print "<pre>\n";
    foreach $key (sort { cmp_nls($a,$b,'eox') } keys %entries) {
	print " " x $stir{'x1'};
	print "$key" . " " x ($stir{'x2'} - length($key));
	print "$entries{$key}\n";
    }
    print "</pre>\n";
}

index_footer();
	






