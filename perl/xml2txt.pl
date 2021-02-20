#!/usr/bin/perl

use File::Basename;

$verbose = 1;

$VOKO = $ENV{VOKO};
$REVO = $ENV{REVO};
$inpath = "$REVO/xml";
$outpath = "$REVO/txt";
$XSL = "$VOKO/xsl/revotxt_eo.xsl";

$xsltproc = '/usr/bin/xsltproc';
$lynx = '/usr/bin/lynx -nolist -dump -assume_local_charset=utf8 -display_charset=utf8 -stdin';

unless(@ARGV) {
    process_newer();
    # warn "Mankas xml dosiero(j) kiel argumento.\n";
    exit(1);
} else {
    foreach $infile (@ARGV) {
	xml2txt($infile);
    }
}

sub process_newer {
    opendir INDIR,$inpath
	or die "Ne povis trovi $inpath: $!\n";
    while ($file = readdir INDIR) {

	my $srcfile = "$inpath/$file";

	if (-f $srcfile) {
	    my $dstfile ="$outpath/$file"; 
	    $dstfile =~ s/\.xml$/\.txt/;

	    my $newer = (
		(not -e $dstfile) or
		compare_file_time($srcfile,$dstfile)
		);
	    # print "$srcfile\n" if ($newer);
	    if ($newer) {
		xml2txt($srcfile);
	    }
	}
    }
    closedir INDIR;
 }


sub compare_file_time {
    my ($srcfile,$dstfile) = @_;
    my $mtime_src = (stat($srcfile))[9];
    my $mtime_dst = (stat($dstfile))[9];
    return $mtime_dst < $mtime_src
}

sub xml2txt {
    my $infile = shift;

    my ($fname,$path,$suffix) = fileparse($infile,'.xml');
    my $outfile = "$outpath/$fname.txt";
    print STDERR "$infile --> $outfile...\n";
    print `$xsltproc $XSL $infile 2> /dev/null | $lynx > $outfile`;
}
