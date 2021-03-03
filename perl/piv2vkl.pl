#!/usr/bin/perl
############################################
# konvertas tekstformaton de piv al vkl    #
############################################

# en la komandlinio donu cxiujn analizendajn dokumentojn
# alikaze ghi estas legata de STDIN
# la rezulto estas skribata al STDOUT, do voku tiel
# por ricevi la tekston ekz. en piv.vkl

#     perl piv2vkl.pl piv.txt > piv.vkl

# vi povas ankau ordigi la vortojn lau komencliteroj
# en unuopajn dosierojn, tiukaze voku:

#    perl piv2vkl.pl -v -o -f -dartikoloj piv.txt

# -o = ordigu
# -dartikoloj = metu chiujn dosierojn en ./artikoloj
# -f = forigu unue chiujn dosierojn *.vkl tie
# -v = raportu informojn dum la procedo en STDERR

# por kolekti la proced- kaj erar-informojn vi
# sendu ilin en dosieron anstatau en STDERR per
# alpendigo de:  2> err.log

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

#######################################################
#  legu la argumentojn de la komandlinio
#

$verb = 0;
$ordigu = 0;
$dosierujo = '.';
$forigu = 0;
@files;

# analizu la argumentojn
foreach $arg (@ARGV) {
#    print "$arg ";
    if ($arg eq '-f') { $forigu = 1 }
    elsif ($arg eq '-o') { $ordigu = 1 }
    elsif ($arg eq '-v') { $verb = 1 }
    elsif ($arg =~ /^\-d(.*)/) { 
	$dosierujo = $1;
	if ($dosierujo !~ /\/$/) { $dosierujo .= '/' };
    }
    else {@files = (@files,$arg)};
};

#indekso de la kapvortoj kaj derivajhoj
$inxfn=$dosierujo."vortaro.inx";

#print "\nforigu: $forigu\n";
#print "ordigu: $ordigu\n";
#print "verb: $verb\n";
#print "dosierujo: $dosierujo\n";
#print "files: @files\n";

# ricevu la argumentojn au alikaze demandu ilin
#if (not @files) {
#  print "Kiuj dosiero(j) estu konvertata(j)?\n> ";
#  $dosieroj = <STDIN>;
#  @files = split(/[ ,;]+/,$dosieroj);
#};

# forigu malnovajn dosierojn
if ($forigu and $ordigu) {
    `rm $dosierujo/*.vkl`;
    `rm $inxfn`; 
};

# skribu la komencon de la vortaro
#KAPLINIOJ();
DIFINOJ();
$lasta_litero;
$lasta_radiko;
$n_radiko = 1;

open INX,">>$inxfn" or die ">>Ne povis krei $inxfn";

if (@files) {
    # tralaboru chiujn dosierojn konvertante chiujn artikolojn
    foreach $file (@files) {
	open STDIN, "$file" or die ">>Ne malfermebla: $file\n";

	TRALABORU();
	close STDIN;
    };
} else {
    # legu el STDIN
    TRALABORU();
};

close INX;

sub TRALABORU {
    my $romia_cifero = '(?:<P>)?\s*(?:<B>)?\s*[IVX]{1,4}\-\s*(?:<P>)?';
    my $majusklo = '(?:<B>)?[A-F](?:<P>)?\)';
    my @linioj;   
 
    # legu la unuan linion
    $line = <STDIN>;

    while ($line) {
	@linioj = ($line);
 	# legu la sekvajn liniojn ghis ili ne plu komencighas je romia cifero
	$line = <STDIN>;
	while ($line =~ /^$romia_cifero|^$derivajho1|^$majusklo/) {
	    @linioj = (@linioj,$line);
	    $line = <STDIN>;
	};
        # prilaboru la legitajn liniojn
	$artikolo = join('',@linioj);

#  while ($line = <STDIN>) {
    # ellasu malplenajn liniojn
#    while ($line =~ /^$/) { $line=<FILE> };
    # la unua linio de la artikolo
#    $artikolo = $line;
    # prenu la sekvajn nemalplenajn liniojn
#    while ($line = <FILE> and not $line =~ /^$/) {
#      $artikolo .= $line;
#    };
    # transformu la unuopan artikolon
#    if ($artikolo) { 
	
	# chu estas komenco de nova litero?
	
	if ($artikolo =~ /^(?:<B>)?\^?[A-Z](?:<P>)?\s*$/) {
	    SEKCIO($artikolo);
	} else {
	    ARTIKOLO($artikolo) 
	};
       
	
#    }; 
  };

  # finu la lastan sekcion, se estas
  SEKCIO('');
};

# skribu la finon de la vortaro
#PIEDLINIOJ();

sub KAPLINIOJ {
    print "<!DOCTYPE vortaro SYSTEM \"vokosgml.dtd\" >\n\n";
    print "<vortaro>\n<prologo>\n";
    print "<titolo>Vortaro</titolo>\n";
    print "<autoro>a&ubreve;tomate konvertita de piv2vkl.pl</autoro>\n";
    print "</prologo>\n<precipa-parto>\n";
}

sub PIEDLINIOJ {
    print "</precipa-parto>\n";
    print "<epilogo>\n";
    print "Tiu &ccirc;i vortaro estas a&ubreve;tomate konvertita de ";
    print "piv2vkl.pl.</epilogo>\n</vortaro>\n";
}

sub SEKCIO {
    my $teksto=$_[0];
    my $litero;

    if (not $ordigu) {
	$teksto =~/^(?:<B>)?(\^?[A-Z])(?:<P>)?\s*$/;
	$litero=$1;

	$litero =~ s/\^([CGHJS])/$1xx/;
	$litero =~ s/\^U/Uxx/;

	if ($lasta_litero) { print "</sekcio>\n\n\n" };
	$lasta_litero = $litero;
	if ($litero) {print "<sekcio litero=\"$litero\">\n\n"};
    };
}

###################################################################
#             kelkaj difinoj poste uzotaj
#

sub DIFINOJ {
    # helpvariabloj por pli facile formuli la signochenojn
    my $stel = '(STEL)?';
    my $mallong = '[A-Za-z][\.] ?[A-Za-z]';
#    my $vort = '[a-zA-Z\- ]+!?';
    my $vort = '[a-zA-Z\- ]+';
    my $vort_au_mallong = '('.$vort.'|'.$mallong.')';
    my $p = '(?:<P>)'; my $p_ = $p.'?';
    my $b = '(?:<B>)'; my $b_ = $b.'?';
    my $i = '(?:<I>)'; my $i_ = $i.'?';
    my $maj = '[A-Z]'; my $min = '[a-z]';
    my $dfn = '([^<].*?\:?)'; # difino ne komencighu per <

    $fako = 
	'2MAN|AGR|ANA|ARKE|ARKI|AST|AUT|AVI|BAK|BELA|BELE|BIB|BIO|BOT|BUD|'.
	'ELE|EKON|EKOL|ELET|FAR|FER|FIL|FIZL|FIZ|FON|FOT|'.
	'GEOD|GEOG|GEOM|GEOL|GRA|HER|HIS|HOR|ISL|JUR|'.
	'KAT|KEM|KIN|KIR|KOME|KOMP|KON|KRI|KUI|LIN|'.
	'MAR|MAS|MAT|MAH|MED|MET|MIL|MIN|MIT|MUZ|NEO|'.
	'PAL|POE|POL|PRA|PSI|RAD|REL|SCI|SPO|STA|SHI|'.
	'TEA|TEK|TEKS|TEL|TIP|TRA|ZOO';

    $fakoj = '(?:\s*(?:'.$fako.')\s+)+';
    $ntr = '\(n?tr\)';
    $radikfonto = '(\/|<\+>[1-9l]<P>)?';
    $fino = '(aj|oj|[oaie]|!)?';
    $zamenhof = '(?:<\+>\s?([ZBGKXNVC])\s?(?:<P>)?)?';
    # kapvorto konsistas el radiko+fontindiko+finajho
    # $1 = radiko, $2 = radikfonto, $3 = $finajho, $4 = Zamenhof
    # (?:...) estas grupo ne ligota al variablo $n
                                  # " " kaj \. aldonita, espereble ne prbl.
                                  # mallongigo aldonita
                                  # kapvorto nun devas fini je \. au " "
    $kapvorto = $stel.$b.$vort_au_mallong.$p_.$radikfonto.$b_.$fino.$p_
	.$zamenhof.'[\. ]?\s?';
    # derivajho konsistas el grasaj "iuj literoj" + "~" + "iuj literoj"
    # $1 = antau tildo, $2 = post tildo, $3 = zamenh, $4 = resto
    $derivsekv = '(?=\s*'.$maj.'|\.|'.$ntr.'|=|'.$b_.'1|'.$fako.')';
    $dertild = '([A-Z]?[a-z !]*)~([a-z ,~!]*)'.$p_.$radikfonto.$b_.$fino;
    $dertild1 = '[A-Z]?[a-z ]*~[a-z ,~]*'.$p_.$radikfonto.$b_.$fino;
    $derivajho = $stel.$b.$dertild.$p_.$zamenhof.'\s*'.$b_.$derivsekv;
    $derivajho1 = $stel.$b.$dertild1.$p_.$zamenhof.'\s*'.$b_.$derivsekv;
    # sencoj komencighas per grasa cifero
    $senco = $b.'\s*([1-9][1-9]?)\s*'.$p_;
    # subsencoj komencighas per grasa a), sed povas okazi,
    # ke la grasigsigno jam estas antau la sencocifero
    $subsnc_a = '(?=\s*'.$b_.'a'.$p_.'\)'.$p_.')';
    $subsncgrp_A = '(?=\s*'.$b_.'A'.$p_.'\)'.$p_.')';
    $sencdif = $dfn.$subsnc_a;
    $sencsubgrpdif = $dfn.$subsncgrp_A;
    $difino = $dfn.'(?=SAG|MAN|RIM|$)';
    $sencgrpdif = $dfn.'(?='.$senco.')';
    my $oblikv_ref = '<I>.*?<P>(?:\,\s*<I>.*?<P>)*';
    $referenco = '(SAG|MAN)\s*((?:'.$oblikv_ref.'|[a-z\s,0-9]*)\.?)';
    $refnombro = '(\s*<I>[0-9]+<P>\s*)?';
    $difinref = '(^\s*|;\s*)='.$p_.'\s*'.$b_.'([a-z]+)'
      .$p_.'\s*'.$refnombro.'\s*([\(\.,]|$)';
    $ekzemplo = $i.'(.*?)'.$p;
    $ekzfonto = '<\+>\s*([ZBGKXN])\s*<P>';
    $klarigo = '(\(.*?\))';
    $rimarko = 'RIM'.$b_.'[\.\s]'.$p_.'\s*([1-9])?\s*(.*?)';
    $tildo = '(\w*)~(\w*)';
}

##################################################################
#             
# ANALIZI LA STRUKTURON DE LA ARTIKOLO: 
#    KAPVORTO, DERIVAJXOJ, DIFNIOJ, CITAJXOJ,...

sub ARTIKOLO {
    local $artikolo = $_[0];
    my $sekva,$litero;
    local $radiko;

    # forigu erararetojn, malglatajhojn, anstatauigu E-signojn ktp.
    PREPARU(); 

    # se ordigi la artikolojn en diversajn dosierojn ...
    if ($ordigu) {
	$artikolo =~ /^$kapvorto/; # $1=*; $2=rad; $3=fnt; $4=fin; $5=Z
	# se temas pri finajho, uzu ghin, alikaze la radikon
        if ($2 eq '-') {$litero=$4} else {$litero=$2};	
        # prenu la unuan literon kiel dosiernomo
        $litero =~ /([a-z\?]x?)/i;
	$litero = lc($1);
	if (not $litero) { 
	    warn "Eraro: kapvorto sen komenclitero ("
		.substr($artikolo,0,20).")\n";
	    $litero = 'xx';
	};
	
	# skribu la artikolon fine de la dosiero $litero.vkl
	open OUTPUT, ">>$dosierujo/$litero.vkl" 
	    or die "Ne malfermebla: $litero.vkl\n";
	select OUTPUT;
    };

    
    # generu la radikon por marki la artikolon
    $artikolo =~ /^$kapvorto/; # $1=*; $2=rad; $3=fnt; $4=fin; $5=Z
    if ($2.$4) {
	$radiko=RADIKO($2,$4);
	print "<!--++++++++++++++++++++ $radiko ++++++++++++++++++++-->\n";
	print "<art mrk=\"$radiko\">\n";
    } else { 
	print "<art>\n";
	print "<!--++++++++++++++++++++ ????? ++++++++++++++++++++-->\n";
    };

    # trovu la KAPVORTON
    # $1=*; $2=rad; $3=fnt; $4=fin; $5=Z 
    $artikolo =~ s/^$kapvorto/KAPVORTO($1,$2,$3,$4,$5)/e;
    my $rad=$2, $fin=$4, $stel=$1;

    if (not $rad) { KAPVORTO('',substr($artikolo,0,20),'','','') };
  
    # la kapvorto estas jam la unua derivajho
    if ($rad eq '-') {
	$sekva = $artikolo =~ s/(.*?)(?=$derivajho1|$)/
		    DERIVAJHO($stel,$rad,'','','','',$1)/ex } # $ant = '-'
    else { 
	$sekva = $artikolo =~ s/(.*?)(?=$derivajho1|$)/
		    DERIVAJHO($stel,'','','',$fin,'',$1)/ex }; 
    
    # $sekva = $2;

    # trovu la aliajn derivajxojn lau graseco kaj tildo
    while ($sekva) {
	$sekva = (($artikolo =~ 
	    s/$derivajho(.*?)(?=$derivajho1|$)/
		    DERIVAJHO($1,$2,$3,$4,$5,$6,$7)/ex)
		   and $7); # $1=*; $2=ant; $3=post; $4=fnt; $5=fin; $6=Z
                            # $7=teksto; $8 = sekva deriv
    };

    # chu restis io?
    if ($artikolo !~ /^\s*$/) { 
	# warn "ARTIKOLRESTO: $artikolo\n";
	RESTO($artikolo);
    };
		       
    print "</art>\n\n";

	if ($ordigu) { close OUTPUT };

}				   

######################################################################

### FORIGI DIVERSAJHOJN KAJ MALGLATAJHOJN, E-SIGNOJ KTP.
sub PREPARU {
#    my $artikolo = $_[0];

    # forigu linishanghojn
    $artikolo =~ s/\n/ /sg;
    # forigu duonspacojn
#    $artikolo =~ s/Û//sg;
    # forigu malghustan <P> au spacojn komence
    $artikolo =~ s/^\s*(?:<P>)*\s*//;
    # finu nefinitajn formatsignojn
    $artikolo =~ s/(<[BI\+]>[^<]*)(<[BI\+]>|$)/$1<P>$2/g;
    # forigu la lastan de du sisekvaj <P>
    $artikolo =~ s/(<P>[^<]*)<P>/$1/g;
    # forigu malplenajn formatigojn
    $artikolo =~ s/<[IB\+\-]>\s*<P>/ /g;
    # shovu spacojn tuj post formatsignoj antau ilin
    $artikolo =~ s/(<[BI\+]>)\s+/ $1/g;
    # shovu spacon antau <P> malantau ghin
    $artikolo =~ s/\s+(<P>)/$1 /g;
    # se la tildo pro eraro trovighas antau <B> au <I>, metu ghin internen
    $artikolo =~ s/~(<[IB]>)/$1~/g;
    # foje okazas, ke unuopa litero estas erare oblikvigita
    $artikolo =~ s/<I>([^0-9])<P>/$1/g;
    # foje okazas, ke unuopa punkto estas nenecese grasigita
    $artikolo =~ s/<B>(\.)<P>/$1/g;
    # anstatauigu E-signojn
    $artikolo =~ s/\^([CGHJSU])/$1xx/gi;
      # pro eraro en la originalo sho ne estis kiel ^s,^S 
      # sed kiel chr(241),chr(183)
    $artikolo =~ s/\361/sxx/g;
    $artikolo =~ s/\267/Sxx/g;
    # disigu la grasajn derivajhkapojn de la '1'
    $artikolo =~ s/<B>([a-z]*~[a-z]*)\s*1<P>/<B>$1<P> <B>1<P>/gi;
    # foje mankas punkto antau rimarko
    $artikolo =~ s/([a-z\)])\s*(RIM(?:<B>)?\.)/$1\. $2/g; 
    # foje estas spaco komence
    $artikolo =~ s/^\s+//;
    # foje che sufikso la streko ne estas grasigite
    $artikolo =~ s/^(STEL)?\-<B>/$1<B>\-/;
}

sub RADIKO {
    my ($rad,$fin) = @_;
    my $rez;

    if ($rad eq '-') { $rez = $fin }         # finajho
    elsif ($rad =~/^\-/) { 
	$rad =~ s/^\-//;
        $rez = $rad }      # sufikso
    elsif ($rad =~ /!$/) {
	$rad =~ s/!$//;
	$rez = $rad }      # interj.!
    else { $rez = $rad }; # radiko

    # anstauigu E-signojn
    $rez =~ s/([CGHJSU])xx/$1x/ig;
    
    $lasta_radiko=$rez;

    #limigu al 6 literoj
    $rez = substr($rez,0,6);
    
    if (lc($rez) eq lc($lasta_marko)) { $rez .= $n_marko++ }
    else { $lasta_marko = $rez; $n_marko = 1 };

    print INX "[$rez]\n";

    return "$rez";
}


sub KAPVORTO {
    my ($stel,$rad,$font,$fin,$zam) = @_;
    my $rez;

    if ($verb) { print STDERR "[$rad$fin]\n" };
#    print INX "[$rad$fin]\n";

    print "<kap>\n";
    if ($stel) { print "<fnt>*</fnt>\n" };

    if ($rad eq '-') { 
	print "$rad" }         # finajho
    elsif ($rad =~/^\-/) { 
	$rad =~ s/^\-//;
	print "-<rad>$rad</rad>" }      # sufikso
    elsif ($rad =~ /!$/) {
	$rad =~ s/!$//;
	print "<rad>$rad</rad>!" }      # interj.!
    else { print "<rad>$rad</rad>" }; # radiko

    if ($font) { 
	$font =~ s/<\+>//;
	$font =~ s/<P>//;
	if ($font eq '/') { print "$font" } else {
	    print "<fnt>$font</fnt>"
	};
    };

    if ($fin) {
	if ($rad eq '-') { print "<rad>$fin</rad>\n" } 
	else { print "$fin\n" };
    };

    if ($zam)  { print "<fnt>$zam</fnt>\n" };
    print "</kap>\n";
    
    return '';
}

sub DERIVAJHO {
    my ($stel,$ant,$post,$fnt,$fin,$zam,$teksto) = @_;
    my $n,$s,$s1,$s2,$sekva,$sencgrp;
    my @romiaj = ('0','I','II','III','IV','V','VI','VII','VIII','IX','X');
    my $latina; # = estas vershajne, ke la teksto enhavas lat. trad.
    my $majuskl;

    $post .= $fin;

#    $sencgrp = ($teksto =~ /^\s*(?:<B>)?I[\-\.](?:<P>)?/);

    # chu temas pri majusklo?
    if ($ant =~ s/^([A-Z])$//) { $majuskl = $1; };

    if ($verb) { print STDERR "\t$ant~$post " };

    # konstruu markon
    my $mrk="$radiko.$ant~$post";
    $mrk =~ s/~/0/g;
    $mrk =~ s/([CGHJSU])xx/$1x/ig;
    $mrk =~ s/[^a-zA-Z0-9\.]//g;

    # konstruu senradikan markon por la indekso
    my $inxmrk="$ant~$post";
    $inxmrk =~ s/~/0/g;
    $inxmrk =~ s/([CGHJSU])xx/$1x/ig;
    $inxmrk =~ s/[^a-zA-Z0-9\.]//g;

    my $inx;
    # konstruu indeksero(j)n
    # se ~ estas en $post, tiam temas pli pluraj vortoj
    foreach $inx (split(',',"$ant~$post")) {
	$inx =~ s/~/$lasta_radiko/g;
	$inx =~ s/([CGHJSU])xx/$1x/ig;
	$inx =~ s/[^a-zA-Z0-9\.! ]//g;
	$inx =~ s/^\s+//;
	$inx =~ s/\s+$//;
	print INX "$inx#$inxmrk\n";
    };

#    $inx = "$ant$lasta_radiko$post";
#    print INX "ant: $ant; rad: $lasta_radiko; post: $post\n";
#    $inx =~ s/~/0/g;
#    $inx =~ s/([CGHJSU])xx/$1x/ig;
#    $inx =~ s/[^a-zA-Z0-9\.# ]//g;
#    $inx =~ s/^\s+//;
#    $inx =~ s/\s+$//;
#    print INX "$inx\n";

    # anstatauigu restintajn tildojn en $post
    $post =~ s/$tildo/TILDO($1,$2)/eg;

    print "<drv mrk=\"$mrk\">\n";
    print "<kap>";
    if ($stel) { print "<fnt>*</fnt>"; };

    # traktu la unuan tildon
    $post =~ /^(\w*)(.*)$/;
    my $p1=$1; my $p2=$2;
    print TILDO($ant,$p1),$p2;
#    print "$ant<tld";
#    if ($majuskl) { print " lit=\"$majuskl\"";};
#    print ">$post";

    $fnt =~ s/<\+>//;
    $fnt =~ s/<P>//;
    if ($fnt) { print "<fnt>$fnt</fnt>";};
    if ($zam) { print "<fnt>$zam</fnt>" };
    print "</kap>\n";

    # Se mankas la <B> komence, tiam aldonu
    $teksto =~ s/^\s?(1<P>)/<B>$1/;
    # Se restis . au <P> au spaco, tiam forigu
    $teksto =~ s/^\.?\s?(?:<P>)?\s?//;
    
    # analizu gramatikajn informojn kaj fakojn...
    $latina = ($teksto =~ /(?:^|\s)(?:BOT|ZOO)[\s,]/);
    $teksto =~ s/^($ntr)\.?\s*/VORTSPECO($1)/e;
    $teksto =~ s/^($fakoj)\s*/FAKOJ($1)/e;

    $sencgrp = ($teksto =~ /^\s*(?:<B>)?I[\-\.](?:<P>)?/);

    # analizu la restintan tekston
    $n = 1; $sekva = 'io';
    if (not $sencgrp) {

	# povas esti difinparto antau la sencnumero
	$teksto =~ s/^$sencgrpdif/DIFINO($1)/e;
	$teksto =~s/^\s+//;

	while ( $sekva ) {
	
	    if ($verb) { print STDERR " $n" };

	    $s = '(?:\s|<B>)'.$n.'(?:\s|<P>)'; 
	    $s1 = '(?:\s|<B>)'.++$n.'(?:\s|<P>)'; 
	    $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SENCO($1,$latina,$n-1).$2/e) 
		       and $2);
	}
    } else {
	while ( $sekva ) {
	
	    if ($verb) { print STDERR " $romiaj[$n]" };

	    $s = '(?:^|\s|<B>)'.$romiaj[$n].'[\.\-](?:\s|<P>)'; 
	    $s1 = '(?:\s|<B>)'.$romiaj[++$n].'[\.\-](?:\s|<P>)'; 
	    $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SENCGRUPO($1).$2/e) and $2);
        };
    };

    if ($verb) { warn "\n" };

    # se temas nur pri unu senco sen numero, ghi restis
    # en $teksto
    if ($teksto) { SENCO($teksto,$latina); };
    
    print "</drv>\n";
	
    return '';
}

sub VORTSPECO {
    my $vortspec=$_[0];

    # forigu eblajn krampojn
    $vortspec =~ s/^\(|\)$//g;
 
    if ($vortspec) { 
	print "<gra><vspec>$vortspec";
	print "</vspec></gra>\n";
    };
    return '';
}

sub FAKOJ {
    my @fakoj;
    my $fak;
    
    if ($_[0]) {
	@fakoj = split(/\s+/,$_[0]);
	
	foreach $fak (@fakoj) {
	    if ($fak =~ /$fako/) {
#		print "<uzo tip=\"fak\">".lc($fak)."</uzo>\n"
		print "<uzo tip=\"fak\">".$fak."</uzo>\n"
	    } elsif ($fak !~ /^\s*$/) { 
		warn "Nekonata fako: $fak\n";
	    };
	};
    };
    return '';
}

sub SENCGRUPO {
    my $teksto=$_[0];
    my $n,$s,$s1,$sekva;

    print "<sncgrp>\n";

    # analizu gramatikajn informojn kaj fakojn...
    $teksto =~ s/^\s*($ntr)\.?\s*/VORTSPECO($1)/e;
    $teksto =~ s/^($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
    $teksto =~s/^\s*$klarigo/UZO($1)/e;

    # fakoj komence?...
    $teksto =~ s/^\s*(?:<B>)?($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
#    $teksto =~s/^$klarigo/UZO($1)/e;

    # povas okazi subsencgrupoj
    if ($teksto =~ /^[^\(]*$subsncgrp_A/) { 

	# povas esti difinparto antau la subsencojo
	$teksto =~ s/^$sencsubgrpdif\s*/DIFINO($1)/e;
#	$teksto =~s/^\s+//;

	$n = 'A'; $sekva = 'io';
	while ( $sekva ) {
	
	    if ($verb) { print STDERR " $n" };

	    $s = '(?:\s|<B>)'.$n.'(?:\)\s|\)<P>|<P>\))'; 
	    $s1 = '(?:\s|<B>)'.++$n.'(?:\)\s|\)<P>|<P>\))'; 
	    $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SUBSENCGRUPO($1).$2/e) and $2);
	};
     } else {

	 # komenca difino sekvata de la sencoj?
	 $teksto =~ s/^$sencgrpdif\s*/DIFINO($1)/e;
	 $n = $2;
	 # forigu restintan spacon
	 $teksto =~ s/^\s+//;

	 if ($teksto =~ /^$senco/) {
	     # analizu la restintan tekston
	     $n = $n || 1; $sekva = 'io';
	     while ( $sekva ) {
		 if ($verb) { print STDERR " $n" };

		 $s = '(?:\s|<B>)'.$n.'(?:\s|<P>)'; 
		 $s1 = '(?:\s|<B>)'.++$n.'(?:\s|<P>)'; 
		 $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SENCO($1,'',$n-1).$2/e)
			    and $2);
	     };
	    
	  
	     # chu restis io?
	     if ($teksto !~ /^[\s\.,;:]*$/) { 
		 warn "\nRESTO: $teksto\n"; 
		 RESTO($teksto);
	     };
	
	} else {
	    # estas nur unu senco
	    SENCO($teksto);
        };
    };

    print "</sncgrp>\n";
    
    return '';
};

sub SUBSENCGRUPO {
    my $teksto=$_[0];
    my $n,$s,$s1,$sekva;

    print "<subsncgrp>\n";

    # analizu gramatikajn informojn kaj fakojn...
    $teksto =~ s/^\s*($ntr)\.?\s*/VORTSPECO($1)/e;
    $teksto =~ s/^($fakoj)\s*/FAKOJ($1)/e;
    
    # enkrampa uz-klarigo komence?
    $teksto =~s/^\s*$klarigo/UZO($1)/e;

    # fakoj komence?...
    $teksto =~ s/^\s*(?:<B>)?($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
#    $teksto =~s/^$klarigo/UZO($1)/e;

 
    # komenca difino sekvata de la sencoj?
    $teksto =~ s/^$sencgrpdif\s*/DIFINO($1)/e;
    $n = $2;
    # forigu restintan spacon
    $teksto =~ s/^\s+//;

    if ($teksto =~ /^$senco/) {

	 # analizu la restintan tekston
	 $n = $n || 1; $sekva = 'io';
	 while ( $sekva ) {
	     if ($verb) { print STDERR " $n" };

	     $s = '(?:\s|<B>)'.$n.'(?:\s|<P>)'; 
	     $s1 = '(?:\s|<B>)'.++$n.'(?:\s|<P>)'; 
	     $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SENCO($1,'',$n-1).$2/e) 
			and $2);
	 };


	 # chu restis io?
	 if ($teksto !~ /^[\s\.,;:]*$/) { 
	     warn "\nRESTO: $teksto\n"; 
	     RESTO($teksto);
	 };

    } else {
	# estas nur unu senco
	SENCO($teksto);
    };

    print "</subsncgrp>\n";
    
    return '';
};

sub SENCO {
    my ($teksto,$latina,$num)=@_;
    my $n,$s,$s1,$sekva;

    print "<snc";
    if ($num) { print " num=\"$num\""};
    print ">\n";

    # analizu gramatikajn informojn kaj fakojn...
#    $s = '(?:\s|<B>)1(?:\s|<P>)';
    $teksto =~ s/^\s*($ntr)\.?\s*/VORTSPECO($1)/e;
    $teksto =~ s/^($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
    $teksto =~s/^\s*$klarigo/UZO($1)/e;

    # fakoj komence?...
    $teksto =~ s/^\s*(?:<B>)?($fakoj)\s*/FAKOJ($1)/e;
    $teksto =~s/^\s+//;

    # enkrampa uz-klarigo komence?
#    $teksto =~s/^$klarigo/UZO($1)/e;

    # difinanta referenco?
#    $teksto =~s/$difinref/$1.DIFINREFERENCO($2,$3).$4/ieg;

    # povas okazi subsencoj
    if ($teksto =~ /^[^\(]*$subsnc_a/) { 

	# povas esti difinparto antau la subsencojo
	$teksto =~ s/^$sencdif\s*/DIFINO($1)/e;
#	$teksto =~s/^\s+//;

	$n = 'a'; $sekva = 'io';
	while ( $sekva ) {
	
	    if ($verb) { print STDERR " $n" };

	    $s = '(?:\s|<B>)'.$n.'(?:\)\s|\)<P>|<P>\))'; 
	    $s1 = '(?:\s|<B>)'.++$n.'(?:\)\s|\)<P>|<P>\))'; 
	    $sekva = (($teksto =~ s/^$s(.*?)($s1|$)/SUBSENCO($1).$2/e) and $2);
	};

    } else {

	# difino finighas au per punkto au per dupunkto sekvata
	# de ekzemploj, referencoj au rimarko.
	if ($teksto !~ /^SAG|^MAN|^RIM/) {
	    $teksto =~ s/^$difino/DIFINO($1,$latina)/e };

	#referencoj: $1= SAG|MAN $2= la enahvo de la ref.
	while ($teksto =~ s/^\s*$referenco/REFERENCO($1,$2)/eg){};

	# forigu restintan punkton a.s. de la komenco
	$teksto =~s/^[.;:\s]*//;

	# ekzemploj: "oblikvaj literoj"+"fonto"+"klarigo"+[;.,]
#	while ($teksto =~ 
#	       s/^$ekzemplo([\s\.,;]*)(?:$ekzfonto)?\s*(?:$klarigo)?
#	       \s*([;,\.])?/EKZEMPLO($1,$2,$3,$4,$5)/ex){};
       
	# rimarkoj fine de la derivajho: RIM. + iuj literoj... ghis la fino
	$teksto =~ s/$rimarko(RIM|$)/RIMARKO($1,$2,$latina).$3/e;
	while ($3 =~ /RIM/) {
	    $teksto =~ s/$rimarko(RIM|$)/RIMARKO($1,$2,$latina).$3/e;
	};

    };
    
    # chu restis io?
    if ($teksto !~ /^[\s\.,;:]*$/) { 
	warn "\nRESTO: $teksto\n"; 
	RESTO($teksto);
    };

    print "</snc>\n";
    
    return '';
}

sub SUBSENCO {
    my $teksto=$_[0];

    print "<subsnc>\n";

    # analizu gramatikajn informojn kaj fakojn...
    $teksto =~ s/^\s*($ntr)\.?\s*/VORTSPECO($1)/e;
    $teksto =~ s/^($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
    $teksto =~s/^\s*$klarigo/UZO($1)/e;

    # fakoj komence?...
    $teksto =~ s/^\s*(?:<B>)?($fakoj)\s*/FAKOJ($1)/e;

    # enkrampa uz-klarigo komence?
#    $teksto =~s/^$klarigo/UZO($1)/e;

    # difinanta referenco?
#    $teksto =~s/$difinref/$1.DIFINREFERENCO($2,$3).$4/ieg;

    # difino finighas au per punkto au per dupunkto sekvata
    # de ekzemploj.
    $teksto =~ s/^$difino/DIFINO($1)/e;

    #referencoj: $1= SAG|MAN $2= la enahvo de la ref.
    while ($teksto =~ s/^$referenco/REFERENCO($1,$2)/eg){};

    # forigu restintan punkton a.s. de la komenco
    $teksto =~s/^[.;:\s]*//;

    # ekzemploj: "oblikvaj literoj"+"fonto"+"klarigo"+[;.,]
#    while ($teksto =~ 
#	   s/^$ekzemplo([\s\.,;]*)(?:$ekzfonto)?\s*(?:$klarigo)?
#	   \s*([;,\.])?/EKZEMPLO($1,$2,$3,$4,$5)/ex){};
  
    # rimarkoj fine de la derivajho: RIM. + iuj literoj... ghis la fino
    $teksto =~ s/$rimarko(RIM|$)/RIMARKO($1,$2,$latina).$3/e;
    while ($3 =~ /RIM/) {
	$teksto =~ s/$rimarko(RIM|$)/RIMARKO($1,$2,$latina).$3/e;
    };

    # chu restis io?
    if ($teksto !~ /^[\s\.,;:]*$/) { 
	warn "\nRESTO SUBSENCO: $teksto\n";
	RESTO($teksto);
    };

    print "</subsnc>\n";
    
    return '';
}

sub DIFINO {
    my $dif = $_[0];
    my $latina = $_[1];

    print "<dif>\n";

    # difinanta referenco?
    $dif =~s/$difinref/$1.DIFINREFERENCO($2,$3).$4/ieg;

    # difino povas enhavi klarigojn
#    $dif =~ s/$klarigo/KLARIGO_ENA($1,$latina)/eg;

    # se vershajnas, ke latina traduko estas ene, serchu
    if ($latina) {
	$dif =~ s/(\([^\)]+)<I>([A-Za-z\.,]+)<P>([^\)]*\))/
	    $1.TRADUKO($2,'la').$3/eg};

    # ekzemploj: "oblikvaj literoj"+"fonto"+"klarigo"+[;.,]
    while ($dif =~ 
	   s/$ekzemplo([\s\.,;]*)(?:$ekzfonto)?\s*(?:$klarigo)?
	   \s*([;,\.])?/EKZEMPLO_ENA($1,$2,$3,$4,$5)/ex){};
  
    # aliformu <B>,<+>,<->
    $dif =~ s/<B>(.*?)<P>/<em>$1<\/em>/g;
    $dif =~ s/<\+>(.*?)<P>/<sup>$1<\/sup>/g;
    $dif =~ s/<\->(.*?)<P>/<sub>$1<\/sub>/g;

    # povus okazi, ke <I>,<B>,<P> restis, vershajne estas eraro
    if ($dif =~ /<[PIB]>/) { 
	warn "ebla eraro: restis <IPB> en la difino.\n";
    }; 
    $dif =~ s/<[IBP]>//g;

    # unuopaj <, > ?
    $dif =~ s/&/&amp;/g;
    $dif =~ s/<([^a-z\/])/&lt;$1/g;
    $dif =~ s/([^a-z"\/])>/$1&gt;/g;

    # anstatauigu tildojn
    $dif =~ s/$tildo/TILDO($1,$2)/eg;
#    $dif =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $dif =~ s/~/<tld>/g;

    print "$dif\n";
    print "</dif>\n";

    return '';
}

sub DIFINREFERENCO {
    my ($ref,$nombr) = @_;
 
    # forigu <B> kaj <P>
    $ref =~ s/\.?<[BP]>//g;
    $nombr =~ s/.*([0-9]+).*/ $1/;

#    print "<ref tip=\"dif\">$ref $nombr</ref>\n";

    return "<ref tip=\"dif\">$ref$nombr</ref>";
}

sub REFERENCO {
    my ($spec,$ref) = @_;
    my @refs,$r;
 
    if ($spec eq 'MAN') {print "<refgrp tip=\"sin\">\n"}
    elsif ($spec eq 'SAG') { print "<refgrp tip=\"vid\">\n"}
    else { warn "Nekonata referenctipo: $spec ($ref)\n" };

    # forigu <I> kaj <P>
    $ref =~ s/<[IP]>//g;
    # forigu eblan komencan punkton
    $ref =~ s/^\s*\.\s*//;

    # certigu, ke ne estas forgesitaj ' '-oj, kaj ne antau
    # interpunkciaj signoj
    $ref =~ s/\s*([,\.])\s*/$1 /g;
    
    #ligu nombrojn per '$' al la vortoj
    $ref =~ s/([a-z])\s([0-9]*)/$1\$$2/g;

    # pluraj referencoj estas nun disigitaj ' '
    @refs = split(' ',$ref);

    for $r (@refs) {
	# la '$' anstatauigu nun denove per ' '
	$r =~s/\$/ /g;
	$r =~ s/^(.*?)([,\.]?)$//;
	print "<ref>$1</ref>$2\n"
    };

    print "</refgrp>\n";

    return '';
}

sub EKZEMPLO {
    my ($ekz,$p1,$font,$klarig,$p2) = @_;

    # anstatauigu tildojn
    $ekz =~ s/$tildo/TILDO($1,$2)/eg;
#    $ekz =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $ekz =~ s/~/<tld>/g;

    # konservu interpunkcian signon
    $p1 .= $p2;
    $p1 =~ s/^[^;\.,]*([;\.,]?).*$/$1/;

    print "<ekz>";
    print "$ekz";
    if ($font) { print "<fnt>$font</fnt>" };
    if ($klarig) { 
	print "\n";
	KLARIGO($klarig);
	};
    print "$p1\n";
    print "</ekz>\n";
    
    return '';
}

sub EKZEMPLO_ENA {
    my ($ekz,$p1,$font,$klarig,$p2) = @_;
    my $rez;

    # anstatauigu tildojn
    $ekz =~ s/$tildo/TILDO($1,$2)/eg;
#    $ekz =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $ekz =~ s/~/<tld>/g;

    # konservu interpunkcian signon
    $p1 .= $p2;
    $p1 =~ s/^[^;\.,]*([;\.,]?).*$/$1/;

    $rez = "<ekz>$ekz";
    if ($font) { $rez .= "<fnt>$font</fnt>" };
    if ($klarig) { 
	$rez .=  "\n";
	$rez .= KLARIGO_ENA($klarig);
	};
    $rez .= "$p1\n";
    $rez .= "</ekz>";
    
    return $rez;
}

sub UZO {
    my $klarig = $_[0];

    # anstatauigu tildojn
    $klarig =~ s/$tildo/TILDO($1,$2)/eg;
#    $klarig =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $klarig =~ s/~/<tld>/g;
    
    # chu restis iuj <B>,<I> ktp. en la klarigo?
    if ($klarig =~ /<[BI\+\-]>/) { 
	warn "ebla eraro: <BI+-> en la uzoklarigo\n" };
    $klarig =~ s/<[BIP\+\-]>//g;

    print "<uzo tip=\"klr\">$klarig</uzo>";

    return '';
}

sub KLARIGO {
    my $klarig = $_[0];
    my $latina = $_[1];

    # anstatauigu tildojn
    $klarig =~ s/$tildo/TILDO($1,$2)/eg;
#    $klarig =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $klarig =~ s/~/<tld>/g;

    # aliformu <B>,<+>,<->
    $klarig =~ s/<B>(.*?)<P>/<em>$1<\/em>/g;
    $klarig =~ s/<\+>(.*?)<P>/<sup>$1<\/sup>/g;
    $klarig =~ s/<\->(.*?)<P>/<sub>$1<\/sub>/g;
    
    # klarigo povas enhavi latinan tradukon
    if ($latina) { $klarig =~ s/<I>([A-Za-z\.,]+)<P>/TRADUKO($1,'la')/e };

    # klarigo povas konsisti el ekzemplo
    $klarig =~ s/^\((<I>.*?<P>)\)$/'('.EKZEMPLO_ENA($1).')'/e;

    # chu restis iuj <B>,<I> ktp. en la klarigo?
    if ($klarig =~ /<[BI\+\-]>/) { 
	warn "ebla eraro: <BI+-> en la klarigo\n" };
    $klarig =~ s/<[BIP\+\-]>//g;

    print "<klr>$klarig</klr>";

    return '';
}

sub KLARIGO_ENA {
    my $klarig = $_[0];
    my $latina = $_[1];

    # foje nur estas pluralo: (j), tiukaze ne temas pri klarigo
    if ($klarig eq '(j)') { return $klarig };

    # anstatauigu tildojn
    $klarig =~ s/$tildo/TILDO($1,$2)/eg;
#    $klarig =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $klarig =~ s/~/<tld>/g;
    
    # aliformu <B>,<+>,<->
    $klarig =~ s/<B>(.*?)<P>/<em>$1<\/em>/g;
    $klarig =~ s/<\+>(.*?)<P>/<sup>$1<\/sup>/g;
    $klarig =~ s/<\->(.*?)<P>/<sub>$1<\/sub>/g;
    
    # klarigo povas enhavi latinan tradukon
    if ($latina) { $klarig =~ s/<I>([A-Za-z\.,]+)<P>/TRADUKO($1,'la')/e };

    # klarigo povas konsisti el ekzemplo
    $klarig =~ s/^\((<I>.*?<P>)\)$/'('.EKZEMPLO_ENA($1).')'/e;

    # chu restis iuj <I> en la klarigo?
    if ($klarig =~ /<BI\+\-]>/) { 
	warn "ebla eraro: <BI+-> en la klarigo\n" };
    $klarig =~ s/<[BIP\+\-]>//g;

    return "<klr>$klarig</klr>";
}

sub RIMARKO {
    my ($nombr,$rim,$latina) = @_;

    # eble latinaj tradukoj
    if ($latina) {
	$rim =~ s/\(<I>([A-Za-z\.,]+)<P>\)/'('.TRADUKO($1,'la').')'/eg};

    # ekzemploj: "oblikvaj literoj"+"fonto"+"klarigo"+[;.,]
    $rim =~ s/$ekzemplo([\s\.,;]*)(?:$ekzfonto)?\s*(?:$klarigo)?
	\s*([;,\.])?/EKZEMPLO_ENA($1,$2,$3,$4,$5)/exg;

    # anstatauigu tildojn
    $rim =~ s/$tildo/TILDO($1,$2)/eg;
#    $rim =~ s/\b([A-Z])~/<tld lit="$1">/g;
#    $rim =~ s/~/<tld>/g;

    # rimarkoj foje enhavas emfazojn - grase skribendajn k.s.
    $rim =~ s/<B>(.*?)<P>/<em>$1<\/em>/g;
    $rim =~ s/<\+>(.*?)<P>/<sup>$1<\/sup>/g;
    $rim =~ s/<\->(.*?)<P>/<sub>$1<\/sub>/g;

    #forigu restintajn <I>,<P>,<B>
    $rim =~ s/<[IBP]>//g;

    if ($nombr) { print "<rim num=\"$nombr\">\n" }
    else { print "<rim>\n" };
    print "$rim\n";
    print "</rim>\n";

    return '';
}

sub TILDO {
    my ($ant,$post) = @_;
 
    if ($ant =~ /^[A-Z]$/) {
	# majuskligo de la komenclitero
	return "<tld lit=\"$ant\">$post";
    } elsif ($lasta_radiko =~ /^[a-z]/) {
	# minuskla radiko, normala trakto
	return "$ant<tld>$post";
    } else {
	# majuskla radiko, minuskligu la
	# derivajhojn krom ~o, ~io, ~ujo
	if ($ant) { 
	    # io venas antaue -> minuskligu
	    return "$ant<tld lit=\"".lc(substr($lasta_radiko,0,1))."\">$post";
	} elsif ($post =~ /^(?:i|uj)?oj?n?$/) {
	    # -io, -ujo, -o -> lasu majuskla
	    return "$ant<tld>$post"; 
	} else {
	    # alikaze minuskligu
	    return "$ant<tld lit=\"".lc(substr($lasta_radiko,0,1))."\">$post";
	};
	
    };
};


sub TRADUKO {
    my ($trad,$lingv) = @_;

    return "<trd lng=\"$lingv\">$trad</trd>";
}

sub RESTO {
    my $rest=$_[0];

    # anstatauigu < kaj >
    $rest =~ s/</&lt;/g;
    $rest =~ s/>/&gt;/g;

    print "<adm>RESTIS POST KONVERTO: $rest</adm>\n";
    
    return '';
};

####################################################
####################################################
