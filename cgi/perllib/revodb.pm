#!/usr/bin/perl

#
# revodb.pm
# 
# 2006-09-__ Wieland Pusch
# 2008-10-__ Wieland Pusch
#

use strict;

package revodb;

use DBI();

######################################################################
sub connect {
  # Connect to the database.
  my $dbh = DBI->connect("DBI:mysql:database=test;host=localhost",
                         "nobody", "",
                         {'RaiseError' => 1}) or die "DB ne funkcias";
  $dbh->do("set names utf8");
  return $dbh;
}
######################################################################

sub pop3login {
  return ("XXX", "XXX");
}
######################################################################

sub mysqldump {
  return "mysqldump --user=XXX --password=XXX --databases XXX";
}
######################################################################

sub mail_from {
  return 'XXX';
}

sub mail_to {
  return 'XXX';
}

1;
;
