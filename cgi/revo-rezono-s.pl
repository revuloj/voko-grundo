#!/usr/bin/perl -w

# uzu tiel:
# perl revo_sparql super hundo
# perl revo_sparql sub hundo
# ktp.

use CGI qw/:standard/;
use LWP::UserAgent;
# use Data::Dumper;
# use Text::CSV_XS;

my $debug = 0;
# my $ENDPOINT = "http://localhost:8890/sparql/";
my $ENDPOINT = "http://localhost:8080/openrdf-sesame/repositories/revo";
#my $FORMAT = "text/csv"; 
my $FORMAT = "application/json";
my $DSN="http://purl.org/net/voko/revo#";
my $LIMIT=" LIMIT 100 ";
my $MI="revo_sparql_sesame_cgi/0.1 ";


### procedu la HTTP demandon 
my $incoming_req = CGI->new;

$QUERY = $incoming_req->param('q') || '';
$FORMAT = $incoming_req->param('f') || $FORMAT;
$KAP = $incoming_req->param('kap') || '';
$MRK = $incoming_req->param('mrk') || '';
$TRD = $incoming_req->param('trd') || '';
$LNG = $incoming_req->param('lng') || 'eo';

# get arguments
#my $QUERY = shift @ARGV;
#my $WHAT = shift @ARGV or die "Mankas argumentoj!\n";

my $QUERIES = {
  "test1" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?d voko:snc ?s. 
   }",
  "test2" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?d voko:snc ?s. 
         OPTIONAL { ?s voko:malprt ?s1 OPTION(transitive). }
   }",
  "test3" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?d voko:snc ?s . ?s voko:malprt ?m .
   }",
   "test4" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d. ?s voko:trd ?t
   }",
  "get_objects" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         revo:$MRK ?r ?o . 
   }",
  "get_subjects" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?s ?r revo:$MRK . 
   }",
  "get_super" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         revo:$MRK voko:super ?s . 
   }",
  "all" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?d voko:snc ?s. 
         ?s ?r ?s1 OPTION(transitive). 
   }",
  "snc" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d . 
   }",
  "super" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d . 
         ?s voko:super+ ?o .
         ?d voko:kap ?k .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:drv ?od. ?od voko:kap ?ok . }
         OPTIONAL { ?o voko:kap ?ok . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
  "sub" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
        ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d .
        ?d voko:kap ?k .
        {
          { ?d voko:sub+ ?o . }
          UNION
          { ?s voko:sub+ ?o . }
          UNION
          { ?o voko:super+ ?s . }
          UNION
          { ?o voko:super+ ?d . }
          OPTIONAL { ?s voko:snc-n-ro ?sn . }
          OPTIONAL { ?o voko:drv ?od. ?od voko:kap ?ok . }
          OPTIONAL { ?o voko:kap ?ok . }
          OPTIONAL { ?o voko:snc-n-ro ?on . }
        }
   }",
   "sub2" => "SELECT DISTINCT * FROM <$DSN> WHERE { 
        ?d voko:kap 'hundo'\@eo . ?s voko:drv ?d .
        {
          { ?s voko:sub+ ?s1 . }
          UNION
          { ?s1 voko:super+ ?d . }
        }
   }",
   "malprt" => "SELECT DISTINCT ?s ?sn ?k ?o ?on ?ok FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?s voko:drv ?d . 
         ?s voko:malprt+ ?o .
         ?d voko:kap ?k .
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
         OPTIONAL { ?o voko:drv ?od. ?od voko:kap ?ok . }
         OPTIONAL { ?o voko:kap ?ok . }
         OPTIONAL { ?o voko:snc-n-ro ?on . }
   }",
   "prt" => "SELECT DISTINCT ?dk ?sn FROM <$DSN> WHERE { ?v voko:kap '$KAP'\@eo . ?v voko:prt+ ?s +. 
         OPTIONAL { ?s voko:drv ?d. ?d voko:kap ?dk . }
         OPTIONAL { ?s voko:snc-n-ro ?sn . }
   }",
   "trd" => "SELECT DISTINCT ?d ?s ?s1n ?t (lang(?t) as ?lng) FROM <$DSN> WHERE { 
         ?d voko:kap '$KAP'\@eo . ?d voko:trd ?t. 
         OPTIONAL { ?s voko:drv ?d. ?s voko:trd ?t . OPTIONAL { ?s voko:snc-n-ro ?s1n . }}
   }"
};

#### Kontrolu parametrojn
die "Nedifinita demando \"$QUERY\"!\n" unless defined($QUERIES->{$QUERY});
die "Nevalidaj signoj en parametro 'kap'\n" unless ($KAP =~ /^[\w]*$/);
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
print $incoming_req -> header(-type => $FORMAT, -charset => 'UTF-8');
print $data;
print "\n";
exit();

##############################################################################

sub sparqlQuery {
  my $query=shift;
  my $baseURL=shift;
  my $format=shift;
	
	#  "should-sponge" => "soft",
	
  my %params=(
	  "timeout" => "10000" 
	);
	
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
  $req->header("Accept" => "$format");
  $req->header("Content-Type" => "application/x-www-form-urlencoded");
  $req->content("query=".CGI::escape($query));

  my $res = $ua->request($req);
  return $res->content;
}


