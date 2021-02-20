#!/usr/bin/perl -w
# aplikas regulan esprimon al dosieroj
#
# voku ekz: 
#   apliku.pl 'm/bla\./g' dos1 dos2 ... dosn
#   apliku.pl 's/bla/blub/ig' dos1 dos2 ... dosn

$expr = shift @ARGV;

foreach $file (@ARGV) {

    open IN,$file or die "Ne povis malfermi $file: $!\n";
    $buf = join('',<IN>);
    close IN;

    $code = '$buf =~ '. "$expr"; 

    $found = eval $code ;  warn $@ if $@;   

    print "$file\n" if ($found);

    if ($found and $expr=~/^s/) {
	open OUT,">$file" or die "Ne povas skribi $file: $!\n";
	print OUT $buf;
	close OUT;
    }

#    print $found;
}



