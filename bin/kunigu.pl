#!/usr/bin/perl
############################################
# kunigas al unu xml-dosiero  multajn xml-dosierojn
# 
############################################

# voku ekz. kunigu.pl 
# au kunigu.pl -v -a./xml ./sgm/vortaro.xml

# konstantoj

# la argumentojn analizu

$artik="./xml";
$verbose = 0;

$doctype = '<!DOCTYPE vortaro SYSTEM "../dtd/vokoxml.dtd" >';

while ($ARGV[0] and $ARGV[0] =~ /^\-[av]/) {
    if ($ARGV[0] =~ /^\-a/) {
	$artik = shift @ARGV;
	$artik =~ s /^\-a//;
    } elsif ($ARGV[0] =~/^\-v/) {
	$verbose = shift @ARGV;
    } else { 
	die "Eraro dum analizado de la argumentoj.\n";
    }
}

if (@ARGV) {
    $vortaro=shift @ARGV;
} else {
    $vortaro="sgm/vortaro.xml";
};

open OUT,">$vortaro" or die "Ne povis malfermi $vortaro: $!\n";
print OUT "$doctype\n\n";
print OUT "<vortaro>\n";

# legu la kadron de la vortaro
if (open IN,"$artik/_vortaro.xml") {
    print "_vortaro.xml\n";
    $kadro = join('',<IN>);
    close IN;
};

# skribu la prologon en la vortaron
if ($kadro =~ m/(<prologo\s*>.*?<\/prologo\s*>)/si) {
    print OUT "$1\n";
} else {
    print OUT "<prologo><titolo>Vortaro</titolo></prologo>\n";
};
print OUT "\n<precipa-parto>\n";

#print "malfermas $artik...\n";

opendir DIR, "$artik" or die "Ne povis legi dosierujon $artik: $!\n";
@files = sort readdir DIR;

for $dos (@files) {

    if ((-f "$artik/$dos") and 
	($dos !~ /_vortaro\.xml/) and
	($dos =~ /\.xml$/)) {

	print "$dos\n" if ($verbose);

	# malfermu la dosieron de la artikolo
	open IN,"$artik/$dos" or die
	    "Ne povis malfermi $artik/$dos: $!";
	$teksto = join('',<IN>);
	
	# elprenu la artikolan strukturon (chion antauan kaj postan ignoru)
	$teksto =~ s/^.*(<art[^>]*>.*<\/art\s*>).*$/$1/si
	    or warn "Ne trovis artikolan parton en $dos\n";
	
	# anstatauigu CVS-Id per dosiernomo (= marko)
	$teksto =~ s/\044Id:\s+(.*?)\.xml,v\s+[^\044]+\044/$1/si
	    or warn "Ne trovis \044Id\044 en $dos\n";

	# skribu la tekston en la vortaron
	print OUT "$teksto\n\n";

	# fermu
	close IN;
    };
};
closedir DIR;

print OUT "</precipa-parto>\n\n";

# skribu la epilogon en la vortaron
if ($kadro =~ m/(<epilogo\s*>.*?<\/epilogo\s*>)/si) {
    print OUT "$1\n";
} else {
    print OUT "<epilogo>generita per kunigu.pl je ".`date`."</epilogo>\n";
};
print OUT "</vortaro>\n";

















