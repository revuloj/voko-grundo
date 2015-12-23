#!/usr/bin/perl

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use Cwd;
use IO::Handle;

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
#use parseart;

my $exitcode;

print header,
      start_html('Sendu sxangxitajn arkivojn'),
      h1('fname='.param('fname'));

open LOG, ">>../../../files/log/upload.log" or die("ne eblas skribi log");	
autoflush LOG 1;

my $fname = param('fname');

my $homedir = "/var/www/web277";
#print h1("homedir = $homedir");

#my $cvsdir = "$homedir/files/CVS";

$ENV{'LD_LIBRARY_PATH'} = "$homedir/files/lib";
#print h1("LD_LIBRARY_PATH = ".$ENV{'LD_LIBRARY_PATH'});
$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";
#print h1("PATH = ".$ENV{'PATH'});

print LOG "upload started at ".localtime()." with fname=$fname\n";
unless ($fname =~ /^revocvs-\d\d\d\d\d\d\d\d_\d\d\d\d\d\d\.tgz$/) {
  print LOG "Nevalidaj parametroj\n\n";
  print h1("Nevalidaj parametroj"), end_html;
  exit 1;
}

my $ret;

chdir '../../../files/CVS' or die "chdir ne funkciis";

#print h1("cwd=".cwd());

$ret = `tar -xvzf ../../html/alveno/$fname 2>&1`;
$exitcode = $?;
#print h2("tar -xv -> $exitcode");
print LOG "tar -xv -> $exitcode\n$ret";
print pre($ret);
exit 1 if $exitcode;

#$ret =~ s,Attic/\n,,;	# forigu Attic/
#$ret =~ s:\.xml,v::g;	# forigu .xml.v
#print pre($ret);
#my @art = split /\n/, $ret;
##print h1("chdir $homedir/html/cgi-bin");
#chdir("$homedir/html/cgi-bin") or die "chdir to cgi-bin failed";
## Connect to the database.
#my $dbh = parseart::connect();
#foreach (@art) {
##  print pre("parse art: $_ cwd=".cwd());
#  parseart::parse($dbh, $_, $cvsdir, 0);
#}
##print pre("art 0 .. $#art\n");
#$dbh->disconnect() or die "DB disconnect ne funkcias";

if (0) {
$ret = `rm ../../html/alveno/$fname 2>&1`;
$exitcode = $?;
#print h2("rm -> $exitcode");
print LOG "rm -> $exitcode\n";
print LOG "$ret\n" if $exitcode;
#print pre($ret);
if ($exitcode) {
  print LOG "$ret\n";
  exit 1;
}
}

#print LOG "normala fino de upload.pl\n\n";
print end_html;

close LOG;

1;