#!/usr/bin/perl -w
#
# voku ekz.
#   belarangho.pl < fonta_xml-dosiero > cela_xml-dosiero
# au:
#   belarangho.pl fonta_xml-dosiero
#
################# komenco de la programo ################

$maxlen = 80; # maksimuma longeco de linio

#### legu la dosieron

$buffer = join('',<>);

#### chiuj traktendajn strukturilojn metu sur propran linion

$traktendaj = 'art|subart|drv|subdrv|snc|subsnc|dif|ekz|refgrp|trdgrp|rim';

$buffer =~ s¦\r¦¦sg;
$buffer =~ s¦\s*<($traktendaj)\b([^>]*)>\s*¦\r<$1$2>\r¦sg;
$buffer =~ s¦\s*</($traktendaj)>\s*¦\r</$1>\r¦sg;
# forigu troajn linifinojn
$buffer =~ s¦\r+¦\n¦sg;


#### faru diversajn anstatauigojn kaj enmetojn

#$buffer =~ s¦(\s)k(\s)¦$1kaj$2¦sg;
$buffer =~ s¦<snc\s+num="[0-9]+"¦<snc¦sg;
$buffer =~ s¦</drv>\s*\n*<drv¦</drv>\n\n<drv¦sg;

#### enmetu deshovojn linikomence

$traktendaj = 'subart|drv|subdrv|snc|subsnc|dif|ekz|refgrp|trdgrp|bld|rim';
@linioj = split("\n",$buffer);
$level=0;
$trd=0;

foreach (@linioj) {
    s/^\s*//;
    s/\s*$//;

    if (m:<trd(\s|>):) {
        $trd++;
    }

    # k->kaj chie, krom tradukoj
    if (not $trd) {
        s/(\s)k(\s)/$1kaj$2/sg;
    }

    if (m:</trd>:) {
        $trd--;
    }


    if (m¦</($traktendaj)>$¦) {
	$level--;
    }

    $line = " " x (2*$level) . $_;

    if (m¦^<($traktendaj)\b¦) {
	$level++;
    }

    if (length($line) >= $maxlen) {
	$line = wrap($line);
    }

    print "$line\n";
}

print "\n";

#### helpfunkcioj

sub wrap {
    my $line = shift;

    $line =~ /^\s*/;
    my $level = length($&)/2;
    my $newline = " " x (2*$level);
    my $len = 2*$level;

    while ($line) {

	$line =~ s/^\s*([^\s]*)//;
	my $word = $1;
	
	unless ($word) { last; }

	# alpendigu vorton al linio
	if (($len + length($word) +1 < $maxlen) # la vorto havas lokon en la linio
	    or ($len == 2*$level)) { # estas la unua vorto en la linio (probl. de longaj vortoj)
	    $newline .= "$word ";
	    $len += length($word)+1;
	# komencu novan linion
	} else {
	    $newline =~ s/\s*$//;
	    $newline .= "\n" . " " x (2*$level) . $word . " ";
	    $len = 2*$level + length($word) +1;
	}

    }

    $newline =~ s/\s+$//;

    return $newline;
}

















