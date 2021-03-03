#!/usr/bin/perl

####################################################
# konvertas sgml-vortaron al HTML-formo kun indeksoj
#
# uzo:
#   cd /pado/al/mia/vortaro/
#   vokofaru.pl [/pado/al/vortaro.sgm] 
#
#   normale vortaro.sgml estu en la subdosierujo sgm
######################################################

# cxu $VOKO estas difinita?
$VOKO = $ENV{'VOKO'} or 
    die "Mediovariablo VOKO ne estas difinita.\n";

# analizu la argumentojn

while (@ARGV) {
    if ($ARGV[0] eq '-h') {
	help_screen();
	exit;
    } elsif ($ARGV[0] eq '-v') {
	$verbose = shift @ARGV;
    } elsif ($ARGV[0] eq '-a') {
	$xml_html_cxiujn = shift @ARGV;
    } else {
	$agord_dosiero = shift @ARGV; 
    }
};

$|=1;

# legu la agordo-dosieron
unless ($agord_dosiero) { $agord_dosiero = "cfg/vortaro.cfg" };

open CFG, $agord_dosiero 
    or die "Ne povis malfermi agordodosieron \"$agord_dosiero\".\n";

while ($line = <CFG>) {
    if ($line !~ /^#|^\s*$/) {
	$line =~ /^([^=]+)=(.*)$/;
	$config{$1} = $2;
    }
}
close CFG;

$vortaro_pado=$config{"vortaro_pado"} || 
    die "vortaro_pado ne trovighis en la agordodosiero.\n";

$rilato_dos=$config{"rilato_dosiero"} ||
    die "rilato_dosiero ne trovighis en la agordodosiero.\n";

$indekso = $config{"indeks_dosiero"} || "$vortaro_pado/sgm/indekso.xml";
$inxtmp_dos = $config{"inxtmp_dosiero"} || $indekso;

# iru al dtd, por ke la dtd estu je ../dtd/vokoxml.dtd
#print "cd $vortaro_pado/dtd\n" if ($verbose);
#chdir("$vortaro_pado/dtd");

# transformu la dosierojn al HTML
$xml_pado="$vortaro_pado/xml";
$art_pado="$vortaro_pado/art";

# kreu indeksdosieron

###$command = "xml2inx.pl $verbose -c $agord_dosiero $xml_pado";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
####`$command`;

# cd ..
#print "cd $vortaro_pado\n" if ($verbose);
#chdir("$vortaro_pado");

# kreu HTML-indeksojn
###$command="rilatoj.pl $verbose $xml_pado > $rilato_dos";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
###open LOG, "$command|"; while (<LOG>) { print }; close LOG;

###$command="tezauro.pl $verbose $agord_dosiero";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
###open LOG, "$command|"; while (<LOG>) { print }; close LOG;

$command="ant -file $VOKO/ant/tezauro.xml -Dmi.bazo=$vortaro_pado agordo mil";
print "$command\nTIME:",`date`,"\n" if ($verbose);
open LOG, "$command|"; while (<LOG>) { print }; close LOG;

###$command="tradukoj.pl $verbose -c $agord_dosiero";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
###open LOG, "$command|"; while (<LOG>) { print }; close LOG;

###$command="indeks.pl $verbose $agord_dosiero";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
###open LOG, "$command|"; while (<LOG>) { print }; close LOG;

$command="ant -file $VOKO/ant/indeksoj.xml -Dmi.bazo=$vortaro_pado agordo cvs-shanghoj eraroj tuto";
print "$command\nTIME:",`date`,"\n" if ($verbose);
open LOG, "$command|"; while (<LOG>) { print }; close LOG;

#$command="indeks_js.pl $verbose $agord_dosiero";
#print "$command\nTIME:",`date`,"\n" if ($verbose);
#open LOG, "$command|"; while (<LOG>) { print }; close LOG;

###$command="tajperaroj.pl $verbose -H $xml_pado -c $agord_dosiero > $vortaro_pado/inx/eraroj.html";
###print "$command\nTIME:",`date`,"\n" if ($verbose);
###open LOG, "$command|"; while (<LOG>) { print }; close LOG;

$command = "xml2html_all.pl $verbose -m -c $agord_dosiero";
print "$command\nTIME:",`date`,"\n" if ($verbose);
open LOG, "$command |" || die "Ne povis dukti\n";
while (<LOG>) { print };
close LOG;
print "\nTIME:",`date`,"\n" if ($verbose);

# se pasis manpleno da tagoj, shovu la indeks-dosieron, por
# ke ghi atingu la TTT-servilon (sed ja ne tro ofte)
#if ($indekso ne $inxtmp_dos) {
#    $tempdif = (stat "$inxtmp_dos")[9] - (stat "$indekso")[9];
#    if ($tempdif > 7*24*60*60)  {  # 7 tagoj
#	print "pli ol 7 tagoj pasis: mv $inxtmp_dos $indekso\n";
#	`mv $inxtmp_dos $indekso`;
#    }
#}

######## fino ###########

sub help_screen {
print <<EOM
vokofaru.pl (c) VOKO, 1997-1998 - libera softvaro
  
uzo:
   cd /pado/al/mia/vortaro/
   vokofaru.pl ([-a] [-v] | [-h]) [<agord-dosiero>]

   Tio faras el la artikoloj en la subdosierujo xml 
   la indeksojn en HTML-formo en la subdosierujo inx
   kaj indeksdosieron por la seræado sgm/indekso.xml.
   Kun la opcio -a ankaý la HTML-artikoloj en art.

   Por la konvertado estas necesa Perl kun la modulo XML::Parser 
   
   -a kreu æiujn HTML-artikolojn, ne nur de þanøitaj artikoloj
   -h montru tiun æi helpon
   -v skribu mesaøojn pri la progreso sur la ekranon

EOM
;
}








