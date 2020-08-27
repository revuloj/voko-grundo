#!/usr/bin/perl

# uzo:
#   dictfaru.pl <xml-dosierujo>
#

# necesas "lynx" kaj xsl-transformilo
# en Lynx vi devas shalti al UTF-8 sur la (O)pcio-pagxo
# kaj ne fogesu met (X) che la opcio "daure konservu opciojn"
#

use lib "$ENV{'VOKO'}/bin";
use nls; read_minuskl_cfg("$ENV{'VOKO'}/cfg/minuskl.cfg");

$debug=0;
binmode STDOUT, "utf8" if $debug;
$verbose = 1;
$nur_indeksoj = 0; # por pli facila testado

@lingvoj=('eo','be','cs','de','en','es','fr','hu','la','nl','pl','pt','ru');

$VOKO = $ENV{"VOKO"};
$xslbin = "$VOKO/bin/xslt.sh";
$xsltproc = "/usr/bin/xsltproc";
$xsl = "$VOKO/xsl/revotxt.xsl";
$tmp = $ENV{"HOME"}."/tmp";
$datfile = "$tmp/dict/revo.dat";
$inxpref = "$tmp/dict/revo";
$indekso = "$tmp/inx_tmp/indekso.xml";

$b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";


%header = (
	   "00-database-utf8" => "",
	   "00-database-url" => "http://purl.org/net/voko/revo/",
	   "00-database-short" => "Reta Vortaro",
           "00-database-info" => "La dosiero estas kreita el la fontoj de la Reta Vortaro je ".`date`);

######### 1a pasho: chiujn XML-artikolojn skribu en grandan tekstdosieron
#########           kaj skribu la pozicion kaj longon de la artikoloj en
#########           indeksdosieron

$pos = 0;
$dir = shift @ARGV;
unless ($dir) {
    warn "Vi ne donis XML-dosierujon. Kreante nur la indeksojn...\n";
    $nur_indeksoj = 1;
}

unless ($nur_indeksoj) {

    unlink "$datfile"; 

    opendir DIR, $dir;
    open INX,">:utf8", "$inxpref.inx" or die "Ne eblis malfermi \"$inxpref.inx\" por skribi\n";

    my $n = 1;

    # output header info
    open OUT,">:utf8", $datfile;

    foreach $h (keys %header) {
	my $str = "$h\n ".$header{$h}."\n";
	print OUT $str;
	$len = length($str);
	    	
	print "[$pos\t$len]\n" if ($verbose);

	print INX $h,"\t",b64_encode($pos),"\t",b64_encode($len),"\n";
	$pos += $len;
    }
    close OUT;

    while ($file = readdir DIR) {
	
	if (-f "$dir/$file" and $file =~ /\.xml$/) {
	    
	    print ($n++)."$file: " if ($verbose);
	    $file =~ s/\.xml$//;

	    # konvertu XML->TXT kaj alpendigu al datumdosiero
#	    `$xslbin $dir/$file.xml $xsl | lynx -nolist -dump -stdin >> $datfile`;
	    `$xsltproc $xsl $dir/$file.xml | lynx -nolist -dump -assume_local_charset=utf8 -display_charset=utf8 -stdin >> $datfile`;
	    $len = (-s "$datfile") - $pos;
	    	
	    print "[$pos\t$len]\n" if ($verbose);

	    print INX $file,"\t",b64_encode($pos),"\t",b64_encode($len),"\n";
	    $pos += $len;
	}
    }
    closedir DIR;
    close INX;

    system("dictzip $datfile");
}


########### 2a pasho: analizu indekso.xml kaj ekstraktu chiujn
###########           informojn por la diverslingvaj indeksoj
###########           kaj fine skribu tiujn

# relegu la pozicio-indekson
open INX,"<:utf8", "$inxpref.inx" or die "Ne eblis legi \"$inxpref.inx\"\n";
while (<INX>) {
    chomp;
    @entry=split("\t");
    $positions{$entry[0]}=[$entry[1],$entry[2]];
}
close INX;

# enlegu indekso.xml
$/ = '</art';    
open INX, "<:utf8", "$indekso" or die "Ne eblis legi la dosieron \"$indekso\"\n";
print "Analizas $indekso...\n" if ($verbose);
while (<INX>) {
    artikolo($_);
}     
close INX;
$/ = "\n"; 

# skribu lingvoindeksojn
foreach $lng (@lingvoj) {
    my $last0, $last1;

    print "$lng...\n" if ($verbose);
    $refs = $tradukoj{$lng};

    open INX, ">:utf8", "$inxpref.$lng.inx";

    foreach $h (keys %header) {
	$pos = $positions{$h};
	print INX "$h\t", $pos->[0], "\t", $pos->[1], "\n";
    }

    $refs = $tradukoj{$lng};
#    for $entry (sort { compare($a->[0],$b->[0]) } @$refs) {
    use bytes;
    for $entry (sort { $a->[0] cmp $b->[0] } @$refs) {
	if (($pos = $positions{$entry->[1]})
	    and (($last0 ne $entry->[0]) or ($last1 ne $entry->[1]))) { 
	    print INX $entry->[0], "\t", $pos->[0], "\t", $pos->[1], "\n";
	    $last0 = $entry->[0];
	    $last1 = $entry->[1];
	}
    }
    close INX;
}      


########### helpfunkcioj
###########
###########


sub b64_encode {
    my $val = shift;
    my $res = '';
    
    $res .= substr($b64, ($val & 0xc0000000) >> 30, 1);
    $res .= substr($b64, ($val & 0x3f000000) >> 24, 1);
    $res .= substr($b64, ($val & 0x00fc0000) >> 18, 1);
    $res .= substr($b64, ($val & 0x0003f000) >> 12, 1);
    $res .= substr($b64, ($val & 0x00000fc0) >>  6, 1);
    $res .= substr($b64, ($val & 0x0000003f), 1);
 
    # forigu komencajn nulojn
    $res =~s/^A+//;
    unless ($res) { $res = 'A' };

    return $res;
}       

 # transformas entjeran valoron de unikoda signo al UTF-8
# (tre simile al to_utf8, ne uzata momente)
sub hex_utf8 { 
    my $c = hex($_[0]);
    return $c < 0x80 ? chr($c) : 
        $c < 0x800 ? chr($c >>6&0x3F|0xC0) . chr($c & 0x3F | 0x80) :
            chr($c >>12&0x0F|0xE0).chr($c >>6&0x3F|0x80).chr($c &0x3F|0x80);
} 

sub int_utf8 { 
    my $c = $_[0];
    return $c < 0x80 ? chr($c) : 
        $c < 0x800 ? chr($c >>6&0x3F|0xC0) . chr($c & 0x3F | 0x80) :
            chr($c >>12&0x0F|0xE0).chr($c >>6&0x3F|0x80).chr($c &0x3F|0x80);
} 

# kompari konsiderante nur [A-Za-z0-9 ]
sub compare {
    $x = shift;
    $y = shift;
 
#    $x =~ s/[^a-zA-Z0-9 ]//g;
#    $y =~ s/[^a-zA-Z0-9 ]//g;

    use utf8;
    $x =~ s/[^[:alnum:]]//g;
    $y =~ s/[^[:alnum:]]//g;

    $x = lc($x);
    $y = lc($y);

    use bytes;
    return $x cmp $y;
}               

# analizas la indeks-tekston de artikolo
 
sub artikolo {
    my $tekst = shift;
    my ($mrk,$kap,$rad,$first_lit,$last_lit);
 
    # elprenu la markon
    $tekst =~ s/^.*?<art\s+mrk="([^\"]*)"\s*>//s;
    $mrk = $1;
    unless ($mrk) {
        # se tio ne estas la vosto de la dosiero, plendu
        if ($tekst =~ /<\/art$/) {
            warn "marko ne trovighis en $tekst\n";
        }
        return;
    }

    # elprenu radikon
    if ($tekst =~ /<rad\s*>(.*?)<\/rad\s*>/s) {
	    $rad = $1;
    } else { warn "Ne trovis radikon en la artikolo $mrk.\n"; return; }

    # trovu chiujn kapvortojn (inkl. de derivajhoj)
    $tekst =~ s/<kap\s*>(.*?)<\/kap\s*>/
	traduko(tld($1,$rad),'eo',$mrk)/segx;

    # trovu chiujn tradukojn
    $tekst =~ s/<trd\s+lng="([^\"]*)"\s*>(.*?)<\/trd\s*>/
	traduko($2,$1,$mrk)/segx; 

    return '';
}

# anstatuigas tildon
sub tld {
  my ($kap,$rad) = @_;

print "tld($kap)\n" if ($debug);

  $kap =~ s/<\/?rad.*?>//g;
  $kap =~ s/<tld.*?>/$rad/g;
  return $kap;
}

# notas unuopan tradukon

sub traduko {
    my ($trd,$lng,$mrk)=@_;
    my $ind;

print "traduko($trd)\n" if ($debug and $lng eq "eo");

    # forigu eblajn klr-ojn 
    $trd =~ s/<klr[^>]*>.*?<\/klr>//sg;

    # kio estas la indeksenda vorto?
    if ($trd =~ /<ind>(.*?)<\/ind>/s) {
        $ind = $1;
    } else {
        $ind = $trd;
    }
    
    # forigu aliajn ghenajn signojn
    $ind =~ s/\///sg;
    $ind =~ s/\n/ /sg;

    # forigu komencajn/finajn spacojn
#    $ind=~s/\s*$//s;
#    $ind=~s/^\s*//s;
 
    $ind = normigu($ind);

print "traduko rezulto: $ind \n" if ($debug and $lng eq "eo");


    # metu la vorton en la indekson
    push @{$tradukoj{$lng}}, [$ind,$mrk];
 
    return '';
};          


sub normigu {
    my $txt=shift;
   
    use utf8;

    # perforte certigu, ke txt estas konsiderata UTF-8
    $txt = pack("U*",unpack("U*",$txt));
  #utf8::upgrade($txt);
    use locale;
    $txt =~ s/[^[:alnum:]]//g;
    $txt = lc($txt); #lowercase($txt);

    return $txt;
}
