#!/usr/bin/perl -w

use Expect;

$debug = 0;

$Expect::Log_Stdout = $debug;
$Expect::Exp_Internal = ($debug > 1); 

# chu ricevi unu au plurajn solvojn
# de Prologo?
$nur_unu_solvo = 0;
#$verbose = 0;

$prompt = 'vorto:';
$neniu_rezulto = '?';

while (@ARGV) {
    if ($ARGV[0] eq '-p') {
	$prompt = '';
	shift @ARGV;
    } elsif ($ARGV[0] eq '-n') {
	$nur_unu_solvo = 1;
	shift @ARGV;
#    } elsif ($ARGV[0] eq '-v') {
#	$verbose = 1;
#	shift @ARGV;
    } else {
	die "stranga argumento \"$ARGV[0]\"\n";
    }
}

# lanæu Prologon kaj þargu la analizilon
$pl = Expect->spawn("pl");
print $pl "consult('analizilo.prolog').\n";
unless ($pl->expect(10,"true\.")) {
    die "Eraro dum lanæo de la anlizilo\n";
}

print STDERR $prompt;

while (<>) {
    chomp;
    last unless($_);
    @rez = vortanalizo($_);
    if (@rez) {
	print join(' ',@rez);
    } else {
	if ($neniu_rezulto) {
	    print $neniu_rezulto.$_;
	}
    }
    print "\n";
    print STDERR $prompt;
}

# finu Prologon
print $pl "halt.\n";



#############

sub vortanalizo {
    my $vorto = shift;
    my @rezultoj = ();

    unless ($vorto =~ /^[a-z\']+$/) {
	warn "Vorto \"$vorto\" enhavas nevalidan signon.\n";
	return;
    }

    $vorto =~ s/\'/''/g; # apostrofo
    $vorto =~ s/ux/w/g; # litero ux

    print $pl "vortanalizo_markita('$vorto',VVV).\n";
    while ($pl->expect(3,'###','Yes','No')) {

#	if ($verbose) {
#	    print '.';
#	    if ($n++ > 78) {
#		print "\n";
#		$n = 0;
#	    }
#	}

	if ($pl->exp_match() =~ /Yes|No/) {
	    last;
	} else {
	    # analizu la rezulton, ghi trovighas inter VVV kaj fino
	    if ($pl->exp_before() =~ /VVV\s*=\s*\'\[(.*),\s+([a-z]+)\]$/s) {
		my $v = $1;
		my $s = $2;

		$v =~ s/^\\\'//; # citiloj
		$v =~ s/\\\'$//;
		$v =~ s/\\{3}'/'/g; # envorta apostrofo
		$v =~ s/w/ux/g; # litero ux
		$r = "[$v|$s]";
		push @rezultoj, $r;
		print "{XXX>".$r."<XXX}\n" if ($debug);
	    } else {
		warn 'Redonajho ne enhavas atenditan rezulton: "'.
		    $pl->exp_before().'"';
	    }

	    # sekva solvo au fino
	    if ($nur_unu_solvo) {
		print $pl "\n";
	    } else {
		print $pl "n";
	    }
	}
    }

    return @rezultoj;
}


