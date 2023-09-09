#!/usr/bin/perl
#
#
# prenas la ekzemplojn el chiuj transdonitaj dosieroj
# kaj serchas la fontojn per ekzfnt.pl
#
# Prefere voku tion de la sama dosierujo, kie
# trovighas la artikoloj, char la DTD devas esti
# en ../dtd/

$|=1;

foreach $xml (@ARGV) {
    
    unless (-f $xml) {
	warn "Dosiero $xml ne ekzistas.\n";
    } else {

	print uc($xml), ":\n";
	
	open TRV, "ekzfnt.pl -x $xml|";
	while (<TRV>) {
	    print;
	}
	close TRV;
	print "\n\n";
    }
}

