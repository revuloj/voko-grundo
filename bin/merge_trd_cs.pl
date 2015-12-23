#!/usr/bin/perl

# enmetas la tradukojn el tekstdosiero
# en la artikolojn ( nur por unufoja uzo :)
# la artikoloj estu en la aktuala dosierujo
#

$trdfile = shift @ARGV;
%cs_trd;
$debug = 1;

# legu chiujn chehhajn tradukojn
open TRD, $trdfile;
while (<TRD>) {
    if (/==/) {
	/^\s*(.*?)\s*==\s*(.*?)\s*$/;
	$cs_trd{$1}=$2;
    };
};
close TRD;

print "chehhaj tradukoj:\n", join(',',%cs_trd), "\n\n"  if ($debug);

proceed();

# legu chiujn artikolojn kaj procedu...
sub proceed {
opendir DIR,".";
for $file (readdir(DIR)) {
    
    unless (-d $file) {
	print "$file"; # if ($debug);
	open ART,$file;
	my $art = join('',<ART>);
	close ART;

	# trovu la radikon
	$art =~ /<rad>(.*)<\/rad>/; 
	my $rad = $1;
	
	if ($rad) {
	    print ": \[$rad\]" if ($debug);

	    # trovu la derivajxojn
	    $art =~ s/<drv(.*?)<\/drv>/"<drv".DERIV($rad,$1)."<\/drv>"/sieg;

	} else { 
	    warn "radiko ne trovita en $file\n";
	}
	print "\n"; # if ($debug);

	# skribu la dosieron
	open ART,">$file";
	print ART $art;
	close ART;
    }
}
closedir DIR;
}

sub DERIV {
    my ($rad,$txt) = @_;
    my $chehh = '';
    my $vosto= '';

    my $fnt = '(?:<fnt>[^<]+<\/fnt>)';
    my $ofc = '(?:<ofc>\*<\/ofc>)';
    if ($txt =~ /<kap>$ofc?$fnt?<tld\/>([aeio]|oj)?$fnt?<\/kap>/sig) {
	$drv = "$rad$1";
	print " $drv," if $debug;
	
	# trovu tradukojn
	$chehh = $cs_trd{lc($drv)};
	print " $chehh," if ($debug);
	if ($chehh) { 

	    # provizore forigu la aliajn tradukojn de la fino
	    if ($txt =~  s/<\/snc>\s*(<trd.*<\/trd>)\s*$/<\/snc>\n/s) {
		$vosto = $1;
	    }

	    unless ($chehh =~ /,/) {
		$txt .= "<trd lng=\"cs\">$chehh</trd>\n";
	    } else {
		my @cs = split (/\s*,\s*/,$chehh);
		$txt .= "<trdgrp lng=\"cs\">";
		foreach $cs_ (@cs) {
		    unless ($cs_ eq $cs[0]) { $txt .= "," };
		    $txt .= "\n  <trd>$cs_</trd>";
		}
		$txt .= "\n</trdgrp>\n";
	    }

	    $txt .= "$vosto\n";
	};
	
    }

    print "\n<<<\n$txt\n>>>\n" if ($debug and ($chehh));

    return $txt;
}






