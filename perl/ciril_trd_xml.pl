#!/usr/bin/perl

# (c) 2021 Wolfram Diestel
# laŭ GPL 2.0
#
# kelkaj cirilaj literoj aspektas same kiel latinaj
# la skripto kontrolas ĉu latinaj enŝteliĝis en la cirilajn tradukojn
#
#  perl ciril_trd_xml.pl uk a*.xml

use XML::LibXML;
# https://metacpan.org/pod/XML::LibXML

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 0;
$reverse = 0; # skribo de dekstre maldekstren (ekz-e hebrea)
unless ($#ARGV>0) {
    print "\n=> Certigu, ke vi troviĝas en la dosierujo kie enestas la artikoloj al kiuj\n";
    print "vi volas aldoni tradukojn el CSV-dosero. Poste voku tiel:\n";
    print "   perl ciril_trd_xml.pl <lingvokodo> <csv-dosiero> <art>*.xml...\n\n" ;
    exit 1;
}

$lingvo = shift @ARGV;
@artikoloj = @ARGV;

#$artikolo = 'tmp/abel.xml';
#$artout = $artikolo.".out";
#%tradukoj = (
#    'abelo' => 'ee-ape, ee-abeille',
#    'abelujo' => 'ee-apur, ee-apora',
#    'abelreĝino' => 'ee-rein'
#);

my %drvmap;
my $doc;

#if ($debug) {
#    print "abako: ",$tradukoj->{abako},"\n";
#    print "absciso: ",$tradukoj->{absciso},"\n";
#}
#exit 1;

my $trd_xpath = XML::LibXML::XPathExpression
    ->new(".//trd[\@lng='$lingvo']|.//trdgrp[\@lng='$lingvo']");
 
for $art (@artikoloj) {
    process_art($art);
}

sub process_art {
    my $artikolo = shift;
    # ni reskribas ĉion al la sama artikolo, kiam ni
    # uzas git-versiadon!
    my $artout = $artikolo; #.".out";
    my $modified = 0;

    print "### ",uc($artikolo)," ###\n";

    %radikoj = ();
    %drvmap = ();

    # load XML
    # DTD devas troviĝi relative al la XML-pado: ../dtd/*.dtd
    # alternative oni devus deklari ext_ent_handler
    # kiel klarigita en https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Parser.pod#Parser-Options
    $doc = XML::LibXML->load_xml(location => $artikolo, expand_entities=>0, keep_blanks=>1);
    #open my $fh, '<', $test_art;
    #binmode $fh; # drop all PerlIO layers possibly created by a use open pragma
    #my $doc = XML::LibXML->load_xml(IO => $fh, validation=>0, expand_entities=>0, keep_blanks=>1);

    # nun ni povas uzi $doc (DOM) kiel klarigita en
    # https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Document.pod
    # https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Node.pod
    # https://metacpan.org/pod/distribution/libxml-enno/lib/XML/DOM/NamedNodeMap.pod

    # trovu art@mrk kaj altigu la version...
    my $art_mrk = $doc->findnodes('//art/@mrk')->[0];
    print ("nuna id: ".$art_mrk->value()."\n") if ($debug);
    my $new_id = incr_ver($art_mrk->value());
    $art_mrk->setValue($new_id);
    print ("nova id: ".$art_mrk->value()."\n") if ($debug);
    ### $modified=1; goto WRITE;

    # trovu radikojn (inkluzive de var-iaĵoj)
    my @rad = $doc->findnodes('//rad');
    for my $rad (@rad) {
        $radikoj->{var_key($rad)} = $rad->textContent();
        print var_key($rad).": ".$rad->textContent()."\n" if ($debug);
    }
        
    # trovu kapojn de derivaĵoj kaj anstataŭigu tildojn
    for my $d ($doc->findnodes('//drv')) {
        extract_kap($d);
    }
    print "drv: ".join(';',keys(%drvmap))."\n" if ($debug);

    # Nun ni scias la kapvortojn kaj derivaĵojn kaj povas aldoni tradukojn.
    # Laŭ kapvortoj ni rigardu ĉu estas tradukoj kaj se jes ni iru al drv
    # kaj provos aldoni la tradukojn inter la aliaj lingvoj laŭalfabete
    for my $k (keys(%drvmap)) {
        print "kap: |$k|...\n" if ($debug);
        my $te;

        my $drv = %drvmap{$k};
        my $inserted = 0;
        my $ignore = 0;

        # ni kontrolu ĉu en la derivaĵo estas tradukoj de tiu lingvo
        # se jes ni kontrolas ĝin.
        my $trd_en_drv = $drv->find($trd_xpath);
        
        if ($trd_en_drv) {

            # https://metacpan.org/pod/XML::LibXML::NodeList
            foreach my $trd ($trd_en_drv->get_nodelist) {
                my $tc = $trd->textContent();
                print "$k: ",$trd->textContent(),"\n";
                if ($tc =~ m/([A-Za-z])/) { #\xa0
                    my $ls = $1;
                    $tc =~ s/\n/ /g;
                    print "!AVERTO: ($k - $tc): lat.sgn: '$ls'!\n"
                }
            }

                # enestas jam tradukoj serĉu kie enŝovi la novan tradukon
#
#                # kreu <trd> aŭ <trdgrp>
#                my @t = split(/\s*,\s*/,$t);
#                my $te, $nl;
#                if ($#t < 1) {
#                    $te = make_trd($t);            
#                } else {
#                    $te = make_trdgrp(@t);
#                }
#                $nl = XML::LibXML::Text->new("\n  ");
#
#                for $ch ($drv->childNodes()) {
#                    if ($ch->nodeName eq 'trd' || $ch->nodeName eq 'trdgrp') {
#                        my $l = attr($ch,'lng');
#
#                        if ($l gt $lingvo) {
#                            # aldonu novajn tradukojn antaŭ la nuna
#                            $drv->insertBefore($te,$ch);
#                            $drv->insertBefore($nl,$ch);
#                            $inserted = 1;
#                            $modified = 1;
#
#                            print "+ $te\n...\n" if ($debug);
#                            last;
#                        }                
#                        print "  $ch\n" if ($debug);
#                    }
#                } # for
#                if (! $inserted && ! $ignore) {
#                    # aldonu fine, se ne jam antaŭe troviĝis loko por enŝovi
#                    $drv->appendText("  ");
#                    $drv->appendChild($te);
#                    $drv->appendText("\n");
#                    $modified = 1;
#                }
        } # if trd_en_drv
    } # for $k

    # nur skribu, se ni efektive aldonis tradukojn, ĉar
    # ankaŭ ŝanĝiĝas iom linirompado kaj kodado de unikodaj literoj en la XML
WRITE:    
    if ($modified) {
        open OUT, ">", $artout || die "Ne povas skribi al '$artout': $!\n";
        print OUT $doc;
        close OUT;
    }
}    

############ helpaj funkcioj.... #############

# eltrovu atributon var el <rad resp. <tld
sub var_key {
    my $el = shift;
    my $var = $el->attributes()->getNamedItem('var');
    if ($var) { return $var->textContent() } else { return '_' };
}

sub attr {
    my ($el,$atr) = @_;
    my $a = $el->attributes()->getNamedItem($atr);
    if ($a) { return $a->textContent };
}

# kreu novan elementon inkl. de atributoj
sub make_el{
    my ($name,%attr) = @_;
    my $el = $doc->createElement($name);    
    while (($key, $val) = each %attr) {
        $el->setAttribute( $key, $val);
    }
    return $el;
}

# kreu unuopan traduk-elementon de $lingvo
sub make_trd {
    my $trd = shift;
    my $el = make_el('trd',('lng'=>$lingvo));
    $el->appendText($trd);
    return $el;
}

# kreu traduk-grupon de $lingvo
sub make_trdgrp {
    my @trd = @_;
    my $el = make_el('trdgrp',('lng'=>$lingvo));
    my $first = 1;
    for my $t (@trd) {
        my $te = make_el('trd');
        $te->appendText($t);
        # aldonu tradukon en grupo
        if ($first) {
            $el->appendText("\n    ");
            $first = 0;
        } else { 
            #$sep = XML::LibXML::Text->new(",\n");
            #$el->appendChild($sep) 
            $el->appendText(",\n    ");
        };
        $el->appendChild($te);
    }
    $el->appendText("\n  ");
    return $el;
}

# trovu ĉiujn kapvortojn inkl. variaĵojn kaj referencu la derivaĵon ($node)
# sub tiuj kapvortoj

sub extract_kap {
    my $node = shift;
    my $res = '';

    my $kap = ($node->findnodes('kap'))[0];
    print "kap: ".$kap if ($debug);

    for my $ch ($kap->childNodes()) {
        # se la ido estas tildo, ni anstataŭigu per la koncerna radiko / variaĵo
        if ($ch->nodeName eq 'tld') {            
            print "\n".$radikoj->{var_key($ch)}."\n" if ($debug); 
            $res .= $radikoj->{var_key($ch)}
        # se temas pri variaĵo ni rikure vokas extract_kap por trakti ĝin
        } elsif ($ch->nodeName eq 'var') {
            my $var = extract_kap($ch);
            # registru la derivaĵon ($node) sub la nomo $var
            $drvmap{$var} = $node;
        # tekstojn kaj literunuojn ni kolektas kiel tekstenhavo
        } elsif ($ch->nodeType eq XML_TEXT_NODE || $ch->nodeType eq XML_ENTITY_REF_NODE) {
            print $ch."\n" if ($debug);
            my $cnt = $ch->textContent();
            $cnt =~ s/,//g;
            $res .= $cnt;
        } else {
            print "NT: ".$ch->nodeType."\n" if ($debug && $ch->nodeType ne XML_ELEMENT_NODE);
        }
    };
    # registru la derivaĵon ($node) sub la kapvorto $res
    $res =~ s/^\s+|\s+$//sg;
    $drvmap{$res} = $node if ($node->nodeName() eq 'drv');
    return $res;
}


# La version ni eltrovos kaj altigos je unu kaj reskribas en la artikolon
# krome la artikolo piede enhavas komenton kun $Log$ por protokoli la lastajn ŝanĝoj
# ni aldonos supre la novan version kaj evt-e mallongigas la komenton
sub incr_ver {
	my ($id_mrk) = @_;

	# $Id: test.xml,v 1.51 2019/12/01 16:57:36 afido Exp $
	$id_mrk =~ m/\$Id:\s+([^\.]+)\.xml,v\s+(\d)\.(\d+)\s+(?:\d\d\d\d\/\d\d\/\d\d\s+\d\d:\d\d:\d\d)(.*?)\$/s;	
	my $ver = id_incr($2,$3);
	my $id = '$Id: '.$1.'.xml,v '.$ver.$4.'$';
	$id_mrk =~ s/\$Id:[^\$]+\$/$id/;
	#$art =~ s/\$Log[^\$]*\$(.*?)-->/log_incr($1,$ver,$shangh_file)/se;

	return $id_mrk;
}

# altigi la version je .1 kaj alpendigi la aktualan daton 
sub id_incr {
	my ($major,$minor) = @_;
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime(time);
	my $now = sprintf("%04d/%02d/%02d %02d:%02d:%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
	return "$major.". ( ++$minor )." $now";
}