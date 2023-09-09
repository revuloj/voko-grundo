#!/usr/bin/perl
##################################################
# konvertas la esignojn post apliko de piv2vkl   #
##################################################

# en la komandlinio donu cxiujn analizendajn dokumentojn
# alikaze vi estos demandata
# la rezulto estas skribata al STDOUT, do voku tiel
# por ricevi la tekston ekz. en piv1.vkl

#     perl esignoj.pl piv1.vkl > piv2.vkl

# la transformo okazas tiel: 
# Cxx ... sxx -> &Ccirc; ... &scirc;
# Uxx -> &Ubreve; uxx -> &ubreve;

#######################################################
#
# ricevu la argumentojn au alikaze demandu ilin
if (not @ARGV) {
  print "Kiuj dosiero(j) estu konvertata(j)?\n> ";
  $dosieroj = <STDIN>;
  @ARGV = split(/[ ,;]+/,$dosieroj);
};

# tralaboru chiujn dosierojn konvertante chiujn liniojn
foreach $file (@ARGV) {
  open FILE, $file or die ">>Ne malfermebla: $file\n";

  # tralaboru la tutan dosieron
  while (<FILE>) {

    s/([CGHJS])xx/&$1circ;/gi;
    s/(U)xx/&$1breve;/gi;

    print;

  }
};

	
