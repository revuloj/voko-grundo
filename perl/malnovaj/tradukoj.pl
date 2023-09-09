#!/usr/bin/perl -w

# esploras la kvanton de tradukoj kaj
# listigas la netradukitajn sencojn
#
# momente tio okazas ankorau en xml2inx.pl
# sed tie chi aldonighis ignorado de EVI/ARK-sencoj
# kaj memorado de tradukiteco de sencoj por povi
# krei listojn de mankantaj tradukoj
#############################################

use XML::Parser;
use lib "$ENV{'VOKO'}/bin";
use vokolib;

use bytes;
use integer;

$debug = 0;

$tmp_file = '/tmp/'.$$.'voko.inx';
$refdir = '../art/';

$prefix = "mx_";


$mankantaj_tradukoj = 20000; # se mankas nur tiom da tradukoj (procente)
                           # ili listighas por pli facila aldono
$maks_mankantaj = 777;     # nur tiom da mankantaj aperu en la listo
                           # por ne tro longigi ghin


while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = 1;
	shift @ARGV;
    } elsif ($ARGV[0] eq '-c') {
	shift @ARGV;
	$agord_dosiero = shift @ARGV;
    } else {
	$dos = shift @ARGV;
    };
};



# legu la agordo-dosieron
unless ($agord_dosiero) { $agord_dosiero = "cfg/vortaro.cfg" };
%config = read_cfg($agord_dosiero);
%lingvonomoj=read_xml_cfg($config{"lingvoj"},'lingvo','kodo');

$inxdir = $config{"vortaro_pado"}."/inx";

$dos = $config{"vortaro_pado"}."/xml"
  unless $dos;

die "Ne ekzistas dosierujo \"$dos\""
  unless -d $dos;

$lngcnt=0;
$uzo = '';
$ignoru_snc = 0;
$ignoru_drv = 0;

my $parser = new XML::Parser(ParseParamEnt => 1,
			     ErrorContext => 2,
                             NoLWP => 1,
			     Handlers => {
				 Start => \&start_handler,
				 End   => \&end_handler,
				 Char => \&char_handler}
			     );
opendir DIR,$dos;
$letter = '';
for $file (sort readdir(DIR)) {
    if ((-f "$dos/$file") and ("$dos/$file" =~ /\.xml$/)) {
	# montru progreson...
	if ($verbose and (substr($file,0,1) ne $letter)) {
	    $letter = substr($file,0,1);
	    warn "$letter...\n";
	};
	#warn "$dos/$file\n" if ($verbose);
	$radiko = '';
	eval { $parser->parsefile("$dos/$file") }; warn $@ if ($@);

	if ($debug) {

	    if ((scalar(keys %sencoj) - $oldsnccnt) < 
		($lingvoj{'de'}->[0] - $olddecnt)) {
		
		print "ERARO en 'de'-kalkulo en dosiero $file\n";
	    }

	    $oldsnccnt = scalar(keys %sencoj);
	    $olddecnt = $lingvoj{'de'}->[0];

	}
    }
};
closedir DIR;

# lingvoj enhavas nun por chiu lingvo la nombron
# de tradukitaj lingvoj kaj la numeron (biton) de la lingvo

# sencoj enhavas por chiu lingvo bitaron el kiu oni
# vidas, kiuj sencoj estas tradukitaj

# skribu statistikajn informojn
$trdfile = $config{'statistiko_tradukoj'};
open OUT, ">$trdfile" or die "Ne povas skribi al \"$trdfile\": $!\n";
print OUT "sumo=".scalar(keys %sencoj)."\n";
foreach $l (sort keys %lingvoj) {
    print OUT  "$l=".$lingvoj{$l}->[0]."\n";
}
close OUT;

# skribu tiujn informojn ankau XML-e
OUT, ">$trdfile.xml" or die "Ne povas skribi al \"$trdfile.xml\": $!\n";
print OUT "<?xml version=\"1.0\"?>\n<trdstat>\n";
print OUT "<sumo n=\"".scalar(keys %sencoj)."\"/>\n";
foreach $l (sort keys %lingvoj) {
    print OUT  "<t lng=\"$l\" n=\"".$lingvoj{$l}->[0]."\"/>\n";
}
print OUT "</trdstat>\n";
close OUT;

#exit if ($debug);

# kiuj lingvoj havas nur tiom da mankoj au malpli
my @mankantaj;
foreach $lng (keys %lingvoj) {
    my $t = $lingvoj{$lng}->[0];
    my $c = scalar(keys %sencoj);
    my $d = $c-$t; 

    if (($d <= $mankantaj_tradukoj) and ($d > 0)) {

	push @mankantaj_lng,($lng);

	my $target_file = "$inxdir/$prefix$lng.html";
	open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
	select OUT;
	index_header("netradukitaj vortoj por \"$lng\"");
	index_buttons('ktp');
	
#	add(\@mankantaj,$l);
	my $mankas = scalar(keys %sencoj) - $lingvoj{$lng}->[0];

	if ($mankas > $maks_mankantaj) {
	    print "<h1>$maks_mankantaj el $mankas netradukitaj sencoj";
	} else {
	    print "<h1>La $mankas netradukitaj sencoj";
	}
	print " de la lingvo ".$lingvonomoj{$lng}."</h1>\n";
	
	my $cnt=0;
	my $field = $lingvoj{$lng}->[1]/32+1;
	my $power = $lingvoj{$lng}->[1]%32;
	
#	print $field, " ", $power, "\n";

	while (($mrk,$trdj) = each %sencoj) {
	    unless ($trdj->[$field] and 
		    ($trdj->[$field] & (1 << $power))) {
		print ++$cnt,": <a href=\"",referenco($mrk),
		    "\" target=\"precipa\">".
		    "$trdj->[0]</a><br>\n";
		last if ($cnt>=$maks_mankantaj);
	    }
	}
	
	# malek
	index_footer();
	close OUT;
	select STDOUT;
	diff_mv($tmp_file,$target_file,$verbose);
    }
}

# liston de la lingvoj de mankanataj trd-oj...
my $target_file = "$inxdir/mankantaj.html";
open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
select OUT;
index_header("netradukitaj vortoj");
index_buttons('ktp');

print "<h1>listoj de mankantaj tradukoj</h1>\n";
foreach $lng (@mankantaj_lng) {
    print "<a href=\"$prefix$lng.html\">".$lingvonomoj{$lng}."</a><br>\n";
}

# malek
index_footer();
close OUT;
select STDOUT;
diff_mv($tmp_file,$target_file,$verbose);



#################### fino de la programo ####################


################## traktantoj de analiz-eventoj ################

sub start_handler {
    my ($xp,$el,@attrs) = @_;
    my $attr;
    my $mrk;

    if ($el eq 'drv') {
	if (not $ignoru_drv) {
	    $drvmrk = get_attr('mrk',@attrs);
	    warn "Mankas mrk en drv ($file)\n" unless ($drvmrk); 
	    @drvsnc = ();
	    $snccnt = 0;
	    $drvkap = '';
	}
    }
    elsif ($el eq 'snc') {
	if (not $ignoru_snc and not $ignoru_drv) {
	    $snccnt++; #$sncsum++;
	    $sncmrk = get_attr('mrk',@attrs) || "$drvmrk.$snccnt";
	    push @drvsnc, ($sncmrk);
	    $sencoj{$sncmrk} = ["$drvkap $snccnt"];
	} else {
	    # tamen altigi snccnt tie chi, por ke la 
	    # sencoj estu adreseblaj
	    $snccnt++;
	}
    }
    elsif (($el eq 'trd' or $el eq 'trdgrp') 
	   and $lng = get_attr('lng',@attrs)) {
	       
	       if (not ($ignoru_snc or $ignoru_drv)) {

		   #$lingvoj{$lng}=1;
		   if ($xp->in_element('snc') or $xp->in_element('dif')) {
		       add($sencoj{$sncmrk}, $lng);
		   } elsif ($xp->in_element('drv')) {
		       foreach $s (@drvsnc) {
			   add($sencoj{$s}, $lng);
		       }
		   }
	       } else {
		   print "ignoras tradukon ".get_attr('lng',@attrs)."\n" if ($debug); 
	       }
	   }
    elsif ($el eq 'tld' and $xp->in_element('kap')) {
	my $lit = get_attr('lit',@attrs);
	my $rad = $radiko;
	if ($lit) {
            use bytes;
	    my $len = length($lit); # necesa, char en UTF-8 supersignaj literoj
	                            # estas du-bitokaj
	    $rad =~ s/^.{$len}/$lit/;
            no bytes;
	}         
	$drvkap .= $rad;
    }
}

sub end_handler {
    my ($xp,$el) = @_;

    if ($el eq 'uzo') {
	if ($uzo eq 'EVI' or $uzo eq 'ARK') {
	    if ($xp->in_element('snc')) {
		$ignoru_snc=1;
		print "ignoru sencon...\n" if ($debug);
	    } elsif ($xp->in_element('drv')) {
		$ignoru_drv=1;
		print "ignoru derivajhon...\n" if ($debug);
	    }
	}
	$uzo = '';
    } elsif ($el eq 'snc') {
	print "ignoris sencon\n" if ($ignoru_snc and $debug);
	$ignoru_snc=0;
    } elsif ($el eq 'drv') {
	print "ignoris derivajhon\n" if ($ignoru_drv and $debug);
	$ignoru_drv=0;
    }
}

sub char_handler {
    my ($xp, $text) = @_;

    # transprenu la tekston ene de uzo
    if  (length($text)) {

	if ($xp->in_element('uzo')) {
	    $text = $xp->xml_escape($text);
	    $uzo .= $text;
	} elsif ($xp->in_element('kap')) {
	    $drvkap .= $text;
	} elsif ($xp->in_element('rad')) {
	    $radiko .= $text;
	}
    }
} 


# faras signovicojn el atributolisto
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

# prenas unuopan atributon el la atributolisto
sub get_attr {
    my($attr_name,@attr_list)=@_;

    while (@attr_list) {
        if (shift @attr_list eq $attr_name) { 
	    return shift @attr_list 
	    };
    };
    return ''; # atributo ne trovita;
};           

sub add {
    my ($list,$lng)=@_;

    # por chiu lingvo ekzistas du indikoj: [senconombro,lingvonumero]
    # la lingvonumero adresas biton en entjeraro, kiu rapidigas
    # la operaciojn de komparo kaj diferenco poste
    unless ($lingvoj{$lng}) {
	$lingvoj{$lng} = [0,$lngcnt];
	$lngcnt++;
    }

    # kalkulu la adreson el entjero kaj bito el la lingvonumero
    my $field = $lingvoj{$lng}->[1]/32+1;
    my $power = $lingvoj{$lng}->[1]%32;
    $list->[$field] = 0 unless ($list->[$field]);

    # se la lingvobito ne jam estas metita, metu ghin kaj altigu
    # la senconombron je unu (tio evitas, ke senco estas
    # plurfoje kalkulata, se aperas pluraj tradukoj, ekz en snc kaj drv)
    unless ($list->[$field] & (1 << $power)) {
	$list->[$field] = $list->[$field] | (1 << $power);
	($lingvoj{$lng}->[0])++;
    }
}


# kunmetas html-referencon el Revo-XML-marko
sub referenco {
    my $ref=$_[0];
    my $rez;

    if ($ref =~ /^([^\.]*)\.(.*)$/) {
        my $r1=$1; my $r2="$1.$2";
	$r2 =~ s/\.[1-9]$//; # referencu al derivajho,
	                     # char sencoj ne chiam havas markon
        $rez="$refdir".lc($r1).".html#".$r2;
    } else {
        $rez="$refdir".lc($ref).".html";
    };

    return $rez;
};








