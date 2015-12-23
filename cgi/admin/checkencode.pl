#!/usr/bin/perl

#
# parseart2.pl
# 
# 2008-03-24 Wieland Pusch
#

use strict;

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use DBI();

print header(-charset=>'utf-8'),
      start_html(-title => 'Enhavo de '.param('art').".xml");

if (param('arts')) {
  param('art', join('#', split /\r*\n/,param('arts')));
} elsif (!param('art')) {
  print h1('arts = '.param('arts'));
  print h2('arts = '.join('#', split /\r*\n/,param('arts')));
  print start_form();
  print textarea(-name=>'arts',
                 -rows=>10,
                 -columns=>50),
        hidden(-name=>'verbose',
               -default=>param('verbose'));
  print br, submit(-name=>'button');
  print endform;
  print end_html();
  exit 1;
}

print h1('Enhavo de '.param('art').".xml");

my $homedir = "/var/www/web277";
print h1("homedir = $homedir");

my $start_time = time();

my $xmldir = "$homedir/html/revo/xml";

$ENV{'LD_LIBRARY_PATH'} = "$homedir/files/lib";
#print h1("LD_LIBRARY_PATH = ".$ENV{'LD_LIBRARY_PATH'});
$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";
#print h1("PATH = ".$ENV{'PATH'});

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use revo::encode;
use revo::decode;

my @arts;
if (param('arts')) {
  @arts = sort split /\r*\n/,param('arts');
} else {
  push @arts, param('art');
}

my $verbose = param('verbose');
#$verbose = 0 unless $verbose;

my $art_count;
my $last_art;
foreach my $art (@arts) {
  if ($art && $art ne $last_art) {
    $art_count += checkencode($art, $xmldir);
    $last_art = $art;
  }
}
  
print h2("Tuta dauxro: ".(time() - $start_time)." sekundoj por $art_count artikoloj.");
print h1("Fino.");

print end_html();

sub checkencode {
  my ($art, $xmldir) = @_;
  my $num;
  print "art=$art xmldir=$xmldir<br>\n";

  foreach my $fname (<$xmldir/$art.xml>) {
#    print "fname = $fname<br>\n";
    $num++;

    open IN, "<", $fname or die "open";
    my $xml = join('', <IN>);
    close $xml;

    my $xml2 = revo::decode::rvdecode($xml);

    my $xml3 = revo::encode::encode2($xml2, 20, 0);

      $xml =~ s/&#8211;/&ndash;/g;
      $xml =~ s/&#259;/&abreve;/g; 
      $xml =~ s/&#355;/&tcedil;/g; 
      $xml =~ s/&#225;/&aacute;/g; 
      $xml =~ s/&#7944;/&Alfa_psili;/g; 
      $xml =~ s/&#244;/&ocirc;/g; 
      $xml =~ s/&#237;/&iacute;/g; 
      $xml =~ s/&#365;/&ubreve;/g; 
      $xml =~ s/&#233;/&eacute;/g; 
      $xml =~ s/&#232;/&egrave;/g; 
      $xml =~ s/&#322;/&lstroke;/g; 
      $xml =~ s/&#231;/&ccedil;/g; 
      $xml =~ s/&#227;/&atilde;/g; 
      $xml =~ s/&#8166;/&ypsilon_circ;/g; 
      $xml =~ s/&#x103;/&abreve;/g; 
      $xml =~ s/&#1576;/&ba;/g; 
      $xml =~ s/&#1607;/&ha;/g; 
      $xml =~ s/&#1610;/&ya;/g; 
      $xml =~ s/&#1605;/&mim;/g; 
      $xml =~ s/&#1608;/&waw;/g; 
      $xml =~ s/&#1579;/&tha;/g; 
      $xml =~ s/&#1578;/&ta;/g; 
  
      $xml =~ s/&#234;/&ecirc;/g; 
      $xml =~ s/&#x2192;/&#8594;/g; 
      $xml =~ s/&#1632;/&ar_0;/g;
      $xml =~ s/&#1633;/&ar_1;/g;
      $xml =~ s/&#1634;/&ar_2;/g;
      $xml =~ s/&#1635;/&ar_3;/g;
      $xml =~ s/&#1636;/&ar_4;/g;
      $xml =~ s/&#1637;/&ar_5;/g;
      $xml =~ s/&#1638;/&ar_6;/g;
      $xml =~ s/&#1639;/&ar_7;/g;
      $xml =~ s/&#1640;/&ar_8;/g;
      $xml =~ s/&#1641;/&ar_9;/g; 
      $xml =~ s/&#x2286;/&#8838;/g; 
      $xml =~ s/&#x2124;/&#8484;/g; 
      $xml =~ s/&#243;/&oacute;/g; 
      $xml =~ s/&#226;/&acirc;/g; 
      $xml =~ s/&#250;/&uacute;/g; 
      $xml =~ s/&#160;/&nbsp;/g; 
      $xml =~ s/&#252;/&uuml;/g; 
      $xml =~ s/&#1585;/&ra;/g; 
      $xml =~ s/&#1606;/&nun1;/g; 
      $xml =~ s/&#224;/&agrave;/g; 
      $xml =~ s/&#x15F;/&scedil;/g; 
      $xml =~ s/&#349;/&scirc;/g; 
      $xml =~ s/&#201;/&Eacute;/g; 
      $xml =~ s/&#7988;/&jota_psili_acute;/g; 
      $xml =~ s/&#x221e;/&#8734;/g; 
      $xml =~ s/&#8150;/&jota_circ;/g; 
      $xml =~ s/&#8212;/&mdash;/g; 
      $xml =~ s/&#942;/&eta_ton;/g; 
      $xml =~ s/&#x2264;/&#8804;/g; 
      $xml =~ s/&#x451;/&c_jo;/g; 
      $xml =~ s/&#1111;/&c_ji;/g; 
      $xml =~ s/&#x2282;/&#8834;/g; 
      $xml =~ s/&#x2201;/&#8705;/g; 
      $xml =~ s/&#x2228;/&#8744;/g; 
      $xml =~ s/&#x2227;/&#8743;/g; 
      $xml =~ s/&#x2261;/&#8801;/g; 
      $xml =~ s/&#60;/&lt;/g; 
      $xml =~ s/&#62;/&gt;/g; 
      $xml =~ s/&#285;/&gcirc;/g; 
      $xml =~ s/&#x163;/&tcedil;/g; 
      $xml =~ s/&#x2116;/&#8470;/g; 
      $xml =~ s/&#xd7;/&#215;/g; 
      $xml =~ s/&#x2219;/&#8729;/g; 
      $xml =~ s/&#x2020;/&#8224;/g; 
      $xml =~ s/&#x2666;/&#9830;/g; 
      $xml =~ s/&#x672C;/&#26412;/g; 
      $xml =~ s/&#x307B;/&#12411;/g; 
      $xml =~ s/&#x3093;/&#12435;/g; 
      $xml =~ s/&#318;/&lcaron;/g; 
      $xml =~ s/&#1108;/&c_jeu;/g; 
      $xml =~ s/&#x305;/&#773;/g; 
      $xml =~ s/&#x117;/&#279;/g; 
      $xml =~ s/&#x2208;/&#8712;/g; 
      $xml =~ s/&#182;/&para;/g; 
      $xml =~ s/&#324;/&nacute;/g; 
      $xml =~ s/&#263;/&cacute;/g; 
      $xml =~ s/&#382;/&zcaron;/g; 
      $xml =~ s/&#1118;/&c_w;/g;
      $xml =~ s/&#x30A2;/&#12450;/g; 
      $xml =~ s/&#x30EA;/&#12522;/g; 
      $xml =~ s/&#x3042;/&#12354;/g; 
      $xml =~ s/&#x308A;/&#12426;/g; 
      $xml =~ s/&#x306E;/&#12398;/g; 
      $xml =~ s/&#x5DE3;/&#24035;/g; 
      $xml =~ s/&#x306E;/&#12398;/g; 
      $xml =~ s/&#x3059;/&#12377;/g; 
      $xml =~ s/&#351;/&scedil;/g; 
    if (param('samsignifa')) {
      $xml =~ s/ŭ/&ubreve;/g; 
      $xml =~ s/ĉ/&ccirc;/g; 
      $xml =~ s/ŝ/&scirc;/g; 
      $xml =~ s/―/&dash;/g; 
      $xml =~ s/Ĉ/&Ccirc;/g; 
      $xml =~ s/„/&leftquot;/g; 
      $xml =~ s/“/&rightquot;/g; 
      $xml =~ s/И/&c_I;/g;
      $xml =~ s/л/&c_l;/g;
      $xml =~ s/ь/&c_mol;/g;
      $xml =~ s/я/&c_ja;/g;
      $xml =~ s/ć/&cacute;/g; 
      $xml =~ s/ĝ/&gcirc;/g; 
      $xml =~ s/н/&c_n;/g; 
      $xml =~ s/а/&c_a;/g; 
      $xml =~ s/с/&c_s;/g; 
      $xml =~ s/т/&c_t;/g; 
      $xml =~ s/ñ/&ntilde;/g; 
      $xml =~ s/ν/&ny;/g; 
      $xml =~ s/ο/&omikron;/g; 
      $xml =~ s/σ/&sigma;/g; 
      $xml =~ s/τ/&tau;/g; 
      $xml =~ s/α/&alfa;/g; 
      $xml =~ s/λ/&lambda;/g; 
      $xml =~ s/γ/&gamma;/g; 
      $xml =~ s/ί/&jota_ton;/g; 
      $xml =~ s/á/&aacute;/g; 
      $xml =~ s/г/&c_g;/g; 
      $xml =~ s/і/&c_ib;/g; 
      $xml =~ s/ê/&ecirc;/g; 
      $xml =~ s/ó/&oacute;/g; 
      $xml =~ s/и/&c_i;/g; 
      $xml =~ s/ч/&c_ch;/g; 
      $xml =~ s/о/&c_o;/g; 
      $xml =~ s/ы/&c_y;/g; 
      $xml =~ s/е/&c_je;/g; 
      $xml =~ s/к/&c_k;/g; 
      $xml =~ s/й/&c_j;/g; 
      $xml =~ s/з/&c_z;/g; 
      $xml =~ s/ф/&c_f;/g; 
      $xml =~ s/у/&c_u;/g; 
      $xml =~ s/р/&c_r;/g; 
      $xml =~ s/ő/&odblac;/g; 
      $xml =~ s/ç/&ccedil;/g; 
      $xml =~ s/в/&c_v;/g; 
      $xml =~ s/д/&c_d;/g; 
      $xml =~ s/м/&c_m;/g; 
      $xml =~ s/х/&c_h;/g; 
      $xml =~ s/ü/&uuml;/g; 
      $xml =~ s/ĵ/&jcirc;/g; 
      $xml =~ s/ш/&c_sh;/g; 
      $xml =~ s/б/&c_b;/g; 
      $xml =~ s/п/&c_p;/g; 
      $xml =~ s/э/&c_e;/g; 
      $xml =~ s/ж/&c_zh;/g; 
      $xml =~ s/é/&eacute;/g; 
      $xml =~ s/ë/&euml;/g; 
      $xml =~ s/ё/&c_jo;/g; 
      $xml =~ s/ц/&c_c;/g; 
      $xml =~ s/í/&iacute;/g; 
      $xml =~ s/ö/&ouml;/g; 
      $xml =~ s/ą/&aogonek;/g; 
      $xml =~ s/ä/&auml;/g; 
      $xml =~ s/ю/&c_ju;/g; 
      $xml =~ s/щ/&c_shch;/g; 
      $xml =~ s/ű/&udblac;/g; 
      $xml =~ s/ú/&uacute;/g; 
      $xml =~ s/è/&egrave;/g; 
      $xml =~ s/à/&agrave;/g; 
      $xml =~ s/ô/&ocirc;/g; 
      $xml =~ s/ĥ/&hcirc;/g; 
      $xml =~ s/ž/&zcaron;/g; 
      $xml =~ s/ў/&c_w;/g; 
      $xml =~ s/Ŝ/&Scirc;/g; 
      $xml =~ s/â/&acirc;/g; 
      $xml =~ s/ζ/&zeta;/g; 
      $xml =~ s/ι/&jota;/g; 
      $xml =~ s/ť/&tcaron;/g; 
      $xml =~ s/ã/&atilde;/g; 
      $xml =~ s/κ/&kappa;/g; 
      $xml =~ s/ς/&sigma_fina;/g; 
      $xml =~ s/ý/&yacute;/g; 
      $xml =~ s/∅/&#8709;/g; 
      $xml =~ s/ł/&lstroke;/g; 
      $xml =~ s/Ä/&Auml;/g; 
      $xml =~ s/ę/&eogonek;/g; 
      $xml =~ s/Ĝ/&Gcirc;/g; 
      $xml =~ s/î/&icirc;/g; 
      $xml =~ s/ß/&szlig;/g; 
      $xml =~ s/ń/&nacute;/g; 
      $xml =~ s/ś/&sacute;/g; 
      $xml =~ s/ż/&zdot;/g; 
      $xml =~ s/Å/&Aring;/g; 
      $xml =~ s/¶/&para;/g; 
      $xml =~ s/π/&pi;/g; 
      $xml =~ s/υ/&ypsilon;/g; 
      $xml =~ s/ε/&epsilon;/g; 
      $xml =~ s/μ/&my;/g; 
      $xml =~ s/ώ/&omega_ton;/g; 
      $xml =~ s/ω/&omega;/g; 
      $xml =~ s/ά/&alfa_ton;/g; 
      $xml =~ s/δ/&delta;/g; 
      $xml =~ s/θ/&theta;/g; 
      $xml =~ s/š/&scaron;/g; 
      $xml =~ s/β/&beta;/g; 
      $xml =~ s/ό/&omikron_ton;/g; 
      $xml =~ s/ή/&eta_ton;/g; 
      $xml =~ s/æ/&aelig;/g; 
      $xml =~ s/ř/&rcaron;/g; 
      $xml =~ s/ъ/&c_malmol;/g; 
#      $xml =~ s///g; 
#      $xml =~ s///g; 
#      $xml =~ s///g; 
#      $xml =~ s///g; 
#      $xml =~ s///g; 
    }
  
    my @xml = split '\n', $xml;
    my @xml2 = split '\n', $xml2;
    my @xml3 = split '\n', $xml3;

    print "$#xml - $#xml3<br>\n" if $#xml != $#xml3;
    for my $i (0 .. $#xml) {
      print pre(escapeHTML("$fname:\n$xml[$i]\n$xml3[$i]\n$xml2[$i]\n")) if $xml[$i] ne $xml3[$i];
    }
  }

  return $num;
};

1;
