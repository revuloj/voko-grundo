#!/usr/bin/perl

use strict;
use warnings;
use POSIX qw(strftime);

my $basedir = $ENV{'VOKO'} || '.';
my $rnc_file = $basedir."/dtd/vokoxml.rnc";


print "---\n";
print "layout: page\n";
print "title: Dokumentstrukturo (RelaxNG)\n";
print "---\n";

my $md;
my @toc_hlp;
my @toc_elm;

rnc2md(); 

my $dato = strftime "%Y-%m-%d", localtime;
print "<!-- kreita je $dato el voko-grundo/dtd/vokoxml.rnc per voko-grundo/perl/rnc2md.pl -->\n\n";

print "![ulmobranĉo](../assets/img/ulmo.jpg){: style=\"float: right; margin-left: 2em; max-width: 20%; border: solid gray 1px\"}\n\n";
print "# Enhavo\n\n";
print "[► Strukturo de artikolo](#strukturo-de-artikolo)  \n";
print "[► Strukturoj de detalaj elementoj](#strukturoj-de-detalaj-elementoj)\n\n";

# eligu la elementojn
print "**Strukturelementoj (rekte uzeblaj en XML):**  \n";
for (sort @toc_elm) {
    print "[$_](#$_-)&nbsp;| "
}
print "\n\n";

# eligu help-difinojn
print "**Helpdifinoj (uzataj por difini la aranĝon de elementoj):**  \n";
for (@toc_hlp) {
    print "[$_](#$_-)&nbsp;| "
}
print "\n\n";
print "La [teĥnika manlibro](manlibro) montras al vi kiel en artikoloj kombini tiujn ";
print "strukturelementojn pri la plej oftaj okazoj.\n\n";

# eligu la enhavon
print $md;


sub rnc2md {
    open IN, $rnc_file
        or die "Ne povis malfermi $rnc_file: $!";

    $_ = <IN>; print; print "\n";

    # print "* Enhavo\n{:toc}\n\n";

    my $mode = 'header';

    while (<IN>) {

        # ignoru liniojn kun nur unu komenca '#', ĉar tio estas verŝajne elkomentitaj linioj
        if (m/^\s*#[^#]/) {
            next;
        }

        # ignoru liniojn antaŭ "namespace"
        if ($mode eq 'header') {
            if (m/^\s*namespace/) {
                $mode = 'start';
            }
            next;
        }

        if ($mode eq "start") {
            if (m/^##\s*\*+\s*$/) {
                $md .= "\n***\n.  \n";
                $mode = "header2";
                next;
            } elsif (m/^##\s*(?:\[([a-z_\-]+)\]\s*)?(.*)$/) {
                $mode = "desc";
                if ($1) {
                    title($1);
                }
                $md .= "$2\n";
            }
            next;
        }

        # titolo nivelo du, montrata per komentitaj linioj el steletoj
        if ($mode eq "header2") {
            if (m/^##\s*\*+\s*$/) {
                $md .= "***\n";
                $mode = "start";
            } elsif (m/^#+\s*(.*)\s*$/) {
                $md .= "\n## *$1*{: style=\"color: brown\"}\n";
            }
            next;
        }

        if ($mode eq "desc") {
            if (m/^##\s*(.*)$/) {
                desc($1);
            } elsif (m/^[a-z\-]+\s*=/) {            
                $mode = "def";
                $md .= "\n\n```\n$_";
            }
            next;
        }

        if ($mode eq "def") {
            if (m/^##\s*\*+\s*$/) {
                $md .= "```\n\n***\n.  \n";
                $mode = "header2";
                next;
            } elsif (m/^##\s*(?:\[([a-z_\-]+)\]\s*)?(.*)$/) {
                $md .= "```\n\n";
                $mode = "desc";
                if ($1) {
                    title($1);
                }
                $md .= "$2\n";
            } elsif (m/^\s*start\s*=/) {
                $md .= "```\n\n";
                last;
            } elsif (! m/^\s*$/) {
                $md .= $_;
            }
            next;
        }
    }

    close IN;
}    

sub desc {
    my $line = shift;
    $line =~s/<dfn>([^<]+)<\/dfn>/[$1](#$1-)/g;
    $md .= "$line\n";
}

sub title {
    my $entry = shift;

    $md .= "### $entry";
    $md .= " <a href=\"#enhavo\">▲</a>";
    $md .= "\n\n";
    if ($entry =~ m/^_(.*)_/) {
        push @toc_hlp, $1;
    } else {
        push @toc_elm, $entry;
    }
}