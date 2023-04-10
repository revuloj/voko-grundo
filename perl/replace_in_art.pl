#!/usr/bin/perl

# (c) 2022-2023 Wolfram Diestel
# laŭ GPL 2.0
#
# faras anstataŭigojn en artikoloj kaj altigas la versi-numeron en Id...
# la anstatŭigoj estas rekte koditaj en process_art. Se vi volas adapti ilin
# vi devas ŝanĝi tie!

#
#  perl replace_in_art.pl a*.xml

use lib("../voko-grundo/perl");
use process;

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 0;
$verbose=1;
@artikoloj = @ARGV;

my $shanghoj = "revo: aktualigo Monato-URL";

for $art (@artikoloj) {
    process_art($art);
}

sub process_art {
    my $art = shift;
    print "$art...?\n" if ($verbose);

    my $xml = process::read_file($art);
    my $chg = 0;
    
    # apliku anstataŭigojn
    #...
    $chg += ($xml =~ s/https?:\/\/www\.monato\.(be|net)/&Monato;/g);

    if ($chg) {
        process::write_file(">",$art,$xml);

        # nova versio
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($art,"/tmp/shanghoj.msg");

        print "...$chg ŝanĝo(j)! [$shanghoj]\n" if ($verbose);
    }

}