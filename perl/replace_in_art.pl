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

my $shanghoj = "revo: transskribo per <pr>";

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

# korektu malĝustajn literojn en ĉina, hinda transskribo kaj latvaj tradukoj
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15FB;|&#5627;)(.*?)</pr>,<pr>$1ī$2</pr>,g); # ᗻ
    $chg += ($xml =~ s|<pr>(.*?)(?:&#x15E3;)(.*?)</pr>|<pr>$1ē$2</pr>|g); # ᗣ
    $chg += ($xml =~ s|<pr>(.*?)(?:&#x15D1;)(.*?)</pr>|<pr>$1ā$2</pr>|g); # ᗑ
    $chg += ($xml =~ s|<pr>(.*?)(?:&#x163B;)(.*?)</pr>|<pr>$1ū$2</pr>|g); # ᘻ
    $chg += ($xml =~ s|<pr>(.*?)(?:&#x161D;)(.*?)</pr>|<pr>$1ō$2</pr>|g); # ᘝ

# "amacron":"ā",
# "emacron":"ē",
# "gcommaaccent":"ģ",
# "imacron":"ī",
# "kcommaaccent":"ķ",
# "lcommaaccent":"ļ",
# "ncommaaccent":"ņ",
# "omacron":"ō",
# "rcommaaccent":"ŗ",
# "umacron":"ū",
# "Amacron":"Ā",
# "Emacron":"Ē",
# "Gcommaaccent":"Ģ",
# "Imacron":"Ī",
# "Kcommaaccent":"Ķ",
# "Lcommaaccent":"Ļ",
# "Ncommaaccent":"Ņ",
# "Omacron":"Ō",
# "Rcommaaccent":"Ŗ",
# "Umacron":"Ū",

# "amacron":"ᗑ",
# "emacron":"ᗣ",
# "gcommaaccent":"ᗳ",
# "imacron":"ᗻ",
# "kcommaaccent":"ᘇ",
# "lcommaaccent":"ᘌ",
# "ncommaaccent":"ᘖ",
# "omacron":"ᘝ",
# "rcommaaccent":"ᘧ",
# "umacron":"ᘻ",
# "Amacron":"ᗐ",
# "Emacron":"ᗢ",
# "Gcommaaccent":"ᗲ",
# "Imacron":"ᗺ",
# "Kcommaaccent":"ᘆ",
# "Lcommaaccent":"ᘋ",
# "Ncommaaccent":"ᘕ",
# "Omacron":"ᘜ",
# "Rcommaaccent":"ᘦ",
# "Umacron":"ᘺ",
# 
# 13c1,5057,257
# 13d3,5075,275
# 13e3,5091,291
# 13eb,5099,299
# 13f7,5111,311
# 13fc,5116,316
# 1406,5126,326
# 140d,5133,333
# 1417,5143,343
# 142b,5163,363
# 13c0,5056,256
# 13d2,5074,274
# 13e2,5090,290
# 13ea,5098,298
# 13f6,5110,310
# 13fb,5115,315
# 1405,5125,325
# 140c,5132,332
# 1416,5142,342
# 142a,5162,362


    if ($chg) {
        process::write_file(">",$art,$xml);

        # nova versio
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($art,"/tmp/shanghoj.msg");

        print "...$chg ŝanĝo(j)! [$shanghoj]\n" if ($verbose);
    }
}
