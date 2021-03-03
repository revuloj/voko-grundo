#!/usr/bin/perl

my $DB = shift @ARGV;
my $dir = shift @ARGV;

unless ($dir) {
    die "Vi ne donis XML-dosierujon...\n";
}

$debug=0;
#binmode STDOUT, "utf8" if $debug;
$verbose = 1;


$VOKO = $ENV{"VOKO"};
$xslbin = "$VOKO/bin/xslt.sh";
$xsltproc = "/usr/bin/xsltproc";
$xsl = "$VOKO/xsl/revotxt.xsl";
$lynx = "/usr/bin/lynx -nolist -dump -assume_local_charset=utf8 -display_charset=utf8 -width=120 -stdin";
###$tmp = $ENV{"HOME"}."/private/revotmp";
$hexdump = "/usr/bin/hexdump -ve '1/1 \"%02X\"'";

# malfermu la daumbazon
open SQL, "|/usr/bin/sqlite3 $DB"
    or die "Ne povas lanĉi sqlite3 kun $DB: $!\n";

# trakuru la XML-doseierujon
opendir DIR, $dir;
while ($file = readdir DIR) {
        
    if (-f "$dir/$file" and $file =~ /(.+)\.xml$/) {

	my $mrk = $1; 
	if ($verbose) {
		print ($n++);
		print " $file ...\n";
	};	
	$file =~ s/\.xml$//;

	# transformu la xml dosieron al teksto helpe de lynx
	open HEX, "$xsltproc $xsl $dir/$file.xml | $lynx | $hexdump |"
	    or die "Ne povas transformi al 16uma teksto, verŝajne problemo kun xsltproc, lynx aŭ hexdump: $!\n";

	# transsendu al datumbazo
	print SQL "INSERT into artikolo(mrk,txt) VALUES('$mrk',X'"; 
	while (<HEX>) { print SQL };
	print SQL "');\n";

	close HEX;
    }
}

closedir DIR;

# fermu datumbazon
print SQL ".quit\n";
close SQL;




