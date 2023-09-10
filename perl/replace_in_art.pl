#!/usr/bin/perl

# (c) 2022-2023 Wolfram Diestel
# laŭ GPL 2.0
#
# faras anstataŭigojn en artikoloj kaj altigas la versi-numeron en Id...
# la anstatŭigoj estas rekte koditaj en process_art. Se vi volas adapti ilin
# vi devas ŝanĝi tie!

#
#  perl replace_in_art.pl revo/a*.xml

use lib("../voko-grundo/perl");
use process;

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 0;
$verbose=1;
@artikoloj = @ARGV;

my $shanghoj = "revo: korekto de transskribo";

for $art (@artikoloj) {
    process_art($art);
}

sub process_art {
    my $art = shift;
    print "$art...?\n" if ($verbose);

    my $xml = process::read_file($art);
    my $chg = 0;
    
    # apliku anstataŭigojn
#    $chg += ($xml =~ s|https?://(?:www\.)?monato\.be|&Monato;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?monato\.net|&Monato;|g);
#    $chg += ($xml =~ s|https?://esperanto\.cri\.cn/|&CRI;|g);
#    $chg += ($xml =~ s|https?://eo\.mondediplo\.com/|&Mondediplo;|g);
#    $chg += ($xml =~ s|https?://eo\.wikipedia\.org/w/index.php\?title=|&Vikio;|g);
#    $chg += ($xml =~ s|https?://eo\.wikipedia\.org/wiki|&Viki;|g);
#    $chg += ($xml =~ s,https?://groups\.google\.(?:com|be)/(?:g|group)/soc\.culture\.esperanto\?hl=eo,&SCE;,g);
#    $chg += ($xml =~ s|http://(?:www\.)?kono\.be/cgi-bin/vivo/ViVo.cgi\?pagxo=|&ViVoTrd;|g);
#    $chg += ($xml =~ s|http://(?:www\.)?kono\.be/cgi-bin/vivo/|&ViVo;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?akademio-de-esperanto\.org|&AdE;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?bertilow\.com/pmeg/|&PMEG;|g);
#
#    $chg += ($xml =~ s|https?://(?:www\.)?eventoj\.hu/steb/|&STEB;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?literaturo\.org/HARLOW-Don/Esperanto/Literaturo/|&DonH;|g);
#    $chg += ($xml =~ s|https?://eduinf\.waw\.pl/esp/|&EduInf;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?esperanto-ondo\.ru/|&LOdE;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?sezonoj\.ru/|&Sezonoj;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?gutenberg\.org/|&Gutenberg;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?steloj\.de/esperanto/|&Steloj;|g);
#    $chg += ($xml =~ s|https?://upload\.wikimedia\.org/wikipedia/commons|&WCU;|g);
#    $chg += ($xml =~ s|https?://commons\.wikimedia\.org/wiki|&WCW;|g);
#
#    $chg += ($xml =~ s|https?://(?:www\.)?uea\.org/|&UEA;|g);
#    $chg += ($xml =~ s|https?://(?:www\.)?tekstaro\.com/t|&Tekstaro;|g);

    # korektu malĝustajn literojn en ĉina transskribo pinjina
    $chg += ($xml =~ s,<ind>(.*?)(?:&#x15FB;|&#5627;)(.*?)</ind>,<ind>$1ī$2</ind>,g); # ᗻ
    $chg += ($xml =~ s|<ind>(.*?)(?:&#x15E3;)(.*?)</ind>|<ind>$1ē$2</ind>|g); # ᗣ
    $chg += ($xml =~ s|<ind>(.*?)(?:&#x15D1;)(.*?)</ind>|<ind>$1ā$2</ind>|g); # ᗑ
    $chg += ($xml =~ s|<ind>(.*?)(?:&#x163B;)(.*?)</ind>|<ind>$1ū$2</ind>|g); # ᘻ
    $chg += ($xml =~ s|<ind>(.*?)(?:&#x161D;)(.*?)</ind>|<ind>$1ō$2</ind>|g); # ᘝ


    if ($chg) {
        process::write_file(">",$art,$xml);

        # nova versio
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($art,"/tmp/shanghoj.msg");

        print "...$chg ŝanĝo(j)! [$shanghoj]\n" if ($verbose);
    }
}
