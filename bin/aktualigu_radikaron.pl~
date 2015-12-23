#!/usr/bin/perl

$|=1;

$verbose = 1;
chdir $ENV{"REVO"};

if ($ARGV[0] eq '-r') {
  $command="ant -file $ENV{\"VOKO\"}/ant/redaktoservo.xml srv-resumo 2>&1";
  print "$command\nTIME:",`date`,"\n" if ($verbose);
  open VF, "$command|" or die "Ne povas dukti de ant: $!\n";
  while (<VF>) { print; };
  close VF;
  exit;
}   


if ($ARGV[0] eq '-a') {
    $target = "srv-servo-art";
  
} elsif ($ARGV[0] eq '-p') {
    $target = "srv-purigu";

} else {
    $target = "-Duser-mail-file-exists=true srv-servo"; # nepre rekreu la vortaron eĉ se tiufoje nealvenis poŝto  
    # $target = "srv-servo";
} 

$datetime = `date +%Y%m%d_%H%M%S`;
chomp($datetime);

#  chdir $ENV{"REVO"};
$log = $ENV{"HOME"}."/revolog/redsrv-$datetime.log";

$command="ant -file $ENV{\"VOKO\"}/ant/redaktoservo.xml $target 2>&1 | tee $log";
print "$command\nTIME:",`date`,"\n" if ($verbose);

open VF, "$command|" or die "Ne povas dukti de ant: $!\n";
while (<VF>) { print; }; 
close VF;

