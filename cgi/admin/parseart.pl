#!/usr/bin/perl

#
# parseart.pl
# 
# 2006-09-__ Wieland Pusch
#

use strict;

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use DBI();

print header(-charset=>'utf-8'),
      start_html(-title => 'Enhavo de '.param('art').".xml");

if (param('arts')) {
  param('art', join('#', split /\r*\n/,param('arts')));
} elsif (!param('art')) {
  print h1('arts = '.param('arts'));
  print h2('arts = '.join('#', split /\r*\n/,param('arts')));
  print start_form();
  print textarea(-name=>'arts',
                 -rows=>10,
                 -columns=>50),
        hidden(-name=>'trunc',
               -default=>param('trunc')),
        hidden(-name=>'verbose',
               -default=>param('verbose'));
  print br, submit(-name=>'button');
  print endform;
  print end_html();
  exit 1;
}

print h1('Enhavo de '.param('art').".xml");

my $homedir = "/var/www/web277";
print h1("homedir = $homedir");

my $start_time = time();

my $xmldir = "$homedir/html/revo/xml";

$ENV{'LD_LIBRARY_PATH'} = "$homedir/files/lib";
#print h1("LD_LIBRARY_PATH = ".$ENV{'LD_LIBRARY_PATH'});
$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";
#print h1("PATH = ".$ENV{'PATH'});

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use parseart;

#chdir("..");
chdir($xmldir);

# Connect to the database.
my $dbh = parseart::connect();
$dbh->do("set names utf8");

if (param('trunc')) {
  parseart::trunc($dbh);
}

my @arts;
if (param('arts')) {
  @arts = sort split /\r*\n/,param('arts');
} else {
  push @arts, param('art');
}

my $verbose = param('verbose');
#$verbose = 0 unless $verbose;

my $art_count;
my $last_art;
foreach my $art (@arts) {
  if ($art && $art ne $last_art) {
    $art_count += parseart::parse($dbh, $art, $xmldir, 2);
    $last_art = $art;
  }
}

$dbh->disconnect() or die "DB disconnect ne funkcias";
  
print h2("Tuta dauxro: ".(time() - $start_time)." sekundoj por $art_count artikoloj.");
print h1("Fino.");

print end_html();

1;
