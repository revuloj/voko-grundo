#!/usr/bin/perl 
###############################################################
# Respondas lau CGI al demando de la serchpagho
# serchante en la la indekso au plena teksto de vortaro
# certajn artikolojn.
#
# la serchindikojn ghi ricevas per CGI, do el la variablo
# QUERY_STRING
#
# vi povas uzi serchcgi.pl kun vokosrv.pl por loka uzado
# au kun via ttt-servilo. En la dua kazo vi devas adapti øin
# kiel priskribite en la malsupraj instrukcioj.
#############################################################

# por utiligi serchcgi.pl kun via ttt-servilo, faru la
# sekvan: 
# 1. Kopiu serchcgi.pl kaj sercho.pm al la dosierujo
#    cgi-bin der via ttt-servilo.
# 2. Metu la vortaron en iun dosierujon, en la dokumentarbo
#    de via ttt-servilo, ekz /htdocs/voko/pev
# 3. Forigu /htdocs/voko/pev/bin (pro sekureco)
# 4. Difinu $VOKO kiel la absoluta pado al viaj vortaroj,
#    ekz. $VOKO="/htdocs/voko"
# 5. Laýnecese adaptu %vortaroj, pro sekureco indiku nur
#    ekzistantajn vortarojn.
# 6. Difinu $site kiel la URL-parto, kiu indikas la virtualan
#    padon al la vortaroj. Se ekzemple via vortaro estas 'pev'
#    kaj estas atingebla de ekstere sub http://mia.kompo/voko/pev
#    vi difinu $site="http://mia.kompo/voko/"
# 7. Adaptu la padon en sercxo.htm:
#    <form action=http://mia.kompo/cgi-bin/serchcgi.pl>


BEGIN {
# en kiu dosierujo mi estas?
$pado = $0;
$pado =~ s|\\|/|g; # sub Windows anstatauigu \ per /
$pado =~ s/serchcgi.pl$//;
# print $pado;
# shargu la funkcio-bibliotekon
require $pado."sercho.pm"; 
}

# Se en via medio (ENVIRONMENT) ne estas
# difinita $VOKO, tie æi indiku la absolutan padon
# al via voko-dosiero
$VOKO = $ENV{'VOKO'}."/..";

# kiuj vortaroj ekzistas, kaj en kiuj
# lokoj ili estas? La lokojn nepre donu 
# relative al $VOKO!
# la maldekstra nomo respondas al valoro %%% en sercxo.htm:
# <input type=hidden name=vortaro value=%%%>

%vortaroj = (
  'revo' => "revo",
  'pevet' => "pevet",
  'grimp' => "grimp",
  'bak' => "bak"
);

# $site="file:$VOKO/"; # por loka vortaro
# $site="http://localhost/pado/al/voko/"; # por loka ttt-servilo
# $site="http://mia.komputilo/pado/al/voko/"; # por 'publika' ttt-servilo 
$site="http://localhost/voko/";

# restriktoj por parametroj
$eblaj_parametroj = 'strukturo|esprimo|nombro|vortaro';
$eblaj_strukturoj = 'kap|ref|trd|art'; 

############# komenco de la programeto #####################

# esploru la parametrojn:

foreach $pair (split ('&',$ENV{'QUERY_STRING'})) {
	if ($pair =~ /(.*)=(.*)/) {
		($key,$value) = ($1,$2);
		if ($key =~ /^(?:$eblaj_parametroj)$/) {
		    $value =~ s/\+/ /g; # anstatauigu '+' per ' '
		    $value =~ s/%(..)/pack('c',hex($1))/eg;
		    $params{$key} = $value;
		};
	}
};

# ekzamenu la parametrojn, chu ili estas en ordo
#print $params{'vortaro'};
$pado = $vortaroj{$params{'vortaro'}};
if (not $pado) {
 mortu("Parametro \"vortaro\" indikas nekonatan vortaron "
    .$params{'vortaro'}.".\n")};

$params{'strukturo'} =~ /^(?:$eblaj_strukturoj)$/
    or mortu("Parametro \"strukturo\" ne estas valida.\n");

$params{'nombro'} =~ /^[0-9]*$/
    or mortu("Parametro \"nombro\" ne estas valida.\n");

$max=$params{'nombro'};
if (($max eq '') or ($max <= 0)) { $max = 100000000 };

# lokoj kaj nomoj de indekso kaj vortaro
$inxfn = "$VOKO/$pado/sgm/indekso.xml";
$vrtfn = "$VOKO/$pado/sgm/vortaro.xml";

# sub Windows anstatauigu la disklegil-literon
$pado =~ s§([A-Z])\:/§///$1|/§i;
$vortaro_radiko = "$site$pado";
$artikoloj = "$site$pado/art";

# HTML-eroj
$stilo = "<link titel=\"indekso-stilo\" type=\"text/css\" ".
    "rel=stylesheet href=\"$vortaro_radiko/stl/indeksoj.css\">\n";

$referencoj= "<i><a href=\"$vortaro_radiko/sercxo.html\" ".
    "target=\"precipa\">ser\304\211o</a></i>\n".
    "<i><a href=\"$vortaro_radiko/inx/indeksoj.html\" ".
    "target=\"indekso\">indeksoj</a></i>\n";

$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n";

$|=1;

# skribu la kapon de la dosiero
print "Content-Type: text/html\n\n";
print "<html><head><title>sercxrezulto</title>\n";
print "$charset$stilo</head><body>\n";
print "$referencoj";
print "<h1>ser\304\211rezulto</h1>\n";

# parametroj por la serch-objekto
if ($params{'strukturo'} eq 'art') {
    %parametroj = (
	       'dosiero' => "$vrtfn",
	       'esprimo' => "$params{'esprimo'}",
	       'strukturo' => "$params{'strukturo'}");
    $sercho = nova sercho(%parametroj);
    $sercho -> malfermu;

    while (($n < $max) and (@rez = $sercho->serchu_sekvan)) {
	$n += $#rez + 1;
	for $linio (@rez) { 
	    my @fields = split(/\|\|/,$linio);
	    print "<a href=\"$artikoloj/".lc($fields[0]).
		".html\" target=\"precipa\">$fields[1]</a>";
	    print " (".$fields[2];
	    for ($i=3; $i < ( $#fields > 12 ? 12 : $#fields); $i++) {
		print ", ".$fields[$i];
	    };
	    print $#fields > 12 ? ",... )" : ")";
	    print "<br>\n";
	};
     };
} else {

    
    %parametroj = (
	       'dosiero' => "$inxfn",
	       'esprimo' => "$params{'esprimo'}",
	       'strukturo' => "$params{'strukturo'}");

    $sercho = nova sercho(%parametroj);
    $sercho -> malfermu;

    while (($n < $max) and (@rez = $sercho->serchu_sekvan)) {
	for $linio (@rez) { 
	    my @fields = split(/\|\|/,$linio);
	    $fields[2] =~ s/^([^\.]*)(.*)$/"$artikoloj\/".lc($1).
		".html#$1$2"/e;
	    if ($parametroj{'strukturo'} ne 'kap') { print "$fields[4]: "; };
	    print "<a href=\"$fields[2]\" target=\"precipa\">$fields[3]</a>";
	    print "<br>\n";
	};
	$n += $#rez;
    };
};


# skribu la voston de la dosiero
print "<p>$referencoj";
print "</body></html>";

sub mortu {
    print "Content-Type: text/html\n\n";
    print "<html><title>eraro</title><body>\n";
    print "<h1>Eraro!</h1>\n";
    print $_[0];
    print "</body></html>\n";
    exit;
};


