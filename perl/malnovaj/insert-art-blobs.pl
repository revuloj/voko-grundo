#!/usr/bin/perl

# malnova: nun ekzistas voko-formiko/bin/insert-art-blobs.sh

my $DB = shift @ARGV;
my $dir = shift @ARGV;

my @files = glob "$dir/*.html";

for $art (@files) {
    unless ($art =~ /^\./) {

	print "shovas $art en $DB...\n";

	my $mrk = $1 if ($art =~ /([^\/]+).html/);

	open SQL, "|/usr/bin/sqlite3 $DB"
	    or die "Ne povas lanĉi sqlite3 kun $DB: $!\n";

	print SQL "INSERT into artikolo(mrk,txt) VALUES('$mrk',X'"; 
	print SQL `hexdump -ve '1/1 "%02X"' $art`; 
	print SQL "');\n";
	print SQL ".quit\n";

	close SQL;
    }
}



