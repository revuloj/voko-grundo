#!/usr/bin/perl

use strict;
use warnings;

my $basedir = $ENV{'VOKO'} || '.';
my $rnc_file = $basedir."/dtd/vokoxml.rnc";

open IN, $rnc_file
    or die "Ne povis malfermi $rnc_file: $!";

print "---\n";
print "layout: page\n";
print "title: Dokumentstrukturo (RelaxNG)\n";
print "---\n";

$_ = <IN>; print; print "\n";

# print "* Enhavo\n{:toc}\n\n";

my $mode = 'header';

while (<IN>) {

    # ignoru liniojn kune nur unu komenca '#', ĉar tio estas verŝajne elkomentitaj linioj
    if (m/^\s*#[^#]/) {
        next;
    }

    # ignoru liniojn antaŭ "namespace"
    if ($mode eq 'header') {
        if (m/^\s*namespace/) {
            $mode = 'start'
        }
        next;
    }

    if ($mode eq "start") {
        if (m/^##\s*(?:\[([a-z\-]+)\]\s*)?(.*)$/) {
            $mode = "desc";
            print ("### $1\n\n") if ($1);
            print $2; print "\n";
        }
        next;
    }

    if ($mode eq "header2") {
        if (m/^##\s*\*+\s*$/) {
            print "***\n";
            $mode = "start";
        } else {
            print "##"; print; print "\n";
        }
        next;
    }

    if ($mode eq "desc") {
        if (m/^##\s*(.*)$/) {
            print $1;
            print "\n";
        } elsif (m/^[a-z\-]+\s*=/) {            
            $mode = "def";
            print "\n\n```\n";
            print; 
        }
        next;
    }

    if ($mode eq "def") {
        if (m/^##\s*\*+\s*$/) {
            print "```\n\n";
            print "\n***\n  \n";
            $mode = "header2";
            next;
        } elsif (m/^##\s*(?:\[([a-z\-]+)\]\s*)?(.*)$/) {
            print "```\n\n";
            $mode = "desc";
            print ("### $1\n\n") if ($1);
            print $2; print "\n";
        } elsif (m/^\s*start\s*=/) {
            print "```\n\n";
            last;
        } elsif (! m/^\s*$/) {
            print;
        }
        next;
    }

}

close IN;