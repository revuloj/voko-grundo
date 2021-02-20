#!/usr/bin/perl -w

# elprenas chiujn artikolojn de iu fako

$fako = 'ZOO';
$dos = '/home/revo/revo/sgm/rilatoj.xml~';

print '<?xml version="1.0" encoding="UTF-8"?><vortaro>';

open DOS, $dos;
$/='</art>';

while ($art=<DOS>) {
    if ($art =~ /$fako/) {
	print $art;
    }
}
close DOS;

print "</vortaro>\n";

