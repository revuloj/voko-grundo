#!/usr/bin/perl -w

# faras prilaboron en HTML-artikolon, kiu ne eblis
# per XSL (xml2html)


# analizu la argumentojn
while (@ARGV) {
    if ($ARGV[0] eq '-c') {
	shift @ARGV;
	$agord_dosiero = shift @ARGV; 
    } else {
	$file = shift @ARGV; 
    }
};

#$file = shift @ARGV;

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


$tz_prefix = $config{"vortaro_pado"}."/tez/tz_";
$tz_ref = "../tez/tz_";

# enlegu la dosieron
open IN, $file or die "Ne povis malfermi \"$file\": $!\n";
$buf = join('',<IN>);
close IN;

# enmetu referencojn al tezauro

$buf =~ s/<!--\[\[.*?\]\]-->/tezauro($&)/seg;

# forigu nenecesajn blanksignojn
$buf =~ s/ *\n +/\n/sg;
$buf =~ s/ +/ /sg;

$buf =~ s:\(\n+:\(:sg;
$buf =~ s:(<a [^>]+>)\n+:$1:sg;
$buf =~ s:\n+</a>:</a>:sg;
$buf =~ s:\n+\):\):sg;

# tiparproblemo de IE kun &dash;
$buf =~ s/&#8213;/<span>&#8213;<\/span>/sg; 

open OUT, ">$file" or die "Ne povas skribi al \"$file\": $!\n";
print OUT $buf;
close OUT;

#############

sub tezauro {
    my $text = shift;

    $text =~ s/^<!--\[\[\s*//;
    $text =~ s/\s*\]\]-->$//;

    unless ($text =~ /ref\s*=\s*"(.*?)"/) {
	warn "erara tezauro-referenco, ne eblis ekstrakti ref=\"...\"\n";
    }

    my $ref = $1;
    $ref =~ s/\./_/g;

    if (-f "$tz_prefix$ref.html") {
	return "<a href=\"$tz_ref$ref.html\" target=\"indekso\">".
	    "<img src=\"../smb/tezauro.png\" alt=\"TEZ\" ".
            "title=\"al la tezaŭro\" border=\"0\"></a>";
    } else {
	return '';
    }
}




















