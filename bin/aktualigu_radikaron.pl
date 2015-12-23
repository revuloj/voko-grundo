#!/usr/bin/perl

# aktualigo de loka XML-dosieraro per RSS anonclisto sxangxoj.rss
# traduko al simpla teksto kun nur e-a enhavo per xml2txt (lynx kaj xsltproc necesas)
# eltiro de la radikaro per Prologprogramo (rulata per revo_radikaro.sh)

$|=1;

$verbose = 1;

$datetime = `date +%Y%m%d_%H%M%S`;
chomp($datetime);

$VOKO = $ENV{VOKO};
$HOME = $ENV{HOME};
$PROLOG="$HOME/prolog/vortanalizilo";

chdir $HOME;
$log = "$HOME/log/rssrad-$datetime.log";

$command1="$VOKO/bin/aktualigu_per_rss.pl 2>&1 | tee $log";
print "$command1\nTIME:",`date`,"\n" if ($verbose);

open VF, "$command1|" or die "Ne povas dukti de perl: $!\n";
while (<VF>) { print; }; 
close VF;


$command2="$VOKO/bin/xml2txt.pl 2>&1 | tee -a $log";
print "$command2\nTIME:",`date`,"\n" if ($verbose);

open VF, "$command2|" or die "Ne povas dukti de perl: $!\n";
while (<VF>) { print; }; 
close VF;

chdir $PROLOG;
$command3="./revo_radikoj.sh 2>&1 | tee -a $log";
print "$command3\nTIME:",`date`,"\n" if ($verbose);

open VF, "$command3|" or die "Ne povas dukti de prolog: $!\n";
while (<VF>) { print; }; 
close VF;
