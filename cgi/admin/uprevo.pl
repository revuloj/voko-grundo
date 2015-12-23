#!/usr/bin/perl

use CGI qw(:standard);
use CGI::Carp qw(fatalsToBrowser);
use Cwd;
use IO::Handle;

# propraj perl moduloj estas en:
use lib("/var/www/web277/files/perllib");
use parseart;
use parseart2;
use revorss;
use revodb;

my $exitcode;

print header,
      start_html('Sendu sxangxitajn pagxojn'),
      h1('fname='.param('fname'));

open LOG, ">>../../../files/log/uprevo.log" or die("ne eblas skribi log");	
autoflush LOG 1;

my $fname = param('fname');

my $homedir = "/var/www/web277";
#print h1("homedir = $homedir");

$ret = `du -sh $homedir`;
print LOG "du -> $exitcode\n$ret\n";
print pre($ret);

my $htmldir = "$homedir/html";
my $xmldir = "$homedir/html/revo/xml";
my $revodir = "$homedir/html/revo";

$ENV{'LD_LIBRARY_PATH'} = "$homedir/files/lib";
#print h1("LD_LIBRARY_PATH = ".$ENV{'LD_LIBRARY_PATH'});
$ENV{'PATH'} = $ENV{'PATH'}.":$homedir/files/bin";
#print h1("PATH = ".$ENV{'PATH'});

print LOG "uprevo started at ".localtime()." with fname=$fname\n";
unless ($fname =~ /^revo-\d\d\d\d\d\d\d\d_\d\d\d\d\d\d\.tgz$/) {
  print LOG "Nevalidaj parametroj\n\n";
  print h1("Nevalidaj parametroj"), end_html;
  exit 1;
}

my $dbfname = $fname;
$dbfname =~ s/^revo-(.*)_\d\d\d\d\d\d\.tgz$/revodb-$1.sql.gz/;
print LOG "dbfname -> $dbfname\n";

my $ret;

chdir $htmldir or die "chdir ne funkciis";

#$ret = `ln -s revo . 2>&1`;
#print h2("ln -s -> $exitcode");
#print pre($ret);

#$ret = `rm revo . 2>&1`;
#print h2("rm -> $exitcode");
#print pre($ret);

#$ret = `tar --help 2>&1`;
#print h2("tar -tv -> $exitcode");
#print pre($ret);

#print h1("cwd=".cwd());

$ret = `rm bv_forigu_tiujn.lst 2>&1`;
$exitcode = $?;
print LOG "rm bv_forigu_tiujn.lst -> $exitcode\n";

$ret = `tar -xvzf alveno/$fname revo/eta revo/dtd revo/art tgz revo/xml revo/xsl revo/cfg revo/tez revo/bld revo/stl revo/smb revo/dok revo/inx revo/index.html revo/sercxo.html revo/titolo.html revo/revo.ico revo/araneo.gif revo/reto.gif revo/revo.jpg revo/revo.gif revo/travidebla.gif bv_forigu_tiujn.lst 2>&1`;
$exitcode = $?;
print h2("tar -xv -> $exitcode");
print LOG "tar -xv -> $exitcode\n$ret";
print pre($ret);
revorss::write($ret, $htmldir, -1, 0);

# Connect to the database.
my $dbh = parseart::connect();
#chdir $revodir or die "chdir revo ne funkciis";
chdir $xmldir or die "chdir revo ne funkciis";
while ($ret =~ m/revo\/xml\/([^.]+)\.xml/gm) {
#  print pre("- $1 -")."\n";
  parseart::parse($dbh, $1, $xmldir, 0);
  parseart2::parse($dbh, $1, $xmldir, 0);
}
$dbh->disconnect() or die "DB disconnect ne funkcias";
chdir $htmldir or die "chdir html ne funkciis";

########### forigi ##############
$ret = `ls -l bv_forigu_tiujn.lst 2>&1`;
$exitcode = $?;
#print h2("ls -> $exitcode");
print LOG "forigi: ls -> $exitcode\n$ret";
#print pre($ret);

$ret = `pwd 2>&1`;
$exitcode = $?;
#print h2("pwd -> $exitcode");
print LOG "pwd -> $exitcode\n$ret";
#print pre($ret);

if (open IN, "<bv_forigu_tiujn.lst") {
#  print h2("open true");
  my $count;
  while (<IN>) {
    chomp;
    if ((/^revo\// or /^tgz\//) and not /\.\./ and not / / and not /\*/ and not /\?/ and not /^$/) {
      print h2("forigi $_");
      print LOG "forigi $_\n";
      my $ret = unlink $_;
      $count += $ret;
      print h2("forigi $_ malsucesis") if !$ret;
      print LOG "forigi $_ malsucesis\n" if !$ret;
    } else {
      print h2("nelegala $_");
      print LOG "nelegala $_\n";
    }
  }
  print h2("forigis $count");
  print LOG "forigis $count\n";
  close IN;

}

$ret = `cat bv_forigu_tiujn.lst 2>&1`;
$exitcode = $?;
#print h2("cat -> $exitcode");
print LOG "cat -> $exitcode\n$ret";
print pre($ret);

print LOG "date: ".`date`."\n";

my $dbtext = "";
my $fsize = `du -h $htmldir/alveno/$fname`; $fsize =~ s/\t.*$//; chomp $fsize;
if (! -e "$htmldir/alveno/$dbfname") {
  my $dumpcmd = revodb::mysqldump;
  $ret = `$dumpcmd --skip-lock-tables | gzip >$htmldir/alveno/$dbfname`;
  print LOG "mysqldump -> \n$ret",
        "date: ".`date`;
  my $dbsize = `du -h $htmldir/alveno/$dbfname`; $dbsize =~ s/\t.*$//; chomp $dbsize;
  $dbtext = "Aktuala datumbazo estas en http://www.reta-vortaro.de/alveno/$dbfname ($dbsize)";
  
  if (param('nomail')) {
    print h2("Ne sendas retmesagxon.")."\n";
  } else {
    print h2("Sendas retmesagxon.")."\n";

    my $from    = revodb::mail_from;
    my $name    = "Revo Upload";
    my $to      = revodb::mail_to;
    my $subject = "Revo Upload";
    my $oldfiles = "";
	
    open IN, "<", "$htmldir/alveno/mail.txt";
    $oldfiles = join('', <IN>);
    close IN;
    open IN, ">", "$htmldir/alveno/mail.txt";
    close IN;

    open SENDMAIL, "| /usr/sbin/sendmail -t 2>&1 >sendmail.log" or print LOG "ne povas sendmail\n";
    print SENDMAIL <<End_of_Mail;
From: $name <$from>
To: $to
Reply-To: $from
Subject: $subject

Novaj sxangxoj alvenis en
$oldfiles http://www.reta-vortaro.de/alveno/$fname ($fsize)
$dbtext
End_of_Mail
    close SENDMAIL;
  }
} else {
  open MAIL, ">>", "$htmldir/alveno/mail.txt";
  print MAIL " http://www.reta-vortaro.de/alveno/$fname ($fsize)\n";
  close MAIL;
}

$ret = `du -sh $homedir`;
#print h2("du -> $exitcode");
print pre($ret);

my $findargs = "$htmldir/alveno -mtime +7 -name \\*gz";
$ret = `find $findargs`;
print LOG "find $findargs -> \n$ret\n";
$ret = `find $findargs | xargs rm`;
print LOG "find rm -> \n$ret\n";

$findargs = "$htmldir/alveno -mtime +2 -name revodb\\*gz";
$ret = `find $findargs`;
print LOG "find $findargs -> \n$ret\n",
$ret = `find $findargs | xargs rm`;
print LOG "find rm -> \n$ret\n";

print LOG "normala fino de uprevo.pl\n\n";
print end_html;

close LOG;

1;
