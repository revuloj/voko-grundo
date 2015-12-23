#!/usr/bin/perl

$rtffile=shift @ARGV;

# legu la tutan dosieron

open IN, $rtffile or die "Ne povis malfermi $rtffile.\n";

print "Legas $rtffile...\n";
$rtf = join ('',<IN>);
close IN;

print "Legas la kapliniojn...\n";

# elprenu la kapon, cxe la dosieroj generitaj de
# jade gxi finigxas je {\footer ... }
$rtf =~ s/(^\{\\rtf.*\{\\footer[^\}]*\})//s;
($kapo = $1) or die "La dosiero ne komencigxas je {\\rtf ... {\\footer...}\n";

$n=1;

# la sekcioj komencigxas je litero, kiu estas formatigita
# proksimume tiel: \pard\sl-240\fs48\f1 A\hyphpar0\par
# la nombroj povas varii, sed la fs48 donas la skribgrandecon
# kaj do estas relative fidinda - Tamen, sed la grandeco
# en vokortf.dsl estas sxangxita, sxangxu ankaux tie cxi!!!
#$sekcio = '\\pard(?:\\sb[\d\-]+)?\\sl[\d\-]+ \\fs48(?:\\f\d)? [A-Z]\\hyphpar0\\par';

$sekcio = '\\\\pard[\\\\sbl\d\- ]+\\\\fs48(?:\\\\f\d)? [A-Z]\\\\hyphpar0\\\\par';

#print "\$sekcio: ".$sekcio."\n";
#while ($rtf =~ /($sekcio)/g) { 
#    print "found: $1\n"; 
#};
#exit 0;


#while ($rtf =~ s/($sekcio.*?$sekcio.*?)($sekcio)/$2/sg) {


# Trovu kaj skribu la unuopajn sekciojn
while ($rtf =~ s/($sekcio.*?$sekcio.*?)($sekcio)/skribusekc($1.'}',$2).$2/se) {};

#Skribu la reston
skribusekc($rtf,'');

sub skribusekc {
    
#    my $unua = shift @_;
    my $tekst = shift @_;
    my $sekva = shift @_;
    
#    print "unua: $unua\n";
    print "sekva: $sekva\n";
    print "Skribas sekc$n.rtf...\n";

    # Skribu $kapon + $1 en dosieron
    $filename = "sekc".$n++.".rtf";
    open OUT, ">$filename";
    print OUT $kapo.$tekst."\n";
    close OUT;

    return '';
};
    













