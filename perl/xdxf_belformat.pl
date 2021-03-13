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
        # ni kolektas liniojn ĝis </ar> kaj anstataŭigas linifinojn per spacoj
        chomp;
        $art .= ' ' if $art ne '';
        $art .= $_;
    }
    else {
        $art .= $_;
        # kun, kiam ni kolektis tutan artikolon, ni normaligas ĝin
        # forigante duoblajn spacojn...
        $art =~ s/\s+/ /g;
        # aldonante linirompojn ĉe XML-strukturiloj samtempe forigante ĉirkaŭajn spacojn
        $art =~ s/ *<(def|sr|)> */\n\n<$1>/g;
	    $art =~ s/ *<(\/def)> */<$1>\n/g;
	    $art =~ s/ *<(\/ar)> */<$1>\n\n/g;
        # aldonante punkton komence de ĉiu ekzemplo
        $art =~ s/ *(<ex\b[^>]*>) */\n$1•  /g;
        # aldonate sagon antaŭ referencoj
        $art =~ s/ *<sr> */\n<sr>► /g;
        $art =~ s/ *<dtrn> */\n<dtrn> /g;

        print OUT $art, "\n";
        $art = '';
    }
}
print OUT $art, "\n" if($art);
