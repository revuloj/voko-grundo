#!/usr/bin/perl -w
#

# uzo:
#   xml2html_all.pl [-v] [-a|-m] [-c <agorddosiero>]

$debug=0;
$tmp_file = '/tmp/'.$$.'voko.art';
$|=1;
$xsl = $ENV{"VOKO"}.'/xsl/revohtml.xsl';
$xslt = $ENV{"VOKO"}.'/bin/xslt.sh';

$max_malnovaj=50;     # ne konvertu tro multajn malnovajn
$malnova=60*60*24*30*3; # malnova signifas - tri monatoj

while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = shift @ARGV; # skribas la dosiernomon dum la konverto
    } elsif ($ARGV[0] eq '-a') {
	$all = shift @ARGV;     # æiujn, ne nur la pli novajn dosierojn traktu
    } elsif ($ARGV[0] eq '-m') {
	$malnovaj = shift @ARGV; # krom la jhus shanghitaj konvertu ankau kelkaj
                                 # longe ne tushitajn
    } elsif ($ARGV[0] eq '-c') {
	shift @ARGV;
	$agord_dosiero = shift @ARGV; 
    } else {
	die "nevalida argumento $ARGV[0]\n";
    }
}

if ($all and $malnovaj) {
    die "Opcioj -m kaj -a ne estas kombineblaj.\n";
}

# legu la agordo-dosieron
unless ($agord_dosiero) { $agord_dosiero = "cfg/vortaro.cfg" };

open CFG, $agord_dosiero 
    or die "Ne povis malfermi agordodosieron \"$agord_dosiero\".\n";

while ($line = <CFG>) {
    if ($line !~ /^#|^\s*$/) {
	$line =~ /^([^=]+)=(.*)$/;
	$config{$1} = $2;
    }
}
close CFG;

$vortaro_pado = $config{"vortaro_pado"};
unless ($vortaro_pado) { die "Malplena vortaro-pado\n"; }


$fromdir = "$vortaro_pado/xml";
$todir = "$vortaro_pado/art";
$n = 0;

opendir DIR,$fromdir;
for $file (sort readdir(DIR)) {

    $infile = "$fromdir/$file";

    if ((-f $infile) and ($infile =~ /\.xml$/)) {
   
	$outfile = "$todir/$file";
	$outfile =~  s/\.xml$/\.html/i;
	
	if (not (-e $outfile)                           # ne ekzistas html-dosiero
            or not (-s $outfile)                        # malplena html-dosiero 
	    or ((stat $outfile)[9] < (stat $infile)[9]) # aý estas pli malnova
	    or $all                                     # aý konvertu æiujn
	    or ($malnovaj and (time() - (stat $outfile)[9] > $malnova)
		and ($n++ < $max_malnovaj))) {          

	    # transformu per XSL
	    print "$infile -> $outfile..." if ($verbose);
	    `$xslt $infile $xsl > $tmp_file`;

	    # enshovu tezaurajn ligojn ktp.
	    `htmlposte.pl $tmp_file`;

	    # shovu la HTML-dosieron al ghusta loko
	    if ($all) {
		# aktualigu nur, se shanghite
		diff_mv($tmp_file,$outfile);
	    } else {
		# aktualigu, pro neekzisto au diverseco de la dosierdatoj
		print "farite\n" if ($verbose);
		`mv $tmp_file $outfile`;
	    }
	} else {
	    warn "ignoru: $infile\n" if ($debug);
	}
    }
}
close DIR;
unlink($tmp_file);



  
# komparas novan dosieron kun ekzistanta,
# kaj nur che shanghoj au neekzisto alshovas
# la novan dosieron

sub diff_mv {
    my ($newfile,$oldfile) = @_;

    if ((! -e $oldfile) or (`diff -q $newfile $oldfile`)) {
	print "farite\n" if ($verbose);
	`mv $newfile $oldfile`;
    } else {
	print "(senshanghe)\n" if ($verbose);
	unlink($newfile);
    }
};




