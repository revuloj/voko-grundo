#!/usr/bin/perl

# enlegas fluon de derivaĵoj kaj konstruas
# bedic-vortaron el ghi
#
# uzo:
#   bedic.pl > bedic-dosiero
#

# farenda:
#
#   kreu lingvoindeksojn nur de certaj lingvoj
#   ASCII-konverto por lingvoj ru, bg, ktp.


$verbose = 1;
$bedic = shift @ARGV;

######### 1a pasho: chiujn XML-artikolojn skribu en grandan tekstdosieron
#########           kaj skribu la pozicion kaj longon de la artikoloj en
#########           indeksdosieron

$pos = 0;
$maxlen = 0;
$maxkaplen = 0;

$/='#INFO#';

$info = <>;
$info =~ s/\#INFO\#//;

$/='#FINO#';

open OUT,">$bedic.0";

while ($text=<>) {
	
    # FIXME: forigu troajn spacsignojn ankorau
    $text =~ s/\s+/ /sg;
    $text =~ s/\s+\{/\{/sg;
    $text =~ s/\}\s+/\}/sg;
    $text =~ s/^\s*//s;
    
    $kaplen = index($text,'#KAPO');
    $text =~ s/\#KAPO\#/\n/sg;
    $text =~ s/\#FINO\#\s*/\0/sg;

    print OUT $text;
    $len = length($text); #(-s "$bedic") - $pos;
	 
    $maxkaplen = $kaplen if ($kaplen>$maxkaplen);
    $maxlen = $len if ($len>$maxlen);
    print "[$pos\t$len]\n" if ($verbose);

    $pos += $len;
}

open OUT,">$bedic.1";
select OUT;
print "dict-size=".(-s "$bedic")."\n";
print "id=$info\n";
print "max-entry-length=$maxlen\n";
print "max-word-length=$maxkaplen\n"; #FIXME
print "search-ignore-chars=-.\n";
print "\0";
close OUT;
`cat $bedic.1 $bedic.0 > $bedic.2`;
`xerox $bedic.2 $bedic.dic`;
`dictzip $bedic.dic`;
unlink "$bedic.0";
unlink "$bedic.1";
unlink "$bedic.2";







