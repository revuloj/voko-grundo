#!/usr/bin/perl

# forigas artikolojn el art, kie ne ekzistas 
# responda XML-dosiero en xml

$revo = '/home/revo/revo';
$art = "$revo/art";
$xml = "$revo/xml";
$verbose=1;

print "forigi...\n" if ($verbose);
opendir DIR, $art or die "Ne povis malfermi $art: $!\n";
while ($file = readdir DIR) {
    $xmlfile = $file;
    if ($xmlfile =~ s/\.html/\.xml/i) {
	unless (-e "$xml/$xmlfile") {
	    print "$art/$file\n";
	    unlink "$art/$file";
	}
    }
}
closedir DIR;
