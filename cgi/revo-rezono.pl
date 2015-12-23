#!/usr/bin/perl -w

# vi povas testi ekz. tiel:
#  ./revo-rezono.pl kap=hundo q=super f=text

use CGI qw/:standard/;
use LWP::UserAgent;
use utf8;
#use feature 'unicode_strings';
# use Data::Dumper;
# use Text::CSV_XS;

my $debug = 0;
# por testi kun "localhost":
####my $ENDPOINT = "http://localhost:3030/revo/query";
#my $ENDPOINT = "http://localhost/revo/query";

# h2181216.stratoserver.net
my $ENDPOINT = "http://85.214.196.132/revo/query";

#my $FORMAT = "text/csv"; 
#my $FORMAT = "application/json";
my $FORMAT = "json"; 

my $DSN="http://purl.org/net/voko/revo#";
my $LIMIT=" LIMIT 100 ";
my $MI="revo_rezono_pl/0.2 ";


### procedu la HTTP demandon 
my $incoming_req = CGI->new;

$QUERY = $incoming_req->param('q') || '';
$FORMAT = $incoming_req->param('f') || $FORMAT;
$KAP = $incoming_req->param('kap') || ''; utf8::decode($KAP);
$MRK = $incoming_req->param('mrk') || '';
$TRD = $incoming_req->param('trd') || ''; utf8::decode($TRD);
$LNG = $incoming_req->param('lng') || 'eo';

# get arguments
#my $QUERY = shift @ARGV;
#my $WHAT = shift @ARGV or die "Mankas argumentoj!\n";

my $QUERIES = {
  "get_objects" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         revo:$MRK ?r ?o . 
   }",
  "get_subjects" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?s ?r revo:$MRK . 
   }",
  "get_super" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         revo:$MRK voko:super ?s . 
   }",
  "get_dif_cycle" => "SELECT ?x1 ?x2 ?y2 ?y1 FROM <$DSN> WHERE {
  	?x1 voko:dif ?x2; voko:drv* ?d1 . 
        ?y2 voko:dif ?y1; voko:drv* ?d2 .
        ?x2 voko:drv* ?d2 .
        ?y1 voko:drv* ?d1
   }",
  "all_dif" => "SELECT * FROM <$DSN> WHERE { 
        ?x voko:dif ?y . 
   }",
  "all" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo . 
         ?s ?r ?o . 
   }",
  "not_super" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM revo: WHERE { 
         ?s voko:kap 'homo'\@eo ;
            voko:kap ?k .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
         MINUS {?s (voko:super|voko:lst) ?o . }
   }", # nebone ghisnun, char chiam la samajn rezultojn donas...
  "testsub" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:sub ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
        } ORDER BY ?s ?ok ?o 
   ",
  "snc" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d . 
   }",
  "sin" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:sin ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "ant" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:ant ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "vid" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:vid ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "super" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            (voko:super|voko:lst) ?o .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "super_iuj" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?s voko:kap ?k ;
            (voko:super|voko:lst) ?o .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "sub" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:sub ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "lst" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:lst ?o .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "ekz" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?s voko:kap '$KAP'\@eo ;
           voko:kap ?k ;
           voko:ekz ?o .
        ?o voko:kap ?ok . 
        OPTIONAL { ?s voko:snc-n-ro ?sn . }
        OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
   "malprt" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:malprt/voko:sub{0,3} ?o .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
   "malprt_char" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:malprt ?malprt .
            ?malprt voko:sub{0,3} ?o .
         ?o voko:kap ?ok .
   }",

   "prt" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:super{0,3}/voko:prt ?o .
         ?o voko:kap ?ok .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
   "prt_char" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:super{0,3} ?super .
            ?super voko:prt ?o .
         ?o voko:kap ?ok .
   }",



   "trd" => "SELECT DISTINCT ?s ?sn ?k ?t (lang(?t) as ?l) FROM <$DSN> WHERE { 
         ?s voko:kap '$KAP'\@eo ;
            voko:kap ?k ;
            voko:trd ?t. 
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?s voko:snc ?o. ?o voko:trd ?t . }
   }"
};

#### kaplinioj de la respondo ...
my $f = $FORMAT;
$f = "text/plain" if $f eq "text";
$f = "application/json" if $f eq "json";
print $incoming_req -> header(-type => $f, -charset => 'UTF-8');

#### Kontrolu parametrojn
die "Nedifinita demando \"$QUERY\"!\n" unless defined($QUERIES->{$QUERY});
die "Nevalidaj signoj en parametro 'kap'\n" unless ($KAP =~ /^[\w ]*$/);
die "Nevalida parametro 'mrk'\n" unless (
  not $MRK or (
         (substr($MRK,0,length($DSN)) eq $DSN)
    and  (substr($MRK,strlen($DSN)) =~ /^[A-Za-z0-9\_]+$/)
  )
);
die "Nevalidaj signoj en parametro 'trd'\n" unless ($TRD =~ /^[\w]*$/);
die "Nevalidaj lingvo en parametro 'lng'\n" unless ($LNG =~ /^[a-z]{2,3}$/);

### demandu al la SPARQL-servo
my $PRAGMAS = ""; #DEFINE input:inference \"voko-trans\"\nDEFINE sql:signal-void-variables 0\n";

my $PREFIXES = 
"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX voko: <http://purl.org/net/voko#>
PREFIX revo: <http://purl.org/net/voko/revo#>\n
";

my $sparql = $PRAGMAS.$PREFIXES.$QUERIES->{$QUERY}." $LIMIT\n";
warn "$sparql\n" if ($debug);
$data=sparqlQuery($sparql, $ENDPOINT, $FORMAT);

### resendu la respondon

print $data;
print "\n";
exit();

##############################################################################

sub sparqlQuery {
  my $query=shift;
  my $baseURL=shift;
  my $format=shift;
	
	#  "should-sponge" => "soft",
	
#  my %params=(
#	  "timeout" => "10000" 
#	);
	
  my @fragments=();
  foreach $k (keys %params) {
    my $fragment = "$k=".CGI::escape($params{$k});
    push(@fragments,$fragment);
  }
  my $parstr=join("&", @fragments);
	
  my $sparqlURL="${baseURL}?$parstr";
	
  my $ua = LWP::UserAgent->new;
  $ua->agent($MI);

  my $req = HTTP::Request->new(POST => $sparqlURL);
#  $req->header("Accept" => "$format");
  $req->header("Content-Type" => "application/x-www-form-urlencoded");
  $req->content("query=".CGI::escape($query).'&output='.CGI::escape($format));

  my $res = $ua->request($req);
  return $res->content;
}
