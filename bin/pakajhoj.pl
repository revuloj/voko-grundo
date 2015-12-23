#!/usr/local/bin/perl -w

# preparas pakajhojn voko.tgz, revobld.tgz revoxml.tgz revohtml.tgz
# komplete chiumonate

# krome faras chiusemajne pakajhon de la shanghitaj dosieroj de Revo

# farenda: ne arkivu dosierojn CVS/* *~ #*#
#          verajne necesas skribi tiujn en dosieron kaj transdoni
#          tion al tar tra opcio --exclude-from

use lib "$ENV{'VOKO'}/bin";
use vokolib;
use utf8;

$verbose = 1;
$tar = "/bin/tar";

$VOKO = $ENV{'VOKO'};
$HOME = $ENV{'HOME'};
$datelog = "$HOME/etc/paktempoj";
$pakoj = "$HOME/tgz";
$revo = "$HOME/revo";
$tmpfile = "$HOME/tmp/tgzinx.html";
$inxfile = "$pakoj/index.html";

$parta = 4*24*60*60; # post 4 tagoj faru novan parton
$kompleta = 7*$parta; # post 28 tagoj faru novan kompleton

$vokoajhoj = "bin dok div dtd stl cgi smb cfg xsl ant LEGUMIN PROGRAMOJ";
$xmlajhoj = "xml dtd xsl stl cfg smb";
$bldajhoj = "bld";
$htmlajhoj= "art dok inx tez index.html sercxo.html titolo.html revo.ico revo.jpg".
    "reto.gif revo.gif araneo.gif travidebla.gif";

%config = read_cfg($datelog) if (-f $datelog);
unless ($config{'lasta_parta'}) {
    $config{'lasta_parta'} = $config{'lasta_kompleta'};
}

@nun = gmtime(time());
$nunstr = sprintf('%4d-%02d-%02d',$nun[5]+1900,$nun[4]+1,$nun[3]);

if (not $config{'lasta_kompleta'} or 
    (time() - $config{'lasta_kompleta'}) > $kompleta) {

    # faru kompletajn pakojn...
    $config{'lasta_kompleta'} = time();
    $config{'lasta_parta'} = $config{'lasta_kompleta'};

    `rm $pakoj/voko_*.tgz $pakoj/revoxml_*.tgz $pakoj/revobld_*.tgz`;
    `rm $pakoj/revohtml_*.tgz $pakoj/revonov_*.tgz`;

    # voko-iloj
    $cmd = "$tar -C $VOKO -czf $pakoj/voko_$nunstr.tgz $vokoajhoj";
    print "$cmd\n" if ($verbose);
    `$cmd`;

    # xml-ajhoj
    $cmd = "$tar -C $revo -chzf $pakoj/revoxml_$nunstr.tgz $xmlajhoj";
    print "$cmd\n" if ($verbose);
    `$cmd`;

    # bildoj
    $cmd = "$tar -C $revo -czf $pakoj/revobld_$nunstr.tgz $bldajhoj";
    print "$cmd\n" if ($verbose);
    `$cmd`;

    # html-ajhoj
    $cmd = "$tar -C $revo -czf $pakoj/revohtml_$nunstr.tgz $htmlajhoj";
    print "$cmd\n" if ($verbose);
    `$cmd`;

    write_cfg($datelog);

} elsif ( (time() - $config{'lasta_parta'}) > $parta) {


    @tiam = gmtime( $config{'lasta_parta'} );
    $tiamstr = sprintf('%4d-%02d-%02d',$tiam[5]+1900,$tiam[4]+1,$tiam[3]);
    $dato = sprintf('%4d-%02d-%02d %02d:%02d:%02d',$tiam[5]+1900,$tiam[4]+1,
		    $tiam[3],$tiam[2],$tiam[1],$tiam[0]);
    $config{'lasta_parta'} = time();

    # faru pakon de shanghitaj artikoloj
    $cmd = "$tar -C $revo -cz -N \"$dato\" -f $pakoj/revonov_$tiamstr"."_$nunstr.tgz "
	."-h $xmlajhoj $bldajhoj $htmlajhoj";
    print "$cmd\n" if ($verbose);
    `$cmd`;

    write_cfg($datelog);
}    


make_tgz_inx();


#####################

sub write_cfg {
    $file = shift;

    open CFG, ">$file" or die "Ne povis skribi al \"$file\": $!\n";
    while ( ($key,$val) = each %config ) {
	print CFG "$key=$val\n";
    }
    close CFG; 
}
    
sub make_tgz_inx {

    open INX,">$tmpfile" or die "Ne povis skribi al \"tmpfile\": $!\n";
    select INX;
    print <<EOS;
<HTML>
<HEAD>
<TITLE>El&#x015d;uti Revo-rilatan materialon</TITLE>
<meta http-equiv="Content-Type" Content="text/html; charset=UTF-8">
</HEAD>

<BODY>

<H1>El&#x015d;uti ReVon kaj programaron</H1>


EOS

    print_file_list();


    print <<EOS;

<hr>
  &#x0108;iuj iloj de VoKo estas publikigataj sub la
  <a href="../revo/dok/copying.txt">GNUa Ĝenerala Publika Permesilo</a>. 
</BODY>
</HTML>
EOS

    select STDOUT;
    close INX;

    diff_mv($tmpfile,$inxfile,$verbose);

}

sub print_file_list {

    opendir DIR, $pakoj;
    local @files = readdir DIR;
    close DIR;

    sub grepfile {
	my $pattern = shift;

	for ($i=0; $i <= $#files; $i++) {
	    if ($files[$i] =~ /$pattern/) {
		my @f = splice @files, $i, 1; 
		return $f[0];
	    }
	}
	return 0;
    }

    sub filesize {
	my $file = shift;
	my $size = (-s "$pakoj/$file");

	if ($size < 1024) {
	    return sprintf("%d B",$size);
	} elsif ($size < 1024*1024) {
	    return sprintf("%d KB",$size/1024);
	} else {
	    return sprintf("%.1f MB",$size/1024/1024);
	}
    }
    
    # unue listigu kompletojn
    if (grep /^revoxml_.*\.tgz$/, @files) {
	print "<h2>Reta Vortaro - kompleto</h2>\n<dl>\n";

	if ($f = grepfile ('^revoxml_.*\.tgz$')) {
            print "<dt>fontodosieroj (XML, DTD, XSL ktp.)</dt>\n"; 
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")</dd>\n";
        }

        if ($f = grepfile ('^revohtml_.*\.tgz$')) {
	    print "<dt>prezentodosieroj (artikoloj, indeksoj, ",
	          "k. a. HTML-dosieroj)</dt>\n";
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")</dd>\n";
	}

	if ($f = grepfile ('^revobld_.*\.tgz$')) {
            print "<dt>bildoj</dt>\n";
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")</dd>\n";
        }
        print "</dl>\n";
    }

    
    # poste listigu partajn
    if (grep /^revonov_.*\.tgz$/, @files) {
         print "<h2>Reta Vortaro - laste ŝanĝitaj dosieroj</h2>\n<dl>\n";

         @files = sort @files;
         while ($f = grepfile ('^revonov_.*\.tgz$')) {

	    #$f =~ /(\d{4}-\d{2}-\d{2})\.tgz/);
	    print "<dt>ŝanĝitaj dosieroj</dt>\n";
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")</dd>\n";
	
	}
	print "</dl>\n";
    }

    # dict-versio
    if (grep /^revodict.*\.tgz$/, @files) {
	print "<h2>DICT-versio de Reta Vortaro</h2>\n<dl>\n";
	if ($f = grepfile ('^revodict.*\.tgz$')) {
            print "<dt>DICT-Revo</dt>\n";
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")<br>\n";
            print "Tio ebligas rapidan uzadon de la vortaro simple tajpante\n";
            print "ser&#x0109;atan vorton a&#x016d; parton de &#x011d;i en iu lingvo, vi ricevas\n";
            print "la koncernajn artikolojn. \n";
            print "Por utiligi &#x011d;in vi devas instali Dict-Servon\n";
            print "<code>dictd</code> \n";
            print "(vd. <a href=\"http://dict.org\">dict.org</a>, \n";
            print "Tie haveblas anka&#x016d; Dict-klientoj. Vi povas uzi la \n";
            print "Dict-servon &#x0109;e Michiel (131.211.121.124) a&#x016d; &#x0109;e Radovan\n";
            print "(dict.dnp.fmph.uniba.sk) tra Interreto, tiuokaze vi\n";
            print "bezonas nur klienton.\n";
	}
        print "</dl>\n";
    }

    # voko-iloj
    if (grep /^voko_.*\.tgz$/, @files) {
	print "<h2>Voko-programaro</h2>\n<dl>\n";
	if ($f = grepfile ('^voko_.*\.tgz$')) {
            print "<dt>programoj por fari kaj administri vortaron</dt>\n";
	    print "<dd><a href=\"$f\">$f</a> (".filesize($f).")<br>\n";
            print "&#x011c;i enhavas &#x0109;iujn rimedojn por konstrui elektronikajn\n";
            print "vortarojn la&#x016d; VoKo-teknologio. &#x011c;i ne enhavas \n";
            print "ekzemplovortaron (vi povus preni kelkajn artikolojn el \n";
            print "ReVo) kaj la ilojn el la publika programaro\n";
            print "(t.e. xt, Perl, XML::Parser).\n</dd>\n"; 
        }
        print "</dl>\n";
    }

    if (grep /^reveto_.*\.tgz$/, @files) {
	print "<h2>Reveto - versio por po&#x015d;komputiloj</h2>\n<ul>\n";
	if ($f = grepfile ('^reveto_.*\.tgz$')) {
	    print "<li><a href=\"$f\">$f</a> (".filesize($f).")\n";
        }
        print "</ul>\n";
	print "Vi povas anka&#x016d; ricevi version en bedic-formato.\n";
	print "Skribu al la Revo-administranto, se vi bezonas.\n";
    }
 
    # listigu ceterajn
#    print "<h2>aliaj paka&#x0135;oj</h2>\n";
#    foreach $f (@files) {
#	if ($f =~ /\.tgz$/) {
#	    print "<a href=\"$f\">$f</a><br>\n";
#	}
#    }

}









