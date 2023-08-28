#!/usr/bin/perl

# konvertas japanan vortaron PEJV (https://www.vastalto.com/pejv/)
# al CSV-listo por (precipe unufoja) aŭtomata aldono en Revo

use strict;
use warnings;

use Text::CSV qw( csv );
#use Data::Dumper;

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

my $debug = 0;

# por konverti al Hiragana...
# my $kakasi = '/usr/bin/kakasi -iutf8 -outf8 -KH -JH';
my $mecab = '/usr/bin/mecab';

# ekstrakto el japana vortaro JMDic
# vd. http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
my $jmdic = 'JMdict.csv';

# eniga listo el PEJV
my $vortlisto = "pejv/pejvo.txt";

# enlegu la japanan vortaron
my $jvortoj = read_jmdic();

open(F, "<:encoding(cp932)", $vortlisto) or die $!;
# my $idx = 0;

print "eo;jp\n";


while(<F>) {
	s/\r?\n//;
	my ($eo, $ja) = split(/:/, $_, 2);
	$eo = unicode_word($eo);

	# forigu referencojn kaj fakindikojn el la japana parto
	$ja =~ s/,?(?:>>?|=>?|><)[A-Za-z0-9\.\- \^]+(?:（.*?）)?([,;]|$)/$1/g;
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

sub mecab {
	my $v = shift;

	my @lines = split /\n/, `echo '$v' |$mecab`;

	my $k = '';
	my $h = '';
	# ni ricevas plurajn liniojn kaj bezonos la unuan (partoj de la origina vorto) kaj sesan (hiragano aŭ *) kolumnon
	for my $line (@lines) {
		utf8::decode($line);
	
		last if ($line eq 'EOS');
		print "$line\n" if ($debug);

		my @ana = split(/\s+/,$line,2); 	
		my @fields = split(/,/,$ana[1]);

		print join('||',@ana) if ($debug); 

		$k .= $ana[0];
		if ($fields[5] ne '*') {
			$h .= $fields[5]
		} else {
			$h .= $ana[0];
		}
	}

	if ($k ne $v) {
		warn("Nekompleta analizo per mecab ($v): $k [$h]\n");
	}

	return $h;
}

sub furagana {
	my $ja = shift;
	my @vj = split(/[,;]/,$ja);
	my @fj = ();

	# plibonigu: estus pli efeki sendi la tutan dosieron tra kakasi kaj
	# poste kunigi la originajn vortojn kun la furaganoj
	for my $v ( unik(@vj) ) {
		# my $f = `echo '$v' | $kakasi`;

		# se la vortaro enhavas la serĉatan vorton ni ricevas la
		# prononcon / hiragano de ĝi
		my $f = $jvortoj->{$v};
		# se ne, ni uzas mecab por analizo, kiu plej ofte redonas bonan proponon
		unless($f) { $f = mecab($v) };
		#utf8::decode($f);
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

# enlegu JMDic kiel CSV
# Ni ekstraktis tion el XML per XSLT-regulo:
# <xsl:template match="//entry">
# <xsl:if test="k_ele/keb and r_ele/reb">
# <xsl:for-each select="k_ele">
# <xsl:value-of select="keb"/><xsl:text>;</xsl:text>
# <xsl:value-of select="../r_ele/reb[1]"/><xsl:text>
# </xsl:text>
# </xsl:for-each>
# </xsl:if>
# </xsl:template>


sub read_jmdic {
    my $parser = Text::CSV->new ({ auto_diag => 1, sep_char => ";" });
    
    open my $CSV,"<:encoding(utf8)",$jmdic or die "Ne povis malfermi CSV '$jmdic': $!\n";

    my $recs = $parser->getline_all($CSV);
    close $CSV;

    my $vortoj;
    for my $r (@$recs) {
        $vortoj->{$r->[0]} = $r->[1];
    }

    return $vortoj;
}