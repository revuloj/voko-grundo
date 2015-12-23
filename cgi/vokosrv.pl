#!/usr/bin/perl
#########################################################
# Jen tre malgranda TTT-servileto
# Ghi estas farita nur por loka uzo de unusola uzanto
# de elektronika vortaro.
#
# voku ghin ekz. per
#
#    perl vokosrv 8888
# 
# 8888 estas la pordo (angle: port), kie
# ghi auskultas al klientoj, vi povas uzi alian numeron.
#
##########################################################

########## kelkaj konstantoj ############

# se ne estas indikita la pordo, provu
# konektighi che la kutima TTT-pordo

($port) = @ARGV;
$port = 8888 unless $port;

# diversaj necesajhoj por la TCP/IP-protokolo

$AF_INET = 2;
$SOCK_STREAM = 1;
$sockaddr = 'S n a4 x8';

# de kie mi estas vokita?
$vortaro = $0; 

# se vokita per perl ...vokosrv.pl, forigu la "perl "
$vortaro =~ s/^perl //;

# se vokita sen pado, aldonu './' komence
$vortaro =~ s/^(vokosrv.pl)$/.\/$1/;

# sub Windows anstatauigu \ per /
$vortaro =~ s|\\|/|g; 

# elprenu nun la padon
if (not $vortaro =~ s/\/vokosrv.pl$//) {
    die "Mi ne estas vokosrv.pl au ne estas en ghusta loko ".
	"($vortaro).\n"};

# kaze, ke temas pri UNC-nomo, reanstatauigu / per \
if ($vortaro =~ m|^//|) {
  $vortaro =~ s|/|\\|g;
};

######### komenco de la programo ################

# ricevu la protokolon kaj la servnomon

($name, $aliases, $proto) = getprotobyname('tcp');
if ($port !~ /^\d+$/) {
    ($name, $aliases, $port) = getservbyport($port, 'tcp');
}

print "protokolo = $name\n";
print "pordo = $port\n";

# konstruu konektilon (angle: socket)

$this = pack($sockaddr, $AF_INET, $port, "\0\0\0\0");
socket(S, $AF_INET, $SOCK_STREAM, $proto) || die "konektileraro: $!";
bind(S,$this) || die "ligeraro: $!";

# auskultu

listen(S,5) || die "konekteraro: $!";
print "atendas klienton ...\n";

# daure akceptu konektojn

while (1) {
  ($addr = accept(NS,S)) || die $!;

  print "akcepto en ordo\n";

  ($af,$port,$inetaddr) = unpack($sockaddr,$addr);
  @inetaddr = unpack('C4',$inetaddr);
  print "$af $port @inetaddr\n";

  # legu la deziron, analizu ghin kaj redonu dokumenton

  $line= <NS>;
     ($method,$doc,$param)=&Eval($line);
     if (($doc =~/serchcgi.pl$/) and ($method eq 'GET')) {
          &SendDoc(NS,$doc,$param);
      } else {
          &SendDefaultDoc(NS);
      };

     # fermu la konekton
     close  NS;
}

# analizas deziron kaj redonas la
# ghustan dosiernomon

sub Eval {

  local $line=$_[0];
  local $doc_str;
  local $doc,$param,$method,$query_string;

  # $line havas la formon: GET dokumento aliaj_informoj
  print "deziro: $line\n";
  $line =~ /(GET|POST) ([^ ]*)/;
  $method = $1;
  $doc_str = $2;  

  # dispartigu $doc_str che la demandsigno 
  # en dosiernomon kaj demandsignaron
  $doc_str =~ /([^\?]*)\??(.*)/;
  $doc = $1;
  $query_string = $2;

  # forigu spacsignojn en $doc
  $doc =~ s/%20|\+/ /g;
  # dispartigu eblan komandon kaj parametrojn
  $doc =~ /([^ ]*) ?(.*)/;
  $doc = $1;
  $param = $2;

  $ENV{'QUERY_STRING'} = $query_string;
  $ENV{'REQUEST_METHOD'} = $method;
  return ($method,$doc,$param);
}

# sendas dokumenton

sub SendDoc {
  local ($SOCK,$doc,$param)=@_;
  local $size;

  select $SOCK;
  $|=1;

  # sendu la kapliniojn
  print "HTTP/1.0 200 OK\n";
#  print "MIME-Version: 1.0\n";

  # perl-programeto produktas la dosieron -> startu ghin
  print STDOUT "startas: perl $vortaro$doc $param\n";

  open PL,"perl $vortaro$doc|";
  while (<PL>) {
    print $SOCK $_;
  }
  close PL;

  select STDOUT;
}

# sendas erarmesaghon

sub SendDefaultDoc {
  local $SOCK=$_[0];

  select $SOCK;
  $|=1;   # skribu signojn tuj

  print "HTTP/1.0 200 OK\n";
#  print "MIME-Version 1.0\n";

  print "Content-Type: text/html\n\n";
  print "<html>\n<head>\n<title>erarmesagho</title>\n</head>\n";
  print "<body>\n<h1>Eraro: Ne traktebla deziro!</h1>\n";
  print "La dezirita dokumento ne povis esti sendata.\n";
  print "</body>\n</html>\n";

  select STDOUT;
};



