#!/usr/bin/perl

for (@ARGV) {
    $from = $_;
    s/^([a-z]*)\./uc($1).'.'/e;
    $to = $_;
    `mv $from $to`;
};
