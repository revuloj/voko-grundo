#!/usr/bin/perl

# (c) 2021 Wolfram Diestel
# laŭ GPL 2.0
#
# preparas la tradukojn por aldono (CSV: eo;<lng>)
#  perl prep_trd_uk.pl tmp/xxx.csv

use Text::CSV qw( csv );

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 0;

$lingvo = 'uk';
$csvfile = shift @ARGV;

my $tradukoj = read_csv($csvfile);
my $n=0;

my $csv = Text::CSV->new ({ binary => 1, auto_diag => 1, sep_char => ";"}); 
#open $OUT, ">:encoding(utf8)", STDOUT or die "$!";

for my $tr (@$tradukoj) {
    my $t = $tr->[0];
    print "$t\n" if ($debug);

    # kapvorto
    $t =~ s/^([^\s]+)\s//;
    my $kap = $1; 
    
    my $tld = '';
    if (index($kap,'||')>0) {
        $tld = substr($kap,0,index($kap,'||'));
    } elsif (index($kap,'/')>0) {
        $tld = substr($kap,0,index($kap,'/'));
    } else {
        $tld = $kap;
    }

    $tld =~ s/[*\/|]//g;    
    $kap = kap_purigo($kap); #~ s/[*\/|]//g;    

    print  "KAP: $kap; TLD: $tld\n" if ($debug);

    my @drvj;
    while ($t =~ /([^\s]*~[^\s]+)/) {
        my $offs = $-[0];

        my $d = trim(substr($t,0,$offs));
        my $mlg = desc_mlg($d);
        push @drvj, [$kap." ".$d,$kap,$mlg];
        print "DRV: |$kap| $d\n" if ($debug);

        $kap = $1;
        $t = substr($t,$offs+length($kap));
        $kap =~ s/~/$tld/g;
        $kap = kap_purigo($kap); #s/[*\/|]//g;
    }

    # restintan ankaŭ aldonu
    $t = trim($t);
    my $mlg = desc_mlg($t);
    push @drvj, [$kap." ".$t,$kap,$mlg];

    print "DRV: |$kap| $t\n" if ($debug);

    $csv->say(STDOUT, $_) for @drvj;

    # provizore nur unuajn dek
    ##$n++; exit if ($n>100);
}

############ helpaj funkcioj.... #############

sub desc_mlg {
    my $d = shift;
    $d =~ s/^v[nt]\s*//g;

    $d =~ s/^(мін|рел|арх|геогр|геол|жив|вульґ|наук|політ|фарм|хiм|фарм|спорт|іст|іхт|муз|друк|тех|мед|бот|мор|бібл|лінґв|хім|театр|ел|текст|фізіол|анат|зоол|астр|кул|міф|мист|орн|фісоф|філос|біол|хем|прям|бакт|фіз|мор|зал|літ|палеонт|інформ|мат|екол|етн|церк|військ|ав|ек|фін|розм|перен|виг)\.\s*//g;

    $d =~ s/\s*\[[^\]]+\]$//; #
    $d =~ s/\s*\((імена|ім’я)\)$//; #
    $d =~ s/\s*\((=|син\.)[^\)]+\)$//; #
 
    $d =~ s/\s+/ /g; # ĉu tio ankaŭ konvertas \xa0 al \x0a ?
    return $d;
}

sub kap_purigo {
    my $kap = shift;
    $kap =~ s/[*\/|]//g;
    $kap =~ s/^\(([a-zA-ZĥĉĝŝŭĵĤĈĜĴŜŬ])\)[a-zA-ZĥĉĝŝŭĵĤĈĜĴŜŬ]/$1/;
    return $kap;
}

sub trim {
    my $t = shift;
    $t =~ s/^\s+//;
    $t =~ s/[\.;]?\s*$//;
    return $t;
}

sub read_csv {
	my ($csvfile) = @_;
    my $parser = Text::CSV->new ({ auto_diag => 1, sep_char => ";" });
    
    open $CSV,"<:encoding(utf8)",$csvfile or die "Ne povis malfermi CSV '$csvfile': $!\n";

    my $recs = $parser->getline_all($CSV);
    close $CSV;

    return $recs;
}
