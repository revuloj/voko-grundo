#!/usr/bin/perl

# trovas la #nenien-referencoj en vortaro.html
# voku:
#
#  nenien.pl vortaro.html > nenien.txt

$/="><hr";
open IN,$ARGV[0] or die "Ne povis malfermi $ARGV[0]\n";

while (<IN>) {

#    /<h2\s*>(.*?)<\/h2\s*>.*?<a\s+href=\"#nenien\"\s*>(.*?)<\/a\s*>/;
    if (/<a\s+href=\"#nenien\"/si) {
	/<h2\s*>(.*?)<\/h2\s*>/si;
	$v= $1;
	$v =~ s/\s+//sg;
	$v =~ s/<sup>.*?<\/sup>//isg;
	print "$v: ";
	while (/<a\s+href=\"#nenien\"\s*>(.*?)<\/a\s*>/sig) { 
	       print "$1; "; 
	   };
	print "\n";
	};
};

close IN;



