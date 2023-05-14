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

$verbose = 1;
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
my $novmrk;

# enlegu la originan kaj la celan artikolojn
my $origart = mrk_art($origmrk);
my $origxml = XML::LibXML->load_xml(location => $origart, expand_entities=>0, keep_blanks=>1);
my $origrad = art_radikoj($origxml);

my $celart = mrk_art($celmrk);
my $celxml = XML::LibXML->load_xml(location => $celart, expand_entities=>0, keep_blanks=>1);
my $celrad = art_radikoj($celxml);
my @cel = split(/\./,$celmrk);
my $celdos = @cel[0];

my $shanghoj = "revo: movu drv $origmrk al $celdos/";

# forigu la derivaĵon el la originala artikolo
my $drv = forigu_drv();

# se tio funkciis, skribu la rezulton kaj enŝovu en la celan artikolon
if ($drv) {
    
    # adaptu la XML de la derivaĵo kaj enmetu en la nvoan artikolon
    adaptu_drv($drv);  
    aldonu_drv($drv);

    # skribu ambaŭ artikolojn
    skribu_art($origart,$origxml);
    skribu_art($celart,$celxml);

    #adaptu_refjn($origmrk,$celmrk?);

    for $art (glob '$art_dir/*.xml') {
        anst_ref_art($art);
    }
}


############ helpaj funkcioj.... #############

# konstruas la dosiernomon el donita marko
sub mrk_art {
    my $mrk = shift;
    $mrk =~ /^([^\.]+)(\.|$)/;
    return $xml_dir.$1.".xml";
}

sub art_radikoj {
    my $xml = shift;
    my $radikoj = {};

    # trovu radikojn (inkluzive de var-iaĵoj) - ni bezonos poste por anst. tildojn
    for my $rad ($xml->findnodes('//rad')) {
        $radikoj->{var_key($rad)} = $rad->textContent();
        print var_key($rad).": ".$rad->textContent()."\n" if ($debug);
    }

    return $radikoj;
}

sub skribu_art {
    my ($art,$xml) = @_;

    process::write_file(">",$art,$xml);

    # nova versio
    process::write_file(">","/tmp/shanghoj.msg",$shanghoj);
    process::incr_ver($art,"/tmp/shanghoj.msg");

    print "$art:...$shanghoj\n" if ($verbose);
}    


# trovu kaj forigu la derivaĵon en la originala artikol,
# kiel rezulto ni ricevas la XML-strukturon de la derivaĵo
sub forigu_drv {    

    print "### ",uc($origart)," ###\n";

    # trovu drv@mrk, forigu ĝin...
    my $drv_xpath = XML::LibXML::XPathExpression
      ->new(".//drv[\@mrk='$origmrk']");
    my $drv = $origxml->findnodes($drv_xpath)->[0];

    if ($drv) {
      $drv->unbindNode();
      return $drv->cloneNode(1);
    } else {
        die "Ne troviĝas drv $origmrk en la artikolo $origart\n";
    }
}

# trovu la lokon indikita kiel celo kaj enŝovu la derivaĵon tie
sub aldonu_drv {
    my $drv = shift;
    my $celo; # kie enmeti la novan derivaĵon, t.e. post alia derivaĵo aŭ fine de la artikolo

    if (index($celmrk,'.')>0) {
        my $drv_xpath = XML::LibXML::XPathExpression
        ->new(".//drv[\@mrk='$celmrk']");
        $celo = $celxml->findnodes($drv_xpath)->[0];
    } else {
        # lasta drv-elemento
        $celo = $celxml->findnodes('//drv')->[-1];
    }

    if ($celo) {
        print "...enmetas drv ".$drv->getAttribute('mrk')." post ".$celo->getAttribute('mrk')."\n" if ($verbose);
        my $p = $celo->parentNode;
        $p->insertAfter($drv,$celo);
        # linirompo inter derivaĵoj
        $p->insertAfter(XML::LibXML::Text->new("\n\n"),$celo);
    } else {
        die "Ne troviĝas drv $celmrk en la artikolo $celart\n";
    }
}

# ŝanĝu drv el nuna al cel-artikolo
sub adaptu_drv {
    my ($drv) = @_;
    @posttld = ();

    $novmrk = adaptu_mrk();

    # trovu drv@mrk kaj enmetu ŝanĝitan markon...
    my $drv_mrk = $drv->findnodes('@mrk')->[0];
    $drv_mrk->setValue($novmrk);

    # trovu ĉiujn tildojn kaj enmatu la radikon anstataŭe...
    my @tld = $drv->findnodes('.//tld');
    for $tld (@tld) {
        # memoru la nodon post la tildo, ĉar kutime ĝi enhavas
        # la radikon $tld->nextSibling()de la celartikolo, kiun ni poste devas anstataŭigi per tildo
        my $s = $tld->nextSibling();
        push @posttld, ($s) if ($s && $s->nodeType eq XML_TEXT_NODE); # || ??? $n->nodeType eq XML_ENTITY_REF_NODE

        # anstataŭigu la tildon per la ĝusta radiko
        my $rad = tldrad($tld);
        my $rt = XML::LibXML::Text->new($rad);
        $tld->replaceNode($rt);
    }

    # enmetu tildojn por la celartikolo
    for $n (@posttld) {
        my @nl = radtld($n->textContent);
        if (@nl) {
            insert_after($n,@nl);
            $n->unbindNode();
        }
    }

    print "drv: ".$drv."\n" if ($debug);
}

### PLIBONIGU: la traktoj de radikoj/tildoj ankoraŭ ne funkcias, se enestas supersignoj!
# verŝajne ĉar ili estas unuo-nodoj kiel &ccirc;...

# ŝanĝu mrk el nuna al cel-artikolo
sub adaptu_mrk {
    my ($celrad) = @_;

    my $rad = $origrad->{'_'};
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
    my $rad = $origrad->{$var};
    if ($lit) {
        $rad =~ s/^./$lit/;
    }
    return $rad;
}

# anstataŭigu radikoj de la celartikolo per tildo
# kaj redoni kiel nodlisto
sub radtld {
    my $text = shift;
    my @nl = ();
    my $rad = $celrad->{'_'}; # provizore ni ignoras minuskligitajn/majuskligitajn variojn

    my $i = index($text,$rad);
    if ($i > -1) {
        push @nl, (XML::LibXML::Text->new(substr($text,0,$i)));
        push @nl, ($celxml->createElement('tld'));
        push @nl, (XML::LibXML::Text->new(substr($text,$i+length($rad))));
        return @nl;
    }
    return;
}


sub anst_ref_art {
    my $art = shift;

    my $xml = process::read_file($art);
    my $chg = 0;

    my $i = index($xml,$origmrk); 

    if ($i > 0) {     
        print "...anstataŭigu ref@cel en $art...?\n" if ($verbose);

        my $omrk = $origmrk;
        $omrk =~ s/\./\\./g;

        # apliku anstataŭigojn
        $chg += ($xml =~ s/cel\s*=\s*['"]$omrk["']/cel="$novmrk"/g);

        if ($chg) {
            skribu_art($art,$xml);
        }
    }
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

# aldonu pliajn XML-nodojn post la donita
sub insert_after {
    my $node = shift;
    my @novaj = @_;

    my $p = $node->parentNode;
    for $n (reverse @novaj) {
        $p->insertAfter($n,$node);
    }
}
