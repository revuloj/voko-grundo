#!/usr/bin/perl -w
#
# uzo: xml2html.pl mia_artikolo.xml > mia_artikolo.html

################## parametroj ########################

$lng_simboloj = 1; # enmetu simbolojn por lingvoj
$ref_simboloj = 1; # enmetu simbolojn por referenctipoj
$fak_simboloj = 1; # enmetu simbolojn por fakoj
$redakto_cgi  = '/cgi-bin/vokomail.pl'; # ligo al redakto-programo
$xml_dosierujo = '../xml';

# kie troviøas simboletoj (rilate al la artikoloj)
$smb_dosierujo = "../smb";
%refsmb_bildo = ("vid"    => "vidu.gif",
		 "sin"    => "sinonimo.gif",
		 "dif"    => "difino.gif",
		 "ant"    => "antonimo.gif",
		 "super"  => "supernoc.gif",
		 "sub"    => "subnocio.gif",
		 "prt"    => "parto.gif",
		 "malprt" => "malparto.gif");

%refsmb_teksto = ("vid"    => "-&gt;",
		  "sin"    => "=&gt;",
		  "dif"    => "=",
		  "ant"    => "x&gt;",
		  "super"  => "^",
		  "sub"    => "v",
		  "prt"    => "c&gt;",
		  "malprt" => "e&gt;");

# kie troviøas stildosiero (rilate al la artikoloj)
$stl_dosiero = "../stl/artikolo.css";         

@romanaj_nombroj = ('0','I','II','III','IV','V','VI','VII','VIII','IX','X');

################# komenco de la programo ################

use XML::Parser;

my $file = shift;
if ($file) {
    die "Can't find file \"$file\""
	unless -f $file;

    $title = $file; $title =~ s/\.xml//i;
} else {
    $title = 'artikolo';
}

my $parser = new XML::Parser(Style => 'Subs', 
			     ParseParamEnt => 1,
			     ErrorContext => 2, 
			     Handlers => {
				 Char  => \&char_handler}
			     );

$snc_cnt=0;
$subdrv_cnt=0;
$subsnc_cnt=0;
$subart_cnt=0;
$head_level=2;
$radiko='';
$marko='';
$cvs_id='';
$drv_finished=0;

if ($file) {
    $parser->parsefile($file);
} else {
    $parser->parse(*STDIN);
}

#print_html($tree);

#################### fino de la programo ####################


################## traktantoj de analiz-eventoj ################
 

sub get_attr($@) {
    my($attr_name,@attr_list)=@_;
    
    while (@attr_list) {
	if (shift @attr_list eq $attr_name) { return shift @attr_list };
    };
    return ''; # atributo ne trovita;
};

sub char_handler
{
    my ($xp, $text) = @_;

    if (length($text)) {

      $text = $xp->xml_escape($text)
        unless $in_cdata;

      print $text;
    }
}  # End char_handler      


sub handle_ent
{
    my $xp=shift, $name=shift, $value=shift;

    print "Entity: $name=$value\n";

}

################## vortaro (kadro) ##################

sub vortaro {
#    my $title = $file; $title =~ s/\.xml//i;

    print "<html>\n<head>\n";
    print "<meta http-equiv=\"Content-Type\""
	." content=\"text/html; charset=UTF-8\">\n";
    print "<link title=\"artikolo-stilo\" type=\"text/css\""
	." rel=stylesheet href=\"$stl_dosiero\">\n";
    print "<title>$title</title>\n</head>\n";
    print "<body>\n";
};
sub vortaro_ {
    my $versio;

    if ($redakto_cgi) {
	print "<hr>\n[<a href=\"$xml_dosierujo/$marko.xml\">$marko.xml</a>]\n";
	print "[<a href=\"$redakto_cgi?art=$marko\">redakti...</a>]\n";
	
	if ($cvs_id =~ m|,v ([0-9/:\. ]+) |) {
	    $versio = $1;
	    print "versio: $versio\n<br>";
	}
    }

    print "</body>\n</html>\n";
};

##########  kruda strukturo de artikolo #############

sub art {
    shift; shift; # ignoru xp kaj el
    $marko = get_attr('mrk',@_);
    if ($marko =~ /^\044Id:/) {
	$cvs_id=$marko;
	$cvs_id =~ /^\044Id:\s+([^,\.]+)\.xml,v.*\044$/;
	$marko = $1;
    }

    $art_finished=0;
    $snc_cnt=0;
    $subdrv_cnt=0;
    $subart_cnt=0;
    $head_level=2;
};
sub art_ {
    if ($subart_cnt || $snc_cnt) { 
	print "</dl>" unless ($art_finished);
	$subart_cnt=0;	
	$snc_cnt=0; 
    };
};

sub kap {
    print "<h$head_level>";
};
sub kap_ {
    print "</h$head_level>";
}

sub rad {
    my $xp = shift;

    # instalu funkcion, kiu kaptas la radikon
    $radiko = '';
    $xp->setHandlers(Char    => \&get_radix);
};
sub rad_ {
    my $xp = shift;
    $xp->setHandlers(Char => \&char_handler);
#    $xp->setHandlers(Char => undef);
};
sub get_radix{
   my ($xp, $text) = @_;

   if (length($text)) {

      $text = $xp->xml_escape($text)
        unless $in_cdata;

      print $text;
  };

  $radiko .= $text; 
}

sub tld {
    shift; shift; # ignoru xp kaj el
    my $lit = get_attr('lit',@_);
    my $rad = $radiko;
    
    if ($lit) {
	my $len = length($lit); # necesa, æar en UTF-8 supersignaj literoj
	                        # estas du-bitokaj
	$rad =~ s/^.{$len}/$lit/;
    }
    print $rad;
}

sub subart {
    $subart_cnt++;
    $snc_cnt=0;
    $subart_finished=0;

    if ($subart_cnt == 1) { print "<dl compact>\n"; };
    print "<dt>$romanaj_nombroj[$subart_cnt].\n<dd>";
}
sub subart_ {
 if ($snc_cnt) {
	print "</dl>" unless ($subart_finished);
	$snc_cnt=0;
    };
}

sub drv {
    shift; shift; # ignoru xp kaj el
    $mrk = get_attr('mrk',@_);

    $subdrv_cnt=0;
    $snc_cnt=0;
    $drv_finished=0;

    $head_level++;

    if ($mrk) {
	print "<a name=\"$mrk\"></a>\n";
    }
};
sub drv_ {
    $head_level--;
    if ($subdrv_cnt || $snc_cnt) {
	print "</dl>" unless ($drv_finished);
	$subdrv_cnt=0;
	$snc_cnt=0;
    };
}

sub subdrv {
    $subdrv_cnt++;
    
    $snc_cnt=0;

    if ($subdrv_cnt==1) { print "<dl compact>\n" };
    print "<dt>".chr(ord('A')+$subdrv_cnt-1).".\n<dd>";
};
sub subdrv_ {
    if ($snc_cnt) {
	print "</dl>";
	$snc_cnt=0;
    };
};

sub snc {
    shift; shift; # ignoru la argumentojn xp kaj el
    my $mrk = get_attr('mrk',@_);
    $num = get_attr('num',@_); 
    $num .='.' if ($num);

    $snc_cnt++;
    $subsnc_cnt=0;

    if ($mrk) {
	print "<a name=\"$mrk\"></a>\n";
    };

    if ($snc_cnt==1) { print"<dl compact>\n" };
    print "<dt>$num\n<dd>";
};
sub snc_ {
    if ($subsnc_cnt) {
	print "</dl>";
	$subsnc_cnt=0;
    };
};

sub subsnc {
    $subsnc_cnt++;

    if ($subsnc_cnt==1) { print "<dl compact>\n" };
    print "<dt>".chr(ord('a')+$subsnc_cnt-1).".\n<dd>";
}


############### priskribaj elementoj #################

sub refgrp {
    $xp = shift; 
    shift; # ignoru la argumenton el
    my $tip = get_attr('tip',@_);
    
    if ($tip and ! $xp->in_element('dif')) { 
	my $smb = "$smb_dosierujo/$refsmb_bildo{$tip}";
	my $txt = $refsmb_teksto{$tip};

	if ($ref_simboloj) {
	    print "<img src=\"$smb\" alt=\"$txt\">";
	} else {
	    print "$txt ";
	};
    };
}

sub ref {
    $xp = shift; 
    shift; # ignoru la argumenton el
    my $cel = get_attr('cel',@_);
    my $tip = get_attr('tip',@_);
 
    if ($tip and ! $xp->in_element('dif')) { 
	my $smb = "$smb_dosierujo/$refsmb_bildo{$tip}";
	my $txt = $refsmb_teksto{$tip};

	if ($ref_simboloj) {
	    print "<img src=\"$smb\" alt=\"$txt\">";
	} else {
	    print "$txt ";
	};
    };

    # transformu cel al URL
    if ($cel =~ /\./) {
	$cel =~ s/([a-zA-Z0-9]+)\./$1.html#$1./;
    } else {
	$cel .= '.html';
    };
    print "<a href=\"$cel\">";
};
sub ref_ {
    print "</a>";
};
  

sub ekz  { 
    my $xp = shift;
    my $class;

    if ($xp->in_element('rim')) {
	$class = 'rimekz';
    } else {
	$class = 'ekz';
    };
    print "<cite class=$class>" 
};
sub ekz_ { print "</cite>" };

sub dif  { print "<span class=dif>" };
sub dif_ { print "</span>" };

sub ofc  { print "<sup class=ofc>" };
sub ofc_ { print "</sup>" };

sub fnt  { print "<sup class=fnt>" };
sub fnt_ { print "</sup>" };

sub gra  { print "(" };
sub gra_ { print ")<br>" };

sub rim  { 
    shift; shift; # ignoru la argumentojn xp kaj el
    my $num = get_attr('num',@_);
    $num = ' '.$num if ($num);

    print "<span class=rim>RIM.$num: " 
};
sub rim_ { print "</span>"};

sub klr  { print "<span class=klr>" };
sub klr_ { print "</span>" };

sub trdgrp {
    my $xp = shift;
    shift; # ignoru el
    my $lng = get_attr('lng',@_);
    my $class;

    # se la traduko rilatas al drv, art, subart jam metu </dl>
    # atentu, ke tio nur funkcias, se la tradukoj
    # chiam venas fine
    if ($xp->in_element('drv')) {
	if (($subdrv_cnt || $snc_cnt) && !($drv_finished)) {
	    print "</dl>\n";
	    $drv_finished = 1;
	}
    } elsif ($xp->in_element('subart')) {
	if (($drv_cnt || $snc_cnt) && !($subart_finished)) {
	    print "</dl>\n";
            $subart_finished = 1;
	}
    } elsif ($xp->in_element('art')) {
        if (($drv_cnt || $snc_cnt || $subart_cnt) && !($art_finished)) {
            print "</dl>\n";
            $art_finished = 1;
	}
    }

    if ($xp->in_element('rim')) {
	$class = 'rimtrd';
    } elsif ($xp->in_element('dif')) {
	$class = 'diftrd';
    } elsif ($xp->in_element('klr')) {
	$class = 'klrtrd';
    } else {
	$class = 'trd';
    };

    if ($class eq 'trd') {
	print "<br><span class=$class>";
	if ($lng_simboloj) {
	    print "<img src=\"$smb_dosierujo/$lng.jpg\" alt=\"$lng:\"> ";
	} else {
	    print "<i>$lng:</i> ";
	};
    } else {
	print "<span class=$class>";
    };
};
sub trdgrp_ { print "</span>" };

sub trd  { 
    my $xp = shift;
    shift; # ignoru el
    my $lng = get_attr('lng',@_);
    my $class;

    # se la traduko rilatas al drv, jam metz </dl>
    # atentu, ke tio nur funkcias, se la tradukoj
    # chiam venas fine
    if ($xp->in_element('drv')) {
	if (($subdrv_cnt || $snc_cnt) && !($drv_finished)) {
	    print "</dl>\n";
	    $drv_finished = 1;
	}
    }  elsif ($xp->in_element('subart')) {
        if (($drv_cnt || $snc_cnt) && !($subart_finished)) {
            print "</dl>\n";
            $subart_finished = 1;
	}
    } elsif ($xp->in_element('art')) {
        if (($drv_cnt || $snc_cnt || $subart_cnt) && !($art_finished)) {
            print "</dl>\n";
            $art_finished = 1;
	}
    }    

    if ($xp->in_element('trdgrp')) {
	$class = 'trdgrptrd';
    } elsif ($xp->in_element('rim')) {
	$class = 'rimtrd';
    } elsif ($xp->in_element('dif')) {
	$class = 'diftrd';
    } elsif ($xp->in_element('klr')) {
	$class = 'klrtrd';
    } else {
	$class = 'trd';
    };

    if ($class eq 'trd') {
	print "<br><span class=$class>";
	if ($lng_simboloj) {
	    print "<img src=\"$smb_dosierujo/$lng.jpg\" alt=\"$lng:\"> ";
	} else {
	    print "<i>$lng:</i> ";
	};
    } else {
	print "<span class=$class>";
    };
};
sub trd_ { print "</span>" };

sub bld { 
    shift; shift; # ingoru xp kaj el
    my $lok = get_attr('lok',@_);

    print "<br><img src=\"$lok\">" 
};

sub uzo {
    my $xp = shift; 
    shift; # ignoru el
    $tip = get_attr('tip',@_);

    if (($tip eq 'fak') and ($fak_simboloj)) {
	$xp->setHandlers(Char => \&fak_smb);
    };
};
sub uzo_ {
    my $xp = shift; 
    $xp->setHandlers(Char => \&char_handler);

#    if ($xp->in_element('drv')) {
#	print "\n<br>\n"; # eble nur por fakoj faru?
#    }
}
sub fak_smb{
    my ($xp, $fak) = @_;

    if (length($fak)) {
	print "<img src=\"$smb_dosierujo/$fak.gif\" alt=\"$fak\" "
	    ."align=absmiddle>\n";
    };
};

sub url { 
   my $xp = shift;
   shift; # ignoru el
   my $ref = get_attr('ref',@_);

   if ($xp->in_element('lok')) {
       print "<a href=\"$ref\">";
   } else {
       print "<br>";
       # priskriba elemento en snc, drv, ...
       if ($ref_simboloj) {
	   print "<img src=\"$smb_dosierujo/url.gif\" alt=\"URL:\"> ";
       } else {
	   print "<i>URL:</i> ";
       }
       print "<a href=\"$ref\">";
   }
};
sub url_ {
    print "</a>";
}


################### tekst-stiloj #################

sub em  { print "<strong>" };
sub em_ { print "</strong>" };

sub sup  { print "<sup>" };   
sub sup_ { print "</sup>" };

sub sub  { print "<sub>" };
sub sub_ { print "</sub>" };










