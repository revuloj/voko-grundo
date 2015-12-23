#!/usr/local/bin/perl -w

$tar = "/bin/tar";
$dir = shift @ARGV;
$tarfile = shift @ARGV;
$lasta = shift @ARGV;


$excl = "--exclude=revo/xml/CVS --exclude=revo/bld/CVS";

$files = "tgz revo/art revo/xml revo/tez revo/bld revo/smb revo/dok revo/inx revo/*.jpg revo/*.html revo/*.ico revo/*.gif";

chdir($dir);
$cmd = "$tar -C $dir -cz --after-date \"$lasta\" -f $tarfile $excl -h $files";

print $cmd,"\n";
`$cmd`;
