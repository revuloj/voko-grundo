package xmlpack;

##########################################################################
# helpfunkcioj por trakti XML-vortaron kreitan lau vortaro.dtd
#
# konvertado al html, serchado, indeksigo
#
# ekzemploj por uzo estas xml2html.pl kaj serchcgi.pl
##########################################################################

# shanghoj:
# <1.9.97> transformu_referencon nun testas, chu la referenco
#   estas farita per CGI-programeto, kaj se jes, ghi referencas
#   nur al la kapvorto

############### konstantoj, kiujn vi povas shanghi, se necesas ############

%flagetoj = ('germana','de1.jpg',
		'franca','fr1.jpg',
		'hispana','es1.jpg',
		'angla','gb1.jpg',
		'itala','it1.jpg',
		'pola','pl1.jpg');

#%ref_signoj = ('vidu','~>',
#		'difino','=',
#		'sinonimo','=>',
#		'antonimo','#>',
#		'supernocio','>>',
#		'malparto','<<');

%ref_simboloj = ('vidu','vidu.gif',
		'difino','difino.gif',
		'sinonimo','sinonimo.gif',
		'antonimo','antonimo.gif',
		'supernocio','supernoc.gif',
		'malparto','malparto.gif');

####################################################################
# nova
#   -> kreas novan objekton por trakti XML-vortaron,
#   kiel parametroj vi povas doni dosiernomon, simbolpadon, bildopadon,
#   referencon
####################################################################

sub nova {
  my $class = shift;
  my %params = @_;
  my $this = {};

  # kopiu la parametrojn;
  $this->{'dosiernomo'} = $params{'dosiernomo'};
  $this->{'simbolpado'} = $params{'simbolpado'};
  $this->{'bildopado'} = $params{'bildopado'};
  $this->{'referenco'} = $params{'referenco'};

  # baptu la novan objekton
  bless $this, $class;
}

####################################################################
# malfermu
#   ->malfermas la dosieron
####################################################################

sub malfermu {
  my $this = shift;

  open(DOSIERO,$this->{'dosiernomo'})
    || die "La dosiero $this->{'dosiernomo'} ne estis malfermebla.\n";

  $this->{'dosiero'} = DOSIERO;
}

####################################################################
# legu_artikolon
#   -> legas artikolon el la dosiero
####################################################################

sub legu_artikolon {
  my $this = shift;
  my $dosiero = $this->{'dosiero'};
 
  $/ = '</artikolo>';

  if ($_ = <$dosiero>) {
    if (s|.*?(<artikolo[^>]*>)|$1|si) {
      $this->{'artikolo'} = $_;
      return $_;
    }
  }  
}

##########################################################################
# traserchu_artikolon($kion,$kie,$rezulto)
#   -> traserchas la artikolon
#   $kion estas la serchmustro (= serchsignaro)
#   $kie donas strukturon, ene de kiu okazu la sercho
#   $rezulto donas strukturon, kiu estu redonata
#   ekz. traserchu_artikolon('^monto$','kapvorto','traduko')
#   redonas chiujn tradukojn trovitaj en la artikolo, kies
#   kapvorto estas ekzakte 'monto'
##########################################################################

sub traserchu_artikolon {
  $this = shift;
  my ($kion,$kie,$rezulto) = @_;
  my $artikolo = $this->{'artikolo'};
  my @rezulto;

  my $found = 0;
  # traserchu la partojn de la artikolo
  while (not $found and $artikolo =~ m|<$kie.*?>(.*?)</$kie>|sig) {
    $s = $1;	
    if ($s =~ m|$kion|s) { 
      $found = 1 
    };
  };

  # se vi trovis la serchatan, redonu la deziratan;
  if ($found) {
    while(m|(<$rezulto.*?>.*?</$rezulto>)|sig) {
      @rezulto = (@rezulto,$1);
    }
  }

  return @rezulto;
}

####################################################################
# kapvorto_de_la_artikolo
#   -> redonas la kapvorton de la aktuala artikolo
####################################################################

sub kapvorto_de_la_artikolo {
  my $this = shift;
  my $artikolo = $this->{'artikolo'};

  $artikolo =~ m|<kapvorto[^>]*>(.*?)</kapvorto>|si;

  return $1; 
}

##########################################################################
# transformu_artikolon_al_HTML
#   -> transformas unuopan artikolon
#      <artikolo..>..</artikolo> en HTML-forman. Por tio ghi
#      anstatauigas la XML-strukturilojn per HTML-strukturiloj kaj
#      solvas referencojn al markoj kaj bildoj.
##########################################################################

# analizas la parametrojn de strukturilo ( par1="..." par="..." ... )
sub analizu_parametrojn {
  local $params = $_[0];
  local %params = ();

  foreach $pair (split (' ',$params)) {
    if ($pair =~ /(.*)="?([^"]*)"?/) {
      ($key,$value) = ($1,$2);
      $params{$key} = $value;
    }
  }
  return %params;
};

sub transformu_artikolon_al_HTML {
  local $this = shift; 
  my $artikolo = $this->{'artikolo'};
  my $kapvort;
  my $bildopado = $this->{'bildopado'};
  my $bld;

  # traktu la E-signojn &Ccirc; -> Ch ... &ubreve -> u
  $artikolo =~ s/\&([CcGgHhJjSs])circ;/$1h/sg;
  $artikolo =~ s/\&([Uu])breve;/$1/sg;

  # analizu la markon en <artikolo marko=...> kaj
  # forigu la <artikolo>, </artikolo> - strukturilojn
  $artikolo =~ s|</artikolo>||sig;
  $artikolo =~ s|<artikolo(.*?)>||sig;
  local %params = analizu_parametrojn($1);

  #formatu la kapvorton
  $artikolo =~ s|<kapvorto.*?>(.*?)</kapvorto>|transformu_kapvorton($1,$params{'marko'})|sie;
  $kapvort=$1;

  #prilaboru la liston de derivajxoj
  $artikolo =~ s|<deriv(.*?)>(.*?)</deriv>|transformu_derivajhon($2,$1)|sieg;
	
  #forigu superfluajxojn
  $artikolo =~ s|</?artikolo>||sig;
  $artikolo =~ s|</?deriv>||sig;

  #Cxu bildo ekzistas?

  if ($params{'bildo'}) { 
    $bld = $params{'bildo'};
    $bld =~ s|.*/|$bildopado|s; # forigu la padon
    $artikolo .= "<p><img src=\"$bld\" alt=\"bildo\">";
  };

  #skribu la enhavon
  return $artikolo;
}

# prilaboras la kapvorton
sub transformu_kapvorton {
  local ($kapvorto,$marko) = @_;

  if ($marko) {
	return "<h2 id=\"$marko\"><a name=\"$marko\">$kapvorto</a></h2>";
  } else { 
	return "<h2>$kapvorto</h2>" 
  };
}

# prilaboras unuopan deriv-sekcion
sub transformu_derivajhon {
  my ($sekcio,$params) = @_;
  my %params = analizu_parametrojn($params);
  my $bildopado = $this->{'bildopado'};
  my $bld;

  #formatu la derivajx-kapon
  $sekcio =~ s|<kapo.*?>(.*?)</kapo>|transformu_kapon($1,$params{'marko'})|sie;

  #traktu la difinojn, esploru, kiom da estas
  $n = 0; while ($sekcio =~ m|<dif.*?>|sig) { $n++ };
  if ($n == 1) {
    $sekcio =~ s|<dif(.*?)>(.*?)</dif>|transformu_difinon($2,$1,0)|sieg; 
  } else {
    $n = 1;
    $sekcio =~ s|<dif(.*?)>(.*?)</dif>|transformu_difinon($2,$1,$n++)|sieg; 
  }

  #formatu la tradukojn
  $sekcio =~ s|<traduko(.*?)>(.*?)</traduko>|transformu_tradukon($2,$1)|sieg;

  #formatu la referencojn
  $sekcio =~ s|<ref(.*?)>(.*?)</ref>|transformu_referencon($2,$1)|sieg;

  #Cxu bildo ekzistas?
  if ($params{'bildo'}) { 
    $bld = $params{'bildo'};
    $bld =~ s|.*/|$bildopado|s; # forigu la padon
    $sekcio .= "<p><img src=\"$bld\" alt=\"bildo\">" 
  };

  return ($sekcio);
}

# prilaboras la kapon de derivajxo
sub transformu_kapon {
  local ($kapo,$marko) = @_;

  if ($marko) {
	return "<h3 id=\"$marko\"><a name=\"$marko\">$kapo</a></h3>";
  } else { 
	return "<h3>$kapo</h3>" 
  };
}

sub transformu_tradukon {
  my ($trad,$params) = @_;
  my %params = analizu_parametrojn($params);
  my $lingvo = $params{'lingvo'};
  my $flageto = $flagetoj {$lingvo};
  my $simbolpado = $this->{'simbolpado'};

  return "<br><img src=\"$simbolpado$flageto\" alt=$lingvo>$trad"
}

sub transformu_referencon {
  my ($referenco,$params) = @_;
  my %params = analizu_parametrojn($params);  
  my $tipo = $params{'tipo'};
#  local $refsigno = $ref_signoj{$tipo};
  my $refsimbolo = $ref_simboloj{$tipo};
  my $simbolpado = $this->{'simbolpado'};
  my $ref_str = $this->{'referenco'};

  $ref_str = '#%REF' unless $ref_str;
  my $celo = $params{'celo'};

  # se temas pri referenco realigita per CGI-programeto
  # referencu al la kapvorto, ne al derivajho au difino
  # Se la referenco entenas '#', ghi estas rigardata kiel 
  # endokumenta referenco.
  if ($ref_str =~ m|#|) {
    $ref_str =~ s|\%REF|$celo|;
  } else {
    $celo =~ s|_.*$||;
    $ref_str =~ s|\%REF|$celo|;
    $ref_str .= '#'.$params{'celo'};
  }

  local $ref_sim = "<img src=\"$simbolpado$refsimbolo\" alt=\"$tipo\">";
  return "$ref_sim<a href=\"$ref_str\">$referenco</a>";
};

sub transformu_difinon {
  my ($dif,$params,$n) = @_;
  my %params = analizu_parametrojn($params);
  my $marko = $params{'marko'};
  my $bld;
  my $bildopado = $this->{'bildopado'};

  if ($n > 0) { $str = "<strong>$n.</strong>" } else { $str = '' };
  if ($params{'bildo'}) { 
    $bld = $params{'bildo'};
    $bld =~ s|.*/||s; # forigu la padon
    $bld = "<img src=\"$bildopado$bld\" alt=\"bildo\">";
  } else { $bld='' };

  if ($marko) {
	return "<p id=\"$marko\"><a name=\"$marko\">$str$dif</a><p>$bld";
  } else { 
	return "<p>$str$dif</p>$bld"; 
  };
}

###############################################################################
# kion_indeksi($serch_mustro)
#   -> kreas liston lau la formo:
#        (vorto1 => kapvorto1,
#         vorto2 => kapvorto1,
#         vorto3 => kapvorto2,...)
#   kiun oni povas uzi por krei indekson. La vortoj estas
#   eltirataj per serchmustro (= serchsignaro), kiun vi donu kiel
#   argumento.
###############################################################################

sub kion_indeksi {
  my $this = shift;
  my $serchu = shift;
  my $artikolo = $this->{'artikolo'};
  my $kapvorto;
  my %rezulto;
  my $vorto;

  #trovu la kapvorton
  m|<kapvorto.*?>(.*?)<\/kapvorto>|si;
  $kapvorto = $1;

  # traktu la E-signojn &Ccirc; -> Cx ... &ubreve -> ux
  $kapvorto =~ s/\&([CcGgHhJjSs])circ;/$1x/sg;
  $kapvorto =~ s/\&([Uu])breve;/$1x/sg;
   
  #trovu la nociojn laux la serchsignaro
  while (m|$serchu|sig) {

    $vorto = $1;

    # traktu la E-signojn &Ccirc; -> Ch ... &ubreve -> u
    $vorto =~ s/\&([CcGgHhJjSs])circ;/$1h/sg;
    $vorto =~ s/\&([Uu])breve;/$1/sg;

    $rezulto{$vorto} = $kapvorto;
  }

  return %rezulto;
}

######################################################################

1;