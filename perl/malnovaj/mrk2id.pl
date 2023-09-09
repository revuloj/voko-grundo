#!/usr/bin/perl -w

# enmetas CVS-shlosilvorton Id en art mrk="...",
# tio estas necesa se vi volas teni la vortaron en CVS-arkivo

$debug=0;

while ($ARGV[0] =~ /^-/) {
    if ($ARGV[0] eq '-v') {
	$verbose = shift @ARGV; # skribas la dosiernomon dum la konverto
    } else {
	die "nevalida argumento $ARGV[0]\n";
    }
}

$xmldir = shift @ARGV;

opendir DIR,$xmldir;
for $file (readdir(DIR)) {

    $xmlfile = "$xmldir/$file";

    if ((-f $xmlfile) and ($xmlfile =~ /\.xml$/)) {
   
	warn "$xmlfile\n" if ($verbose);

	# legu la dosieron
	open XML,$xmlfile or die "Ne povis malfermi $xmlfile: $!\n";
	$text = join('',<XML>);
	close XML;
	$text =~ s/<art\s+mrk="[^\"]*"\s*>/<art mrk="\$Id\$">/s;
        open XML,">$xmlfile" or die "Ne povis skribi al $xmlfile: $!";
        print XML $text;
        close XML;

    } else {
	warn "ignoru: $infile\n" if ($debug);
    }
}

  

