#!/usr/bin/perl
################################################
# kreas la dosierujostrukturon necesan
# por HTML-a vortaro
#
# uzo:
#   cd /pado/al/miaj/vortaroj/ 
#   [perl] vokoprep.pl <vortarnometo>
#
# versio: $Id: vokoprep.pl 147 2000-12-05 21:41:52Z revo $
################################################

# Via sistemo; þanøu laý neceso, momente eblas 'unix' kaj 'windows'
# Por 'mac' malsupre aldonu la komandojn por kreo de dosierujo kaj por kopiado

$SYSTEM = 'unix';

# sistemdependaj komandoj:
if ($SYSTEM eq 'unix') {
    $mkdir = 'mkdir';
    $copy  = 'cp';
} elsif ($SYSTEM eq 'windows') {
    $mkdir = 'md';
    $copy = 'copy';
} elsif ($SYSTEM eq 'mac') {
    die "Vi devas aldoni la komandojn por dosierujkreado kaj dosierkopiado.\n";
};

# La nometo de la vortaro (por identigi øin æe seræo inter pluraj vortaroj)
$nometo = shift @ARGV;
if (not $nometo or $nometo =~ /^\-h/) {
    help_screen();
    die "Vi ne indikis mallongan nomon por via vortaro.\n";
}

# La dosierujo de VOKO
die "Mediovariablo VOKO ne estas difinita.\n" 
    unless ($VOKO = $ENV{'VOKO'});

# Kreu subdosieron $nometo
if (not -e "$nometo") {
    `$mkdir $nometo`;
} else {
    print "La dosierujo \'$nometo\' jam ekzistas, æu tamen procedi (j/n)? ";
    if (getc ne "j") { die "finita de la uzanto\n"; }
};

# kreu la dosierujojn art,inx,bin,dok,dsl,dtd,inx,rtf,sgm,smb,stl,xml
for $dos ('art','bld','cfg','cgi','inx','bin','dok','dtd',
	 'inx','tez','rtf','sgm','smb','stl','xml') {

    if (not -e "$nometo/$dos") {
	`$mkdir $nometo/$dos`;
    };
};

# kopiu la necesajn dosierojn
`$copy $VOKO/dtd/*.dtd $nometo/dtd/`;
`$copy $VOKO/smb/*.* $nometo/smb/`;
`$copy $VOKO/stl/*.css $nometo/stl/`;
`$copy $VOKO/div/*.* $nometo/`;
`$copy $VOKO/dok/*.htm $nometo/dok/`;
`$copy $VOKO/dok/*.txt $nometo/dok/`;
`$copy $VOKO/cgi/*.* $nometo/cgi/`;
`$copy $VOKO/cfg/*.* $nometo/cfg/`;

# En sercxo.htm difinu value=$nometo
open IN,"$VOKO/div/sercxo.html";
$in = join('',<IN>);
close IN;
$in =~ s/(<input[^>]*name=\"?vortaro\"?\s+value=\"?)[a-z]*/$1$nometo/s;
open OUT,">$nometo/sercxo.html";
print OUT $in;
close OUT;

sub help_screen {
print <<EOM
vokoprep.pl (c) VOKO, 1997-1998 - libera softvaro

uzo:
   cd /pado/al/miaj/vortaroj/
   [perl] vokoprep.pl <vortaronometo>

   Tio preparas la dosierstrukturon por HTML-versio de SGML-vortaro.
   <vortaronometo> estas mallonga nomo identiganta vian vortaron.
   Dosierujo kun sama nomo estas kreata en la momenta dosierujo.
  
   Devas esti difinita la mediovariablo VOKO en via sistemo, æar
   de tie vokoprep.pl kopias multajn dosierojn al via nova vortaro.

EOM
;  
}






