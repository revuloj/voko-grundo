#!/bin/bash

# tuj finu se unuopa komando fiaskas 
# - necesas por distingi sukcesan de malsukcesa testaro
set -e

echo "Ni testas la sintakson de agordodosieroj. Necesas instalita programo rxp."

echo "cfg/lingvoj.xml"
rxp -Vs cfg/lingvoj.xml

echo "cfg/fakoj.xml"
rxp -Vs cfg/fakoj.xml

echo "cfg/stiloj.xml"
rxp -Vs cfg/stiloj.xml

echo "cfg/permesoj.xml"
rxp -s cfg/permesoj.xml

echo "cfg/klasoj.xml"
rxp -s cfg/klasoj.xml

echo "Validigi XML-artikoleton precipe por kontroli DTD..."
set +e
read -r -d '' XML << '~~~~~'
<?xml version="1.0"?><!DOCTYPE vortaro SYSTEM "./dtd/vokoxml.dtd"><vortaro>
<art mrk="\$Id: kvin.xml,v 1.116 2021/06/22 19:02:35 revo Exp \$">
<kap><ofc>*</ofc><rad>kvin</rad></kap>
<drv mrk="kvin.0"><kap><tld/></kap>
<snc><dif>Kvar kaj unu. Matematika simbolo 5:<ekz><tld/> kaj sep faras dek du
<fnt><bib>F</bib><lok>&FE; 12</lok></fnt>;</ekz>
</dif><ref tip="lst" cel="nombr.0o.MAT" lst="voko:nombroj" val="5">nombro</ref>
</snc></drv></art></vortaro>
~~~~~
set -e
echo $XML | rxp -Vs

echo "Transformi la XML-artikoleton per XSL (necesas instalita saxonb-xslt)..."
echo $XML |saxonb-xslt -xsl:xsl/revohtml.xsl -s:- -warnings:silent > /dev/null
echo $XML |saxonb-xslt -xsl:xsl/revohtml1.xsl -s:- -warnings:silent > /dev/null
echo $XML |saxonb-xslt -xsl:xsl/revohtml2.xsl -s:- -warnings:silent > /dev/null