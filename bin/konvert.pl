#!/usr/bin/perl
############################################
# konvertas tekstformaton de piv al html 
# de la komenco ghis la fino uzante i.a
# piv2vkl.pl vkl2sgml.pl jade.pl
############################################

# voku konvert.pl a-h
# au konvert.pl -a./artikoloj *.txt
# au simile

$first=1;
$VOKO=$ENV{'VOKO'};
$ARTIK="$VOKO/art";

if ($ARGV[0]=~/^\-a/) {
    $ARTIK=shift @ARGV;
    $ARTIK =~ s /^\-a//;
}

foreach $file (@ARGV) {
  
    $file =~ s/\.txt$//;
    $filename = $file;
    $filename =~ s/.*\///;
    $htmlfile = "$ARTIK/$filename~.html";
    $logfile = "$VOKO/log/$filename.log";

    if ($first) {
	print ">piv2vkl: $file.txt -> $ARTIK/*.vkl (eraroj en $logfile)\n";
	`piv2vkl.pl -o -v -f -d$ARTIK $file.txt 2>$logfile`;
	$first=0;
    } else {
	print "piv2vkl: $file.txt -> $ARTIK/*.vkl (eraroj en $logfile)\n";
	`piv2vkl.pl -o -v -d$ARTIK $file.txt 2>$logfile`;
    };

#    print "piv2html: $file.txt -> $htmlfile\n";
#    `piv2html.pl $file.txt > $htmlfile`; 

};
 
print "vkl2sgml: $VOKO/art/*.vkl -> $ARTIK/vortaro.sgml\n";
`mv $ARTIK/xx.vkl $ARTIK/xx.vk~`; #konservu la fushitajn artikolojn
`vkl2sgml.pl -s $ARTIK/*.vkl`;

print "forigas $ARTIK/*.vkl...\n";
`rm $ARTIK/*.vkl`;
print "...preta!\n";




