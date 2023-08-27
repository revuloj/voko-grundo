#!/usr/bin/perl

# konvertas japanan vortaron PEJV (https://www.vastalto.com/pejv/)
# al CSV-listo por (precipe unufoja) aŭtomata aldono en Revo

use strict;
use warnings;

#use Data::Dumper;

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

# por konverti al Hiragana...
my $kakasi = '/usr/bin/kakasi -iutf8 -outf8 -KH -JH';
my $vortlisto = "pejv/pejvo.txt";


open(F, "<:encoding(cp932)", $vortlisto) or die $!;
# my $idx = 0;

print "eo;jp\n";


while(<F>) {
	s/\r?\n//;
	my ($eo, $ja) = split(/:/, $_, 2);
	$eo = unicode_word($eo);

	# forigu referencojn kaj fakindikojn el la japana parto
	$ja =~ s/,?(?:>>|=>?|><)[A-Za-z \^]+(?:（.*?）)?([,;]|$)/$1/g;
	$ja =~ s/【.*?】//g;

	# forigu oficialecon
	$ja =~ s/\{[ＯＢ]\}//;

	# forigu gramatikajn kaj aliajn komentojn
	$ja =~ s/［.*?］//g;
	$ja =~ s/（.*?）//g;
	$ja =~ s/《.*?》//g;
	
	# forigu restintajn komojn, specojn en la fino
	$ja =~ s/[,\s]+$//;

	# aldonu hiragana/furagana al ĉiu vorto
	my $jaf = furagana($ja);

	print "\"$eo\";\"$jaf\"\n";
	
}

sub unik {
	my %seen = ();
	my @uniq = grep { ! $seen{$_} ++ } @_;
	return @uniq;
}

sub furagana {
	my $ja = shift;
	my @vj = split(/[,;]/,$ja);
	my @fj = ();

	# plibonigu: estus pli efeki sendi la tutan dosieron tra kakasi kaj
	# poste kunigi la originajn vortojn kun la furaganoj
	for my $v ( unik(@vj) ) {
		my $f = `echo '$v' | $kakasi`;
		utf8::decode($f);
		$f =~ s/^\s+//;
		$f =~ s/\s+$//;

		if ($f ne $v) {
			push @fj, ("$v \[$f\]");
		} else {
			push @fj, ("$v");
		}
	}

	return join(',',@fj);
}

sub unicode_word {
	my $str = shift;
	
	$str =~ s/C\^/Ĉ/g;
	$str =~ s/G\^/Ĝ/g;
	$str =~ s/H\^/Ĥ/g;
	$str =~ s/J\^/Ĵ/g;
	$str =~ s/S\^/Ŝ/g;
	$str =~ s/U\^/Ŭ/g;
	$str =~ s/c\^/ĉ/g;
	$str =~ s/g\^/ĝ/g;
	$str =~ s/h\^/ĥ/g;
	$str =~ s/j\^/ĵ/g;
	$str =~ s/s\^/ŝ/g;
	$str =~ s/u\^/ŭ­/g;

	$str =~ s/\///g;
	
	$str;
}

