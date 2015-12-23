#!/usr/bin/perl

# konvertas de c^ al lat3
# voku: cteg_lat3.pl <dosieroj>

foreach $file (@ARGV) {

    open FILE, $file or die "Ne povis legi $file: $!\n";
    $_ = join('',<FILE>);
    close FILE;

    # konverti la indikon charset=...
    #s/charset=iso-8859-3/charset=utf-8/i;

    # konverti la e-literojn de Lat-3 al utf-8
    s/C\^/\304\210/g; #Cx
    s/G\^/\304\234/g; #Gx
    s/H\^/\304\244/g; #Hx 
    s/J\^/\304\264/g; #Jx
    s/S\^/\305\234/g; #Sx
    s/U\^/\305\254/g; #Ux
    s/c\^/\304\211/g; #cx
    s/g\^/\304\235/g; #gx
    s/h\^/\304\245/g; #hx
    s/j\^/\304\265/g; #jx
    s/s\^/\305\235/g; #sx
    s/u\^/\305\255/g; #ux

    open FILE, ">$file" or die "Ne povis skribi $file: $!\n";
    print FILE;
    close FILE;
};
















