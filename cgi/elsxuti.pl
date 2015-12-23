#!/usr/bin/perl

#
# elsxuti.pl
# 
# 2009-11-06 Wieland Pusch
#

# \tools\md5 
# \tools\curl ...

use strict;

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);

my @a;
my $homedir = "/var/www/web277";
my $k = param('k');
my $u = param('u');
my $downts = "$homedir/files/downts/u.$k.$u";
my $art = param('art');
my $md5 = param('md5');
my $md5_tmpfilename = tmpFileName($md5);
my $dbg = param('dbg');

if ($md5_tmpfilename) {
  $md5 = "";
  open IN, "<", $md5_tmpfilename or die;
  $md5 .= $_ while <IN>;
  close IN;
}

if (param('arts')) {
	$art = join('#', split /\r?\n/,param('arts'));
} elsif (!$art and !$md5) {
	print header(-charset=>'utf-8'),
          start_html(-title => 'Elŝuti ReVon');
	print start_form();
	print "kat:".popup_menu('k',
                            ['cvs','xml','html'],
                            'html');
	print br."uzanto: ".textfield(-name=>'u',
                    -size=>20,
                    -maxlength=>20);
	print br."art: ".textarea(-name=>'arts',
                 -rows=>5,
                 -columns=>50),
          br."md5: ".textarea(-name=>'md5',
                 -rows=>5,
                 -columns=>50),
		  hidden(-name=>'dbg',
               -default=>$dbg);
	print br, submit(-name=>'button');
	print endform;
	print end_html();
	exit 1;
}

if ($dbg) {
	print header(-charset=>'utf-8'),
		start_html(-title => 'Elŝuti ReVon');
}

if ($md5) {
    use Digest::MD5 qw(md5_hex);

    chdir "../revo" or die;
	my %h;
	
	foreach (split /\r?\n/, $md5) {
      print pre("md5=$_");
	  if (m/^([0-9a-f]+)\s+(?:[0-9a-z]+[\\\/])?([0-9a-z]+)\.xml$/i) {
	    print pre("digest=$1  file=$2.xml");
		$h{$2} = $1;
		my $fname = "xml/$2.xml";
#	    print pre("fname=$fname");
		if (-e $fname) {
			open IN, "<", $fname or die;
			my $xml = join('', <IN>);
			close IN;
			my $digest = md5_hex($xml);
	#		print pre("     1=$1\ndigest=$digest");
			push @a, $2 if lc($1) ne lc($digest);
		} else {
#			print pre("forigu=$2");
		}
	  }
	}
	foreach (<xml/$art.xml>) {
	  if (m#^xml/(.*?)\.xml$#) {
		push @a, $1 if !exists($h{$1});		
	  }
    }
	$art = join('#', @a);
	print pre("a=".join('-', @a)) if $dbg;
	@a = ();
} else {
	if ($art !~ /^[0-9a-z*#]+$/) {
		print header(-charset=>'utf-8'),
			  start_html(-title => 'Elŝuti ReVon') if !$dbg;
		print h1("art=$art");
		print h1("Ne valida formato");
		print end_html();
		exit;
	}

	if ($u !~ /^[0-9a-zA-Z]+$/) {
	  print header(-charset=>'utf-8'),
			start_html(-title => 'Elŝuti ReVon') if !$dbg;
	  print h1("u=$u");
	  print h1("Ne valida formato");
	  print end_html();
	  exit;
	}

	if ($u) {
		push @a, "--newer=$downts";
		open TS, ">", "$downts.tmp" or die;
		close TS;
		if (! -e $downts) {
			open TS, ">", "$downts" or die;
			close TS;
		}
	}
}

if ($k eq 'cvs') {
	chdir "../../files" or die;
	foreach (split "#", $art) {
		foreach (<CVS/$_.xml,v>) {
		  push @a, $_;
		}
	}
} elsif ($k eq 'xml') {
	chdir "../revo" or die;
	foreach (split "#", $art) {
		foreach (<xml/$_.xml>) {
		  push @a, $_;
		}
	}
} elsif ($k eq 'html') {
	chdir "../revo" or die;
	foreach (split "#", $art) {
		foreach (<art/$_.html>) {
		  push @a, $_;
		}
	}
} else {
	print header(-charset=>'utf-8'),
		  start_html(-title => 'Elŝuti ReVon') if !$dbg;
	print h1("Ne valida kategorio");
	print end_html();
	exit;
}

if ($dbg) {
	print pre(join(" ", @a));
} else {
	print <<EOD;
Content-Disposition: attachment; filename="revo$k.tgz"
Content-Type: application/zip

EOD

	open(STDERR, ">&STDOUT");
	system 'tar', '-czf', '-', @a;
	if ($u) {
		unlink $downts;
		rename "$downts.tmp", $downts;
	}
}
1;
