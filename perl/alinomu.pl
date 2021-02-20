#!/usr/bin/perl -w
#
# alinomas vortaro-artikolon kaj ankau shanghas chiujn mrk= en la artikolo
# kaj chiujn cel= en artikoloj referencantaj al ghi
# dume arkivas la novajn versiojn en CVS
#
# voku:
#   cd xml
#   alinomu.pl malnov nov
#
#

$verbose = 1;
$cvs  = '/usr/bin/cvs';

# analizu argumentojn

$old = shift @ARGV;
$new = shift @ARGV;

unless ($old or $new) {
    die "mankas argumento(j), voku: alinomu.pl <malnov> <nov>\n";
}

# forigu finajhojn, se aldonitaj
$old =~ s/\.xml//;
$new =~ s/\.xml//;

# testu, chu jam ekzistas artikolo $new
if (-e "$new.xml") {
    die "Jam ekzistas artikolo $new, ne eblas alinomi $old.\n";
}

# testu, chu la dosiernomoj ne enhavas ghenajn signojn au padon
unless ($old =~ /^[a-z\-0-9_]+$/i) {
    die "$old enhavas ne permesitan signon, povas esti "
	."nur literoj, ciferoj kaj streketoj.\n";
}
unless ($new =~ /^[a-z\-0-9_]+$/i) {
    die "$new enhavas ne permesitan signon, povas esti "
	."nur literoj, ciferoj kaj streketoj.\n";
}

# alinomu la dosieron
rename("$old.xml","$new.xml") or die
    "Ne povis alinomi $old.xml al $new.xml: $!\n";

# legu la doserion
open IN,"$new.xml" or die "Ne povis malfermi $new.xml: $!\n";
$text = join('',<IN>);
close IN;

# anstatauigu chiujn markojn
$text =~ s/\bmrk\s*=\s*"$old(\.[^"]+)?"/mrk="$new$1"/sg;

# skribu la shanghitan tekston
print ">>> $new.xml <<<\n" if ($verbose);
open OUT,">$new.xml" or die "Ne povis malfermi $new.xml: $!\n";
print OUT $text;
close OUT;

# komprenigu la alinomadon al cvs
$out = `$cvs delete $old.xml`;
print $out if ($verbose);
$out = `$cvs ci -m\"alinomis $old.xml al $new.xml\" $old.xml`;
print $out if ($verbose);
$out = `$cvs add $new.xml`; 
print $out if ($verbose);
$out = `$cvs ci -m\"alinomis $old.xml al $new.xml\" $new.xml`; 
print $out if ($verbose);

print "\ntraserchas chiujn artikolojn je referencoj al $old...\n";

# kiuj artikoloj referencas al la artikolo?
$artikoloj_donitaj = 0;
$file = shift @ARGV;
if ($file)
{
  $artikoloj_donitaj = 1;
}
else
{
  #opendir DIR, "." or die "Ne povis malfermi aktualan dosierujon: $!\n";
  #$file = readdir(DIR);
  @files = split("\n+", `grep -l $old *`);
  $file = shift @files;
}
while ($file) {
    if (-f $file and $file =~ /\.xml$/) {
	open IN,$file or die "Ne povis malfermi $file: $!\n";
	$text = join('',<IN>);
	close IN;
	
	# chu referencas?
	if ($text =~ s/\bcel\s*=\s*"$old(\.[^"]+"|")/cel="$new$1/sg) {
	    print ">>> $file <<<\n" if ($verbose);
	    
	    open OUT,">$file" or die "Ne povas skribi al $file: $!\n";
	    print OUT $text;
	    close OUT;
	    
	    # cvs
	    $out = `$cvs ci -m\"alinomis $old.xml al $new.xml\" $file`;
	    print $out if ($verbose);
	}
    }
  if ($artikoloj_donitaj)
  {
    $file = shift @ARGV;
  }
  else
  {
    #$file = readdir(DIR);
    $file = shift @files;
  }
}
#closedir DIR;






