#!/usr/bin/perl

use strict;

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);

sub timestamp {
  my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime();
  $year += 1900;
  $mon = sprintf("%02d", $mon + 1);
  $mday = sprintf("%02d", $mday);
  $hour = sprintf("%02d", $hour);
  $min = sprintf("%02d", $min);
  $sec = sprintf("%02d", $sec);
  return "$mday.$mon.$year $hour:$min:$sec";
}


print header,
      start_html('Sendu sxangxitajn arkivojn'),
      h1('timestamp='.timestamp),
      h1('date='.`date`);

