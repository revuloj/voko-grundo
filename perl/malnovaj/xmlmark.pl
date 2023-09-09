#!/usr/bin/perl
####################################################################
# aldonu_markojn 
#   -> aldonas referencmarkojn en XML-vortaro
#      por povi referenci kapvortojn, derivajhojn kaj difinojn. T.e.
#      ghi aldonas atributojn marko=... al la strukturiloj <artikolo>,
#      <deriv> kaj <dif> laux la teksto en la strukturiloj <kapvorto>
#      <kapo> kaj la vicordo de la strukturiloj <dif>
#
# la konvertendan dosieron la programeto atendas cxe STDIN
# la rezulto trovigxos en STDOUT
# Pri la strukturo de XML-vortaro informas vortaro.dtd
# voku ghin ekz.
#
#    perl xmlmark.pl < vortaro.xml > rezulto.xml
#
####################################################################


  # legu unuopajn artikolojn

  $/ = '</art>';
  while (<>) {

    # la artikolan parton en ghi prilaboru, la reston lasu senshanghe 

    s|(<art[^>]*>.*?</art>)|aldonu_markojn_en_artikolo($1)|sie; 
    print $_;
  }

sub aldonu_markojn_en_artikolo {
  local $artikolo = $_[0];

  # forigu malnovajn markojn
  $artikolo =~ s|(<art.*?)mrk=\".*?\"(.*?>)|$1$2|sig; #"
  $artikolo =~ s|(<drv.*?)mrk=\".*?\"(.*?>)|$1$2|sig; #"
  $artikolo =~ s|(<snc.*?)mrk=\".*?\"(.*?>)|$1$2|sig; #"

  # eltrovu la kapvorton kaj enmetu markon en <artikolo..>
  $artikolo =~ m|<kap>(.*?)</kap>|si;
  $kapvorto = $1;
  $kapvorto =~ s|<[^>]*>||sg;
  $kapvorto =~ s|\&([CcGgHhJjSs])circ;|$1x|sg;
  $kapvorto =~ s|\&([Uu])breve;|$1x|sg;
  $kapvorto =~ s|[^A-Za-z0-9]||sg;
  $artikolo =~ s|(<art.*?)>|$1 mrk=\"$kapvorto\">|si; #"

  # enmetu markojn en <deriv..>
  $artikolo =~ s|(<drv.*?>.*?</drv>)|aldonu_markojn_en_deriv($1,$kapvorto)|sieg;

  return $artikolo;
}

# aldonas markojn en unuopa deriv-sekcio

sub aldonu_markojn_en_deriv {
  local ($sekcio,$kapvorto) = @_;

  #eltrovu la kapon kaj enmetu markon en <deriv..>
  $sekcio =~ m|<kap>(.*?)</kap>|si;
  $kapo = $1;
  $kapo =~ s|<tld>|0|sg;
  $kapo =~ s|<[^>]*>||sg;
  $kapo =~ s|\&([CcGgHhJjSs])circ;|$1x|sg;
  $kapo =~ s|\&([Uu])breve;|$1x|sg;
  $kapo =~ s|[^A-Za-z0-9]||sg;
  $sekcio =~ s|(<drv.*?)>|$1 mrk=\"$kapvorto.$kapo\">|si;

  #prilaboru la unuopajn sencojn por enmeti markojn lauxvice
  $n=1;
  $sekcio =~ s|(<snc.*?)>|$1." mrk=\"$kapvorto.$kapo\.".$n++."\">"|sieg;

  return ($sekcio);
}





