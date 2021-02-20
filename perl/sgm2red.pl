#!/usr/bin/perl
############################################
# disigas unu sgml-dosieron al multaj sgml-dosieroj
# (por chiu artikolo unu).
############################################

# voku ekz. sgm2red.pl -a./pev/red ./pev/vortaro.sgm

# konstantoj

# la argumentojn analizu

$VOKO=$ENV{'VOKO'};
$ARTIK="$VOKO/red";

if ($ARGV[0]=~/^\-a/) {
    $ARTIK=shift @ARGV;
    $ARTIK =~ s /^\-a//;
}

if (@ARGV) {
    $vortaro=shift @ARGV;
} else {
    $vortaro="$ARTIK/vortaro.sgm";
};



open IN,$vortaro;

# legu la linion pri la dokumenttipo
$/='>';
$doctype = <IN>;
$doctype =~ /^\s*<!doctype[^>]+>$/i 
    or die "Nevalida dokumenttipo: $doctype\n";

# legu la artikolojn kaj metu ilin
# en unuopajn dosierojn

$/='</art';
while (<IN>) {

  # forigu antauajn signojn, ne
  # apartenantaj al la artikolo kaj
  # elprenu la markon de la artikolo

  s/^.*?(<art\s+mrk="([^\"]*)")/$1/s;
  $mrk = $2;
  if (not $mrk) { 
      warn "ERARO: artikolo ne havas markon\n"; 
  } else {
  
      # marko estas uzata kiel dosiernomo por la artikolo
      open OUT, ">$ARTIK/$mrk.sgm" or 
	  die "Ne povis krei $ARTIK/$mrk.sgm\n";
      print OUT "$doctype\n\n";
      print OUT "<vortaro>\n";
      print OUT;
      print OUT "></vortaro>\n";
      
      close OUT;
  };
};

close IN;











