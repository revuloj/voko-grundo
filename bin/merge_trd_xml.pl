#!/usr/bin/perl

# (c) 2021 Wolfram Diestel
# laŭ GPL 2.0
#
# enmetas la tradukojn el tekstdosiero
# en la artikolojn ( nur por unufoja uzo :)
# la artikoloj estu en la aktuala dosierujo
#
# uzante XML::LibXML ĝi provas eviti la problemon kun pli frua
# merge_trd_cs.pl kiu akcidente forigis partojn de kelkaj artikoloj

use XML::LibXML;
# https://metacpan.org/pod/XML::LibXML

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 1;

$artikolo = 'tmp/abel.xml';
$artout = $artikolo.".out";
$lingvo = 'zz';
%tradukoj = (
    'abelo' => 'ee-ape, ee-abeille',
    'abelujo' => 'ee-apur, ee-apora',
    'abelreĝino' => 'ee-rein'
);

# load XML
# DTD devas troviĝi relative al la XML-pado: ../dtd/*.dtd
# alternative oni devus deklari ext_ent_handler
# kiel klarigita en https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Parser.pod#Parser-Options
my $doc = XML::LibXML->load_xml(location => $artikolo, expand_entities=>0, keep_blanks=>1);
#open my $fh, '<', $test_art;
#binmode $fh; # drop all PerlIO layers possibly created by a use open pragma
#my $doc = XML::LibXML->load_xml(IO => $fh, validation=>0, expand_entities=>0, keep_blanks=>1);

# nun ni povas uzi $doc (DOM) kiel klarigita en
# https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Document.pod
# https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Node.pod
# https://metacpan.org/pod/distribution/libxml-enno/lib/XML/DOM/NamedNodeMap.pod

# trovu radikojn (inkluzive de var-iaĵoj)
my %radikoj;
my @rad = $doc->findnodes('//rad');
for my $rad (@rad) {
    $radikoj->{var_key($rad)} = $rad->textContent();
    print var_key($rad).": ".$rad->textContent()."\n" if ($debug);
}
    
# trovu kapojn de derivaĵoj kaj anstataŭigu tildojn
my %drvmap;
for my $d ($doc->findnodes('//drv')) {
    extract_kap($d);
}
print "drv: ".join(';',keys(%drvmap))."\n" if ($debug);

# Nun ni scias la kapvortojn kaj derivaĵojn kaj povas aldoni tradukojn.
# Laŭ kapvortoj ni rigardu ĉu estas tradukoj kaj se jes ni iru al drv
# kaj provos aldoni la tradukon inter la aliaj lingvoj laŭalfabete
for my $k (keys(%drvmap)) {
    print "kap: $k...\n" if ($debug);
    my $t = %tradukoj{$k};
    my $te;

    if ($t) {
        print "- trd: $t\n" if ($debug);

        # kreu <trd> aŭ <trdgrp>
        my @t = split(/\s*,\s*/,$t);
        my $te, $nl;
        if ($#t < 1) {
            $te = make_trd($t);            
        } else {
            $te = make_trdgrp(@t);
        }
        $nl = XML::LibXML::Text->new("\n  ");

        my $drv = %drvmap{$k};
        my $inserted = 0;
        for $ch ($drv->childNodes()) {
            if ($ch->nodeName eq 'trd') {
                my $l = attr($ch,'lng');

                if ($l gt $lingvo) {
                    # aldonu novajn tradukojn antaŭ la nuna
                    $drv->insertBefore($te,$ch);
                    $drv->insertBefore($nl,$ch);
                    $inserted = 1;

                    print "+ $te\n...\n" if ($debug);
                    last;
                }                
                print "  $ch\n" if ($debug);
            }
        }
        if (! $inserted) {
            # aldonu fine, se ne jam antaŭe troviĝis loko por enŝovi
            $drv->appendText("  ");
            $drv->appendChild($te);
            $drv->appendText("\n");
        }
    }
}

open OUT, ">", $artout || die "Ne povas skribi al $artout: $!\n";
print OUT $doc;
close OUT;

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
        if ($ch->nodeName eq 'tld') {            
            print $radikoj->{var_key($ch)}."\n" if ($debug); 
            $res .= $radikoj->{var_key($ch)}
        } elsif ($ch->nodeName eq 'var') {
            my $var = extract_kap($ch);
            # registru la derivaĵon ($node) sub la nomo $var
            $drvmap{$var} = $node;
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
    $drvmap{$res} = $node if ($node->nodeName() eq 'drv');
    return $res;
}

#print $doc;

#my $doc = XML::LibXML::Document->new('1.0','utf-8');

#my $element = $doc->createElement($name);
#$element->appendText($text);
#$xml_fragment = $element->toString(); # returns a character string
#$xml_document = $doc->toString(); # returns a byte string