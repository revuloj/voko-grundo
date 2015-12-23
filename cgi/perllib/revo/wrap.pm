use strict;

package revo::wrap;

sub wrap {
  my $t = shift;
  my $r = "";
  my $nl = "";
  my $remainder = "";

  my $separator = "\n";
  my $separator2 = undef;
  my $columns = 72;  # <= screen width

  my $ll = $columns;
  my $lead = "";

  pos($t) = 0;
  while ($t !~ /\G(?:\s)*\Z/gc) {
    if ($remainder ne " " and $t =~ /\G(\s*)/xmgc) {
      $lead = $1;
      $ll = $columns - length($1);
#      print "lead=$lead.\n";
    }

    if ($t =~ /\G([^\n]{0,$ll})(\s|\n+|\z)/xmgc) {
      $r .= $nl . $lead . $1;
      $remainder = $2;
#      print "1lead=$lead. $1\nremainder=$2.\n";
    } elsif ($t =~ /\G([^\n]*?)(\s|\n+|\z)/xmgc) {
      $r .= $nl . $lead . $1;
      $remainder = $2;
#      print "2lead=$lead. $1\nremainder=$2.\n";
    } else {
      die "This shouldn't happen";
    }
    $nl = $separator;
  }
  $r .= $remainder . "\n";

  return $r;
}

1;
