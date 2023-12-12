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

my $shanghoj = "revo: kor. lat. transskribo/latvaj literoj";

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
#    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15FB;|&#5627;)(.*?)</pr>,<pr>$1ī$2</pr>,g); # ᗻ
#    $chg += ($xml =~ s|<pr>(.*?)(?:&#x15E3;)(.*?)</pr>|<pr>$1ē$2</pr>|g); # ᗣ
#    $chg += ($xml =~ s|<pr>(.*?)(?:&#x15D1;)(.*?)</pr>|<pr>$1ā$2</pr>|g); # ᗑ
#    $chg += ($xml =~ s|<pr>(.*?)(?:&#x163B;)(.*?)</pr>|<pr>$1ū$2</pr>|g); # ᘻ
#    $chg += ($xml =~ s|<pr>(.*?)(?:&#x161D;)(.*?)</pr>|<pr>$1ō$2</pr>|g); # ᘝ

    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15D1;|&#5585;)(.*?)</pr>,<pr>$1&#257;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15E3;|&#5603;)(.*?)</pr>,<pr>$1&#275;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15F3;|&#5619;)(.*?)</pr>,<pr>$1&#291;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15FB;|&#5627;)(.*?)</pr>,<pr>$1&#299;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1607;|&#5639;)(.*?)</pr>,<pr>$1&#311;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x160C;|&#5644;)(.*?)</pr>,<pr>$1&#316;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1616;|&#5654;)(.*?)</pr>,<pr>$1&#326;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x161D;|&#5661;)(.*?)</pr>,<pr>$1&#333;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1627;|&#5671;)(.*?)</pr>,<pr>$1&#343;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x163B;|&#5691;)(.*?)</pr>,<pr>$1&#363;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15D0;|&#5584;)(.*?)</pr>,<pr>$1&#256;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15E2;|&#5602;)(.*?)</pr>,<pr>$1&#274;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15F2;|&#5618;)(.*?)</pr>,<pr>$1&#290;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x15FA;|&#5626;)(.*?)</pr>,<pr>$1&#298;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1606;|&#5638;)(.*?)</pr>,<pr>$1&#310;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x160B;|&#5643;)(.*?)</pr>,<pr>$1&#315;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1615;|&#5653;)(.*?)</pr>,<pr>$1&#325;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x161C;|&#5660;)(.*?)</pr>,<pr>$1&#332;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x1626;|&#5670;)(.*?)</pr>,<pr>$1&#342;$2</pr>,g);
    $chg += ($xml =~ s,<pr>(.*?)(?:&#x163A;|&#5690;)(.*?)</pr>,<pr>$1&#362;$2</pr>,g);

    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15D1;|&#5585;)(.*?)</trd>,<trd lng="lv">$1&#257;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15E3;|&#5603;)(.*?)</trd>,<trd lng="lv">$1&#275;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15F3;|&#5619;)(.*?)</trd>,<trd lng="lv">$1&#291;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15FB;|&#5627;)(.*?)</trd>,<trd lng="lv">$1&#299;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1607;|&#5639;)(.*?)</trd>,<trd lng="lv">$1&#311;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x160C;|&#5644;)(.*?)</trd>,<trd lng="lv">$1&#316;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1616;|&#5654;)(.*?)</trd>,<trd lng="lv">$1&#326;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x161D;|&#5661;)(.*?)</trd>,<trd lng="lv">$1&#333;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1627;|&#5671;)(.*?)</trd>,<trd lng="lv">$1&#343;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x163B;|&#5691;)(.*?)</trd>,<trd lng="lv">$1&#363;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15D0;|&#5584;)(.*?)</trd>,<trd lng="lv">$1&#256;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15E2;|&#5602;)(.*?)</trd>,<trd lng="lv">$1&#274;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15F2;|&#5618;)(.*?)</trd>,<trd lng="lv">$1&#290;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x15FA;|&#5626;)(.*?)</trd>,<trd lng="lv">$1&#298;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1606;|&#5638;)(.*?)</trd>,<trd lng="lv">$1&#310;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x160B;|&#5643;)(.*?)</trd>,<trd lng="lv">$1&#315;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1615;|&#5653;)(.*?)</trd>,<trd lng="lv">$1&#325;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x161C;|&#5660;)(.*?)</trd>,<trd lng="lv">$1&#332;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x1626;|&#5670;)(.*?)</trd>,<trd lng="lv">$1&#342;$2</trd>,g);
    $chg += ($xml =~ s,<trd lng="lv">(.*?)(?:&#x163A;|&#5690;)(.*?)</trd>,<trd lng="lv">$1&#362;$2</trd>,g);

# ĝustaj
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

# malĝustaj
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



    if ($chg) {
        process::write_file(">",$art,$xml);

        # nova versio
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($art,"/tmp/shanghoj.msg");

        print "...$chg ŝanĝo(j)! [$shanghoj]\n" if ($verbose);
    }
}
