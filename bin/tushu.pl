#!/usr/bin/perl -w

# tushu dosierojn el listo por resendigi ilin al la servilo

while ($file = <>) {
  chomp($file);
  if (-s $file and $file !~ /^\.*$/) {
	  print "$file\n";
	  `touch $file`;
  }
}


