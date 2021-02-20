#!/usr/bin/perl

@fakoj=('2MAN','AGR','ANA','ARKE','ARKI','AST','AUT','AVI','BAK','BELA',
	'BELE','BIB','BIO','BOT','BUD','ELE','EKON','EKOL','ELET','FAR',
	'FER','FIL','FIZL','FIZ','FON','FOT','GEOD','GEOG','GEOM','GEOL',
	'GRA','HER','HIS','HOR','ISL','JUR','KAT','KEM','KIN','KIR',
	'KOME','KOMP','KON','KRI','KUI','LIN','MAR','MAS','MAT','MAH',
	'MED','MET','MIL','MIN','MIT','MUZ','NEO','PAL','POE','POL',
	'PRA','PSI','RAD','REL','SCI','SPO','STA','SHI','TEA','TEK',
	'TEKS','TEL','TIP','TRA','ZOO');

for $fako (@fakoj) {

    $fako=lc($fako);
    print "<a href=\"piv/fx_$fako.html\">";
    print "<img src=\"fakoj/$fako.gif\" alt=\"".uc($fako)."\"border=0>";
    print "</a>\n";

}
