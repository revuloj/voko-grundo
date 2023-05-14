#!/usr/bin/perl

# (c) 2023 Wolfram Diestel
# laŭ permesilo GPL 2.0
#
# ŝovas derivaĵon el unu artikolo al alia. Ni uzas tion
# ĉe kunmetitaj vortoj, kiuj difiniĝis en la artikolo de
# la unua vortparto anstataŭ tiu en la fina: om.0metro -> metr.om0o
# La skripto faras la sekvajn subtaskojn:
#  - trovi la derivaĵon per sia marko en la origina artikolo
#  - ŝanĝi la markon, trovante tiun de la celartikolo kaj adaptante la strukturon de la marko
#  - simile pri la snc/subsnc-markoj
#  - trovu la kapvorton kaj anstataŭigu la tildon, simile al la mrk-adapto
#  - trovu ĉiujn tildojn en ekzemploj kaj anstataŭigu same
#  - malfermu la celartikolon kaj enmetu la derivaĵon (donante cel-mrk anst. artikolon, ni enŝovos post tiu, aliokaze en la fino)
#  - truvo referencojn al la origina derivaĵo kaj adaptu la celon al la nova artikolo
#  -- ĉe ĉiuj adaptitaj artikoloj ankaŭ altigu la version kaj aldonu ŝanĝkomenton
#
# uzante XML::LibXML ĝi provas eviti strukturajn problemojn kiuj
# povus okazi ĉe regulesprimoj
#
#  perl movu_drv.pl <orig-mrk> <cel-mrk>

use XML::LibXML;
# https://metacpan.org/pod/XML::LibXML
use Text::CSV qw( csv );

use lib("../voko-grundo/perl");
use process;

use utf8;
binmode(STDOUT, "encoding(UTF-8)");

$debug = 1;

unless ($#ARGV == 1) { # 1: tio estas du argumentoj
    print "\n=> Certigu, ke vi troviĝas en la dosierujo kie enestas la artikolo el kiu\n";
    print "vi volas formovi derivaĵon. Poste voku tiel:\n";
    print "   perl movu_drv.pl <orig-mrk> <cel-mrk>\n\n" ;
    exit 1;
}

$xml_dir = "./revo/";

$origmrk = shift @ARGV;
$celmrk = shift @ARGV;

my $shanghoj = "revo: movu drv $origmrk al/sub $celmrk";

my %radikoj;
my %drvmap;
my $doc;


my $origart = mrk_art($origmrk);
my $celart = mrk_art($celmrk);

forigu_drv();
#aldonu_drv($celart,$celmrk);
#adaptu_refjn($origmrk,$celmrk?);

sub mrk_art {
    my $mrk = shift;
    $mrk =~ /^([^\.]+)(\.|$)/;
    return $xml_dir.$1.".xml";
}

sub forigu_drv {

    # ni reskribos ĉion al la sama artikolo, kiam ni
    # uzas git-versiadon!
    my $artout = $origart; #.".out";
    my $modified = 0;

    print "### ",uc($origart)," ###\n";

    %radikoj = ();
    %drvmap = ();

    # load XML
    # DTD devas troviĝi relative al la XML-pado: ../dtd/*.dtd
    # alternative oni devus deklari ext_ent_handler
    # kiel klarigita en https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Parser.pod#Parser-Options
    $doc = XML::LibXML->load_xml(location => $origart, expand_entities=>0, keep_blanks=>1);
    #open my $fh, '<', $test_art;
    #binmode $fh; # drop all PerlIO layers possibly created by a use open pragma
    #my $doc = XML::LibXML->load_xml(IO => $fh, validation=>0, expand_entities=>0, keep_blanks=>1);

    # nun ni povas uzi $doc (DOM) kiel klarigita en
    # https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Document.pod
    # https://metacpan.org/pod/distribution/XML-LibXML/lib/XML/LibXML/Node.pod
    # https://metacpan.org/pod/distribution/libxml-enno/lib/XML/DOM/NamedNodeMap.pod

    # trovu drv@mrk, forigu ĝin...
    my $drv_xpath = XML::LibXML::XPathExpression
      ->new(".//drv[\@mrk='$origmrk']");
    my $drv = $doc->findnodes($drv_xpath)->[0];
    $drv->unbindNode();
    $modified = 1;

    # trovu art@mrk kaj altigu la version...
#    my $art_mrk = $doc->findnodes('//art/@mrk')->[0];
#    print ("nuna id: ".$art_mrk->value()."\n") if ($debug);
#    my $new_id = incr_ver($art_mrk->value());
#    $art_mrk->setValue($new_id);
#    print ("nova id: ".$art_mrk->value()."\n") if ($debug);
    ### $modified=1; goto WRITE;

    # trovu radikojn (inkluzive de var-iaĵoj) - ni bezonos por anst. tildojn
    my @rad = $doc->findnodes('//rad');
    for my $rad (@rad) {
        $radikoj->{var_key($rad)} = $rad->textContent();
        print var_key($rad).": ".$rad->textContent()."\n" if ($debug);
    }

    $novdrv = adaptu_drv($drv);
        
#    # trovu kapojn de derivaĵoj kaj anstataŭigu tildojn
#    for my $d ($doc->findnodes('//drv')) {
#        extract_kap($d);
#    }
#    print "drv: ".join(';',keys(%drvmap))."\n" if ($debug);

    # Nun ni scias la kapvortojn kaj derivaĵon kaj povas modifi ĝin
#    for my $k (keys(%drvmap)) {
#        print "kap: |$k|...\n" if ($debug);
#        my $t = $tradukoj->{$k};
#        my $te;
#
#        if ($t) {
#            print "- trd: $t\n" if ($debug);
#
#            my $drv = %drvmap{$k};
#            my $inserted = 0;
#            my $ignore = 0;
#
#            # unue ni kontrolu ĉu en la derivaĵo jam estas tradukoj de tiu lingvo
#            # se jes ni ne tuŝos ĝin.
#            my $trd_en_drv = $drv->find($trd_xpath);
#            
#            if ($trd_en_drv) {
#
#                # se jam enestas tradukoj ni ne aldonas...
#                $ignore = 1;
#                print "!!! jam enestas trd '$lingvo' !!!\n" if ($debug);
#
#            } else {
#                # ne enestas jam tradukoj serĉu kie enŝovi la novan tradukon
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
#            } # else
#        }
#    }

    # nur skribu, se ni efektive ŝanĝis la artikolon, ĉar
    # ankaŭ ŝanĝiĝas iom linirompado kaj kodado de unikodaj literoj en la XML
WRITE:    
    if ($modified) {
#        open OUT, ">", $artout || die "Ne povas skribi al '$artout': $!\n";
#        print OUT $doc;
#        close OUT;
        process::write_file(">",$artout,$doc);

        # nova versio
        process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
        process::incr_ver($artout,"/tmp/shanghoj.msg");

        print "...$shanghoj\n" if ($verbose);
    }
}    

############ helpaj funkcioj.... #############

# ŝanĝu drv el nuna al cel-artikolo
sub adaptu_drv {
    my ($drv) = @_;

    $novmrk = adaptu_mrk();

    # trovu drv@mrk kaj enmetu ŝanĝitan markon...
    my $drv_mrk = $drv->findnodes('@mrk')->[0];
    $drv_mrk->setValue($novmrk);

    # trovu ĉiujn tildojn kaj enmatu la radikon anstataŭe...
    my @tld = $drv->findnodes('.//tld');
    for $tld (@tld) {
        my $rad = tldrad($tld);
        my $rt = XML::LibXML::Text->new($rad);
        $tld->replaceNode($rt);
    }

    print "drv: ".$drv."\n" if ($debug);
}


# ŝanĝu mrk el nuna al cel-artikolo
sub adaptu_mrk {
    my ($celrad) = @_;

    my $rad = $radikoj->{'_'};
    my @orig = split(/\./,$origmrk);
    my @cel = split(/\./,$celmrk);

    # KOREKTU: ni bezonas la radikon de la celartikolo, provizore ni uzas la doserinomon...!
    my $celrad = @cel[0];

    # la unuan parton ni anstataŭigu per la nova artikolo
    @orig[0] = @cel[0];

    if (@orig[1]) {
        # en la dua parto de marko "0" reprezentas tilon, kiun ni anstataŭigu per la kapvorto
        @orig[1] =~ s/0/$rad/;
        # en la dua parto de marko ni anstataŭigu la kapvorton de la nova artikolo per "0"
        @orig[1] =~ s/$celrad/0/;
    }

    return join('.',@orig);
}

# redonas la radikan tekston respondan al la tildo
# konsiderante ankaŭ ties atributojn @lit kja @var
sub tldrad {
    my ($tld) = @_;
    my $lit = $tld->getAttribute('lit');
    my $var = $tld->getAttribute('var') || '_';
    my $rad = $radikoj->{$var};
    if ($lit) {
        $rad =~ s/^./$lit/;
    }
    return $rad;
}


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
