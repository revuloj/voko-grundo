package nls;

use v5.6.2;

require Exporter;
@ISA = qw(Exporter);

@EXPORT = qw(read_nls_cfg defined_nls cmp_nls reverse_utf8 
	     letter_nls letter_asci_nls dump_nls_info
             convert_non_ascii replace nls_lingvoj
	     read_minuskl_cfg lowercase); 


$debug=0;
#no warnings;
#no bytes;

#read_nls_cfg("/home/revo/voko/cfg/nls.cfg");
#dump_nls_info("de");
#dump_nls_info("hu");
#dump_nls_info("eo");
#dump_nls_info("fr");
#dump_nls_info("ru");
#dump_nls_info("ko");

# $interpunkcio = '[\s,;\.:\(\)\-\'\/\?!\"]';
$interpunkcio = '[\s,;\.:\(\)\-\'\/\"]'; #"

# komparu du signovicojn per nacilingva ordig-funkcio
sub cmp_nls {

    my ($vorto1,$vorto2,$lng) = @_;
    my $cmp;

    # perforte diru al Perl, ke temas pri UTF-8
    $vorto1 = pack("U*",unpack("U*",$vorto1));
    $vorto2 = pack("U*",unpack("U*",$vorto2));

    my $letters = \%{"letters_$lng"};
    my $aliases = \%{"aliases_$lng"};
    
    unless (%$letters) { 
	    $letters = \%letters_la;
    }

    # ignoru interpunkcion
    $vorto1 =~ s/$interpunkcio//g;
    $vorto2 =~ s/$interpunkcio//g;
#demandsigno au 0 restu ene!
#    $vorto1 =~ s/\PL//g;
#    $vorto2 =~ s/\PL//g;

    if (%$aliases) {
        while (($from,$to)=each %$aliases) {
            $vorto1 = replace($vorto1,$from,$to);
            $vorto2 = replace($vorto2,$from,$to);
        }
    }


    
    my $i;
    for ($i = 0; $i < length($vorto1) and $i < length($vorto2); $i++) {
	$cmp = (${$$letters{substr($vorto1,$i,1)}}[0] || 99999)
	  <=> (${$$letters{substr($vorto2,$i,1)}}[0] || 99999);
        last if ($cmp != 0);
    }

    # se la vortoj egalas his nun, la pli longa venu poste
    $cmp = (length($vorto1) <=> length($vorto2)) unless ($cmp); 
   
    # se la vortoj plu egalas, komparu pli subtile
    unless ($cmp) {
      for ($i = 0; $i < length($vorto1); $i++) {
	$cmp = (${$$letters{substr($vorto1,$i,1)}}[1] || 99999)
	  <=> (${$$letters{substr($vorto2,$i,1)}}[1] || 99999);
        last if ($cmp != 0);
      }
    }
    
    print "$vorto1 (".length($vorto1).") <=> $vorto2 (".length($vorto2)."): $cmp\n" 
	if ($debug);    

    return $cmp;
}

# sub kiu litero en alfabeto aperu vorto komencighanta kun $chr
# (plej ofte majuskloj kaj supersignaj literoj enordighas che la minuskloj)
sub letter_nls {
    my ($chr,$lng) = @_;
    my $letters = \%{"letters_$lng"};
    my $aliases = \%{"aliases_$lng"};

    # diru al Perl, ke temas pri UTF-8
#    print "letter_nls: $chr (".length($chr).") - " if ($debug);
#    $chr = pack("U*",unpack("U*",$chr));
#    print "letter_nls: $chr (".length($chr).")\n" if ($debug);
 
    unless (%$letters) {
	$letters = \%{"letters_la"};
    }
    
    if (%$aliases) {
	while (($from,$to)=each %$aliases) {
	    $chr = replace($chr,$from,$to); 
	}
    }
   
    if (%$letters) {
#	return ( ${$$letters{substr($chr,0,1)}}[2] || '?' );
#	print "letter_nls 1a: ".unpack("U",$chr).".".
#	    pack("U",unpack("U",$chr))."\n" if ($debug);
	return ( ${$$letters{pack("U",unpack("U",$chr))}}[2] || '?' );
    } else {
	return lc(substr($chr,0,1));
    }
}

sub replace {
    my ($str,$from,$to) = @_;

    # perforte diru al Perl, ke temas pri UTF-8
    $str = pack("U*",unpack("U*",$str));
    $from = pack("U*",unpack("U*",$from));
    $to = pack("U*",unpack("U*",$to));

    my $lfrom = length($from);
    my $lto = length($to);

    return $str unless($from);

    $pos = index($str,$from);
    while ($pos>=0) {

	if ($debug) {
	   # if ($pos+$lfrom > length($str)) {
		printf("replace: \"$str\" (%i)  \"$from\" (%i) \"$to\" (%i)\n",
			length($str),length($from),length($to));
	   # }
	}
	no warnings;
	$str = substr($str,0,$pos).$to.substr($str,$pos+$lfrom);
	use warnings;
	$pos = index($str,$from,$pos+$lto);
    }

    return $str;
}


# ASCII-prezento de (minuskla) litero el la alfabeto,
# ekz. por dosiernomoj
sub letter_asci_nls {
    my ($chr,$lng) = @_;
    my $letters = \%{"letters_$lng"};
    my $aliases = \%{"aliases_$lng"};
    
    unless (%$letters) {
	$letters = \%{"letters_la"};
    }

    if (%$aliases) {
	while (($from,$to)=each %$aliases) {
	    $chr = replace($chr,$from,$to); 
	}
    }
       
    if (%$letters) {
	return ( ${$$letters{pack("U",unpack("U",$chr))}}[3] || '0' );
    } else {
	$chr =~ s/[^A-Za-z]/0/; # specialaj signoj ne estu en dosiernomoj
	return $chr;
    }
}



# nur por testado

sub dump_nls_info {
    use utf8;
    $lng = shift;

    print "[$lng]\n";

    foreach $ali (keys %{"aliases_$lng"}) {
        print "$ali=".${"aliases_$lng"}{$ali}."\n";
    }

if ($debug) {
    use utf8;
    my $l = (keys %{"letters_$lng"})[0]; 
    print "len($l): ".length($l)."\n";
}

  foreach $lit (sort
      {cmp_nls($a,$b,$lng)}
#		{cmp_nls(@{${"letters_$lng"}{$a}}[4],
#		     @{${"letters_$lng"}{$b}}[4],$lng)}
      map { pack("U",unpack("U",$_)) } keys %{"letters_$lng"}) {

      print "$lit: ".join(',',@{${"letters_$lng"}{$lit}})."\n";
    }
    print "\n";
}

# legas la agordodosieron kun la lingvo-informoj
# pri ordigado kaj alfabeto

sub read_nls_cfg {

    $cfg_file = shift;
    my $lng='';
    my ($a,$b,$c);
    my $minusklo;
    my $min = 1;
    my $ascii;

    open CFG, $cfg_file or die "Ne povis malfermi \"$cfg_file\": $!\n";
    my @cfg = <CFG>;
    close CFG;

    my $cfg_path = $cfg_file;
    $cfg_path =~ s/\/[a-z\.]+$//;

    my $i = 0;
    while ($i < $#cfg) {
	my $line = $cfg[$i]; $i++;

	# inkludenda dosiero?
	if ($line =~ /^#include\s+([^\s]+)/) {
	    my $incl = $1;
	    unless (open CFG, "$cfg_path/$incl") {
		warn "Ne povis malfermi inkluddosieron \"$cfg_path/$incl\"\n";
		next;
	    }
	    splice(@cfg,$i,0,<CFG>);
	    close CFG;

	} elsif ($line !~ /^#|^\s*$/) { 
            # ignoru komentojn kaj malplenajn liniojn
	    
	    # chu nova lingvo-sekcio?
	    if ($line =~ /^\[([a-z]{2,3})\]\s*$/) {
		$lng = $1;
		($a,$b,$c)=(0,0,0);
		$min = 1;
	    }
	    # chu MAJ?
	    elsif ($line =~ /^MAJ\s*$/) {
		$min = 2;
	    }
	    # chu anstatauigo de litergrupo
	    elsif ($line =~ /^\+([^=]+)=([^\s]*)\s*$/) {
		${"aliases_$lng"}{convert_non_ascii($1)}=convert_non_ascii($2);
	    }
	    # estas liter-priskribo
            elsif ($line =~ /^([a-z]+):\s*(.*)\s*$/) {
		$ascii = $1;
		$a++;
		my $priskribo = $2;
		
		# chu temas pri intervalo? (aziaj lingvoj)
		if ($priskribo =~ /\[\s*(.*?)\s*,\s*(.*?)\s*\]/) {

		    # eltrovu la intervallimojn
		    my ($from,$to) = ($1,$2);
		    unless ($from =~ /\\u([a-f0-9]{4})/i) {
			die "Sintakseraro: interlimojn indiku per \uffff\n";
		    }
		    $from = hex($1);
		    unless ($to =~ /\\u([a-f0-9]{4})/i) {
			die "Sintakseraro: interlimojn indiku per \uffff\n";
		    }
		    $to = hex($1);

		    # plenigu la literotabelon
		    $minusklo = chr($from);
		    for ($j = $from; $j<=$to; $j++) {
			${"letters_$lng"}{chr($j)}=
			    [1000*$a+($j-$from),1000*$a+($j-$from),
			     $minusklo,$ascii,chr($j)];
	            }
		} else {
		
		    # temas pri unuopaj literoj
		    ($b,$c) = (0,0);
		    $minusklo = '';
		    @literoj = split(',',$priskribo);

		    foreach $litgrp (@literoj) {
			$b++; $c=0;
			$litgrp =~ s/^\s*//;
			$litgrp =~ s/\s*$//;
			
#			print "minusklo: " if ($debug);
			$minusklo = convert_non_ascii(
			   (split /\s+/, $litgrp)[$min -1]) unless($minusklo);
			# renversu alinomigon
			while (($from,$to)=each %{"aliases_$lng"}) {
			    if ($to) { 
				$minusklo = replace($minusklo,$to,$from);
			    }
			}

			foreach $lit (split /\s+/, $litgrp) {
			    $c++;
#			    print "litero: " if ($debug);
			    $lit = convert_non_ascii($lit);
#			    print "length: ".length($lit)."\n" if ($debug);

			    # hier wird scheinbar von Unicode nach Bytes umgew.?
			    ${"letters_$lng"}{$lit}=
				[100*$a+10*$b,100*$a+10*$b+$c,$minusklo,$ascii,$lit];
#			print "len1: ".length((keys %{"letters_$lng"})[0])."\n" if ($debug);
		        }
		    }
                }
            }  
            # erara linio
            else {
		die "Sintakseraro en linio $.: \"$line\"\n";
	    }
        }
    }
    close CFG;
}

sub convert_non_ascii {
    my $text = shift;

    $text =~ s/([\200-\377])/pack("U",unpack("C",$1))/ieg;
    $text =~ s/\\u([a-f0-9]{4})/pack("U",hex($1))/ieg;

#    print "[$text]\n" if ($debug);
    return $text;
}

# kontrolas cxu lingvo $lng estas difinita
# redonas la difinojn tiuokaze
sub defined_nls {
  my $lng = shift;
  my $letters = \%{"letters_$lng"};
  my $aliases = \%{"aliases_$lng"};

  return unless (%$letters);

  my (%letr, @desc);

  while (($lit,$d)=each(%$letters)) {
      my @desc = @$d;
      if (%$aliases) {
	  while (($from,$to)=each %$aliases) {
	      if ($to) { 
		  $lit = replace($lit,$to,$from); 
		  $desc[2] = replace($desc[2],$to,$from)
		  }
	  }
      }
      $letr{$lit}=\@desc;
  }

  return %letr;
}

sub read_minuskl_cfg {
    my $cfgfile = shift;

    open CFG,$cfgfile;

    while (<CFG>) {
	unless (/^#/ or /^\s*$/) {
		chomp($_);
		my ($min,$maj) = split(/\s/,$_);

		$minuskl{convert_non_ascii($maj)}=convert_non_ascii($min);
	    }
    }
    close CFG;
}


sub lowercase {
  my $vorto = shift;
  my $res='';

  # certigu UTF8-kodon
  $vorto = pack("U*",unpack("U*",$vorto));

  for ($i=0; $i<length($vorto); $i++) {
    $res .= $minuskl{substr($vorto,$i,1)} || lc(substr($vorto,$i,1));
  }
  return $res;
}













