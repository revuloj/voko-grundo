#!/usr/bin/perl

# konvertas sgml-dosieron aý sgml-dtd'on al xml-normo
#
#
# voku: perl sgml2xml.pl -d sgml.dtd > xml.dtd
# aý:   perl sgml2xml.pl vortaro.sgm > vortaro.xml

if ($ARGV[0] eq '-d') {
    $dtd = 1;
    shift @ARGV;
} else {
    $dtd = 0;
};

$dos = shift @ARGV;

open IN,$dos;

# konvertu la DTDon
if ($dtd) {
    $teksto = join('',<IN>);
    $teksto =~ s/(<!ELEMENT\s+[^\s]+\s+)[\-o]\s+[\-o]\s+/$1/gs;
    print "<?xml version=\"1.0\"?>\n";
    print $teksto;
} else {
    print "<?xml version=\"1.0\"?>\n";

    # provizore anstataýigu PUBLIC-DTD -> SYSTEM-DTD
    <IN>;
    print "<!DOCTYPE vortaro SYSTEM \"../dtd/vokoxml.dtd\">\n";

    while (<IN>) {
	s/(<tld[^>]*)>/$1\/>/ig;
	print;
    };
};

close IN;



















