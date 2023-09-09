#!/usr/bin/perl
# elprenas certajn artikolojn el la piv-tekstoj
# laý vortlisto (listo de liniokomencoj)
# aý numerolisto (numeroj de la artikoloj laývice)

# voku: perl piv_extr.pl listo fontdosieroj > celdosiero

$listdos = shift @ARGV;

open LST, $listdos or die "Ne povis legi $listdos.\n";
chomp(@listo = <LST>);
close LST; 
$n = 0;

DIFINOJ();
TRALABORU();

sub TRALABORU {
    my $romia_cifero = '(?:<P>)?\s*(?:<B>)?\s*[IVX]{1,4}\-\s*(?:<P>)?';
    my $majusklo = '(?:<B>)?[A-F](?:<P>)?\)';
    my @linioj;   
    my $art;
 
    # legu la unuan linion
    $line = <>;

    while ($line) {

	@linioj = ($line);
 	# legu la sekvajn liniojn ghis ili ne plu komencighas je romia cifero
	$line = <>;
	while ($line =~ /^$romia_cifero|^$derivajho1|^$majusklo/) {
	    @linioj = (@linioj,$line);
	    $line = <>;
	};
        $n++;
        # testu la legitan artikolon
        $art = join('',@linioj);
        @found = grep($_ == $n,@listo) || grep($art =~ /^$_/,@listo); 
        if (@found) {
	    print @linioj;
        };
  };
};

sub DIFINOJ {
    # helpvariabloj por pli facile formuli la signochenojn
    my $stel = '(STEL)?';
    my $mallong = '[A-Za-z][\.] ?[A-Za-z]';
    my $vort = '[a-zA-Z\- ]+';
    my $vort_au_mallong = '('.$vort.'|'.$mallong.')';
    my $p = '(?:<P>)'; my $p_ = $p.'?';
    my $b = '(?:<B>)'; my $b_ = $b.'?';
    my $i = '(?:<I>)'; my $i_ = $i.'?';
    my $maj = '[A-Z]'; my $min = '[a-z]';
    my $dfn = '([^<].*?\:?)'; # difino ne komencighu per <

    $fako = 
	'2MAN|AGR|ANA|ARKE|ARKI|AST|AUT|AVI|BAK|BELA|BELE|BIB|BIO|BOT|BUD|'.
	'ELE|EKON|EKOL|ELET|FAR|FER|FIL|FIZL|FIZ|FON|FOT|'.
	'GEOD|GEOG|GEOM|GEOL|GRA|HER|HIS|HOR|ISL|JUR|'.
	'KAT|KEM|KIN|KIR|KOME|KOMP|KON|KRI|KUI|LIN|'.
	'MAR|MAS|MAT|MAH|MED|MET|MIL|MIN|MIT|MUZ|NEO|'.
	'PAL|POE|POL|PRA|PSI|RAD|REL|SCI|SPO|STA|SHI|'.
	'TEA|TEK|TEKS|TEL|TIP|TRA|ZOO';

    $fakoj = '(?:\s*(?:'.$fako.')\s+)+';
    $ntr = '\(n?tr\)';
    $radikfonto = '(\/|<\+>[1-9l]<P>)?';
    $fino = '(oj|[oaie]|!)?';
    $zamenhof = '(?:<\+>\s?([ZBGKXN])\s?(?:<P>)?)?';
    # kapvorto konsistas el radiko+fontindiko+finajho
    # $1 = radiko, $2 = radikfonto, $3 = $finajho, $4 = Zamenhof
    # (?:...) estas grupo ne ligota al variablo $n
                                  # " " kaj \. aldonita, espereble ne prbl.
                                  # mallongigo aldonita
                                  # kapvorto nun devas fini je \. au " "
    $kapvorto = $stel.$b.$vort_au_mallong.$p_.$radikfonto.$b_.$fino.$p_
	.$zamenhof.'[\. ]?\s?';
    # derivajho konsistas el grasaj "iuj literoj" + "~" + "iuj literoj"
    # $1 = antau tildo, $2 = post tildo, $3 = zamenh, $4 = resto
    $derivsekv = '(?=\s*'.$maj.'|\.|'.$ntr.'|=|'.$b_.'1|'.$fako.')';
    $dertild = '([A-Z]?[a-z !]*)~([a-z ,~!]*)'.$p_.$radikfonto.$b_.$fino;
    $dertild1 = '[A-Z]?[a-z ]*~[a-z ,~]*'.$p_.$radikfonto.$b_.$fino;
    $derivajho = $stel.$b.$dertild.$p_.$zamenhof.'\s*'.$b_.$derivsekv;
    $derivajho1 = $stel.$b.$dertild1.$p_.$zamenhof.'\s*'.$b_.$derivsekv;
    # sencoj komencighas per grasa cifero
    $senco = $b.'\s*([1-9][1-9]?)\s*'.$p_;
    # subsencoj komencighas per grasa a), sed povas okazi,
    # ke la grasigsigno jam estas antau la sencocifero
    $subsnc_a = '(?=\s*'.$b_.'a'.$p_.'\)'.$p_.')';
    $subsncgrp_A = '(?=\s*'.$b_.'A'.$p_.'\)'.$p_.')';
    $sencdif = $dfn.$subsnc_a;
    $sencsubgrpdif = $dfn.$subsncgrp_A;
    $difino = $dfn.'(?=SAG|MAN|RIM|$)';
    $sencgrpdif = $dfn.'(?='.$senco.')';
    my $oblikv_ref = '<I>.*?<P>(?:\,\s*<I>.*?<P>)*';
    $referenco = '(SAG|MAN)\s*((?:'.$oblikv_ref.'|[a-z\s,0-9]*)\.?)';
    $refnombro = '(\s*<I>[0-9]+<P>\s*)?';
    $difinref = '(^\s*|;\s*)='.$p_.'\s*'.$b_.'([a-z]+)'
      .$p_.'\s*'.$refnombro.'\s*([\(\.,]|$)';
    $ekzemplo = $i.'(.*?)'.$p;
    $ekzfonto = '<\+>\s*([ZBGKXN])\s*<P>';
    $klarigo = '(\(.*?\))';
    $rimarko = 'RIM'.$b_.'[\.\s]'.$p_.'\s*([1-9])?\s*(.*?)';
    $tildo = '(\w*)~(\w*)';
}


