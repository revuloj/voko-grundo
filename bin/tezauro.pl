#!/usr/local/bin/perl -w
#
# voku 
#   tezauro.pl [-v] [<config-file>]
#
# ekz. 
#   tezauro.pl -v vortaro.cfg
#
################# komenco de la programo ################

use XML::Parser;

use lib "$ENV{'VOKO'}/bin";
use vokolib;

$debug = 0;
$show_progress = 0;
$| = 1;

$tez_lim = 10; # gravaj nodoj havu alemenau tiom da c*h (= eroj*alteco)
@romiaj = ('0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII');
$maks_novaj_dosieroj = 1000;

# analizi la argumentojn

while (@ARGV) {
    if ($ARGV[0] eq '-v') {
	$verbose = 1;
	shift @ARGV;
    } else {
	$cfg_file = shift @ARGV;
    };
};

# legu la agordo-dosieron
unless ($cfg_file) { $cfg_file = "cfg/vortaro.cfg" };

%config = read_cfg($cfg_file);
%fakoj = read_xml_cfg($config{'fakoj'},'fako','kodo');
delete $fakoj{'KOMUNE'}; # ne estas vera fako

$revo_baz=$config{"vortaro_pado"};
$fx_prefix = "$revo_baz/tez/fxs_";
$tz_prefix = "$revo_baz/tez/tz_";
$tmp_file = '/tmp/'.$$.'voko.inx';
$ref_pref='../art';

$tezfak=$config{"tezauro_fakoj"};
$tezrad=$config{"tezauro_radikoj"};
$dos=$config{"rilato_dosiero"};

%smb = ('vid' => '&#x2192;',
	'sin' => '&#x21d2;',
	'ant' => '&#x21cf;',
	'sub' => '&#x2199;', #'&#x2283;',
	'super' => '&#x2197;', #'&#x2282;',
	'prt' => '&#x2199;', #'&#x220b;',
	'malprt' => '&#x2197;', #'&#2208;',
	'dif' => '=',
	'ekz' => '-',
	'*listo' => '&#x2199;');

%img = ('vid' => 'vid.gif',
	'sin' => 'sin.gif',
	'ant' => 'ant.gif',
	'sub' => 'sub.gif', 
	'super' => 'super.gif',
	'prt' => 'sub.gif',
	'malprt' => 'super.gif',
	'dif' => 'dif.gif',
	'ekz' => 'ekz.gif',
	'*listo' => 'sub.gif');

die "Ne ekzistas dosierujo \"$dos\""
  unless -f $dos;

# analizo de la XML-dosiero kun iuj informoj pri rilatoj ktp.
print "Analizas \"$dos\"...\n" if ($verbose);

my $parser = new XML::Parser(ParseParamEnt => 1,
			     ErrorContext => 2,
			     Handlers => {
				 Start => \&start_handler,
				 End   => \&end_handler,
				 Char  => \&char_handler}
			     );

eval { $parser->parsefile("$dos") }; 
die "$dos: $@\n" if ($@); # estas pli bone morti ol kripligi la tezauron!
print "\n";

# nun chiuj senco-nodoj estas en nodlisto %wordlist
# plektu nun reton el la nodoj, kompletigante la referencojn ambaudirekte

make_net();

# elkalkuli altecojn kaj ero-nombrojn

cnt_and_depth();
#dump_cnt_dep();

# faru la fakindeksojn kaj noddosierojn

$file_cnt = 0;
create_tz();
create_fx();

# kiom da dosieroj renovighis
print "$file_cnt novaj au shanghitaj dosieroj\n";
print "Pliaj ne estas renovigataj pro limigo je $maks_novaj_dosieroj.\n" 
    if ($file_cnt == $maks_novaj_dosieroj);

if ($debug) {
    print "\n";
    start_loop();
}

################## traktantoj de XML-analiz-eventoj ################
 
sub char_handler {
    my ($xp, $text) = @_;

    if  ($text = $xp->xml_escape($text)) {
	$kap .= $text if ($xp->in_element('kap') or $xp->in_element('tez'));
	$uzo .= $text if ($xp->in_element('uzo'));
    }
} 

sub start_handler {
    my ($xp,$el,@attrs) = @_;
    my $attr;

    if ($el eq 'art') 
    {

	print '.' if ($show_progress);
	print "\n" if ($show_progress and ($art_no++ % 80 == 0));

	$art = create_node(get_attr('mrk',@attrs));
	$cnt_subart = 0; # rekomencu nombradon de "subart"
    }
    elsif ($el eq 'subart')
    {
	++($cnt_subart);
	$cnt_subart_snc = 0; # rekomencu nombradon de "snc"
    }
    elsif ($el eq 'drv') 
    {
	$drv = create_node(get_attr('mrk',@attrs));
	$cnt_drv_snc = 0; # rekomencu nombradon de "snc"
    }
    elsif ($el eq 'snc') 
    {
	my ($mrk,$kap);
	# snc ene de drv
	if ($xp->in_element('drv')) {
	    ++$cnt_drv_snc;
	    unless ($mrk = get_attr('mrk',@attrs)) {
		# se senco ne havas markon kreu ghin el drv-kapvorto + snc-numero
		$mrk = $drv->{'mrk'}.".$cnt_drv_snc";
	    };
	    $kap = $drv->{'kap'}." $cnt_drv_snc";
	# snc ene de subart
	} elsif ($xp->in_element('subart')) {
	    ++$cnt_subart_snc;
	    unless ($mrk = get_attr('mrk',@attrs)) {
		$mrk = $art->{'mrk'}.".$romiaj[$cnt_subart].$cnt_subart_snc";
	    }
	    $kap = $art->{'kap'}." $romiaj[$cnt_subart] $cnt_subart_snc";
	# snc ene de nek drv nek subart, tio ne estas traktata ghis nun
	} else {
	    warn "KOREKTU PROGRAMON: Senco nek ene de drv nek ene de subart".
		" ($art->{'kap'})!\n";
	}
	if ($mrk =~ /^[a-z]/i) {
	    $snc = create_node($mrk);
	    $snc->{'kap'} = $kap;
	    $cnt_snc_subsnc = 0; # rekomencu nombradon de "subsnc"
	} else {
	    warn "ERARO: mrk ne komencighas je litero en $art->{'mrk'}\n";
	}
    }
    elsif ($el eq 'subsnc') 
    {
	my $mrk;
	$cnt_snc_subsnc++;
	unless ($mrk = get_attr('mrk',@attrs)) {
	    # kreu markon
	    $mrk = $snc->{'mrk'}.".".chr(ord('a')+$cnt_snc_subsnc-1);
	};
	$subsnc = create_node($mrk);
	$subsnc->{'kap'} = $snc->{'kap'}.chr(ord('a')+$cnt_snc_subsnc-1);
    }
    elsif ($el eq 'tez')
    {
	$tez = create_node(get_attr('mrk',@attrs));
	$tez->{'nodspc'} = (get_attr('tip',@attrs) eq 'listo')? 'lst':'kap';
	$kap = '';
	my ($tip,$cel);
	# "tez" povas referenci mem al supernocio
	if ($cel = get_attr('cel',@attrs)) {
	    $tip = get_attr('tip',@attrs);
	    # se mankas tipindiko, uzu "vid"
	    $tip = 'vid' unless ($tip =~ /^super|malprt|listo$/);
	    push @{$tez->{$tip}}, ($cel);
	}
    }
    elsif ($el eq 'ref')
    {
	my $tip = get_attr('tip',@attrs);
	# se mankas tipindiko, uzu "vid"
	$tip = 'vid' unless ($tip =~ /^dif|sin|ant|sub|super|prt|malprt|ekz|lst$/);
	unless ($xp->current_element() =~ /^art|drv|snc|subsnc$/) {
	    warn "KOREKTU: <ref> ene de <".$xp->current_element().
		"> ne estas traktata ($art->{'mrk'})!\n";
	    return;
	}
	# aldonu la referencon al la nuna nodo (variablonomo = nuna XML-strukturilo)
	push @{${$xp->current_element()}->{$tip}}, (get_attr('cel',@attrs));
    }
    elsif ($el eq 'tezrad') {
	if ($fak = get_attr('fak',@attrs)) {
	    ${$xp->current_element()}->{'tezrad'} = $fak;
        } else {
	    ${$xp->current_element()}->{'tezrad'} = 1;
        }
    }
    elsif ($el eq 'uzo') 
    {
	$uzo = '';
    }
    elsif ($el eq 'kap') 
    {
	$kap = '';
    }
}

sub end_handler {
    my ($xp, $el) = @_;

    if ($el eq 'kap') 
    {
	$kap =~ s/^\s+//; $kap =~ s/\s+$//; 
	$kap =~ s/\s+/ /g;
	unless ($xp->current_element() =~ /^art|drv$/) {
	    warn "KOREKTU: </kap> ene de <".$xp->current_element().
		"> ne estas traktata ($art->{'mrk'})!\n";
	    return;
	}
	${$xp->current_element()}->{'kap'} = $kap;
    }
    elsif ($el eq 'uzo') 
    {
	unless ($xp->current_element() =~ /^art|drv|snc|subsnc$/) {
	    warn "KOREKTU: </uzo> ene de <".$xp->current_element().
		"> ne estas traktata ($art->{'mrk'})!\n";
	    return;
	}
	push @{${$xp->current_element()}->{'uzo'}}, ($uzo);
    }
    elsif ($el =~ /^art|drv|snc|subsnc$/)
    {
	# aldonu nodon al la nodlisto
	my $node = ${$el};
	$wordlist{$node->{'mrk'}} = $node;
    }
    elsif ($el eq 'tez') 
    {
	$tez->{'kap'} = $kap;
        $wordlist{$tez->{'mrk'}} = $tez;
    }

    # se temas pri nur unu snc, metu ties informojn en drv
    if (($el eq 'drv') and ($cnt_drv_snc == 1)) {
	merge_nodes($drv,$snc);
        # memoru la kunigon de la du nodoj, por poste povi alidirekti
        # referencojn de la snc al la drv
	$kunigitaj{$snc->{'mrk'}}=$drv->{'mrk'};
    }
}

sub get_attr {
    my($attr_name,@attr_list)=@_;

    while (@attr_list) {
        if (shift @attr_list eq $attr_name) { 
	    return shift @attr_list 
	    };
    };
    return ''; # atributo ne trovita;
};           

sub create_node {
    my %node;
    $node{'mrk'} = shift;
    $node{'nodspc'} = 'kap'; # apriore
    return \%node;
}

sub merge_nodes {
    my ($to,$from) = @_;

    # kopiu chion krom "mrk" kaj "kap"
    foreach $a (keys %$from) {
	unless ($a =~ /^mrk|kap|tezrad$/) {
	    push @{$to->{$a}}, @{$from->{$a}};
	} elsif ($a eq "tezrad") {
	    $to->{$a} = $from->{$a};
	}
    }

    # forigu la nodon $from
    delete $wordlist{$from->{'mrk'}}
}


#################### plektado de la vortreto ##################

sub make_net {

    my $mrk;
    my $node;

    # trakuras %wordlist kaj faras chiujn referencojn duflanke
    # krome shanghas la referencojn de nerektaj signovicoj 
    # al rektaj memormontriloj pro pli granda rapideco

    while (($mrk,$node) = each %wordlist) {
	# montru progreson
	print '+' if ($show_progress);
	print "\n" if ($show_progress and ($art_no++ % 80 == 0));
	print "$mrk\n" if ($debug);

	make_refs($node,'sin','dif'); # 'dif' alidirekte estu 'sin'!
	make_refs($node,'sin','sin');
	make_refs($node,'ant','ant');
	make_refs($node,'vid','vid'); 
	make_refs($node,'sub','super');
	make_refs($node,'super','sub');
	make_refs($node,'prt','malprt');
	make_refs($node,'malprt','prt');
	make_refs($node,'ekz','lst');
	make_refs($node,'lst','ekz');
	make_refs($node,'*listo','listo');
	make_refs($node,'listo','*listo');
    }
    print "\n" if ($show_progress);
}

sub make_refs {
    my ($node,$to_reftype,$from_reftype) = @_;

    # se la kampo ne preparighis, difinu ghin kiel malplena
    # por ne devi chiam pridemandi poste, chu ghi estas difinita
    unless ($node->{$from_reftype}) {
	$node->{$from_reftype} = [];
	return;
    }
    my $refs = $node->{$from_reftype};

    for ($i = 0; $i < scalar @$refs; $i++) { 

	my $word = @$refs->[$i];

	# se ne temas pri nodreferenco, kreu ghin serchante la nodon kun mrk
	# en %wordlist kaj aldonu referencon al $node en chiu el la referencitaj
	# nodoj
	unless (ref($word) eq "HASH") {
	    
	    # la referencita vorto
	    my $referenced_node = $wordlist{$word};
	    
	    # eble estas snc kunigita kun drv
	    unless ($referenced_node) {
		my $r = $kunigitaj{$word};
		$referenced_node = $wordlist{$r} if ($r);
	    }
		
	    # se ankorau ne trovita, la vorto shajne ne ekzistas
	    unless ($referenced_node) {
		warn "\nAVERTO: \"$word\" ne ekzistas ".
		    "(referencita en ".$node->{'mrk'}.").\n";
		splice @$refs, $i, 1; $i--; # forigu neekzistantan referencon
		next;
	    }
	    
	    # eventuale en la listo $reftype_to de la referencita nodo, 
	    # aldonu $node, se ghi ne jam estas listigita tie
	    unless (map { 
		(ref($_) eq "HASH" ? $node == $_ : $node->{'mrk'} eq $_)?
		  1:() 
		  }
		    @{$referenced_node->{$to_reftype}}) 
		{
		    push @{$referenced_node->{$to_reftype}}, ($node);
		}

	    # anstatauigu la signovicon "word" per montrilo al ghi
	    @$refs->[$i] = $referenced_node;
	}
    }
}

# indikas che chiu nodo la nombron de eroj kaj la
# altecon (maksimuma distanco al folia nodo)
# por tio la algoritmo eltrovas por chiu nodo
# la patrajn nodojn kaj donas al ili poenton (por si mem)
# krome ghi indikas che chiu gepatro la distancon al si
# mem, se tiu estas pli granda ol la ghisnuna maksimuma
# tiea distanco

sub cnt_and_depth {
    my ($mrk,$node);

    print "XXXXXxx cnt_and_depth XXXXXXX\n" if ($debug);

    while (($mrk,$node) = each %wordlist) {
       
	# se c kaj h ne jam difinita metu 0
	$node->{'c'} = 0 unless ($node->{'c'}); 
	$node->{'h'} = 0 unless ($node->{'h'});

	# notu chiujn patrojn kune kun distanco de tie chi
	# se iu okazas plurfoje notu la pli grandan distancon
	# cirklo perfidighas, se mi mem aperas kiel supernocio

	my $dist = 1;
	my @prnts1 = (@{$node->{'super'}},@{$node->{'malprt'}});
	my %all_parents = ();

	while (@prnts1) {

	    my @prnts2 = ();

	    print "------------------\n" if ($debug);

	    for $n (@prnts1) {

		print "$mrk - ".$n->{'mrk'}."\n" if ($debug);

		# ekskludu cirklojn
		if ($n == $node) {
		    warn "FIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
			."! Estas cirklo inter \"$mrk\" kaj "
			.$n->{'mrk'}."\"\n";
		    #next;
		    die; # provizore mortu, char en unu okazo la programo
		         # ne finighis, do shajne ie tamen ghenas la cirklo
		}
                # se ne jam en la listo, traktu ankau ties patrojn
		#if (not exist $all_parents{$n}) {
		push @prnts2,(@{$n->{'super'}},@{$n->{'malprt'}});

		if ($debug) {
		    print "malidoj de $mrk: ";
		    map {print $_->{'mrk'}." "} @prnts2;
		    print "\n";
		}
		
		if (grep {$_==$n} (@{$n->{'super'}},@{$n->{'malprt'}})) {
		    warn "FIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
			."! Estas cirklo che la patroj de "
			    .$n->{'mrk'}."\"\n";
		    #die; # provizore mortu, char en unu okazo la programo
		    # ne finighas
		}    

		#}
		# memoru la distancon inter $node kaj $n
		# (se $n plurfoje aperas kiel antauulo, la plej granda
		# distanco memorighas)
		$all_parents{$n->{'mrk'}} = $dist;

	    }

	    # sekva shtupo
	    $dist++;
	    @prnts1 = @prnts2;
	}

	# nun ni havas chiujn antuulojn de $node kun la distancoj
	# lau tio ni povas aktualigi ties altecon kaj
	# plialtigi ero-nombron je 1
	while (($mrk,$d) = each %all_parents) {

	    my $n = $wordlist{$mrk};

	    # se c kaj h ne jam difinita metu 0
	    $n->{'c'} = 0 unless ($n->{'c'}); 
	    $n->{'h'} = 0 unless ($n->{'h'});

	    if ($n->{'h'} < $d) { 
		$n->{'h'} = $d; # altigu altecon
	    }
	    $n->{'c'}++;        # altigu ero-nombron je unu
	}
    }
}

# por kontrolo: eligu altecojn kaj eronombrojn de la nodoj
sub dump_cnt_dep {
    my @root = sort {$a->{'mrk'} cmp $b->{'mrk'}} root([values %wordlist]);

    for $n (@root) {
	print $n->{'mrk'}.": ".$n->{'h'}.", ".$n->{'c'}."\n";
    }
    
}

sub fakroot {
    my ($list,$fako) = @_;
    my @root = ();
    my $node;

    foreach $node (@$list) {

	if ((in_list($fako,$node->{'uzo'}) and # vorto apartenas al fako
	    not (map {  # ne trovighas supernocio de l' fako
		in_list($fako,$_->{'uzo'})?1:()
		} @{$node->{'super'}}) and
	    not (map {  # ne trovighas ujonocio de l' fako
		in_list($fako,$_->{'uzo'})?1:()
		} @{$node->{'malprt'}}) and
	    ( @{$node->{'sub'}} or # vorto havas subnociojn, do ne estas izolita
	      @{$node->{'prt'}} )) 
	    # au la vorto estas markita kiel radiko
	    or ($node->{'tezrad'} and ($node->{'tezrad'} eq $fako))) 
	{
	    push @root,($node);
	};
    }

    return @root;
}

sub root {
    my $list = shift;
    my @root = ();
    my $node;

    foreach $node (@$list) {

	print "$node->{'mrk'}\n" if ($node->{'tezrad'});

	if ((not @{$node->{'super'}} and # vorto ne havas supernociojn
	    not @{$node->{'malprt'}} and
		( @{$node->{'sub'}} or # vorto havas subnociojn, do ne izolita
		  @{$node->{'prt'}}
		  )
	     # au la vorto estas markita kiel radiko
	    ) or ($node->{'tezrad'} and ($node->{'tezrad'} eq 1))) 
	{
	    push @root,($node);
	    print "--tezrad--\n" if ($node->{'tezrad'});
	};
    }

    return @root;
}

sub in_list {
    my $what=shift;
    my $list=shift;

    return (map {$_ eq $what? 1:()} @$list);
}

#################### HTML-eligo de la tezauro ############
	

sub html_tree {
    my $list = shift;
#    my $depth = shift; $depth++;
#    local @subs = ();
    my $node;

           # iam rekte prilaboru la vortliston kaj ne transdonu
           # kiel argumento $list.

    sub ero {
	my $list = shift;
	my $tip = shift;

	for $v ( sort {$a->{'mrk'} cmp $b->{'mrk'}} @$list ) {
	
	    print
		"<a href=\"".tez_link($v)."\">",
		"<img src=\"../smb/$img{$tip}\" alt=\"$smb{$tip}\" border=0>",
		"</a>\n";
	    if ($v->{'h'}*$v->{'c'}>$tez_lim) { print "<b>"; }
	    print
		"<a href=\"".word_ref($v)."\" target=\"precipa\">",
		$v->{'kap'}."</a>";
	    if ($v->{'h'}*$v->{'c'}>$tez_lim) { print "</b>"; }
	    print "\n<br>\n";
	    
#	    unless ($tip eq 'super' or $tip eq 'malprt'
#		    or $tz_files{tez_file($v)}) {
#		push @subs, ($v);
#	    }
	    
	}
	print "<p>\n";
    }

#    return unless (@$list);

    foreach $node (@$list) { 
	
	if (@{$node->{'super'}} or @{$node->{'malprt'}} or
	    @{$node->{'sub'}} or @{$node->{'prt'}} or
	    @{$node->{'dif'}} or @{$node->{'sin'}} or
	    @{$node->{'ant'}} or @{$node->{'vid'}} or
	    @{$node->{'ekz'}}) {

#	@subs = ();

	    my $word_mrk = $node->{'mrk'};
	    my $target_file = tez_file($node);

	    #print "$target_file..." if ($verbose);
	    $tz_files{$target_file} = 1;
	    
	    if ($file_cnt < $maks_novaj_dosieroj) {
		open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
		select OUT;
	
		index_header("tezaŭro: ".$node->{'kap'});
		index_buttons('eo');
		
		print "<p>\n";
		if ($node->{'uzo'}) {
		    for $fak (sort @{$node->{'uzo'}}) {
			# eble testu antaue, chu la fako havas tezauran indekson
			print "<a href=\"fxs_".uc($fak).".html\">";
			print "<img src=\"../smb/$fak.gif\" alt=\"$fak\" border=0>";
			print "</a>\n";
		    }
		    # print "<p>\n";
		}
		
		# la vorto
		print "<h1><a href=\"".word_ref($node)."\" target=\"precipa\">";
		print $node->{'kap'};
		print "</a></h1>\n";
		
		if ($node->{'nodspc'} eq 'kap') {
		    
		    # la supernocioj
		    if (@{$node->{'super'}}) {
			print "<i class=griza>speco de</i><br>\n";
			ero($node->{'super'},'super');
		    }
		    
		    # la tutoj
		    if (@{$node->{'malprt'}}) {
			print "<i class=griza>parto de</i><br>\n";
			ero($node->{'malprt'},'malprt');
		    }
		    
		    # la difino
		    if (@{$node->{'dif'}}) {
			print "<i class=griza>difinito</i><br>\n";
			ero($node->{'dif'},'dif');
		    } 
		    
		    
		    # la sinonimoj
		    if (@{$node->{'sin'}}) {
			print "<i class=griza>sinonimoj</i><br>\n";
			ero($node->{'sin'},'sin');
		    } 
		    
		    # la antonimoj
		    if (@{$node->{'ant'}}) {
			print "<i class=griza>antonimoj</i><br>\n";
			ero($node->{'ant'},'ant');
		    }
		    
		    # la subnocioj
		    if (@{$node->{'sub'}}) {
			print "<i class=griza>specoj</i><br>\n";
			ero($node->{'sub'},'sub');
		    }
		    
		    # la partoj
		    if (@{$node->{'prt'}}) {
			print "<i class=griza>partoj</i><br>\n";
			ero($node->{'prt'},'prt');
		    }
		    
		    # listoj
		    if (@{$node->{'*listo'}}) {
			print "<i class=griza>listoj</i><br>\n";
			ero($node->{'*listo'},'*listo');
		    }

		    # vidu ankau
		    if (@{$node->{'vid'}}) {
			print "<i class=griza>vidu</i><br>\n";
			ero($node->{'vid'},'vid');
		    }
		} else {
		    # la listeroj
		    if (@{$node->{'ekz'}}) {
			#print "<i class=griza>speco de</i><br>\n";
			ero($node->{'ekz'},'ekz');
		    }
		}
		
		index_footer();
		
		close OUT;
		select STDOUT;

		$file_cnt += diff_mv($tmp_file,$target_file,$verbose);
	    };
	};

	
	# tezauro-dosieroj por la subnocioj
#	warn "$depth: ".$node->{'mrk'}."(".$node->{'h'}.")\n";
#join(',',map {%{$_}->{'mrk'}."(".%{$_}->{'h'}.")"} @subs)."\n";
#	html_tree(\@subs, $depth);
    }
}

sub ekzistas_referencoj {
    my $word = shift;

    return @{$word->{'sin'}} or @{$word->{'ant'}} or @{$word->{'vid'}}
    or @{$word->{'sub'}} or @{$word->{'prt'}}
}

sub word_ref {
    my $node = shift;
    my $ref;

    if ($node->{'mrk'} =~ /^([^.]+)(\..*)?$/) {
	$ref = "$ref_pref/$1.html"; $ref .= "#$1$2" if ($2);
    } else {
	warn "Mankas atributo mrk: ".$node->{'mrk'}.", ".$node->{'kap'}."\n";
	$ref = "$ref_pref/eraro.html";
    }
    return $ref;
}

sub tez_file {
    my $node = shift;
    
    my $mrk = $node->{'mrk'};
    $mrk =~ tr/./_/;
    return "$tz_prefix".$mrk.".html";
}

sub tez_link {
    my $node = shift;
    
    my $mrk = $node->{'mrk'};
    $mrk =~ tr/./_/;
    return "tz_$mrk.html";
}

sub create_fx {
    foreach $fako (sort keys %fakoj) {

	my $target_file = "$fx_prefix".uc($fako).".html";
	#print "$target_file..." if ($verbose);

	my @root = fakroot([values %wordlist],$fako);
	unless (@root) {
	    #print "neniuj radikaj nocioj\n"
	    #	if ($verbose);
	    unlink "$target_file";
	    next;
	}
	print STDERR join(' ',map {$_->{'mrk'}} @root), "\n" if ($debug);
	push @uzataj_fakoj, ($fako);

	open OUT,">$tmp_file" or die "Ne povis krei $tmp_file: $!\n";
	select OUT;

	index_header($fako);
	index_buttons('fak');
	print
	    "<a href=\"../inx/fx_".uc($fako).".html\">alfabete</a> ",
	    "<b>strukture</b>\n<h1>$fakoj{$fako} strukture...</h1>\n";

	my $node;
	foreach $node ( sort {$a->{'mrk'} cmp $b->{'mrk'}} @root ) {
	    print 
		"<a href=\"".tez_link($node)."\">",
		"<img src=\"../smb/vid.gif\"   alt=\"".$smb{'vid'}."\" border=0></a>\n";
	    
	    if ($node->{'h'}*$node->{'c'}>$tez_lim) { print "<b>"; }
	    print
	        "<a href=\"".word_ref($node)."\" target=\"precipa\">",
	        $node->{'kap'}."</a>";
		#" (".($node->{'h'}*$node->{'c'}).")";
	    if ($node->{'h'}*$node->{'c'}>$tez_lim) { print "</b>"; }
	    print "<br>\n";
	}

	index_footer();

	close OUT;
	select STDOUT;
	diff_mv($tmp_file,$target_file,$verbose);
    }

    # kreu la liston de chiuj fakoj kun strukturaj indeksoj
    print "$tezfak...\n" if ($verbose);

    open OUT,">$tezfak" or die "Ne povis krei $tezfak: $!\n";
    select OUT;

    foreach $fako (sort @uzataj_fakoj) { 
	print "../tez/fxs_".uc($fako).".html;$fako\n"; 
    }
    close OUT;
    select STDOUT;
}

sub create_tz {
    my @root = sort {$a->{'mrk'} cmp $b->{'mrk'}} root([values %wordlist]);
#    print STDERR join(' ',map {$_->{'mrk'}} @root), "\n" if ($debug);
    
#    unless (@root) {
#	print "neniuj radikaj nocioj\n"
#	    if ($verbose);
#	exit;
#    }
 
    html_tree([values %wordlist]);
####
    # forigu chiujn dosierojn ne plu aktualajn
    foreach $file (glob("$tz_prefix*")) {
	unless ($tz_files{$file}) {
	    print "forigas $file\n";
	    unlink($file);
	}
    }

    # kreu la liston de chiuj tezauraj radikoj
    print "$tezrad...\n" if ($verbose);

    open OUT,">$tezrad" or die "Ne povis krei $tezrad: $!\n";
    select OUT;

    foreach $word (@root) {
	my $word_mrk = $word->{'mrk'};

	unless ($word->{'tezrad'}) {
	    warn "AVERTO: $word_mrk estas radiko, sed ne havas ".
		 "indikon <tezrad/>\n";
	} else {
	    if ($word->{'tezrad'} eq 1) {
		$word_mrk =~ tr/./_/;
		print "../tez/tz_".$word_mrk.".html;".$word->{'kap'}.";"
		    .($word->{'h'}*$word->{'c'})." \n";
	    }
	}
    }
    close OUT;
    select STDOUT;
}


################### sencimigaj funkcioj ###############

sub start_loop {

    while (1) {
	print ">";
	my $mrk = <STDIN>;

#	print "\n",join(', ',%{$wordlist{$mrk}}),"\n";

	print eval $mrk;
    }
}

sub match {
    my $what=shift;

    print join(' ',grep /^$what/, (keys %wordlist)), "\n";
    
}

sub show {
    my $what=shift;
    
    my $node = $wordlist{$what};
    
    unless ($node) {
	print "ne difinita\n";
	return;
    }

    foreach $key (keys %$node) {
	if (ref($node->{$key}) eq "SCALAR") {
	    print "$key: ", $node->{$key}, "\n";
	} elsif (ref($node->{$key}) eq "ARRAY") {
	    print "$key: ", join(' ',@{$node->{$key}}), "\n";
	} else {
	    print "$key: ", $node->{$key}, "\n";
	}
    }
}

#################################################







