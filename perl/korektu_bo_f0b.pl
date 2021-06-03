#!/bin/perl

my $debug = 1;

# flikas mankantan &#xF0B; en tibetaj tradukoj kie ĝi mankas en la fino.

for $file (@ARGV) {
    print "$file...\n";

    process($file);
}

sub process {
    my $file = shift;

    open FILE,"<$file" or die "Ne povas malfermi $file: $!\n";
    my @lines = <FILE>;
    close FILE;

    my $modified = 0;
    my @new = ();

    for $line (@lines) {
        if ($line =~ /<trd lng="bo">.*?&#x([A-F0-9]+);</) {
            print "$line\n" if ($debug);

            unless ($1 eq 'F0B') {
                $line =~ s/;<\//;&#xF0B;<\//;
                print ">> $line\n";

                $modified = 1;
            }
        }
        push @new, $line;
    }

    if ($modified) {
        open OUT, ">$file" or die "Ne eblas skribi al $file: $!\n";
        print "skribante $file...\n";
        print OUT join('',@new);
        close OUT;
    }

}