#!/usr/bin/perl

# enlegas fluon de derivaoj kaj konstruas
# bedic-vortaron el ghi
#
# uzo:
#   bedic.pl > bedic-dosiero
#

# farenda:
#
#   kreu lingvoindeksojn nur de certaj lingvoj
#   ASCII-konverto por lingvoj ru, bg, ktp.

$xslt = shift @ARGV;
$lng = shift @ARGV;
$dir = shift @ARGV;

$verbose = 1;

die "Donu lingvon kiel dua argumento" unless ($lng=~/^[a-z]{2,3}$/);

######### 1a pasho: chiujn XML-artikolojn skribu en grandan tekstdosieron
#########           kaj skribu la pozicion kaj longon de la artikoloj en
#########           indeksdosieron

$pos = 0;
$maxlen = 0;

my $n = 1;

opendir DIR, $dir; 
print '<?xml version="1.0" encoding="utf-8"?>'."\n";
print '<trdoj>'."\n";
while ($file = readdir DIR) {

    if (-f "$dir/$file" and $file =~ /\.xml$/) {
	    
	    print STDERR ($n++)." $file\n" if ($verbose);
	    $file =~ s/\.xml$//;
	    $text = `xsltproc --stringparam lng $lng $xslt $dir/$file.xml`;
	    $text =~ s/^<\?xml.*?\?>\n//;
	    print $text
	}
    }
print '</trdoj>'."\n";
closedir DIR;









