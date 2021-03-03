#!/usr/bin/perl -w

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

$xml_dir = 'xml';    # relative al vortara radidosierujo
$art_dir = '../art'; # relative al inx
$cvs_log = '/usr/bin/cvs log';
$neliteroj = '0-9\/\s,;\(\)\.\-!:';

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
%kapvortoj = ();
$kv_mrk = 0;
$kv_kap = 1;
#XX$kv_rad = 2;
%tradukoj = ();         # %tradukoj{lingvo}->%{litero}->@[mrk,kap,ind,trd]
$tr_mrk = 0;
$tr_kap = 1;
$tr_ind = 2;
$tr_trd = 3;
%radDeDosiero = ();

# legu la fakojn
%faknomoj = read_xml_cfg($config{"fakoj"},'fako','kodo');

# legu la lingvojn
%lingvoj=read_xml_cfg($config{"lingvoj"},'lingvo','kodo');

print system("/bin/bash -c \"ulimit -a\"") if ($verbose);

# legu la tutan indeks-dosieron
print "Legi kaj analizi $inxfn...\n" if ($verbose);
$/ = '</art';
open INX, $inxfn or die "Ne povis malfermi $inxfn\n";
while (<INX>) {
    artikolo($_);
}
close INX;
$/ = "\n";

%UTF8alX = (
  chr(264) => "Cx",
  chr(265) => "cx",
  chr(284) => "Gx",
  chr(285) => "gx",
  chr(292) => "Hx",
  chr(293) => "hx",
  chr(308) => "Jx",
  chr(309) => "jx",
  chr(348) => "Sx",
  chr(349) => "sx",
  chr(364) => "Ux",
  chr(365) => "ux",
  );

# traktu cxiujn unuopajn indekserojn

# kreu la Javaskripto-dosierojn
&javaskriptoDosieroj();

############## funkcioj por analizi la indeks-dosieron ##############

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
#    push @{ $invvortoj{$last_lit } }, [$mrk,$kap,$reversed_rad];

    print "rad: $rad reversed ".reverse($rad)."\n" if ($debug);

    $kap =~ s/\///g;
    push @{ $kapvortoj{$first_lit} }, [$mrk,$kap];#XX,$rad];
    $radDeDosiero{$mrk} = $rad;

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

	push @{ $kapvortoj{$first_lit} }, [$mrk,$kap];#XX,$rad];
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
#    push @{ $fakoj{$fak} }, [$mrk,$kap,$rad];

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

#    push @bildoj, [$mrk,$kap,$bldpriskr,$rad];

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

#    push @mallongigoj, [$mrk,$kap,$mll];

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
    #$lng = 'af'; {
    foreach $lng (sort keys %tradukoj) { 
      @literoj = sort { cmp_nls($a,$b,$lng) } keys %{$tradukoj{$lng}};
      #$unua_litero{$lng} = letter_asci_nls($literoj[0],$lng);
      $n = 0;
      $nombroListoj = 0;
      $listoNomo = 'Eroj';
      %eoKunTraduko = ();
      foreach $lit (@literoj) {
        $refs = $tradukoj{$lng}->{$lit};
        @$refs = sort { cmp_nls($a->[$tr_ind],$b->[$tr_ind],$lng) } @$refs;
        &jx_lng_lit_js($lng,$lit,\@literoj,$refs);
        undef $refs;
        undef $tradukoj{$lng}->{$lit};
      }
      &jx_lng_js($lng,\@literoj);
      print "PRETA js $lng\n" if ($verbose);
      &lx_lng_html($lng,\@literoj);
      print "PRETA: html $lng\n" if ($verbose);
    }
  }
  print ".\n" if ($verbose);
  print "atendi\n";
  $j = 0;
  for ($i = 0; $i < 50000000; $i++)
  { $j = $i; }
  print "finatendi\n";
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
    if (($last1 ne $ref->[$tr_kap]) or ($last2 ne $ref->[$tr_trd])) {
      $r=referenco($ref->[$tr_mrk]);    
      $kap = $ref->[$tr_kap];
      $trd = $ref->[$tr_trd];
      #$trd =~ s/(<\/?)ind>/$1u>/sg;
      $trd =~ s/[\r\n\f]/ /g;
      $trd =~ s/ *$//g;
      $trd =~ s/  / /g;
      if ($r =~ /\#([^.]*)\.([^"]*)$/)
      {
        &NovaEro($trd, $1, $2, $ref->[$tr_kap], $kap);
      }
      elsif ($r =~ /art\/([^.]*)\.html$/)
      {
        &NovaEro($trd, $1, '', $ref->[$tr_kap], $kap);
      }
      else
      {
        print STDERR "ne trovighas eroj en: $trd: $r $ref->[$tr_kap]\n";
      }
      $last1 = $ref->[$tr_kap];
      $last2 = $ref->[$tr_trd];
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
  $unuaParto .= join('',<IN>);
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
    @$refs = sort { cmp_nls($a->[$kv_kap],$b->[$kv_kap],'eo') } @$refs;
    &jx_lng_eo_lit_js($lng,$lit,\@literoj,$refs);
    undef $refs;
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
    if (($last0 ne $ref->[$kv_mrk]) or ($last1 ne $ref->[$kv_kap])) {
      $r=referenco($ref->[$kv_mrk]);
      $kap = $ref->[$kv_kap];
      if ($r =~ /\#([^.]*)\.([^"]*)$/)
      {
        if (!exists($eoKunTraduko{$ref->[$kv_kap]}))
        { &NovaEro('', $1, $2, $ref->[$kv_kap], $kap); }
      }
      elsif ($r =~ /art\/([^.]*)\.html$/)
      {
        if (!exists($eoKunTraduko{$ref->[$kv_kap]}))
        { &NovaEro('', $1, '', $ref->[$kv_kap], $kap); }
      }
      else
      {
        print STDERR "ne trovas eroj en: $r $ref->[$kv_kap]\n";
      }
      $last0 = $ref->[$kv_mrk];
      $last1 = $ref->[$kv_kap];
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
sub Marko()
{
  local ($dosiero, $esperanto, $rad) = @_;
  if ($esperanto =~ /[^ -~]/) {
  }
  foreach $signo (keys(%UTF8alX))
  { $esperanto =~ s/$signo/$UTF8alX{$signo}/g;
    $rad =~ s/$signo/$UTF8alX{$signo}/g;
  }
  $esperanto =~ s/,  */,/g;
  $esperanto =~ s/ /_/g;
  $esperanto =~ s/\W*$//g;
  $esperanto =~ s/^\W*//g;
  $rad =~ s/\W*$//g;
  $rad =~ s/^\W*//g;
  if ($esperanto =~ /^(.*?)($rad)(.*)$/i)
  {
    $antau0 = '';
    $post0 = $esperanto;
    while ($post0 =~ /^(.*?)($rad)(.*)$/i)
    {
      $antau0 .= $1;
      $mezo = $2;
      $post0 = $3;
      if ($mezo ne $rad && lcfirst($mezo) eq lcfirst($rad))
      {
        $antau0 .= substr($mezo, 0, 1);
        if (substr($mezo, 1, 1) eq 'x')
        { $antau0 .= 'x'; }
      }
      $antau0 .= '0';
    }
    return $dosiero . "." . $antau0 . $post0;
  }
  else
  { return ''; }
}
sub JavascriptMarko()
{
  local ($dosiero, $esperanto, $rad, $nunaMarko) = @_;
  if ($esperanto =~ /[^ -~]/) {
  }
  foreach $signo (keys(%UTF8alX))
  { $esperanto =~ s/$signo/$UTF8alX{$signo}/g;
    $rad =~ s/$signo/$UTF8alX{$signo}/g;
  }
  $esperanto =~ s/,  */,/g;
  $esperanto =~ s/ /_/g;
  $esperanto =~ s/\W*$//g;
  $esperanto =~ s/^\W*//g;
  $rad =~ s/\W*$//g;
  $rad =~ s/^\W*//g;
  $marko = '';
  if ($esperanto =~ /^$rad.$/i)
  { ; }
  else
  {
    $longeco = length($rad);
    if ($longeco < 2) { return $nunaMarko; }
    if ($longeco > 15) { $marko .= '>'; $longeco -= 15; }
    $marko .= chr(ord('#') + $longeco - 2);
    if ($esperanto =~ /^(.+?)($rad)(.*)$/i)
    {
      $posEnVorto = length($1);
      if ($posEnVorto > 13) { $marko .= '>'; $posEnVorto -= 13; }
      $marko .= chr(ord('#') + $posEnVorto);
    }
  }
  if ($rad =~ /^[a-z]/ && index($esperanto, ucfirst($rad)) != -1)
  { $marko .= '_'; }
  if ($rad =~ /^[A-Z]/ && index($esperanto, lcfirst($rad)) != -1)
  { $marko .= '^'; }
  if ($dosiero =~ /^(\D*)(\d+)$/)
  {
    if (length($1) > 6) { return $nunaMarko; }
    local $cifero = $2;
    if ($esperanto =~ /^$1/i)
    { $marko .= "$cifero"; }
  }
  elsif ($dosiero =~ /^(\D\D\D\D\D\D)$/ && $esperanto =~ /^$1/i)
  { $marko .= ']'; }
  if ($nunaMarko =~ /^.*?\..*?\.(.*)$/)
  { $marko .= "~$1"; }
  return $marko;
}
sub NovaEro()
{
  local ($traduko, $dosiero, $loko, $esperanto, $kap) = @_;
  $traduko =~ s/<[^>]*>//g;
  $traduko =~ s/"/\\"/g;
  $traduko =~ s/\\$/\\ /g;
  $esperanto =~ s/[\r\n\f] */ /g;
  $eoKunTraduko{$esperanto} = '1';
  $js_marko = $dosiero;
  $marko=$esperanto;
  foreach $signo (keys(%UTF8alX))
  { $marko =~ s/$signo/$UTF8alX{$signo}/g;
  }
  if ($traduko ne '')
  {
    print '"'.$traduko.'",';
  }
  #if ($loko ne '') {$js_marko .= '.' . $loko;} elsif ($loko eq '') {} elsif(1)
  if ($loko eq '')
  {
    if ($esperanto =~ /^$dosiero.$/i)
    { $js_marko = '!'; }
    elsif ($dosiero =~ /^(\D*)(\d+)$/ && length($1) <= 6)
    {
      local $cifero = $2;
      if ($esperanto =~ /^$1/i)
      { $js_marko = "!$cifero"; }
    }
    elsif ($dosiero =~ /^(\D\D\D\D\D\D)$/ && $esperanto =~ /^$1/i)
    { $js_marko = '}'; }
  }
  else
  {
    $js_marko .= '.' . $loko;
    $rad = $radDeDosiero{$dosiero};
    $bona_marko = &Marko($dosiero, $esperanto, $rad);
    $bona_marko_por_kompari = $bona_marko;
    $bona_marko_por_kompari =~ s/\(/\\(/g;
    $bona_marko_por_kompari =~ s/\)/\\)/g;
    if ($js_marko =~ /^$bona_marko_por_kompari(\.[^.]*)?$/)
    { $js_marko = &JavascriptMarko($dosiero, $esperanto, $rad, $js_marko); }
    else
    { # proponu pli bonajn markojn
      if ($js_marko =~ /\.([^.0]+)$/)
      { $pliprecizigo = $1;
        if ($bona_marko !~ /$pliprecizigo/i)
        { $bona_marko .= '.' . $pliprecizigo; }
      }
      if ($verbose && $lng eq 'af')
      { print STDERR $esperanto.': '.$js_marko." -> ".$bona_marko . "\n"; }
    }
  }
  print '"'.$esperanto.'","'.$js_marko."\",\n";
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
  index_buttons();
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








