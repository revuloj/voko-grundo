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

# enlegu la originan kaj la celan artikolojn
my $origart = mrk_art($origmrk);
my $origxml = XML::LibXML->load_xml(location => $origart, expand_entities=>0, keep_blanks=>1);
my $origrad = art_radikoj($origxml);

my $celart = mrk_art($celmrk);
my $celxml = XML::LibXML->load_xml(location => $celart, expand_entities=>0, keep_blanks=>1);
my $celrad = art_radikoj($celxml);

# forigu la derivaĵon el la originala artikolo
my $drv = forigu_drv();

# se tio funkciis, skribu la rezulton kaj enŝovu en la celan artikolon
if ($drv) {
    
    skribu_art($origart,$origxml);

    # adaptu la XML de la derivaĵo kaj enmetu en la nvoan artikolon
    my $novdrv = adaptu_drv($drv);  

#aldonu_drv($celart,$celmrk);
#adaptu_refjn($origmrk,$celmrk?);
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

    print "...$shanghoj\n" if ($verbose);
}    


# trovu kaj forigu la derivaĵon en la originala artikol,
# kiel rezulto ni ricevas la XML-strukturon de la derivaĵo
sub forigu_drv {

    # ni reskribos ĉion al la sama artikolo, kiam ni
    # uzas git-versiadon!
    my $artout = $origart; #.".out";

    print "### ",uc($origart)," ###\n";

    # trovu drv@mrk, forigu ĝin...
    my $drv_xpath = XML::LibXML::XPathExpression
      ->new(".//drv[\@mrk='$origmrk']");
    my $drv = $origxml->findnodes($drv_xpath)->[0];

    if ($drv) {
      $drv->unbindNode();
      return $drv;
    }
}



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
