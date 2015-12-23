#!/usr/bin/perl -w
#
# voku ekz.
#   ekzfnt.pl [-v] [-x art.xml | -e "citajho serchenda"] 
#       [-m ea345] [-c agordodosiero] [-n maks. trovnombro] [-s serchloko]
#
#   metodoj e: ekzakte
#           a: per String::Approx (per Levenshtein-distanco)
#           3,4,5: per 3-, 4-, 5-gramoj
#
################# komenco de la programo ################

use XML::Parser;
#use String::Approx 'amatch';

$debug = 0;
$|=1;

#########################

# pli mallongaj ekz./frazoj ne estas traktitaj
#$fraz_min_lit=10;
$ekz_min_lit=10;

# maksimume tiom da trovoj por unu ekz. estas 
# presataj kiel rezulto
$ekz_trov_max=5;

# kiom da shanghoj estas permesitaj 
# inter serchajho kaj trovloko
# che String::Approx::amatch
#$lim_approx='30%';

# kiom da n-gramoj de la citajho devas 
# trovighi en la frazo
$lim_ngram[3]=0.70; # 0.60 ... 0.90 shajnas bone
$lim_ngram[4]=0.60; # 0.50 ... 0.90 shajnas bone
$lim_ngram[5]=0.50; # 0.40 ... 0.90 shajnas bone

# la jhus traserchata dosiero
$serch_dosiero = '';

# la ekzemplolisto
@ekzemploj = ();

# la frazolisto de la traserchata dosiero
@frazoj = ();

########################

# analizu argumentojn

while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = 1;
	shift @ARGV;
    } elsif ($ARGV[0] eq '-x') {
	shift @ARGV;
	$xml = shift @ARGV;
    } elsif ($ARGV[0] eq '-e') {
	shift @ARGV;
	$ekz = shift @ARGV;
        $ekz_min_lit=3; 	
    } elsif ($ARGV[0] eq '-m') {
	shift @ARGV;
	$metodoj = shift @ARGV;
    } elsif ($ARGV[0] eq '-c') {
        shift @ARGV;
        $agordo_dosiero = shift @ARGV;
    } elsif ($ARGV[0] eq '-n') {
        shift @ARGV;
        $ekz_trov_max = shift @ARGV;
    } elsif ($ARGV[0] eq '-s') {
	shift @ARGV;
	$serchu_nur_en = shift @ARGV;
    } elsif ($ARGV[0] eq '-l') {
	$listigu = 1;
	shift @ARGV;
    } elsif ($ARGV[0] eq '-h' or $ARGV[0] eq '--help') {
	help_screen();
	exit 0;
    } else {
	help_screen();
        die "\nNevalida komandlinia argumento.\n";
    }
};

$metodoj = '4' unless ($metodoj);
$agordo_dosiero = "$ENV{'VOKO'}/cfg/ekzfnt.cfg" unless $agordo_dosiero;

# legu la agordo-dosieron
read_cfg();

if ($listigu) {
    tekstogrupoj();
    exit 0;
}

# elprenu la ekzemplojn el XML-atikolo
if ($xml) {
    extract_ekz($xml);
    die "Neniuj taugaj ekzemploj en \"$xml\"\n" unless (@ekzemploj);
    print_ekz();

# unuopa ekzemplo
} elsif ($ekz) {
    $ekz = preparu_ekz($ekz);
    die "Ekzemplo estas tro mallonga.\n" if (length($ekz)<$ekz_min_lit);
    unshift @ekzemploj, $ekz;
}

# serchu
serchu();
print_chiuj_trovoj();

############# Elpreni ekzemploj <ekz>...</ekz> el artikolo #########

sub extract_ekz {
    my $xml = shift; # XML-dosiero

    $radiko='';
    $ekzemplo='';

    my $parser = new XML::Parser(ParseParamEnt => 1,
				 ErrorContext => 2,
				 Handlers => {
				     Start => \&start_handler,
				     End   => \&end_handler,
				     Char  => \&char_handler}
				 );

    if ((-f "$xml") and ("$xml" =~ /\.xml$/)) {
	#warn "$dos/$file\n" if ($verbose);
	eval { $parser->parsefile("$xml") }; warn $@ if ($@);
    } else {
	die "Ne ekzistas \"$xml\", au ghi ne finighas je \".xml\".\n";
    }

    @ekzemploj = reverse(@ekzemploj);
};

sub char_handler {
    my ($xp, $text) = @_;

    if  (length($text) and 
	 (
	  $xp->in_element('kap') or
	  $xp->in_element('rad') or
	  $xp->in_element('ekz')
	 ))
    {
	$text = $xp->xml_escape($text);
#	print $text;
	$radiko .= $text if ($xp->in_element('rad'));
	
	$ekzemplo .= $text if ($xp->in_element('ekz'));

    }
} 

sub start_handler {
    my ($xp,$el,@attrs) = @_;
    my $attr;

    if (
	$el eq 'art' or
	$el eq 'kap' or
	$el eq 'ekz' 
	)
    {
	$attr = attr_str(@attrs);
	#print "<$el$attr>";
    }
    elsif ( $el eq 'tld' and 
	    ($xp->in_element('kap') or
	     $xp->in_element('ekz'))
	    ) 
    {
	my $lit = get_attr('lit',@attrs);
	my $rad = $radiko;
	if ($lit) {
	    my $len = length($lit); # necesa, æar en UTF-8 supersignaj literoj
	                            # estas du-bitokaj
	    $rad =~ s/^.{$len}/$lit/;
	}           
#	print $rad;

	$ekzemplo .= $rad if ($xp->in_element('ekz'));
    }
    $radiko = '' if ($el eq 'rad');
    $ekzemplo = '' if ($el eq 'ekz');
}

sub end_handler {
    my ($xp, $el) = @_;

    if (
	$el eq 'art' or
	$el eq 'kap' or
	$el eq 'ekz'
	)
    {
	#print "</$el>\n";
    } 

    if ($el eq 'ekz') {
	$ekzemplo = preparu_ekz($ekzemplo);
	if (length($ekzemplo) < $ekz_min_lit) {
	    warn ("Ekzemplo \"$ekzemplo\" estas tro mallonga\n");
	} else {
	    unshift @ekzemploj, $ekzemplo;
	}
    }
}

sub attr_str {
    my $result='';

    while (@_) {
	my $attr_name = shift @_;
	my $attr_val  = shift @_;
	if (($attr_name eq 'mrk') and ($attr_val =~/^\$Id/)) {
	    $attr_val =~ s/^\044Id:\s+([^,\.]+)\.xml,v.*\044$/$1/;
	}
	$result .= " $attr_name=\"$attr_val\"";
    }

    return $result;
}

sub get_attr {
    my($attr_name,@attr_list)=@_;

    while (@attr_list) {
        if (shift @attr_list eq $attr_name) { 
	    return shift @attr_list 
	    };
    };
    return ''; # atributo ne trovita;
};

################# legi la agordon ########################

sub read_cfg {
    my $alineo;

    open CFG, $agordo_dosiero 
	or die "Ne povis malfermi $agordo_dosiero: $!\n";

    eval join('',<CFG>);

    die $@ if ($@);

    close CFG;

    print "serchpado: ", $#serch_pado, "\n" if ($debug);
}

################# Serchfunkcioj ###########################

sub serchu {
    my $dos;
    @chiuj_trovoj = ();
    my %cfg;

    foreach $fonto (@serch_pado) {
	
	$serch_fonto = $fonto->{'id'};
	print "[", $serch_fonto, "]\n" if ($verbose);

	next if ($serchu_nur_en and $serchu_nur_en ne $serch_fonto);

        my $dir = $fonto->{'pado'};
        my $fin = $fonto->{'finajhoj'};

        opendir SDIR, $dir
	    or die "Ne povis malfermi $dir: $!\n";
        @dos = readdir SDIR;
        closedir SDIR;
    
        foreach $dos (@dos) {

	    # traserchu dosieron
	    if ($dos =~ /\.$fin$/i) {

		@trovoj = ();
		$serch_dosiero = "$dir/$dos";
		print "$serch_dosiero...\n" if ($verbose);

		# se necese preparu dosieron
		$cit_dosiero = $serch_dosiero;
		$cit_dosiero =~ s/\.$fin$/\.cit/i;
		unless (-e $cit_dosiero) {
		    preparu_dos($fonto->{'kodo'},$fin);
		}

		serchu_ekz();
		push @chiuj_trovoj, @trovoj;
		print_trovoj() if ($verbose and @trovoj);
	    }
       }
	
    }
}

sub preparu_ekz {
    my $ekz = shift;

    # x-konvencio de literoj por post povi facile apliki
    # regulajn esprimoj
    $ekz = utf8_cx($ekz);

    # normigu vortinterspacojn 
    $ekz =~ s/\W+/ /sg;

    return $ekz;
}

sub linebreaks {
    $txt = shift;
    $txt =~ s/[^\n]//sg;
    return $txt;
}

sub preparu_dos {
    my ($enc,$fin) = @_;

    @frazoj = ();
    my $linio = 1;

    open IN,$serch_dosiero or die "Ne povis malfermi $serch_dosiero: $!\n";
    my $txt = join('',<IN>);
    close IN;

    # forigu chiujn strukturilojn
    if ($fin =~ /html?|sgml?|xml/) {
	$txt =~ s/<([^>]{1,200})>/linebreaks($1)/seg;
    }

    # x-konvencio de literoj por poste povi facile apliki
    # regulajn esprimoj
    
    if ($enc eq 'utf8') {
       $txt = utf8_cx($txt);    
    } elsif ($enc eq 'lat3') {
       $txt = lat3_cx($txt);
    } elsif ($enc eq 'ch') {
       $txt = ch_cx($txt);
    } elsif ($enc eq 'cx') {
       # jam en ordo
    } elsif ($enc eq 'c^') {
       $txt = cteg_cx($txt);
    } elsif ($enc eq '^c') {
       $txt = tegc_cx($txt);
    } elsif ($enc eq 'entity') {
       $txt = entity_cx($txt);
    } elsif ($enc eq 'ccirc') {
       $txt = ccirc_cx($txt);
    } else {
       die "Nekonata literokodo $enc\n" if ($enc);
    }

    # forigu chiujn restintajn literunuojn, char ili
    # ghenas la frazfaradon (alternative oni povus literigi ilin)
    $txt =~ s/&\#?[a-z0-9_]+;//sg;

    # faru frazojn lau frazsignoj
    foreach $frazo (split(/[!\.;\?]/,$txt)) {

	my $n = 0;

	# Se frazo komenicghas per linirompoj, korektu je unu
	if ($frazo =~ s/^[ \t\r]*\n//) {
	    $linio++;
	}

	# nombru linifinojn
	$frazo =~ s/\n/++$n,' '/seg;

	# normigu vortinterspacojn
	$frazo =~ s/\W+/ /sg;
	
#	if (length($frazo)>=$fraz_min_lit) {
	    unshift @frazoj, [$linio,$frazo];
#	}

	$linio += $n;
    }

    save_frazoj();
}

sub save_frazoj {
    my $file = $serch_dosiero;

    $file =~ s/\.[a-z]+$/\.cit/;
    open OUT, ">$file" or die "Ne povis krei dosieron $file: $!\n";

    foreach $frazo (@frazoj) {
	print OUT $frazo->[0], ": ", $frazo->[1], "\n";
    }

    close OUT;
}
    

sub serchu_ekz {

    open CIT,$cit_dosiero
	or die "Ne povis malfermi $cit_dosiero: $!\n";

    while ($frazo = <CIT>) {

	local $n_ekz = 0;
	$frazo =~ /^(\d+):\s*(.*)$/;
	$frazo = [$1,$2];

	foreach $ekz (@ekzemploj) {
	
	    $n_ekz++;

	    # momente nur unu metodo estas
	    # permesita

	    if (index($metodoj,'e')>=0) {
		trovu_ekzakte($ekz,$frazo);
#	    } elsif (index($metodoj,'a')>=0) { 
#		trovu_approx($ekz,$frazo);
	    } elsif (index($metodoj,'3')>=0) {
		trovu_ngram($ekz,$frazo,3);
	    } elsif (index($metodoj,'4')>=0) {
		trovu_ngram($ekz,$frazo,4);
	    } elsif (index($metodoj,'5')>=0) {
		trovu_ngram($ekz,$frazo,5);
	    } else {
		die "Nevalida serchmetodo\n";
	    }
	}
    }

    close CIT;
}

sub ngram_match {
    my ($search,$text,$ngram_len) = @_;
    my ($i,$cnt) = (0,0);
    my $ngram_cnt = length($search) - $ngram_len + 1;

    for ($i=0; $i<$ngram_cnt; $i++) {
	$cnt++ if (index($text,substr($search,$i,$ngram_len)) >= 0);
    }

    return $cnt / $ngram_cnt;
}

# trovas ekzakte
sub trovu_ekzakte {
    my ($ekz,$frazo) = @_;

    if (index($frazo->[1],$ekz)>=0) {
	unshift @trovoj, 
	[$n_ekz,$frazo->[1],1.0,$serch_dosiero,$frazo->[0],$serch_fonto];
    }
}

# chiun frazon per String::Approx::amatch
#sub trovu_approx {
#    my ($ekz,$frazo) = @_;
#
#    if (amatch($ekz,[$lim_approx],($frazo->[1]))) {
#	unshift @trovoj, 
#	[$n_ekz,$frazo->[1],0.0,$serch_dosiero,$frazo->[0],$serch_fonto];
#    }
#}

# per n-gramoj
sub trovu_ngram {
    my ($ekz,$frazo,$n) = @_;
    my $proc = 0;

    $proc = ngram_match($ekz,$frazo->[1],$n);
    if ($proc > $lim_ngram[$n]) {
	unshift @trovoj, 
	[$n_ekz,$frazo->[1],$proc,$serch_dosiero,$frazo->[0],$serch_fonto];
    }
}

sub linebefore {
    my ($text, $n, $pattern) = @_;

#    @text = split(/\n/,$text);

    print "pattern: $pattern\n" if ($debug);

    for ($l = $n-2; $l>=0; $l--) {

	print "$l: $$text[$l]\n" if ($debug);

	if ($$text[$l] =~ /$pattern/) {
	    return $$text[$l];
	}
    }
}

sub linebeforeincluding {
    my ($text, $n, $pattern) = @_;

    #@text = split(/\n/,$text);

    print "pattern: $pattern\n" if ($debug);

    for ($l = $n-1; $l>=0; $l--) {

	print "$l: $$text[$l]\n" if ($debug);

	if ($$text[$l] =~ /$pattern/) {
	    return $$text[$l];
	}
    }
}

################### eligado ############################
    
sub print_trovoj {
#    print "en \"$serch_dosiero\":\n";

    foreach $trovo (@trovoj) {
	print "(", $trovo->[0], ") ";
	if ($trovo->[2] > 0) { printf "[%.0f%%] ", 100*$trovo->[2]; };
	print $trovo->[1],"\n";
    }

    print "\n";

}

sub print_ekz {    
    my $n=0;

    print "Ekzemploj en la artikolo:\n";

    foreach $ekz (@ekzemploj) {
	print "(", ++$n, ") $ekz\n";
    }

    print "\n";
}

sub print_chiuj_trovoj {
    my $n_ekz = 0;
    my $n_trov = 0;

    print "\nREZULTO:\n";

    unless (@chiuj_trovoj) {
	print "  Neniuj trovoj.\n";
	return;
    }
	    
    # ordigu lau ekz_numeroj kaj simileco
    @chiuj_trovoj = sort {
	($a->[0] <=> $b->[0]) || ($b->[2] <=> $a->[2])
    } @chiuj_trovoj;

    # eligu
    foreach $trovo (@chiuj_trovoj) {

	# la ekzemplo
	if ($n_ekz != $trovo->[0]) {
	    $n_ekz = $trovo->[0];
	    print "\n(", $n_ekz, ") ", $ekzemploj[$n_ekz-1], "\n";
	    print "_" x 50, "\n";

	    $n_trov=0;
	} else {
	    $n_trov++;
	}
	
	if ($n_trov < $ekz_trov_max) {

	    # la trovo
	    print "\n  En ", $trovo->[3], " lin. ", $trovo->[4], ":\n  ";
	    if ($trovo->[2] > 0) { printf "[%.0f%%] ", 100*$trovo->[2]; };
	    print $trovo->[1],"\n";

	    # la XML-a fontindiko
	    local $xml='';

	    open IN,$trovo->[3] 
		    or die "Ne povis malfermi ".$trovo->[3].":$!\n";
	    my $text = join('',<IN>);
	    close IN;

	    print "text: ", substr($text,0,50), "\n" if ($debug);

	    &{$trovo->[5]}(\$text,$trovo->[4],$trovo->[3]);

	    # eligu xml
	    print "\n$xml\n  ---\n";

	}

    }

    print "\n";

}

#################### konvertfunkcioj ###################

sub utf8_cx {
    $vort = shift;
    $vort =~ s/\304\210/Cx/g;
    $vort =~ s/\304\234/Gx/g;
    $vort =~ s/\304\244/Hx/g;
    $vort =~ s/\304\264/Jx/g;
    $vort =~ s/\305\234/Sx/g;
    $vort =~ s/\305\254/Ux/g;
    $vort =~ s/\304\211/cx/g;
    $vort =~ s/\304\235/gx/g;
    $vort =~ s/\304\245/hx/g;
    $vort =~ s/\304\265/jx/g;
    $vort =~ s/\305\235/sx/g;
    $vort =~ s/\305\255/ux/g;      
    return $vort;
}

sub lat3_cx {
    $vort = shift;
    $vort =~ s/\306/Cx/g;
    $vort =~ s/\330/Gx/g;
    $vort =~ s/\246/Hx/g;
    $vort =~ s/\254/Jx/g;
    $vort =~ s/\336/Sx/g;
    $vort =~ s/\335/Ux/g;
    $vort =~ s/\346/cx/g;
    $vort =~ s/\370/gx/g;
    $vort =~ s/\266/hx/g;
    $vort =~ s/\274/jx/g;
    $vort =~ s/\376/sx/g;
    $vort =~ s/\375/ux/g;      
    return $vort;
}

sub cteg_cx {
    $vort = shift;
    $vort =~ s/([cghsju])\^/$1x/ig;
    $vort =~ s/(u)~/$1x/ig;
    return $vort;
}

sub tegc_cx {
    $vort = shift;
    $vort =~ s/\^([cghsju])/$1x/ig;
    $vort =~ s/~(u)/$1x/ig;
    return $vort;
}

sub ch_cx {
    $vort = shift;
    $vort =~ s/([cghsj])h/$1x/ig;
    return $vort;
}

sub lat3_ccirc {
    $vort = shift;
    $vort =~ s/\306/&Ccirc;/g;
    $vort =~ s/\330/&Gcirc;/g;
    $vort =~ s/\246/&Hcirc;/g;
    $vort =~ s/\254/&Jcirc;/g;
    $vort =~ s/\336/&Scirc;/g;
    $vort =~ s/\335/&Ubreve;/g;
    $vort =~ s/\346/&ccirc;/g;
    $vort =~ s/\370/&gcirc;/g;
    $vort =~ s/\266/&hcirc;/g;
    $vort =~ s/\274/&jcirc;/g;
    $vort =~ s/\376/&scirc;/g;
    $vort =~ s/\375/&ubreve;/g;      
    return $vort;
}

sub cx_ccirc {
    $vort = shift;
    $vort =~ s/[CcGgHhJjSs]x/&$1circ;/g;
    $vort =~ s/[Uu]/&$1breve;/g;
    return $vort;
}

sub ccirc_cx {
    $vort = shift;
    $vort =~ s/&([CcGgHhJjSs])circ;/$1x/g;
    $vort =~ s/&([Uu])breve;/$1x/g;
    return $vort;
}

sub entity_ccirc {
    $vort = shift;
    $vort =~ s/&#264;/&Ccirc;/g;
    $vort =~ s/&#265;/&ccirc;/g;
    $vort =~ s/&#284/&Gcirc;/g;
    $vort =~ s/&#285;/&gcirc;/g;
    $vort =~ s/&#292;/&Hcirc;/g;
    $vort =~ s/&#293;/&hcirc;/g;
    $vort =~ s/&#308;/&Jcirc;/g;
    $vort =~ s/&#309;/&jcirc;/g;
    $vort =~ s/&#348;/&Scirc;/g;
    $vort =~ s/&#349;/&scirc;/g;
    $vort =~ s/&#364;/&Ubreve;/g;
    $vort =~ s/&#365;/&ubreve;/g;      
    return $vort;
}


sub entity_cx {
    $vort = shift;
    $vort =~ s/&#264;/Cx/g;
    $vort =~ s/&#265;/cx/g;
    $vort =~ s/&#284;/Gx/g;
    $vort =~ s/&#285;/gx/g;
    $vort =~ s/&#292;/Hx/g;
    $vort =~ s/&#293;/hx/g;
    $vort =~ s/&#308;/Jx/g;
    $vort =~ s/&#309;/jx/g;
    $vort =~ s/&#348;/Sx/g;
    $vort =~ s/&#349;/sx/g;
    $vort =~ s/&#364;/Ux/g;
    $vort =~ s/&#365;/ux/g;      
    return $vort;
}

sub romie_arabe {
    my $romie = shift;

    my @rom = ('0','I','II','III','IV','V','VI','VII','VIII','IX','X',
	       'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
	       'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII',
	       'XXIX','XXX');

    for ($n=0; $n < @rom; $n++) {
	if (uc($romie) eq $rom[$n]) {
	    return $n;
	}
    }

    warn "Nekonata romia cifero $romie\n";
    return '';
}

sub help_screen {

print <<EOH;
  ekzfnt.pl (c) 2000-2001 che Wolfram Diestel
            licenco: GPL 2.0

  
  uzo:

  ekzfnt.pl [-v] [-x <artikolo> | -e <serchajho>] 
            [-m ea345] [-c <agordodosiero>] [-n <maks. trovnombro>] 
            [-s <serchloko>] 
  ekzfnt.pl [-c <agordodosiero>] [-l] 
  ekzfnt.pl [-h|--help] 
		
  La programo serchas frazon au vorton en tekstaro. La traserchenda
  tekstaro estas priskribita en agordodosiero. La trovoj estas redonataj
  ordigitaj lau similecgrado kun la serchajho.
 
  Opcioj:
      -v  vortoricha, dum la sercho elighas la traserchataj
          dosieroj kaj trovajhoj

      -c  Agordodosiero, se ne donita \$VOKO/cfg/ekzfnt.pl estas uzata

      -e  Donas la serchatan esprimon (vorto(j)n au frazon)
      -x  Donas Voko-artikolon kies ekzemplofrazoj estas serchataj
    
      -m  Serchmetodo: 
	      e = ekzakta 
              a = proksimuma (Levenshtein-distanco, toleras tajperarojn)
              3,4,5 = n-gramo-sercho (komparas litergrupoj kaj multon toleras
                  kiel ellason de vortoj, alian vortordon ktp.)
      -n  Maks. trovnombro. Nur tiom da trovoj estas listigitaj
          en la fina raporto. Apriora valoro estas 5 (tauga por citajhoj).
          Por serchi je unuopaj vortoj eble uzu -n 100

      -h, --help  Montru tiun chi helpon

      -l  Listigu tekstogrupojn el la agordodosiero

      -s  Serchloko. Por la sercho estas uzataj nur la tekstoj
          donitaj en la donita tekstogrupo (lau la grupigo en la agorddosiero)
EOH
}        

sub tekstogrupoj {
    
    print "           tekstogrupoj:\n";

    foreach $fonto (@serch_pado) {
	print "              $fonto->{'id'} ($fonto->{'pado'})\n";
    }
}
    

















































