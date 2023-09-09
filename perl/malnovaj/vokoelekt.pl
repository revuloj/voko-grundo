#!/usr/bin/perl

# elektas artikolon el vortaro

# parametroj:
# mrk - la marko de la artikolo

$eblaj_parametroj = 'mrk';

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

$VOKO = $ENV{'VOKO'};
$mrk = $params{'mrk'};
$vortaro = "$VOKO/red/sgm/vortaro.sgml";

print "Content-Type: text/html\n\n";

print "<html><body><form><textarea name=art rows= 20 cols=60>\n";

# Legu la vortaron artikolo por
# artikolo kaj serchu la markon

$/='</art';

open IN, $vortaro or die "Ne povis malfermi $vortaro.\n";
while (<IN>) {
    if (/<art\s+mrk=\"$mrk\"/) {
	print HTMLigu("$_");
	last;
    };
};
close IN;

print "</textarea></form></html>\n";

sub HTMLigu {
    $art = $_[0];

    $art =~ s/^>//;
    $art .= '>';

    $art =~ s/&([CcGgHhJjSs])circ;/^$1/sg;
    $art =~ s/&([Uu])breve;/^$1/sg;

    $art =~ s/<tld\s*>/~/sg;

    $art =~ s/&/&amp;/sg;
    $art =~ s/</&lt;/sg;
    $art =~ s/>/&gt;/sg;
#    $art =~ s/\n/<p>\n/sg;

    return $art;
};








