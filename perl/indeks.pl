#!/usr/local/bin/perl -w

# kreas el dosiero indekso.sgml
# unuopajn indeksojn en HTML-formato
# por la diversaj fakoj, lingvoj ktp.

# voku ekz: 
#   cd revo
#   indeks.pl -v cfg/vortaro.cfg

##########################################################

use lib "$ENV{'VOKO'}/bin";
use vokolib;
use nls; read_nls_cfg("$ENV{'VOKO'}/cfg/nls.cfg");

################### agordejo ##############################

#$debug = 1;

$tmp_file = '/tmp/'.$$.'voko.inx';

$tagoj   = 14;       # shanghindekso indikas shanghitajn en la lastaj n tagoj
$xml_dir = 'xml';    # relative al vortara radidosierujo
$art_dir = '../art'; # relative al inx
$nmax    = 400;      # maksimume tiom da shanghitajn artikolojn indiku
$cvs_log = '/usr/bin/cvs log';
$neliteroj = '0-9\/\s,;\(\)\.\-!:';

$tez_lim1 = 0; # nodoj kun malpli da subnodoj ne aperas
$tez_lim2 = 25; # nodoj kun pli da subnodoj -> grasaj

################## precipa programparto ###################

$|=1;

# analizu la argumentojn

while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = 1;
	shift @ARGV;
    } else {
	$agord_dosiero=shift @ARGV;
    }
}

# legu la agordo-dosieron
unless ($agord_dosiero) { $agord_dosiero = "cfg/vortaro.cfg" };

%config = read_cfg($agord_dosiero);

$vortaro_pado=$config{"vortaro_pado"} || 
    die "vortaro_pado ne trovighis en la agordodosiero.\n";

$inxfn=$config{"inxtmp_dosiero"} || 
    $config{"indekso_dosiero"} || "$vortaro_pado/sgm/indekso.xml";
$indeksoj=$config{"indeksoj"} || "kapvortoj,lingvoj,fakoj,inversa,shanghitaj";

$dir="$vortaro_pado/inx";
$refdir = '../art/';

# enhavos post analizo la informojn de la indeks-dosiero
%statistiko =();
%kapvortoj = ();        # %kapvortoj{litero}->@[mrk,kap,rad]
%invvortoj = ();        # sama strukturo
%fakoj = ();            # %fakoj{fako}->@[mrk,kap,rad]
%tradukoj = ();         # %tradukoj{lingvo}->%{litero}->@[mrk,kap,trd]
@bildoj = ();           # @bildoj->@[mrk,kap,tekst,rad]
@mallongigoj = ();      # @mallongigoj->@[mrk,kap,mll]

# legu la fakojn
%faknomoj = read_xml_cfg($config{"fakoj"},'fako','kodo');

# legu la lingvojn
%lingvoj=read_xml_cfg($config{"lingvoj"},'lingvo','kodo');

# legu la tutan indeks-dosieron
print "Legi kaj analizi $inxfn...\n" if ($verbose);
$/ = '</art';
open INX, $inxfn or die "Ne povis malfermi $inxfn\n";
while (<INX>) {
    artikolo($_);
}
close INX;
$/ = "\n";

# traktu cxiujn unuopajn indekserojn

#print "Analizi la indekserojn...\n" if ($verbose);
#$inx =~ s/<art\s+mrk="([^\"]*)"\s*>(.*?)<\/art\s*>/artikolo($1,$2)/sieg;

# kreu la Javaskripto-dosierojn
# &javaskriptoDosieroj();

# kreu la html-dosierojn

# fakindeksoj
if ($indeksoj=~/fak/) {

    # kiuj fakoj havas tezauran indekson?
    open TEZ,$config{"tezauro_fakoj"} || 
	die "Ne povis legi ".$config{"tezauro_fakoj"}."\n";
    while (<TEZ>) {
	chomp;
	my ($file,$fak) = split(';');
	$strukt_fakoj{$fak} = $file;
    }
    close TEZ;

    # kreu fakindeksojn
    foreach $fak (sort keys %fakoj) { FAKINX($fak,$fakoj{$fak}) }
}

# lingvoindeksoj
if ($indeksoj=~/lng/) {

    # kreu la lingvoindeksojn
    foreach $lng (sort keys %tradukoj) { 
	@literoj = sort { cmp_nls($a,$b,$lng) } keys %{$tradukoj{$lng}};
	$unua_litero{$lng} = letter_asci_nls($literoj[0],$lng);
####if ($lng eq 'de' || $lng eq 'ru' || $lng eq 'hu' || $lng eq 'fr' || $lng eq 'ru' || $lng eq 'nl') { #####
	foreach $lit (@literoj) {
	    $refs = $tradukoj{$lng}->{$lit};
	    @$refs = sort { cmp_nls($a->[2],$b->[2],$lng) } @$refs;
	    LINGVINX($lng,$lit,\@literoj,$refs);
	}
####} #####
    }
}

# kapvortoj
if ($config{"inx_eo"}=~/kapvortoj/) {
    @literoj = sort {cmp_nls($a,$b,'eo')} keys %kapvortoj;
    foreach $lit (@literoj) {
	$refs = $kapvortoj{$lit};
	@$refs = sort { cmp_nls($a->[1],$b->[1],'eo') } @$refs;
	KAPVORTINX($lit,\@literoj,$refs);
    }
}

# inversa indekso
if ($config{"inx_ktp"}=~/inversa/) {
    @invliteroj = sort { cmp_nls($a,$b,'eo')} keys %invvortoj;
    $unua_litero{'inv'} = letter_asci_nls($invliteroj[0],'eo');
    foreach $lit (@invliteroj) {
	$refs = $invvortoj{$lit};
	@$refs = sort { cmp_nls($a->[2],$b->[2],'eo') } @$refs;
	INVVORTINX($lit,\@invliteroj,$refs);
    }
}

# bildindekso
if ($config{"inx_ktp"}=~/bildoj/) { INXBILDOJ(\@bildoj); }

# mallongigoindekso
if ($config{"inx_ktp"}=~/mallongigoj/) { INXMALLONGIGOJ(\@mallongigoj); }

# statistiko
if ($config{"inx_ktp"}=~/statistiko/) { INXSTATISTIKO(); }

# indekso de la shanghitaj artikoloj
if ($config{"inx_ktp"}=~/shanghitaj/) { INXSHANGHITAJ(); }


# indekso de la indeksoj
if ($indeksoj=~/eo/)  { INX_EO();  }
if ($indeksoj=~/lng/) { INX_LNG(); }
if ($indeksoj=~/fak/) { INX_FAK(); }
if ($indeksoj=~/ktp/) { INX_KTP(); }
if ($indeksoj=~/plena/) { INX_PLENA(); }
unlink($tmp_file);

############## funkcioj por analizi la indeks-dosieron ##############

# analizas la indeks-tekston de artikolo

sub artikolo {
    my $tekst = shift;
    my ($mrk,$kap,$rad,$first_lit,$last_lit);

    # statistikaj informoj
    $statistiko{'art'}++;
    while ($tekst =~ m/<drv\b/g) { $statistiko{'drv'}++ };
    while ($tekst =~ m/<bld\b/g) { $statistiko{'bld'}++ };
    while ($tekst =~ m/lng="([a-z]{2,3})"/g) { $statistiko{"lng_$1"}++ };
    while ($tekst =~ m/<uzo>([A-Z]+)<\/uzo>/g) { $statistiko{"fak_$1"}++ unless ($1 eq 'KOMUNE')};

    # elprenu la markon
    $tekst =~ s/^.*?<art\s+mrk="([^\"]*)"\s*>//s;
    $mrk = $1;
    unless ($mrk) {
	# se ne estas la vosto de la dosiero, plendu
	if ($tekst =~ /<\/art$/) {
	    warn "ERARO: marko ne trovighis en $tekst\n";
	}
	return;
    }

    # trovu la kapvorton
    $tekst =~ /^\s*<kap\s*>(.*?)<\/kap\s*>/s;
    $kap = $1;
    unless ($kap) {
	warn "ERARO: kapvorto ne trovighis en $tekst\n";
    }

    print "kap: $kap\n" if ($debug);

    # normigu la kapvorton
    $kap =~ s/\s+/ /sg;
    $kap =~ s/\s+$//s;
    $kap =~ s/\/$//;
    $kap =~ s/^\s+//;

    # prenu radikon
    $rad = $kap;
    $rad =~ s/\/(?:[aeio]|oj)$//; # forigu finajhon
    $rad =~ s/[$neliteroj]//g;

    # forigu ankau / el la kapvorto por esti komparebla kun
    # derivajhoj
 #   $kap =~ s/\///g;
    # perforte dir al Perl, ke temas pri UTF-8
    $rad = pack("U*",unpack("U*",$rad));

    # unua kaj lasta litero
    $first_lit = letter_nls($rad,'eo');
    $last_lit  = letter_nls(substr($rad,length($rad)-1),'eo');

    print "1a: $first_lit; l-a: $last_lit\n" if ($debug);

    unless ($first_lit) {
	die "$rad ne komencighas je e-a litero\n";
    }

    unless ($last_lit) {
	die "$rad ne finighas je e-a litero\n";
    }

    # aldonu al kapvortlistoj
    my $reversed_rad = reverse($rad); # sekurigu en variablo, char aliokaze Perl 5.6. forgesas
                                      # pri la inversigo
    push @{ $invvortoj{$last_lit } }, [$mrk,$kap,$reversed_rad];

    print "rad: $rad reversed ".reverse($rad)."\n" if ($debug);

    $kap =~ s/\///g;
    push @{ $kapvortoj{$first_lit} }, [$mrk,$kap,$rad];

    # se la teksto entenas derivajho(j)n,
    # analizu unue tiujn

    if ($tekst =~/<drv/) {
	$tekst =~ s/<drv\s*(?:mrk="([^\"]*)")?\s*>(.*?)<\/drv\s*>/
	    indeksero($mrk,$kap,$1,$2)/siegx;
    } #else {
    # analizu chion krom la derivajhoj
    indeksero($mrk,$kap,$mrk,$tekst);
    #};

    return '';
}

# analizas unuopan indekseron

sub indeksero {
    my ($mrk1,$kap1,$mrk2,$tekst) = @_;
    my ($kap,$rad);
    my $mrk = ($mrk2 or $mrk1);

    # trovu la kapvorton
    $tekst =~ s/^\s*<kap\s*>(.*?)<\/kap\s*>//si;
    $kap = $1; 
    $kap =~ s/\s+/ /sg;
    #$kap =~ s/\*//g;
    #$kap =~ s/[1-9\/]([aeio])Z?$/\/$1/;
    $kap =~ s/\s+$//;
    $kap =~ s/\/$//;
    $kap =~ s/^\s+//;

    $kap =~ s/\///g;

    # prenu radikon
    $rad = $kap;
    $rad =~ s/\/(?:[aeio]|oj)$//; # forigu finajhon
    $rad =~ s/[$neliteroj]//g;

    if (($kap1 ne $kap) and $rad) {

	# aldonu al kapvortlistoj
	my $first_lit = letter_nls($rad,'eo');

	unless ($first_lit) {
	    die "$rad ne komencighas je e-a litero\n";
	}

	push @{ $kapvortoj{$first_lit} }, [$mrk,$kap,$rad];
    }

    # unue analizu de bildoj kaj ekzemploj, char ili mem povas enhavi tradukoj
    # kaj fakindikoj
    $tekst =~ s/<ekz\s*>(.*?)<\/ekz\s*>/ekzemplo($mrk,$kap,$1,$rad)/sieg;
    $tekst =~ s/<bld\s*>(.*?)<\/bld>/bildo($mrk,$kap,$1,$rad)/sieg;

    # analizu la fakojn
    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$kap,$rad)/sieg;
    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk,$kap)/siegx;

    # analizu mallongigojn
    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$kap,$1)/sieg;

    return '';
}

sub ekzemplo {
    my ($mrk,$kap,$tekst,$rad)=@_;
    my $ind;

    # tio, kio estas tradukita
    if ($tekst =~ s/<ind\s*>(.*?)<\/ind\s*>//si) {
	$ind = $1;

	# mallongigita?
	if ($ind =~ s/<mll([^>]*)>(.*?)<\/mll\s*>//si) {
	    $ind = $2;
	    my $attr = $1;
	    if ($attr =~ /\"kom\"/) { $ind .= '...'; }
	    elsif ($attr =~ /\"fin\"/) { $ind = '...'.$ind; }
	    elsif ($attr =~ /\"mez\"/) { $ind = '...'.$ind.'...'; }
	}

    } else {
	$ind = $kap; # referencu al kapvorto, se mankas <ind>...</ind>
    }

    # analizu la fakojn
    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$ind,$rad)/sieg;
    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk,$ind)/siegx;

    # analizu mallongigojn
    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$ind,$1)/sieg;

    return '';
}


# notas unopan fakindikon

sub fako {
   my ($fak,$mrk,$kap,$rad)=@_;

   unless ($faknomoj{uc($fak)}) {
        warn "ERARO: Fako \"$fak\" ne difinita ($mrk)\n";
	return;
    }            

    $kap =~ s/\///;
    push @{ $fakoj{$fak} }, [$mrk,$kap,$rad];

    return '';
};

# notas unuopan bildon

sub bildo {
    my ($mrk,$kap,$tekst,$rad)=@_;
    my $ind;

    $kap =~ s/\///;
    my $bldpriskr = $tekst;
    $bldpriskr =~ s/<trd.*?<\/trd\s*>//sg;
    $bldpriskr =~ s/<uzo.*?<\/uzo\s*>//sg;

    push @bildoj, [$mrk,$kap,$bldpriskr,$rad];

    # tio, kio estas tradukita
    if ($tekst =~ s/<ind\s*>(.*?)<\/ind\s*>//si) { 
	$ind = $1; 
    } else { 
	$ind = $kap; # referencu al kapvorto, se mankas <ind>...</ind>
    }

    # analizu la fakojn
    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$ind,$rad)/sieg;
    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk,$ind)/siegx;

    # analizu mallongigojn
    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$ind,$1)/sieg;
    
    return '';
};

sub mallongigo {
    my ($mrk,$kap,$mll)=@_;

    push @mallongigoj, [$mrk,$kap,$mll];

    return '';
}
    

# notas unuopan tradukon

sub traduko {
    my ($trd,$lng,$mrk,$kap)=@_;
    my ($letter,$ind);
    $kap =~ s/\///;

    unless ($lingvoj{$lng}) {
	warn "ERARO: Lingvo \"$lng\" ne difinita en \"$mrk\"!\n";
	return;
    }

    # mallongigita?
    if ($trd =~ s/<mll([^>]*)>(.*?)<\/mll\s*>//si) {
	$trd = $2;
	my $attr = $1;
	if ($attr =~ /\"kom\"/) { $trd .= '...'; }
	elsif ($attr =~ /\"fin\"/) { $trd = '...'.$trd; }
	elsif ($attr =~ /\"mez\"/) { $trd = '...'.$trd.'...'; }
    }

    if ($trd =~ /<ind>(.*?)<\/ind>/s) {
	$ind = $1;
    } else {
	$ind = $trd;
	# klarigojn ne konsideru che ordigado
	$ind =~  s/<klr>(.*?)<\/klr>//sg;
    }

    # komencaj spacoj ghenus ordigadon
    $ind=~s/^\s*//s;

    # sub kiu litero aperu la vorto?
    $letter = letter_nls($ind,$lng);

    print "trd $lng: $ind (".length($trd)."-".length($ind)."-$letter)\n" if ($debug);

    # enmetu la vorton sub $tradukoj{$lng}->{$letter}
    push @{$tradukoj{$lng}->{$letter}}, [$mrk,$kap,$ind,$trd];

    return '';
};

############### funkcioj por krei la indeks-html-ojn ###########


# kreas fakindekson por unuopa fako

sub FAKINX {
    my ($fako,$refs) = @_;
    my ($va, $vb, $r);
    my $last0 = '';
    my $last1 = '';
    my $n = 0;
    my @vortoj;
    my $faknomo;
    my $target_file = "$dir/fx_".lc($fako).".html";

    # ek
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    unless ($faknomo=$faknomoj{uc($fako)}) {
	warn "ERARO: Fako \"$fako\" ne difinita\n";
	$faknomo='';
    }

    index_header("fakindekso: $faknomo");
    index_buttons('fak');
    if ($strukt_fakoj{$fako}) {
	$strukt_file = $strukt_fakoj{$fako};
	$strukt_file =~ s/\.html$//;
	index_letters($faknomo,'','alfabete',
		     ['alfabete','strukture'],
		     ['fx_'.lc($fako),$strukt_file]);
    } else {
	index_letters($faknomo,'','');
    }

#    print "<h1>$faknomo alfabete...</h1>\n";
    
    # ordigu la vortliston
    @vortoj = sort { cmp_nls($a->[2],$b->[2],'eo') } @$refs;

    # skribu la liston kiel html sen duoblajhoj
    foreach $ref (@vortoj) {
	if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
	    $r = referenco($ref->[0]);
	    print "<a href=\"$r\" target=\"precipa\">";
	    print "$ref->[1]</a><br>\n";
	    $last0 = $ref->[0];
	    $last1 = $ref->[1];
	    $n++;
	};
    };

    # malek
    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas lingvoindekson por unuopa lingvo

sub LINGVINX {
    my ($lng,$lit,$literoj,$refs) = @_;
    my $r;
    my $n=0;
    my $last1 = '';
    my $last2 = '';
    my $trd;
    my $asci = letter_asci_nls($lit,$lng);
    my $target_file = "$dir/lx_${lng}_$asci.html";
 
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("lingvoindekso: $lingvoj{$lng}");
    index_buttons('lng');
    if ($indeksoj=~/jx/) { print "<a href=\"lx_${lng}.html\">Ser&#x0109;o</a> "};
    index_letters($lingvoj{$lng},"lx_${lng}_",$lit,$literoj,
		 [map {letter_asci_nls($_,$lng)} @$literoj]);
#    print "<h1>$lingvoj{$lng} $lit...</h1>\n";

    foreach $ref (@$refs) {
	if (($last1 ne $ref->[1]) or ($last2 ne $ref->[3])) {
	    $r=referenco($ref->[0]);    

	    $trd = $ref->[3];
	    $trd =~ s/(<\/?)ind>/$1u>/sg;

	    print "$trd: <a href=\"$r\" ";
	    print "target=\"precipa\">$ref->[1]</a><br>\n";
	    $last1 = $ref->[1];
	    $last2 = $ref->[3];
	    $n++;
	}
    };
    
    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas la indekson de la kapvortoj

sub KAPVORTINX {
    my ($lit,$literoj,$refs) = @_;
    my $asci = letter_asci_nls($lit,'eo');
    my ($unua,$r,$a);
    my $n = 0;
    my $last0 = '';
    my $last1 = '';

    my $target_file = "$dir/kap_$asci.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("esperanta indekso");
    index_buttons('eo');
    index_letters('esperanta ','kap_',$lit,$literoj,
		 [map {letter_asci_nls($_,'eo')} @$literoj]);
#    print "<h1>kapvortoj $lit...</h1>\n";

    foreach $ref (@$refs) {
	if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
	    $r=referenco($ref->[0]);

	    print "<a href=\"$r\" target=\"precipa\">";
	    print "<b>" unless ($r =~ /\#/);
	    print "$ref->[1]";
	    print "</b>" unless ($r =~ /\#/);
	    print "</a><br>\n";
	
	    $last0 = $ref->[0];
	    $last1 = $ref->[1];
	    $n++;
	}
    }

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}


# kreas la inversan indekson de la kapvortoj

sub INVVORTINX {
    my ($lit,$literoj,$refs) = @_;
    my $asci = letter_asci_nls($lit,'eo');   # my $l_x = utf8_cx($lit);
    my $r;
    my $last0 = '';
    my $last1 = '';
    my $n=0;
    
    my $target_file = "$dir/inv_$asci.html";
    
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("inversa indekso");
    index_buttons('ktp');
    index_letters('inversa','inv_',$lit,$literoj,
		[map {letter_asci_nls($_,'eo')} @$literoj] );
#    print "<h1>inversa $lit...</h1>\n";

    foreach $ref (@$refs) {
	if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
	    $r="$refdir$ref->[0].html";

	    print "<a href=\"$r\" target=\"precipa\">";
	    print "$ref->[1]</a><br>\n";

	    $last0 = $ref->[0];
	    $last1 = $ref->[1];
	    $n++;
	};
    };

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas indekson de la laste shanghitaj artikoloj

sub INXSHANGHITAJ {
    my $now = time();
    my $time;
    my $n = 0;
    my @files = ();

    my @novaj = ();
    my %shangh = ();

    # prenu tempon kaj dosiernomon de la xml-dosieroj
    opendir DIR, $xml_dir or die "Ne povis malfermi $xml_dir: $!\n";
    for $dos (readdir DIR) {

	$time = (stat("$xml_dir/$dos"))[9];
	if ( (-f "$xml_dir/$dos") and
	     ($now - $time < $tagoj * 24 * 60 * 60)) {
	    # metu tempon kaj informon en liston
	    push @files, [$time, $dos];
	}
    }
    closedir DIR;

    # traktu la lastajn (lau tempo) nmax dosierojn
    # kaj ordigu lau redaktantoj, novaj venu krome en apartan liston

    for $entry (sort { $b->[0] <=> $a->[0] } @files) {
	my ($autoro, $priskribo) = cvs_log($entry->[1]);
	push @{$shangh{$autoro}}, ($priskribo);
	if ($priskribo =~ /<dd>\s*nova\s+artikolo\s*$/) {
	    $priskribo =~ s/<dd>.*$/<dd>de $autoro\n/s;
	    push @novaj, ($priskribo);
        }

	if (++$n >= $nmax) { last; }
    }

    # dosiero "novaj artikoloj"
    my $target_file = "$dir/novaj.html";

    #print "$target_file..." if ($verbose);
    open OUT, ">$tmp_file" or die "Ne povis malfermi $tmp_file: $!\n";
    select OUT;
    index_header("Revo - novaj artikoloj");
    index_buttons('ktp');
    print "<h1>novaj artikoloj</h1>\n";

    # skribu la liston
    if (@novaj) {
	print "<dl>\n";
	for $entry (@novaj) { print $entry; }
	print "</dl>\n";
    } else {
	print "neniuj novaj artikoloj en la lastaj $nmax redaktoj";
    }

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);

    # dosiero "shanghitaj artikoloj"
    $target_file = "$dir/shanghitaj.html";

    #print "$target_file..." if ($verbose);
    open OUT, ">$tmp_file" or die "Ne povis malfermi $tmp_file: $!\n";
    select OUT;
    index_header("laste ŝanĝitaj");
    index_buttons('ktp');
    print "<h1>laste ŝanĝitaj</h1>\n";

    # skribu la liston de redaktintoj
    print "<ul>\n";
    for $aut (sort keys %shangh) {
	$aut_ = $aut; $aut_ =~ s/\s+/_/g;
	print "<li><a href=\"#$aut_\">$aut</a>\n";
    }
    print "</ul>\n\n";
    
    # skribu la listojn de redaktoj lau autoro
    for $aut (sort keys %shangh) {
	$aut_ = $aut; $aut_ =~ s/\s+/_/g;
	print "<hr><a name=\"$aut_\"></a>\n<h2>$aut</h2>\n";

	print "<dl>\n";
	for $entry ( @{$shangh{$aut}} ) { print $entry; }
	print "</dl>\n";
    }

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);

}

# kreas indekson de la bildoj

sub INXBILDOJ {
    my ($refs) = @_;
    my $r;
    #my $last0 = '';
    #my $last1 = '';
    my $n = 0;
    my @vortoj;
    my $target_file = "$dir/bildoj.html";

    # ek
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header('bildoj');
    index_buttons('ktp');
    print "<h1>bildoj</h1>\n<dl>\n";
    
    # ordigu la vortliston
    @vortoj = sort { cmp_nls($a->[3],$b->[3],'eo') } @$refs;

    # skribu la liston kiel html 
    foreach $ref (@vortoj) {
#	if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
	    $r = referenco($ref->[0]);
	    print "<dt><a href=\"$r\" target=\"precipa\">";
	    print "$ref->[1]</a>\n<dd>$ref->[2]\n";
	    #$last0 = $ref->[0];
	    #$last1 = $ref->[1];
	    $n++;
#	};
    };
    print "</dl>\n";

    # malek
    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas indekson de la mallongigoj

sub INXMALLONGIGOJ {
    my ($refs) = @_;
    my $r;
    my $last0 = '';
    my $last1 = '';
    my $n = 0;
    my @vortoj;
    my $target_file = "$dir/mallong.html";

    # ek
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header('mallongigoj');
    index_buttons('ktp');
    print "<h1>mallongigoj</h1>\n<dl>\n";
    
    # ordigu la vortliston
    @vortoj = sort { cmp_nls($a->[2],$b->[2],'eo') } @$refs;

    # skribu la liston kiel html 
    foreach $ref (@vortoj) {
	if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
	    $r = referenco($ref->[0]);
	    print "<dt><b>$ref->[2]</b>\n<dd><a href=\"$r\" target=\"precipa\">";
	    print "$ref->[1]</a>\n";
	    $last0 = $ref->[0];
	    $last1 = $ref->[1];
	    $n++;
	};
    };
    print "</dl>\n";

    # malek
    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas la statistikon

sub INXSTATISTIKO {
    my $n = 0;
    my $target_file = "$dir/statistiko.html";
    my (@trdj, @fakj);

    %stattrd = read_cfg($config{"statistiko_tradukoj"});

    # ek
    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header('statistiko');
    index_buttons('ktp');
    print "<h1>statistiko</h1>\n";
    
    # ordigu la vortliston
#    @vortoj = sort { cmp_nls($a->[3],$b->[3],'eo') } @$refs;

    print "<h2>kapvortoj</h2>\n";
    print "artikoloj: ".$statistiko{'art'}."<br>\n";
    print "derivaĵoj: ".$statistiko{'drv'}."<br>\n";
    print "sencoj: ".$stattrd{'sumo'}."<br>\n";
    print "bildoj: ".$statistiko{'bld'}."<br>\n";
    $n=3;

    print "<h2>tradukoj</h2>\n";
    foreach $s (grep(/^lng_/,keys %statistiko)) {
	push @trdj, [substr($s,4),$statistiko{$s},$stattrd{substr($s,4)}];
    }
    foreach $s (sort {$b->[1] <=> $a->[1]} @trdj) {
	$lng = $s->[0];
#	if (-f "$vortaro_pado/smb/$lng.png") {
#		print "<img src=\"../smb/$lng.png\" alt=\"\" class=\"flago\">&nbsp;";
#	    } else {
#		print "<img src=\"../smb/xx.png\" alt = \"\" class=\"flago\">&nbsp;";
#	    }
	print "$lingvoj{$lng}j: ".$s->[1];
        my $pcnt = 100*$s->[2]/$stattrd{'sumo'};
	printf(" (~ %.02f%%)",$pcnt>100?100:$pcnt);
	print "<br>\n";
	$n++;
    };
    print "(la procentoj rezultas el nombro de tradukitaj sencoj je",
          " la tuta nombro de sencoj)\n"; 

    print "<h2>fakoj</h2>\n";
    foreach $s (grep(/^fak_/,keys %statistiko)) {
	push @fakj, [substr($s,4),$statistiko{$s}];
    }
    foreach $s (sort {$b->[1] <=> $a->[1]} @fakj) {
	$fak = $s->[0];
	print "<img src=\"../smb/$fak.gif\" alt=\"\">&nbsp;";
	print "$faknomoj{$fak}: ".$s->[1]."<br>\n";
	$n++;
    };

    # malek
    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

# kreas la precipajn indeksojn

sub INX_EO {
    my ($lit,$lit1);
    my $target_file = "$dir/_eo.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;

    index_header("Revo-indekso: Esperanto");
    index_buttons("eo");

    #kapvortoj
    if ($config{"inx_eo"}=~/kapvortoj/) {
	print "<h1>alfabeta indekso</h1>\n<font size=\"+1\"><b>";
	for $lit (@literoj) {
	    $lit1 = letter_asci_nls($lit,'eo');
	    print "<a href=\"kap_$lit1.html\">$lit</a>\n";
	};
	print "</b></font>\n";
    }

    #tezauroradikoj
    if ($config{"inx_eo"}=~/tezauro/) {
	print "<h1>ĉefaj nocioj</h1>\n";
	open TEZ, $config{"tezauro_radikoj"};
	while (<TEZ>) {
	    chomp;
	    s/\s+$//;
	    my ($file,$kap,$cnt) = split(';'); $cnt = 0 unless ($cnt);

	    if ($cnt > $tez_lim1) { 
		if ($cnt >= $tez_lim2) { print "<b>"; }
		print "<a href=\"$file\">$kap</a>";
		if ($cnt >= $tez_lim2) { print "</b>"; }
		print "<br>\n";
	    }
	}
    }

    index_footer();
    close OUT;

    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

sub INX_LNG {
    my $target_file = "$dir/_lng.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;

    index_header("Revo-indekso: Lingvoj");
    index_buttons("lng");

    #lingvoj
    print "<h1>nacilingvaj indeksoj</h1>\n";

    if (exists $tradukoj{'la'}) {
	print "<p>\n";
	$lng = 'la';
#	if (-f "$vortaro_pado/smb/$lng.png") {
#	    print "<img src=\"../smb/$lng.png\" alt=\"[$lng]\" class=\"flago\">&nbsp;";
#	} else {
#	    print "<img src=\"../smb/xx.png\" alt = \"[$lng]\" class=\"flago\">&nbsp;";
#	}
        if ($indeksoj=~/jx/)
        { print "<a href=\"lx_${lng}.html\">"; }
        else
        { print "<a href=\"lx_${lng}_$unua_litero{$lng}.html\">"; }
	if ($statistiko{"lng_$lng"} >= 1000) {
	    print "<b>$lingvoj{$lng}</b>";
	} else {
	    print "$lingvoj{$lng}";
	}
	print "</a><br>\n";
    }

    for $lng ( sort 
	       { cmp_nls($lingvoj{$a},$lingvoj{$b},'eo') } 
	       keys %tradukoj)
    {
	unless ($lng eq 'la') {
#	    if (-f "$vortaro_pado/smb/$lng.png") {
#		print "<img src=\"../smb/$lng.png\" alt=\"[$lng]\" class=\"flago\">&nbsp;";
#	    } else {
#		print "<img src=\"../smb/xx.png\" alt = \"[$lng]\" class=\"flago\">&nbsp;";
#	    }
#            if ($indeksoj=~/jx/)
#            { print "<a href=\"lx_${lng}.html\">"; }
#            else
#            { 
	    print "<a href=\"lx_${lng}_$unua_litero{$lng}.html\">"; 
#}

	    if ($statistiko{"lng_$lng"} >= 1000) {
		print "<b>$lingvoj{$lng}</b>";
	    } else {
		print "$lingvoj{$lng}";
	    }
	    print "</a><br>\n";
	}
    };

 

    index_footer();
    close OUT;

    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);

}

sub INX_FAK {
    my $target_file = "$dir/_fak.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;

    index_header("Revo-indekso: Fakoj");
    index_buttons("fak");

    #fakoj
    if ($config{"inx_fak"}=~/alfabetaj/ && %fakoj) {
	print "<h1>alfabetaj fakindeksoj</h1>\n";
	
	    for $fak (sort keys %fakoj) 
	    {
		my $faknomo=$faknomoj{uc($fak)};
		unless ($faknomo) {
		    warn "ERARO: Faknomo \"$fak\" ne difinita!\n";
		    $faknomo = 'nekonata';
		}
		print 
		    "<img src=\"../smb/$fak.gif\" alt=\"$fak\" border=0 ",
		    "align=middle>&nbsp<a href=\"fx_", 
		    lc($fak), ".html\">$faknomo</a><br>\n";
	    }
    }
	
    if ($config{"inx_fak"}=~/tezauro/) {
	print "<h1>tezaŭraj fakindeksoj</h1>\n";
	
	for $fak (sort keys %strukt_fakoj) 
	{
	    my $faknomo=$faknomoj{uc($fak)};
	    unless ($faknomo) {
		warn "ERARO: Faknomo \"$fak\" ne difinita!\n";
		$faknomo = '';
	    }
	    print 
		"<img src=\"../smb/$fak.gif\" alt=\"$fak\" border=0 ",
		"align=middle>&nbsp<a href=\"",
		$strukt_fakoj{$fak},
		"\">$faknomo</a><br>\n";
	}
    }


    index_footer();
    close OUT;

    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

sub INX_KTP {
    my $target_file = "$dir/_ktp.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;

    index_header("Revo-indekso: ktp.");
    index_buttons("ktp");

    # gravaj paghoj
    my @paghoj = split(';',$config{"inx_ktp_paghoj"});
    if (@paghoj) {
	print "<h1>gravaj paĝoj</h1>\n";

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\" target=\"",
		($href=~/^http:/)? "_new" : "precipa",
		"\">$title</a><br>\n";
	}
    }

    # diversaj indeksoj 
    my $inx = $config{"inx_ktp"};
    if ($inx=~/(inversa|shanghitaj|bildoj|statistiko)/) {
	print "<h1>diversaj indeksoj</h1>\n";
	if ($inx=~/bildoj/) {
	    print "<a href=\"bildoj.html\">";
	    print "bildoj</a><br>\n";
	}
	if ($inx=~/mallongigoj/) {
	    print "<a href=\"mallong.html\">";
	    print "mallongigoj</a><br>\n";
	}
	if ($inx=~/inversa/) {
	    print "<a href=\"inv_$unua_litero{'inv'}.html\">";
	    print "inversa indekso</a><br>\n";
	}
	if ($inx=~/novaj/) {
	    print "<a href=\"novaj.html\">novaj ",
	    "artikoloj</a><br>\n";
	}
	if ($inx=~/shanghitaj/) {
	    print "<a href=\"shanghitaj.html\">ŝanĝitaj ",
	    "artikoloj</a><br>\n";
	}
	if ($inx=~/eraroj/) {
	    print "<a href=\"eraroj.html\">eraro-raporto</a><br>\n";
	}
	if ($inx=~/statistiko/) {
	    print "<a href=\"statistiko.html\">statistiko</a><br>\n";
	}
    }

    # listoj
    @paghoj = split(';',$config{"inx_ktp_listoj"});
    if (@paghoj) {

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\">$title</a><br>\n";
	}
    }
    
    # redakto
    @paghoj = split(';',$config{"inx_ktp_redakto"});
    if (@paghoj) {
	print "<h1>redaktado</h1>\n";

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\" target=\"",
		($href=~/^http:/)? "_new" : "precipa",
		"\">$title</a><br>\n";
	}
    }

    index_footer();
    close OUT;

    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

sub INX_PLENA {
    my ($lit,$lit1);
    my $target_file = "$dir/_plena.html";

    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;

    index_header("Revo - Plena indekso");
    index_buttons();

    #kapvortoj
    if ($config{"inx_eo"}=~/kapvortoj/) {
	print "KAPVORTOJ:\n";
	for $lit (@literoj) {
	    $lit1 = utf8_cx($lit);
	    print "<a href=\"kap_$lit1.html\">$lit</a>\n";
	};
	print "<p>\n";
    }


    #lingvoj
    print "LINGVOJ:\n";
    for $lng (sort keys %tradukoj) 
    {
        if ($indeksoj=~/jx/)
        { print "<a href=\"lx_${lng}.html\">"; }
        else
        { print "<a href=\"lx_${lng}_$unua_litero{$lng}.html\">"; }
#	if (-f "$vortaro_pado/smb/$lng.png") {
#	    print "<img src=\"../smb/$lng.png\" alt=\"$lng\" class=\"flago\"> ";
#	} else {
#	    print "<img src=\"../smb/xx.png\" alt = \"$lng\" class=\"flago\"> ";
#	}
	print "</a>\n";
    };
    print "<p>\n";
    
    #fakoj
    if ($config{"inx_fak"}=~/alfabetaj/ && %fakoj) {
	print "FAKOJ (alfabete):\n";
	
	    for $fak (sort keys %fakoj) 
	    {
		my $faknomo=$faknomoj{uc($fak)};
		unless ($faknomo) {
		    warn "ERARO: Faknomo \"$fak\" ne difinita!\n";
		    $faknomo = '';
		}
		print "<a href=\"fx_", lc($fak), ".html\">", 
		"<img src=\"../smb/$fak.gif\" alt=\"$fak\" border=0></a>\n";
	    }
    }
    print "<p>\n";
	
    if ($config{"inx_fak"}=~/tezauro/) {
	print "FAKOJ (strukture):\n";
	
	for $fak (sort keys %strukt_fakoj) 
	{
	    my $faknomo=$faknomoj{uc($fak)};
	    unless ($faknomo) {
		warn "ERARO: Faknomo \"$fak\" ne difinita!\n";
		$faknomo = '';
	    }
	    print "<a href=\"$strukt_fakoj{$fak}\">",
	    "<img src=\"../smb/$fak.gif\" alt=\"$fak\" border=0></a>\n";
	}
    }
    print "<p>\n";

    # gravaj paghoj
    my @paghoj = split(';',$config{"inx_ktp_paghoj"});
    if (@paghoj) {
	print "GRAVAJ PAĜOJ:\n";

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\" target=\"",
		($href=~/^http:/)? "_new" : "precipa",
		"\">$title</a>\n";
	}
    }
    print "<p>\n";

    # diversaj indeksoj 
    my $inx = $config{"inx_ktp"};
    if ($inx=~/(inversa|shanghitaj|bildoj|statistiko)/) {
	print "DIVERSAJ INDEKSOJ:\n";
	if ($inx=~/bildoj/) {
	    print "<a href=\"bildoj.html\">";
	    print "bildoj</a>,\n";
	};
	if ($inx=~/mallongigoj/) {
	    print "<a href=\"mallong.html\">";
	    print "mallongigoj</a>,\n";
	};
	if ($inx=~/inversa/) {
	    print "<a href=\"inv_$unua_litero{'inv'}.html\">";
	    print "inversa indekso</a>,\n";
	};
	if ($inx=~/shanghitaj/) {
	    print "<a href=\"novaj.html\">ŝanĝitaj ",
	    "artikoloj</a>,\n";
	}
	if ($inx=~/statistiko/) {
	    print "<a href=\"statistiko.html\">statistiko</a>,\n";
	}
    }

    # listoj
    @paghoj = split(';',$config{"inx_ktp_listoj"});
    if (@paghoj) {

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\" target=\"",
		($href=~/^http:/)? "_new" : "precipa",
		"\">$title</a>,\n";
	}
    }
    print "<p>\n";
    
    # redakto
    @paghoj = split(';',$config{"inx_ktp_redakto"});
    if (@paghoj) {
	print "REDAKTADO:\n";

	while (@paghoj) {
	    my $href=shift @paghoj;
	    my $title=shift @paghoj;
	    print 
		"<a href=\"$href\" target=\"",
		($href=~/^http:/)? "_new" : "precipa",
		"\">$title</a>,\n";
	}
    }
    print "<p>\n";


    #tezauroradikoj
    if ($config{"inx_eo"}=~/tezauro/) {
	print "TEZAŬRO:\n";
	open TEZ, $config{"tezauro_radikoj"};
	while (<TEZ>) {
	    my ($file,$kap,$cnt) = split(';');
	    if ($cnt >= $tez_lim2) { print "<b>"; }
	    print "<a href=\"$file\">$kap</a>";
	    if ($cnt >= $tez_lim2) { print "</b>"; }
	    print ",\n";
	}
    }
    print "<p>\n";

    index_footer();
    close OUT;

    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}


##################### helpfunkcioj por la html-oj ###########

# kunmetas html-referencon el Revo-XML-marko
sub referenco {
    my $ref=$_[0];
    my $rez;

    if ($ref =~ /^([^\.]*)\.(.*)$/) {
	my $r1=$1; my $r2="$1.$2";
	$rez="$refdir".lc($r1).".html#".$r2;
    } else {
	$rez="$refdir".lc($ref).".html";
    };

    return $rez;
};

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

sub index_letters {
    my ($title_base,$file_base,$letter,$letters,$files) = @_;
    my ($l_utf8, $l_x, $file);

    for $l (@$letters) {
#	$l_x    = letter_asci_nls($l,$lng);
	$file = shift @$files;

	if ($l ne $letter) {
	    print "<a href=\"$file_base$file.html\">$l</a>\n"; 
	} else { 
	    print "<b class=\"elektita\">$l</b>\n"; 
	};
    };
    print "<h1>$title_base";
    print " $letter..." if ($letter);
    print "</h1>\n";
}

# elprenas informojn el "cvs log"
sub cvs_log {
    my $dos = shift;
    my ($art,$log,$rev,$info,$dato,$aut);
    my $result;

    #print "nova: $dos\n" if ($verbose);

    # skribu vorton kaj referencon al la artikolo
    $art = $dos;
    $art =~ s/\.xml$//; 

    $result = "<dt><a href=\"$art_dir/$art.html\" ".
	"target=precipa><b>$art</b></a>";

    # eltiru informojn pri aktuala versio el "cvs log"
    $log = `$cvs_log -r $xml_dir/$dos`;

    if ($log) {
	$log =~ /-{28}\nrevision ([0-9\.]+)\n(.*?)={28}/s;
	$rev = $1; # ne uzata nun
	$info = $2;

	unless ($info) {
	    warn "ERARO: $dos: Ne povis elpreni versioinformon el $log\n";
	    return;
	}

	$info =~ s/date: ([0-9\/]+)[^\n]*\n//;
	$dato = $1;

	# forigu la retadreson
	$info =~ s/\s*<[^>]+\@[^>]+>\s*//s;

	# elprenu la autoron
	if ($info =~ s/^([a-z \.\-]+)://si) { $aut = $1; }
	else {$aut = "revo"; }

	# skribu la informojn
	$info =~ s/\s*$//s;
	$info =~ s/&/&amp;/g;
	$info =~ s/</&lt;/g;
	$info =~ s/>/&gt;/g;
	$result .= " <span class=dato>$dato</span>\n<dd>$info\n";
    } else {
	$result .= "\n<dd>(mankas informo)\n";
    }

    return ($aut,$result);
}

#################################################################

# Javaskriptodosieroj

my $n; #indekso de Esperanta vorto en Javaskriptlisto
my $nombroListoj; #indekso de la Javaskriptlisto
my $listoNomo; #nomo de la Javaskriptlisto
my %eoKunTraduko = (); #la Esperantaj vortoj kiuj havas tradukon.

#Konstruu cxiun dosieron por sercxi per Javaskripto
sub javaskriptoDosieroj {
  print "Javaskriptodosieroj...\n";
  if ($indeksoj=~/jx/) {
    # kreu la lingvoindeksojn
    #$lng = 'nl'; {
    foreach $lng (sort keys %tradukoj) { 
      @literoj = sort { cmp_nls($a,$b,$lng) } keys %{$tradukoj{$lng}};
      $unua_litero{$lng} = letter_asci_nls($literoj[0],$lng);
      $n = 0;
      $nombroListoj = 0;
      $listoNomo = 'Eroj';
      %eoKunTraduko = ();
      foreach $lit (@literoj) {
        $refs = $tradukoj{$lng}->{$lit};
        @$refs = sort { cmp_nls($a->[2],$b->[2],$lng) } @$refs;
        &jx_lng_lit_js($lng,$lit,\@literoj,$refs);
      }
      &jx_lng_js($lng,\@literoj);
      &lx_lng_html($lng,\@literoj);
    }
  }
  print ".\n";
}

# Konstruu Javaskriptdosieron kun la listo de Esperantaj vortoj kaj
# ilia traduko por unu litero ($lit) de unu lingvo ($lng). 
sub jx_lng_lit_js {
  my ($lng,$lit,$literoj,$refs) = @_;
  my $asci = letter_asci_nls($lit,$lng);
  my $target_file = "$dir/jx_${lng}_$asci.js";
  my $r;
  my $last1 = '';
  my $last2 = '';
  my $trd;
 
  #print "$target_file..." if ($verbose);
  open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
  select OUT;
  print "$listoNomo" . "[$nombroListoj]=new Array(\n";
  ++$nombroListoj;
  $n = 0;
  foreach $ref (@$refs) {
    if (($last1 ne $ref->[1]) or ($last2 ne $ref->[3])) {
      $r=referenco($ref->[0]);    
      $trd = $ref->[3];
      #$trd =~ s/(<\/?)ind>/$1u>/sg;
      $trd =~ s/[\r\n\f]/ /g;
      $trd =~ s/ *$//g;
      $trd =~ s/  / /g;
      if ($r =~ /\#([^.]*)\.([^"]*)$/)
      {
        &NovaEro($trd, $1, $2, $ref->[1]);
      }
      elsif ($r =~ /art\/([^.]*)\.html$/)
      {
        &NovaEro($trd, $1, '', $ref->[1]);
      }
      else
      {
        print STDERR "ne trovas eroj en: $trd: $r $ref->[1]\n";
      }
      $last1 = $ref->[1];
      $last2 = $ref->[3];
    }
  }
  print "'');";
  close OUT;
  select STDOUT;
  diff_mv($tmp_file,$target_file,$verbose);
}

# Konstruu la cxefan Javaskriptdosieron por $lng kun
#  - parametroj UnuaParto kaj Eroj,
#  - listo de Eo vortoj kiuj ne havas tradukon.
sub jx_lng_js {
  my ($lng,$literoj) = @_;
  my $target_file = "$dir/jx_${lng}.js";
 
  #print "$target_file..." if ($verbose);
  my $unuaParto = '';
  #ne funkcias por specialaj literoj:
  #open OUT,">",\$unuaParto or die "Ne povis krei \$unuaParto: $!\n";
  open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
  select OUT;
  &lx_unua_parto($lng,\@literoj);
  close OUT;

  open IN,"<$tmp_file" or die "Ne povis legi $tmp_file: $!\n";
  while (<IN>) { $unuaParto .= $_; }
  close IN;

  $unuaParto =~ s/[\r\n\f]/ /g;
  $unuaParto =~ s/'/\\'/g;
  #select STDOUT; print $unuaParto;
  open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
  select OUT;
  print "UnuaParto = '$unuaParto<P>\\n';\n";
  $listoNomo = 'Eroj';
  print "$listoNomo=new Array();\n";
  $listoNomo = 'Eo';
  print "$listoNomo=new Array();";
  close OUT;

  select STDOUT;
  diff_mv($tmp_file,$target_file,$verbose);

  #listo de Esperantaj vortoj sen traduko (ne estas in %eoKunTraduko)
  $listoNomo = 'Eo';
  $nombroListoj = 0;
  @literoj2 = sort {cmp_nls($a,$b,'eo')} keys %kapvortoj;
  foreach $lit (@literoj2) {
    $refs = $kapvortoj{$lit};
    @$refs = sort { cmp_nls($a->[1],$b->[1],'eo') } @$refs;
    &jx_lng_eo_lit_js($lng,$lit,\@literoj,$refs);
  }
}

# Konstruu Javaskriptdosieron kun la listo de Esperantaj vortoj sen
# traduko por unu litero ($lit) de Esperanto por lingvo $lng. 
sub jx_lng_eo_lit_js {
  my ($lng,$lit,$literoj,$refs) = @_;
  my $asci = letter_asci_nls($lit,'eo');
  my $target_file = "$dir/jx_${lng}_eo_$asci.js";
  $n = 0;
  my $r;
  my $last0 = '';
  my $last1 = '';
 
  #print "$target_file..." if ($verbose);
  open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
  select OUT;
  print "$listoNomo" . "[$nombroListoj]=new Array(\n";
  ++$nombroListoj;
  $n = 0;
  foreach $ref (@$refs) {
    if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
      $r=referenco($ref->[0]);
      if ($r =~ /\#([^.]*)\.([^"]*)$/)
      {
        if (!exists($eoKunTraduko{$ref->[1]}))
        { &NovaEro('', $1, $2, $ref->[1]); }
      }
      elsif ($r =~ /art\/([^.]*)\.html$/)
      {
        if (!exists($eoKunTraduko{$ref->[1]}))
        { &NovaEro('', $1, '', $ref->[1]); }
      }
      else
      {
        print STDERR "ne trovas eroj en: $r $ref->[1]\n";
      }
      $last0 = $ref->[0];
      $last1 = $ref->[1];
    }
  }
  print "'');";
  close OUT;
  select STDOUT;
  diff_mv($tmp_file,$target_file,$verbose);
}

# Aldonu ero de la Javaskriptlisto en EL.
# $traduko: traduko de la Esperanta vorto.
# $dosiero: dosiero kie trovigxas la Esperanta vorto.
# $loko: HTML loko de la Esperanta vorto en la dosiero.
# $esperanto: la Esperanta vorto.
# Estas notite en %eoKunTraduko ke tiu Esperanta vorto havas tradukon.
sub NovaEro()
{
  local ($traduko, $dosiero, $loko, $esperanto) = @_;
  $traduko =~ s/<[^>]*>//g;
  $traduko =~ s/"/\\"/g;
  $traduko =~ s/\\$/\\ /g;
  $esperanto =~ s/[\r\n\f] */ /g;
  $eoKunTraduko{$esperanto} = '1';
  if ($traduko ne '')
  {
    print '"'.$traduko.'",';
  }
  if ($loko ne '') { $loko = '.' . $loko; }
  #print EL '"'.$esperanto.'","'.$dosiero.$loko."\",";
  print '"'.$esperanto.'","'.$dosiero.$loko."\",\n";
  $n += 4;
  if ($n > 64000)
  { # Javaskriptlisto ne povas havi pli ol 64000 erojn.
    print "'');\n$listoNomo" . "[$nombroListoj]=new Array(\n";
    ++$nombroListoj;
    $n = 0;
  }
}

# Unua parto de la HTML-dosiero por sercxi en $lng.
sub lx_unua_parto {
  my ($lng,$literoj) = @_;
  index_header("lingvoindekso: $lingvoj{$lng}");
  index_buttons('lng');
  if ($indeksoj=~/jx/) { print "<b>Ser&#x0109;o</b> "};
  index_letters($lingvoj{$lng},"lx_${lng}_",'',$literoj,
    [map {letter_asci_nls($_,$lng)} @$literoj]);
  #referencoj al Javaskripto-dosieroj.
  print '<script type="text/javascript" src="./jx_'
    . $lng . ".js\"></script>\n";
  for $litero (@$literoj) {
    my $asci = letter_asci_nls($litero,$lng);
    print '<script type="text/javascript" src="./jx_'
      . $lng . '_' . $asci . ".js\"></script>\n";
  }
  @literoj2 = sort {cmp_nls($a,$b,'eo')} keys %kapvortoj;
  foreach $litero (@literoj2) {
    my $asci = letter_asci_nls($litero,'eo');
    print '<script type="text/javascript" src="./jx_'
      . $lng . '_eo_' . $asci . ".js\"></script>\n";
  }
  print '<script type="text/javascript" src="./sercxu.js"></script>';
  #form
  print '<form name="Kamparo" action="javascript:Sercxu(document.Kamparo.Kampo.value)">';
  print $lingvoj{$lng} . ':';
  print '<input type="text" name="Kampo" size="10" style="font-size: 8pt">';
  print '<input type="submit" value="Ser&#x0109;u" style="font-size: 8pt">';
  print '</form>';
  print '<form name="KamparoEo" action="javascript:SercxuEo(document.KamparoEo.KampoEo.value)">';
  print 'esperanto:';
  print '<input type="text" name="KampoEo" size="10" style="font-size: 8pt">';
  print '<input type="submit" value="Ser&#x0109;u" style="font-size: 8pt">';
  print '</form>';
}

# Konstruu la cxefan HTML dosieron por la lingvo $lng
sub lx_lng_html {
  my ($lng,$literoj) = @_;
  my $target_file = "$dir/lx_${lng}.html";
 
  #print "$target_file..." if ($verbose);
  open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
  select OUT;
  &lx_unua_parto($lng,\@literoj);
  print "<p>En la supran formularon skribu <a href='../dok/sercespr.html' "
    ."target='precipa'>\n"
    . "regulan ser&#x0109;esprimon</a>. La &#x0108;apelajn\n"
    . "literojn indiku per Cx, Gx, ...,  Ux, cx, gx, ..., ux.<p>\n";
  print "En la listo de trovitaj vortoj vi trovos tiujn, kiuj "
    . "egalas al la ser&#x0109;ata vorto, poste tiujn, kiuj enhavas "
    . "la ser&#x0109;atan vorton kaj fine la esprimoj "
    . "en kiuj la ser&#x0109;a&#x0135;o estas vortoparto.";
  index_footer();
  close OUT;
  select STDOUT;
  diff_mv($tmp_file,$target_file,$verbose);
}






