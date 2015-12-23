#!/usr/bin/perl
############################################
# konvertas tekstformaton de piv al html   #
############################################

# en la komandlinio donu cxiujn analizendajn dokumentojn
# alikaze vi estos demandata
# la rezulto estas skribata al STDOUT, do voku tiel
# por ricevi la tekston ekz. en piv.html

#     perl piv2html.pl piv.txt > piv.html

# la kruda piv-tekstformato uzas la sekvajn formatigilojn
# malplena linio disigas la artikolojn
# <B> grasigi
# <I> oblikvigi
# <+> altigi
# <-> malaltigi
# <P> fino de la formatigo
# la cetera sintaksto respondas al tiu presita en PIV
# la fakoj estas signitaj per 3 au 4 majuskloj
# la referencoj per MAN au SAG
# steleto per STEL

$verb = 1;

#######################################################
#
# ricevu la argumentojn au alikaze demandu ilin
if (not @ARGV) {
  print "Kiuj dosiero(j) estu konvertata(j)?\n> ";
  $dosieroj = <STDIN>;
  @ARGV = split(/[ ,;]+/,$dosieroj);
};

# skribu la komencon de la vortaro
print "<html><head><title>vortaraj artikoloj automate konvertitaj</title></head><body>\n\n";

# tralaboru chiujn dosierojn konvertante chiujn artikolojn
foreach $file (@ARGV) {
  open FILE, $file or die ">>Ne malfermebla: $file\n";

  # tralaboru la tutan dosieron
  while ($line= <FILE>) {
    # ellasu malplenajn liniojn
#    while ($line =~ /^$/) { $line=<FILE> };
    # la unua linio de la artikolo
    $artikolo = $line;
    # prenu la sekvajn nemalplenajn liniojn
#    while ($line = <FILE> and not $line =~ /^$/) {
#      $artikolo .= $line;
#    };
    # transformu la unuopan artikolon
    ARTIKOLO($artikolo); 
  };
};

# skribu la finon de la vortaro
print "</body></html>\n";

sub ARTIKOLO {
    
    $_ = $_[0];

    s/<B>(.*?)(?:<P>|$)/<b>$1<\/b>/sg;
    s/<I>(.*?)(?:<[Pb]>|$)/<i>$1<\/i>/sg;
    s/<\+>(.*?)(?:<[Pbi]>|$)/<sup>$1<\/sup>/sg;
    s/<\->(.*?)(?:<[Pbi\+]>|$)/<sub>$1<\/sub>/sg;
    s/STEL/<b>\*<\/b>/sg;
    s/([^2])MAN/$1<b>=><\/b>/sg;
    s/SAG/<b>\-><\/b>/sg;
    s/$/<p>\n/sg;

    print;
}
