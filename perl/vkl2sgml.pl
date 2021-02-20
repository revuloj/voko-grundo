#!/usr/bin/perl
###########################################################
# konvertas la specialajn signojn post apliko de piv2vkl   #
# kaj aldonas referencojn
############################################################

# en la komandlinio donu cxiujn analizendajn dokumentojn
# alikaze vi estos demandata
# la rezulto estas skribata al STDOUT, do voku tiel
# por ricevi la tekston ekz. en piv1.vkl

#     perl esignoj.pl vortaro.vkl > vortaro.sgml
# enmetu opcion -s por indiki la unuopajn sekcioj A ... Z

# la transformo okazas tiel: 
# Cxx ... sxx -> &Ccirc; ... &scirc;
# Uxx -> &Ubreve; uxx -> &ubreve;

#######################################################
#
# ricevu la argumentojn au alikaze demandu ilin
#if (not @ARGV) {
#  print "Kiuj dosiero(j) estu konvertata(j)?\n> ";
#  $dosieroj = <STDIN>;
#  @ARGV = split(/[ ,;]+/,$dosieroj);
#};

# kelkaj difinoj
$doctype="<!DOCTYPE vortaro PUBLIC \"-//VoKo//DTD vortaro//EO\" >";

############## komenco de la programeto

# analizu la argumentojn

# chu indiki la unuopajn sekciojn?
$sekcioj = $ARGV[0] eq '-s';
if ($sekcioj) { shift @ARGV };

# chu unu au plurajn dosierojn kreu?
$pluraj = $ARGV[0] eq '-p';
if ($pluraj) { shift @ARGV };

%index;

# se temas pri nur unu dosiero, kreu ghin jam nun
if (not $pluraj) {
    $outfile = $ARGV[0];
    $outfile =~ s/[^\/]*$//;
    $inxfile = $outfile.'vortaro.inx';
    $outfile .= 'vortaro.sgml';
    OPEN($outfile);

    #legu la indekson
    open INX,$inxfile;
    while ($vorto = <INX>) {
	chop($vorto);
	if ($vorto =~ /^\[(.*)\]$/) {
	    $kap = $1;
	} else {
	    # forigu la parton post la '#'
	    $vorto =~ s/#(.*)$//;
	    my $kap2 = $1;
	    # forigu la '#' kaj antatauigu '~' per '0'
	    $kap2 =~ s/^#//;
	    $kap2 =~ s/~/0/g;
	    # memoru la markon
	    $index{$vorto} = "$kap.$kap2";
#print "$index{$vorto}\n";
	};
    };
};


# tralaboru chiujn dosierojn konvertante chiujn liniojn
if (@ARGV) {
    foreach $file (@ARGV) {
	$file =~ /(.*)\.[^\.]*/;
  
	if ($pluraj) {
	    $outfile = $1.'.sgml';
	    OPEN($outfile);
	};

	if ($sekcioj) {
	    #la dosiernomo respondas al la sekciolitero
	    $file =~ /(?:\/|^)([cghjsu]x|[a-z])(?:\.vkl)?$/;
	    $litero = uc($1);
	    $litero =~ s/([CGHSJ])X/&$1circ;/;
	    $litero =~ s/UX/&Ubreve;/;
	};

	open STDIN, $file or die ">>Ne malfermebla: $file\n";  
	KONVERTI($litero);
	close STDIN;

	if ($pluraj) {CLOSE()};
    
    }
} else { KONVERTI() };

# se temis pri nu unu celdosiero, fermu ghin nun
if (not $pluraj) {CLOSE()};

sub OPEN {
    my $filename=$_[0];

    open OUTPUT, ">$outfile" or die ">>Ne malfermebla: $outfile\n";
    select OUTPUT;
    print "$doctype\n\n";
    print "<vortaro>\n";
    print "<precipa-parto>\n";
}

sub CLOSE {
    print "</precipa-parto>\n";
    print "</vortaro>\n";
    close OUTPUT;
}


sub KONVERTI {
  my $litero=$_[0];

  if ($sekcioj) {
      $first=1;
      SEKCIO($litero);
  };

  # tralaboru la tutan dosieron
  while (<STDIN>) {

    # referencoj
    s/<ref([^>]*)>(.*?)<\/ref>/REFERENCO($2,$1)/ige;

#    s/&([^a-zA-Z])/&amp;$1/g;

    # E-signoj
    s/([CGHJS])xx/&$1circ;/gi;
    s/(U)xx/&$1breve;/gi;

    # netraktitaj <BI>
    s/<BI>//g;

    # diversaj signoj lau
    # tiparo EspeTimes
    s/\200/&Auml;/g;
    s/\201/&Aring;/g;
    s/\202/&Ccedil;/g;
    s/\203/&Eacute;/g;
    s/\204/&Ntilde;/g;
    s/\205/&Ouml;/g;
    s/\206/&Uuml;/g;
    s/\207/&aacute;/g;
    s/\210/&agrave;/g;
    s/\211/&acirc;/g;
    s/\212/&auml;/g;
    s/\213/&atilde;/g;
    s/\214/&aring;/g;
    s/\215/&ccedil;/g;
    s/\216/&eacute;/g;
    s/\217/&egrave;/g;
    s/\220/&ecirc;/g;
    s/\221/&euml;/g;
    s/\222/&iacute;/g;
    s/\223/&igrave;/g;
    s/\224/&icirc;/g;
    s/\225/&iuml;/g;
    s/\226/&ntilde;/g;
    s/\227/&oacute;/g;
    s/\230/&ograve;/g;
    s/\231/&ocirc;/g;
    s/\232/&ouml;/g;
    s/\233/&otilde;/g;
    s/\234/&uacute;/g;
    s/\235/&ugrave;/g;
    s/\236/&ucirc;/g;
    s/\237/&uuml;/g;
    
    s/\317/&oelig;/g;
    s/\370/°/g;
    # ceteraj signoj

    # grekaj kaj aliaj speciale koditaj signoj
    s/#a#/&alfa;/g;
    s/#b#/&beta;/g;
    s/#oG#/°/g;
    s/#u#/ü/g;
    s/#W#/&omega;/g;
    s/#w#/&omega;/g;
    print;

  };
  #fermu
  if ($sekcioj) { SEKCIO('') };

};

sub REFERENCO {
    my ($ref,$args) = @_;
    my $ref1,$ref2;

    $ref1 = $ref;
    # anstatauigu E-signojn
    $ref1 =~ s/([CGHJSU])xx/$1x/gi;
    # forprenu difinciferon
    $ref1 =~ s/\s*([1-9])$//;
#    $cifer=$1;

    $ref2 = $ref;
    # anstatauigu E-signojn
    $ref2 =~ s/([CGHJS])xx/&$1circ;/gi;
    $ref2 =~ s/(U)xx/&$1breve;/gi;

    if ($index{$ref1}) {
	return "<ref$args cel=\"$index{$ref1}\">$ref2<\/ref>";
    } else {
	# provu majuskligi/minuskligi la unuan literon
	# por trovi la referencitan vorton
	my $u = substr($ref1,0,1);
        $ref1 = ($u eq uc($u) ? lc($u) : uc($u)) . substr($ref1,1);
        if ($index{$ref1}) {
	    return "<ref$args cel=\"$index{$ref1}\">$ref2<\/ref>";
	} else {
	    return "<ref$args>$ref2<\/ref>";
	};
    };
}

sub SEKCIO {
    my $lit=$_[0];

    # se ne temas pri la unua voko finu la antauan sekcion
    if (not $first) { print "</sekcio>\n\n\n" };
    # komencu novan sekcion
    if ($lit) { print "<sekcio litero=\"$lit\">\n\n" };
    $first=0;
}


	
