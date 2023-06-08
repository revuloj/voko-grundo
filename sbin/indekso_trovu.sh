#!/bin/bash

# trovu la N-an aperon, de <art en indekso.xml (N donita kiel unua argumento de la komando)
N=$1
inx_file=$HOME/tmp/inx_tmp/indekso.xml

cat $inx_file | awk '{ print ">>>"++j,"<<<:" $0 RS }' RS='</art' | grep ">>>$N <<<:" 
