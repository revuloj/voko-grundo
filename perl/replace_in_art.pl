#!/usr/bin/perl

# (c) 2022 Wolfram Diestel
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

for $art (@artikoloj) {
    process_art($art);
}

sub process_art {
    my $art = shift;
    print "$art...?\n" if ($verbose);

    my $xml = process::read_file($art);
    my $chg = 0;
    
    # apliku anstataŭigojn
    $chg ||= ($xml =~ s/lng\s*=\s*"jw"/lng="jv"/g);
    $chg ||= ($xml =~ s/lng\s*=\s*"tp"/lng="tok"/g);
    #...
    $chg ||= ($xml =~ s|https?://www\.monato\.be|&Monato;|g);
    $chg ||= ($xml =~ s|https?://esperanto\.cri\.cn/|&CRI;|g);
    $chg ||= ($xml =~ s|https?://eo\.mondediplo\.com/|&Mondediplo;|g);
    $chg ||= ($xml =~ s|https?://eo\.wikipedia\.org/w/index.php\?title=|&Vikio;|g);
    $chg ||= ($xml =~ s|https?://eo\.wikipedia\.org/wiki|&Viki;|g);
    $chg ||= ($xml =~ s,https?://groups\.google\.(?:com|be)/(?:g|group)/soc\.culture\.esperanto\?hl=eo,&SCE;,g);
    $chg ||= ($xml =~ s|http://kono\.be/cgi-bin/vivo/ViVo.cgi\?pagxo=|&ViVoTrd;|g);
    $chg ||= ($xml =~ s|http://kono\.be/cgi-bin/vivo/|&ViVo;|g);
    $chg ||= ($xml =~ s|https?://www\.akademio-de-esperanto\.org|&AdE;|g);
    $chg ||= ($xml =~ s|https?://bertilow\.com/pmeg/|&PMEG;|g);

    $chg ||= ($xml =~ s|https?://www\.eventoj\.hu/steb/|&STEB;|g);
    $chg ||= ($xml =~ s|https?://literaturo\.org/HARLOW-Don/Esperanto/Literaturo/|&DonH;|g);
    $chg ||= ($xml =~ s|https?://eduinf\.waw\.pl/esp/|&EduInf;|g);
    $chg ||= ($xml =~ s|https?://esperanto-ondo\.ru/|&LOdE;|g);
    $chg ||= ($xml =~ s|https?://sezonoj\.ru/|&Sezonoj;|g);
    $chg ||= ($xml =~ s|https?://www\.gutenberg\.org/|&Gutenberg;|g);
    $chg ||= ($xml =~ s|https?://(?:www\.)?steloj\.de/esperanto/|&Steloj;|g);
    $chg ||= ($xml =~ s|https?://upload\.wikimedia\.org/wikipedia/commons|&WCU;|g);
    $chg ||= ($xml =~ s|https?://commons\.wikimedia\.org/wiki|&WCW;|g);

    if ($chg) {
        process::write_file(">",$art,$xml);

        # nova versio
        my $shanghoj = "aktualigo ligvokodoj kaj URL-unuoj";
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($art,"/tmp/shanghoj.msg");

        print "...ŝanĝita! ($shanghoj)\n" if ($verbose);
    }

}