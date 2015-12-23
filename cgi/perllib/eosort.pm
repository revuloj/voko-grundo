
use strict;

package eosort;

use Unicode::String qw(utf8);

my @_order_kodoj = ('A'..'Z','a'..'z');

##############################################
# cxiuj literoj en unu linio estas samvaloroj
# ili estas ordigita aux tio ordo
##############################################
my @_order_ci = (
['a', 'A', '\u00E1', '\u00E0', '\u00E2', '\u00C0', '\u00C2', '\u00E4', '\u00C4', '\u00E6', '\u00C6'],
['b', 'B'],
['c', 'C', '\u00E7', '\u00C7'],
['\u0109', '\u0108'],
['d', 'D'],
['e', 'E', '\u00E9', '\u00C9', '\u00E8', '\u00C8', '\u00EA', '\u00CA', '\u00EB', '\u00CB'],
['f', 'F'],
['g', 'G'],
['\u011D', '\u011C'],
['h', 'H'],
['\u0125', '\u0124'],
['i', 'I', '\u00ED', '\u00CD', '\u00EC', '\u00CC', '\u00EE', '\u00CE', '\u00EF', '\u00CF'],
['j', 'J'],
['\u0135', '\u0134'],  # jx JX
['k', 'K'],
['l', 'L'],
['m', 'M'],
['n', 'N'],
['o', 'O', '\u00F3', '\u00D3', '\u00F2', '\u00D2', '\u00F4', '\u00D4', '\u00F6', '\u00D6', '\u0153', '\u0152'],
['p', 'P'],
['q', 'Q'],
['r', 'R'],
['s', 'S', '\u00DF'],  # s S ß
['\u015D', '\u015C'],  # sx SX
['t', 'T'],
['u', 'U', '\u00F9', '\u00D9', '\u00FB', '\u00DB', '\u00FC', '\u00DC'],  # u U . . . . ü Ü
['\u016D', '\u016C'],  # ux, UX
['v', 'V'],
['w', 'W'],
['x', 'X'],
['y', 'Y'],
['z', 'Z'],
[',', '.', '\''],
);

#####################################################
# cxiuj postaj literoj estas egala al la unua litero
#####################################################
my @_order_ci2 = (
[ '\u0401',  # c_Jo
  '\u0451'], # c_jo

[ '\u0404',  # c_Jeu
  '\u0454'], # c_jeu

[ '\u0406',  # c_Ib
  '\u0456'], # c_ib

[ '\u0407',  # c_Ji
  '\u0457'], # c_ji

[ '\u040E',  # c_W
  '\u045E'], # c_w

[ '\u0410',  # c_A
  '\u0430'], # c_a

[ '\u0411',  # c_B
  '\u0431'], # c_b

[ '\u0412',  # c_V
  '\u0432'], # c_v

[ '\u0413',  # c_G
  '\u0433'], # c_g

[ '\u0414',  # c_D
  '\u0434'], # c_d

[ '\u0415',  # c_Je
  '\u0435'], # c_je

[ '\u0416',  # c_Zh
  '\u0436'], # c_zh

[ '\u0417',  # c_Z
  '\u0437'], # c_z

[ '\u0418',  # c_I
  '\u0438'], # c_i

[ '\u0419',  # c_J
  '\u0439'], # c_j

[ '\u041A',  # c_K
  '\u043A'], # c_k

[ '\u041B',  # c_L
  '\u043B'], # c_l

[ '\u041C',  # c_M
  '\u043C'], # c_m

[ '\u041D',  # c_N
  '\u043D'], # c_n

[ '\u041E',  # c_O
  '\u043E'], # c_o

[ '\u041F',  # c_P
  '\u043F'], # c_p

[ '\u0420',  # c_R
  '\u0440'], # c_r

[ '\u0421',  # c_S
  '\u0441'], # c_s

[ '\u0422',  # c_T
  '\u0442'], # c_t

[ '\u0423',  # c_U
  '\u0443'], # c_u

[ '\u0424',  # c_F
  '\u0444'], # c_f

[ '\u0425',  # c_H
  '\u0445'], # c_h

[ '\u0426',  # c_C
  '\u0446'], # c_c

[ '\u0427'], # c_Ch

[ '\u0428',  # c_Sh
  '\u0448'], # c_sh

[ '\u0429',  # c_Shch
  '\u0449'], # c_shch

[ '\u042B',  # c_Y
  '\u044B'], # c_y

[ '\u042C',  # c_Mol
  '\u044C'], # c_mol

[ '\u042D',  # c_E
  '\u044D'], # c_e

[ '\u042E',  # c_Ju
  '\u044E'], # c_ju

[ '\u042F',  # c_Ja
  '\u044F'], # c_ja

[ '\u0447'], # c_ch

[ '\u044A'], # c_malmol

[ '\u0490',  # c_Gu
  '\u0491'], # c_gu

# lingvo araba
[ '\u0627',  # alif
  '\u0623',  # alif_hamza_sure
  '\u0625',  # alif_hamza_sube
  '\u0622',  # alif_madda
  '\u0671',  # alif_wasla
  '\u0621'], # hamza
);

###################################################
# cxio unua litero egalas al la teksto en dua loko
###################################################
#my @_order_ci3 = (
#[ '\u0153', 'oe' ], # oe lig
#[ '\u0152', 'oe' ], # OE lig
#[ '\u00E6', 'ae' ], # ae lig
#[ '\u00C6', 'ae' ], # ae lig
#);

##############################################
sub new
{
  my $type = shift;
  my %params = @_;
  my $self = {dbg=>$params{dbg}};
  my %mapper_ci;
	
  my $count = $#_order_ci;
  print "count = $count\n" if $self->{dbg};
  die "Ne suficxe da kodoj" if $#_order_kodoj < $count;
  for my $i (0..$count) {
    my $aref = $_order_ci[$i];
    print "i = $i\n" if $self->{dbg};
    my $kodo = $_order_kodoj[$i];
    print "kodo = $kodo\n" if $self->{dbg};
    foreach (@$aref) {
      my $u = utf8($_);
      if (/^\\[u](....)$/) {
        print "u $1\n" if $self->{dbg};
        $u->hex($1);
      }
      my @lit = $u->unpack('U*');
      die "pli ol unu unikodo letero: $u" if $#lit > 0;
      print "lit = $lit[0], lit = $_\n" if $self->{dbg};
      $mapper_ci{$lit[0]} = $kodo;
    }
    print "\n" if $self->{dbg};
  }

  my $count = $#_order_ci2;
  print "count = $count\n" if $self->{dbg};
  for my $i (0..$count) {
    my $aref = $_order_ci2[$i];
    print "$i: " if $self->{dbg};
    my $start_val;
    foreach (@$aref) {
      my $u = utf8($_);
      if (/^\\[u](....)$/) {
        print "u $1 " if $self->{dbg};
        $u->hex($1);
      }
      my @lit = $u->unpack('U*');
      die "pli ol unu unikodo letero: ".$u->utf8() if $#lit > 0;
      $start_val = $lit[0] unless $start_val;
      print "$lit[0] -> $start_val " if $self->{dbg};
      $u->chr($start_val);
      $mapper_ci{$lit[0]} = $u->utf8();
    }
    print "\n" if $self->{dbg};
  }

#  my $count = $#_order_ci3;
#  print "ci3 count = $count\n" if $self->{dbg};
#  for my $i (0..$count) {
#    my $aref = $_order_ci3[$i];
#    print "$i: " if $self->{dbg};
#
#    my $u = utf8($$aref[0]);
#    if ($$aref[0] =~ /^\\[u](....)$/) {
#      print "u $1 " if $self->{dbg};
#      $u->hex($1);
#    }
#    my @lit = $u->unpack('U*');
#    die "pli ol unu unikodo letero: ".$u->utf8() if $#lit > 0;
#    print "$lit[0] -> $$aref[1] " if $self->{dbg};
#    my @a = utf8($$aref[1])->unpack('U*');
#    print join("-", map {$mapper_ci{$_}} @a) if $self->{dbg};
#    $mapper_ci{$lit[0]} = join("", map {$mapper_ci{$_}} @a);
#
#    print "\n" if $self->{dbg};
#  }

  $self->{mapper_ci}  = \%mapper_ci;
  bless $self, $type;
}

sub remap_ci
{
  my $self = shift;
  my $u = shift;
  $u =~ s/[- ]//g;
  $u = utf8($u);
  print "remap_ci ($u)\n" if $self->{dbg};
  print "$_ len=".$u->length()."\n" if $self->{dbg};
  my @lit = $u->unpack('U*');
  print "lit = ".join('-', @lit)."\n" if $self->{dbg};
  for (my $i = $#lit; $i >= 0; $i--) {
    print "test $i: $lit[$i]\n" if $self->{dbg};
    splice(@lit,$i,1) if $lit[$i] == 40 or $lit[$i] == 41 or $lit[$i] == 44;
  }
  print "lit = ".join('-', @lit)."\n" if $self->{dbg};
  my $mapref = $self->{mapper_ci};
  foreach (@lit) {
    print "lit = $_ -> $$mapref{$_}\n" if $self->{dbg};
    if (exists($$mapref{$_})) {
      $_ = $$mapref{$_} 
    } else {
      print "noexist: $_\n" if $self->{dbg};
      $u->chr($_);
      $_ = $u->utf8();
      print "lit = -> $_\n" if $self->{dbg};
    }
  }
  print "lit = ".join('-', @lit)."\n" if $self->{dbg};
  return join('', @lit);
}

sub remap_ci_lng
{
  my $self = shift;
  my $u = utf8(shift);
  my $lng = shift;
  print "remap_ci_lng (".$u->utf8().", $lng)\n" if $self->{dbg};

}
