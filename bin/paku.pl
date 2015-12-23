#!/usr/bin/perl
#
# enpakas æiujn distribuindajn dosierojn de voko
#
# voko de la dosierujo super voko, por
# ke la relativaj padoj estu øustaj

$kreu = 'tar -cvf vokodistrib.tar';
$paku = 'tar -rvf vokodistrib.tar';
$kunpremu = 'gzip -9 vokodistrib.tar';
$vokodos = './voko';

`$kreu`;

`$paku $vokodos/dsl/*.*`;
`$paku $vokodos/dsl/catalog`;
`$paku $vokodos/dtd/*.dtd`;
`$paku $vokodos/smb/*.*`;
`$paku $vokodos/stl/*.css`;
`$paku $vokodos/sgm/catalog`;
`$paku $vokodos/div/*.*`;
`$paku $vokodos/dok/*.htm`;
`$paku $vokodos/dok/*.txt`;
`$paku $vokodos/bin/sercho.pm`;
`$paku $vokodos/bin/*.pl`;
`$paku $vokodos/docu/*`;
`$paku $vokodos/index.html`;

`$kunpremu`;
