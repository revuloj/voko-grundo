#!/bin/bash

srcdir=dok
outdir=$(pwd)/build/dok

dok_xsl=xsl/manlibro.xsl
bib_xsl=xsl/bibhtml.xsl

#src=(\
#    datumprotekto.xml
#)
#
#for f in "${src[@]}"; 
#do
#    NAME=$(basename "$f")
#    out="${NAME%.xml}"
#    out="${outdir}/${out}.html"
#    echo "${out} <- ${NAME}"
#    xsltproc $dok_xsl ${srcdir}/${NAME} > ${out} 
#done

NAME="datumprotekto.xml"
echo "$outdir/${NAME}..."
xsltproc $dok_xsl ${srcdir}/${NAME} > "$outdir/${NAME}"

