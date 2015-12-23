#!/usr/bin/perl

# prenas la redaktitajn artikolojn el la poshtfako
# au alia dosiero donita en la komandlinio kaj
# analizas, sintakse kontrolas, metas en la vortaron
# kaj arkivigas (per CVS) ilin.
#
# voku:
#  processmail.pl [<mesagh-dosiero>]


use MIME::Parser;
use MIME::Entity;

######################### agorda parto ##################

# kiom da informoj
$verbose      = 1;
$debug        = 0;

# dosierujoj
$revo_home    = $ENV{"HOME"};
$VOKO         = $ENV{"VOKO"};
$tmp          = "$revo_home/revotmp";
$log_mail     = "$revo_home/revolog";
$revo_base    = "$revo_home/revo";
$revo_etc     = "$revo_home/etc";

$parts_dir    = "$revo_home/revotmp/mailparts";
$mail_folder  = "/var/spool/mail/revo";
$mail_error   = "$tmp/mailerr";
$mail_send    = "$tmp/mailsend";
$xml_temp     = "$tmp/xml";
$dtd_temp     = "$tmp/dtd";

$old_mail     = "$log_mail/oldmail";
$err_mail     = "$log_mail/errmail";
$prc_mail     = "$log_mail/prcmail";

$xml_dir      = "$revo_base/xml";
$dok_dir      = "$revo_base/dok";

$mail_local   = "$tmp/mail";
#$editor_file  = "$revo_home/etc/redaktoroj";
$editor_file  = "$revo_etc/redaktantoj";
$attachments  = "$tmp/mailatt/attchm".$$."_";
$vokomail_url = "http://www.reta-vortaro.de/cgi-bin/vokomail.pl";
$revo_url     = "http://purl.oclc.org/NET/voko/revo";

# programoj
$xmlcheck     = '/usr/bin/rxp -V -s';
$cvs          = '/usr/bin/cvs';
$sendmail     = '/usr/lib/sendmail -t -i';
$patch        = '/usr/bin/patch';

# diversaj
$mail_begin   = '^From[^:]';
$possible_keys= 'komando|teksto|shangho';
$commands     = 'redakt[oui]|help[oui]|aldon[oui]'; # .'|dokumento|artikolo|historio|propono'
$revoservo    = '[Revo-Servo]';
$revo_mailaddr= 'revo@reta-vortaro.de';
$revolist     = 'wolfram';
$revo_from    = "Reta Vortaro <$revo_mailaddr>";
$signature    = "--\nRevo-Servo $revo_mailaddr\n"
    ."retposhta servo por redaktantoj de Reta Vortaro.\n";
$separator    = "=" x 50 . "\n";

################ la precipa masho de la programo ##############

$| = 1;
$the_mail   = '';
$editor     = '';
$article_id = '';
$mail_date  = '';
$shangho    = '';
$komando    = '';
$file_no    = 0;
@newarts    = ();

if ($ARGV[0]) {
    $mail_file = shift @ARGV;
} else {

    # chu estas poshto?
    if (not -s $mail_folder) {
	print "neniu poshto en $mail_folder\n" if ($verbose);
	exit;
    };

    # shovu la poshtdosieron
    `mv $mail_folder $mail_local`;
    #`cp $mail_folder $mail_local`;

    $mail_file = $mail_local;
}

open MAIL, "$mail_file" or die "Ne povis malfermi $mail_file: $!\n";

while ($file = readmail()) {

    print '-' x 50, "\n" if ($verbose);

    # preparu por la nova mesagho
    $editor = '';
    $shangho = '';
    $article_id = '';
    $parser = new MIME::Parser;
    $parser->output_dir($parts_dir);
    $parser->output_prefix("part");
    $parser->output_to_core(20000);        

    # malfermu kaj enlegu la mesaghon
    open ML, $file; 
    $entity = $parser->read(\*ML);
    unless ($entity) {
	warn "Ne eblis analizi la MIME-mesaghon.\n";
	next;
    }

    # eligu iom da informo pri la mesagho
    $header = $entity->head();
    print "From    : ", $header->get('From') if ($verbose);
    print "Subject : ", $header->get('Subject'),
          "Cnt-Type: ", $header->get('Content-Type'), "\n"
	      if ($debug);
    $entity->dump_skeleton if ($debug);

    $mail_date = $header->get('Date');
    chomp $mail_date;

    # analizu la enhavon de la mesagho
    process_ent($entity);

    # purigado
    $entity->purge();
    close ML;
}

close MAIL;

# sendu raportojn
send_reports();
send_newarts_report();

$filename = `date +%Y%m%d_%H%M%S`;    

# arkivigu la poshtdosieron
if ($mail_file eq $mail_local) {
    print "\nshovas $mail_local al $old_mail/$filename\n" if ($verbose);
    `mv $mail_local $old_mail/$filename`;
}

if (-e $mail_error) {
    print "shovas $mail_error al $err_mail/$filename\n" if ($verbose);
    `mv $mail_error $err_mail/$filename`;
}

if (-e $mail_send) {
    print "shovas $mail_send al $log_mail/$filename\n" if ($verbose);
    `mv $mail_send $prc_mail/$filename`;
}  

###################### analizado de la mesaghoj ################

sub readmail {
	my $lastpos;
	
	$the_mail = <MAIL>;

	while (<MAIL>) {
		if (/$mail_begin/) {
		    seek(MAIL,$lastpos,0); # reiru unu linion
		    last;
		} else {
		    $the_mail .= $_;
		    $lastpos = tell(MAIL);
		};
	};

	if ($the_mail) {

	    my $fn = "/tmp/".$$."mail";
	    open OUT, ">$fn";
	    print OUT $the_mail;
	    close OUT;
	    return $fn;

	} else { 
	    return; 
	};
}		
		

sub process_ent {
    my $entity = shift;
    my $parttxt;
    my $xmltxt = '';
    my $first_line;
    my $IO;

    # kontrolu, chu temas pri redaktoro au helpkrio
    unless ($editor = is_editor($entity->head->get('from'))) { 

	# chu temas pri helpkrio?
	# tia helppeto validas nur en simplaj mesaghoj
	if ($entity->mime_type =~ m|^text/plain|) {
	    $IO = $entity->bodyhandle->open("r"); 
	    $first_line = $IO->getline(); $IO->close;
	    if ($first_line =~ /^\s*help/) {

		cmd_help($entity->head->get('reply-to') 
			 || $entity->head->get('from'));

		print "komando \"helpo\"\n" 
		    if ($verbose);
		return;
	    };
	};
	    
	print "!!! ".$entity->head->get('from')." ne estas redaktoro "
	     ."nek petas pri helpo !!!\n"
	     ."\tsubject: ".$entity->head->get('subject')."\n";
	print "\tstart of mail: $first_line\n---\n" if ($first_line);
	save_errmail();
	return; # ne respondu al SPAMo
    }
	
    print "redaktisto: $editor\n" if ($debug);

    # unuparta mesagho
    if (! $entity->is_multipart) {
	print "single part message\n" if ($debug);

        # elprenu la tekston
        $parttxt = $entity->bodyhandle->as_string;   

        # Opera uzas linirompojn anstatau "&", sed ankau havas aliloke linirompojn
        if (($entity->head->get('user-agent') =~ /Opera/s ) and        
           ($entity->head->get('content-type')
                 =~  /format=flowed/s))      # Opera
        {
          $parttxt =~ s/&/%26/sg;
	  $parttxt =~ s/\n(teksto|shangho|ago)=/\&\n$1=/sg;
	}

	# TTT-formularo?
        if ((($entity->head->get('subject')
                 =~ /Microsoft.*Internet.*lorer/s) 

                or ($entity->head->get('content-type')
		 =~  /POSTDATA\.ATT/s)

                or ($entity->head->get('content-type')
                 =~  /format=flowed/s)      # Opera

		or ($entity->head->get('subject')
		 =~ /form\s+post/si)

                or ($entity->head->get('x-mailer')
                 =~ /Apple\sMail/)
                )
                and ($parttxt =~ /^\s*komando=redakto&/)

                or ($entity->mime_type
                    =~ m|application/x-www-form-urlencoded|)) { 
	    print "URL encoded form\n" if ($debug);
	    urlencoded_form($parttxt);
	    return;
	# normala mesagho
	} else {
	    print "normala mesagho\n" if ($debug);
	    normal_message($parttxt);
	    return;
	}
	
    # plurparta MIME-mesagho
    } else {
	my $num_parts = $entity->parts;
	print "num of parts: ", $num_parts, "\n" if ($debug);

	# trairu chiujn partojn
	for ($i = 0; $i < $num_parts; $i++) {
	    my $part = $entity->parts($i);
	    print $part->mime_type, "\n" if ($debug);

	    # elprenu la tekston
	    unless ($part->bodyhandle) { next; } # ignoru plurpartajn partojn
	    $parttxt = $part->bodyhandle->as_string;

	    # chu temas pri TTT-formularo?
	    if ((($entity->head->get('subject') 
		 =~ /Microsoft.*Internet.*lorer/s) 
                or ($part->head->get('content-type')
		    =~  /POSTDATA\.ATT/s))
		and ($parttxt =~ /^\s*komando=redakto&/)
		or ($part->mime_type 
		    =~ m|application/x-www-form-urlencoded|)) {
		
		# TTT-formularo
		urlencoded_form($parttxt);
		return;
	    }

	    # ekzamenu, chu en la partoj estas komando kaj/au xml
	    if ($parttxt =~ /^\s*($commands)\s*:/si) {
		$komando = $1;
		print "komando $komando en parto $i\n" if ($debug);
		if ($komando =~ /^(help|dokument|artikol|histori)/) {
		    normal_message($parttxt);
		} else {
		    # chu krome enhavas la xml-tekston?
		    if ($parttxt =~ /<\?xml/s) {
			print "xml en parto $i\n" if ($debug);
			normal_message($parttxt);
			return;
		    } else {
			# supozu, ke estas nur la komando kaj trovu la reston
			$komando = $parttxt;
		    }
		}
	    } elsif ($parttxt =~ /^\s*<\?xml/s) {
		print "xml en parto $i\n" if ($debug);
		# memoru la xml-tekston
		$xmltxt = $parttxt;
	    }

	    # se ambau - komando kaj xml - estas trovitaj, daurigu
	    if ($komando and $xmltxt) {
		normal_message("$komando\n\n$xmltxt");
		return;
	    }
	}
	# en la plurparta mesagho shajne ne trovighis la serchita
	report("ERARO   : Ne trovighis komando kaj/au XML-teksto en la "
		   ."plurparta mesagho");
    }
}

sub is_editor {
    my $email_addr = shift;
    my $res_addr = '';

    chomp $email_addr;
    $email_addr =~ s/\([^\)]+\)//s; # nomindiko lau malnova maniero
    $email_addr =~ s/^\s+//s;
    $email_addr =~ s/\s+$//s;
    $email_addr =~ s/^.*<([a-z0-9\.\_\-]+\@[a-z0-9\._\-]+)>.*$/<$1>/si;
    unless ($email_addr =~ /<?[a-z0-9\.\_\-]+\@[a-z0-9\._\-]+>?/i) { 
	return; # ne estas valida retadreso
    }

    # serchu en la dosiero kun redaktoroj
    open EDI, $editor_file;
    while (<EDI>) {
	chomp;
	unless (/^#/) {
		if (index(lc($_),lc($email_addr)) >= 0) {
		    print "retadreso trovita en: $_\n" if ($debug);
		    /^([a-z'"\-\.\s]*<[a-z\@0-9\.\-_]*>)/i;
		    $res_addr = $1;
		    unless ($res_addr) {
			print "ne povis ekstrakti la adreson el $_\n";
		    } else {
			print "sendadreso de la redaktoro: $res_addr\n" 
			    if ($debug);
		    }
		    return $res_addr;
		}
	    }
    }
		
    return; # ne trovita
}


sub urlencoded_form {
    my $text = shift;
    my %content = ();
    my ($key,$value);

    $text =~ s/!?\n//sg;
    foreach $pair (split ('&',$text)) {
	if ($pair =~ /(.*?)=(.*)/) {
	    ($key,$value) = ($1,$2);
	    if ($key =~ /^(?:$possible_keys)$/) {
		$value =~ s/\+/ /g; # anstatauigu '+' per ' '
		$value =~ s/%(..)/pack('c',hex($1))/seg;
		$content{$key} = $value;
	    };
	}
    };           

    komando($content{'komando'},$content{'shangho'},$content{'teksto'});
}

sub normal_message {
    my $text = shift;
    my ($cmd,$arg,$xml);

    if ($text =~ s/^[\s\n]*($commands)[ \t]*:[ \t]*(.*?)\n//si) {
	$cmd = $1;
	$arg = $2;

	# legu chion ghis malplena linio au "<?xml..."
	while (($text !~ /^\s*\n/) and ($text !~ /^\s*<\?xml/i)) {
	    $text =~ s/^[ \t]*(.*?)\n//;
	    $arg .= $1;
	}

	# la resto povus esti la artikolo
	$text =~ s/^[\s\n]*//;
	
	# kaze, ke iu subskribo finas la mesaghon, forigu
	# chion post </vortaro>
	$text =~ s/(<\/vortaro>).*$/$1/s; 
	
	if ($text) {
	    $xml = $text;
	}

	komando($cmd,$arg,$xml);
	
    } else {
	# sekurigu la dosieron
	unless (open MSG,">$tmp/_err_msg") {
	    warn "Ne povis malfermi $tmp/_err_msg: $!\n";
	    report("ERARO   : nekonata komando en la poshtajho");
	    return;
	}
	print MSG $text;
	close MSG;

	# kelkaj pseudaj variabloj necesaj
	$article_id = "???.xml";
	$komando = "???";
	$shangho = "???";

	# raportu eraron
	report("ERARO   : nekonata komando en la poshtajho","$tmp/_err_msg");
	return;
    }
}

sub komando {
    my ($cmd,$arg,$txt) = @_;

    # memoru por poste
    $komando = $cmd;

    if ($cmd =~ /^help[oui]$/i) {
	cmd_hlp();

    } elsif ($cmd =~ /^dokumento/i) {
	cmd_dokument($arg);

    } elsif ($cmd =~ /^redakt[oui]/i) {
	cmd_redakt($arg, $txt);

    } elsif ($cmd =~ /^aldon[oui]/i) {
	cmd_aldon($arg, $txt);

    } elsif ($cmd =~ /^historio/i) {
	cmd_histori($arg);
	
    } elsif ($cmd =~ /^artikolo/i) {
	cmd_artikol($arg);

    } elsif ($cmd =~ /^propon[oui]/i) {
	cmd_propon($arg, $txt);
    } else {
	report("ERARO   : nekonata komando $cmd");
	return;
    }
}

sub save_errmail {
    unless( open ERRMAIL, ">>$mail_error") {
	warn "Ne povis malfermi $mail_error: $!\n";
	return;
    }
    print ERRMAIL $the_mail;
    close ERRMAIL;
    print "erara mesagho sekurigita al $mail_error\n" if ($verbose);
}


######################### respondoj al sendintoj ###################

sub report {
    my ($msg,$file) = @_;
    my ($attachment,$text);
    
    print "$msg\n" if ($verbose);

    # donu provizoran nomon al kunsendajho
    if ($file) {

	# enmetu "redakto: $shanghoj" komence
	if ($file =~ /\.xml$/) {
	    unless (open FILE, $file) {
		warn "Ne povis malfermi $file: $!\n";
		goto "MOVE_FILE";
	    }
	    $text = join('',<FILE>);
	    close FILE;
	    unless (open FILE, ">$file") {
		warn "Ne povis malfermi $file: $!\n";
		goto "MOVE_FILE";
	    }
	    print FILE "$komando: $shangho\n\n";
	    print FILE $text;
	    close FILE;
	}
	
MOVE_FILE:
	# donu provizoran nomon al la dosiero
	$file_no++;
	$attachment = "$attachments$file_no";
	`mv $file $attachment`;
    }

    # skribu informon en $mail_send por poste sendi raporton al $editor
    unless (open SMAIL, ">>$mail_send") {
	warn "Ne povis malfermi $mail_send: $!\n";
	return;
    }

    print SMAIL "sendinto: $editor\n";
    print SMAIL "dosieroj: $attachment\n" if ($file);
    print SMAIL "senddato: $mail_date\n";
    print SMAIL "artikolo: $article_id\n";
    print SMAIL "shanghoj: $shangho\n" if ($shangho);
    print SMAIL "$msg\n";
    print SMAIL $separator;

    close SMAIL;
}

sub send_reports {
    my $newline = $/;
    my %reports = ();
    my %dosieroj = ();
    my ($mail_addr,$message,$mail_handle,$file,$art_id,$marko,$dos);

    # legu la respondojn el $mail_send
    if (-e $mail_send) {
	
	$/ = $separator;
	unless (open SMAIL, $mail_send) {
	    warn "Ne povis malfermi $mail_send: $!\n";
	    return;
	}

	while (<SMAIL>) {
	    # elprenu la sendinton
	    if (s/^sendinto: *([^\n]+)\n//) {
		$mail_addr = $1;
		# chu dosierojn sendu?
		if (s/^dosieroj: *([^\n\s]+)\n//) {
		    $dos = $1;
		    if ($_ =~ /artikolo: *([^\n]+)\n/s) { $art_id = $1; }
		    
		    $dosieroj{$mail_addr} .= "$dos $art_id|";
		}
		$reports{$mail_addr} .= $_;
	    } else {
		warn "Ne povis elpreni sendinton el $_\n";
		next;
	    }
	}
	close SMAIL;
	$/ = $newline;

	# forsendu la raportojn
	while (($mail_addr,$message) = each %reports) {
	    $dos = $dosieroj{$mail_addr};
	    $mail_addr =~ s/.*<([a-z\.\_\-@]+)>.*/$1/;
	    
	    # preparu mesaghon
	    $message = "Saluton!\n"
		."Jen raporto pri via(j) sendita(j) artikolo(j).\n\n"
		    .$separator.$message."\n".$signature;
	    
	    $mail_handle = build MIME::Entity(Type=>"multipart/mixed",
					      From=>$revo_from,
					      To=>"$mail_addr",
					      Subject=>"$revoservo - raporto");
	    
	    $mail_handle->attach(Type=>"text/plain",
				 Encoding=>"quoted-printable",
				 Data=>$message);
	    
	    # alpendigu dosierojn
	    if ($dos) {
		for $file (split (/\|/,$dos)) {
		    if ($file =~ /^\s*([^\s]+)\s+(.+?)\s*$/) {
			$file = $1;
			$art_id = $2;

			if ($art_id =~ /^\044([^\044]+)\044$/) {
			    $art_id = $1;
			    $art_id =~ /^Id: ([^ ,\.]+\.xml),v/;
			    $marko = $1;
			} else {
			    $marko=$art_id;
			}
		    } else { $art_id = $file; $marko=$file; }
		    
		    print "attach: $file\n" if ($debug);
		    if ($file) {
			$mail_handle->attach(Path=>$file,
					     Type=>'text/plain',
					     Encoding=>'quoted-printable',
					     Disposition=>'attachment',
					     Filename=>$marko,
					     Description=>$art_id);
		    }
		}
	    }
	    
	    # forsendu
	    unless (open SENDMAIL, "|$sendmail") {
		warn "Ne povas dukti al $sendmail: $!\n";
		next;
	    }
	    $mail_handle->print(\*SENDMAIL);
	    close SENDMAIL;
	}

	# forigu $mail_send
	# unlink($mail_send);
    }
}

sub send_newarts_report {
    my ($message,$mail_handle);

    # legu la respondojn el $mail_send
    if (@newarts) {

	print "Informo pri novaj artikoloj al <$revolist>:\n",
	    join ("\n",@newarts), "\n" if ($debug);
	
	# preparu mesaghon
	$message = "Saluton!\nAldonighis " . ($#newarts+1)
	    . " nova(j) artikolo(j)...\n\n";
	foreach $entry (@newarts) {
	    $message .= "$entry\n";
	}
	$message .= "\n$signature";
	    
	$mail_handle = build MIME::Entity(Type=>"text/plain",
					  From=>$revo_from,
					  To=>"$revolist",
					  Subject=>"novaj artikoloj",
					  Data=>$message);
	    
	# forsendu
	unless (open SENDMAIL, "|$sendmail") {
	    warn "Ne povas dukti al $sendmail: $!\n";
	    return;
	}
	$mail_handle->print(\*SENDMAIL);
	close SENDMAIL;
    }
}



###################### komandoj kaj helpfunkcioj ##############


sub cmd_help {
    my $mail_addr = shift;
    my ($mail_handle);
    
    # sendu helpdokumenton al la sendinto
    $mail_handle = build MIME::Entity(Type=>"multipart/mixed",
				      From=>$revo_from,
				      To=>"$mail_addr",
				      Subject=>"$revoservo - helpo");
	    
   $mail_handle->attach(Type=>"text/plain",
			 Encoding=>"quoted-printable",
			 Data=>"Saluton!\n\n"
			."Jen informoj pri la uzo de Revo-Servo.");

    $mail_handle->attach(Path=>$file,
			 Type=>'text/plain',
			 Encoding=>'quoted-printable',
			 Disposition=>'attachment',
			 Filename=>"$dok_dir/helpo.txt",
			 Description=>"helpo pri Revo-servo");

    # forsendu
    unless (open SENDMAIL, "|$sendmail") {
	warn "Ne povas dukti al $sendmail: $!\n";
	return;
    }
    $mail_handle->print(\*SENDMAIL);
    close SENDMAIL;
}

sub cmd_redakt {
    my ($shangh,$teksto) = @_;
    my $id,$art,$err;
    $shangho = $shangh; # memoru por poste
    $shangho =~ s/[\200-\377]/?/g; # forigu ne-askiajn signojn

    # uniksajn linirompojn!
    $teksto =~ s/\r\n/\n/sg;

    # aldonu finon, kiun Netskapo foje fortranchas
    $teksto =~ s/<\/vortaro>?$/<\/vortaro>\n/s;

    # pri kiu artikolo temas, trovighas en <art mrk="...">
    $teksto =~ /(<art[^>]*>)/s;
    $1 =~ /mrk\s*=\s*"([^\"]*)"/s; 
    $id = $1;
    print "artikolo: $id\n" if ($verbose);
    $article_id = $id;

    # ekstraktu dosiernomon el $Id: ...
    #$id =~ /^\044Id: ([^ ,\.]+)\.xml,v\s+([0-9\.]+)/;
    $art = extract_article($id);


    unless ($art =~ /^[a-z0-9_]+$/i) {
	report("ERARO   : Ne valida artikolmarko $art. Ghi povas enhavi nur "
	      ."literojn, ciferojn kaj substrekon.\n");
	return;
    }

    if (checkxml($teksto)) {
	checkin($art,$id);
    }
}

sub checkxml {
    my $teksto = shift;
    my $err;

    # aldonu dtd symlink se ankorau mankas
    symlink("$VOKO/dtd","$xml_temp/../dtd") ;
#	|| warn "Ne povis ligi de $VOKO/dtd al $xml_temp/../dtd\n";

    # enmetu Log se ankorau mankas...
    unless ($teksto =~ /<!--\s+\044Log/s) {
	$teksto =~ s/(<\/vortaro>)/\n<!--\n\044Log\044\n-->\n$1/s;
    }

    # mallongigu Log al 20 linioj
    $teksto =~ s/(<!--\s+\044Log(?:[^\n]*\n){20})(?:[^\n]*\n)*(-->)/$1$2/s;

    # skribu la dosieron provizore al tmp
    unless (open XML,">$xml_temp/xml.xml") {
	warn "Ne povis malfermi $xml_temp/xml.xml: $!\n";
	return;
    }

    print XML $teksto;
    close XML;

    # kontrolu la sintakson de la XML-teksto
    `$xmlcheck $xml_temp/xml.xml 2> $xml_temp/xml.err`;

    # legu la erarojn
    open ERR,"$xml_temp/xml.err";
    $err=join('',<ERR>);
    close ERR;
    unlink("$xml_temp/xml.err");

    if ($err) {
	$err .= "\nkunteksto:\n".xml_context($err,"$xml_temp/xml.xml");
	print "XML-eraroj:\n$err" if ($verbose);

	report("ERARO   : La XML-dosiero enhavas la sekvajn "
	      ."sintakserarojn:\n$err","$xml_temp/xml.xml");
	return;
    } else {
	print "XML: en ordo\n" if ($debug);
	return 1;
    }
}

sub checkin {
    my ($art,$id) = @_;
    my ($log,$err,$edtr,$teksto);

    # kontrolu chu ekzistas shangh-priskribo
    unless ($shangho) {
	report("ERARO   : Vi fogesis indiki, kiujn shanghojn vi faris "
	    ."en la dosiero.\n","$tmp/xml.xml");
        return;
    } 
    $shangho = lat3_utf8($shangho);
    print "shanghoj: $shangho\n" if ($verbose);

    # skribu la shanghojn en dosieron
    $edtr = $editor;
    $edtr =~ s/\s*<(.*?)>\s*//;

    open MSG,">$tmp/shanghoj.msg";
    print MSG "$edtr: $shangho";
    close MSG;

    # kontrolu, chu la artikolo bazighas sur la aktuala versio
    my $ark_id = get_archive_version($art);
    if ($ark_id ne $id) {
	# provu solvi la versiokonflikton
#	report ("PROBLEMO: La de vi sendita artikolo\n"
#	       ."ne bazighas sur la aktuala arkiva versio\n"
#	       ."($ark_id)\n"
#	       ."Mi provas solvi la konflikton. Vidu malsupre.\n");
#
#	if (merge_revisions($id,$ark_id)) {
#	    # rekontrolu la XML-strukturon
#	    open XML,"$tmp/xml.xml" 
#		or die "Ne povis malfermi $tmp/xml.xml: $!\n";
#	    $teksto = join('',<XML>);
#	    close XML;
#	    unless (checkxml($teksto)) {
#		return;
#	    }
#	} else {
#	    # konflikto ne solvebla
#	    report("ERARO   : La versiokonflikto ne estis solvebla. "
#		   ."Bonvolu preni aktualan version el la TTT-ejo. "
#		   ."($vokomail_url?art=$art)\n","$tmp/xml.xml");
#	    return;
#	};
#	# konflikto solvita, daurigu do...

	# versiokonflikto
	report("ERARO   : La de vi sendita artikolo\n"
	       ."ne bazighas sur la aktuala arkiva versio\n"
	       ."($ark_id)\n"
	       ."Bonvolu preni aktualan version el la TTT-ejo. "
	       ."($vokomail_url?art=$art)\n","$xml_temp/xml.xml");
	return;
    }

    # checkin
    my $xmlfile="$art.xml";
    `mv $xml_temp/xml.xml $xml_dir/$xmlfile`;
    chdir($xml_dir);
    `$cvs ci -F $tmp/shanghoj.msg $xmlfile 1> $tmp/ci.log 2> $tmp/ci.err`;

    # chu checkin sukcesis?
    open LOG,"$tmp/ci.log";
    $log = join('',<LOG>);
    print "ci-log:\n$log\n" if ($debug);
    close LOG;

    # se finighas "done" - chio en ordo, 
    # se finighas "aborting" - fiasko
    # se neniu eligajho, la dosiero ne estas shanghita
    
    open ERR,"$tmp/ci.err";
    $err = join('',<ERR>);
    print "ci-err:\n$err\n" if ($debug);
    close ERR;

    # forigu provizorajn dosierojn
    unlink("$tmp/ci.log");
    unlink("$tmp/ci.err");
    unlink("$tmp/shanghoj.msg");

    # raportu erarojn
    if ($log =~ /^\s*$/s) {
	report("ERARO   : La sendita artikolo shajne ne diferencas de "
	      ."la aktuala versio.");
	return;
    } elsif (($log =~ /aborting\s*$/s) 
	     or ($err !~ /^\s*$/s)) {
	report("ERARO   : Eraro dum arkivado de la nova artikolversio:\n"
	      ."$log\n$err","$tmp/xml.xml");
	return;
    }

    # raportu sukceson 
    report("KONFIRMO: $log");
}

sub merge_revisions {
    my ($base_id,$arch_id) = @_;
    my $art = extract_article($base_id); 
    my $base_ver = extract_version($base_id);
    my $arch_ver = extract_version($arch_id);

    `cp $tmp/xml.xml $tmp/patch.xml`;
    unlink("$tmp/patch.xml.rej"); # kaze, ke ekzistas ankorau pro eraro
    `$cvs diff -u -r $base_ver -r $arch_ver $art | $patch -s $tmp/patch.xml`;
    
    # chu sukcesis?
    unless (-e "$tmp/patch.xml.rej") {
	unlink("$tmp/xml.xml");
	rename("$tmp/patch.xml","$tmp/xml.xml");
	return 1;
    } else {
	unlink("$tmp/patch.xml.rej");
	unlink("$tmp/patch.xml");
	return;
    }
}

sub cmd_aldon {
    my ($art,$teksto) = @_;
    my $id,$err;

    # kio estu la nomo de la nova artikolo
    $art =~ s/^\s+//s;
    $art =~ s/\s+$//s;
    
    unless ($art =~ /^[a-z0-9_]+$/s) {
	report("ERARO   : Ne valida nomo por artikolo. \"$art\".\n"
	       ."Ghi konsistu nur el minuskloj, substrekoj kaj ciferoj.\n");
	return;
    }
    $shangho = $art; # memoru por poste

    # uniksajn linirompojn!
    $teksto =~ s/\r\n/\n/sg;

    # la marko estu "\044Id\044"
    $teksto =~ s/<art[^>]*>/<art mrk="\044Id\044">/s;
    print "nova artikolo: $art\n" if ($verbose);

    # bezonighas article_id en kazo de eraro
    $article_id = "\044Id: $art.xml,v\044";

    # kontrolu, chu la dosiernomo estas ankorau uzebla
    if (-e "$xml_dir/$art.xml") {
	report ("ERARO   : Artikolo kun la dosiernomo $art.xml jam ekzistas\n"
	    ."Bv. elekti alian nomon por la nova artikolo.\n");
	return;
    }

    # kontroli la sintakson
    if (checkxml($teksto)) {
	checkinnew($art);
    }
}

sub checkinnew {
    my ($art) = @_;
    my ($log,$err,$edtr,$teksto);

    $shangho = "nova artikolo";
    print "shanghoj: $shangho\n" if ($verbose);

    # skribu la shanghojn en dosieron
    $edtr = $editor;
    $edtr =~ s/\s*<(.*?)>\s*//;

    open MSG,">$tmp/shanghoj.msg";
    print MSG "$edtr: $shangho";
    close MSG;

    # checkin
    my $xmlfile="$art.xml";
    `mv $xml_temp/xml.xml $xml_dir/$xmlfile`;
    chdir($xml_dir);
    `$cvs add $xmlfile 1> $tmp/ci.log 2> $tmp/ci.err`;
    `$cvs ci -F $tmp/shanghoj.msg $xmlfile 1>> $tmp/ci.log 2>> $tmp/ci.err`;

    # chu checkin sukcesis?
    open LOG,"$tmp/ci.log";
    $log = join('',<LOG>);
    print "ci-log:\n$log\n" if ($debug);
    close LOG;

    # se finighas "done" - chio en ordo, 
    # se finighas "aborting" - fiasko
    # se neniu eligajho, la dosiero ne estas shanghita
    
    open ERR,"$tmp/ci.err";
    $err = join('',<ERR>);
    print "ci-err:\n$err\n" if ($debug);
    close ERR;

    # forigu provizorajn dosierojn
    unlink("$tmp/ci.log");
    unlink("$tmp/ci.err");
    unlink("$tmp/shanghoj.msg");

    # ignoru kelkajn mesaghojn, eligitaj de cvs add kiel "eraro"
    $err =~ s/\Acvs add: use.*?\Z//sg;
    $err =~ s/\Acvs add: scheduling.*?\Z//sg;
    $err =~ s/\Acvs add: re-adding.*?\Z//sg;

    # raportu erarojn
    if ($log =~ /^\s*$/s) {
	report("ERARO   : La sendita artikolo shajne ne arkivighis.",
	       "$tmp/xml.xml");
	return;
    } elsif (($log =~ /aborting\s*$/s) 
	     or ($err !~ /^\s*$/s)) {
	report("ERARO   : Eraro dum arkivado de la nova artikolversio:\n"
	      ."$log\n$err","$tmp/xml.xml");
	return;
    }

    # raportu sukceson
    push @newarts, ("$edtr: $art ( $revo_url/art/$art.html )");
    report("KONFIRMO: $log");
}

sub cmd_dokument {
  # realigu poste
}

sub cmd_artikol {
  # realigu poste
}

sub cmd_propon {
  # realigu poste
}

sub cmd_histori {
  # realigu poste
}

sub xml_context {
    my ($err,$file) = @_;
    my ($line, $char,$result,$n,$txt);

    if ($err =~ /line\s+([0-9]+)\s+char\s+([0-9]+)\s+/s) {
	$line = $1;
	$char = $2;

	unless (open XML,$file) {
	    warn "Ne povis malfermi $file:$!\n";
	    return '';
	}

	# la linio antau la eraro
	if ($line > 1) {
	    for ($n=1; $n<$line-1; $n++) {
		<XML>;
	    }
	    
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

sub get_archive_version {
    my ($art) = @_;
    my $xmlfile = "$xml_dir/$art.xml";

    # legu la ghisnunan artikolon
    unless (open XMLFILE, $xmlfile) {
	warn "Ne povis legi $xmlfile: $!\n";
	return;
    }

    my $txt = join('',<XMLFILE>);
    close XMLFILE;

    # pri kiu artikolo temas, trovighas en <art mrk="...">
    $txt =~ /(<art[^>]*>)/s;
    $1 =~ /mrk="([^\"]*)"/s; 
    my $id = $1;
    print "malnova artikolo: $id\n" if ($debug);  

    return $id;
}

sub extract_version {
    my $id = shift;
    # ekstraktu version el $Id: ...
    unless ($id =~ /^\044Id: [^ ,\.]+\.xml,v\s+([0-9\.]+)/) {
	report ("ERARO   : Artikol-marko havas malghustan sintakson\n");
	warn "$id ne enhavas version\n";
	return '???';
    } else {
	return $1;
    }
}

sub extract_article {
    my $id = shift;
    # ekstraktu dosiernomon el $Id: ...
    unless ($id =~ /^\044Id: ([^ ,\.]+)\.xml,v\s+[0-9\.]+/) {
	report ("ERARO   : Artikol-marko havas malghustan sintakson\n");
	warn "$id ne enhavas dosiernomon\n";
	return '???';
    } else {
	return $1;
    }
}

sub lat3_utf8 {
    my $text = shift;

    # konverti la e-literojn de Lat-3 al utf-8
    $text =~ s/\306/\304\210/g; #Cx
    $text =~ s/\330/\304\234/g; #Gx
    $text =~ s/\246/\304\244/g; #Hx 
    $text =~ s/\254/\304\264/g; #Jx
    $text =~ s/\336/\305\234/g; #Sx
    $text =~ s/\335/\305\254/g; #Ux
    $text =~ s/\346/\304\211/g; #cx
    $text =~ s/\370/\304\235/g; #gx
    $text =~ s/\266/\304\245/g; #hx
    $text =~ s/\274/\304\265/g; #jx
    $text =~ s/\376/\305\235/g; #sx
    $text =~ s/\375/\305\255/g; #ux

    return $text;
}

