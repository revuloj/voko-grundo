#!/usr/bin/perl

# 2012 de Less Kerr
# ĉar Kindlo ne subtenas "eo", "es" estas uzata anstataŭe. Dok konvertu viajn esperanto-librojn al lingvo "es", ekz. per
# Calibre, por uzi Revo kiel fonan vortaron.

$xmllok = "c:/users/les/downloads/revo/xml";
undef $/;
open OUT, ">revohtml.html";
open IN, "<prologo.html";
print OUT <IN>;
close IN;

#@artikoloj = ("$xmllok/pur.xml");
#@artikoloj = ("$xmllok/aspekt.xml", "$xmllok/flor.xml", "$xmllok/pur.xml", "$xmllok/river.xml");
@artikoloj = <$xmllok/*>;

foreach $artikolo (@artikoloj) {
  print "${artikolo}\n";
  open IN, "<$artikolo";
  $_ = <IN>;
  close IN;

  # artikolo
  s|.*<art\s+mrk="\$Id:\s+(.+?)\..+?>(.*)</art>.*|\n\n<hr/>\n\n<a name="$1"/>\n<idx:entry>\n<div class="art">$2\n</div>\n</idx:entry>|s;
  s|<var>.*?</var>||sg;  # variaĵoj
  s|<ofc>.*?</ofc>||sg;  # oficialecoj
  s|<fnt>.*?</fnt>||sg;  # fontoj
  s|<kap>\s*(.*?)\s*</kap>|<div class="artkap">\n  <idx:orth>$1</idx:orth>\n</div>\n|s;  # ĉefkapvorto
  s|<rad>(.+?)</rad>|$1|s;  # radiko
  $rad = $1;

  # derivaĵoj
  s|<drv\s+mrk="(.+?)">(.*?)</drv>|<a name="$1"/>\n<idx:entry>\n<div class="drv">$2</div>\n</idx:entry>|sg;
  s|<kap>\s*(.*?)\s*</kap>|<div class="drvkap">\n    <idx:orth>$1</idx:orth>\n  </div>|sg;
  s|<tld(\s.*?)?/>|${rad}|sg;  # tildoj

  # sencoj
#  s|<snc((\s+.*?)*?)\s+mrk="(.+?)"((\s+.*?)*?)>(.*?)</snc>|<a name="$3"/>\n<div class="snc"$1$4>• $6</div>|sg;  # krom Kindle Touch
  s|<snc((\s+.*?)*?)\s+mrk="(.+?)"((\s+.*?)*?)>(.*?)</snc>|<a name="$3"/>\n<div width="-24" $1$4>• $6</div>|sg;  # por Kindle Touch

  # priskribaj elementoj
  s|<gra><vspec>(.*?)</vspec></gra>|(<span class="gra">$1</span>)|sg;  # gramatiko
  s|<uzo(\s.*?)?>(.*?)</uzo>|<span class="uzo">&lt;$2&gt;</span>|sg;  # uzoj
  s|<dif>(.*?)</dif>|<span class="dif">$1</span>|sg;  # difinoj
  s|<ekz>(.*?)</ekz>|<span class="ekz">$1</span>|gs;  # ekzemploj
  s|<klr>(.*?)</klr>|<span class="klr">$1</span>|gs;  # klarigoj
  s|<refgrp(\s.*?)?>.*?</refgrp>||sg;  # referencoj
  s|<ref(\s.*?)?>(.*?)</ref>|$2|sg;
  s|\s*<trdgrp\slng="en">(.*?)</trdgrp>|$1|sg;  # tradukoj
  s|\s*<trdgrp\s.*?>.*?</trdgrp>||sg;
  s|\<trd\slng="en">(.*?)</trd>|<trd>$1</trd>|sg;
  s|\s*<trd\slng=.*?>.*?</trd>||sg;
  s|<trd>(.*?)</trd>|<span class="trd">[$1]</span>|gs;

  # supersignoj
  s|&Ccirc;|&#x0108;|g;
  s|&ccirc;|&#x0109;|g;
  s|&Gcirc;|&#x011c;|g;
  s|&gcirc;|&#x011d;|g;
  s|&Hcirc;|&#x0124;|g;
  s|&hcirc;|&#x0125;|g;
  s|&Jcirc;|&#x0134;|g;
  s|&jcirc;|&#x0135;|g;
  s|&Scirc;|&#x015c;|g;
  s|&scirc;|&#x015d;|g;
  s|&Ubreve;|&#x016c;|g;
  s|&ubreve;|&#x016d;|g;

  # netigoj
  s|\s*([.;:])|$1|sg;  # spaco antaŭ iaj interpunkcioj
  s|\s*\(\)||sg;  # malplenaj parentezoj

  print OUT $_;
}

print OUT "\n\n</div>\n\n</body>\n\n</html>\n";
close OUT;
