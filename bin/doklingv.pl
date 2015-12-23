#!/usr/bin/perl -w

# legas lingvoj.cfg, nls.cfg kaj vokosgn.dtd
# por lingvoj kun sekcio en nls.cfg,
# kreas pagxojn pri alfabeto kaj literunuoj

# voku ekz: 
# doklingv.pl -v

# farenda: rekonu simbolajn literunuojn en ENTITY-difinoj
# kiel che malnovgreka en vokosgn.dtd

##########################################################

use lib "$ENV{'VOKO'}/bin";
use vokolib;
use nls; read_nls_cfg("$ENV{'VOKO'}/cfg/nls.cfg");

################### agordejo ##############################

$debug = 0;

$tmp_file = '/tmp/'.$$.'voko.dok';

# kien meti la lingvo-dokumentajn html-dosierojn,
# kaj de kie preni la simbolojn
$smb_ref = "../../smb"; # relative al la dok_dir
$smbtype = "png";
$dok_dir = "/dok/lng"; # pli malsupre antaumetighas vortaro_pado 
$stilo = "../../stl/artikolo.css"; #relative al dok_dir
$bgcol = "bgcolor=\"#EEEECC\""; # fonkoloro de tabeloj

%sufiksoj = (
	     "acute" => "dekstra korno",
	     "breve" => "ronda hoketo",
	     "caron" => "pinta hoketo",
	     "cedil" => "cedilo",
	     "circ" => "ĉapelo",
	     "comma" => "subkomo",
	     "dblac" => "longa tremao",
	     "dot" => "superpunkto",
	     "grave" => "maldekstra korno",
	     "macron" => "superstreko",
	     "nodot" => "sen punkto",
	     "ogonek" => "subhoko",
	     "ring" => "ringo",
	     "slash" => "trastreko",
	     "stroke" => "trastreko",
	     "tilde" => "tildo",
	     "uml" => "tremao");

%prefiksoj = ("c" => "cirila");

%liternomoj = (
	       "c_malmol" => "cirila minuskla malmolsigno",
	       "c_Malmol" => "cirila majuskla malmolsigno",
	       "c_mol" => "cirila minuskla molsigno",
	       "c_Mol" => "cirila majuskla molsigno",
               "alfa" => "greka minuskla alfa",
               "alfa_ton" => "greka minuskla alfa akcentita",
               "beta" => "greka minuskla beta",
               "gamma" => "greka minuskla gama",
               "delta" => "greka minuskla delta",
               "epsilon" => "greka minuskla epsilon",
               "epsilon_ton" => "greka minuskla epsilon akcentita",
               "zeta" => "greka minuskla zeta",
               "eta" => "greka minuskla eta",
               "eta_ton" => "greka minuskla eta akcentita",
               "jota" => "greka minuskla jota",
               "jota_ton" => "greka minuskla jota akcentita",
               "jota_trema" => "greka minuskla jota tremao",
               "jota_trema_ton" => "greka minuskla jota tremao akcentita",
               "kappa" => "greka minuskla kapa",
               "lambda" => "greka minuskla lambda",
               "my" => "greka minuskla mu",
               "ny" => "greka minuskla nu",
               "xi" => "greka minuskla ksi",
               "omikron" => "greka minuskla omikron",
               "omikron_ton" => "greka minuskla omikron akcentita",
               "pi" => "greka minuskla pi",
               "rho" => "greka minuskla rota",
               "sigma" => "greka minuskla sigma",
               "sigma_fina" => "greka minuskla fina sigma",
               "tau" => "greka minuskla taŭ",
               "ypsilon" => "greka minuskla ypsilon",
               "ypsilon_ton" => "greka minuskla ypsilon akcentita",
               "ypsilon_trema" => "greka minuskla ypsilon tremao",
               "ypsilon_trema_ton" => "greka minuskla ypsilon tremao akcentita",
               "phi" => "greka minuskla fi",
               "chi" => "greka minuskla ĥi",
               "psi" => "greka minuskla psi",
               "omega" => "greka minuskla omega",
               "omega_ton" => "greka minuskla omega akcentita",
               "Alfa" => "greka majuskla alfa",
               "Alfa_ton" => "greka majuskla alfa akcentita",
               "Beta" => "greka majuskla beta",
               "Gamma" => "greka majuskla gama",
               "Delta" => "greka majuskla delta",
               "Epsilon" => "greka majuskla epsilon",
               "Epsilon_ton" => "greka majuskla epsilon akcentita",
               "Zeta" => "greka majuskla zeta",
               "Eta" => "greka majuskla eta",
               "Eta_ton" => "greka majuskla eta akcentita",
               "Jota" => "greka majuskla jota",
               "Jota_ton" => "greka majuskla jota akcentita",
               "Jota_trema" => "greka majuskla jota tremao",
               "Kappa" => "greka majuskla kapa",
               "Lambda" => "greka majuskla lambda",
               "My" => "greka majuskla mu",
               "Ny" => "greka majuskla nu",
               "Xi" => "greka majuskla ksi",
               "Omikron" => "greka majuskla omikron",
               "Omikron_ton" => "greka majuskla omikron akcentita",
               "Pi" => "greka majuskla pi",
               "Rho" => "greka majuskla rota",
               "Sigma" => "greka majuskla sigma",
               "Tau" => "greka majuskla taŭ",
               "Ypsilon" => "greka majuskla ypsilon",
               "Ypsilon_ton" => "greka majuskla ypsilon akcentita",
               "Ypsilon_trema" => "greka majuskla ypsilon tremao",
               "Phi" => "greka majuskla fi",
               "Chi" => "greka majuskla ĥi",
               "Psi" => "greka majuskla psi",
               "Omega" => "greka majuskla omega",
               "Omega_ton" => "greka majuskla omega akcentita"

	       );

################## precipa programparto ###################

$|=1; # ne bufru eligon

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

$vortaro_pado=$config{"vortaro_pado"};
$lingvoj=$config{"lingvoj"};
#$cfg_dir = "$vortaro_pado/cfg";
$dtd_dir = "$vortaro_pado/dtd";
$smb_dir = "$vortaro_pado/smb";
$out_dir = "$vortaro_pado/$dok_dir"; 

# legu la informojn
%lingvoj=read_xml_cfg("$lingvoj",'lingvo','kodo');
%unuoj=read_entities("$dtd_dir/vokosgn.dtd");
#read_nls_cfg("$nls_cfg");

# skribu dosieron kun lingvotabelo
@nls_lingvoj =();
my $lng='';
my $target_file = "$out_dir/lingvoj.html";
#print "$target_file...\n" if ($verbose);
open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
select OUT;
lingv_header("Mallongigoj de lingvoj");
print
    "Se la mallongigo estas ligo, klaku sur ĝin por ekscii\n",
    "pri alfabeto kaj literunuoj de tiu lingvo.\n<P>\n",
    "<TABLE BORDER=\"0\">\n<TR>\n",
    " <TH ALIGN=\"LEFT\">Mallongigo</TH>\n",
    " <TH ALIGN=\"LEFT\">Flago</TH>\n",
    " <TH ALIGN=\"LEFT\">Lingvo</TH>\n</TR>\n";

foreach $lng (sort keys %lingvoj) {
    print "<TR>\n <TD ALIGN=\"RIGHT\">";
    if (defined_nls($lng)) {
	push @nls_lingvoj, ($lng);
        print "<A HREF=\"$lng.html\">";
    }
    print "$lng";
    if (defined_nls($lng)) {
        print "</a>";
    }
    print "</TD>\n";
    print " <TD ALIGN=\"LEFT\">";
    if (-f "$smb_dir/$lng.$smbtype") {
	print "<img src=\"$smb_ref/$lng.$smbtype\" width=\"24\" height=\"16\" alt=\"$lng\" class=\"flago\">";
    } elsif (-f "$smb_dir/$lng.png") {
	print "<img src=\"$smb_ref/$lng.$smbtype\" width=\"24\" height=\"16\" alt=\"$lng\" class=\"flago\">";
    }
    print "</TD>\n";
    print " <TD ALIGN=\"LEFT\">$lingvoj{$lng}</TD>\n</TR>\n";
}
print "</TABLE>\n";
lingv_footer();
close OUT;
select STDOUT;
diff_mv($tmp_file,$target_file,$verbose);




foreach $lng (@nls_lingvoj) {
    
    %letters = defined_nls($lng);

    $target_file = "$out_dir/$lng.html";
#    print "$target_file...\n" if ($verbose);
    
    open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
    select OUT;
    
    lingv_header("Alfabeto kaj literunuoj de la $lingvoj{$lng}");
    print "<TABLE BORDER=\"0\">\n<TR>\n".
	" <TH ALIGN=\"LEFT\">Grupo</TH>\n".
	" <TH ALIGN=\"LEFT\">Litero</TH>\n".
	" <TH ALIGN=\"LEFT\">Priskribo</TH>\n".
	" <TH ALIGN=\"LEFT\">XML-nomo</TH>\n".
	" <TH ALIGN=\"LEFT\">Unikodo</TH>\n</TR>\n";
    
    # kalkulu por chiu litergrupo, kiom da eroj ghi havas
    my %cnts;
    foreach $desc (values %letters) { $cnts{$desc->[0]}++ }

    my ($c,$rowcnt1) = (0,0);
    foreach $lit (sort {cmp_nls($a,$b,$lng)} (keys %letters)) {
	
	$desc = $letters{$lit};
	
	my $kodo = kodo($lit); $kodo =~ s/^0+//;
	
	my $unuo='';
	if (defined $unuoj{$kodo}) {
	    $unuo = "&amp;".$unuoj{$kodo}[0].";";
	}
	$unuo = "&amp;#x$kodo;" if ($kodo and !$unuo);
	
	my $nomo;
	if (length(pack("U*",unpack("U*",$lit))) > 1) { #supozu litergrupon
	    $nomo="litergrupo $lit";
	    $unuo="";
	    $kodo="";
	} elsif ($lit =~ /^[a-z]$/) {
	    $nomo="minuskla $lit";
	} elsif ($lit =~ /^[A-Z]$/){
	    $nomo="majuskla $lit";
	} else {
	    $nomo=priskribo($lit);
	}

	# kiom da linioj en unua kolumno?
	if ($c != $desc->[0]) {
	    $rowcnt = "ROWSPAN = \"$cnts{$desc->[0]}\"";
	    $c = $desc->[0];
	} else {
	    $rowcnt = '';
	}

	my $grupo = $desc->[2];
	unless ($desc->[2] eq $desc->[3]) {
	    $grupo .= " ($desc->[3])";
	}
	
	if ($rowcnt =~ /"1"$/) {
	    print "<TR $bgcol><TD $bgcol ALIGN=\"LEFT\">$grupo</TD>";
	} elsif ($rowcnt) {
	    print "<TR $bgcol><TD $bgcol $rowcnt ALIGN=\"LEFT\">$grupo</TD>";
	} else {
	    print "<TR $bgcol>";
	}

	print "<TD>$lit</TD><TD>$nomo</TD>".
	    "<TD>$unuo</TD><TD>$kodo</TD></TR>\n";

    }
    print "</TABLE>\n";
    
    lingv_footer();
    close OUT;
    select STDOUT;
    
    diff_mv($tmp_file,$target_file,$verbose);
}


unlink($tmp_file);


############### funkcioj ###########

# legas vokosgn.dtd kaj elprenas la
# kodoj kaj liternomojn (unuojn)
sub read_entities {
    $dtdfile=shift;
    my %hash=();
    my $ento='';
    my $kodo='';
    my $nomo='';

    open DTD, $dtdfile
	|| die "Ne povis malfermi dosieron \"$dtdfile\": $!\n";

    while ($line = <DTD>) {
	print "XXX $line" if ($debug);

	if ($line =~ /^<!ENTITY\s+(\w+)\s+\"(\S+)\">(.*)$/ ) {
	    $ento=$1;
	    print "&$ento;" if $debug;
	    $kodo=$2;

	    # por unuopaj literoj e-a nomo povas aperi
	    # kiel komento
#	    $nomo=$3;
#	    if ($nomo =~ /^\s*<!--(.+)-->\s*$/ ){
#		$nomo=$1;
                #anstatauxigu e-literojn
#		$nomo=~s/&jcirc;/ĵ/g;
#	    } else {
#		$nomo='';
#	    }

	    # unuopa deksesuma kodo
	    if ($kodo =~ /^&\#x([\da-f]+);$/i ) { 
		$kodo = $1;
		$kodo =~ s/^0+//;

	    # kombinita litero?
	    } elsif ($kodo =~ /^(\w|&\#x[\da-f]+;)(\w|&\#x[\da-f]+;)$/i ) {
	        @kodo=($1,$2);
		for $i (0..1) {
		    $kodo[$i] =~ s/^&\#x([\da-f]+);$/$1/i;
		}
		$kodo=join('',@kodo);
	    } else {
		print "Ne komprenis en DTD:\n$line";
		next;
	    }
	    $hash{$kodo}=[$ento,$nomo];  

	    print ">>>$kodo:$ento\n" if ($debug);
	} #if ($line
    } # while
    close DTD;
    return %hash;
}

#liveras kodon de litero
sub kodo {
    my ($lit)=@_;
    my $kodo='';

    if ($lit =~ /^[\000-\200]$/) {
	$kodo='';
    } else {
	$kodo = sprintf("%04X",unpack("U",$lit));
#	$kodo =~ s/^0x//;
    }
    return lc($kodo);
}

#liveras priskriban nomon de litero
sub priskribo {
    my ($lit)=@_;
    my $pri='';

    my $kodo=kodo($lit); $kodo =~ s/^0+//;
    my $unuo=$unuoj{$kodo};

#    print STDERR ".... $lit ....\n" if ($debug);

    if ($kodo and $unuo) {

	# eksplicita priskribo?
        $pri=$unuo->[1] || $liternomoj{$unuo->[0]}; 

        # nomo kunmetita el litero plus kromsigno?
        if (! $pri) {
	    
	    # lau model Ccirc?
	    my $l=substr($unuo->[0],0,1);
 	    my $kromsigno = substr($unuo->[0],1,length($unuo->[0])-1);
	    if (defined $sufiksoj{$kromsigno}) {
  	        $pri = ( ($l =~ /^[a-z]$/)?"min":"maj")
		    ."uskla $l $sufiksoj{$kromsigno}";
	    } else {

		# lau model c_ja
		($pref,$l) = split('_',$unuo->[0]);
		
		if (defined $prefiksoj{$pref}) {
		    $pri = $prefiksoj{$pref}.( ($l =~ /^[a-z]$/)?" min":" maj" )
			."uskla $l";
		}
	    }
	} 
    }

    $pri = 'ne konata' unless ($pri);

    return $pri;
}

# skribas la supran parton de html-ajho
sub lingv_header {
    my ($title) = @_;

    print 
	"<html>\n<head>\n<meta http-equiv=\"Content-Type\" ",
	"content=\"text/html; charset=UTF-8\">\n",
	"<link title=\"artikolo-stilo\" type=\"text/css\" ",
	"rel=\"stylesheet\"\n href=\"$stilo\">\n",
	"<title>$title</title>\n",
	"</head>\n<body>\n",
	"<h1>$title</h1>\n<P>\n";
}

# skribas la suban parton de html-ajho
sub lingv_footer {
    print "\n</body>\n</html>\n";
}







