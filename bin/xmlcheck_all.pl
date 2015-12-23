#!/usr/bin/perl -w
#

#$debug=0;

$dir = shift @ARGV;
$xmlcheck = 'rxp -V';

opendir DIR,$dir;
for $file (readdir(DIR)) {

    $infile = "$dir/$file";

    if ((-f $infile) and ($infile =~ /\.xml$/)) {

	print "$infile:\n";   
	`$xmlcheck $infile`;
	
    }
}

  

