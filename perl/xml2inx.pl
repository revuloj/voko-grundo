#!/usr/local/bin/perl -w
#
# voku ekz.
#   xml2inx.pl [-v] xml 
#
################# komenco de la programo ################

use XML::Parser;
use lib "$ENV{'VOKO'}/bin";
use vokolib;

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

die "Ne ekzistas dosierujo \"$dos\""
  unless -d $dos;

$radiko='';
$fako=0;
$lingvo='';
$fermu_ekz=0;

$outfile = $config{'inxtmp_dosiero'};
open OUT, ">$outfile" or die "Ne povas skribi al \"$outfile\": $!\n";
select OUT;

# indeks-komencon skribu
print '<?xml version="1.0" encoding="UTF-8"?>';
print "\n<vortaro>\n";


my $parser = new XML::Parser(ParseParamEnt => 1,
			     ErrorContext => 2,
                             NoLWP => 1,
			     Handlers => {
				 Start => \&start_handler,
				 End   => \&end_handler,
				 Char  => \&char_handler}
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
	eval { $parser->parsefile("$dos/$file") }; warn "$file: $@" if ($@);
    }
};
closedir DIR;

# indeks-finon skribu
print "\n</vortaro>\n";

select STDOUT;
close OUT;

# nombru la tradukitajn sencojn por chiu lingvo
#foreach $trdj (values %sencoj) {
#    foreach $l (@$trdj) {
#	$lingvoj{$l}++;
#    }
#}

#$trdfile = $config{'statistiko_tradukoj'};
#open OUT, ">$trdfile" or die "Ne povas skribi al \"$trdfile\": $!\n";
#print OUT "sumo=".scalar(keys %sencoj)."\n";
#while (($l,$n)=each(%lingvoj)) {
#    print OUT "$l=$n\n";
#}
#close OUT;

#################### fino de la programo ####################


################## traktantoj de analiz-eventoj ################
 

sub char_handler {
    my ($xp, $text) = @_;

    # transprenu la tekston ene de la
    # sekvaj elementoj, radikon ankau memoru
    # por anstatauigi la tildojn

    if  (length($text) and 
	 (
	  $xp->in_element('kap') or
	  $xp->in_element('rad') or
	  $xp->in_element('trd') or
	  $xp->in_element('ind') or
	  $xp->in_element('mll') or
	  $xp->in_element('mlg') or
	  ($xp->in_element('klr') and $ind) or
	  $xp->in_element('ref') or
	  ($xp->in_element('uzo') and $fako) or
          $xp->in_element('bld')
	  )
	 )
    {
	$text = $xp->xml_escape($text);
	print $text;
	$radiko .= $text if ($xp->in_element('rad'));
    }
} 

sub start_handler {
    my ($xp,$el,@attrs) = @_;
    my $attr;

    # normale transprenendaj elementoj
    if (
	$el eq 'art' or
	$el eq 'kap' or
	$el eq 'drv' or
	$el eq 'ref' or
	$el eq 'mll' or
	$el eq 'mlg' or
	($el eq 'ind' and not $xp->in_element('ekz')) 
	)
    {
	$attr = attr_str(@attrs);
	print "<$el$attr>";
    }

    # tildojn ene de transprenataj elementoj anstatauigu per la radiko
    elsif ( $el eq 'tld' and 
	    ($xp->in_element('kap') or
	     $xp->in_element('ref') or
	     $xp->in_element('bld') or
	     $xp->in_element('ind') or
	     $xp->in_element('mll')) 
	    ) 
    {
	my $lit = get_attr('lit',@attrs);
	my $rad = $radiko;
	if ($lit) {
            use bytes;
	    my $len = length($lit); # necesa, æar en UTF-8 supersignaj literoj
	                            # estas du-bitokaj
	    $rad =~ s/^.{$len}/$lit/;
            no bytes;
	}           
	print $rad;
    }

    # fak-uzon transprenu sed ne forlasu la atributon,
    # uzoj en ekzemploj estas traktataj malsupre
    elsif ( $el eq 'uzo' and not $xp->in_element('ekz') and
	    get_attr('tip',@attrs) eq 'fak')
    {
	$fako = 1;
	print "<uzo>";
    }

    # bildon transprenu sen atributoj
    elsif ( $el eq 'bld' )
    {
	print "<bld>";
    }

    # klarigojn transprenu nur, se tip="ind"
    elsif ( $el eq 'klr' and
	    (get_attr('tip',@attrs) eq 'ind' or
	     get_attr('tip',@attrs) eq 'amb'))
    {
	$ind = 1;
	print "<klr>";
    }

    # memoru la lingvon che tradukgrupoj, sed ne
    # transprenu la grupon mem, sed nur la enhavitajn tradukojn
    elsif ( $el eq 'trdgrp' )
    {
	$lingvo = get_attr('lng',@attrs); # memoru lingvon
    }

    # se necese enmetu la memoritan lingvon che traduko
    elsif ( $el eq 'trd' ) 
    {
	if ($xp->in_element('trdgrp')) {
	    $attr = " lng=\"$lingvo\""; # la lingvo venas de trdgrp 
	} else {
	    $attr = attr_str(@attrs);   # la lingvo estas en atributo
	}
	print "<$el$attr>";	
    }

    # transprenu ekzemplojn nur, se ili enhavas
    # elementon <ind> au <uzo>, tiukaze tradukoj kaj uzoj rilatas
    # al la teksto en <ind>...</ind>.
    # Char ne eblas rigardi antauen, ni skribas tiun
    # <ekz> nur en la momento, kiam ni renkontas <ind> au
    # <uzo>, tradukoj estas supozataj venantaj post <ind>!!
    elsif ($el eq 'ind' and $xp->in_element('ekz'))
    {
	unless ($fermu_ekz) {
	    # ekzemplo ankorau ne malfermita
	    print "<ekz>";
	    $fermu_ekz = 1; 
	}
	print "<ind>";
    }
    elsif ($el eq 'uzo' and $xp->in_element('ekz') and
	   get_attr('tip',@attrs) eq 'fak')
    {
	unless ($fermu_ekz) {
	    # ekzemplo ankorau ne malfermita
	    print "<ekz>";
	    $fermu_ekz = 1; 
	}
	print "<uzo>";
	$fako = 1;
    }

    # venas nova radiko, forigu la antauan
    $radiko = '' if ($el eq 'rad');

    # kalkulado de la tradukitaj sencoj
#    if ($el eq 'drv') {
#	$drvmrk = get_attr('mrk',@attrs);
#	warn "Mankas mrk en drv ($file)\n" unless ($drvmrk); 
#	@drvsnc = ();
#	$snccnt = 0;
#    }
#    elsif ($el eq 'snc')
#    {
#	$snccnt++; 
#	$sncmrk = "$drvmrk.$snccnt";
#	push @drvsnc, ($sncmrk);
#	$sencoj{$sncmrk} = [];
#    }
#    elsif (($el eq 'trd' or $el eq 'trdgrp') 
#	   and $lng = get_attr('lng',@attrs)) {
#	if ($xp->in_element('snc') or $xp->in_element('dif')) {
#	    add($sencoj{$sncmrk}, $lng);
#	} elsif ($xp->in_element('drv')) {
#	    foreach $s (@drvsnc) {
#		add($sencoj{$s}, $lng);
#	    }
#	}
#    }
}

sub end_handler {
    my ($xp, $el) = @_;

    # normale fermendaj elementoj
    if (
	$el eq 'art' or
	$el eq 'kap' or
	$el eq 'drv' or
	$el eq 'trd' or
	$el eq 'ref' or
	$el eq 'mll' or
	$el eq 'mlg' or
	$el eq 'ind' or
        $el eq 'bld'
	)
    {
	print "</$el>\n";
    } 

    # uzon fermu nur, se estas fak-uzo, aliaj ne estas transprenataj
    elsif ($el eq 'uzo' and $fako)   
    {
	print "</uzo>\n";
	$fako=0;
    }

    # klarigon fermu nur, se estas indeks-klarigo, aliaj ne estas transprenataj
    elsif ($el eq 'klr' and $ind)
    {
	print "</klr>\n";
	$ind=0;
    }

    # forigu lingvon che fermo de tradukgrupo
    elsif ($el eq 'trdgrp') 
    {
	$lingvo = '';
	
    }

    # se estas transprenita ekzemplo, fermu ghin
    elsif ($el eq 'ekz' and $fermu_ekz) {
	print "</ekz>\n";
	$fermu_ekz = 0;
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
    my ($list,$what)=@_;

    push @$list, ($what) unless (map {$_ eq $what? 1:()} @$list);
}




















