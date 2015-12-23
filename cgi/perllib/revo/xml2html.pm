#!/usr/bin/perl

#
# revo::xml2html.pm
# 
# 2009-05-09 Wieland Pusch
#

use strict;
#use warnings;

package revo::xml2html;

use CGI qw(:standard);  # por trovi erarojn (escapeHTML)
use Encode;

######################################################################
sub konv {
  my ($dbh, $xml, $html, $err, $debug) = @_;

#  print "<pre>xml ".(ref $xml)."</pre>\n";
  if (not ref $xml) {
    open IN, "<", $xml or die;
	my $xmltmp = join "", <IN>;
	$xml = \$xmltmp;
	close IN;
  }
#  print "<pre>xml= $xml\n</pre>\n";
  
  my $pid = IPC::Open3::open3(\*CHLD_IN, \*CHLD_OUT, \*CHLD_ERR,
#                      "xalan -XSL ../xsl/revohtml.xsl");
                      "xsltproc ../xsl/revohtml.xsl -");
  print CHLD_IN $$xml;
  close CHLD_IN;
#  binmode CHLD_OUT, ":utf8";
  my $enc = "utf-8";
  $$html = Encode::decode($enc, join('', <CHLD_OUT>));
  close CHLD_OUT;
#  print "<pre>html= ".escapeHTML($$html)."\n</pre>\n" if $debug;
  $$err = join('', <CHLD_ERR>);
  print "<pre>err=$$err</pre>\n" if $$err and $debug;
  close CHLD_ERR;

#  open IN, "<", "$homedir/html/revo/art/$art.html" or die "open";
#  my $html = join '', <IN>;
#  close IN;

  {
    $$html =~ s#<!DOCTYPE .*?>##sm;
    my $sth = $dbh->prepare("SELECT count(*) FROM r2_tezauro WHERE tez_fontref = ? or (tez_celref = ? and tez_tipo in ('sin','vid'))");
    while ($$html =~ m#<!--\[\[\s*ref="(.*?)"\s*\]\]-->\s*#smg) {
      my $ref = $1;
      $sth->execute($1,$1);
      my ($tez_ekzistas) = $sth->fetchrow_array();
	  print "<pre>tez=$1 $tez_ekzistas</pre>\n" if $debug;
      if ($tez_ekzistas) {
  	    $ref =~ tr/./_/;
        $$html =~ s##<a href="/revo/tez/tz_$ref.html" target="indekso"><img src="../smb/tezauro.png" alt="TEZ" title="al la tezauro" border="0"></a>#;
	  } else {
        $$html =~ s###;
	  }
	}
  }
  
  # nur por beligi
  $$html =~ s#</title>\n<script#</title><script#sm;
  $$html =~ s#</script>\n</head>#</script></head>#sm;
  $$html =~ s#<(h1|h2|dl|dd)>\n<#<$1><#smg;
  $$html =~ s#</(h1|h2|h3)>\s+#</$1>#smg;
  $$html =~ s#</(span)>\s+<#</$1><#smg;
  $$html =~ s#</(dd|dl)>\s+<a#</$1><a#smg;
  $$html =~ s#\n(       <a href="\#lng_)#\n   $1#sm;
  $$html =~ s#<br>\n</div>#<br></div>#sm;
  $$html =~ s#</pre>\n</div>#</pre></div>#sm;
  $$html =~ s#<hr>\n<span class="redakto">#<hr><span class="redakto">#sm;
  $$html =~ s#<br>\s+</body>#<br></body>#sm;
  $$html =~ s#</html>\n#</html>#sm;

  return 1;
} 
    
######################################################################

1;

