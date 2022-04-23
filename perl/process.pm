#!/usr/bin/perl

# (c) 1999 - 2021 ĉe Wolfram Diestel
# laŭ GPL 2.0

use strict;

package process;

use JSON;
my $json_parser = JSON->new->allow_nonref;
#$json_parser->allow_tags(true);

use Text::CSV;
use Encode;

my $loglevel = 'info';

#use File::Tempdir;
#my $tmpdir = File::Tempdir->new();
#my $tmp = $tmpdir->name;

my $dict_home    = $ENV{"HOME"}; # por testi: $ENV{'PWD'};
my $dict_base    = "$dict_home/dict"; # xml, dok, dtd
my $tmp          = "$dict_base/tmp";
my $xml_temp     = "$tmp/xml";

# my $git          = '/usr/bin/git';
my $git_dir      = "$dict_base/revo-fonto";


# preparu protokolon
use Log::Dispatch;
my $log = Log::Dispatch->new(
    outputs => [
        #[ 'File',   min_level => 'debug', filename => 'logfile' ],
        [ 'Screen', min_level => $loglevel ],
    ],
);

my $xmlcheck     = '/usr/bin/rxp -V -s';


# forigu spacojn komence kaj fine de signoĉeno
sub trim { my $s = shift; $s =~ s/^\s+|\s+$//g; return $s };

################ helpfukcioj por legi kaj skribi dosierojn ##############

# legi dosieron
sub read_file {
	my $file = shift;
	unless (open FILE, $file) {
		$log->warn("Ne povis malfermi '$file': $!\n"); return;
	}
	my $text = join('',<FILE>);
	close FILE;
	return $text;
}


# skribi dosieron
sub write_file {
	my ($mode, $file, $text) = @_;

    $log->debug("Skribas ".length($text)." bitokojn al: ".$file."\n");
	unless (open FILE, $mode, $file) {
		$log->warn("Ne povis malfermi '$file': $!\n"); return;
	}
	print FILE $text;
	close FILE;
}

# legi JSON-dosieron
sub read_json_file {
	my $file = shift;
  	my $j = read_file($file);

	$log->debug("json file: $file\n");

	unless ($j) {
		$log->warn("Malplena aŭ mankanta JSON-dosiero '$file'\n");
		return;
	}
    $log->debug(substr($j,0,20)."...\n");

    my $parsed;
	eval {
    	$parsed = $json_parser->decode($j);
    	1;
	} or do {
  		my $error = $@;
		$log->error("Ne eblis analizi enhavon de JSON-dosiero '$file'.\n");
  		$log->error("$error\n");
		return;
	};

	return $parsed;	  
}


# skribi JSON-dosieron
sub write_json_file {
	my ($mode,$file,$content,$sep) = @_;
    my $json = $json_parser->encode($content);

    unless (open JSN, $mode, $file) {
		$log->warn("Ne povis malfermi $file: $!\n");
		return;
    }

	print JSN $sep if ($sep);
	print JSN $json;
	close JSN;  
}

# legu linion post linio el CSV-teksto kaj redonu kiel listo de vortaretoj 
sub csv2arr {
    my $csv = shift;
    my $parser = Text::CSV->new({ sep_char => ';' }); 

    my @lines = split("\n",$csv);
    my $first_line = 1;
    my %rec;
    my @cols;
    my @records;

    for my $line (@lines) {
       	$log->debug("CSV line: ".encode('utf-8',$line)."\n");
        chomp($line);
        if ($parser->parse($line)) {
            if ($first_line) {
                # unua linio enhavas la kolumno-nomojn
                @cols = $parser->fields();
               	$log->debug("CSV cols:".join(';',@cols)."\n");
                $first_line = 0;
            } else {
                # aliaj linioj estas la datumoj
                my @fields = $parser->fields();
                my %rec; 
                @rec{@cols} = @fields;
                #for (my $i=0; $i<=$#fields; $i++) {
                #    $rec{$cols[$i]} = $fields[$i];
                #}
               	#$log->debug("CSV cols:".join(';',@cols)."\n");
               	#$log->debug("CSV rec:".join(';',$parser->fields())."\n");
               	$log->debug("CSV keys:".join(',',keys %rec)."\n");
               	$log->debug("CSV vals:".encode('utf-8',join(',',values %rec))."\n");
                push @records,\%rec;
            }
        } else {
            $log->error("Eraro dum analizado de CSV: [$line]\n".$parser->error_diag ()."\n");
        }
    }

    $log->debug("CSV #recs:".(1+$#records)."\n");
    return @records;
}


################ helpfukcioj por raporti rezultojn ##############

# $rep referencu al vortareto kun la ŝlosiloj:
# "mesagho" mesaĝo pri eraro aŭ konfirmo
# "rezulto" "eraro" aŭ "konfirmo"
# "senddato" kiam la redakto estis alsendita
# "artikolo" la identigilo de la artikolo (<art mrk="$Id...")

sub rep_str {
	my $rep = shift;
	
	my $msg = 
		"senddato: $rep->{senddato}\n"
		."artikolo: $rep->{artikolo}\n"
		.uc($rep->{rezulto}).": "	
		.$rep->{mesagho}."\n";	
	return $msg;
}


################ helpfukcioj por trakti la XML-artikolon kaj ties identigilon/version ##############

# kontrolado de la XML-artikolo: marko ($Id$), sintakso
sub checkxml {
    my ($id,$fname,$nova) = @_;
	my $lname = "$xml_temp/$id.log";

    # se ne jam estas kreu provizoran xml-dosierujon
    mkdir($xml_temp);

    # aldonu dtd symlink se ankoraŭ mankas
    #symlink("$dtd_dir","$xml_temp/../dtd") ;
#	|| warn "Ne povis ligi de $dtd_dir al $xml_temp/../dtd\n";

	my $teksto = read_file("$fname");
    # uniksajn linirompojn!
    $teksto =~ s/\r\n/\n/sg;

	# ĉe nova artikolo, enŝovu Id, se mankas...
	if ($nova) { $teksto =~ s/<art[^>]*>/<art mrk="\044Id\044">/s };

    # enmetu Log se ankorau mankas...
    unless ($teksto =~ /<!--\s+\044Log/s) {
		$teksto =~ s/(<\/vortaro>)/\n<!--\n\044Log\044\n-->\n$1/s;
    }

    # mallongigu Log al 20 linioj
    $teksto =~ s/(<!--\s+\044Log(?:[^\n]*\n){20})(?:[^\n]*\n)*(-->)/$1$2/s;

    # reskribu la dosieron
    unless (write_file(">",$fname,$teksto)) { return; }

    # kontrolu la sintakson de la XML-teksto
    `$xmlcheck $fname 2> $lname`;

    # legu la erarojn
    my $err = read_file($lname);
    # unlink("$lname");

    return $err;
}

# en la artikolo troviĝas $Id....$, kiu enhavas i.a. version kaj tempon
sub get_art_id {
    my $artfile = shift;

    # legu la ghisnunan artikolon
	my $xml = read_file($artfile);

	if ($xml) {
		# pri kiu artikolo temas, trovighas en <art mrk="...">
		$xml =~ /(<art[^>]*>)/s;
		$1 =~ /mrk="([^\"]*)"/s; 
		my $id = $1;
		$log->debug("Id: $id\n");  

		return $id;

	} else {
		return;
	}
}

# La version ni eltrovos kaj altigos je unu kaj reskribas en la artikolon
# krome la artikolo piede enhavas komenton kun $Log$ por protokoli la lastajn ŝanĝoj
# ni aldonos supre la novan version kaj evt-e mallongigas la komenton
sub incr_ver {
	my ($artfile,$shangh_file) = @_;

	# $Id: test.xml,v 1.51 2019/12/01 16:57:36 afido Exp $
    my $art = read_file("$artfile");

	$art =~ m/\$Id:\s+([^\.]+)\.xml,v\s+(\d)\.(\d+)\s+(?:\d\d\d\d\/\d\d\/\d\d\s+\d\d:\d\d:\d\d)(.*?)\$/s;	
	my $ver = id_incr($2,$3);
	my $id = '$Id: '.$1.'.xml,v '.$ver.$4.'$';
	$art =~ s/\$Id:[^\$]+\$/$id/;
	$art =~ s/\$Log[^\$]*\$(.*?)-->/log_incr($1,$ver,$shangh_file)/se;

	write_file(">",$artfile,$art);
}

# altigi la version je .1 kaj alpendigi la aktualan daton 
sub id_incr {
	my ($major,$minor) = @_;
	my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime(time);
	my $now = sprintf("%04d/%02d/%02d %02d:%02d:%02d", $year+1900, $mon+1, $mday, $hour, $min, $sec);
	return "$major.". ( ++$minor )." $now";
}

# ni legas la ŝanĝojn el dosiero shangoj.msg
# kaj metas kape de ŝanĝprotkoleto, kiu troviĝas piede de artikolo
# ni mallongigas ĝin al maksimume 20 linioj
sub log_incr {
	my ($alog,$ver,$shangh_file) = @_;

	# mallongigu je maks. 10 linioj
	my @lines = split(/\n/,$alog);
	$alog = join("\n",splice(@lines,0,20));

	my $shg = read_file($shangh_file);
	return "\$Log\$\nversio $ver\n".$shg."\n$alog\n-->";
}

# ĉe nova artikolo ni donas version 1.0 en $Id kun la dato
# kaj enŝovas $Log$ piede kun nur tiu ĉi unua versio kiel komento
sub init_ver {
	my ($artfile,$shangh_file) = @_;

	# $Id: test.xml,v 1.1 2019/12/01 16:57:36 afido Exp $
    my $art = read_file("$artfile");
	my $shg = read_file($shangh_file);

	$artfile =~ m|/([^/]+\.xml)|;
	my $fn = $1;
	my $ver = id_incr("1","0");
	my $id = '$Id: '.$fn.',v '.$ver.' afido Exp $';
	my $alog = "\n<!--\n\$Log: $fn,v \$\nversio $ver\n$shg\n-->\n";

	$art =~ s/\$Id[^\$]*\$/$id/;
	$art =~ s/<\/vortaro>/$alog<\/vortaro>/s;

	write_file(">",$artfile,$art);
}

# Se la sintakskontrolo trovis erarojn, ni ricevas ĝin kun linio kaj pozicio ĉe
# la komenco de la eraromesaĝo. Per tiuj indikoj ni trovos la lokon en XML, kiu havas
# la eraron por doni helpinformon al la redaktinto.
sub xml_context {
    my ($err,$file) = @_;
    my ($line, $char,$result,$n,$txt);

	if ($err =~ /line\s+([0-9]+)\s+char\s+([0-9]+)\s+/s) {
		$line = $1;
		$char = $2;

		unless (open XML,$file) {
			$log->warn("Ne povis malfermi $file:$!\n");
			return '';
		}

		# la linio antau la eraro
		if ($line > 1) {
			for ($n=1; $n<$line-1; $n++) { <XML>; }	    
			$result .= "$n: ".<XML>;
			$result =~ s/\n?$/\n/s;
		}

		$result .= "$line: ".<XML>;
		$result =~ s/\n?$/\n/s;
		$result .= "-" x ($char + length($line) + 1) . "^\n";

		if (defined($txt=<XML>)) {
			$line++;
			$result .= "$line: $txt";
			$result =~ s/\n?$/\n/s;
		}

		close XML;			
		return $result;
    }

    return '';
}

################ helpfukcioj por Git ##############

sub git_cmd {
	my $git_cmd = shift;

	chdir($git_dir);
	$log->info("------------------------------\n");
	# `$git commit -F $tmp/shanghoj.msg --author "revo <$revo_mailaddr>" $xmlfile 1> $tmp/git.log 2> $tmp/git.err`;
	$log->info("$git_cmd\n");
	`$git_cmd 1> $tmp/git.log 2> $tmp/git.err`;

	# chu 'commit' sukcesis?
	my $git_log = read_file("$tmp/git.log");
    $log->info("git-out:\n$git_log\n") if ($git_log);

    my $git_err = read_file("$tmp/git.err");
    $log->error("git-err:\n$git_err\n") if ($git_err);
	$log->info("------------------------------\n");

    unlink("$tmp/git.log");
	unlink("$tmp/git.err");
	chdir($dict_base);

	$git_log =~ s/\[master\s+/[m /;
	$git_log =~ s/file changed/dosiero/;
	$git_log =~ s/insertions/enmetoj/;
	$git_log =~ s/deletions+/forigoj/;

	return ($git_log,$git_err);
}

return 1;
