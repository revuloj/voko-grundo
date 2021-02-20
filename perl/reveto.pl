#!/usr/local/bin/perl -w

# kreas indekson por Zauruso

# voku ekz: 
#   reveto.pl

##########################################################

use lib "$ENV{'VOKO'}/bin";
use vokolib;
use nls; read_nls_cfg("$ENV{'VOKO'}/cfg/nls.cfg");

################### agordejo ##############################

$debug=1; 

$chioenunu = 0; # 1 = unu sola indekso, 0 = pluraj indeksdosieroj

$VOKO=$ENV{'VOKO'};
$HOME='/home/revo';
$REVO="$HOME/revo";
$TMP="$HOME/tmp";
$OUTDIR = "$HOME/tests/reveto";

$inxdir = "$OUTDIR/revo/zinx";
$tmp_file = "$TMP/tmp.$$.xxx";
$artdir = "$OUTDIR/revo/art";

$inxfn = "$HOME/tmp/indekso.xml";
$xmldir = "$REVO/xml";    # relative al vortara radikdosierujo
$refdir = '../art/'; # relative al inx

$neliteroj = '0-9\/\s,;\(\)\.\-!:';
#$xslbin = "/home/revo/voko/bin/xslt.sh";
$xsl = "$VOKO/xsl/reveto.xsl";

%lingvoj = ('de'=>'germana','fr'=>'franca','nl'=>'nederlanda');

################## precipa programparto ###################

$|=1;

# analizu la argumentojn

while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = 1;
	shift @ARGV;
    } else {
	shift @ARGV;
    }
}

%kapvortoj = ();        # %kapvortoj{litero}->@[mrk,kap,rad]
%tradukoj = ();         # %tradukoj{lingvo}->%{litero}->@[mrk,ind,kap,trd]

# legu la tutan indeks-dosieron
print "Legi kaj analizi $inxfn...\n" if ($verbose);
$/ = '</art';
open INX, $inxfn or die "Ne povis malfermi $inxfn\n";
while (<INX>) {
    artikolo($_);
}
close INX;
$/ = "\n";

REGRUPIGU('eo',\%kapvortoj);
foreach $lng (keys %lingvoj) {
    REGRUPIGU($lng,$tradukoj{$lng});
}

# skribu kapvortindekso(j)n
for ($i=0; $i<=$#arangho_eo; $i++) {
    KAPVORTINX($i);
}

foreach $lng (keys %lingvoj) {
    for ($i=0; $i<=$#{"arangho_$lng"}; $i++) {
	TRADUKINX($lng,$i);
    }
}

INDEKSO();

# exit;

### konvertu chiujn artikolojn al simpla HTML

opendir DIR, $xmldir;

my $n = 1;

while ($file = readdir DIR) {
    
    if (-f "$xmldir/$file" and $file =~ /\.xml$/) {
	
	print "".$n++." $file\n" if ($verbose);
	$file =~ s/\.xml$//;
	
	# konvertu XML->TXT kaj alpendigu al datumdosiero
	`xsltproc $xsl $xmldir/$file.xml > $artdir/$file.html`;

	# forigu chion nebezonatan el la HTML-kodo
	open IN, "$artdir/$file.html";
	my $html = join('',<IN>);
	close IN;
	$html =~ s/<!DOCTYPE[^>]*>//s;
	$html =~ s/<!--.*?-->//sg;
	$html =~ s/<\/?span[^>]*>//sg;
	$html =~ s/(\s)\s+/$1/sg;
	$html =~ s/\s*class=\"[^\"]+\"//sg;
	open OUT, ">$artdir/$file.html";
	print OUT $html;
	close OUT;
    }
}
closedir DIR;


############## funkcioj por analizi la indeks-dosieron ##############

# prenas la unuajn tri malgrandigitajn literojn de vorto,
# kiu trovighas kiel elemento 1 en listeto
sub komenco {
    my $vlist = shift;
    my $n = shift; $n=2 unless ($n);

    my $v = $vlist->[1];
    $v =~ s/[\(\)\-]//g;

    return lc(substr($v,0,$n));
}


# analizas la indeks-tekston de artikolo

sub artikolo {
    my $tekst = shift;
    my ($mrk,$kap,$rad,$first_lit,$last_lit);

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

#    print "kap: $kap\n" if ($debug);

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

#    print "1a: $first_lit; l-a: $last_lit\n" if ($debug);

    unless ($first_lit) {
	die "$rad ne komencighas je e-a litero\n";
    }

    # aldonu al kapvortlistoj
    $kap =~ s/\///g;
    push @{ $kapvortoj{$first_lit} }, [$mrk,$kap,$rad];

    # se la teksto entenas derivajho(j)n,
    # analizu unue tiujn

    if ($tekst =~/<drv/) {
	$tekst =~ s/<drv\s*(?:mrk="([^\"]*)")?\s*>(.*?)<\/drv\s*>/
	    indeksero($mrk,$kap,$1,$2)/siegx;
    }
    # analizu chion ceteran krom la derivajhoj
    indeksero($mrk,$kap,$mrk,$tekst);

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

    # unue analizu de bildoj kaj ekzemploj, char ili mem povas enhavi tradukojn
    # kaj fakindikojn
    $tekst =~ s/<ekz\s*>(.*?)<\/ekz\s*>/ekzemplo($mrk,$kap,$1,$rad)/sieg;
    $tekst =~ s/<bld\s*>(.*?)<\/bld>/bildo($mrk,$kap,$1,$rad)/sieg;

#    # analizu la fakojn
#    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$kap,$rad)/sieg;
#    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk,$kap)/siegx;

    # analizu mallongigojn
#    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$kap,$1)/sieg;

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

#    # analizu la fakojn
#    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$ind,$rad)/sieg;
    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk,$ind)/siegx;

    # analizu mallongigojn
#    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$ind,$1)/sieg;

    return '';
}

sub bildo {
    my ($mrk,$kap,$tekst,$rad)=@_;
    my $ind;

    $kap =~ s/\///;
    my $bldpriskr = $tekst;
    $bldpriskr =~ s/<trd.*?<\/trd\s*>//sg;
    $bldpriskr =~ s/<uzo.*?<\/uzo\s*>//sg;

#    push @bildoj, [$mrk,$kap,$bldpriskr,$rad];

    # tio, kio estas tradukita
    if ($tekst =~ s/<ind\s*>(.*?)<\/ind\s*>//si) { 
        $ind = $1; 
    } else { 
        $ind = $kap; # referencu al kapvorto, se mankas <ind>...</ind>
    }

    # analizu la fakojn
#    $tekst =~ s/<uzo\s*>(.*?)<\/uzo\s*>/fako($1,$mrk,$ind,$rad)/sieg;
    # analizu la tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
        traduko($2,$1,$mrk,$ind)/siegx;

    # analizu mallongigojn
#    $tekst =~s/<mlg\s*>(.*?)<\/mlg\s*>/mallongigo($mrk,$ind,$1)/sieg;
    
    return '';
};
 
   
# notas unuopan tradukon

sub traduko {
    my ($trd,$lng,$mrk,$kap)=@_;
    my ($letter,$ind);
    $kap =~ s/\///;

    # ignoru lingvojn krom la supre difinitajn
    unless ($lingvoj{$lng}) {
#        warn "ERARO: Lingvo \"$lng\" ne difinita en \"$mrk\"!\n";
        return '';
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

#    print "trd $lng: $ind (".length($trd)."-".length($ind)."-$letter)\n" if ($debug);

    # enmetu la vorton sub $tradukoj{$lng}->{$letter}
    push @{$tradukoj{$lng}->{$letter}}, [$mrk,$ind,$kap,$trd];

    return '';
};


############### funkcioj por krei la indeks-html-ojn ###########

sub REGRUPIGU {
    my ($lng,$vortlisto) = @_;
    @{"array_$lng"} = ();

    if ($debug) {
	print ">>>$lng\n$vortlisto\n",(keys %$vortlisto),"\n";
    }

    # reordigu kapvortojn en proksimume samgrandajn grupojn
    # chiuj kapvortoj en unu vektoro
    foreach $l ( sort {cmp_nls($a,$b,$lng)} keys %$vortlisto ) {
	push @{"array_$lng"}, sort {cmp_nls($a->[1],$b->[1],$lng)} @{$vortlisto->{$l}}
    } 

#    if ($debug and ($lng ne 'eo')) {
#	foreach $x (@{"array_$lng"}) {
#	    print $x->[

    # certigu, ke traktighas kiel UTF8
    foreach $v (@{"array_$lng"}) {
	$v->[1] = pack("U*",unpack("U*",$v->[1]));
    }

    #$knombro = int(sqrt($#array));
    $knombro = int($#{"array_$lng"}/30);

    print "n: $knombro\n" if ($debug);

    $n_from = 0;
    $a_from = "a"; # plibone la unua el ordigita (keys %$vortlisto)

    while ($n_from+$knombro < $#{"array_$lng"}) {
	$offset = $n_from+$knombro;

	$i = 0;
	while (komenco(${"array_$lng"}[$offset+$i]) eq komenco(${"array_$lng"}[$offset+$i+1]))
	{ 
	    $i++; 
	}
	
	# alvenis che limo
	$n_to = $offset+$i;
	$a_to = komenco(${"array_$lng"}[$offset+$i]);
	$j = 1;
	while ((komenco(${"array_$lng"}[$n_to],$j) eq komenco(${"array_$lng"}[$n_to+1],$j))
	       or
	       (komenco(${"array_$lng"}[$n_to],$j) eq komenco(${"array_$lng"}[$n_from],$j))) 
	{
	    $j++;
	}
	$a_to = substr($a_to,0,$j);
	
	push @{"arangho_$lng"},[$n_from,$n_to,$a_from,$a_to];

	$n_from = $n_to+1;
	$a_from = komenco(${"array_$lng"}[$n_from],$j);
    }

# aldonu la lastan parton
    push @{"arangho_$lng"},[$n_from,$#{"array_$lng"},$a_from,'z'];

    if ($debug) {
	print $lingvoj{$lng},":\n";
	foreach $a (@{"arangho_$lng"}) {
	    print "",(($a->[1])-($a->[0])),", ",join(', ',@$a),"\n";
	}
    }

    return;
}

# kreas la indekson de la kapvortoj

sub NAVIGILO {
    my ($lng,$i,$prefix) = @_;
    $prefix = '' unless $prefix;

    for ($j=0; $j<=$#{"arangho_$lng"}; $j++) {
	    print " | " if ($j);
	    if ($j == $i) {
		print ${"arangho_$lng"}[$j]->[2]."...".${"arangho_$lng"}[$j]->[3]." ";
	    } else {
		print "<a href=\"$prefix$lng"."_".($j+1).".html\">"
		    .${"arangho_$lng"}[$j]->[2]."...".${"arangho_$lng"}[$j]->[3]."</a> ";
	    }
    }

    print "<hr>";
}

sub INDEKSO {
    $target_file = "$OUTDIR/revo/index.html";

    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("kapvortindekso");

    print "<h1>Reta Vortaro</h1>eldono por po&#x015D;komputilo<p>\n";


    print "<h2>Esperanto</h2>";
    NAVIGILO('eo',-1,'zinx/');
    foreach $lng (keys %lingvoj) { 
	print "<h2>$lingvoj{$lng}</h2>";
	NAVIGILO($lng,-1,'zinx/');
    }

    print `date +%Y-%m-%d`;

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);
}

sub KAPVORTINX {
    my ($i) = @_;

#    my $asci = letter_asci_nls($lit,'eo');
    my ($r,$ref);
#    my $n = 0;
    my $last0 = '';
    my $last1 = '';
    my $targetfile;

    unless ($chioenunu) {
	$target_file = "$inxdir/eo_".($i+1).".html";
    } else {
	$target_file = "$inxdir/inx_eo.html";
    }


    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("kapvortindekso");
#    index_buttons();
#    index_letters('kapvortoj ','eo_',$lit,$literoj,
#		 [map {letter_asci_nls($_,'eo')} @$literoj]);

    unless ($chioenunu) {
	
	NAVIGILO('eo',$i);
	
#    print "<h1>kapvortoj $lit...</h1>\n";

	for ($v=$arangho_eo[$i]->[0]; $v<=$arangho_eo[$i]->[1]; $v++) 
	{
	    $ref = $array_eo[$v];
	    if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
		$r=referenco($ref->[0]);
		
		print "<a href=\"$r\">";
		print "$ref->[1]";
		print "</a><br>\n";
		
		$last0 = $ref->[0];
		$last1 = $ref->[1];
#	    $n++;
	    }
	}

    } else {
	for ($j=0; $j<=$#arangho_eo; $j++) {
	    print " | " if ($j);
	    print "<a href=\"#eo".($j+1)."\">"
		.$arangho_eo[$j]->[2]."...".$arangho_eo[$j]->[3]."</a> ";
	}

 print "<hr>";

	for ($j=0; $j<=$#arangho_eo; $j++) {

	    print "<a name=\"eo".($j+1)."\">";

	    for ($v=$arangho_eo[$j]->[0]; $v<=$arangho_eo[$j]->[1]; $v++) 
	    {
		$ref = $array_eo[$v];
		if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
		    $r=referenco($ref->[0]);

		    print "<a href=\"$r\">";
		    print "$ref->[1]";
		    print "</a><br>\n";
	
		    $last0 = $ref->[0];
		    $last1 = $ref->[1];
#	    $n++;
		}
	    }

	}

    }

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);

    exit if ($chioenunu);
}

# kreas la indekson de la tradukoj de unu lingvo

sub TRADUKINX {
    my ($lng,$i) = @_;

#    my $asci = letter_asci_nls($lit,'eo');
    my ($r,$ref);
#    my $n = 0;
    my $last0 = '';
    my $last1 = '';
    my $targetfile;

    unless ($chioenunu) {
	$target_file = "$inxdir/$lng"."_".($i+1).".html";
    } else {
	$target_file = "$inxdir/inx_$lng.html";
    }


    #print "$target_file..." if ($verbose);
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    index_header("kapvortindekso");
#    index_buttons();
#    index_letters('kapvortoj ',"$lng".'_',$lit,$literoj,
#		 [map {letter_asci_nls($_,'eo')} @$literoj]);

    unless ($chioenunu) {
	

	NAVIGILO($lng,$i);

#    print "<h1>kapvortoj $lit...</h1>\n";

	for ($v=${"arangho_$lng"}[$i]->[0]; $v<=${"arangho_$lng"}[$i]->[1]; $v++) 
	{
	    $ref = ${"array_$lng"}[$v];
	    if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
		$r=referenco($ref->[0]);
		
		print "$ref->[1]: <a href=\"$r\">";
		print "$ref->[2]"; # substreki a.s. la parton ind?
		print "</a><br>\n";
		
		$last0 = $ref->[0];
		$last1 = $ref->[1];
#	    $n++;
	    }
	}

    } else {
	for ($j=0; $j<=$#{"arangho_$lng"}; $j++) {
	    print " | " if ($j);
	    print "<a href=\"#$lng".($j+1)."\">"
		.${"arangho_$lng"}[$j]->[2]."...".${"arangho_$lng"}[$j]->[3]."</a> ";
	}

 print "<hr>";

	for ($j=0; $j<=$#{"arangho_$lng"}; $j++) {

	    print "<a name=\"$lng".($j+1)."\">";

	    for ($v=${"arangho_$lng"}[$j]->[0]; $v<=${"arangho_$lng"}[$j]->[1]; $v++) 
	    {
		$ref = ${"array_$lng"}[$v];
		if (($last0 ne $ref->[0]) or ($last1 ne $ref->[1])) {
		    $r=referenco($ref->[0]);

		    print "$ref->[1]: <a href=\"$r\">";
		    print "$ref->[2]";
		    print "</a><br>\n";
	
		    $last0 = $ref->[0];
		    $last1 = $ref->[1];
#	    $n++;
		}
	    }

	}

    }

    index_footer();
    close OUT;
    select STDOUT;
    diff_mv($tmp_file,$target_file,$verbose);

    exit if ($chioenunu);
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
	    print "<b>$l</b>\n"; 
	};
    };
    print "<h1>$title_base";
    print " $letter..." if ($letter);
    print "</h1>\n";

}


#################################################################










