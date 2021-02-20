#!/usr/bin/perl

use strict;
use warnings;

my $infile = shift @ARGV;
my $outfile = shift @ARGV;

my $art = '';

open IN,$infile
    || die "Ne povis malfermi $infile: $!\n";
open OUT,">$outfile"
    || die "Ne povis malfermi $outfile: $!\n";

while(<IN>) {
    unless( /\s*<\/ar>\s*/ ) {
        chomp;
        $art .= ' ' if $art ne '';
        $art .= $_;
    }
    else {
        $art .= $_;
        $art =~ s/\s+/ /g;

        $art =~ s/ *<(def|sr|)> */\n\n<$1>/g;
	$art =~ s/ *<(\/def)> */<$1>\n/g;
	$art =~ s/ *<(\/ar)> */<$1>\n\n/g;
        $art =~ s/ *(<ex\b[^>]*>) */\n$1•  /g;
        $art =~ s/ *<sr> */\n<sr>► /g;
        $art =~ s/ *<dtrn> */\n<dtrn> /g;

        print OUT $art, "\n";
        $art = '';
    }
}
print OUT $art, "\n" if($art);
