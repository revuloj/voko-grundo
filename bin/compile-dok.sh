#!/bin/bash

dokdir=$(pwd)/build/dok
src=dok/datumprotekto.xml
# poste anst. finaĵojn por ĉiu src-dosiero
out=datumprotekto.html
xsl=xsl/manlibro.xsl

xsltproc $xsl ${src} > ${dokdir}/${out} 
